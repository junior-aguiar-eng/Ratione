-- Onda 3 (NormaViva/TeseMap — Task 3.3): estende `public.resolver_destinos_relacoes()` para resolver destinos
-- também fora de `escopo = 'corpo'` (como `ADCT`, `decreto` e `anexo-N`), espelhando `resolverDestinos()` de
-- `packages/normaviva/src/busca/carga.ts`. Passo 1 prioriza o mesmo escopo para remissões internas; Passo 2 liga
-- os demais destinos preferindo `'corpo'` antes dos escopos complementares. Mantém `security invoker`, `set search_path = ''`
-- e privilégios exclusivos para `service_role`.

create or replace function public.resolver_destinos_relacoes() returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  ligadas_mesmo integer;
  ligadas_gerais integer;
begin
  update public.relacoes r set destino_id = d.id
  from (
    select distinct on (norma_id, escopo, rotulo) id, norma_id, escopo, rotulo
    from public.dispositivos
    order by norma_id, escopo, rotulo, ordem
  ) d
  where r.tipo = 'remete'
    and r.destino_id is null
    and r.escopo in ('mesma', 'presumido')
    and r.destino_norma_id = d.norma_id
    and d.escopo = pg_catalog.split_part(r.origem_id, '|', 2)
    and r.destino_rotulo = d.rotulo;
  get diagnostics ligadas_mesmo = row_count;

  update public.relacoes r set destino_id = d.id
  from (
    select distinct on (norma_id, rotulo) id, norma_id, rotulo
    from public.dispositivos
    order by norma_id, rotulo, (escopo <> 'corpo'), ordem
  ) d
  where r.tipo = 'remete'
    and r.destino_id is null
    and r.destino_norma_id = d.norma_id
    and r.destino_rotulo = d.rotulo;
  get diagnostics ligadas_gerais = row_count;

  return coalesce(ligadas_mesmo, 0) + coalesce(ligadas_gerais, 0);
end;
$$;

revoke all on function public.resolver_destinos_relacoes() from public, anon, authenticated;
grant execute on function public.resolver_destinos_relacoes() to service_role;
