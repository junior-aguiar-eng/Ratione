-- F3-05: busca por assunto mais útil. Antes: todas as palavras da consulta tinham de aparecer (E lógico) e a ordem era ts_rank,
-- que premia texto curto. Resultado ruim: "desconsideração da personalidade jurídica" não achava o art. 50 do CC (o texto diz
-- "desconsiderá-la", outro radical) e a Lei 8.429 vinha primeiro.
-- Agora: o dispositivo entra se tiver pelo menos 60% das palavras da consulta (arredondado para cima: com 1 ou 2 palavras ainda
-- vale o E lógico; as palavras longas casam pelo começo, ver abaixo); a ordem é (1) quantas palavras da consulta ele tem, (2) proximidade entre elas (ts_rank_cd, densidade de
-- cobertura), (3) ordem do texto. O trecho destaca qualquer uma das palavras achadas. Mesma assinatura e mesmas permissões.

create or replace function public.buscar_dispositivos(consulta text, norma text default null, limite integer default 20)
returns table (id text, norma_id text, rotulo text, trecho text, relevancia real)
language sql
stable
set search_path = ''
as $$
  with palavras as (
    -- palavras da consulta já reduzidas ao radical (stopwords de fora). As longas (8+ letras) casam pelo começo, para que
    -- "desconsideração" ache "desconsiderá-la": o radical do português muda entre o substantivo e o verbo.
    select case when pg_catalog.length(l.lexeme) >= 8 then pg_catalog.left(l.lexeme, greatest(6, pg_catalog.length(l.lexeme) - 3)) else l.lexeme end as raiz,
           pg_catalog.length(l.lexeme) >= 8 as prefixo
    from pg_catalog.unnest(pg_catalog.to_tsvector('portuguese'::regconfig, buscar_dispositivos.consulta)) as l(lexeme, positions, weights)
  ),
  lexemas as (
    select pg_catalog.array_agg(pg_catalog.to_tsquery('simple'::regconfig, pg_catalog.quote_literal(w.raiz) || case when w.prefixo then ':*' else '' end)) as qs,
           pg_catalog.count(*)::integer as n,
           pg_catalog.to_tsquery('simple'::regconfig, pg_catalog.string_agg(pg_catalog.quote_literal(w.raiz) || case when w.prefixo then ':*' else '' end, ' | ')) as ou
    from palavras w
  ),
  candidatos as (
    select d.id, d.norma_id, d.rotulo, d.texto, d.ordem, d.busca, x.ou,
           (select pg_catalog.count(*) from pg_catalog.unnest(x.qs) as q where d.busca @@ q)::integer as achadas,
           x.n
    from public.dispositivos d, lexemas x
    where x.n > 0
      and d.busca @@ x.ou
      and not d.revogado
      and (buscar_dispositivos.norma is null or d.norma_id = buscar_dispositivos.norma)
  )
  select c.id,
         c.norma_id,
         c.rotulo,
         pg_catalog.ts_headline('portuguese'::regconfig, c.texto, c.ou, 'MaxFragments=1, MaxWords=40, MinWords=15'),
         (c.achadas + pg_catalog.ts_rank_cd(c.busca, c.ou, 1 | 4))::real
  from candidatos c
  where c.achadas >= pg_catalog.ceil(c.n * 0.6)
  order by c.achadas desc, pg_catalog.ts_rank_cd(c.busca, c.ou, 1 | 4) desc, c.norma_id, c.ordem
  limit least(greatest(buscar_dispositivos.limite, 1), 100)
$$;

revoke all on function public.buscar_dispositivos(text, text, integer) from public;
grant execute on function public.buscar_dispositivos(text, text, integer) to anon, authenticated, service_role;
