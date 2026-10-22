-- Correção de dados do NormaViva (21/10/2026), complemento de `20261021_atos_com_data_por_extenso.sql`: quando o Planalto omite o "de" antes do mês
-- ("Lei nº 8.212, de 24 julho de 1991"), o reconhecedor ainda lia o dia como ano (2024). Corrigido em packages/normaviva/src/coleta/conferir.ts.
-- Efeito: 3 remissões passam a apontar para a norma certa em `destino_norma_id`; depois, liga as remissões ao dispositivo de destino. Idempotente.
-- A última consulta confere: remissões ainda com o destino errado (esperado: 0).

begin;

update public.relacoes r
set destino_norma_id = c.novo
from (values
  ($q$art. 273 da Lei no 5.869, de 11 janeiro de 1973 - Código de Processo Civ$q$, $q$LEI-5869-2011$q$, $q$LEI-5869-1973$q$),
  ($q$art. 461 da Lei no 5.869, de 11 janeiro de 1973 - Código de Processo Civ$q$, $q$LEI-5869-2011$q$, $q$LEI-5869-1973$q$),
  ($q$art. 12 da Lei no 8.212, de 24 julho de 1991;$q$, $q$LEI-8212-2024$q$, $q$LEI-8212-1991$q$)
) as c (destino_texto, antigo, novo)
where r.tipo = 'remete' and r.destino_texto = c.destino_texto and r.destino_norma_id = c.antigo;

select public.resolver_destinos_relacoes();

commit;

select
  (select count(*) from public.relacoes where tipo = 'remete' and destino_norma_id in ('LEI-5869-2011', 'LEI-8212-2024')) as remissoes_com_destino_errado,
  (select count(*) from public.relacoes where tipo = 'remete' and destino_id is not null) as remissoes_ligadas;
