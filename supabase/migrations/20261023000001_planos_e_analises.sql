-- F8-02 e F8-03 (docs/produto/PLANOS_E_COBRANCA.md): planos, assinaturas e análises, com a cota por análise. SEM COBRANÇA: não há integração
-- com pagamento; todo usuário está no plano gratuito até existir uma assinatura (que só o servidor cria).
--
-- - `planos` e `plano_cotas`: o catálogo (Gratuito, Essencial, Profissional) e a cota de cada tipo por período; leitura pública, mudança só por migração.
-- - `assinaturas`: o plano pago do usuário. Só o servidor escreve (a cobrança do F8-05); o usuário lê a própria.
-- - `analises`: a unidade de cota (análise rápida, completa ou explicação de dispositivo). A cota é conferida UMA vez, ao iniciar
--   (`analise_iniciar`); as chamadas de IA de uma análise carregam o `analise_id` e não contam de novo.
-- - Consumo: a análise consome ao entregar a 1ª etapa (`analise_consumir`); falha sem solução estorna (`analise_falha`).
-- - `ia_reservar` perde as cotas por chamada (dia e mês) e passa a exigir a análise; segue com "uma chamada de cada vez" e o orçamento do mês.
-- Aplicar depois da 20261022000002. Ordem de implantação: aplicar esta migração ANTES de publicar o código que a usa.

create table public.planos (
  id text primary key check (id in ('gratuito', 'essencial', 'profissional')),
  nome text not null,
  -- semana: de segunda a domingo, horário de Brasília; mes: aniversário do ciclo de cobrança
  periodo text not null check (periodo in ('semana', 'mes')),
  ordem integer not null unique
);

create table public.plano_cotas (
  plano_id text not null references public.planos (id) on delete cascade,
  tipo text not null check (tipo in ('rapida', 'completa', 'explicacao')),
  quantidade integer not null check (quantidade >= 0),
  primary key (plano_id, tipo)
);

insert into public.planos (id, nome, periodo, ordem) values
  ('gratuito', 'Gratuito', 'semana', 1),
  ('essencial', 'Essencial', 'mes', 2),
  ('profissional', 'Profissional', 'mes', 3);

-- Cotas de 23/10/2026 (PLANOS_E_COBRANCA.md §2.2). A análise completa só passa a existir quando houver tarefa que a consuma.
insert into public.plano_cotas (plano_id, tipo, quantidade) values
  ('gratuito', 'rapida', 3), ('gratuito', 'completa', 0), ('gratuito', 'explicacao', 10),
  ('essencial', 'rapida', 40), ('essencial', 'completa', 0), ('essencial', 'explicacao', 200),
  ('profissional', 'rapida', 150), ('profissional', 'completa', 25), ('profissional', 'explicacao', 500);

create table public.assinaturas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  plano_id text not null references public.planos (id),
  situacao text not null check (situacao in ('pendente', 'ativa', 'em_atraso', 'pausada', 'cancelada')),
  -- Começo do ciclo de cobrança vigente (as janelas mensais contam a partir dele) e fim do período já pago
  ciclo_inicio timestamptz not null default now(),
  ciclo_fim timestamptz,
  criada_em timestamptz not null default now(),
  atualizada_em timestamptz not null default now()
);
create index assinaturas_usuario on public.assinaturas (usuario_id);

create table public.analises (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  tipo text not null check (tipo in ('rapida', 'completa', 'explicacao')),
  -- Nome que o cliente dá à análise (opcional). Nunca o texto da decisão.
  rotulo text check (char_length(rotulo) <= 80),
  situacao text not null default 'em_andamento' check (situacao in ('em_andamento', 'concluida', 'falhou', 'cancelada')),
  -- Conta na cota? Falso até a 1ª etapa ser entregue; volta a falso no estorno
  consumiu boolean not null default false,
  falhas integer not null default 0 check (falhas >= 0),
  criada_em timestamptz not null default now(),
  concluida_em timestamptz
);
create index analises_usuario on public.analises (usuario_id, tipo, criada_em);

alter table public.ia_uso add column analise_id uuid references public.analises (id) on delete set null;
create index ia_uso_analise on public.ia_uso (analise_id);

alter table public.planos enable row level security;
alter table public.plano_cotas enable row level security;
alter table public.assinaturas enable row level security;
alter table public.analises enable row level security;

