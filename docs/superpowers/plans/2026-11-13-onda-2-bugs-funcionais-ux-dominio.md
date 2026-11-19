# Onda 2 — Bugs Funcionais Visíveis, UX e Motores de Domínio — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir os bugs visíveis ao usuário em produção nos módulos web, no motor do PrazoZero, na normalização de citações, nos estados de React/acessibilidade e nas páginas públicas desatualizadas.

**Architecture:** As alterações dividem-se em duas frentes testadas isoladamente: lógica pura extraída/corrigida em TypeScript (`proxy`, `normaviva`, `prazozero`, `argumenta/citacoes`, `argumenta/sugeridos`, `demoHero`) coberta por `tsx --test`, e correções de componentes React/páginas Next.js acompanhadas de helpers puros de estado e checagem por `tsc --noEmit` + `next build`.

**Tech Stack:** TypeScript, Next.js 16.4.5, React 19, `@xyflow/react`, `tsx --test` (`node:test`), `@ratione/prazozero`, `@ratione/normaviva`, `@ratione/core`.

**Spec:** [2026-11-13-correcoes-pendencias-todas-ondas-design.md](file:///c:/Users/Boni%20Jr/Desktop/Ratione/docs/superpowers/specs/2026-11-13-correcoes-pendencias-todas-ondas-design.md)

## Global Constraints

- Monorepo TypeScript (`pnpm typecheck` zero erros), `pnpm --filter web build` verde e zero regressões nos 1.378 testes atuais.
- Preservar rigor jurídico do `PrazoZero`: em `modo: 'conservador'`, nunca emitir falso positivo de ponto facultativo nem ocultar evento pendente que altere publicação; em `SugeridosDaQuestao` / `NormaViva`, exibir origem autêntica sem texto de botão de UI.
- Alterações na página `/privacidade` que reflitam recursos ativos ou futuros devem alinhar com o catálogo real de tarefas desligadas/ligadas.

## Review Focus

- **Deep-link com parâmetros no login (`/prazozero?ato=...&tribunal=TJSP`)**: `proxy.ts` não pode perder query string ao redirecionar para `/entrar?proximo=...`, evitando regressão de compartilhamento e bloqueio de B1 (ForgeLex), e `entrar/page.tsx` precisa preservar `proximo` também no fluxo de cadastro (`signUp`) → **coberto na Task 2.1**.
- **Evento pendente entre `dataDisponibilizacao` e `dataPublicacao`**: quando um evento não confirmado cai exclusivamente no intervalo anterior a `dataPublicacao + 1`, `modo: 'conservador'` precisa acusar divergência pelo evento pendente, nunca marcar `soPontoFacultativo === true` por engano → **coberto na Task 2.5**.
- **Feriado confirmado com `"ponto facultativo"` no nome**: não deve acionar alerta de ponto facultativo no relatório → **coberto na Task 2.5**.
- **Artigos grandes do corpus (`> 400` subdispositivos, ex.: Lei 14.133, art. 6º com ~700 dispositivos)**: `carregarDetalhe` em `lib/normaviva.ts` não pode truncar silenciosamente → **coberto na Task 2.4**.
- **`AnaliseDecisao.tsx` trocando de decisão / abortando execução**: `novaAnalise()` precisa limpar estado visual anterior (`rotulo`, `selos`, `voltouParaQuestao`) e cancelar requisição em voo com `AbortController` → **coberto na Task 2.3**.

---

### Task 2.1: Preservar query string em `proxy.ts` e propagar `?proximo=` nos fluxos de auth

**Files:**
- Modify: `apps/web/src/proxy.ts:28-40`
- Modify: `apps/web/src/app/entrar/page.tsx`
- Modify: `apps/web/src/app/conta/page.tsx`
- Modify: `apps/web/src/app/conta/nova-senha/page.tsx`
- Create: `apps/web/src/lib/proximoDestino.ts`
- Create: `apps/web/src/lib/proximoDestino.test.ts`

**Interfaces:**
- Consumes: `NextRequest` (`apps/web/src/proxy.ts`).
- Produces: `destinoDeRetorno(pathname: string, search: string): string` (devolve `pathname + search` mantendo query params e rejeitando open-redirect em helpers do cliente).

- [ ] **Step 1: Escrever teste que falha para preservação de query string no redirect**

Em `apps/web/src/lib/proximoDestino.test.ts`:
```ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { destinoDeRetorno, caminhoSeguro } from './proximoDestino';

describe('destinoDeRetorno e caminhoSeguro', () => {
  it('preserva pathname e search em links profundos', () => {
    assert.equal(destinoDeRetorno('/prazozero', '?ato=sentenca&tribunal=TJSP'), '/prazozero?ato=sentenca&tribunal=TJSP');
    assert.equal(destinoDeRetorno('/argumenta', ''), '/argumenta');
  });

  it('rejeita URLs externas no parâmetro proximo', () => {
    assert.equal(caminhoSeguro('https://evil.com'), '/meu-espaco');
    assert.equal(caminhoSeguro('//evil.com'), '/meu-espaco');
    assert.equal(caminhoSeguro('/normaviva?d=CPC'), '/normaviva?d=CPC');
  });
});
```

- [ ] **Step 2: Rodar o teste para confirmar falha**

Run: `pnpm --filter web exec tsx --test src/lib/proximoDestino.test.ts`
Expected: FAIL (`Cannot find module './proximoDestino'`).

- [ ] **Step 3: Criar `proximoDestino.ts` e aplicar em `proxy.ts`, `entrar/page.tsx`, `conta/page.tsx` e `conta/nova-senha/page.tsx`**

- Em `apps/web/src/proxy.ts:34`: usar `destinoDeRetorno(request.nextUrl.pathname, request.nextUrl.search)` ao construir `?proximo=...`.
- Em `entrar/page.tsx`: incluir `emailRedirectTo` preservando `?proximo=` quando presente no `signUp`.
- Em `conta/page.tsx` e `conta/nova-senha/page.tsx`: redirecionar para `/entrar?proximo=/conta` (ou `/conta/nova-senha`) em vez de `/entrar` nu.

- [ ] **Step 4: Rodar teste + typecheck**

Run: `pnpm --filter web exec tsx --test src/lib/proximoDestino.test.ts && pnpm --filter web exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/proximoDestino.ts apps/web/src/lib/proximoDestino.test.ts apps/web/src/proxy.ts apps/web/src/app/entrar/page.tsx apps/web/src/app/conta/page.tsx apps/web/src/app/conta/nova-senha/page.tsx
git commit -m "fix(auth,proxy): preserva query string no proximo durante redirects e signUp"
```

---

### Task 2.2: Corrigir rótulo corrompido `"Cita Abrir no NormaViva"` em `SugeridosDaQuestao`

**Files:**
- Modify: `apps/web/src/lib/argumenta/sugeridos.ts:75-95`
- Modify: `apps/web/src/app/argumenta/SugeridosDaQuestao.tsx:45-67`
- Test: `apps/web/src/lib/argumenta/sugeridos.test.ts`

**Interfaces:**
- Consumes: `ResultadoVerificacao` em `apps/web/src/lib/argumenta/verificarCitacoes.ts` e `sugeridosDaQuestao` em `apps/web/src/lib/argumenta/sugeridos.ts`.
- Produces: `sugerido.origem` preenchido com o texto da citação original (ex.: `"CPC, art. 85"`) ou nome legível da norma em vez de `link.rotulo` (`"Abrir no NormaViva"`).

- [ ] **Step 1: Escrever teste que falha em `apps/web/src/lib/argumenta/sugeridos.test.ts`**

```ts
it('nunca usa "Abrir no NormaViva" como origem de sugestão de leitura', () => {
  // Simular mapa de verificações onde o link do NormaViva tem rotulo: 'Abrir no NormaViva' e chave da citação é 'CPC, art. 85'
  // Esperar que nenhum sugerido devolva origem === 'Abrir no NormaViva' / contendo 'Abrir no NormaViva'
});
```

- [ ] **Step 2: Rodar teste para confirmar falha**

Run: `pnpm --filter web exec tsx --test src/lib/argumenta/sugeridos.test.ts`
Expected: FAIL — `origem` retorna `'Abrir no NormaViva'`.

- [ ] **Step 3: Corrigir `apps/web/src/lib/argumenta/sugeridos.ts` (usar `citacaoOriginal` / identificador legível ao montar `origem`) e revisar a frase em `SugeridosDaQuestao.tsx`**

- [ ] **Step 4: Rodar testes de `argumenta`**

Run: `pnpm --filter web exec tsx --test src/lib/argumenta/*.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/argumenta/sugeridos.ts apps/web/src/lib/argumenta/sugeridos.test.ts apps/web/src/app/argumenta/SugeridosDaQuestao.tsx
git commit -m "fix(argumenta): corrige rotulo de origem em SugeridosDaQuestao"
```

---

### Task 2.3: Desacoplar flag do Argumenta, eliminar flash e consertar estado/AbortController em `AnaliseDecisao.tsx`

**Files:**
- Modify: `apps/web/src/app/argumenta/AnaliseDecisao.tsx`
- Modify: `apps/web/src/lib/ia/politica.ts` (ou config client-safe de flag dedicada `NEXT_PUBLIC_ARGUMENTA_IA_LIGADA`, mantendo compatibilidade retroativa com `NEXT_PUBLIC_IA_EXPLICACAO` apenas como fallback legado se explicitado no deploy)
- Create: `apps/web/src/lib/argumenta/estadoAnalise.ts` (ou testar transição pura de estado do `novaAnalise`)
- Create: `apps/web/src/lib/argumenta/estadoAnalise.test.ts`

**Interfaces:**
- Consumes: `useSessao` (`apps/web/src/lib/useSessao.ts`).
- Produces: função pura de reset inicial usada em `AnaliseDecisao.tsx` que zera `rotulo`, `selos`, `voltouParaQuestao` e cancela requisições em voo via `AbortController`; renderização condicional que espera `!carregando` para decidir exibição do formulário vs banner `!contaDisponivel`; scroll disparado em `useEffect` pós-render ou `requestAnimationFrame` duplo após painel montado.

- [ ] **Step 1: Escrever teste que falha para helper de reset de análise**

Em `apps/web/src/lib/argumenta/estadoAnalise.test.ts`: testar que `estadoInicialAnalise()` limpa `rotulo` (`''`), `selos` (vazio), `voltouParaQuestao` (`false`), além de estrutura/questões/fundamentos.

- [ ] **Step 2: Rodar teste para confirmar falha**

Run: `pnpm --filter web exec tsx --test src/lib/argumenta/estadoAnalise.test.ts`
Expected: FAIL (`Cannot find module './estadoAnalise'`).

- [ ] **Step 3: Implementar `estadoAnalise.ts` e atualizar `AnaliseDecisao.tsx` (incluindo `AbortController` no `fetch`, espera por `!carregando`, e scroll após montagem Radix)**

- [ ] **Step 4: Rodar testes e `next build` check / `tsc`**

Run: `pnpm --filter web exec tsx --test src/lib/argumenta/estadoAnalise.test.ts && pnpm --filter web exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/argumenta/estadoAnalise.ts apps/web/src/lib/argumenta/estadoAnalise.test.ts apps/web/src/app/argumenta/AnaliseDecisao.tsx
git commit -m "fix(argumenta): corrige reset de estado, flash de carregamento e AbortController em AnaliseDecisao"
```

---

### Task 2.4: Eliminar truncamento silencioso de artigos `> 400` subdispositivos no NormaViva

**Files:**
- Modify: `apps/web/src/lib/normaviva.ts:215-260`
- Test: `apps/web/src/lib/normaviva.test.ts`

**Interfaces:**
- Consumes: consulta Supabase em `carregarDetalhe` (`apps/web/src/lib/normaviva.ts`).
- Produces: busca paginada em blocos de 500 (via `.range(inicio, inicio + tamanho - 1)` até esgotar ou atingir limite máximo seguro de 2.000 itens), garantindo carregar integralmente artigos extensos como Lei 14.133, art. 6º (~700 subdispositivos).

- [ ] **Step 1: Escrever teste em `apps/web/src/lib/normaviva.test.ts` simulando um artigo com 700 subdispositivos distribuídos em 2 páginas**

- [ ] **Step 2: Rodar o teste para confirmar falha**

Run: `pnpm --filter web exec tsx --test src/lib/normaviva.test.ts`
Expected: FAIL — resultado truncado em 400 itens.

- [ ] **Step 3: Extrair helper de paginação para `carregarDetalhe` em `apps/web/src/lib/normaviva.ts` sem `.limit(400)`**

- [ ] **Step 4: Rodar testes de `normaviva.ts`**

Run: `pnpm --filter web exec tsx --test src/lib/normaviva.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/normaviva.ts apps/web/src/lib/normaviva.test.ts
git commit -m "fix(normaviva): pagina subdispositivos em carregarDetalhe para nao truncar artigos com mais de 400 itens"
```

---

### Task 2.5: Corrigir motor e calendários do PrazoZero (`modo: 'conservador'`, ponto facultativo, `dataEvento` e extensões)

**Files:**
- Modify: `packages/prazozero/src/motor/calculadora.ts:260-320,375-420`
- Modify: `packages/prazozero/src/motor/relatorio.ts:40-85`
- Modify: `packages/prazozero/src/calendario/feriados.ts`
- Modify: `packages/prazozero/src/calendario/trts-dados.ts`
- Modify: `packages/prazozero/src/calendario/nucleo.ts`
- Test: `packages/prazozero/src/motor/calculadora.test.ts`
- Test: `packages/prazozero/src/motor/relatorio.test.ts`
- Test: `packages/prazozero/src/calendario/nucleo.test.ts`
- Test: `packages/prazozero/src/motor/invariantes.test.ts`

**Interfaces:**
- Consumes: `calcularPrazo` (`calculadora.ts`), `montarRelatorio` (`relatorio.ts`), tabelas de feriados/TRTs em `calendario/`.
- Produces:
  1. Registro dos dias saltados entre `dataDisponibilizacao` e `dataPublicacao` na trilha consultada para identificação de `eventosPendentes` em `modo: 'conservador'`.
  2. Verificação de `evento.pontoFacultativo` / `tipo !== 'feriado'` em `relatorio.ts` para evitar falso positivo quando o nome de feriado confirmado contém `"ponto facultativo"`, além de considerar `modo: 'completo'` em `indisponibilidade.dataSeAplicar`.
  3. Verificação de cobertura de calendário iniciada em `ano(dataEvento)` (em vez de apenas `dataPublicacao`), lookup case-insensitive em `TRIBUNAIS_BRASIL[p.tribunalId.toUpperCase()]` e remoção do prefixo residual em `eventosPendentes[].nome`.
  4. Revisão e cobertura em testes de: feriados estaduais PE/RS/GO nos TRTs respectivos, nota/regras explícitas para TRTs/TRFs multiestaduais, prioridade/sombreado de feriado estadual MT (`11-20`), fonte verificada de `TJPE` (`2026-05-14..15`), e consistência do recesso `20/12–06/01` em prazos que não suspendem (CPP exceção e materiais).

- [ ] **Step 1: Escrever testes que falham cobrindo todos os cenários do motor e calendário**

- Em `calculadora.test.ts`: caso com evento pendente caindo exclusivamente entre `dataDisponibilizacao` e `dataPublicacao` deslocando a data de publicação (`modo: 'conservador'` deve acusar o evento pendente e **não** retornar `soPontoFacultativo === true`); caso de virada de ano onde `dataEvento` é em dezembro do ano anterior sem cobertura; caso com `tribunalId: 'tjsp'` minúsculo.
- Em `relatorio.test.ts`: feriado confirmado cujo nome contém `"ponto facultativo"` não gera alerta de ponto facultativo; `indisponibilidade.dataSeAplicar` com `modo: 'completo'`.
- Em `nucleo.test.ts`: conferência de feriados estaduais `PE`/`RS`/`GO` nos TRTs 6/4/18 e feriado MT `11-20`.

- [ ] **Step 2: Rodar suíte `prazozero` para confirmar falha dos novos casos**

Run: `pnpm --filter @ratione/prazozero exec tsx --test src/motor/calculadora.test.ts src/motor/relatorio.test.ts src/calendario/nucleo.test.ts`
Expected: FAIL nos casos recém-adicionados.

- [ ] **Step 3: Implementar as correções em `calculadora.ts`, `relatorio.ts` e `calendario/`**

- [ ] **Step 4: Rodar toda a suíte `@ratione/prazozero` (incluindo `cenarios.test.ts` e `invariantes.test.ts`)**

Run: `pnpm --filter @ratione/prazozero test`
Expected: PASS — todos os >= 484 testes existentes mais os novos casos passam.

- [ ] **Step 5: Commit**

```bash
git add packages/prazozero/src/motor/calculadora.ts packages/prazozero/src/motor/relatorio.ts packages/prazozero/src/calendario/ packages/prazozero/src/motor/calculadora.test.ts packages/prazozero/src/motor/relatorio.test.ts packages/prazozero/src/calendario/nucleo.test.ts
git commit -m "fix(prazozero): corrige modo conservador entre disponibilizacao/publicacao, falso positivo facultativo e calendario estadual"
```

---

### Task 2.6: Normalização e regex de citações (`citacoes.ts`) + flag `i` em UUIDs de API

**Files:**
- Modify: `apps/web/src/lib/argumenta/citacoes.ts:1-125`
- Modify: `apps/web/src/app/api/documentos/[id]/route.ts:13`
- Modify: `apps/web/src/app/api/analises-salvas/[id]/route.ts:13`
- Test: `apps/web/src/lib/argumenta/citacoes.test.ts`

**Interfaces:**
- Consumes: `extrairCitacoes` / normalizador em `apps/web/src/lib/argumenta/citacoes.ts`.
- Produces:
  1. Normalização de zero à esquerda em número de Súmula (`"Súmula 07"` -> `"Súmula 7"`).
  2. Suporte a `"alínea"` com `RE_ALINEA` case-insensitive (`/i`) sem descartar o link ao inciso/parágrafo pai (mantendo `alínea` como detalhe secundário sem quebrar o vínculo).
  3. `"Constituição Estadual"` preservada sem expansão errada para `"Constituição Federal Estadual"`.
  4. `UUID` com `/i` nas rotas `/api/documentos/[id]` e `/api/analises-salvas/[id]`.

- [ ] **Step 1: Escrever testes que falham em `apps/web/src/lib/argumenta/citacoes.test.ts`**

```ts
it('normaliza Súmula 07, preserva link de inciso com alínea A/a e não corrompe Constituição Estadual', () => {
  // assert Súmula 07 -> Súmula 7 / STJ-SUMULA-7
  // assert 'art. 5º, inciso XXXV, alínea A, da CF' preserva referência ao inciso XXXV
  // assert 'Constituição Estadual' não contém 'Constituição Federal Estadual'
});
```

- [ ] **Step 2: Rodar teste para confirmar falha**

Run: `pnpm --filter web exec tsx --test src/lib/argumenta/citacoes.test.ts`
Expected: FAIL.

- [ ] **Step 3: Aplicar correções em `citacoes.ts` e adicionar `/i` no regex `UUID` de `documentos/[id]` e `analises-salvas/[id]`**

- [ ] **Step 4: Rodar testes de citações + verificarCitacoes**

Run: `pnpm --filter web exec tsx --test src/lib/argumenta/citacoes.test.ts src/lib/argumenta/verificarCitacoes.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/argumenta/citacoes.ts apps/web/src/lib/argumenta/citacoes.test.ts apps/web/src/app/api/documentos/\[id\]/route.ts apps/web/src/app/api/analises-salvas/\[id\]/route.ts
git commit -m "fix(argumenta,api): normaliza sumula com zero a esquerda, alinea case-insensitive, CE e UUID uppercase"
```

---

### Task 2.7: Corrigir bugs de estado React, cleanup de effects, edge-cases numéricos e acessibilidade

**Files:**
- Modify: `apps/web/src/app/conta/page.tsx`
- Modify: `apps/web/src/app/normaviva/page.tsx`
- Modify: `apps/web/src/app/tesemap/page.tsx`
- Modify: `apps/web/src/app/tesemap/GrafoDaVizinhanca.tsx`
- Modify: `apps/web/src/app/prazozero/page.tsx`
- Modify: `apps/web/src/app/prazozero/ResultadoMaterial.tsx:80-95`
- Modify: `apps/web/src/app/meu-espaco/uso/page.tsx`
- Modify: `apps/web/src/app/meu-espaco/uso/Assinatura.tsx`
- Modify: `apps/web/src/app/buscar/page.tsx`
- Modify: `apps/web/src/app/entrar/page.tsx`
- Modify: `apps/web/src/components/ui/checkbox.tsx`
- Create: `apps/web/src/lib/usoApresentacao.ts` + `apps/web/src/lib/usoApresentacao.test.ts` (helpers puros testáveis para cálculo de porcentagem com `quantidade === 0`, validação de `memoriaCalculo` e parse de input numérico sem forçar `1` enquanto digita).

**Interfaces:**
- Produces:
  - `percentualDeUso(usadas: number, quantidade: number): number` retornando `0` se `quantidade <= 0`.
  - Em `conta/page.tsx`: remover `EmptyState` morto, verificar `error` em todas as 9 queries da exportação LGPD, envolver `salvarPerfil` e `trocarSenha` com `try/finally`.
  - Em `normaviva/page.tsx` e `tesemap/page.tsx`: limpar item/erro anterior ao iniciar nova busca por ID, exibir fallback visual + cabeçalho se `lerCobertura` falhar no `tesemap`, mover `slice` de nós para `useMemo` e usar variável CSS adaptativa no `<Background />` do `GrafoDaVizinhanca.tsx`.
  - Em `prazozero/page.tsx` & `ResultadoMaterial.tsx`: permitir campo numérico vazio temporário na edição validando no submit/blur, abrir `<details>` avançado automaticamente se URL trouxer opções avançadas preenchidas, adicionar `max-h-[calc(100vh-5rem)] overflow-y-auto` no painel sticky e checar `memoriaCalculo.length > 1` em `ResultadoMaterial.tsx`.
  - Em `Assinatura.tsx`, `buscar/page.tsx`, `entrar/page.tsx`, `checkbox.tsx`: cancelar polling/timeout e limpar `?assinatura=retorno` com `useEffect` cleanup em `Assinatura.tsx`, usar `try/finally` em `buscarEmTudo`, separar `<label htmlFor>` de links adjacentes em `entrar/page.tsx` e garantir `focus-visible:ring-*` em `checkbox.tsx`.

- [ ] **Step 1: Escrever teste que falha para `percentualDeUso` (`quantidade === 0` não gera `NaN`)**

- [ ] **Step 2: Rodar teste para confirmar falha**

Run: `pnpm --filter web exec tsx --test src/lib/usoApresentacao.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar `usoApresentacao.ts` e aplicar todas as correções nas páginas/componentes listados**

- [ ] **Step 4: Rodar testes + `tsc --noEmit` + `pnpm --filter web build`**

Run: `pnpm --filter web exec tsx --test src/lib/usoApresentacao.test.ts && pnpm --filter web exec tsc --noEmit && pnpm --filter web build`
Expected: PASS (`exit 0`).

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/usoApresentacao.ts apps/web/src/lib/usoApresentacao.test.ts apps/web/src/app/conta/page.tsx apps/web/src/app/normaviva/page.tsx apps/web/src/app/tesemap/page.tsx apps/web/src/app/tesemap/GrafoDaVizinhanca.tsx apps/web/src/app/prazozero/page.tsx apps/web/src/app/prazozero/ResultadoMaterial.tsx apps/web/src/app/meu-espaco/uso/page.tsx apps/web/src/app/meu-espaco/uso/Assinatura.tsx apps/web/src/app/buscar/page.tsx apps/web/src/app/entrar/page.tsx apps/web/src/components/ui/checkbox.tsx
git commit -m "fix(ui,ux): corrige estados residuais, NaN em uso, polling de assinatura, memoriaCalculo e a11y"
```

---

### Task 2.8: Atualizar páginas públicas (`/metodologia`, `/privacidade`, demos, `MODULOS` e Home)

**Files:**
- Modify: `apps/web/src/app/metodologia/page.tsx:80-149`
- Modify: `apps/web/src/app/privacidade/page.tsx:65-90` *(coordenar revisão jurídica T-03 se texto de tratamento mudar)*
- Modify: `apps/web/src/lib/demoHero.ts:25-50`
- Modify: `apps/web/src/components/demo/DemoArgumenta.tsx`
- Modify: `apps/web/src/lib/modulos.ts`
- Modify: `apps/web/src/app/page.tsx`
- Test: `apps/web/src/lib/demoHero.test.ts`

**Interfaces:**
- Consumes: `calcularDemoPrazo`, `DATA_MAXIMA_DEMO` (`apps/web/src/lib/demoHero.ts`), `MODULOS` (`apps/web/src/lib/modulos.ts`).
- Produces:
  1. `metodologia/page.tsx`: refletir estado atual (NormaViva, TeseMap, Argumenta com verificação real de citações contra a base, 28 normas, cobertura TST/TSE conforme estado factual do código).
  2. `privacidade/page.tsx`: alinhar descrição das tarefas de IA hoje ativas vs recursos em implantação, sem omitir nem inventar funcionalidades.
  3. `demoHero.ts`: estender `DATA_MAXIMA_DEMO` para janela vigente coberta pelos calendários validados (ex.: `'2026-12-31'`) com teste em `demoHero.test.ts`.
  4. `DemoArgumenta.tsx` & `modulos.ts`: alinhar copy do `DemoArgumenta` ao comportamento real em produção (sem prometer paginação/fragilidades antes de implementadas) e atualizar rótulo de status em `MODULOS`.
  5. `app/page.tsx`: enxugar blocos duplicados abaixo da dobra conforme `docs/PLANO.md` §Home e evitar contadores hardcoded divergentes do catálogo real.

- [ ] **Step 1: Atualizar teste em `demoHero.test.ts` exigindo `calcularDemoPrazo` válido para novembro/dezembro de 2026**

- [ ] **Step 2: Rodar teste para confirmar falha com `DATA_MAXIMA_DEMO = '2026-10-30'`**

Run: `pnpm --filter web exec tsx --test src/lib/demoHero.test.ts`
Expected: FAIL para data em novembro/dezembro de 2026.

- [ ] **Step 3: Atualizar `demoHero.ts`, `DemoArgumenta.tsx`, `modulos.ts`, `metodologia/page.tsx`, `privacidade/page.tsx` e `app/page.tsx`**

- [ ] **Step 4: Rodar `demoHero.test.ts`, `tsc --noEmit` e `pnpm --filter web build`**

Run: `pnpm --filter web exec tsx --test src/lib/demoHero.test.ts && pnpm --filter web exec tsc --noEmit && pnpm --filter web build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/demoHero.ts apps/web/src/lib/demoHero.test.ts apps/web/src/components/demo/DemoArgumenta.tsx apps/web/src/lib/modulos.ts apps/web/src/app/metodologia/page.tsx apps/web/src/app/privacidade/page.tsx apps/web/src/app/page.tsx
git commit -m "docs,fix(web): alinha metodologia, privacidade, demos e home ao estado real do produto"
```

---

### Handoff & Verificação Final da Onda 2

- [ ] Rodar validação completa:
  - `pnpm typecheck` (`exit 0`)
  - `pnpm test` (`exit 0`)
  - `pnpm --filter web build` (`exit 0`)

**Sugestão de execução:** **Native** (`superpowers:executing-plans`) ou **Subagent-driven** para Tasks 2.5 e 2.7 separadas em paralelo, porque a maioria das tasks toca módulos bem isolados (`PrazoZero`, `citacoes`, `UI`).
