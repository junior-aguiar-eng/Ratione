-- F2-10: lembretes de prazo por e-mail (3 dias e 1 dia antes do vencimento).
-- Regra: toda linha pertence a um usuário e ele só vê, cria e apaga as próprias linhas. O e-mail NÃO é copiado para esta tabela:
-- o envio lê o endereço em auth.users no momento do envio, com a chave de serviço (que ignora a RLS), e só grava a data de envio.
-- O usuário não pode alterar a linha (não há permissão de update): para mudar um lembrete, apaga e cria de novo; assim ele
-- também não consegue apagar a marca de "já enviado" para provocar novo envio.

create table public.lembretes_prazo (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  titulo text not null check (char_length(titulo) between 1 and 200),
  tribunal text check (tribunal is null or char_length(tribunal) <= 20),
  vencimento date not null,
  avisar_3_dias boolean not null default true,
  avisar_1_dia boolean not null default true,
  enviado_3_dias_em timestamptz,
  enviado_1_dia_em timestamptz,
  criado_em timestamptz not null default now(),
  check (avisar_3_dias or avisar_1_dia)
);

create index lembretes_prazo_usuario_idx on public.lembretes_prazo (usuario_id, vencimento);
-- O envio diário procura só o que vence nos próximos dias
create index lembretes_prazo_vencimento_idx on public.lembretes_prazo (vencimento);

-- Teto por usuário (contra abuso do envio de e-mail): no máximo 200 lembretes que ainda não venceram
create function public.limitar_lembretes() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.lembretes_prazo where usuario_id = new.usuario_id and vencimento >= current_date) >= 200 then
    raise exception 'limite de 200 lembretes ativos por conta' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger lembretes_prazo_limite before insert on public.lembretes_prazo
for each row execute function public.limitar_lembretes();

revoke all on function public.limitar_lembretes() from public, anon, authenticated;

-- Acesso mínimo e explícito (o Supabase concede privilégios a mais por padrão)
revoke all on public.lembretes_prazo from anon, authenticated;
grant select, insert, delete on public.lembretes_prazo to authenticated;

alter table public.lembretes_prazo enable row level security;

create policy lembretes_leitura on public.lembretes_prazo for select to authenticated
  using ((select auth.uid()) = usuario_id);
-- Ao criar, as marcas de envio nascem vazias: quem cria não decide o que "já foi enviado"
create policy lembretes_insercao on public.lembretes_prazo for insert to authenticated
  with check ((select auth.uid()) = usuario_id and enviado_3_dias_em is null and enviado_1_dia_em is null);
create policy lembretes_exclusao on public.lembretes_prazo for delete to authenticated
  using ((select auth.uid()) = usuario_id);