-- Tabelas novas nascem com todos os privilégios para anon e authenticated: reduz ao mínimo
revoke all on public.planos, public.plano_cotas, public.assinaturas, public.analises from anon, authenticated;
grant select on public.planos, public.plano_cotas to anon, authenticated;
create policy planos_leitura on public.planos for select to anon, authenticated using (true);
create policy plano_cotas_leitura on public.plano_cotas for select to anon, authenticated using (true);
grant select on public.assinaturas, public.analises to authenticated;
create policy assinaturas_leitura on public.assinaturas for select to authenticated using ((select auth.uid()) = usuario_id);
create policy analises_leitura on public.analises for select to authenticated using ((select auth.uid()) = usuario_id);
-- O servidor lê tudo e cria assinaturas; as análises só mudam pelas funções abaixo
grant select on public.planos, public.plano_cotas, public.analises to service_role;
grant select, insert, update on public.assinaturas to service_role;

-- O plano em vigor do usuário e a janela da cota. Assinatura vale: ativa; em atraso até 3 dias depois do fim do ciclo pago; cancelada ou
-- pausada até o fim do ciclo pago. Fora disso, Gratuito. A janela mensal é o "aniversário" do ciclo que contém agora (não depende de
-- o aviso de renovação já ter chegado). A semana do gratuito vai de segunda a domingo, no horário de Brasília.
create function public.plano_vigente(p_usuario uuid)
returns table (plano text, periodo text, inicio timestamptz, fim timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  s record;
  agora_br timestamp := (now() at time zone 'America/Sao_Paulo');
  meses integer;
  ini timestamptz;
begin
  select a.plano_id, a.ciclo_inicio, p.periodo as per into s
    from public.assinaturas a
    join public.planos p on p.id = a.plano_id
    where a.usuario_id = p_usuario
      and (
        a.situacao = 'ativa'
        or (a.situacao = 'em_atraso' and a.ciclo_fim is not null and now() < a.ciclo_fim + interval '3 days')
        or (a.situacao in ('cancelada', 'pausada') and a.ciclo_fim is not null and now() < a.ciclo_fim)
      )
    order by p.ordem desc
    limit 1;

  if found and s.per = 'mes' then
    meses := greatest(0, (extract(year from age(now(), s.ciclo_inicio)) * 12 + extract(month from age(now(), s.ciclo_inicio)))::integer);
    ini := s.ciclo_inicio + meses * interval '1 month';
    return query select s.plano_id, 'mes'::text, ini, ini + interval '1 month';
  elsif found then
    return query select s.plano_id, 'semana'::text, (date_trunc('week', agora_br) at time zone 'America/Sao_Paulo'), ((date_trunc('week', agora_br) + interval '1 week') at time zone 'America/Sao_Paulo');
  else
    return query select 'gratuito'::text, 'semana'::text, (date_trunc('week', agora_br) at time zone 'America/Sao_Paulo'), ((date_trunc('week', agora_br) + interval '1 week') at time zone 'America/Sao_Paulo');
  end if;
end;
$$;

-- Inicia uma análise: confere a cota do período UMA vez. Conta na cota o que já consumiu e o que está em andamento há menos de 15 minutos
-- (reserva). Uma análise não consumida que ninguém continuou deixa de contar depois disso.
create function public.analise_iniciar(p_usuario uuid, p_tipo text, p_rotulo text default null)
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

  insert into public.analises (usuario_id, tipo, rotulo) values (p_usuario, p_tipo, p_rotulo) returning id into novo;
  return query select true, null::text, novo, cota - usadas - 1, v.plano, v.fim;
end;
$$;

-- A 1ª etapa foi entregue: a análise passa a contar na cota
create function public.analise_consumir(p_analise uuid, p_usuario uuid) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.analises set consumiu = true where id = p_analise and usuario_id = p_usuario and situacao = 'em_andamento';
  return found;
end;
$$;

-- Última etapa entregue. Consome também (caso só uma chamada, como a explicação de dispositivo, nunca tenha passado pela 1ª etapa)
create function public.analise_concluir(p_analise uuid, p_usuario uuid) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.analises set situacao = 'concluida', consumiu = true, concluida_em = now()
    where id = p_analise and usuario_id = p_usuario and situacao = 'em_andamento';
  return found;
end;
$$;

-- Uma etapa falhou. Antes de consumir: a análise segue em andamento (o cliente pode tentar de novo) e falha de vez na 3ª falha.
-- Depois de consumir: na 2ª falha a análise falha de vez e a cota é ESTORNADA (consumiu volta a falso). Devolve a situação.
create function public.analise_falha(p_analise uuid, p_usuario uuid) returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  nova text;
begin
  update public.analises set
      falhas = falhas + 1,
      situacao = case when (consumiu and falhas + 1 >= 2) or (not consumiu and falhas + 1 >= 3) then 'falhou' else situacao end,
      consumiu = case when consumiu and falhas + 1 >= 2 then false else consumiu end,
      concluida_em = case when (consumiu and falhas + 1 >= 2) or (not consumiu and falhas + 1 >= 3) then now() else concluida_em end
    where id = p_analise and usuario_id = p_usuario and situacao = 'em_andamento'
    returning situacao into nova;
  return nova;
end;
$$;

-- Desiste de uma análise que ainda não consumiu (ex.: o orçamento do mês acabou antes da primeira chamada)
create function public.analise_cancelar(p_analise uuid, p_usuario uuid) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.analises set situacao = 'cancelada', concluida_em = now()
    where id = p_analise and usuario_id = p_usuario and situacao = 'em_andamento' and not consumiu;
  return found;
end;
$$;

-- O que o cliente vê de si mesmo (tela de uso): plano, janela e, por tipo, quanto da cota usou. Lê só o do usuário logado.
create function public.uso_resumo()
returns table (plano text, plano_nome text, periodo text, inicio timestamptz, fim timestamptz, tipo text, quantidade integer, usadas integer, restantes integer)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  v record;
begin
  if uid is null then
    return;
  end if;
  select * into v from public.plano_vigente(uid);
  return query
    select v.plano, p.nome, v.periodo, v.inicio, v.fim, c.tipo, c.quantidade, u.n, greatest(c.quantidade - u.n, 0)
    from public.plano_cotas c
    join public.planos p on p.id = c.plano_id
    cross join lateral (
      select count(*)::integer as n
      from public.analises a
      where a.usuario_id = uid and a.tipo = c.tipo and a.criada_em >= v.inicio and a.criada_em < v.fim
        and (a.consumiu or (a.situacao = 'em_andamento' and a.criada_em > now() - interval '15 minutes'))
    ) u
    where c.plano_id = v.plano
    order by c.tipo;
end;
$$;

-- Reserva atômica de uma chamada de IA, dentro de uma análise já iniciada (a cota do período foi conferida em `analise_iniciar`).
-- Barra: análise que não é do usuário ou não está em andamento; chamada em curso do mesmo usuário; orçamento do mês estourado.
-- O orçamento do mês soma o custo real das chamadas feitas e o custo máximo das que estão em curso, em todas as tarefas.
drop function public.ia_reservar(text, uuid, text, text, integer, integer, numeric, numeric);
create function public.ia_reservar(
  p_tarefa text, p_usuario uuid, p_referencia text, p_chave text, p_analise uuid,
  p_orcamento_mes_usd numeric, p_custo_maximo_usd numeric
) returns table (ok boolean, motivo text, reserva_id bigint)
language plpgsql
security definer
set search_path = ''
as $$
declare
  agora_br timestamp := (now() at time zone 'America/Sao_Paulo');
  inicio_mes timestamptz := (date_trunc('month', agora_br) at time zone 'America/Sao_Paulo');
  gasto numeric;
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

  select coalesce(sum(custo_usd), 0) into gasto from public.ia_uso where criado_em >= inicio_mes;
  if gasto + p_custo_maximo_usd > p_orcamento_mes_usd then
    return query select false, 'orcamento'::text, null::bigint;
    return;
  end if;

  insert into public.ia_uso (tarefa, usuario_id, referencia, chave, situacao, custo_usd, analise_id)
    values (p_tarefa, p_usuario, p_referencia, p_chave, 'reservada', p_custo_maximo_usd, p_analise)
    returning id into novo;
  return query select true, null::text, novo;
end;
$$;

revoke all on function public.plano_vigente(uuid) from public, anon, authenticated;
revoke all on function public.analise_iniciar(uuid, text, text) from public, anon, authenticated;
revoke all on function public.analise_consumir(uuid, uuid) from public, anon, authenticated;
revoke all on function public.analise_concluir(uuid, uuid) from public, anon, authenticated;
revoke all on function public.analise_falha(uuid, uuid) from public, anon, authenticated;
revoke all on function public.analise_cancelar(uuid, uuid) from public, anon, authenticated;
revoke all on function public.ia_reservar(text, uuid, text, text, uuid, numeric, numeric) from public, anon, authenticated;
revoke all on function public.uso_resumo() from public, anon;
grant execute on function public.plano_vigente(uuid) to service_role;
grant execute on function public.analise_iniciar(uuid, text, text) to service_role;
grant execute on function public.analise_consumir(uuid, uuid) to service_role;
grant execute on function public.analise_concluir(uuid, uuid) to service_role;
grant execute on function public.analise_falha(uuid, uuid) to service_role;
grant execute on function public.analise_cancelar(uuid, uuid) to service_role;
grant execute on function public.ia_reservar(text, uuid, text, text, uuid, numeric, numeric) to service_role;
grant execute on function public.uso_resumo() to authenticated, service_role;
