-- F3-04: redações anteriores de um dispositivo (consulta temporal, diff e linha do tempo).
-- Até aqui `versoes_dispositivo` tinha UMA linha por dispositivo: a redação vigente. Agora um dispositivo pode ter também a(s) redação(ões)
-- anterior(es), com `vigente_ate` preenchido. Só entra redação anterior com texto lido de fonte oficial: hoje, o texto TACHADO da página anotada
-- do Planalto (`fonte_do_texto = 'tachado_planalto'`), conferido ou não pelo revisor jurídico (`conferida_por` e `conferida_em`).
-- A tela avisa quando a redação anterior ainda não foi conferida. O texto vigente continua vindo da versão compilada (`compilado`).

alter table public.versoes_dispositivo
  add column fonte_do_texto text not null default 'compilado' check (fonte_do_texto in ('compilado', 'tachado_planalto')),
  add column conferida_por text,
  add column conferida_em date,
  add constraint versoes_dispositivo_conferida_junto check ((conferida_por is null) = (conferida_em is null));

-- No máximo uma redação vigente (sem `vigente_ate`) por dispositivo; as anteriores têm fim.
create unique index versoes_dispositivo_vigente_idx on public.versoes_dispositivo (dispositivo_id) where vigente_ate is null;
