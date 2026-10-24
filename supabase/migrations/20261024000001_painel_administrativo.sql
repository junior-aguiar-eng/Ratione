-- F8-04: painel SOMENTE LEITURA, sem ligar cobrança nem alterar os fundos.
-- Registro prospectivo de plano: o histórico anterior fica sem atribuição, sem adivinhar pela assinatura atual.
-- Aplicar depois de 20261023000003. Código novo só usa esta RPC no painel administrativo.
alter table public.ia_uso add column plano_id text references public.planos(id);
alter table public.cobrancas add column plano_id text references public.planos(id);
create index cobrancas_mes on public.cobrancas(criada_em);

create function public.registrar_plano_do_uso() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  new.plano_id := (select plano from public.plano_vigente(new.usuario_id));
  return new;
end;
$$;
create trigger ia_uso_registrar_plano before insert on public.ia_uso
for each row execute function public.registrar_plano_do_uso();

create function public.registrar_plano_da_cobranca() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  new.plano_id := (select plano_id from public.assinaturas where id = new.assinatura_id);
  return new;
end;
$$;
create trigger cobrancas_registrar_plano before insert on public.cobrancas
for each row execute function public.registrar_plano_da_cobranca();
revoke all on function public.registrar_plano_do_uso(), public.registrar_plano_da_cobranca() from public, anon, authenticated;

-- Agrega no banco: não sofre o limite de 1.000 linhas do PostgREST. Só metadados; sem documentos, respostas, e-mails ou nomes.
-- Não usa SECURITY DEFINER: exige privilégios de leitura do chamador (service_role), além do EXECUTE exclusivo.
create function public.admin_financeiro(p_pagina integer default 0) returns jsonb
language plpgsql stable security invoker set search_path = '' as $$
declare
  resultado jsonb;
begin
  if p_pagina is null or p_pagina < 0 or p_pagina > 1000000 then raise exception 'página inválida'; end if;
  with periodo as (
    select (date_trunc('month', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo') as inicio,
           ((date_trunc('month', now() at time zone 'America/Sao_Paulo') + interval '1 month') at time zone 'America/Sao_Paulo') as fim
  ), usos as (
    select u.usuario_id, u.fundo, coalesce(u.plano_id, 'sem_atribuicao') as plano, u.situacao, u.custo_usd
    from public.ia_uso u cross join periodo p
    where u.criado_em >= p.inicio and u.criado_em < p.fim and u.situacao <> 'cache'
  ), por_plano as (
    select plano,
      coalesce(sum(custo_usd) filter(where situacao <> 'reservada'), 0) as custo_real_usd,
      coalesce(sum(custo_usd) filter(where situacao = 'reservada'), 0) as reservado_usd
    from usos group by plano
  ), cobrancas as (
    select coalesce(c.plano_id, 'sem_atribuicao') as plano, c.ambiente, c.situacao, c.valor_centavos
    from public.cobrancas c cross join periodo p
    where c.criada_em >= p.inicio and c.criada_em < p.fim
  ), receita as (
    select plano,
      coalesce(sum(valor_centavos) filter(where ambiente='producao' and situacao='aprovada'), 0) as receita_centavos,
      coalesce(sum(valor_centavos) filter(where ambiente='producao' and situacao='reembolsada'), 0) as reembolsado_centavos
    from cobrancas group by plano
  ), planos as (
    select id as plano, ordem from public.planos
    union all select 'sem_atribuicao', 4
  ), linhas_plano as (
    select p.plano, coalesce(u.custo_real_usd,0) as custo_real_usd, coalesce(u.reservado_usd,0) as reservado_usd,
      coalesce(r.receita_centavos,0) as receita_centavos, coalesce(r.reembolsado_centavos,0) as reembolsado_centavos, p.ordem
    from planos p left join por_plano u on u.plano=p.plano left join receita r on r.plano=p.plano
  ), linhas_fundo as (
    select f.fundo, f.orcamento_mes_usd as orcamento_usd,
      coalesce(sum(u.custo_usd) filter(where u.situacao <> 'reservada'),0) as custo_real_usd,
      coalesce(sum(u.custo_usd) filter(where u.situacao='reservada'),0) as reservado_usd
    from public.ia_fundos f left join usos u on u.fundo=f.fundo group by f.fundo, f.orcamento_mes_usd
  ), clientes as (
    select usuario_id,
      coalesce(sum(custo_usd) filter(where situacao <> 'reservada'),0) as custo_real_usd,
      coalesce(sum(custo_usd) filter(where situacao='reservada'),0) as reservado_usd
    from usos group by usuario_id
  ), pagina as (
    select * from clientes order by custo_real_usd desc, usuario_id limit 20 offset p_pagina*20
  )
  select jsonb_build_object(
    'inicio', p.inicio, 'fim', p.fim,
    'planos', (select jsonb_agg(to_jsonb(l)-'ordem' order by l.ordem) from linhas_plano l),
    'fundos', (select jsonb_agg(to_jsonb(l) order by l.fundo) from linhas_fundo l),
    'teste_aprovado_centavos', (select coalesce(sum(valor_centavos) filter(where ambiente='teste' and situacao='aprovada'),0) from cobrancas),
    'clientes', (select coalesce(jsonb_agg(to_jsonb(l) order by l.custo_real_usd desc, l.usuario_id),'[]'::jsonb) from pagina l),
    'total_clientes', (select count(*) from clientes)
  ) into resultado from periodo p;
  return resultado;
end;
$$;
revoke all on function public.admin_financeiro(integer) from public, anon, authenticated;
grant execute on function public.admin_financeiro(integer) to service_role;
