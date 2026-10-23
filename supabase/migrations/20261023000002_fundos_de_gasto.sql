-- F8 (docs/produto/PLANOS_E_COBRANCA.md §3.2): dois fundos de gasto de IA, para o gratuito não derrubar quem paga.
-- Antes: um teto único por mês (US$ 5, em variável de ambiente) somava todos os usuários. Agora:
-- - `ia_fundos`: o teto mensal de cada fundo, no banco (muda com uma linha de SQL, sem deploy). `gratuito` paga o uso de quem está no plano
--   Gratuito; `pagantes` paga o uso de quem tem plano pago. Cada fundo acaba sozinho: o outro segue funcionando.
-- - `ia_uso.fundo`: de qual fundo saiu cada chamada (decidido no momento da reserva, pelo plano em vigor do usuário).
-- - `ia_reservar` perde o parâmetro de orçamento (lê `ia_fundos`) e `analise_iniciar` já avisa quando o fundo do usuário acabou, antes de
--   reservar a vaga. Quando o fundo acaba, a cota do cliente NÃO é gasta.
-- O fundo dos pagantes é hoje só o piso (não há receita nem cobrança). Quando a cobrança existir (F8-05), o teto passa a ser o maior entre o
-- piso e uma porcentagem da receita do mês; esta migração só prepara a estrutura.
-- Aplicar depois da 20261023000001. Ordem de implantação: aplicar esta migração ANTES de publicar o código que a usa.

create table public.ia_fundos (
  fundo text primary key check (fundo in ('gratuito', 'pagantes')),
  -- Teto de gasto do mês, em US$ (mês de Brasília). Para mudar: update public.ia_fundos set orcamento_mes_usd = 20 where fundo = 'gratuito';
  orcamento_mes_usd numeric(10, 2) not null check (orcamento_mes_usd >= 0),
  descricao text not null
);

insert into public.ia_fundos (fundo, orcamento_mes_usd, descricao) values
  ('gratuito', 15, 'Uso de quem está no plano Gratuito. Se acabar, só o gratuito pausa até o dia 1º.'),
  ('pagantes', 5, 'Uso de quem tem plano pago (hoje, só o piso: não há receita). Com a cobrança, passa a ser o maior entre este piso e uma porcentagem da receita.');

alter table public.ia_fundos enable row level security;
revoke all on public.ia_fundos from anon, authenticated;
grant select on public.ia_fundos to service_role;

alter table public.ia_uso add column fundo text check (fundo in ('gratuito', 'pagantes'));
-- Tudo o que foi gasto até aqui veio do plano Gratuito (ainda não existe assinatura)
update public.ia_uso set fundo = 'gratuito' where situacao <> 'cache';
create index ia_uso_fundo_mes on public.ia_uso (fundo, criado_em);

-- De qual fundo sai o uso deste usuário: o do plano em vigor
create function public.ia_fundo_do_usuario(p_usuario uuid) returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case when (select plano from public.plano_vigente(p_usuario)) = 'gratuito' then 'gratuito' else 'pagantes' end;
$$;

