-- Onda 1 (Segurança, Cota de IA): fecha bypass de cota por-analise no pipeline do Argumenta
-- e impede que reservas 'reservada' órfãs (com mais de 2 minutos) drenem o fundo mensal.
-- Aplicar depois da 20261023000002 (e demais migrações existentes). Idempotente via CREATE OR REPLACE.

-- Gasto do fundo no mês corrente (Brasília): custo real das chamadas feitas e custo máximo apenas das reservas ativas (< 2 min).
create or replace function public.ia_gasto_do_fundo(p_fundo text) returns numeric
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(sum(u.custo_usd), 0)
  from public.ia_uso u
  where u.fundo = p_fundo
    and u.criado_em >= (date_trunc('month', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo')
    and not (u.situacao = 'reservada' and u.criado_em <= now() - interval '2 minutes');
$$;

-- Reserva de uma chamada de IA dentro de uma análise já iniciada:
-- 1. Saneia reservas 'reservada' órfãs (> 2 min) marcando-as como 'invalida' com custo_usd = 0.
-- 2. Exige análise válida do próprio usuário em andamento.
-- 3. Mantém "uma chamada de cada vez por usuário".
-- 4. Para tarefas do pipeline Argumenta (argumenta-*), bloqueia repetição de etapa já 'gerada'
--    na mesma análise e exige precedência: argumenta-estrutura -> argumenta-questoes -> argumenta-fundamentos.
create or replace function public.ia_reservar(
  p_tarefa text, p_usuario uuid, p_referencia text, p_chave text, p_analise uuid, p_custo_maximo_usd numeric
) returns table (ok boolean, motivo text, reserva_id bigint)
language plpgsql
security definer
set search_path = ''
as $$
declare
  fundo_do_usuario text;
  orcamento numeric;
  novo bigint;
begin
  -- Um pedido de cada vez no projeto inteiro: duas abas não passam juntas pela conferência
  perform pg_advisory_xact_lock(hashtext('ia_uso'));

  -- Expira reservas órfãs presas em 'reservada' há mais de 2 minutos
  update public.ia_uso
     set situacao = 'invalida',
         custo_usd = 0,
         finalizado_em = now()
   where situacao = 'reservada'
     and criado_em <= now() - interval '2 minutes';

  if not exists (select 1 from public.analises a where a.id = p_analise and a.usuario_id = p_usuario and a.situacao = 'em_andamento') then
    return query select false, 'analise_invalida'::text, null::bigint;
    return;
  end if;

  -- Uma chamada de cada vez por usuário, em qualquer tarefa
  if exists (select 1 from public.ia_uso where usuario_id = p_usuario and situacao = 'reservada' and criado_em > now() - interval '2 minutes') then
    return query select false, 'em_andamento'::text, null::bigint;
    return;
  end if;

  -- Pipeline do Argumenta: sem repetição de etapa já gerada e sem pular etapa anterior
  if p_tarefa like 'argumenta-%' then
    if exists (
      select 1
      from public.ia_uso u
      where u.analise_id = p_analise
        and u.tarefa = p_tarefa
        and u.situacao = 'gerada'
    ) then
      return query select false, 'analise_invalida'::text, null::bigint;
      return;
    end if;

    if p_tarefa = 'argumenta-questoes' and not exists (
      select 1
      from public.ia_uso u
      where u.analise_id = p_analise
        and u.tarefa = 'argumenta-estrutura'
        and u.situacao = 'gerada'
    ) then
      return query select false, 'analise_invalida'::text, null::bigint;
      return;
    end if;

    if p_tarefa = 'argumenta-fundamentos' and not exists (
      select 1
      from public.ia_uso u
      where u.analise_id = p_analise
        and u.tarefa = 'argumenta-questoes'
        and u.situacao = 'gerada'
    ) then
      return query select false, 'analise_invalida'::text, null::bigint;
      return;
    end if;
  end if;

  fundo_do_usuario := public.ia_fundo_do_usuario(p_usuario);
  select f.orcamento_mes_usd into orcamento from public.ia_fundos f where f.fundo = fundo_do_usuario;
  if public.ia_gasto_do_fundo(fundo_do_usuario) + p_custo_maximo_usd > orcamento then
    return query select false, ('orcamento_' || fundo_do_usuario)::text, null::bigint;
    return;
  end if;

  insert into public.ia_uso (tarefa, usuario_id, referencia, chave, situacao, custo_usd, analise_id, fundo)
    values (p_tarefa, p_usuario, p_referencia, p_chave, 'reservada', p_custo_maximo_usd, p_analise, fundo_do_usuario)
    returning id into novo;
  return query select true, null::text, novo;
end;
$$;

revoke all on function public.ia_gasto_do_fundo(text) from public, anon, authenticated;
revoke all on function public.ia_reservar(text, uuid, text, text, uuid, numeric) from public, anon, authenticated;
grant execute on function public.ia_gasto_do_fundo(text) to service_role;
grant execute on function public.ia_reservar(text, uuid, text, text, uuid, numeric) to service_role;
