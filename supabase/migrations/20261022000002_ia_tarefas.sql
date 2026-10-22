-- IA como catálogo de tarefas fechadas (decisão do responsável, 22/10/2026; docs/produto/IA_TAREFAS.md). Generaliza a migração
-- 20261022000001_explicacao_ia.sql, que servia só à explicação de dispositivo:
-- - o cache vira `ia_respostas`, por tarefa (`tarefa`, `chave`), com a referência (ex.: o id do dispositivo), a versão da tarefa e o modelo;
-- - o registro de uso ganha `tarefa` e troca `dispositivo_id` por `referencia`;
-- - a cota é por usuário e por tarefa; "uma chamada de cada vez" e o orçamento do mês continuam valendo para todas as tarefas juntas.
-- Nada muda para o usuário. Aplicar depois da 20261022000001 (as duas podem ir juntas, nesta ordem).

alter table public.ia_explicacoes rename to ia_respostas;
alter table public.ia_respostas rename column dispositivo_id to referencia;
alter table public.ia_respostas rename column versao_prompt to versao;
alter table public.ia_respostas rename column explicacao to resposta;
alter table public.ia_respostas drop column hash_texto;
alter table public.ia_respostas add column tarefa text not null default 'explicar-dispositivo' check (tarefa ~ '^[a-z][a-z0-9-]{2,40}$');
alter table public.ia_respostas alter column tarefa drop default;
alter table public.ia_respostas drop constraint ia_explicacoes_pkey;
alter table public.ia_respostas add primary key (tarefa, chave);
alter index public.ia_explicacoes_dispositivo rename to ia_respostas_referencia;

alter table public.ia_uso rename column dispositivo_id to referencia;
alter table public.ia_uso add column tarefa text not null default 'explicar-dispositivo' check (tarefa ~ '^[a-z][a-z0-9-]{2,40}$');
alter table public.ia_uso alter column tarefa drop default;
drop index public.ia_uso_usuario;
create index ia_uso_usuario on public.ia_uso (usuario_id, tarefa, criado_em);

drop function public.ia_reservar(uuid, text, text, integer, integer, numeric, numeric);
drop function public.ia_registrar_cache(uuid, text, text);

-- Reserva atômica. Conta na cota da tarefa tudo o que não veio do cache (falha e recusa também, para que insistir não contorne o limite).
-- Dia e mês no fuso de Brasília. O orçamento do mês soma o custo real das chamadas feitas e o custo máximo das que estão em curso, em todas as tarefas.
create function public.ia_reservar(
  p_tarefa text, p_usuario uuid, p_referencia text, p_chave text,
  p_limite_dia integer, p_limite_mes integer, p_orcamento_mes_usd numeric, p_custo_maximo_usd numeric
) returns table (ok boolean, motivo text, reserva_id bigint, restantes_hoje integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  agora_br timestamp := (now() at time zone 'America/Sao_Paulo');
  inicio_dia timestamptz := (date_trunc('day', agora_br) at time zone 'America/Sao_Paulo');
  inicio_mes timestamptz := (date_trunc('month', agora_br) at time zone 'America/Sao_Paulo');
  no_dia integer;
  no_mes integer;
  gasto numeric;
  novo bigint;
begin
  -- Um pedido de cada vez no projeto inteiro: duas abas não passam juntas pela conferência
  perform pg_advisory_xact_lock(hashtext('ia_uso'));

  -- Uma chamada de cada vez por usuário, em qualquer tarefa
  if exists (select 1 from public.ia_uso where usuario_id = p_usuario and situacao = 'reservada' and criado_em > now() - interval '2 minutes') then
    return query select false, 'em_andamento'::text, null::bigint, null::integer;
    return;
  end if;

  select count(*) filter (where criado_em >= inicio_dia), count(*)
    into no_dia, no_mes
    from public.ia_uso
    where usuario_id = p_usuario and tarefa = p_tarefa and situacao <> 'cache' and criado_em >= inicio_mes;
  if no_dia >= p_limite_dia then
    return query select false, 'limite_dia'::text, null::bigint, 0;
    return;
  end if;
  if no_mes >= p_limite_mes then
    return query select false, 'limite_mes'::text, null::bigint, 0;
    return;
  end if;

  select coalesce(sum(custo_usd), 0) into gasto from public.ia_uso where criado_em >= inicio_mes;
  if gasto + p_custo_maximo_usd > p_orcamento_mes_usd then
    return query select false, 'orcamento'::text, null::bigint, null::integer;
    return;
  end if;

  insert into public.ia_uso (tarefa, usuario_id, referencia, chave, situacao, custo_usd)
    values (p_tarefa, p_usuario, p_referencia, p_chave, 'reservada', p_custo_maximo_usd)
    returning id into novo;
  return query select true, null::text, novo, p_limite_dia - no_dia - 1;
end;
$$;

-- Uso servido do cache: registrado sem custo e fora da cota
create function public.ia_registrar_cache(p_tarefa text, p_usuario uuid, p_referencia text, p_chave text) returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.ia_uso (tarefa, usuario_id, referencia, chave, situacao, custo_usd, finalizado_em)
    values (p_tarefa, p_usuario, p_referencia, p_chave, 'cache', 0, now());
$$;

revoke all on function public.ia_reservar(text, uuid, text, text, integer, integer, numeric, numeric) from public, anon, authenticated;
revoke all on function public.ia_registrar_cache(text, uuid, text, text) from public, anon, authenticated;
grant execute on function public.ia_reservar(text, uuid, text, text, integer, integer, numeric, numeric) to service_role;
grant execute on function public.ia_registrar_cache(text, uuid, text, text) to service_role;
