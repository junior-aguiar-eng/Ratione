-- F5-01 (fatia 1): documentos enviados pelo usuário para o Argumenta, guardados cifrados e por pouco tempo.
-- Decisões do responsável (04/11/2026): retenção de 7 dias, 10 MB por arquivo e 10 arquivos por usuário. A cifra (AES-256-GCM, chave do
-- ambiente) é feita pelo servidor ANTES de o arquivo ir ao armazenamento (RIPD, seção 7, condição 1); este banco só guarda metadados.
--
-- - `documentos`: tipo, tamanho, caminho opaco (`<usuario>/<id>`) e datas. NUNCA o nome do arquivo nem o conteúdo (o nome pode ter nome de parte).
-- - O usuário só LÊ a própria linha. Quem insere e apaga é o servidor (chave de serviço), porque apagar a linha sem apagar o arquivo deixaria
--   um arquivo órfão, fora do alcance da exclusão. As linhas somem em cascata com a conta; os arquivos, o servidor apaga antes (excluir-conta).
-- - O bucket `documentos` é privado e sem política em `storage.objects`: só a chave de serviço lê e escreve.
-- Aplicar pelo SQL Editor antes de ligar `ARGUMENTA_UPLOAD_LIGADO` (supabase/LEIA-ME.md). Sem a flag ligada nada disto é usado.

create table public.documentos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  tipo text not null check (tipo in ('pdf', 'docx', 'txt')),
  tamanho_bytes integer not null check (tamanho_bytes > 0 and tamanho_bytes <= 10485760),
  caminho text not null unique check (char_length(caminho) <= 100),
  criado_em timestamptz not null default now(),
  expira_em timestamptz not null,
  check (expira_em > criado_em)
);
create index documentos_usuario on public.documentos (usuario_id);
create index documentos_expira on public.documentos (expira_em);

alter table public.documentos enable row level security;
create policy documentos_le_proprio on public.documentos for select to authenticated using (usuario_id = (select auth.uid()));
do $$
begin
  if to_regprocedure('public.conta_tem_acesso()') is not null then
    drop policy if exists conta_ativa_restritiva on public.documentos;
    create policy conta_ativa_restritiva on public.documentos
      as restrictive for all to authenticated
      using ((select public.conta_tem_acesso()))
      with check ((select public.conta_tem_acesso()));
  end if;
end;
$$;
revoke all on public.documentos from anon, authenticated;
grant select on public.documentos to authenticated;
grant all on public.documentos to service_role;

create or replace function public.documentos_limite() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Serializa as gravações do mesmo usuário para a contagem abaixo ser confiável
  perform pg_advisory_xact_lock(hashtextextended(new.usuario_id::text, 0));
  if (select count(*) from public.documentos where usuario_id = new.usuario_id) >= 10 then
    raise exception 'limite de 10 documentos por usuário' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
revoke all on function public.documentos_limite() from public, anon, authenticated;
drop trigger if exists documentos_limite on public.documentos;
create trigger documentos_limite before insert on public.documentos
for each row execute function public.documentos_limite();

-- Bucket privado. Onde o esquema `storage` não existe (banco de teste local), nada é criado.
do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public, file_size_limit)
    values ('documentos', 'documentos', false, 10485760 + 64)
    on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;
  else
    raise notice 'esquema storage indisponível: crie o bucket privado "documentos" por outro meio';
  end if;
end;
$$;
