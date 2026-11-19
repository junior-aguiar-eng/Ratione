# Onda 3 — Cobrança Mercado Pago, Corpus/Parser e Infra/CI — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir bugs bloqueantes da cobrança (antes de ativar `COBRANCA_LIGADA`), ampliar cobertura e precisão dos parsers/corpus (NormaViva, TeseMap, Argumenta, `lerIntimacao`, `core`), robustecer lembretes e alinhar CI/CD, `.env.example` e documentação.

**Architecture:** As correções atuam em quatro blocos independentes: (1) banco + adaptadores da cobrança Mercado Pago e ciclo mensal de assinaturas (`plano_vigente`), (2) corpus e resolvedores em `@ratione/normaviva` e `@ratione/tesemap`, (3) pseudonimização/segmentação em `@ratione/argumenta`, `lerIntimacao` e lembretes/core, e (4) workflows GitHub Actions, exemplos de ambiente e documentação operacional.

**Tech Stack:** TypeScript, PostgreSQL (`@electric-sql/pglite`), Next.js Route Handlers, Mercado Pago API, GitHub Actions, `tsx --test`.

**Spec:** [2026-11-13-correcoes-pendencias-todas-ondas-design.md](file:///c:/Users/Boni%20Jr/Desktop/Ratione/docs/superpowers/specs/2026-11-13-correcoes-pendencias-todas-ondas-design.md)

## Global Constraints

- Manter `pnpm typecheck`, `pnpm test` e `pnpm --filter web build` verdes em todo commit.
- Não ativar `COBRANCA_LIGADA` em produção nesta onda (apenas deixar código e máquina de estados prontos e testados para a Onda 4).
- Toda nova migração SQL de banco deve preservar dados de teste existentes e atualizar `supabase/LEIA-ME.md`.

## Review Focus

- **Assinatura criada nos dias 29, 30 ou 31 (ex.: `31/01`) consultada em `29/03`**: `plano_vigente()` nunca pode devolver janela `[inicio, fim)` inteira no passado com `now() >= v.fim` → **coberto na Task 3.1**.
- **Webhook fora de ordem do Mercado Pago (`authorized` seguido de `pending` atrasado) ou assinatura já cancelada no MP ao excluir conta**: `assinatura_aplicar` não pode rebaixar `ativa` -> `pendente`, e `encerrarAssinatura` não pode travar exclusão de conta se MP responder que já foi cancelada → **coberto na Task 3.2**.
- **Citação legal por número da lei que está no corpus (`"art. 5º da Lei nº 8.078/1990"`) e escopos fora de `'corpo'` (`ADCT`)**: devem resolver para o dispositivo real do NormaViva/TeseMap em vez de serem descartadas como `'externo'` → **coberto na Task 3.3**.
- **Pseudonimização de testemunhas, vítimas, menores, peritos, Fazenda/Estado, `OAB`, `RG MG-...` e `+55`**: nenhum dado pessoal visível nesses formatos pode passar por `temDadoPessoal` → **coberto na Task 3.4**.
- **`deploy.yml` com IA habilitada sem `IA_EXPLICACAO=sim` (ex.: Argumenta ativo sozinho)**: `ANTHROPIC_API_KEY` precisa continuar disponível ao serviço Cloud Run → **coberto na Task 3.5**.

---

### Task 3.1: Corrigir `plano_vigente()` para assinaturas iniciadas nos dias 29–31

**Files:**
- Create: `supabase/migrations/20261113000004_plano_vigente_fim_de_mes.sql`
- Modify: `supabase/LEIA-ME.md`
- Test: `packages/db/src/planos.test.ts`

**Interfaces:**
- Consumes: `public.plano_vigente(uuid)` (`supabase/migrations/20261023000001_planos_e_analises.sql`).
- Produces: cálculo da janela mensal `[inicio, fim)` ancorado no índice de mês inteiro `k` a partir de `date_trunc('month', ciclo_inicio_br) + k * interval '1 month'` com dia `least(extract(day from ciclo_inicio_br), ultimo_dia_do_mes)` em vez de `ciclo_inicio + meses * interval '1 month'` pós-`age()`, garantindo `v.inicio <= now() < v.fim` em todos os dias 28–31.

- [ ] **Step 1: Escrever teste que falha em `packages/db/src/planos.test.ts`**

Simular usuário com assinatura `'ativa'` `ciclo_inicio = '2026-01-31T15:00:00Z'` e consultar a lógica de janela em datas correspondentes a `2026-03-29` e `2026-02-28` (usando parametrização ou tabela temporária/função de cálculo com `ciclo_inicio` ajustado relativamente a `now()` para `~57 days ago` em mês de 28/29/30 dias — validando explicitamente que `inicio <= now() and now() < fim`).

- [ ] **Step 2: Rodar teste para confirmar falha**

Run: `pnpm --filter @ratione/db exec tsx --test src/planos.test.ts`
Expected: FAIL com `now() >= fim` quando o aniversário do mês anterior caiu em dia 28 e `now()` passou para dia 29.

- [ ] **Step 3: Criar `supabase/migrations/20261113000004_plano_vigente_fim_de_mes.sql` e atualizar `supabase/LEIA-ME.md`**

- [ ] **Step 4: Rodar `@ratione/db` completo**

Run: `pnpm --filter @ratione/db test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20261113000004_plano_vigente_fim_de_mes.sql supabase/LEIA-ME.md packages/db/src/planos.test.ts
git commit -m "fix(db,planos): corrige calculo da janela mensal em plano_vigente para dias 29 a 31"
```

---

### Task 3.2: Corrigir máquina de estados, webhook, fallback e compensação na cobrança Mercado Pago

**Files:**
- Create: `supabase/migrations/20261113000005_cobranca_maquina_de_estados.sql`
- Modify: `supabase/LEIA-ME.md`
- Modify: `apps/web/src/app/api/mercadopago/webhook/route.ts:20-45`
- Modify: `apps/web/src/lib/cobranca/processar.ts:20-60`
- Modify: `apps/web/src/app/api/cobranca/assinar/route.ts:45-67`
- Modify: `apps/web/src/app/api/cobranca/cancelar/route.ts:20-42`
- Modify: `apps/web/src/lib/cobranca/encerrar.ts:15-41`
- Test: `packages/db/src/cobranca.test.ts`
- Test: `apps/web/src/lib/cobranca/cobranca.test.ts`
- Test: `apps/web/src/lib/cobranca/encerrar.test.ts`

**Interfaces:**
- Consumes: `public.assinatura_aplicar(uuid, text, text, timestamptz)`, `cancelarAssinaturaNoMp`, `processarAvisoMp`, `encerrarAssinatura`.
- Produces:
  1. `assinatura_aplicar` impedindo transição regressiva de `ativa`/`em_atraso`/`pausada` -> `pendente` (mantendo `cancelada` terminal).
  2. Webhook usa estritamente `dataId` consistente entre assinatura (`assinaturaValida`) e processamento (não processar `corpo.data.id` se diferir de `query.get('data.id')` quando `data.id` assinado está na query).
  3. `subscription_authorized_payment` em `processar.ts`: tenta localizar assinatura por `mpId` e, se ausente, faz fallback por `external_reference` (`referencia`).
  4. Compensação simétrica: em `assinar/route.ts`, se `vincularAoMp` falhar após criar no MP, tenta cancelar o `preapproval` recém-criado no MP (logando erro se falhar); em `cancelar/route.ts`, usar transição segura garantindo cancelamento local e no MP; em `encerrar.ts`, tratar erro "já cancelada / not found" no MP ou falha temporária na exclusão de conta marcando `'cancelada'` localmente sem bloquear exclusão do usuário (logando aviso operacional quando MP precisar de reconciliação).

- [ ] **Step 1: Escrever testes que falham em `packages/db/src/cobranca.test.ts`, `cobranca.test.ts` e `encerrar.test.ts`**

- [ ] **Step 2: Rodar os testes para confirmar falha**

Run: `pnpm --filter @ratione/db exec tsx --test src/cobranca.test.ts && pnpm --filter web exec tsx --test src/lib/cobranca/*.test.ts`
Expected: FAIL.

- [ ] **Step 3: Criar `20261113000005_cobranca_maquina_de_estados.sql` e implementar correções nos handlers/serviços de cobrança**

- [ ] **Step 4: Rodar os testes de banco e cobrança**

Run: `pnpm --filter @ratione/db test && pnpm --filter web exec tsx --test src/lib/cobranca/*.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20261113000005_cobranca_maquina_de_estados.sql supabase/LEIA-ME.md packages/db/src/cobranca.test.ts apps/web/src/app/api/mercadopago/webhook/route.ts apps/web/src/lib/cobranca/processar.ts apps/web/src/app/api/cobranca/assinar/route.ts apps/web/src/app/api/cobranca/cancelar/route.ts apps/web/src/lib/cobranca/encerrar.ts apps/web/src/lib/cobranca/cobranca.test.ts apps/web/src/lib/cobranca/encerrar.test.ts
git commit -m "fix(cobranca): protege maquina de estados MP, webhook, fallback de referencia e compensacao de cancelamento"
```

---

### Task 3.3: Corrigir `normaviva` (`referencias.ts`, `vigencia.ts`, `atualizar.ts`, `nucleo.ts`, `sinonimos.ts`) e `tesemap` (`citacoes.ts`, `sumulas.ts`, `precedentes.ts`)

**Files:**
- Modify: `packages/normaviva/src/busca/referencias.ts:65-94`
- Modify: `packages/normaviva/src/vigenciafutura/vigencia.ts:28-36`
- Modify: `packages/normaviva/src/vigenciafutura/atualizar.ts`
- Modify: `packages/normaviva/src/nucleo.ts`
- Modify: `packages/normaviva/src/busca/sinonimos.ts`
- Modify: `packages/tesemap/src/banco/citacoes.ts:1-35`
- Modify: `packages/tesemap/src/stj/sumulas.ts:85-105`
- Modify: `packages/tesemap/src/stj/precedentes.ts:140-150`
- Create: `supabase/migrations/20261113000006_resolver_destinos_todos_escopos.sql`
- Modify: `supabase/LEIA-ME.md`
- Test: `packages/normaviva/src/index.test.ts`
- Test: `packages/normaviva/src/vigenciafutura/vigenciafutura.test.ts`
- Test: `packages/normaviva/src/busca/sinonimos.test.ts`
- Test: `packages/tesemap/src/banco/citacoes.test.ts`
- Test: `packages/tesemap/src/stj/sumulas-stj.test.ts`
- Test: `packages/tesemap/src/stj/stj.test.ts`

**Interfaces:**
- Consumes: catálogo de normas de `packages/normaviva/src/coleta/normas.ts`, extrator em `packages/normaviva/src/busca/referencias.ts`.
- Produces:
  1. `NORMAS_CONHECIDAS` alinhada às 28 normas do corpus + resolução de citações por número da lei (`"Lei nº 8.078/1990"`, `"Lei 14.133/2021"`) sem descartar como `'externo'` quando o ID está no catálogo.
  2. `packages/tesemap/src/banco/citacoes.ts` e `20261113000006` resolvendo todos os escopos válidos (incluindo `'adct'`, `'anexo'`, etc., além de `'corpo'`).
  3. `vigencia.ts`: normalizar whitespace do texto plano / encontrar índice real da cláusula em vez de `lastIndexOf(clausula.slice(0, 20))` frágil com quebras de linha; `atualizar.ts`: gerar `PERIODOS` dinamicamente até `anoAtual + 1` (ex.: 2027+).
  4. `nucleo.ts` & `sinonimos.ts`: suportar `alínea`/`item`/inciso com letra, siglas `CF`/`DL`/`EC`, e cálculo de offsets sobre strings mantendo posições compatíveis sem desvio por NFD.
  5. `stj/sumulas.ts` & `precedentes.ts`: ignorar `"Súmula N"` quando precedida/ligada a TFR/TST/TSE/TRF/STF em referências; reconhecer variantes de `cancelado` (ex.: `"Cancelada"` / `"Cancelado (Parcial)"` conforme CSV oficial ou regra estrita documentada).

- [ ] **Step 1: Escrever testes que falham cobrindo cada regra acima nos pacotes `normaviva` e `tesemap`**

- [ ] **Step 2: Rodar testes para confirmar falhas**

Run: `pnpm --filter @ratione/normaviva test && pnpm --filter @ratione/tesemap test`
Expected: FAIL nos casos recém-criados.

- [ ] **Step 3: Implementar as correções nos módulos de `@ratione/normaviva`, `@ratione/tesemap` e criar `20261113000006_resolver_destinos_todos_escopos.sql`**

- [ ] **Step 4: Rodar suítes completas `@ratione/normaviva`, `@ratione/tesemap` e `@ratione/db`**

Run: `pnpm --filter @ratione/normaviva test && pnpm --filter @ratione/tesemap test && pnpm --filter @ratione/db test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/normaviva/ packages/tesemap/ supabase/migrations/20261113000006_resolver_destinos_todos_escopos.sql supabase/LEIA-ME.md
git commit -m "fix(normaviva,tesemap): cobre 28 normas, leis por numero, escopos nao-corpo, vigencia, sinonimos e sumulas STJ"
```

---

### Task 3.4: Pseudonimização/segmentação em `@ratione/argumenta`, `TJDFT` em `lerIntimacao`, `@ratione/core` e `lembretes/enviar`

**Files:**
- Modify: `packages/argumenta/src/pseudonimizar.ts:20-85`
- Modify: `packages/argumenta/src/segmentar.ts`
- Modify: `apps/web/src/lib/ia/tarefas/lerIntimacao.ts:75-120`
- Modify: `packages/core/src/index.ts:10-55`
- Modify: `apps/web/src/app/api/lembretes/enviar/route.ts:35-92`
- Test: `packages/argumenta/src/decisao.test.ts`
- Test: `apps/web/src/lib/ia/tarefas/lerIntimacao.test.ts`
- Test: `packages/core/src/index.test.ts`
- Test: `apps/web/src/lib/lembretes.test.ts`

**Interfaces:**
- Produces:
  1. `pseudonimizar.ts`: ampliar rótulos de qualificação (`Testemunha`, `Vítima`, `Menor`, `Perito`, `Sócio`, `Fiador`) inclusive com travessão (`-`/`—`) sem `:`; impedir falso match de `ENTE_PUBLICO` em nomes comuns e cobrir `Fazenda`/`Estado d`; adicionar padrões para `OAB`, `RG MG-...`, `+55`, endereços `s/n`, `apto`, `Quadra`.
  2. `segmentar.ts`: se uma linha individual ultrapassar `200` caracteres dentro de um bloco, manter essa linha separada sem abortar o reagrupamento das demais linhas curtas adjacentes.
  3. `lerIntimacao.ts`: incluir `'TJDFT': 'TJDF'` no mapa de detecção em `trechoIdentificaTribunal`.
  4. `packages/core/src/index.ts`: completar `TRF1` ou documentar multi-UF explícita (`ucs/regiao`), alinhar `EsferaJudicialSchema` / validadores de data ISO e URL quando aplicável sem quebrar catálogo existente.
  5. `lembretes/enviar/route.ts`: checar e logar `error` ao chamar `liberar` e processar envios com concorrência limitada (ex.: lotes de 5–10 com `Promise.allSettled`) para não estourar timeout HTTP.

- [ ] **Step 1: Escrever testes que falham para `pseudonimizar`, `segmentar`, `TJDFT` em `lerIntimacao` e `lembretes`**

- [ ] **Step 2: Rodar testes para confirmar falhas**

Run: `pnpm --filter @ratione/argumenta test && pnpm --filter @ratione/core test && pnpm --filter web exec tsx --test src/lib/ia/tarefas/lerIntimacao.test.ts src/lib/lembretes.test.ts`
Expected: FAIL nos novos casos.

- [ ] **Step 3: Implementar as correções nos arquivos listados**

- [ ] **Step 4: Rodar os testes de `argumenta`, `core`, `lerIntimacao` e `lembretes`**

Run: `pnpm --filter @ratione/argumenta test && pnpm --filter @ratione/core test && pnpm --filter web exec tsx --test src/lib/ia/tarefas/lerIntimacao.test.ts src/lib/lembretes.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/argumenta/ packages/core/ apps/web/src/lib/ia/tarefas/lerIntimacao.ts apps/web/src/lib/ia/tarefas/lerIntimacao.test.ts apps/web/src/app/api/lembretes/enviar/route.ts apps/web/src/lib/lembretes.test.ts
git commit -m "fix(argumenta,ia,core,lembretes): amplia pseudonimizacao, segmentacao por linha, TJDFT e lote de lembretes"
```

---

### Task 3.5: Alinhar `deploy.yml`, `ci.yml`, `.env.example` e documentação desatualizada

**Files:**
- Modify: `.github/workflows/deploy.yml:65-119`
- Modify: `.github/workflows/ci.yml`
- Modify: `apps/web/.env.example`
- Modify: `docs/PLANO.md`
- Modify: `docs/produto/IA_TAREFAS.md`
- Modify: `packages/prazozero/CALENDARIOS_POR_TRIBUNAL.md` *(ou caminho exato de `CALENDARIOS_POR_TRIBUNAL.md` verificado com `rg --files`)*

**Interfaces:**
- Produces:
  1. `deploy.yml`: anexar `ANTHROPIC_API_KEY` quando **qualquer** módulo de IA estiver ativo (`vars.IA_EXPLICACAO == 'sim' || vars.IA_ARGUMENTA == 'sim' || ...` ou via flag dedicada), e repassar quando configuradas as variáveis `ARGUMENTA_SALVAR_LIGADO`, `ANALISES_CHAVE`, `LEMBRETES_REMETENTE`, `DOCUMENTOS_RETENCAO_DIAS`.
  2. `ci.yml`: garantir etapa explícita de verificação de qualidade (`typecheck`, `test`, `build`, `git diff --check` + check de lint caso configurado).
  3. `apps/web/.env.example`: documentar todas as variáveis ativas/preparadas (IA, `RATIONE_ADMIN_USUARIO_IDS`, Mercado Pago, Lembretes, `ANALISES_CHAVE`, `DOCUMENTOS_*`).
  4. Atualizar referências antigas de Node 24 -> Node 26, números validados de **415** cenários no PrazoZero, e limites atuais em `IA_TAREFAS.md`.

- [ ] **Step 1: Localizar arquivos de documentação exatos (`CALENDARIOS_POR_TRIBUNAL.md`, docs mencionando `Node 24`)**

Run: `rg -l "Node 24|node 24|3\.000|4\.000" docs packages supabase && rg --files -g "*CALENDARIOS_POR_TRIBUNAL*"`
Expected: lista exata de arquivos para edição sem adivinhar caminhos.

- [ ] **Step 2: Editar `.github/workflows/deploy.yml`, `.github/workflows/ci.yml`, `apps/web/.env.example` e os docs localizados**

- [ ] **Step 3: Validar sintaxe e checagem geral**

Run: `pnpm typecheck && pnpm test && pnpm --filter web build && git diff --check`
Expected: `exit 0` em todas as verificações.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ apps/web/.env.example docs/ packages/
git commit -m "chore(ci,docs): desacopla ANTHROPIC_API_KEY no deploy, atualiza .env.example e docs operacionais"
```

---

### Handoff & Verificação Final da Onda 3

- [ ] Rodar `pnpm typecheck && pnpm test && pnpm --filter web build`.
- [ ] Aplicar no Supabase SQL Editor (após revisão) `20261113000004`, `20261113000005` e `20261113000006`.

**Sugestão de execução:** **Subagent-driven**, pois Tasks 3.1/3.2 (DB/Cobrança), 3.3 (NormaViva/TeseMap), 3.4 (Argumenta/Intimação/Lembretes) e 3.5 (CI/Docs) têm interfaces independentes e podem avançar por trilhas paralelas.
