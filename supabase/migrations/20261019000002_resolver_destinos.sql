-- F3-05: liga cada remissão ao dispositivo de destino quando a norma e o artigo existem no corpus.
-- Chamada pela carga do corpus (service_role) depois de inserir as normas; é a mesma regra de resolverDestinos() em
-- packages/normaviva/src/busca/carga.ts. Pega a primeira ocorrência do rótulo no corpo, que é a numeração original quando a
-- página repete um bloco. Só a chave de serviço executa: o corpo escreve em relacoes, tabela sem permissão de escrita para o público.

create function public.resolver_destinos_relacoes() returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  ligadas integer;
begin
  update public.relacoes r set destino_id = d.id
  from (
    select distinct on (norma_id, rotulo) id, norma_id, rotulo
    from public.dispositivos
    where escopo = 'corpo'
    order by norma_id, rotulo, ordem
  ) d
  where r.tipo = 'remete' and r.destino_id is null and r.destino_norma_id = d.norma_id and r.destino_rotulo = d.rotulo;
  get diagnostics ligadas = row_count;
  return ligadas;
end;
$$;

revoke all on function public.resolver_destinos_relacoes() from public, anon, authenticated;
grant execute on function public.resolver_destinos_relacoes() to service_role;
