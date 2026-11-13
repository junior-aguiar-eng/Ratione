-- TeseMap: consulta só com stopwords ou pontuação ("de da do", "---") gera `tsquery` vazia (`numnode(q) = 0`)
-- e devolvia 0 linhas em vez da lista padrão. Mantém a assinatura com `prefixo` da migração 20261026000001 e remove
-- eventual sobrecarga antiga de 4 argumentos antes de recriar a função de 5 argumentos.

drop function if exists public.tesemap_buscar(text, text, text, integer);

create or replace function public.tesemap_buscar(consulta text default '', tribunal text default null, tipo text default null, limite integer default 40, prefixo text default null)
returns table (
  id text, tipo text, rotulo text, tribunal text, numero_referencia text, descricao text, dispositivo_id text, detalhes jsonb,
  origem_dado text, fontes jsonb, validado_por text, validado_em date, atualizado_em date
)
language sql
stable
set search_path = ''
as $$
  with bruto as (
    select case when pg_catalog.btrim(coalesce(tesemap_buscar.consulta, '')) = '' then null::tsquery
                else pg_catalog.websearch_to_tsquery('public.portugues_sem_acento'::regconfig, tesemap_buscar.consulta) end as ts
  ),
  q as (
    select case when ts is null or pg_catalog.numnode(ts) = 0 then null::tsquery else ts end as consulta
    from bruto
  )
  select n.id, n.tipo, n.rotulo, n.tribunal, n.numero_referencia, n.descricao, n.dispositivo_id, n.detalhes,
         n.origem_dado, n.fontes, n.validado_por, n.validado_em, n.atualizado_em
  from public.tesemap_nos n, q
  where (q.consulta is null or n.busca @@ q.consulta)
    and (tesemap_buscar.tribunal is null or n.tribunal = tesemap_buscar.tribunal)
    and (tesemap_buscar.tipo is null or n.tipo = tesemap_buscar.tipo)
    and (tesemap_buscar.prefixo is null or pg_catalog.starts_with(n.id, tesemap_buscar.prefixo))
  order by case when q.consulta is null then 0 else pg_catalog.ts_rank(n.busca, q.consulta) end desc,
           n.detalhes ->> 'dataJulgamento' desc nulls last,
           n.id
  limit least(greatest(tesemap_buscar.limite, 1), 100)
$$;

revoke all on function public.tesemap_buscar(text, text, text, integer, text) from public;
grant execute on function public.tesemap_buscar(text, text, text, integer, text) to anon, authenticated, service_role;
