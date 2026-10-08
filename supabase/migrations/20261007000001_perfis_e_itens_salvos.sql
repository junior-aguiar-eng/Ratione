-- F0-06: perfis e itens salvos, com acesso restrito ao dono (RLS).
-- Regra: toda linha pertence a um usuário (auth.users). Um usuário nunca lê, altera nem apaga linha de outro.
-- O papel `anon` (visitante sem login) não acessa nada. Teste automatizado: packages/db/src/rls.test.ts.

create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text check (nome is null or char_length(nome) <= 200),
  profissao text check (profissao is null or profissao in ('advogado', 'magistrado', 'servidor', 'estudante', 'concurseiro', 'outro')),
  oab text check (oab is null or char_length(oab) <= 30), -- declaratória, não verificada
  tribunal_padrao text check (tribunal_padrao is null or char_length(tribunal_padrao) <= 20),
  uf_padrao text check (uf_padrao is null or uf_padrao ~ '^[A-Z]{2}$'),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.itens_salvos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  modulo text not null check (modulo in ('PrazoZero', 'NormaViva', 'TeseMap', 'Argumenta')),
  tipo text not null check (tipo in ('prazo', 'norma', 'tese', 'decisao')),
  titulo text not null check (char_length(titulo) between 1 and 300),
  detalhe text check (detalhe is null or char_length(detalhe) <= 1000),
  url text check (url is null or (char_length(url) <= 500 and url like '/%')),
  dados jsonb check (dados is null or pg_column_size(dados) <= 200000),
  criado_em timestamptz not null default now()
);

create index itens_salvos_usuario_idx on public.itens_salvos (usuario_id, criado_em desc);

-- Atualiza `atualizado_em` a cada alteração do perfil
create function public.marcar_atualizacao() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger perfis_atualizacao before update on public.perfis
for each row execute function public.marcar_atualizacao();

-- Cria o perfil vazio quando o usuário se cadastra
create function public.criar_perfil() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfis (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

create trigger usuarios_novo_perfil after insert on auth.users
for each row execute function public.criar_perfil();

-- Acesso: nada para visitantes; só as próprias linhas para quem está logado.
-- As permissões são explícitas e mínimas: o Supabase concede privilégios a mais (TRUNCATE, REFERENCES, TRIGGER) por padrão.
revoke all on public.perfis from anon, authenticated;
revoke all on public.itens_salvos from anon, authenticated;
grant select, update on public.perfis to authenticated;
grant select, insert, update, delete on public.itens_salvos to authenticated;
revoke all on function public.criar_perfil() from public, anon, authenticated;
revoke all on function public.marcar_atualizacao() from public, anon, authenticated;

alter table public.perfis enable row level security;
alter table public.itens_salvos enable row level security;

create policy perfis_leitura on public.perfis for select to authenticated
  using ((select auth.uid()) = id);
create policy perfis_atualizacao on public.perfis for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
-- Sem política de insert/delete em perfis: o perfil nasce pelo gatilho e some junto com a conta.

create policy itens_leitura on public.itens_salvos for select to authenticated
  using ((select auth.uid()) = usuario_id);
create policy itens_insercao on public.itens_salvos for insert to authenticated
  with check ((select auth.uid()) = usuario_id);
create policy itens_atualizacao on public.itens_salvos for update to authenticated
  using ((select auth.uid()) = usuario_id) with check ((select auth.uid()) = usuario_id);
create policy itens_exclusao on public.itens_salvos for delete to authenticated
  using ((select auth.uid()) = usuario_id);
