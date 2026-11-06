-- Casos: pastas em "Meu espaço" para agrupar os itens que a pessoa já salva (normas, teses, prazos, análises).
-- O caso guarda só o nome que a pessoa dá a ele; nenhum texto de decisão nem dado de processo entra aqui. Cada caso e cada vínculo pertencem a um usuário (RLS).
-- Apagar um caso não apaga os itens: eles voltam a ficar soltos em "Meu espaço" (`on delete set null`).

create table public.casos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 80),
  criado_em timestamptz not null default now()
);

create index casos_usuario_idx on public.casos (usuario_id, criado_em desc);

alter table public.itens_salvos add column caso_id uuid references public.casos (id) on delete set null;
create index itens_salvos_caso_idx on public.itens_salvos (caso_id) where caso_id is not null;

-- Teto de casos por conta (50), no mesmo padrão do teto de itens salvos. O cliente reconhece a mensagem "limite de 50 casos".
create function public.limitar_casos() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.casos where usuario_id = new.usuario_id) >= 50 then
    raise exception 'limite de 50 casos por conta' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger casos_limite before insert on public.casos
for each row execute function public.limitar_casos();

revoke all on function public.limitar_casos() from public, anon, authenticated;

-- Acesso: nada para visitantes; só os próprios casos para quem está logado.
revoke all on public.casos from anon, authenticated;
grant select, insert, update, delete on public.casos to authenticated;

alter table public.casos enable row level security;

create policy casos_leitura on public.casos for select to authenticated
  using ((select auth.uid()) = usuario_id);
create policy casos_insercao on public.casos for insert to authenticated
  with check ((select auth.uid()) = usuario_id);
create policy casos_atualizacao on public.casos for update to authenticated
  using ((select auth.uid()) = usuario_id) with check ((select auth.uid()) = usuario_id);
create policy casos_exclusao on public.casos for delete to authenticated
  using ((select auth.uid()) = usuario_id);

-- Um item só pode apontar para um caso do próprio dono: sem isso, daria para amarrar o item a um caso de outra conta.
drop policy itens_insercao on public.itens_salvos;
drop policy itens_atualizacao on public.itens_salvos;

create policy itens_insercao on public.itens_salvos for insert to authenticated
  with check (
    (select auth.uid()) = usuario_id
    and (caso_id is null or exists (select 1 from public.casos c where c.id = caso_id and c.usuario_id = (select auth.uid())))
  );
create policy itens_atualizacao on public.itens_salvos for update to authenticated
  using ((select auth.uid()) = usuario_id)
  with check (
    (select auth.uid()) = usuario_id
    and (caso_id is null or exists (select 1 from public.casos c where c.id = caso_id and c.usuario_id = (select auth.uid())))
  );
