-- F3-05: base do NormaViva (normas, dispositivos, versões, relações) e busca textual em português (Postgres FTS).
-- Conteúdo público: o texto das leis é de acesso livre, então qualquer visitante (anon) e usuário logado só LÊ; quem escreve é a carga
-- do corpus, com a chave de serviço. Como a service_role nasce sem SELECT/UPDATE (conferido em 11/10/2026), o GRANT é explícito.
-- O texto vem do Planalto (versão compilada ou, na falta dela, a página anotada); cada norma guarda URL, data de leitura e SHA-256
-- dos bytes lidos (packages/normaviva/corpus). Vigência de versão é PROVISÓRIA (publicação do ato) até haver cláusula de vigência lida.

create table public.normas (
  id text primary key,
  nome text not null,
  assinatura date,
  publicacao date,
  fonte_url text not null,
  fonte_tipo_pagina text not null check (fonte_tipo_pagina in ('compilada', 'anotada')),
  fonte_sha256 text not null check (fonte_sha256 ~ '^[0-9a-f]{64}$'),
  lido_em date not null
);

create table public.dispositivos (
  id text primary key,
  norma_id text not null references public.normas (id) on delete cascade,
  escopo text not null default 'corpo',
  rotulo text not null,
  tipo text not null check (tipo in ('artigo', 'paragrafo_unico', 'paragrafo', 'inciso', 'alinea', 'item')),
  numero text not null,
  pai_id text references public.dispositivos (id) on delete cascade,
  ordem integer not null,
  texto text not null,
  continuacao text not null default '',
  revogado boolean not null default false,
  anotacoes jsonb not null default '[]',
  estrutura text[] not null default '{}',
  -- A busca vê o rótulo, o texto e as linhas de continuação; 'portuguese' tira acento e reduz ao radical
  busca tsvector generated always as (to_tsvector('portuguese'::regconfig, rotulo || ' ' || texto || ' ' || continuacao)) stored
);

create index dispositivos_norma_ordem_idx on public.dispositivos (norma_id, ordem);
create index dispositivos_pai_idx on public.dispositivos (pai_id);
create index dispositivos_busca_idx on public.dispositivos using gin (busca);

create table public.versoes_dispositivo (
  id bigint generated always as identity primary key,
  dispositivo_id text not null references public.dispositivos (id) on delete cascade,
  texto text not null,
  origem text not null check (origem in ('redacao_original', 'redacao_dada', 'incluido', 'revogado', 'vetado')),
  ato_chave text,
  ato_rotulo text,
  ato_assinatura date,
  ato_publicacao date,
  ano_do_ato integer,
  fonte_da_data text check (fonte_da_data in ('publicacao_senado', 'assinatura_senado', 'anotacao', 'ano', 'norma')),
  vigente_de date,
  vigente_ate date,
  -- tempo do direito: a vigência é provisória (publicação do ato) até a cláusula de vigência ser lida
  vigencia_confirmada boolean not null default false,
  -- o corpus compilado só tem a redação vigente: o texto anterior a esta versão não está disponível
  texto_anterior_disponivel boolean not null default false,
  -- tempo do sistema: quando o sistema leu este texto e o hash dele
  conhecido_em date not null,
  hash text not null check (hash ~ '^[0-9a-f]{64}$'),
  check (vigente_ate is null or vigente_de is null or vigente_ate >= vigente_de)
);

create index versoes_dispositivo_idx on public.versoes_dispositivo (dispositivo_id, vigente_de);

create table public.relacoes (
  id bigint generated always as identity primary key,
  origem_id text not null references public.dispositivos (id) on delete cascade,
  tipo text not null check (tipo in ('remete', 'alterado_por', 'incluido_por', 'revogado_por')),
  -- destino dentro do corpus (dispositivo) ou fora dele (norma e/ou ato citado só por texto)
  destino_id text references public.dispositivos (id) on delete set null,
  destino_norma_id text,
  -- rótulo do dispositivo citado na norma de destino ("art. 5º"); a carga preenche destino_id quando esse artigo existe no corpus
  destino_rotulo text,
  destino_ato text,
  destino_texto text,
  trecho text,
  -- certeza sobre a norma de destino de uma remissão: ver packages/normaviva/src/busca/referencias.ts
  escopo text check (escopo in ('mesma', 'explicito', 'presumido', 'externo')),
  origem_dado text not null check (origem_dado in ('extraido_do_texto', 'anotacao_do_planalto', 'curado', 'sugerido_ia')),
  validado_por text,
  validado_em date,
  -- relação curada ou sugerida por IA só vale com validação humana registrada; a extraída por regra de texto expresso não a exige
  check (origem_dado <> 'curado' or validado_por is not null)
);

create index relacoes_origem_idx on public.relacoes (origem_id, tipo);
create index relacoes_destino_idx on public.relacoes (destino_id) where destino_id is not null;

-- Busca por assunto: ranking por relevância, trecho destacado e sem dispositivos revogados
create function public.buscar_dispositivos(consulta text, norma text default null, limite integer default 20)
returns table (id text, norma_id text, rotulo text, trecho text, relevancia real)
language sql
stable
set search_path = ''
as $$
  select d.id,
         d.norma_id,
         d.rotulo,
         pg_catalog.ts_headline('portuguese'::regconfig, d.texto, q.consulta, 'MaxFragments=1, MaxWords=40, MinWords=15'),
         pg_catalog.ts_rank(d.busca, q.consulta)
  from public.dispositivos d,
       (select pg_catalog.websearch_to_tsquery('portuguese'::regconfig, buscar_dispositivos.consulta) as consulta) q
  where d.busca @@ q.consulta
    and not d.revogado
    and (buscar_dispositivos.norma is null or d.norma_id = buscar_dispositivos.norma)
  order by 5 desc, d.norma_id, d.ordem
  limit least(greatest(buscar_dispositivos.limite, 1), 100)
$$;

alter table public.normas enable row level security;
alter table public.dispositivos enable row level security;
alter table public.versoes_dispositivo enable row level security;
alter table public.relacoes enable row level security;

create policy normas_leitura on public.normas for select to anon, authenticated using (true);
create policy dispositivos_leitura on public.dispositivos for select to anon, authenticated using (true);
create policy versoes_dispositivo_leitura on public.versoes_dispositivo for select to anon, authenticated using (true);
create policy relacoes_leitura on public.relacoes for select to anon, authenticated using (true);

revoke all on public.normas, public.dispositivos, public.versoes_dispositivo, public.relacoes from anon, authenticated;
grant select on public.normas, public.dispositivos, public.versoes_dispositivo, public.relacoes to anon, authenticated;
grant select, insert, update, delete on public.normas, public.dispositivos, public.versoes_dispositivo, public.relacoes to service_role;

revoke all on function public.buscar_dispositivos(text, text, integer) from public;
grant execute on function public.buscar_dispositivos(text, text, integer) to anon, authenticated, service_role;
