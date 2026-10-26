-- Retenção fiscal (decidida em 26/10/2026; prazo de 5 anos PROVISÓRIO, o contador confirma antes de a cobrança ligar).
-- Antes, excluir a conta apagava `assinaturas` e `cobrancas` em cascata. Agora o registro financeiro de cada cobrança fica sem identificar a
-- pessoa (`usuario_id` vira nulo) e é apagado pela limpeza diária depois do prazo. O que sobra é só: id do pagamento no Mercado Pago, valor,
-- situação, meio, datas, ambiente e plano. Nenhuma tela nem política de leitura enxerga linha sem dono; só o servidor (`service_role`).
-- Dado de teste (`ambiente = 'teste'`) não tem valor fiscal: sem dono, sai na próxima limpeza.
-- Aplicar depois da 20261025000001. Não muda dado existente nem o comportamento do site enquanto a cobrança estiver desligada.

-- 1) `usuario_id` aceita nulo e, ao apagar a conta, vira nulo em vez de apagar a linha
do $$
declare
  c record;
begin
  for c in
    select conrelid::regclass::text as tabela, conname
    from pg_constraint
    where contype = 'f' and confrelid = 'auth.users'::regclass
      and conrelid in ('public.cobrancas'::regclass, 'public.assinaturas'::regclass)
  loop
    execute format('alter table %s drop constraint %I', c.tabela, c.conname);
  end loop;
end;
$$;

alter table public.cobrancas alter column usuario_id drop not null;
alter table public.assinaturas alter column usuario_id drop not null;
alter table public.cobrancas add constraint cobrancas_usuario_id_fkey foreign key (usuario_id) references auth.users (id) on delete set null;
alter table public.assinaturas add constraint assinaturas_usuario_id_fkey foreign key (usuario_id) references auth.users (id) on delete set null;

-- 2) Cobrança que chega depois da exclusão da conta (o Mercado Pago ainda cobrou) continua sendo registrada, sem dono. Antes, a assinatura
-- sumia junto com a conta e o aviso era ignorado; agora a assinatura fica, e recusar a cobrança faria o Mercado Pago reenviar para sempre.
create or replace function public.cobranca_registrar(
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
  if not found then
    raise exception 'assinatura_inexistente';
  end if;
  insert into public.cobrancas (usuario_id, assinatura_id, mp_pagamento_id, ambiente, valor_centavos, situacao, meio, paga_em)
    values (dono, p_assinatura, p_mp_pagamento, amb, p_valor_centavos, p_situacao, p_meio, p_paga_em)
    on conflict (mp_pagamento_id) do update set situacao = excluded.situacao, meio = excluded.meio, paga_em = excluded.paga_em, valor_centavos = excluded.valor_centavos;
end;
$$;

-- 3) A limpeza diária passa a apagar também o registro financeiro sem dono: de teste, na hora; de produção, depois de 5 anos.
create or replace function public.limpar_dados_vencidos()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_hoje date := (now() at time zone 'America/Sao_Paulo')::date;
  -- Prazo fiscal PROVISÓRIO: confirmar com o contador (para mudar, é só trocar aqui e aplicar de novo)
  v_prazo_fiscal interval := interval '5 years';
  v_ia_uso bigint;
  v_analises bigint;
  v_lembretes bigint;
  v_mp bigint;
  v_admin bigint;
  v_cobrancas bigint;
  v_assinaturas bigint;
begin
  -- ia_uso antes de analises: ia_uso.analise_id aponta para analises (on delete set null)
  delete from public.ia_uso where criado_em < now() - interval '13 months';
  get diagnostics v_ia_uso = row_count;

  delete from public.analises where criada_em < now() - interval '13 months';
  get diagnostics v_analises = row_count;

  delete from public.lembretes_prazo where vencimento < v_hoje - 30;
  get diagnostics v_lembretes = row_count;

  delete from public.mp_eventos where recebido_em < now() - interval '90 days';
  get diagnostics v_mp = row_count;

  delete from public.admin_acesso_eventos where criada_em < now() - interval '12 months';
  get diagnostics v_admin = row_count;

  -- Cobranças antes das assinaturas (cobrancas.assinatura_id aponta para assinaturas, on delete set null). Só linha SEM DONO: a de quem
  -- ainda tem conta não expira.
  delete from public.cobrancas where usuario_id is null and (ambiente = 'teste' or criada_em < now() - v_prazo_fiscal);
  get diagnostics v_cobrancas = row_count;

  delete from public.assinaturas where usuario_id is null and (ambiente = 'teste' or atualizada_em < now() - v_prazo_fiscal);
  get diagnostics v_assinaturas = row_count;

  return jsonb_build_object(
    'ia_uso', v_ia_uso,
    'analises', v_analises,
    'lembretes_prazo', v_lembretes,
    'mp_eventos', v_mp,
    'admin_acesso_eventos', v_admin,
    'cobrancas_sem_dono', v_cobrancas,
    'assinaturas_sem_dono', v_assinaturas
  );
end;
$$;

revoke all on function public.limpar_dados_vencidos() from public, anon, authenticated;
grant execute on function public.limpar_dados_vencidos() to service_role;
