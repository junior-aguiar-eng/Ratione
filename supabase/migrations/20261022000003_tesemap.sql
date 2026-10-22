-- F4-03: grafo do TeseMap (nós e arestas) com procedência e validação humana.
-- Conteúdo público de leitura (precedentes são atos públicos), mas só aparece o que passa pela regra de procedência do plano (§2.3):
--   * todo nó e toda aresta tem origem (`curado` ou `sugerido_ia`) e ao menos uma fonte (ato, URL, o que foi lido, data de leitura);
--   * sugestão de IA só é visível depois de validada por uma pessoa;
--   * aresta (a relação entre precedentes: interpreta, distingue, supera...) SEMPRE exige validação humana para ser visível e só aparece
--     se os dois nós também forem visíveis;
--   * nó de dado oficial importado (ex.: tese de tema repetitivo do STJ) é `curado` sem validador: o texto é o do tribunal, não interpretação.
-- Quem escreve é a carga (`pnpm carregar:tesemap`) e a curadoria, com a chave de serviço (service_role nasce sem SELECT/UPDATE: GRANT explícito).

create table public.tesemap_nos (
  id text primary key,
  tipo text not null check (tipo in ('tema', 'questao', 'tese', 'precedente', 'sumula', 'dispositivo', 'conceito', 'excecao', 'distinguishing', 'superacao')),
  rotulo text not null,
  tribunal text,
  -- "Tema 1076", "Súmula 479"
  numero_referencia text,
  descricao text not null default '',
  -- ligação com o NormaViva quando o nó é um dispositivo que existe no corpus
  dispositivo_id text references public.dispositivos (id) on delete set null,
  detalhes jsonb not null default '{}',
  origem_dado text not null check (origem_dado in ('curado', 'sugerido_ia')),
  -- [{ id, ato, url, lido, lidoEm }]: o formato é o de `Fonte` em packages/core/src/procedencia.ts
  fontes jsonb not null check (
    jsonb_typeof(fontes) = 'array'
    and jsonb_array_length(fontes) >= 1
    and not jsonb_path_exists(fontes, '$[*] ? (!(exists(@.ato) && exists(@.url) && exists(@.lido) && exists(@.lidoEm)))')
  ),
  validado_por text,
  validado_em date,
  -- quando o sistema leu a fonte pela última vez: é a "data da última atualização" que a tela mostra
  atualizado_em date not null,
  check ((validado_por is null) = (validado_em is null))
);

create index tesemap_nos_tipo_idx on public.tesemap_nos (tribunal, tipo);
create index tesemap_nos_dispositivo_idx on public.tesemap_nos (dispositivo_id) where dispositivo_id is not null;

create table public.tesemap_arestas (
  id bigint generated always as identity primary key,
  origem_id text not null references public.tesemap_nos (id) on delete cascade,
  destino_id text not null references public.tesemap_nos (id) on delete cascade,
  tipo text not null check (tipo in ('interpreta', 'aplica', 'cita', 'confirma', 'distingue', 'supera', 'restringe', 'amplia', 'diverge', 'fundamenta', 'relaciona')),
  rotulo text not null default '',
  origem_dado text not null check (origem_dado in ('curado', 'sugerido_ia')),
  fontes jsonb not null check (
    jsonb_typeof(fontes) = 'array'
    and jsonb_array_length(fontes) >= 1
    and not jsonb_path_exists(fontes, '$[*] ? (!(exists(@.ato) && exists(@.url) && exists(@.lido) && exists(@.lidoEm)))')
  ),
  validado_por text,
  validado_em date,
  atualizado_em date not null,
  check ((validado_por is null) = (validado_em is null)),
  check (origem_id <> destino_id),
  unique (origem_id, destino_id, tipo)
);

create index tesemap_arestas_origem_idx on public.tesemap_arestas (origem_id);
create index tesemap_arestas_destino_idx on public.tesemap_arestas (destino_id);

-- Cobertura declarada ("N precedentes do STJ, M do STF") e data da última atualização, só do que o público pode ver (respeita a RLS de quem chama)
create function public.tesemap_cobertura()
returns table (tribunal text, tipo text, total integer, atualizado_em date)
language sql
stable
set search_path = ''
as $$
  select coalesce(n.tribunal, ''), n.tipo, pg_catalog.count(*)::integer, pg_catalog.max(n.atualizado_em)
  from public.tesemap_nos n
  group by 1, 2
  order by 1, 2
$$;

alter table public.tesemap_nos enable row level security;
alter table public.tesemap_arestas enable row level security;

create policy tesemap_nos_leitura on public.tesemap_nos for select to anon, authenticated
  using (origem_dado = 'curado' or validado_por is not null);

create policy tesemap_arestas_leitura on public.tesemap_arestas for select to anon, authenticated
  using (
    validado_por is not null
    and exists (select 1 from public.tesemap_nos o where o.id = origem_id)
    and exists (select 1 from public.tesemap_nos d where d.id = destino_id)
  );

revoke all on public.tesemap_nos, public.tesemap_arestas from anon, authenticated;
grant select on public.tesemap_nos, public.tesemap_arestas to anon, authenticated;
grant select, insert, update, delete on public.tesemap_nos, public.tesemap_arestas to service_role;

revoke all on function public.tesemap_cobertura() from public;
grant execute on function public.tesemap_cobertura() to anon, authenticated, service_role;
