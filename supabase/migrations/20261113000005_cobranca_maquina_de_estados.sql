-- Onda 3 (Cobrança Mercado Pago — Task 3.2): protege `public.assinatura_aplicar` contra regressões fora de ordem.
-- Um webhook atrasado com `pending` após a assinatura já estar `ativa`, `em_atraso` ou `pausada` não pode rebaixá-la
-- de volta para `pendente`. `cancelada` continua terminal. Mantém assinatura e privilégios (`service_role`).

create or replace function public.assinatura_aplicar(
  p_assinatura uuid,
  p_situacao text,
  p_mp_situacao text,
  p_fim_do_ciclo timestamptz
) returns text
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
  -- Webhook atrasado (`pending`) não pode regredir assinatura que já avançou além de `pendente`.
  if atual.situacao in ('ativa', 'em_atraso', 'pausada') and p_situacao = 'pendente' then
    return atual.situacao;
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

revoke all on function public.assinatura_aplicar(uuid, text, text, timestamptz) from public, anon, authenticated;
grant execute on function public.assinatura_aplicar(uuid, text, text, timestamptz) to service_role;
