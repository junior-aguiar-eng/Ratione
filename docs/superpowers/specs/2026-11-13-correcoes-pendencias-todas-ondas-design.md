# Especificação — Plano Completo de Correções e Pendências (Ondas 1 a 4)

**Data:** 2026-11-13
**Base de referência:** `fix/ler-intimacao-data-do-ato-e-varios-prazos` (`5c1ebbc`) e diagnóstico em [relatorio-pendencias-e-bugs.md](file:///C:/Users/Boni%20Jr/.gemini/antigravity/brain/db809de5-defc-474b-8f64-405d05183410/relatorio-pendencias-e-bugs.md).

---

## 1. Visão Geral

Esta especificação consolida a arquitetura e os critérios de aceitação para corrigir todos os bugs confirmados e pendências operacionais, de domínio, de UX e de produto do monorepo Ratione, organizados em **quatro ondas independentes** em ordem decrescente de risco em produção:

1. **Onda 1 — Segurança, Cota de IA, RLS & Migrações:** fecha bypasses de cota e drenagem do fundo mensal de IA, uniformiza a barreira de contas suspensas (`conta_ativa_restritiva`) e privilégios SQL em tabelas privadas, evita falha de exclusão de conta sem `documentos`, bloqueia contas anônimas e payloads sem limite em streaming, aplica/alinha migrações pendentes (`20261026000001_tesemap_filtro_por_especie.sql`) e corrige o ciclo de cache/auth no cliente.
2. **Onda 2 — Bugs Funcionais Visíveis, UX & Motores de Domínio:** corrige perda de query string no login (`proxy.ts` + fluxos de auth), rótulo corrompido em `SugeridosDaQuestao`, gating e estado do `AnaliseDecisao`, truncamento `> 400` no NormaViva, bugs do motor `PrazoZero` (`modo: 'conservador'`, falsos positivos de ponto facultativo, cobertura de `dataEvento`, extensões estaduais e recesso), normalização/regex de citações, bugs de estado/acessibilidade React nas páginas e atualização das páginas públicas (`/metodologia`, `/privacidade`, demos, Home).
3. **Onda 3 — Cobrança Mercado Pago, Corpus/Parser & Infra/CI:** corrige `plano_vigente()` para ciclos nos dias 29–31, máquina de estados/assinatura/compensação/exclusão na integração Mercado Pago, cobertura de `NORMAS_CONHECIDAS` e escopos além de `'corpo'` no NormaViva/TeseMap, bugs de `vigenciafutura`/`nucleo`/`sinonimos`/`stj`, pontos cegos de `pseudonimizar.ts`/`segmentar.ts`, `TJDFT` em `lerIntimacao`, `core`/lembretes e ajustes em `deploy.yml`, `ci.yml`, `.env.example` e documentação.
4. **Onda 4 — Frentes Desligadas, Marcos de Produto & Pré-requisitos Jurídicos/Operacionais:** avalia e decide ativação das flags de IA (`IA_INTIMACAO_LIGADA`, `IA_PRECEDENTE_LIGADA`, `IA_RELACAO_LIGADA`), entrega UI/infra de `F5-10` (`ARGUMENTA_SALVAR_LIGADO`) e `F5-01`/`F5-02` (`ARGUMENTA_UPLOAD_LIGADO` + Docling), integra o plano existente de `Professor Pontes`, executa o checklist comercial/fiscal da `COBRANCA_LIGADA`, e consolida calendários 2027, frente jurídica (DPO/INPI/T-03/DPA) e próximas fases (`F5-03` Etapa 8, `F6`, `B1–B6`).

---

## 2. Restrições Globais (Global Constraints)

- **Monorepo e Toolchain:** TypeScript estrito (`pnpm typecheck` com zero erros), Node 26 / Next.js 16.4.5, React 19, runner de testes `tsx --test` (`node:test` + `node:assert/strict`) em todos os pacotes e `@electric-sql/pglite` em `@ratione/db`.
- **Integridade da suíte:** todos os **1.378 testes** existentes devem continuar passando após cada onda, sem relaxar asserções nem pular casos.
- **Rigor jurídico e zero alucinação:** nenhum prazo, norma, citação ou precedente inventado; onde a base não comprovar, emitir aviso neutro explícito.
- **Disciplina de banco/Supabase:** deploy **não** executa migrações automaticamente; toda nova migração em `supabase/migrations/` deve ser idempotente/ordenável por timestamp, usar `set search_path = ''` e `revoke all` quando aplicável, recriar `conta_ativa_restritiva` (`conta_tem_acesso()`) em tabelas privadas de usuário e adicionar entrada correspondente em [supabase/LEIA-ME.md](file:///c:/Users/Boni%20Jr/Desktop/Ratione/supabase/LEIA-ME.md).
- **Portões externos (Onda 4):** nenhuma flag de dados salvos, upload, IA em análise ou cobrança real entra ligada em produção sem cumprir o checklist específico (RIPD 0.2/0.3, avaliação humana, contador/CNPJ/MP PJ e Cloud Scheduler/Cloud Armor).

---

## 3. Planos Executáveis por Onda

| Onda | Plano | Independência |
|---|---|---|
| Índice Mestre | [2026-11-13-plano-mestre-correcoes.md](file:///c:/Users/Boni%20Jr/Desktop/Ratione/docs/superpowers/plans/2026-11-13-plano-mestre-correcoes.md) | Coordenação |
| Onda 1 | [2026-11-13-onda-1-seguranca-cota-rls.md](file:///c:/Users/Boni%20Jr/Desktop/Ratione/docs/superpowers/plans/2026-11-13-onda-1-seguranca-cota-rls.md) | Executável imediatamente |
| Onda 2 | [2026-11-13-onda-2-bugs-funcionais-ux-dominio.md](file:///c:/Users/Boni%20Jr/Desktop/Ratione/docs/superpowers/plans/2026-11-13-onda-2-bugs-funcionais-ux-dominio.md) | Executável em paralelo/sequência à Onda 1 |
| Onda 3 | [2026-11-13-onda-3-cobranca-corpus-infra.md](file:///c:/Users/Boni%20Jr/Desktop/Ratione/docs/superpowers/plans/2026-11-13-onda-3-cobranca-corpus-infra.md) | Pré-requisito antes de ligar cobrança/novas cargas |
| Onda 4 | [2026-11-13-onda-4-frentes-desligadas-expansoes.md](file:///c:/Users/Boni%20Jr/Desktop/Ratione/docs/superpowers/plans/2026-11-13-onda-4-frentes-desligadas-expansoes.md) | Gateada por avaliações, jurídico e negócio |
