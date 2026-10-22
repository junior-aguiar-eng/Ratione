-- F3-05: a busca por assunto do NormaViva passa a achar o que se digita SEM acento (configuração `portugues_sem_acento`, migração 20261022000004).
-- Antes: "honorarios advocaticios" devolvia 0 resultados e "honorários advocatícios", 18 (CPC); "prisao preventiva" também 0.
--
-- Por que duas colunas e dois modos, em vez de trocar a configuração: o `unaccent` roda antes do radical e o radicalizador do português
-- depende dos acentos ("-ção", "-ões"). Com a configuração nova no lugar da antiga, "desconsideração" e "desconsiderá-la" deixavam de ter
-- o mesmo radical e a ordem dos resultados de quem JÁ digitava com acento mudava (art. 50 do CC da 1ª página para a 19ª; só 1 de 15
-- consultas de teste mantinha a lista idêntica). Então:
--   * `busca` (a coluna e o índice de sempre) fica como está;
--   * `busca_sem_acento` é uma coluna nova, com a configuração sem acento;
--   * a função olha a consulta: se tem alguma letra acentuada, roda EXATAMENTE a lógica de antes sobre `busca`; se não tem nenhuma,
--     roda a mesma lógica sobre `busca_sem_acento` (a pessoa que digita sem acento quase sempre quer o texto acentuado).
-- Consulta com parte das palavras acentuadas e parte não conta como acentuada. A lógica é a de 20261020000001 (60% das palavras, as longas
-- casam pelo começo, ordem por palavras achadas e proximidade). O trecho destacado é sempre o texto original, acentuado.

alter table public.dispositivos
  add column busca_sem_acento tsvector generated always as (
    to_tsvector('public.portugues_sem_acento'::regconfig, rotulo || ' ' || texto || ' ' || continuacao)
  ) stored;

create index dispositivos_busca_sem_acento_idx on public.dispositivos using gin (busca_sem_acento);

create or replace function public.buscar_dispositivos(consulta text, norma text default null, limite integer default 20)
returns table (id text, norma_id text, rotulo text, trecho text, relevancia real)
language sql
stable
set search_path = ''
as $$
  with modo as (
    select buscar_dispositivos.consulta ~ '[áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ]' as acentuado
  ),
  palavras as (
    -- palavras da consulta já reduzidas ao radical (stopwords de fora). As longas (8+ letras) casam pelo começo, para que
    -- "desconsideração" ache "desconsiderá-la": o radical do português muda entre o substantivo e o verbo.
    select m.acentuado,
           case when pg_catalog.length(l.lexeme) >= 8 then pg_catalog.left(l.lexeme, greatest(6, pg_catalog.length(l.lexeme) - 3)) else l.lexeme end as raiz,
           pg_catalog.length(l.lexeme) >= 8 as prefixo
    from modo m,
         pg_catalog.unnest(
           case when m.acentuado then pg_catalog.to_tsvector('portuguese'::regconfig, buscar_dispositivos.consulta)
                else pg_catalog.to_tsvector('public.portugues_sem_acento'::regconfig, buscar_dispositivos.consulta) end
         ) as l(lexeme, positions, weights)
  ),
  lexemas as (
    select bool_or(w.acentuado) as acentuado,
           pg_catalog.array_agg(pg_catalog.to_tsquery('simple'::regconfig, pg_catalog.quote_literal(w.raiz) || case when w.prefixo then ':*' else '' end)) as qs,
           pg_catalog.count(*)::integer as n,
           pg_catalog.to_tsquery('simple'::regconfig, pg_catalog.string_agg(pg_catalog.quote_literal(w.raiz) || case when w.prefixo then ':*' else '' end, ' | ')) as ou
    from palavras w
  ),
  candidatos as (
    select d.id, d.norma_id, d.rotulo, d.texto, d.ordem, d.busca, x.ou, x.acentuado,
           (select pg_catalog.count(*) from pg_catalog.unnest(x.qs) as q where d.busca @@ q)::integer as achadas,
           x.n
    from public.dispositivos d, lexemas x
    where x.n > 0
      and x.acentuado
      and d.busca @@ x.ou
      and not d.revogado
      and (buscar_dispositivos.norma is null or d.norma_id = buscar_dispositivos.norma)
    union all
    select d.id, d.norma_id, d.rotulo, d.texto, d.ordem, d.busca_sem_acento, x.ou, x.acentuado,
           (select pg_catalog.count(*) from pg_catalog.unnest(x.qs) as q where d.busca_sem_acento @@ q)::integer as achadas,
           x.n
    from public.dispositivos d, lexemas x
    where x.n > 0
      and not x.acentuado
      and d.busca_sem_acento @@ x.ou
      and not d.revogado
      and (buscar_dispositivos.norma is null or d.norma_id = buscar_dispositivos.norma)
  )
  select c.id,
         c.norma_id,
         c.rotulo,
         pg_catalog.ts_headline(case when c.acentuado then 'portuguese'::regconfig else 'public.portugues_sem_acento'::regconfig end, c.texto, c.ou, 'MaxFragments=1, MaxWords=40, MinWords=15'),
         (c.achadas + pg_catalog.ts_rank_cd(c.busca, c.ou, 1 | 4))::real
  from candidatos c
  where c.achadas >= pg_catalog.ceil(c.n * 0.6)
  order by c.achadas desc, pg_catalog.ts_rank_cd(c.busca, c.ou, 1 | 4) desc, c.norma_id, c.ordem
  limit least(greatest(buscar_dispositivos.limite, 1), 100)
$$;

revoke all on function public.buscar_dispositivos(text, text, integer) from public;
grant execute on function public.buscar_dispositivos(text, text, integer) to anon, authenticated, service_role;
