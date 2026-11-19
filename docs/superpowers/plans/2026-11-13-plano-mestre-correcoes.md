# Plano Mestre de Correções e Pendências — Ratione (Ondas 1 a 4)

> **Spec de Arquitetura:** [2026-11-13-correcoes-pendencias-todas-ondas-design.md](file:///c:/Users/Boni%20Jr/Desktop/Ratione/docs/superpowers/specs/2026-11-13-correcoes-pendencias-todas-ondas-design.md)
> **Diagnóstico de Origem:** [relatorio-pendencias-e-bugs.md](file:///C:/Users/Boni%20Jr/.gemini/antigravity/brain/db809de5-defc-474b-8f64-405d05183410/relatorio-pendencias-e-bugs.md)

## Ordem Recomendada de Execução

| Ordem | Onda | Foco Principal | Migrações Novas / Pendentes | Status de Bloqueio | Plano Executável |
|---|---|---|---|---|---|
| **1** | **Onda 1** | Segurança, Bypass de Cota IA, RLS (`conta_ativa_restritiva`), exclusão resiliente, `tesemap_buscar`, streaming/sessão | `20261026000001` (aplicar) + `20261113000001..003` | Pronta para execução imediata | [2026-11-13-onda-1-seguranca-cota-rls.md](file:///c:/Users/Boni%20Jr/Desktop/Ratione/docs/superpowers/plans/2026-11-13-onda-1-seguranca-cota-rls.md) |
| **2** | **Onda 2** | `proxy.ts`, `"Cita Abrir no NormaViva"`, `AnaliseDecisao`, NormaViva `> 400`, PrazoZero (`conservador`/facultativo), citações, estado React, `/metodologia` & `/privacidade` | Nenhuma (apenas aplicação) | Pronta (pode rodar em paralelo parcial com Onda 1) | [2026-11-13-onda-2-bugs-funcionais-ux-dominio.md](file:///c:/Users/Boni%20Jr/Desktop/Ratione/docs/superpowers/plans/2026-11-13-onda-2-bugs-funcionais-ux-dominio.md) |
| **3** | **Onda 3** | `plano_vigente()` (dias 29–31), máquina de estados Mercado Pago, corpus NormaViva/TeseMap (28 normas/escopos), `pseudonimizar`/`segmentar`, `TJDFT`, `deploy.yml`/CI/docs | `20261113000004..006` | Pronta em código; pré-requisito para ligar Cobrança | [2026-11-13-onda-3-cobranca-corpus-infra.md](file:///c:/Users/Boni%20Jr/Desktop/Ratione/docs/superpowers/plans/2026-11-13-onda-3-cobranca-corpus-infra.md) |
| **4** | **Onda 4** | Avaliações IA F5-08, UI/Docling F5-10 & F5-01/02, [Professor Pontes](file:///c:/Users/Boni%20Jr/Desktop/Ratione/docs/superpowers/plans/2026-11-03-professor-pontes.md), ativação `COBRANCA_LIGADA`, calendários 2027, Jurídico (DPO/INPI/T-03), F5-03 Etapa 8 / F6 / ForgeLex | `20261026000002`, `20261104000001`, `20261105000001`, `20261106000001` (conforme ativações) | Gateada por avaliações, RIPD, contador e atos 2027 | [2026-11-13-onda-4-frentes-desligadas-expansoes.md](file:///c:/Users/Boni%20Jr/Desktop/Ratione/docs/superpowers/plans/2026-11-13-onda-4-frentes-desligadas-expansoes.md) |

## Sequência Canônica de Migrações SQL

1. **Já existentes no repo (verificar/aplicar em produção conforme `supabase/LEIA-ME.md`):**
   - `20261026000001_tesemap_filtro_por_especie.sql` (necessária imediatamente para filtro "Espécie" do `/tesemap` ou unificada via `20261113000003`)
   - `20261030000001_paragrafos_ate_1500.sql` (confirmar check no catálogo remoto)
   - `20261104000001_documentos.sql` (aplicar antes de ligar `ARGUMENTA_UPLOAD_LIGADO`; confirmar estado real atual no remoto)
   - `20261105000001_casos.sql` (aplicar para pastas em Meu espaço)
   - `20261106000001_analises_salvas.sql` (aplicar antes de ligar `ARGUMENTA_SALVAR_LIGADO`)
   - `20261026000002_retencao_fiscal.sql` (aplicar após confirmação contábil do prazo de 5 anos antes de ligar `COBRANCA_LIGADA`)
2. **Novas migrações propostas neste planejamento (em ordem estrita):**
   - `20261113000001_seguranca_ia_cotas_e_reservas.sql` *(Onda 1 — Task 1.1)*
   - `20261113000002_rls_suspensao_e_triggers_tabelas_recentes.sql` *(Onda 1 — Task 1.3; requer `documentos`, `casos`, `analises_salvas` existentes ou aplicação conjunta)*
   - `20261113000003_tesemap_busca_consulta_vazia.sql` *(Onda 1 — Task 1.5)*
   - `20261113000004_plano_vigente_fim_de_mes.sql` *(Onda 3 — Task 3.1)*
   - `20261113000005_cobranca_maquina_de_estados.sql` *(Onda 3 — Task 3.2)*
   - `20261113000006_resolver_destinos_todos_escopos.sql` *(Onda 3 — Task 3.3)*
