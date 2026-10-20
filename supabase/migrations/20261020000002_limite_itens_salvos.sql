-- Teto de itens salvos por conta (1.000), no mesmo padrão do teto de lembretes: sem limite, uma conta (ou um script com a sessão dela)
-- poderia encher a tabela. O cliente reconhece a mensagem "limite de 1000 itens salvos" para avisar o usuário.

create function public.limitar_itens_salvos() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.itens_salvos where usuario_id = new.usuario_id) >= 1000 then
    raise exception 'limite de 1000 itens salvos por conta' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger itens_salvos_limite before insert on public.itens_salvos
for each row execute function public.limitar_itens_salvos();

revoke all on function public.limitar_itens_salvos() from public, anon, authenticated;
