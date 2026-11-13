-- F5-10: análises salvas por decisão expressa da pessoa (RIPD 0.3, seção 7.3). A decisão completa fica CIFRADA (AES-256-GCM, chave do ambiente)
-- num bucket privado; este banco só guarda metadados. Decisões do responsável (06/11/2026): o prazo é escolhido pela pessoa (30 dias, 6 meses,
-- 1 ano ou até excluir, que é `expira_em` nulo), no máximo 10 por usuário, e o que se guarda é a decisão completa.
--
-- - `analises_salvas`: caminho opaco (`<usuario>/<id>`), tamanho, datas, rótulo opcional e os IDENTIFICADORES PÚBLICOS das citações
--   (`normaviva:<dispositivo>` e `tesemap:<nó>`), que não são dado pessoal e permitem "citado nas suas análises" sem decifrar nada.
-- - O usuário só LÊ a própria linha. Inserir e apagar é só do servidor (chave de serviço): apagar a linha sem apagar o arquivo deixaria um
--   arquivo órfão fora do alcance da exclusão. As linhas somem em cascata com a conta; os arquivos, o servidor apaga antes (excluir-conta).
-- - O limite de 10 por usuário também é imposto aqui, por gatilho, para duas gravações simultâneas não passarem dele.
-- Aplicar pelo SQL Editor antes de ligar `ARGUMENTA_SALVAR_LIGADO` (supabase/LEIA-ME.md). Sem a flag ligada nada disto é usado.

create table public.analises_salvas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  caminho text not null unique check (char_length(caminho) <= 100),
  rotulo text check (rotulo is null or char_length(rotulo) <= 80),
  tamanho_bytes integer not null check (tamanho_bytes > 0 and tamanho_bytes <= 5242880),
  citacoes text[] not null default '{}' check (cardinality(citacoes) <= 200),
  criado_em timestamptz not null default now(),
  expira_em timestamptz,
  check (expira_em is null or expira_em > criado_em)
);
create index analises_salvas_usuario on public.analises_salvas (usuario_id);
create index analises_salvas_expira on public.analises_salvas (expira_em) where expira_em is not null;
create index analises_salvas_citacoes on public.analises_salvas using gin (citacoes);

create or replace function public.analises_salvas_limite() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Serializa as gravações do mesmo usuário para a contagem abaixo ser confiável
  perform pg_advisory_xact_lock(hashtextextended(new.usuario_id::text, 0));
  if (select count(*) from public.analises_salvas where usuario_id = new.usuario_id) >= 10 then
    raise exception 'limite de 10 análises salvas por usuário' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
revoke all on function public.analises_salvas_limite() from public, anon, authenticated;
drop trigger if exists analises_salvas_limite on public.analises_salvas;
create trigger analises_salvas_limite before insert on public.analises_salvas
for each row execute function public.analises_salvas_limite();

alter table public.analises_salvas enable row level security;
create policy analises_salvas_le_proprio on public.analises_salvas for select to authenticated using (usuario_id = (select auth.uid()));
do $$
begin
  if to_regprocedure('public.conta_tem_acesso()') is not null then
    drop policy if exists conta_ativa_restritiva on public.analises_salvas;
    create policy conta_ativa_restritiva on public.analises_salvas
      as restrictive for all to authenticated
      using ((select public.conta_tem_acesso()))
      with check ((select public.conta_tem_acesso()));
  end if;
end;
$$;
revoke all on public.analises_salvas from anon, authenticated;
grant select on public.analises_salvas to authenticated;
grant all on public.analises_salvas to service_role;

-- Bucket privado, sem política. Onde o esquema `storage` não existe (banco de teste local), nada é criado.
do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public, file_size_limit)
    values ('analises-salvas', 'analises-salvas', false, 5242880 + 64)
    on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;
  else
    raise notice 'esquema storage indisponível: crie o bucket privado "analises-salvas" por outro meio';
  end if;
end;
$$;
