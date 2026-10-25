-- Limpeza por prazo: o banco guarda só o estritamente necessário (decisão do responsável, 25/10/2026).
-- A conta, o perfil, os registros salvos e os aceites dos Termos não expiram (saem com a exclusão da conta).
-- Prazos, escolhidos pela função que o dado ainda tem:
--   ia_uso                  13 meses  cota do plano, custo e painel; cobre o histórico de 12 meses dos planos pagos
--   analises                13 meses  tela "Meu uso"
--   lembretes_prazo         30 dias depois do vencimento (o aviso já não tem função)
--   mp_eventos              90 dias   só evita processar duas vezes o mesmo aviso do Mercado Pago
--   admin_acesso_eventos    12 meses  trilha de suspensão e reativação
-- Cobranças e assinaturas ficam fora: dependem do prazo legal fiscal, a definir quando a cobrança ligar.

create function public.limpar_dados_vencidos()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_hoje date := (now() at time zone 'America/Sao_Paulo')::date;
  v_ia_uso bigint;
  v_analises bigint;
  v_lembretes bigint;
  v_mp bigint;
  v_admin bigint;
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

  return jsonb_build_object(
    'ia_uso', v_ia_uso,
    'analises', v_analises,
    'lembretes_prazo', v_lembretes,
    'mp_eventos', v_mp,
    'admin_acesso_eventos', v_admin
  );
end;
$$;

-- Só o servidor (e o agendador do banco) executa; nenhum usuário apaga o próprio histórico por aqui,
-- porque a cota do plano é contada a partir dessas linhas.
revoke all on function public.limpar_dados_vencidos() from public, anon, authenticated;
grant execute on function public.limpar_dados_vencidos() to service_role;

-- Agendamento diário, às 06:17 UTC (03:17 em Brasília), pelo pg_cron do Supabase. Onde o pg_cron não existe
-- (o banco de teste), nada é agendado e a função continua disponível para ser chamada por outro meio.
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron with schema pg_catalog;
    perform cron.schedule('limpeza-por-prazo', '17 6 * * *', 'select public.limpar_dados_vencidos()');
  else
    raise notice 'pg_cron indisponível: agende public.limpar_dados_vencidos() por outro meio';
  end if;
end;
$$;
