# Onda 4 — Frentes Desligadas, Produto, Jurídico e Expansões — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Destravar, implementar as partes faltantes (UI, Docling, Professor Pontes, calendários 2027) e validar os portões humanos, jurídicos e fiscais necessários antes de ligar as features hoje desligadas e iniciar F5-03 Etapa 8, F6 e integrações B1–B6.

**Architecture:** Cada frente segue um gate explícito: (1) avaliação humana/calibração das tarefas de IA já prontas no servidor, (2) entrega de UI/Cloud Scheduler/Docling das frentes com storage cifrado (`F5-10` e `F5-01`/`F5-02`), (3) execução do plano dedicado do Professor Pontes, (4) ativação comercial/fiscal da cobrança após correções da Onda 3, e (5) ampliação de calendários forenses 2027 e marcos de roadmap (`Fragilidades`, `F6`, `ForgeLex`).

**Tech Stack:** TypeScript, Next.js 16.4.5, React 19, Docling (serviço/CLI F5-02), Supabase Storage & Scheduler, Mercado Pago Sandbox, `@ratione/prazozero`.

**Spec:** [2026-11-13-correcoes-pendencias-todas-ondas-design.md](file:///c:/Users/Boni%20Jr/Desktop/Ratione/docs/superpowers/specs/2026-11-13-correcoes-pendencias-todas-ondas-design.md)

## Global Constraints

- Nenhuma feature com processamento de peças/arquivos (`F5-10`, `F5-01`/`F5-02`) ou cobrança real entra ligada antes de satisfazer seus pré-requisitos de RIPD, Cloud Armor / Cloud Scheduler, revisão jurídica (T-03) e validação contábil (`20261026000002_retencao_fiscal.sql`).
- O módulo `Professor Pontes` segue integralmente a especificação e plano já existentes em [2026-11-03-professor-pontes.md](file:///c:/Users/Boni%20Jr/Desktop/Ratione/docs/superpowers/plans/2026-11-03-professor-pontes.md).
- Calendários 2027 exigem portaria/ato oficial publicado por tribunal (nunca inferir feriado ou suspensão por estimativa).

## Review Focus

- **`IA_RELACAO_LIGADA` obteve 56% (14/25) nos positivos na medição de 06/11**: não ligar com o limiar atual sem calibrar prompt/fonte ou decidir escopo aceitável em avaliação objetiva → **coberto na Task 4.1**.
- **`IA_INTIMACAO_LIGADA` teve erro anterior entre "data do ato" e data da intimação**: só ligar após rodar a medição da versão v5 com amostra real (incorporando o fix de `TJDFT` da Task 3.4) → **coberto na Task 4.1**.
- **Ativação de `F5-10` (`ARGUMENTA_SALVAR_LIGADO`) sem `20261106000001_analises_salvas.sql` + `ANALISES_CHAVE` + scheduler**: quebraria gravação/limpeza de retenção; exige entrega de UI + infra antes da flag → **coberto na Task 4.2**.
- **Ativação de `F5-01`/`F5-02` (`ARGUMENTA_UPLOAD_LIGADO`) sem Cloud Armor, Docling e 5 condições do RIPD §7.1**: bloqueado por conformidade e disponibilidade → **coberto na Task 4.3**.
- **Calendários 2027 vs demonstração/produção**: apenas `TJRS` está coberto para 2027; os demais 57 tribunais precisam de ingestão oficial progressiva antes da virada de ano → **coberto na Task 4.6**.

---

### Task 4.1: Avaliar e decidir liberação das flags de IA (`IA_INTIMACAO_LIGADA`, `IA_PRECEDENTE_LIGADA`, `IA_RELACAO_LIGADA`)

**Files:**
- Run/Inspect: `apps/web/scripts/intimacoes.ts`, `apps/web/scripts/avaliacao.ts`, `apps/web/scripts/avaliar-relacao.ts`
- Modify: `apps/web/src/lib/ia/tarefas/lerIntimacao.ts` / `explicarPrecedente.ts` / `relacionarComOCaso.ts` (se calibração necessária)
- Modify: `apps/web/src/app/privacidade/page.tsx` e docs de avaliação

**Interfaces:**
- Consumes: scripts `pnpm --filter web intimacoes`, `pnpm --filter web avaliacao`, `pnpm --filter web avaliar-relacao`.
- Produces: relatório atualizado de medição (`v5` de `ler-intimacao`), leitura humana de amostra STF/STJ de `explicar-precedente` e plano de calibração ou decisão go/no-go de `relacionar-com-o-caso` (hoje 56% = 14/25 nos positivos).

- [ ] **Step 1: Rodar avaliação da `ler-intimacao` (v5) e `explicar-precedente` e registrar métricas**

Run: `pnpm --filter web intimacoes` e amostragem de `explicar-precedente` (exigindo `ANTHROPIC_API_KEY` configurada no ambiente local de avaliação).
Expected: gabarito conferido para distinguir "data do ato" vs "data da intimação" e acurácia registrada.

- [ ] **Step 2: Calibrar `relacionar-com-o-caso` (ou ajustar critérios de contexto de `noDoTeseMap`) se decidido subir de 56%, validando em `avaliar-relacao.ts` + `relacao.test.ts`**

- [ ] **Step 3: Atualizar documentação de Privacidade e habilitar variáveis no workflow somente para as frentes aprovadas**

Run: `pnpm --filter web exec tsx --test src/lib/avaliacao/*.test.ts`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/web/ docs/
git commit -m "chore(ia): registra avaliacoes F5-08 e calibra criterios para liberacao por flag"
```

---

### Task 4.2: Entregar UI completa, exportação LGPD e agendador da F5-10 (`ARGUMENTA_SALVAR_LIGADO`)

**Files:**
- Modify: `apps/web/src/app/argumenta/AnaliseDecisao.tsx` (botão/fluxo de salvar análise via `POST /api/analises-salvas`)
- Modify: `apps/web/src/app/meu-espaco/page.tsx` (seção de Análises Salvas + abertura/exclusão)
- Modify: `apps/web/src/components/` / páginas do NormaViva e TeseMap (bloco "Citado nas suas análises" consultando `GET /api/analises-salvas?citacao=...`)
- Modify: `apps/web/src/app/conta/page.tsx` (incluir análises salvas na exportação LGPD quando habilitado)
- Modify: `apps/web/src/app/privacidade/page.tsx` e `termos` (v1.3 conforme RIPD 0.3)
- Test: `apps/web/src/lib/analisesSalvas/analisesSalvas.test.ts`

**Interfaces:**
- Consumes: APIs existentes `/api/analises-salvas`, `/api/analises-salvas/[id]`, `/api/analises-salvas/limpar` e migration `20261106000001_analises_salvas.sql` (+ políticas RLS da Onda 1 `20261113000002`).
- Produces: UI end-to-end para salvar, reabrir e apagar análises com seleção de prazo (`30`/`90` dias ou enquanto tiver conta), bloco cruzado em dispositivo/tese e runbook de infra (`ANALISES_CHAVE`, Cloud Scheduler `ratione-analises-limpar`).

- [ ] **Step 1: Escrever teste de cliente/serviço garantindo serialização e validação do payload de salvamento completo (incluindo citações normativas e selos) + retorno da exportação**

- [ ] **Step 2: Rodar teste e confirmar falha antes da implementação de interface/helper**

Run: `pnpm --filter web exec tsx --test src/lib/analisesSalvas/analisesSalvas.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar os hooks/componentes de UI em `AnaliseDecisao.tsx`, `meu-espaco/page.tsx`, NormaViva/TeseMap e `conta/page.tsx`**

- [ ] **Step 4: Validar migração no Supabase (`20261106000001`), configurar `ANALISES_CHAVE` + Cloud Scheduler `ratione-analises-limpar`, obter aprovação RIPD 0.3 e rodar validação**

Run: `pnpm typecheck && pnpm test && pnpm --filter web build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/ docs/
git commit -m "feat(f5-10): conclui UI, exportacao LGPD e referencias cruzadas de analises salvas"
```

---

### Task 4.3: Entregar Docling (F5-02), UI de Upload e requisitos de borda da F5-01 (`ARGUMENTA_UPLOAD_LIGADO`)

**Files:**
- Modify/Create: serviço/adaptador de extração Docling (F5-02 conforme arquitetura em `docs/produto/ARGUMENTA.md`)
- Modify: `apps/web/src/app/argumenta/AnaliseDecisao.tsx` (ou painel dedicado de envio de PDF/DOCX via `POST /api/documentos` / `GET` / `DELETE`)
- Modify: `apps/web/src/app/privacidade/page.tsx` e checklist de infraestrutura (`Cloud Armor`, scheduler `ratione-documentos-limpar`)
- Test: `apps/web/src/lib/documentos/documentos.test.ts` e novos testes do extrator Docling

**Interfaces:**
- Consumes: rotas existentes `/api/documentos`, `/api/documentos/[id]`, `/api/documentos/limpar` e `20261104000001_documentos.sql` (+ RLS Onda 1).
- Produces: pipeline texto extraído -> pseudonimização local/segura -> entrada de parágrafos do Argumenta, sujeito às 5 condições do RIPD §7.1, rate limit na borda via Cloud Armor e confirmação do Cloud Scheduler `ratione-documentos-limpar`.

- [ ] **Step 1: Especificar contrato de entrada/saída do adaptador Docling (F5-02) e escrever testes unitários com mocks de PDF/DOCX válidos e malformados**

- [ ] **Step 2: Rodar teste do adaptador Docling para confirmar falha inicial**

- [ ] **Step 3: Implementar extrator F5-02, UI de upload em `Argumenta` e validar checklist de borda/RIPD §7.1 antes de ligar `ARGUMENTA_UPLOAD_LIGADO=sim`**

- [ ] **Step 4: Rodar `pnpm typecheck && pnpm test && pnpm --filter web build`**

- [ ] **Step 5: Commit**

```bash
git add apps/web/ docs/
git commit -m "feat(f5-01,f5-02): implementa extrator Docling e UI de upload de documentos"
```

---

### Task 4.4: Executar o módulo Professor Pontes (plano dedicado existente)

**Files:**
- Follow verbatim: [2026-11-03-professor-pontes.md](file:///c:/Users/Boni%20Jr/Desktop/Ratione/docs/superpowers/plans/2026-11-03-professor-pontes.md)
- Guarantee alignment with Global Constraints: qualquer nova tabela/migração do Professor Pontes deve incluir `conta_ativa_restritiva` e entrada em `supabase/LEIA-ME.md`, e o envio ao `deploy.yml` deve respeitar desacoplamento de `ANTHROPIC_API_KEY` (Task 3.5).

- [ ] **Step 1: Executar todas as tasks de [2026-11-03-professor-pontes.md](file:///c:/Users/Boni%20Jr/Desktop/Ratione/docs/superpowers/plans/2026-11-03-professor-pontes.md) seguindo TDD passo a passo**

- [ ] **Step 2: Conferir que `conta_ativa_restritiva` e `supabase/LEIA-ME.md` contemplam eventuais tabelas/RPCs adicionadas**

- [ ] **Step 3: Rodar `pnpm typecheck && pnpm test && pnpm --filter web build`**

---

### Task 4.5: Checklist comercial/fiscal e ativação da Cobrança (`COBRANCA_LIGADA` / F8-05)

**Files:**
- Depends on: Tasks 3.1 e 3.2 (Onda 3) já mescladas e aplicadas no banco remoto.
- Apply SQL: `supabase/migrations/20261026000002_retencao_fiscal.sql` (após confirmação do prazo `v_prazo_fiscal = 5 years` com o contador).
- External/Ops checklist:
  - [ ] Abertura de ME / Simples Nacional com contador + CNAE + emissão de NFS-e.
  - [ ] Conta PJ Mercado Pago + chaves/webhook configurados no secret manager do Cloud Run.
  - [ ] Definição de preços finais em `public.planos.preco_mensal_centavos`.
  - [ ] Teste ponta a ponta em **sandbox real** do Mercado Pago (assinar, webhook aprovado, atrasado/falho, cancelar, excluir conta).
  - [ ] Limpar registros de teste (`delete from public.assinaturas where ambiente = 'teste';`) e ligar `COBRANCA_LIGADA=sim` primeiro para allowlist, depois geral.

---

### Task 4.6: Calendários 2027, frente Jurídica (DPO/INPI/T-03/DPA) e próximas fases de produto (`F5-03` Etapa 8, `F6`, `B1–B6`)

**Files:**
- Modify: `packages/prazozero/src/calendario/` (inclusão de atos oficiais 2027 e pendências 2026: `TSE`, `TRT13`, `TRT18`, `TJRJ`, `TJMS`, `TJPB`, `TJAL`, feriados estaduais de ~14 Estados)
- Test: `packages/prazozero/src/motor/cenarios.test.ts` e `packages/prazozero/src/calendario/nucleo.test.ts`

- [ ] **Step 1: Completar selos 2026 (`TSE`, `TRT13`, `TRT18`, `TJRJ`, `TJMS`, `TJPB`, `TJAL`) à medida que atos oficiais estiverem disponíveis/verificados e ingerir calendários 2027 dos 57 tribunais restantes além de `TJRS` com citação exata da fonte oficial e teste TDD por tribunal**

- [ ] **Step 2: Conduzir trilha jurídica e marca (`docs/PLANO.md` T-02, T-03):**
  - Designar Encarregado pelo Tratamento de Dados (DPO) e publicar contato.
  - Revisar minutas de Termos e Política de Privacidade com advogado (T-03) e aprovar RIPD 0.2/0.3.
  - Executar pesquisa de marca no INPI por radical e fonética (T-02).
  - Formalizar DPA e política de retenção zero com a Anthropic + conferir recarga automática e teto mensal no console da Anthropic.

- [ ] **Step 3: Especificar e planejar as próximas fases quando as Ondas 1–3 estiverem em produção:**
  - `F5-03 Etapa 8` (Fragilidades: taxonomia jurídica + gabarito humano antes de código).
  - `F6` (Integração entre módulos).
  - `B1–B6` (Integrações com ForgeLex — já desbloqueadas em auth após Task 2.1).

---

### Handoff & Verificação Final da Onda 4

- [ ] Cada frente desta onda deve ser promovida com PR próprio apenas quando seus pré-requisitos de avaliação/jurídico/infra estiverem assinalados.
- [ ] Validação contínua obrigatória após cada entrega: `pnpm typecheck && pnpm test && pnpm --filter web build`.

**Sugestão de execução:** executar uma subfrente por vez via **Native** (`superpowers:executing-plans`) ou **Subagent-driven** à medida que os portões externos (avaliações F5-08, RIPD, contador/PJ, atos 2027) forem destravados.
