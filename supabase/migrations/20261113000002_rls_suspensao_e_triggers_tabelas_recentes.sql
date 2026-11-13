-- Onda 1 (Segurança, RLS e limpeza):
-- 1) Estende a política restritiva `conta_ativa_restritiva` (suspensão de conta) para `documentos`, `casos` e
--    `analises_salvas`, com guarda `to_regclass` para ambientes onde `20261104..20261106` ainda não foram aplicadas.
-- 2) Cria `public.documentos_limite()` (10 arquivos por usuário) e o gatilho em `public.documentos` (se existir).
-- 3) Endurece `public.analises_salvas_limite()` (se `public.analises_salvas` existir) e `public.limpar_dados_vencidos()`
--    com `security definer set search_path = ''`, qualificação explícita e privilégios mínimos.

create or replace function public.documentos_limite() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Serializa as gravações do mesmo usuário para a contagem abaixo ser confiável
  perform pg_advisory_xact_lock(hashtextextended(new.usuario_id::text, 0));
  if (select count(*) from public.documentos where usuario_id = new.usuario_id) >= 10 then
    raise exception 'limite de 10 documentos por usuário' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

revoke all on function public.documentos_limite() from public, anon, authenticated;

do $$
begin
  if to_regclass('public.documentos') is not null then
    drop policy if exists conta_ativa_restritiva on public.documentos;
    create policy conta_ativa_restritiva on public.documentos
      as restrictive for all to authenticated
      using ((select public.conta_tem_acesso()))
      with check ((select public.conta_tem_acesso()));

    drop trigger if exists documentos_limite on public.documentos;
    create trigger documentos_limite before insert on public.documentos
      for each row execute function public.documentos_limite();
  end if;

  if to_regclass('public.casos') is not null then
    drop policy if exists conta_ativa_restritiva on public.casos;
    create policy conta_ativa_restritiva on public.casos
      as restrictive for all to authenticated
      using ((select public.conta_tem_acesso()))
      with check ((select public.conta_tem_acesso()));
  end if;

  if to_regclass('public.analises_salvas') is not null then
    execute $fn$
      create or replace function public.analises_salvas_limite() returns trigger
      language plpgsql
      security definer
      set search_path = ''
      as $body$
      begin
        -- Serializa as gravações do mesmo usuário para a contagem abaixo ser confiável
        perform pg_advisory_xact_lock(hashtextextended(new.usuario_id::text, 0));
        if (select count(*) from public.analises_salvas where usuario_id = new.usuario_id) >= 10 then
          raise exception 'limite de 10 análises salvas por usuário' using errcode = 'P0001';
        end if;
        return new;
      end;
      $body$;
    $fn$;
    revoke all on function public.analises_salvas_limite() from public, anon, authenticated;

    drop policy if exists conta_ativa_restritiva on public.analises_salvas;
    create policy conta_ativa_restritiva on public.analises_salvas
      as restrictive for all to authenticated
      using ((select public.conta_tem_acesso()))
      with check ((select public.conta_tem_acesso()));
  end if;
end;
$$;

create or replace function public.limpar_dados_vencidos()
returns jsonb
language plpgsql
security definer
set search_path = ''
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
