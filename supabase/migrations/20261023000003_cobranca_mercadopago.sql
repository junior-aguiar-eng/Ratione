-- F8-05 (docs/produto/PLANOS_E_COBRANCA.md §7): estrutura da cobrança com o Mercado Pago, em modo de TESTE e DESLIGADA por padrão.
-- Nada aqui liga a cobrança: quem liga é o servidor (COBRANCA_LIGADA) e, em teste, só para e-mails de uma lista. Esta migração só prepara o banco:
-- - `planos.preco_mensal_centavos`: o preço de cada plano pago, vazio até o responsável decidir (sem preço, ninguém consegue assinar).
-- - `assinaturas` ganha o vínculo com o Mercado Pago (id e situação da assinatura de lá), o valor e o ambiente (`teste` ou `producao`).
--   Um usuário tem no máximo UMA assinatura em curso (pendente, ativa, em atraso ou pausada).
-- - `cobrancas`: cada cobrança que o Mercado Pago faz (valor, situação, meio, data), lida pelo cliente em "Meu uso".
-- - `mp_eventos`: cada aviso (webhook) recebido, para não processar o mesmo duas vezes e para auditoria.
-- - Funções só do servidor: criar assinatura pendente, vincular ao Mercado Pago, aplicar o que o Mercado Pago informou, registrar cobrança e evento.
-- Aplicar depois da 20261023000002. Não muda o comportamento do site enquanto a cobrança estiver desligada.
-- Ao ativar a cobrança de verdade (produção), apague o que foi feito em teste: delete from public.assinaturas where ambiente = 'teste';

alter table public.planos add column preco_mensal_centavos integer check (preco_mensal_centavos > 0);

alter table public.assinaturas
  add column ambiente text not null default 'teste' check (ambiente in ('teste', 'producao')),
  add column mp_assinatura_id text unique,
  add column mp_situacao text,
  add column valor_centavos integer check (valor_centavos > 0);
create unique index assinaturas_uma_em_curso on public.assinaturas (usuario_id) where situacao in ('pendente', 'ativa', 'em_atraso', 'pausada');

create table public.cobrancas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  assinatura_id uuid references public.assinaturas (id) on delete set null,
  mp_pagamento_id text not null unique,
  ambiente text not null check (ambiente in ('teste', 'producao')),
  valor_centavos integer not null check (valor_centavos >= 0),
  situacao text not null check (situacao in ('aprovada', 'pendente', 'rejeitada', 'reembolsada', 'cancelada')),
  meio text,
  criada_em timestamptz not null default now(),
  paga_em timestamptz
);
create index cobrancas_usuario on public.cobrancas (usuario_id, criada_em);

create table public.mp_eventos (
  id bigint generated always as identity primary key,
  ambiente text not null check (ambiente in ('teste', 'producao')),
  topico text not null,
  recurso_id text not null,
  request_id text,
  recebido_em timestamptz not null default now(),
  processado_em timestamptz,
  resultado text
);
-- O Mercado Pago reenvia o mesmo aviso com o mesmo x-request-id: o segundo não é processado de novo
create unique index mp_eventos_request on public.mp_eventos (ambiente, request_id) where request_id is not null;

alter table public.cobrancas enable row level security;
alter table public.mp_eventos enable row level security;
-- Tabelas novas nascem com todos os privilégios para anon e authenticated: reduz ao mínimo
revoke all on public.cobrancas, public.mp_eventos from anon, authenticated;
grant select on public.cobrancas to authenticated;
create policy cobrancas_leitura on public.cobrancas for select to authenticated using ((select auth.uid()) = usuario_id);
grant select on public.cobrancas, public.mp_eventos to service_role;
-- A tela do cliente lê o preço dos planos pelo servidor; o catálogo continua legível por todos, agora com o preço
-- (grant de leitura já existe para planos)

-- Cria a assinatura pendente de um usuário num plano pago. Erros (mensagem exata, o servidor traduz):
-- plano_invalido, preco_nao_definido, ja_assinante (já tem assinatura ativa, em atraso ou pausada).
-- Uma pendente anterior (checkout abandonado) é encerrada e seu id no Mercado Pago volta em `antigas`, para o servidor cancelá-la lá também.
create function public.assinatura_criar_pendente(p_usuario uuid, p_plano text, p_ambiente text)
returns table (assinatura_id uuid, valor_centavos integer, antigas text[])
language plpgsql
security definer
set search_path = ''
as $$
declare
  preco integer;
  novo uuid;
  velhas text[];
begin
  if p_plano not in ('essencial', 'profissional') then
    raise exception 'plano_invalido';
  end if;
  perform pg_advisory_xact_lock(hashtext('assinatura:' || p_usuario::text));

  select p.preco_mensal_centavos into preco from public.planos p where p.id = p_plano;
  if preco is null then
    raise exception 'preco_nao_definido';
  end if;
  if exists (select 1 from public.assinaturas a where a.usuario_id = p_usuario and a.situacao in ('ativa', 'em_atraso', 'pausada')) then
    raise exception 'ja_assinante';
  end if;

  select coalesce(array_agg(a.mp_assinatura_id) filter (where a.mp_assinatura_id is not null), '{}') into velhas
    from public.assinaturas a where a.usuario_id = p_usuario and a.situacao = 'pendente';
  update public.assinaturas set situacao = 'cancelada', atualizada_em = now() where usuario_id = p_usuario and situacao = 'pendente';

  insert into public.assinaturas (usuario_id, plano_id, situacao, ambiente, valor_centavos)
    values (p_usuario, p_plano, 'pendente', p_ambiente, preco)
    returning id into novo;
  return query select novo, preco, velhas;