-- Gasto do fundo no mês corrente (Brasília): custo real das chamadas feitas e custo máximo das que estão em curso
create function public.ia_gasto_do_fundo(p_fundo text) returns numeric
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(sum(u.custo_usd), 0)
  from public.ia_uso u
  where u.fundo = p_fundo
    and u.criado_em >= (date_trunc('month', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo');
$$;

-- Situação dos fundos, para o responsável conferir no SQL Editor: select * from public.ia_fundos_situacao();
create function public.ia_fundos_situacao()
returns table (fundo text, orcamento_usd numeric, gasto_usd numeric, restante_usd numeric, usado_pct numeric)
language sql
stable
security definer
set search_path = ''
as $$
  select f.fundo, f.orcamento_mes_usd, public.ia_gasto_do_fundo(f.fundo),
         greatest(f.orcamento_mes_usd - public.ia_gasto_do_fundo(f.fundo), 0),
         case when f.orcamento_mes_usd = 0 then 100 else round(100 * public.ia_gasto_do_fundo(f.fundo) / f.orcamento_mes_usd, 1) end
  from public.ia_fundos f
  order by f.fundo;
$$;

-- Início de uma análise: além da cota do plano, avisa se o fundo do usuário já acabou (antes de reservar a vaga).
-- Mesma assinatura e mesmas colunas da versão anterior.
create or replace function public.analise_iniciar(p_usuario uuid, p_tipo text, p_rotulo text default null)
returns table (ok boolean, motivo text, analise_id uuid, restantes integer, plano text, renova_em timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v record;
  cota integer;
  usadas integer;
  novo uuid;
  fundo_do_usuario text;
begin
  if p_tipo not in ('rapida', 'completa', 'explicacao') then
    raise exception 'tipo de análise inválido';
  end if;
  -- Dois pedidos do mesmo usuário não passam juntos pela conferência
  perform pg_advisory_xact_lock(hashtext('analise:' || p_usuario::text));

  select * into v from public.plano_vigente(p_usuario);
  select c.quantidade into cota from public.plano_cotas c where c.plano_id = v.plano and c.tipo = p_tipo;
  if coalesce(cota, 0) = 0 then
    return query select false, 'sem_cota_no_plano'::text, null::uuid, 0, v.plano, v.fim;
    return;
  end if;

  select count(*)::integer into usadas
    from public.analises a
    where a.usuario_id = p_usuario and a.tipo = p_tipo and a.criada_em >= v.inicio and a.criada_em < v.fim
      and (a.consumiu or (a.situacao = 'em_andamento' and a.criada_em > now() - interval '15 minutes'));
  if usadas >= cota then
    return query select false, 'limite_periodo'::text, null::uuid, 0, v.plano, v.fim;
    return;
  end if;

  -- O fundo do mês acabou: não reserva vaga; a cota do cliente fica intacta
  fundo_do_usuario := public.ia_fundo_do_usuario(p_usuario);
  if public.ia_gasto_do_fundo(fundo_do_usuario) >= (select f.orcamento_mes_usd from public.ia_fundos f where f.fundo = fundo_do_usuario) then
    return query select false, ('orcamento_' || fundo_do_usuario)::text, null::uuid, cota - usadas, v.plano,
      ((date_trunc('month', now() at time zone 'America/Sao_Paulo') + interval '1 month') at time zone 'America/Sao_Paulo');
    return;
  end if;

  insert into public.analises (usuario_id, tipo, rotulo) values (p_usuario, p_tipo, p_rotulo) returning id into novo;
  return query select true, null::text, novo, cota - usadas - 1, v.plano, v.fim;
end;
$$;

-- Reserva de uma chamada de IA dentro de uma análise já iniciada. O orçamento sai do fundo do usuário (tabela `ia_fundos`), não mais de parâmetro.
drop function public.ia_reservar(text, uuid, text, text, uuid, numeric, numeric);
create function public.ia_reservar(
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

  if not exists (select 1 from public.analises a where a.id = p_analise and a.usuario_id = p_usuario and a.situacao = 'em_andamento') then
    return query select false, 'analise_invalida'::text, null::bigint;
    return;
  end if;

  -- Uma chamada de cada vez por usuário, em qualquer tarefa
  if exists (select 1 from public.ia_uso where usuario_id = p_usuario and situacao = 'reservada' and criado_em > now() - interval '2 minutes') then
    return query select false, 'em_andamento'::text, null::bigint;
    return;
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

revoke all on function public.ia_fundo_do_usuario(uuid) from public, anon, authenticated;
revoke all on function public.ia_gasto_do_fundo(text) from public, anon, authenticated;
revoke all on function public.ia_fundos_situacao() from public, anon, authenticated;
revoke all on function public.ia_reservar(text, uuid, text, text, uuid, numeric) from public, anon, authenticated;
grant execute on function public.ia_fundo_do_usuario(uuid) to service_role;
grant execute on function public.ia_gasto_do_fundo(text) to service_role;
grant execute on function public.ia_fundos_situacao() to service_role;
grant execute on function public.ia_reservar(text, uuid, text, text, uuid, numeric) to service_role;
