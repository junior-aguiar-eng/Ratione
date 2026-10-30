-- F5/F8-04: o limite de parágrafos de uma análise sobe de 800 para 1.500.
-- O limite de caracteres da decisão subiu de 21.000 para 70.000 em 30/10/2026, e texto colado de PDF vira muitos parágrafos curtos
-- (um acórdão de 15 mil caracteres chegou a 180), então 800 passaria a recusar decisões que cabem no limite de caracteres.
-- ORDEM: aplicar esta migração ANTES de publicar o código que passa MAX_PARAGRAFOS de 800 para 1.500; o inverso faria toda análise
-- com 801 a 1.500 parágrafos falhar ao iniciar. Registros existentes (no máximo 800) continuam válidos.
alter table public.analises drop constraint analises_paragrafos_validos;
alter table public.analises add constraint analises_paragrafos_validos
  check (paragrafos is null or (tipo in ('rapida','completa') and paragrafos between 1 and 1500));

create or replace function public.analise_iniciar_com_tamanho(p_usuario uuid, p_tipo text, p_rotulo text default null, p_paragrafos integer default null)
returns table (ok boolean, motivo text, analise_id uuid, restantes integer, plano text, renova_em timestamptz)
language plpgsql security definer set search_path = '' as $$
declare
  inicio record;
begin
  if p_paragrafos is not null and (p_paragrafos < 1 or p_paragrafos > 1500 or p_tipo not in ('rapida','completa')) then
    raise exception 'tamanho inválido';
  end if;
  -- Reutiliza integralmente a cota, reserva e verificação dos fundos. Atualização e reserva são atômicas.
  select * into inicio from public.analise_iniciar(p_usuario,p_tipo,p_rotulo);
  if inicio.ok and p_paragrafos is not null then
    update public.analises set paragrafos=p_paragrafos where id=inicio.analise_id and usuario_id=p_usuario;
  end if;
  return query select inicio.ok,inicio.motivo,inicio.analise_id,inicio.restantes,inicio.plano,inicio.renova_em;
end;
$$;
-- "create or replace" mantém os privilégios; repetir é inofensivo e deixa a migração conferível sozinha.
revoke all on function public.analise_iniciar_com_tamanho(uuid,text,text,integer) from public,anon,authenticated;
grant execute on function public.analise_iniciar_com_tamanho(uuid,text,text,integer) to service_role;
