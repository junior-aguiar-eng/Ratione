-- Onda 3 (Cobrança/Planos — Task 3.1): corrige o cálculo da janela mensal `[inicio, fim)` em `public.plano_vigente(uuid)`.
-- Bug anterior: `age(now(), s.ciclo_inicio)` + `meses * interval '1 month'` encolhia a âncora em meses curtos
-- (ex.: `ciclo_inicio` em 31/01 virava 28/02..28/03 em março), deixando `now() >= v.fim` no dia 29/03.
-- Agora a âncora sempre usa `date_trunc('month', inicio_br) + k meses` com dia `least(dia_ancora, ultimo_dia_do_mes)`
-- e ajusta `k` até garantir `inicio <= p_agora < fim`. Idempotente; sem mudança de tabelas ou dados.

create or replace function public.janela_mensal_do_ciclo(
  p_ciclo_inicio timestamptz,
  p_agora timestamptz default now()
)
returns table (inicio timestamptz, fim timestamptz)
language plpgsql
stable
set search_path = ''
as $$
declare
  inicio_br timestamp := (p_ciclo_inicio at time zone 'America/Sao_Paulo');
  agora_br timestamp := (p_agora at time zone 'America/Sao_Paulo');
  dia_ancora integer := extract(day from inicio_br)::integer;
  hora_ancora interval := inicio_br - date_trunc('day', inicio_br);
  mes_inicio timestamp := date_trunc('month', inicio_br);
  k integer;
  ini timestamptz;
  prox timestamptz;
  mes_base timestamp;
  ultimo_dia integer;
begin
  k := greatest(
    0,
    (extract(year from agora_br)::integer - extract(year from inicio_br)::integer) * 12
      + (extract(month from agora_br)::integer - extract(month from inicio_br)::integer)
  );

  mes_base := mes_inicio + make_interval(months => k);
  ultimo_dia := extract(day from (mes_base + interval '1 month' - interval '1 day'))::integer;
  ini := ((mes_base + make_interval(days => least(dia_ancora, ultimo_dia) - 1) + hora_ancora) at time zone 'America/Sao_Paulo');

  while k > 0 and ini > p_agora loop
    k := k - 1;
    mes_base := mes_inicio + make_interval(months => k);
    ultimo_dia := extract(day from (mes_base + interval '1 month' - interval '1 day'))::integer;
    ini := ((mes_base + make_interval(days => least(dia_ancora, ultimo_dia) - 1) + hora_ancora) at time zone 'America/Sao_Paulo');
  end loop;

  mes_base := mes_inicio + make_interval(months => k + 1);
  ultimo_dia := extract(day from (mes_base + interval '1 month' - interval '1 day'))::integer;
  prox := ((mes_base + make_interval(days => least(dia_ancora, ultimo_dia) - 1) + hora_ancora) at time zone 'America/Sao_Paulo');

  while prox <= p_agora loop
    k := k + 1;
    ini := prox;
    mes_base := mes_inicio + make_interval(months => k + 1);
    ultimo_dia := extract(day from (mes_base + interval '1 month' - interval '1 day'))::integer;
    prox := ((mes_base + make_interval(days => least(dia_ancora, ultimo_dia) - 1) + hora_ancora) at time zone 'America/Sao_Paulo');
  end loop;

  return query select ini, prox;
end;
$$;

revoke all on function public.janela_mensal_do_ciclo(timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.janela_mensal_do_ciclo(timestamptz, timestamptz) to service_role;

create or replace function public.plano_vigente(p_usuario uuid)
returns table (plano text, periodo text, inicio timestamptz, fim timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  s record;
  agora_br timestamp := (now() at time zone 'America/Sao_Paulo');
  ini timestamptz;
  fim_ciclo timestamptz;
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
    select j.inicio, j.fim into ini, fim_ciclo
      from public.janela_mensal_do_ciclo(s.ciclo_inicio, now()) j;
    return query select s.plano_id, 'mes'::text, ini, fim_ciclo;
  elsif found then
    return query select s.plano_id, 'semana'::text, (date_trunc('week', agora_br) at time zone 'America/Sao_Paulo'), ((date_trunc('week', agora_br) + interval '1 week') at time zone 'America/Sao_Paulo');
  else
    return query select 'gratuito'::text, 'semana'::text, (date_trunc('week', agora_br) at time zone 'America/Sao_Paulo'), ((date_trunc('week', agora_br) + interval '1 week') at time zone 'America/Sao_Paulo');
  end if;
end;
$$;

revoke all on function public.plano_vigente(uuid) from public, anon, authenticated;
grant execute on function public.plano_vigente(uuid) to service_role;
