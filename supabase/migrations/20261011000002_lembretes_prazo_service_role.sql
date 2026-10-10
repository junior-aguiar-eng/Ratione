-- F2-10 (correção): o papel `service_role`, que o envio diário usa, não recebe SELECT nem UPDATE automaticamente nas tabelas novas do Supabase
-- (em produção ele nasce só com REFERENCES, TRIGGER e TRUNCATE). A RLS é ignorada por ele, mas o privilégio de tabela é preciso.
-- Privilégio mínimo: ler os lembretes e atualizar apenas as duas marcas de envio. Ele não cria, não apaga e não altera título nem data.
grant select on public.lembretes_prazo to service_role;
grant update (enviado_3_dias_em, enviado_1_dia_em) on public.lembretes_prazo to service_role;
