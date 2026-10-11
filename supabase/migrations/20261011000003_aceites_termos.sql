-- F1-02: registro do aceite dos Termos de uso feito PELO SERVIDOR.
-- Antes, a versão aceita ia só em `user_metadata` (o navegador a envia e o próprio usuário pode alterá-la). Agora um gatilho
-- no cadastro grava uma linha com o horário do banco (`now()`), que o navegador não controla. O usuário só pode LER o próprio
-- registro: não há INSERT, UPDATE nem DELETE para `authenticated` (a linha some junto com a conta, em cascata).

create table public.aceites_termos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  -- Versão dos Termos declarada no cadastro (`apps/web/src/lib/legal.ts`). Nula quando o cadastro não a informou
  -- ou informou um valor fora do formato; isso também é prova (houve cadastro sem aceite declarado).
  versao text check (versao is null or versao ~ '^[0-9]+(\.[0-9]+){0,2}$'),
  aceito_em timestamptz not null default now(),
  -- `cadastro`: gravado pelo gatilho no momento do cadastro.
  -- `anterior_ao_registro`: conta criada antes desta tabela; a tela já exigia marcar o aceite, mas a versão não foi guardada.
  origem text not null default 'cadastro' check (origem in ('cadastro', 'anterior_ao_registro'))
);

create index aceites_termos_usuario_idx on public.aceites_termos (usuario_id, aceito_em desc);

create function public.registrar_aceite() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  declarada text := new.raw_user_meta_data ->> 'termos_versao';
begin
  insert into public.aceites_termos (usuario_id, versao)
  values (new.id, case when declarada ~ '^[0-9]+(\.[0-9]+){0,2}$' then declarada end);
  return new;
end;
$$;

create trigger usuarios_novo_aceite after insert on auth.users
for each row execute function public.registrar_aceite();

-- Contas que já existem: a data é a do cadastro (`created_at`), sem versão.
insert into public.aceites_termos (usuario_id, versao, aceito_em, origem)
select id, null, created_at, 'anterior_ao_registro' from auth.users;

revoke all on public.aceites_termos from anon, authenticated;
grant select on public.aceites_termos to authenticated;
revoke all on function public.registrar_aceite() from public, anon, authenticated;

alter table public.aceites_termos enable row level security;

create policy aceites_leitura on public.aceites_termos for select to authenticated
  using ((select auth.uid()) = usuario_id);
