-- Busca sem acento (F3-05 e F4-04). O dicionário `portuguese` do Postgres reduz ao radical mas NÃO tira acento: "honorarios advocaticios" não
-- achava "honorários advocatícios" (0 resultados contra 18 no CPC). Esta configuração põe o `unaccent` na frente do radical: o mesmo texto,
-- com ou sem acento, vira o mesmo lexema, e o `ts_headline` continua destacando o trecho ORIGINAL, acentuado.
-- A extensão `unaccent` é do Postgres e está disponível no Supabase; fica no schema `extensions`.

create extension if not exists unaccent with schema extensions;

create text search configuration public.portugues_sem_acento (copy = pg_catalog.portuguese);

alter text search configuration public.portugues_sem_acento
  alter mapping for hword, hword_part, word with extensions.unaccent, pg_catalog.portuguese_stem;
