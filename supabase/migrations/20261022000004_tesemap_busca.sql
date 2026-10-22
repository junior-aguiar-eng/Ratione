-- F4-04: busca por assunto no TeseMap. O `ilike` do primeiro desenho exigia a frase inteira, na ordem ("honorários equidade" não achava a tese
-- de honorários por equidade) e não tirava acento ("honorarios" não achava "honorários"; o dicionário `portuguese` não faz isso).
-- Aqui: todas as palavras da consulta têm de aparecer (em qualquer ordem), sem acento nem maiúscula, com o radical em português.
-- Sem extensão: `translate` com a lista de letras acentuadas do português basta, é imutável e pode entrar numa coluna gerada.

create function public.tesemap_sem_acento(texto text)
returns text
language sql
immutable
set search_path = ''
as $$
  select pg_catalog.translate(
    pg_catalog.lower(texto),
    'áàâãäéèêëíìîïóòôõöúùûüçñ',
    'aaaaaeeeeiiiiooooouuuucn'
  )
$$;

alter table public.tesemap_nos
  add column busca tsvector generated always as (
    to_tsvector(
      'portuguese'::regconfig,
      public.tesemap_sem_acento(rotulo || ' ' || coalesce(numero_referencia, '') || ' ' || descricao || ' ' || coalesce(detalhes ->> 'questao', ''))
    )
  ) stored;

create index tesemap_nos_busca_idx on public.tesemap_nos using gin (busca);

-- Pesquisa e filtros num só lugar; respeita a RLS de quem chama (só volta o que o público pode ver).
-- Sem consulta, lista tudo; os mais recentemente julgados primeiro.
create function public.tesemap_buscar(consulta text default '', tribunal text default null, tipo text default null, limite integer default 40)
returns table (
  id text, tipo text, rotulo text, tribunal text, numero_referencia text, descricao text, dispositivo_id text, detalhes jsonb,
  origem_dado text, fontes jsonb, validado_por text, validado_em date, atualizado_em date
)
language sql
stable
set search_path = ''
as $$
  with q as (
    select case when pg_catalog.btrim(coalesce(tesemap_buscar.consulta, '')) = '' then null
                else pg_catalog.websearch_to_tsquery('portuguese'::regconfig, public.tesemap_sem_acento(tesemap_buscar.consulta)) end as consulta
  )
  select n.id, n.tipo, n.rotulo, n.tribunal, n.numero_referencia, n.descricao, n.dispositivo_id, n.detalhes,
         n.origem_dado, n.fontes, n.validado_por, n.validado_em, n.atualizado_em
  from public.tesemap_nos n, q
  where (q.consulta is null or n.busca @@ q.consulta)
    and (tesemap_buscar.tribunal is null or n.tribunal = tesemap_buscar.tribunal)
    and (tesemap_buscar.tipo is null or n.tipo = tesemap_buscar.tipo)
  order by case when q.consulta is null then 0 else pg_catalog.ts_rank(n.busca, q.consulta) end desc,
           n.detalhes ->> 'dataJulgamento' desc nulls last,
           n.id
  limit least(greatest(tesemap_buscar.limite, 1), 100)
$$;

revoke all on function public.tesemap_sem_acento(text) from public;
grant execute on function public.tesemap_sem_acento(text) to anon, authenticated, service_role;
revoke all on function public.tesemap_buscar(text, text, text, integer) from public;
grant execute on function public.tesemap_buscar(text, text, text, integer) to anon, authenticated, service_role;
