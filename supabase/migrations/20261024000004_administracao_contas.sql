-- Suporte mínimo: pesquisa mascarada, suspensão no Auth e trilha sem conteúdo do usuário.
create table public.admin_acesso_eventos (
  id uuid primary key default gen_random_uuid(),
  ator_id uuid references auth.users(id) on delete set null,
  usuario_id uuid references auth.users(id) on delete set null,
  acao text not null check(acao in ('suspender','reativar')),
  situacao text not null default 'solicitada' check(situacao in ('solicitada','aplicada','falhou')),
  criada_em timestamptz not null default now(),
  check(ator_id is null or usuario_id is null or ator_id<>usuario_id)
);
alter table public.admin_acesso_eventos enable row level security;
revoke all on public.admin_acesso_eventos from public,anon,authenticated;
grant select,insert,update on public.admin_acesso_eventos to service_role;

create function public.admin_contas(p_busca text default '',p_pagina integer default 0) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare resultado jsonb;
begin
  if p_busca is null or length(p_busca)>120 or p_pagina is null or p_pagina<0 or p_pagina>1000000 then raise exception 'consulta inválida'; end if;
  with contas as (
    select u.id,
      case when u.email is null then 'Sem e-mail' else left(split_part(u.email,'@',1),2)||'***@'||split_part(u.email,'@',2) end as email_mascarado,
      u.created_at as criada_em,u.last_sign_in_at as ultimo_acesso,
      u.email_confirmed_at is not null as email_confirmado,u.banned_until as suspensa_ate
    from auth.users u where u.deleted_at is null and not coalesce(u.is_anonymous,false)
      and (p_busca='' or strpos(lower(coalesce(u.email,'')),lower(p_busca))>0 or strpos(u.id::text,lower(p_busca))>0)
  ), pagina as (select * from contas order by criada_em desc,id limit 20 offset p_pagina*20)
  select jsonb_build_object('total',(select count(*) from contas),'contas',coalesce((select jsonb_agg(to_jsonb(p) order by criada_em desc,id) from pagina p),'[]'::jsonb)) into resultado;
  return resultado;
end;
$$;
revoke all on function public.admin_contas(text,integer) from public,anon,authenticated;
grant execute on function public.admin_contas(text,integer) to service_role;

-- Um JWT emitido antes da suspensão ainda pode chegar ao PostgREST. A política consulta o estado atual.
create function public.conta_tem_acesso() returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from auth.users u where u.id=(select auth.uid()) and u.deleted_at is null and (u.banned_until is null or u.banned_until<=now()));
$$;
revoke all on function public.conta_tem_acesso() from public,anon;
grant execute on function public.conta_tem_acesso() to authenticated;

-- Esta RPC já era SECURITY DEFINER: precisa da mesma barreira explicitamente, além da RLS.
create or replace function public.uso_resumo()
returns table (plano text, plano_nome text, periodo text, inicio timestamptz, fim timestamptz, tipo text, quantidade integer, usadas integer, restantes integer)
language plpgsql stable security definer set search_path='' as $$
declare uid uuid := (select auth.uid()); v record;
begin
  if uid is null or not public.conta_tem_acesso() then return; end if;
  select * into v from public.plano_vigente(uid);
  return query
    select v.plano,p.nome,v.periodo,v.inicio,v.fim,c.tipo,c.quantidade,u.n,greatest(c.quantidade-u.n,0)
    from public.plano_cotas c join public.planos p on p.id=c.plano_id
    cross join lateral (
      select count(*)::integer as n from public.analises a
      where a.usuario_id=uid and a.tipo=c.tipo and a.criada_em>=v.inicio and a.criada_em<v.fim
        and (a.consumiu or (a.situacao='em_andamento' and a.criada_em>now()-interval '15 minutes'))
    ) u where c.plano_id=v.plano order by c.tipo;
end;
$$;
do $$
declare tabela record;
begin
  for tabela in select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relkind='r' and c.relrowsecurity
  loop
    execute format('create policy conta_ativa_restritiva on public.%I as restrictive for all to authenticated using ((select public.conta_tem_acesso())) with check ((select public.conta_tem_acesso()))',tabela.relname);
  end loop;
end;
$$;
