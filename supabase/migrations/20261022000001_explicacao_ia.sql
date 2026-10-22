-- F3-08: explicação de dispositivo por IA (Claude Haiku 5.5), sob demanda e com controle rígido de uso. Especificação: docs/produto/EXPLICACAO_IA.md.
-- Duas tabelas: o cache das explicações (uma por modelo, versão do prompt e texto do dispositivo) e o registro de cada uso, com o custo.
-- Ninguém escreve nelas pelo navegador: só a rota do servidor, com a chave de serviço, e só pelas funções abaixo, que conferem cota e orçamento
-- de forma atômica (um pedido de cada vez). O usuário logado lê apenas o próprio registro de uso (para saber quanto ainda pode pedir).

create table public.ia_explicacoes (
  chave text primary key check (chave ~ '^[0-9a-f]{64}$'),
  dispositivo_id text not null,
  hash_texto text not null,
  modelo text not null,
  versao_prompt text not null,
  explicacao jsonb not null,
  criado_em timestamptz not null default now()
);
create index ia_explicacoes_dispositivo on public.ia_explicacoes (dispositivo_id);

create table public.ia_uso (
  id bigint generated always as identity primary key,
  usuario_id uuid not null references auth.users (id) on delete cascade,
  dispositivo_id text not null,
  chave text not null,
  -- reservada: chamada em curso; cache: servida do cache (sem custo, fora da cota); as demais: resultado da chamada
  situacao text not null check (situacao in ('reservada', 'gerada', 'cache', 'falhou', 'recusada', 'invalida')),
  tokens_entrada integer,
  tokens_saida integer,
  tokens_cache_leitura integer,
  tokens_cache_escrita integer,
  custo_usd numeric(12, 6) not null default 0 check (custo_usd >= 0),
  criado_em timestamptz not null default now(),
  finalizado_em timestamptz
);
create index ia_uso_usuario on public.ia_uso (usuario_id, criado_em);
create index ia_uso_mes on public.ia_uso (criado_em);

alter table public.ia_explicacoes enable row level security;
alter table public.ia_uso enable row level security;

-- Tabelas novas nascem com todos os privilégios para anon e authenticated: reduz ao mínimo (só a leitura do próprio uso)
revoke all on public.ia_explicacoes from anon, authenticated;
revoke all on public.ia_uso from anon, authenticated;
grant select on public.ia_uso to authenticated;
create policy ia_uso_leitura on public.ia_uso for select to authenticated using ((select auth.uid()) = usuario_id);

-- A rota do servidor lê o cache e grava nele; o registro de uso só muda pelas funções
grant select, insert on public.ia_explicacoes to service_role;
grant select on public.ia_uso to service_role;

-- Reserva atômica. Conta na cota tudo o que não veio do cache (falha e recusa também, para que insistir não contorne o limite).
-- Dia e mês no fuso de Brasília. O orçamento do mês soma o custo real das chamadas feitas e o custo máximo das que estão em curso.
create function public.ia_reservar(
  p_usuario uuid, p_dispositivo text, p_chave text,
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

  if exists (select 1 from public.ia_uso where usuario_id = p_usuario and situacao = 'reservada' and criado_em > now() - interval '2 minutes') then
    return query select false, 'em_andamento'::text, null::bigint, null::integer;
    return;
  end if;

  select count(*) filter (where criado_em >= inicio_dia), count(*)
    into no_dia, no_mes
    from public.ia_uso
    where usuario_id = p_usuario and situacao <> 'cache' and criado_em >= inicio_mes;
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

  insert into public.ia_uso (usuario_id, dispositivo_id, chave, situacao, custo_usd)
    values (p_usuario, p_dispositivo, p_chave, 'reservada', p_custo_maximo_usd)
    returning id into novo;
  return query select true, null::text, novo, p_limite_dia - no_dia - 1;
end;
$$;

-- Fecha a reserva com o custo real (zero quando a chamada não foi cobrada)
create function public.ia_finalizar(
  p_reserva bigint, p_situacao text, p_tokens_entrada integer, p_tokens_saida integer,
  p_tokens_cache_leitura integer, p_tokens_cache_escrita integer, p_custo_usd numeric
) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_situacao not in ('gerada', 'falhou', 'recusada', 'invalida') then
    raise exception 'situação inválida: %', p_situacao;
  end if;
  update public.ia_uso
    set situacao = p_situacao, tokens_entrada = p_tokens_entrada, tokens_saida = p_tokens_saida,
        tokens_cache_leitura = p_tokens_cache_leitura, tokens_cache_escrita = p_tokens_cache_escrita,
        custo_usd = p_custo_usd, finalizado_em = now()
    where id = p_reserva and situacao = 'reservada';
end;
$$;

-- Uso servido do cache: registrado sem custo e fora da cota
create function public.ia_registrar_cache(p_usuario uuid, p_dispositivo text, p_chave text) returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.ia_uso (usuario_id, dispositivo_id, chave, situacao, custo_usd, finalizado_em)
    values (p_usuario, p_dispositivo, p_chave, 'cache', 0, now());
$$;

revoke all on function public.ia_reservar(uuid, text, text, integer, integer, numeric, numeric) from public, anon, authenticated;
revoke all on function public.ia_finalizar(bigint, text, integer, integer, integer, integer, numeric) from public, anon, authenticated;
revoke all on function public.ia_registrar_cache(uuid, text, text) from public, anon, authenticated;
grant execute on function public.ia_reservar(uuid, text, text, integer, integer, numeric, numeric) to service_role;
grant execute on function public.ia_finalizar(bigint, text, integer, integer, integer, integer, numeric) to service_role;
grant execute on function public.ia_registrar_cache(uuid, text, text) to service_role;
