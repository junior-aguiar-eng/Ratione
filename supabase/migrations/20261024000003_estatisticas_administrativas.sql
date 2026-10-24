-- Estatísticas agregadas: nenhum nome, e-mail ou identificador de conta no resultado.
-- SECURITY DEFINER somente para contar auth.users, sem conceder leitura dessa tabela ao serviço.
create function public.admin_estatisticas() returns jsonb
language sql stable security definer set search_path = '' as $$
  with periodo as (
    select (date_trunc('month',now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo') as inicio,
           ((date_trunc('month',now() at time zone 'America/Sao_Paulo')+interval '1 month') at time zone 'America/Sao_Paulo') as fim
  ), usos as (
    select u.* from public.ia_uso u cross join periodo p where u.criado_em>=p.inicio and u.criado_em<p.fim
  ), contas as (
    select u.created_at from auth.users u where u.deleted_at is null and not coalesce(u.is_anonymous,false)
  )
  select (public.admin_financeiro(0)-'clientes'-'total_clientes') || jsonb_build_object(
    'usuarios',jsonb_build_object(
      'total',(select count(*) from contas),
      'novos_no_mes',(select count(*) from contas cross join periodo p where created_at>=p.inicio and created_at<p.fim),
      'ativos_ia_no_mes',(select count(distinct usuario_id) from usos)
    ),
    'ia',(select jsonb_build_object(
      'execucoes',count(*),
      'geradas',count(*) filter(where situacao='gerada'),
      'cache',count(*) filter(where situacao='cache'),
      'problemas',count(*) filter(where situacao in ('falhou','recusada','invalida')),
      'reservadas',count(*) filter(where situacao='reservada'),
      'tokens_entrada',coalesce(sum(tokens_entrada) filter(where situacao not in ('cache','reservada')),0),
      'tokens_saida',coalesce(sum(tokens_saida) filter(where situacao not in ('cache','reservada')),0),
      'tokens_cache_leitura',coalesce(sum(tokens_cache_leitura) filter(where situacao not in ('cache','reservada')),0),
      'tokens_cache_escrita',coalesce(sum(tokens_cache_escrita) filter(where situacao not in ('cache','reservada')),0)
    ) from usos)
  );
$$;
revoke all on function public.admin_estatisticas() from public,anon,authenticated;
grant execute on function public.admin_estatisticas() to service_role;
