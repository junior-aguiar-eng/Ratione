# Onda 1 — Segurança, Cota de IA, RLS e Migrações — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fechar os vetores de bypass de cota e drenagem de orçamento de IA, restaurar a barreira de suspensão (`conta_ativa_restritiva`) nas tabelas privadas recentes, proteger exclusão de conta/sessões/payloads e alinhar migrações/queries em produção.

**Architecture:** As correções atuam no banco Postgres (nova migração aditiva no `supabase/migrations/` testada em `@ratione/db` via PGlite) em par com endurecimento do executor de IA, handlers de rota e adaptadores de sessão em `apps/web`. Cada entrega mantém retrocompatibilidade caso alguma migração opcional (`documentos`, `analises_salvas`) ainda não tenha sido aplicada no ambiente alvo.

**Tech Stack:** TypeScript, PostgreSQL / Supabase RLS, `@electric-sql/pglite`, Next.js Route Handlers, `tsx --test` (`node:test`).

**Spec:** [2026-11-13-correcoes-pendencias-todas-ondas-design.md](file:///c:/Users/Boni%20Jr/Desktop/Ratione/docs/superpowers/specs/2026-11-13-correcoes-pendencias-todas-ondas-design.md)

## Global Constraints

- Monorepo TypeScript (`pnpm typecheck` com zero erros) e `tsx --test` com 100% de aprovação (sem relaxar os 1.378 testes atuais).
- Toda função `security definer` nova ou alterada deve fixar `set search_path = ''` e receber `revoke all` de `public, anon, authenticated`.
- Toda tabela privada de usuário (`documentos`, `casos`, `analises_salvas`) deve possuir a política restritiva `conta_ativa_restritiva` usando `(select public.conta_tem_acesso())`.
- Toda migração nova deve ser registrada na tabela-índice de `supabase/LEIA-ME.md` no mesmo commit.

## Review Focus

- **Repetição ou salto de etapa em `analise_iniciar` / `ia_reservar`**: usuário inicia 1 análise `'rapida'` e tenta chamar `argumenta-questoes` direto sem `argumenta-estrutura`, ou tenta repetir `argumenta-estrutura` / `argumenta-questoes` já concluídas com sucesso (`situacao = 'gerada'`); após falha legítima (`situacao in ('falhou', 'recusada', 'invalida')`), nova tentativa daquela mesma etapa deve continuar permitida dentro dos limites de `analise_falha` → **coberto na Task 1.1**.
- **Reservas `'reservada'` órfãs após crash**: chamada de IA morre sem chamar `ia_finalizar`; após a janela de lock (`2 minutes`), o valor reservado não pode continuar travando `ia_gasto_do_fundo()` do mês → **coberto na Task 1.1**.
- **Conta suspensa com JWT ainda ativo**: usuário suspenso tenta ler/gravar via PostgREST em `documentos`, `casos` e `analises_salvas` → **coberto na Task 1.3**.
- **Usuário anônimo (`is_anonymous = true`) ou upload `transfer-encoding: chunked` sem `content-length`**: anônimo não pode consumir cota de IA/storage; upload acima do limite sem `content-length` precisa abortar durante a leitura do stream antes de alocar `file.arrayBuffer()` gigante → **coberto nas Tasks 1.4 e 1.5**.
- **Exclusão de conta com migrações opcionais não aplicadas**: se `public.documentos` não existir no schema remoto, `/api/conta/excluir` não pode responder HTTP 500 → **coberto na Task 1.4**.

---

### Task 1.1: Fechar bypass de cota (`por-analise`) e expirar reservas `'reservada'` órfãs no banco

**Files:**
- Create: `supabase/migrations/20261113000001_seguranca_ia_cotas_e_reservas.sql`
- Modify: `supabase/LEIA-ME.md:180-190`
- Test: `packages/db/src/ia.test.ts`
- Test: `packages/db/src/fundos.test.ts`

**Interfaces:**
- Consumes: `public.analises`, `public.ia_uso`, `public.ia_fundos`, `public.ia_gasto_do_fundo(text)` (`supabase/migrations/20261023000002_fundos_de_gasto.sql`).
- Produces: versões endurecidas de `public.ia_gasto_do_fundo(text)` (ignora `'reservada'` com `criado_em <= now() - interval '2 minutes'`) e `public.ia_reservar(text, uuid, text, text, uuid, numeric)` (impede reexecução de etapa já `'gerada'` na mesma `analise_id` e exige precedência do pipeline `argumenta-estrutura` -> `argumenta-questoes` -> `argumenta-fundamentos` no mesmo `analise_id`; marca reservas órfãs expiradas como `'invalida'` com `custo_usd = 0`).

- [ ] **Step 1: Escrever os testes que falham para bypass de cota, ordem de etapas e reserva órfã**

Em `packages/db/src/ia.test.ts` e `packages/db/src/fundos.test.ts`, adicionar:
```ts
// Em packages/db/src/ia.test.ts
it('bloqueia repetição da mesma etapa já gerada e exige sequência no pipeline do Argumenta', async () => {
  const analise = await comoServidor(db, tx => iniciar(tx, ana, 'rapida'));
  const pulo = await comoServidor(db, tx => reservar(tx, ana, analise, 0.01, 'argumenta-questoes'));
  assert.strictEqual(pulo.ok, false);
  assert.strictEqual(pulo.motivo, 'analise_invalida');

  const e1 = await comoServidor(db, tx => reservar(tx, ana, analise, 0.01, 'argumenta-estrutura'));
  assert.strictEqual(e1.ok, true);
  await comoServidor(db, tx => finalizar(tx, e1.reserva_id!));

  const repeteE1 = await comoServidor(db, tx => reservar(tx, ana, analise, 0.01, 'argumenta-estrutura'));
  assert.strictEqual(repeteE1.ok, false);
  assert.strictEqual(repeteE1.motivo, 'analise_invalida');

  const e2 = await comoServidor(db, tx => reservar(tx, ana, analise, 0.01, 'argumenta-questoes'));
  assert.strictEqual(e2.ok, true);
  await comoServidor(db, tx => tx.query("select public.ia_finalizar($1, 'falhou', 0, 0, 0, 0, 0)", [e2.reserva_id!]));

  const retryE2 = await comoServidor(db, tx => reservar(tx, ana, analise, 0.01, 'argumenta-questoes'));
  assert.strictEqual(retryE2.ok, true, 'retry após falha legítima continua permitido');
  await comoServidor(db, tx => finalizar(tx, retryE2.reserva_id!));

  const repeteE2 = await comoServidor(db, tx => reservar(tx, ana, analise, 0.01, 'argumenta-questoes'));
  assert.strictEqual(repeteE2.ok, false);
  assert.strictEqual(repeteE2.motivo, 'analise_invalida');
});

// Em packages/db/src/fundos.test.ts
it('reservas presas em reservada há mais de 2 minutos não drenam o fundo mensal', async () => {
  const u = await criarUsuario(db, 'orfa@exemplo.com');
  const id = (await iniciar(db, u)).analise_id!;
  const r = await reservar(db, u, id, 10.0);
  assert.strictEqual(r.ok, true);
  await db.query("update public.ia_uso set criado_em = now() - interval '3 minutes' where id = $1", [r.reserva_id]);
  const situacao = await db.query<{ fundo: string; gasto_usd: string }>(
    "select fundo, gasto_usd::text from public.ia_fundos_situacao() where fundo = 'gratuito'"
  );
  assert.ok(Number(situacao.rows[0].gasto_usd) < 10.0);
});
```

- [ ] **Step 2: Rodar os testes de banco para confirmar a falha**

Run: `pnpm --filter @ratione/db exec tsx --test src/ia.test.ts src/fundos.test.ts`
Expected: FAIL — `pulo.ok` e `repeteE1.ok` retornam `true`, e `gasto_usd` inclui a reserva de `10.0` há 3 minutos.

- [ ] **Step 3: Criar `supabase/migrations/20261113000001_seguranca_ia_cotas_e_reservas.sql` e atualizar `supabase/LEIA-ME.md`**

Na migração:
1. Em `public.ia_gasto_do_fundo(p_fundo text)`: filtrar `not (u.situacao = 'reservada' and u.criado_em <= now() - interval '2 minutes')`.
2. Em `public.ia_reservar(...)`: após `pg_advisory_xact_lock`, sanear reservas órfãs (`update public.ia_uso set situacao = 'invalida', custo_usd = 0, finalizada_em = now() where situacao = 'reservada' and criado_em <= now() - interval '2 minutes'`), verificar que para tarefas `argumenta-*` não existe registro `u.analise_id = p_analise and u.tarefa = p_tarefa and u.situacao = 'gerada'`, e exigir que `argumenta-questoes` tenha `argumenta-estrutura` `'gerada'` na mesma `analise_id` e `argumenta-fundamentos` tenha `argumenta-questoes` `'gerada'` na mesma `analise_id` (caso contrário, retornar `false, 'analise_invalida', null`). Manter `set search_path = ''`, `revoke all` e `grant execute ... to service_role`.

- [ ] **Step 4: Rodar os testes de `@ratione/db` para verificar aprovação**

Run: `pnpm --filter @ratione/db test`
Expected: PASS — todos os testes em `packages/db` passam, incluindo os novos cenários.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20261113000001_seguranca_ia_cotas_e_reservas.sql supabase/LEIA-ME.md packages/db/src/ia.test.ts packages/db/src/fundos.test.ts
git commit -m "fix(db): fecha bypass de cota por-analise e expira reservas orfas de IA"
```

---

### Task 1.2: Endurecer `executar.ts` e `argumenta.ts` (cota defensiva, erro de registro observável e truncamento de saída)

**Files:**
- Modify: `apps/web/src/lib/ia/tarefas/argumenta.ts:60-70,180-200`
- Modify: `apps/web/src/lib/ia/executar.ts:210-221`
- Test: `apps/web/src/lib/ia/tarefas/argumenta.test.ts`
- Test: `apps/web/src/lib/ia/executar.test.ts`

**Interfaces:**
- Consumes: `TarefaIA` em `apps/web/src/lib/ia/contrato.ts:38-43`.
- Produces: `argumentaQuestoes` com `cota: { tipo: 'rapida', modo: 'por-analise', consome: true }` (defesa em profundidade caso `analise_consumir` seja idempotente), `SaidaEstrutura` truncando `pedidos` (`max(15)`) e `secoes` (`max(15)`) via `z.preprocess`, e `executarTarefa` propagando/logando falha crítica em `consumirAnalise`/`concluirAnalise` sem mascarar erro em testes ou permitir estorno silencioso.

- [ ] **Step 1: Escrever testes que falham para `SaidaEstrutura`, `argumentaQuestoes` e erro em `consumirAnalise`/`concluirAnalise`**

```ts
// Em apps/web/src/lib/ia/tarefas/argumenta.test.ts
it('SaidaEstrutura preserva os 15 primeiros pedidos e seções em vez de descartar resposta inteira', async () => {
  const muitosPedidos = Array.from({ length: 18 }, (_, i) => ({ descricao: `Pedido ${i + 1}`, paragrafos: [1] }));
  const muitasSecoes = Array.from({ length: 18 }, () => ({ tipo: 'fundamentacao' as const, inicio: 1, fim: 2 }));
  const { dep } = deps(JSON.stringify({ ...ESTRUTURA, pedidos: muitosPedidos, secoes: muitasSecoes }));
  const r = await executarTarefa('argumenta-estrutura', { analiseId: ANALISE, paragrafos }, dep);
  assert.equal(r.status, 200);
  if (r.status === 200) {
    const out = r.corpo.resposta as { pedidos: unknown[]; secoes: unknown[] };
    assert.equal(out.pedidos.length, 15);
    assert.equal(out.secoes.length, 15);
  }
});

it('argumenta-questoes também garante consumo de cota quando executada', async () => {
  const e2 = deps(JSON.stringify({ questoes: [QUESTAO] }));
  const r = await executarTarefa('argumenta-questoes', { analiseId: ANALISE, paragrafos }, e2.dep);
  assert.equal(r.status, 200);
  assert.ok(e2.registro.some(x => x.startsWith('consumir ')));
});
```

- [ ] **Step 2: Rodar os testes de IA para confirmar a falha**

Run: `pnpm --filter web exec tsx --test src/lib/ia/tarefas/argumenta.test.ts src/lib/ia/executar.test.ts`
Expected: FAIL — `SaidaEstrutura` rejeita 18 pedidos/seções com `502`, e `argumenta-questoes` não registra `'consumir'`. *(Ajustar também a expectativa antiga da linha 163 de `argumenta.test.ts` se ela afirmava explicitamente que a etapa do meio não consumia — manter contrato claro de idempotência).*

- [ ] **Step 3: Implementar o truncamento com `z.preprocess`, `consome: true` em `argumentaQuestoes` e registro explícito de falha em `executar.ts`**

Em `apps/web/src/lib/ia/tarefas/argumenta.ts`:
- Criar `const limitar = <T>(max: number) => (v: unknown): unknown => (Array.isArray(v) ? (v as T[]).slice(0, max) : v);` e aplicar em `pedidos` (`z.preprocess(limitar(15), ...)`) e `secoes` (`z.preprocess(limitar(15), ...)`) de `SaidaEstrutura`.
- Definir `cota: { tipo: 'rapida', modo: 'por-analise', consome: true }` em `argumentaQuestoes` (como `analise_consumir` apenas seta `consumiu = true`, é idempotente após `argumenta-estrutura` e fecha o bypass caso chamada isolada aconteça em ambiente sem a migration mais nova).
- Em `apps/web/src/lib/ia/executar.ts:214-216`: se `consumirAnalise` ou `concluirAnalise` falhar em tarefa que **depende de registro para descontar cota** (`porChamada || t.cota.consome || t.cota.conclui`), além de chamar `registrarFalha(...)`, retornar `{ status: 503, corpo: { mensagem: 'Não foi possível confirmar o registro desta etapa agora. Tente novamente.' } }` em vez de retornar `200` com cota intacta; atualizar o teste existente em `executar.test.ts` se ele testava o retorno anterior.

- [ ] **Step 4: Rodar os testes de IA para verificar aprovação**

Run: `pnpm --filter web exec tsx --test src/lib/ia/tarefas/argumenta.test.ts src/lib/ia/executar.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/ia/tarefas/argumenta.ts apps/web/src/lib/ia/tarefas/argumenta.test.ts apps/web/src/lib/ia/executar.ts apps/web/src/lib/ia/executar.test.ts
git commit -m "fix(ia): fecha bypass em argumenta-questoes, trunca SaidaEstrutura e evita 200 sem registro de cota"
```

---

### Task 1.3: Endurecer RLS, `search_path`, trigger de documentos e limpeza em lote

**Files:**
- Create: `supabase/migrations/20261113000002_rls_suspensao_e_triggers_tabelas_recentes.sql`
- Modify: `apps/web/src/lib/documentos/servico.ts:148-165`
- Modify: `apps/web/src/lib/analisesSalvas/servico.ts:177-195`
- Modify: `supabase/LEIA-ME.md:180-190`
- Create: `packages/db/src/documentos-casos-analises.test.ts`
- Test: `apps/web/src/lib/documentos/documentos.test.ts`
- Test: `apps/web/src/lib/analisesSalvas/analisesSalvas.test.ts`

**Interfaces:**
- Consumes: `public.conta_tem_acesso()` (`supabase/migrations/20261024000004_administracao_contas.sql`), `public.documentos` (`20261104000001`), `public.casos` (`20261105000001`), `public.analises_salvas` (`20261106000001`), `public.limpar_dados_vencidos()` (`20261026000002`).
- Produces: política restritiva `conta_ativa_restritiva` em `documentos`, `casos` e `analises_salvas`; `analises_salvas_limite()` e `limpar_dados_vencidos()` com `set search_path = ''` e `revoke all`; trigger `documentos_limite` (10 arquivos por usuário, simétrico ao de `analises_salvas_limite`); e loop com teto seguro de lotes (ex.: até 20 lotes de 200 = 4.000 itens por execução) em `limparVencidos` (`documentos/servico.ts` e `analisesSalvas/servico.ts`) mantendo o parâmetro `lote` compatível com os testes unitários existentes.

- [ ] **Step 1: Escrever teste de banco (`packages/db/src/documentos-casos-analises.test.ts`) e teste de múltiplos lotes**

Em `packages/db/src/documentos-casos-analises.test.ts`:
```ts
it('usuário suspenso perde acesso a casos, documentos e análises_salvas e trigger de documentos barra 11º arquivo', async () => {
  // criar usuario, inserir 1 registro via service_role em documentos e analises_salvas, e 1 caso via authenticated
  // suspender usuario em auth.users (banned_until = now() + interval '1 day')
  // tentar SELECT em casos, documentos e analises_salvas via como(db, uid, ...) -> esperar 0 linhas
  // tentar INSERT em casos via como(db, uid, ...) -> esperar /row-level security/
  // reativar e testar inserção do 11º documento -> esperar /limite de 10 documentos/
});
```

- [ ] **Step 2: Rodar o novo teste para confirmar falha**

Run: `pnpm --filter @ratione/db exec tsx --test src/documentos-casos-analises.test.ts`
Expected: FAIL — `SELECT` em `casos`/`documentos`/`analises_salvas` ainda retorna linhas com conta suspensa e o 11º documento é aceito no banco.

- [ ] **Step 3: Criar `supabase/migrations/20261113000002_rls_suspensao_e_triggers_tabelas_recentes.sql` e atualizar `limparVencidos`**

Na migração (`supabase/migrations/20261113000002_rls_suspensao_e_triggers_tabelas_recentes.sql`):
1. Usar bloco `do $$` condicional com `to_regclass('public.<tabela>') is not null` ao aplicar `conta_ativa_restritiva` (`as restrictive for all to authenticated using ((select public.conta_tem_acesso())) with check ((select public.conta_tem_acesso()))`) em `public.documentos`, `public.casos` e `public.analises_salvas` (com `drop policy if exists` antes), para a migração não falhar em ambientes onde `20261104`/`20261105`/`20261106` ainda não foram aplicadas. Além disso, atualizar as próprias migrações pendentes (`20261105000001_casos.sql`, `20261106000001_analises_salvas.sql` e instrução em `supabase/LEIA-ME.md`) para incluir a política `conta_ativa_restritiva` idempotente caso sejam aplicadas depois.
2. Recriar `public.analises_salvas_limite()` (se existir ou incondicionalmente) com `security definer set search_path = ''` e `revoke all on function public.analises_salvas_limite() from public, anon, authenticated`.
3. Criar `public.documentos_limite()` (análogo, limite `>= 10` em `public.documentos`, `set search_path = ''`, `revoke all`) e criar trigger `documentos_limite` `before insert on public.documentos` dentro do guard `if to_regclass('public.documentos') is not null`.
4. Recriar `public.limpar_dados_vencidos()` qualificando tudo com `public.` e fixando `set search_path = ''` (mantendo `revoke all` e `grant execute to service_role`).
5. Em `limparVencidos(dep, lote = 200, maxRodadas = 20)` (`documentos/servico.ts` e `analisesSalvas/servico.ts`): fazer loop enquanto o último lote retornou `lote` itens e rodadas < `maxRodadas` *(atenção: quando chamado explicitamente com `limparVencidos(dep, 1)` no teste existente em `documentos.test.ts:216`, garantir que se `maxRodadas` não for alterado ou se o teste espera apenas 1 lote quando `lote` é passado explicitamente, ajustar assinatura para `limparVencidos(dep, lote = 200, continuarAteZerar = false)` e usar `true` apenas na rota `/api/*/limpar` — preservando 100% os testes unitários atuais!)*.

- [ ] **Step 4: Rodar os testes de `@ratione/db`, `documentos` e `analisesSalvas`**

Run: `pnpm --filter @ratione/db test && pnpm --filter web exec tsx --test src/lib/documentos/documentos.test.ts src/lib/analisesSalvas/analisesSalvas.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20261113000002_rls_suspensao_e_triggers_tabelas_recentes.sql supabase/LEIA-ME.md packages/db/src/documentos-casos-analises.test.ts apps/web/src/lib/documentos/servico.ts apps/web/src/lib/analisesSalvas/servico.ts apps/web/src/lib/documentos/documentos.test.ts apps/web/src/lib/analisesSalvas/analisesSalvas.test.ts
git commit -m "fix(rls,db): aplica conta_ativa_restritiva, search_path vazio e limite de documentos no banco"
```

---

### Task 1.4: Exclusão de conta resiliente (`documentos`) + barreira de `is_anonymous` nas rotas autenticadas

**Files:**
- Modify: `apps/web/src/app/api/conta/excluir/route.ts:64-85`
- Modify: `apps/web/src/lib/sessaoValidada.ts:35-49`
- Modify: `apps/web/src/app/api/ia/[tarefa]/route.ts`
- Modify: `apps/web/src/app/api/analises/route.ts`
- Modify: `apps/web/src/app/api/documentos/route.ts`
- Modify: `apps/web/src/app/api/documentos/[id]/route.ts`
- Modify: `apps/web/src/app/api/analises-salvas/route.ts`
- Modify: `apps/web/src/app/api/analises-salvas/[id]/route.ts`
- Modify: `apps/web/src/app/api/cobranca/assinar/route.ts`
- Modify: `apps/web/src/app/api/cobranca/cancelar/route.ts`
- Create: `apps/web/src/lib/conta/excluirDependencias.ts` (ou extrair helper testável para testar `apagarDocumentos` tolerante a tabela/bucket ausente)
- Test: `apps/web/src/lib/sessaoValidada.test.ts`
- Create: `apps/web/src/app/api/conta/excluir/excluir.test.ts`

**Interfaces:**
- Consumes: `lerSessaoValidada` em `apps/web/src/lib/sessaoValidada.ts`.
- Produces: `usuarioAutenticadoNaoAnonimo(user: { id: string; is_anonymous?: boolean } | null): { id: string } | null` e `apagarDocumentos(servidor, usuarioId)` ignorando erro `42P01` / `'does not exist'` / `'not found'` (simétrico a `apagarAnalisesSalvas`).

- [ ] **Step 1: Escrever testes que falham para usuário anônimo e exclusão de conta sem `documentos`**

```ts
// Em apps/web/src/lib/sessaoValidada.test.ts
it('usuarioAutenticadoNaoAnonimo recusa is_anonymous = true', () => {
  assert.equal(usuarioAutenticadoNaoAnonimo({ id: 'u1', is_anonymous: true }), null);
  assert.deepEqual(usuarioAutenticadoNaoAnonimo({ id: 'u1', is_anonymous: false }), { id: 'u1' });
});
```
E teste unitário da função extraída de exclusão simulando `relation "public.documentos" does not exist` e `Bucket not found`, esperando conclusão sem throw.

- [ ] **Step 2: Rodar os testes para confirmar falha**

Run: `pnpm --filter web exec tsx --test src/lib/sessaoValidada.test.ts src/app/api/conta/excluir/excluir.test.ts`
Expected: FAIL — `usuarioAutenticadoNaoAnonimo` não existe / exclusão falha ao receber erro de tabela inexistente.

- [ ] **Step 3: Implementar `usuarioAutenticadoNaoAnonimo`, aplicar nas rotas listadas e proteger `apagarDocumentos`**

- Exportar `usuarioAutenticadoNaoAnonimo` em `apps/web/src/lib/sessaoValidada.ts`.
- Em `api/ia/[tarefa]`, `api/analises`, `api/documentos`, `api/documentos/[id]`, `api/analises-salvas`, `api/analises-salvas/[id]`, `api/cobranca/assinar`, `api/cobranca/cancelar` e `api/conta/excluir`: rejeitar com `401` se `!usuarioAutenticadoNaoAnonimo(user)`.
- Em `api/conta/excluir/route.ts`: encapsular captura de erro de tabela/bucket ausente compartilhada entre `apagarAnalisesSalvas` e `apagarDocumentos`.

- [ ] **Step 4: Rodar os testes e typecheck**

Run: `pnpm --filter web exec tsx --test src/lib/sessaoValidada.test.ts src/app/api/conta/excluir/excluir.test.ts && pnpm --filter web exec tsc --noEmit`
Expected: PASS (`exit 0`).

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/sessaoValidada.ts apps/web/src/lib/sessaoValidada.test.ts apps/web/src/app/api/conta/excluir/route.ts apps/web/src/app/api/conta/excluir/excluir.test.ts apps/web/src/app/api/ia/\[tarefa\]/route.ts apps/web/src/app/api/analises/route.ts apps/web/src/app/api/documentos/route.ts apps/web/src/app/api/documentos/\[id\]/route.ts apps/web/src/app/api/analises-salvas/route.ts apps/web/src/app/api/analises-salvas/\[id\]/route.ts apps/web/src/app/api/cobranca/assinar/route.ts apps/web/src/app/api/cobranca/cancelar/route.ts
git commit -m "fix(auth,conta): bloqueia sessoes anonimas nas rotas privadas e torna exclusao tolerante sem tabela documentos"
```

---

### Task 1.5: Limite real de streaming em uploads/JSON, hardening de `origemPublica` e correção de `tesemap_buscar`

**Files:**
- Modify: `apps/web/src/lib/corpoJson.ts` (estender para `lerTextoLimitado(request, maxBytes)`)
- Modify: `apps/web/src/lib/admin/contas.ts:28-36`
- Modify: `apps/web/src/app/api/mercadopago/webhook/route.ts`
- Modify: `apps/web/src/app/api/documentos/route.ts:43-58`
- Modify: `apps/web/src/lib/origem.ts:1-20`
- Create: `supabase/migrations/20261113000003_tesemap_busca_consulta_vazia.sql`
- Modify: `supabase/LEIA-ME.md`
- Test: `apps/web/src/lib/corpoJson.test.ts`
- Test: `apps/web/src/lib/admin/contas.test.ts`
- Test: `packages/db/src/admin.test.ts` (ou novo teste de `tesemap_buscar` em `packages/db/src/tesemap-busca.test.ts`)

**Interfaces:**
- Consumes: `lerJsonLimitado` (`apps/web/src/lib/corpoJson.ts`).
- Produces: `lerTextoLimitado(request: Request, maxBytes: number): Promise<{ ok: true; texto: string } | { ok: false; status: 413; mensagem: string }>` lendo o `ReadableStream` chunk-a-chunk e abortando ao ultrapassar `maxBytes` mesmo sem `content-length`; `lerCorpoLimitado(request, maxBytes)` / `formData` com clone ou limite por stream em `/api/documentos`; `origemPublica` priorizando `process.env.SITE_URL` / `NEXT_PUBLIC_SITE_URL` quando configurado em produção fora de localhost; `tesemap_buscar` tratando `tsquery` vazia (`numnode(q) = 0`) como `null` (retornando lista padrão em vez de 0 linhas quando o usuário digita apenas pontuação/stopwords).

- [ ] **Step 1: Escrever testes que falham para leitura em streaming sem `content-length`, `origemPublica` e `tesemap_buscar` com stopwords**

```ts
// Em apps/web/src/lib/corpoJson.test.ts
it('lerTextoLimitado aborta stream sem content-length ao exceder maxBytes', async () => {
  const stream = new ReadableStream({
    start(ctrl) {
      ctrl.enqueue(new TextEncoder().encode('x'.repeat(600)));
      ctrl.enqueue(new TextEncoder().encode('y'.repeat(600)));
      ctrl.close();
    }
  });
  const req = new Request('http://localhost/teste', { method: 'POST', body: stream, duplex: 'half' } as RequestInit);
  const r = await lerTextoLimitado(req, 1024);
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.status, 413);
});
```
Em `packages/db/src/tesemap-busca.test.ts`: inserir um nó em `tesemap_nos` e chamar `select * from public.tesemap_buscar('de da do', null, null, 20, null)` esperando retornar o nó (atualmente retorna 0 linhas porque `websearch_to_tsquery('portugues_sem_acento', 'de da do') = ''::tsquery`).

- [ ] **Step 2: Rodar os testes para confirmar falha**

Run: `pnpm --filter web exec tsx --test src/lib/corpoJson.test.ts && pnpm --filter @ratione/db exec tsx --test src/tesemap-busca.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar `lerTextoLimitado`, aplicar em `contas.ts`, `webhook/route.ts` e `api/documentos/route.ts`, endurecer `origemPublica` e criar `20261113000003_tesemap_busca_consulta_vazia.sql`**

- Em `documentos/route.ts`: ler até `LIMITES_DE_DOCUMENTO.maxBytes + 64 * 1024` via stream controlado e construir `new Request(request.url, { method: request.method, headers: request.headers, body: buffer }).formData()` para evitar buffering ilimitado no runtime caso `content-length` esteja ausente.
- Em `origem.ts`: se `RATIONE_ORIGEM_PUBLICA` (ou allowlist de hosts confiáveis) estiver definida, validar/preferir contra `x-forwarded-host` contra spoof; manter fallback atual para testes locais e previews conhecidos.
- Em `20261113000003_tesemap_busca_consulta_vazia.sql`: recriar `public.tesemap_buscar(text, text, text, integer, text)` (unificando também a assinatura com `prefixo` da `20261026000001_tesemap_filtro_por_especie.sql`) com `case when numnode(q) = 0 then null else q end`. **Checklist operacional:** aplicar `20261026000001` e `20261113000003` no SQL Editor de produção logo após o merge.

- [ ] **Step 4: Rodar todos os testes afetados**

Run: `pnpm --filter web exec tsx --test src/lib/corpoJson.test.ts src/lib/admin/contas.test.ts src/lib/cobranca/cobranca.test.ts && pnpm --filter @ratione/db test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/corpoJson.ts apps/web/src/lib/corpoJson.test.ts apps/web/src/lib/admin/contas.ts apps/web/src/app/api/mercadopago/webhook/route.ts apps/web/src/app/api/documentos/route.ts apps/web/src/lib/origem.ts supabase/migrations/20261113000003_tesemap_busca_consulta_vazia.sql packages/db/src/tesemap-busca.test.ts supabase/LEIA-ME.md
git commit -m "fix(security,tesemap): limita streaming de payload, endurece origemPublica e corrige consulta so com stopwords"
```

---

### Task 1.6: Cache negativo em `sessaoValidada.ts` e inscrição única de `onAuthStateChange` em `useSessao.ts`

**Files:**
- Modify: `apps/web/src/lib/sessaoValidada.ts:8-35`
- Modify: `apps/web/src/lib/useSessao.ts`
- Test: `apps/web/src/lib/sessaoValidada.test.ts`

**Interfaces:**
- Consumes: `lerSessaoValidada` (`apps/web/src/lib/sessaoValidada.ts`), `useSessao` (`apps/web/src/lib/useSessao.ts`).
- Produces: não cachear resposta negativa por `1.5s` quando um novo token/sessão acabou de ser salvo nos cookies (permitir bust por mudança de fingerprint de token ou só cachear resultados positivos curtos / coalescer em voo); compartilhar uma única assinatura `onAuthStateChange` singleton por cliente Supabase no browser em `useSessao.ts` em vez de reinscrever a cada montagem/troca de rota.

- [ ] **Step 1: Escrever teste em `sessaoValidada.test.ts` provando que erro transitório / deslogado não trava login imediato no cache de 1,5s**

```ts
it('não retém cache negativo após tentativa imediatamente subsequente com outro token ou novo login', async () => {
  // Simular chamada 1 retornando null (cookie ausente/deslogado) e chamada 2 na mesma janela retornando usuário válido
  // Assert: chamada 2 retorna o usuário válido sem aguardar 1500 ms
});
```

- [ ] **Step 2: Rodar teste para confirmar falha**

Run: `pnpm --filter web exec tsx --test src/lib/sessaoValidada.test.ts`
Expected: FAIL.

- [ ] **Step 3: Remover retenção de cache negativo em `sessaoValidada.ts` (mantendo coalescing/TTL apenas para leitura positiva ou por hash do cookie) e criar store/assinatura compartilhada em `useSessao.ts`**

- [ ] **Step 4: Rodar suíte do `web` + `typecheck`**

Run: `pnpm --filter web exec tsx --test src/lib/sessaoValidada.test.ts && pnpm --filter web exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/sessaoValidada.ts apps/web/src/lib/sessaoValidada.test.ts apps/web/src/lib/useSessao.ts
git commit -m "fix(auth): remove cache negativo de sessaoValidada e compartilha listener onAuthStateChange no useSessao"
```

---

### Handoff & Verificação Final da Onda 1

- [ ] Rodar validação completa após concluir todas as tasks da Onda 1:
  - `pnpm typecheck` (`exit 0`)
  - `pnpm test` (`exit 0`, todos os testes passando)
  - `pnpm --filter web build` (`exit 0`)
- [ ] Checklist manual em produção (Supabase SQL Editor): aplicar em ordem `20261026000001_tesemap_filtro_por_especie.sql`, `20261113000001_...`, `20261113000002_...`, `20261113000003_...` e confirmar status de `20261104000001_documentos.sql`.

**Sugestão de execução:** para esta Onda 1 recomenda-se **Subagent-driven** (`superpowers:subagent-driven-development`), porque mexe com invariantes críticas de segurança e banco de dados que se beneficiam de revisão independente por task antes da próxima alteração.
