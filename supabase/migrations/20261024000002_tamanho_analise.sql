-- F8-04: apenas a quantidade de parágrafos, nunca o conteúdo da decisão ou páginas estimadas.
-- Novas requisições usam a função complementar; a função anterior continua compatível.
alter table public.analises add column paragrafos integer;
alter table public.analises add constraint analises_paragrafos_validos
  check (paragrafos is null or (tipo in ('rapida','completa') and paragrafos between 1 and 800));

create function public.analise_iniciar_com_tamanho(p_usuario uuid, p_tipo text, p_rotulo text default null, p_paragrafos integer default null)
returns table (ok boolean, motivo text, analise_id uuid, restantes integer, plano text, renova_em timestamptz)
language plpgsql security definer set search_path = '' as $$
declare
  inicio record;
begin
  if p_paragrafos is not null and (p_paragrafos < 1 or p_paragrafos > 800 or p_tipo not in ('rapida','completa')) then
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
revoke all on function public.analise_iniciar_com_tamanho(uuid,text,text,integer) from public,anon,authenticated;
grant execute on function public.analise_iniciar_com_tamanho(uuid,text,text,integer) to service_role;