end;
$$;

create function public.assinatura_vincular_mp(p_assinatura uuid, p_mp_id text) returns void
language sql
security definer
set search_path = ''
as $$
  update public.assinaturas set mp_assinatura_id = p_mp_id, atualizada_em = now() where id = p_assinatura;
$$;

-- Aplica o que o Mercado Pago informou sobre a assinatura. Regras:
-- - `cancelada` é definitiva: nada a tira de lá (o Mercado Pago não reativa assinatura cancelada).
-- - Ao passar de `pendente` para `ativa`, o ciclo começa agora; o fim do ciclo pago (`p_fim_do_ciclo`, a próxima cobrança) só é trocado quando vem preenchido.
-- Devolve a situação final.
create function public.assinatura_aplicar(p_assinatura uuid, p_situacao text, p_mp_situacao text, p_fim_do_ciclo timestamptz) returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  atual record;
  nova text;
begin
  if p_situacao not in ('pendente', 'ativa', 'em_atraso', 'pausada', 'cancelada') then
    raise exception 'situacao_invalida';
  end if;
  select a.situacao, a.ciclo_fim into atual from public.assinaturas a where a.id = p_assinatura for update;
  if not found then
    return null;
  end if;
  if atual.situacao = 'cancelada' then
    return 'cancelada';
  end if;
  update public.assinaturas set
      situacao = p_situacao,
      mp_situacao = p_mp_situacao,
      ciclo_inicio = case when atual.situacao = 'pendente' and p_situacao = 'ativa' then now() else ciclo_inicio end,
      ciclo_fim = coalesce(p_fim_do_ciclo, ciclo_fim),
      atualizada_em = now()
    where id = p_assinatura
    returning situacao into nova;
  return nova;
end;
$$;

-- Registra (ou atualiza) uma cobrança do Mercado Pago, pelo id do pagamento de lá
create function public.cobranca_registrar(
  p_assinatura uuid, p_mp_pagamento text, p_valor_centavos integer, p_situacao text, p_meio text, p_paga_em timestamptz
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  dono uuid;
  amb text;
begin
  select a.usuario_id, a.ambiente into dono, amb from public.assinaturas a where a.id = p_assinatura;
  if dono is null then
    raise exception 'assinatura_inexistente';
  end if;
  insert into public.cobrancas (usuario_id, assinatura_id, mp_pagamento_id, ambiente, valor_centavos, situacao, meio, paga_em)
    values (dono, p_assinatura, p_mp_pagamento, amb, p_valor_centavos, p_situacao, p_meio, p_paga_em)
    on conflict (mp_pagamento_id) do update set situacao = excluded.situacao, meio = excluded.meio, paga_em = excluded.paga_em, valor_centavos = excluded.valor_centavos;
end;
$$;

-- Registra um aviso recebido. Devolve o id, ou NULO se o mesmo aviso (mesmo x-request-id) já tinha chegado.
create function public.mp_evento_registrar(p_ambiente text, p_topico text, p_recurso_id text, p_request_id text) returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  novo bigint;
begin
  insert into public.mp_eventos (ambiente, topico, recurso_id, request_id)
    values (p_ambiente, p_topico, p_recurso_id, p_request_id)
    on conflict (ambiente, request_id) where request_id is not null do nothing
    returning id into novo;
  return novo;
end;
$$;

create function public.mp_evento_concluir(p_id bigint, p_resultado text) returns void
language sql
security definer
set search_path = ''
as $$
  update public.mp_eventos set processado_em = now(), resultado = left(p_resultado, 200) where id = p_id;
$$;

-- Aviso cujo processamento falhou: o registro é descartado para que o Mercado Pago possa reenviá-lo (o reenvio pode vir com o mesmo
-- x-request-id, e o registro duplicaria a proteção contra repetição e engoliria a nova tentativa). Só descarta o que não foi concluído.
create function public.mp_evento_descartar(p_id bigint) returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.mp_eventos where id = p_id and processado_em is null;
$$;

revoke all on function public.assinatura_criar_pendente(uuid, text, text) from public, anon, authenticated;
revoke all on function public.mp_evento_descartar(bigint) from public, anon, authenticated;
grant execute on function public.mp_evento_descartar(bigint) to service_role;
revoke all on function public.assinatura_vincular_mp(uuid, text) from public, anon, authenticated;
revoke all on function public.assinatura_aplicar(uuid, text, text, timestamptz) from public, anon, authenticated;
revoke all on function public.cobranca_registrar(uuid, text, integer, text, text, timestamptz) from public, anon, authenticated;
revoke all on function public.mp_evento_registrar(text, text, text, text) from public, anon, authenticated;
revoke all on function public.mp_evento_concluir(bigint, text) from public, anon, authenticated;
grant execute on function public.assinatura_criar_pendente(uuid, text, text) to service_role;
grant execute on function public.assinatura_vincular_mp(uuid, text) to service_role;
grant execute on function public.assinatura_aplicar(uuid, text, text, timestamptz) to service_role;
grant execute on function public.cobranca_registrar(uuid, text, integer, text, text, timestamptz) to service_role;
grant execute on function public.mp_evento_registrar(text, text, text, text) to service_role;
grant execute on function public.mp_evento_concluir(bigint, text) to service_role;
