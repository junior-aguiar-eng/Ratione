# RATIONE — PLANO ÚNICO

> Atualizado em **07/10/2026**. Este é o **único** plano e o **único** lugar onde se vê o estado do projeto.
> Ele substitui o Plano Mestre, o Plano de Execução e o Plano de Correções Visuais, arquivados em [`arquivo/`](arquivo/) apenas como origem do conteúdo. **Os arquivados não são seguidos.** Se algo estiver só neles, é lacuna deste plano e deve ser trazido para cá.

## Sumário

1. [Regras de trabalho](#1-regras-de-trabalho)
2. [Produto](#2-produto)
3. [Decisões que unificaram os planos](#3-decisões-que-unificaram-os-planos)
4. [Arquitetura e stack](#4-arquitetura-e-stack)
5. [Fontes de dados](#5-fontes-de-dados)
6. [Módulos](#6-módulos)
7. [Plataforma e operação](#7-plataforma-e-operação)
8. [Jurídico e conformidade](#8-jurídico-e-conformidade)
9. [Qualidade e testes](#9-qualidade-e-testes)
10. [Roteiro e estado](#10-roteiro-e-estado)
11. [Riscos](#11-riscos)
12. [Decisões do responsável](#12-decisões-do-responsável)
13. [Anexos](#13-anexos)

---

## 1. Regras de trabalho

1. **Nada é implementado fora do §10.** Ideia nova entra no §10 como item, com "pronto quando", antes de virar código.
2. **Um item por branch** (`feat/<id>-resumo`), apagada depois de entrar na `main`. A `main` só recebe com o CI verde.
3. **Dado jurídico só entra com fonte** (ato, URL, data de leitura), registrada em [`produto/VERIFICACAO_FONTES.md`](produto/VERIFICACAO_FONTES.md). Sem fonte, o dado fica `pendente` e o resultado avisa. Só se verifica a **versão compilada** da lei, que já não traz o texto revogado. No Planalto, usar a URL `...compilado.htm` quando existir (códigos e decretos-lei, ex.: `del3689compilado.htm`); onde o Planalto só publica a página anotada, vale o texto que **não** está tachado: o `fetch_oficial.py` marca o tachado com `~~`, e trecho entre `~~` nunca é fonte de regra. Registrar a versão lida e a data.
4. **Mudou regra ou calendário? Rodou a suíte inteira.** O CI faz isso a cada push.
5. **Este arquivo é atualizado no mesmo commit** que muda o estado de um item. Estados: **feito**, **em curso**, **parcial**, **não iniciado**.
6. **Cada módulo funciona sozinho.** Um módulo usa o núcleo comum, mas não precisa de outro para funcionar.

---

## 2. Produto

### 2.1 Conceito

Plataforma jurídica com **quatro ferramentas autônomas**, cada uma com identidade e interface próprias. O erro a evitar é "digite qualquer coisa e pergunte ao assistente jurídico"; a pergunta do produto é "**o que você quer fazer?**", com quatro caminhos claros. IA é recurso opcional e medido, não o produto.

| Ferramenta | Pergunta que responde | Entrada típica | Resultado | Natureza |
|---|---|---|---|---|
| **Argumenta** | Como este documento argumenta? | Sentença, decisão, acórdão ou texto | Mapa de argumentos, teses, premissas e fragilidades | Estrutural, com IA |
| **NormaViva** | Qual é o estado desta norma? | Lei, artigo ou termo | Texto vigente, histórico, alterações, relações, jurisprudência | Determinístico (IA só no fim) |
| **TeseMap** | Como esta tese se relaciona com outras autoridades? | Tema, precedente ou dispositivo | Grafo de teses, precedentes, distinções e evolução | Grafo curado |
| **PrazoZero** | Qual é o prazo e como foi calculado? | Data, ato, tribunal e situação | Data final, memória de cálculo e eventos que alteraram o prazo | 100% determinístico, **sem IA** |

Cada ferramenta tem limite de escopo: o Argumenta não vira sistema de jurisprudência, o NormaViva não vira curso de legislação, o TeseMap não vira buscador genérico, o PrazoZero não vira agenda jurídica.

**Público:** profissionais do Direito, incluindo concurseiros, em linguagem técnica e precisa, sem jargão de software. **Tribunais prioritários:** STF e STJ; depois TRFs e TJs.

### 2.2 Navegação e interface

- Menu principal: **Início | Argumenta | NormaViva | TeseMap | PrazoZero | Meu espaço**. Nada de menus técnicos, agentes, modelos, provedores, bases vetoriais ou configurações de IA.
- A home tem quatro ações: *Analisar decisão* (Argumenta), *Consultar norma* (NormaViva), *Explorar tese* (TeseMap), *Calcular prazo* (PrazoZero); abaixo, apenas "Recentes" (última análise, norma, tese e cálculo).
- **Meu espaço** é a única área transversal: Análises, Normas salvas, Teses salvas e Prazos.
- **Pesquisa global** no topo identifica o tipo do que foi digitado ("Tema 1.076 STJ" → *Abrir no TeseMap*; "art. 489 CPC" → *Abrir no NormaViva*) sem misturar resultados de módulos na mesma tela.
- **Integrações são links, não dependências**, e só aparecem quando fazem sentido (ver §6.5).
- Rota do PrazoZero: `/prazozero`. Telas já existem (F1); o visual foi trabalhado e não é item do plano.

### 2.3 Regras de arquitetura de produto

- Entidades compartilhadas: Norma, Dispositivo, Precedente, Tribunal, Tese, Documento, Trecho, Fonte, Citação, Usuário.
- **Não compartilhar** o que pertence a um módulo: `ArgumentAnalysis`, `DeadlineCalculation`, `NormVersion`, `GraphLayout`.
- **Dado jurídico é dado versionado com procedência**, nunca constante no código (o calendário atual ainda é constante: ver F2-03).
- **IA nunca calcula prazo nem decide vigência.** IA só extrai e sugere, sempre marcada como sugestão e verificável.
- Resultados importantes são **estruturados** (schema validado), não texto livre.

### 2.4 Critério para liberar uma funcionalidade

Não é "100% juridicamente perfeito". É: **funcional** (executa), **rastreável** (mostra a origem), **corrigível** (o erro pode ser identificado), **seguro** (não inventa em silêncio informação crítica) e **compreensível** (o usuário entende o resultado). Há botão "reportar erro nesta informação", fila de triagem, correção versionada e registro público de correções.

### 2.5 O que NÃO construir agora

App mobile, rede social, editor completo de petições, gestão de escritório, CRM, protocolo judicial, acompanhamento processual, marketplace, dezenas de agentes, fine-tuning ou modelo próprio, banco de grafos dedicado, extensão de navegador, plano empresarial, busca vetorial.

---

## 3. Decisões que unificaram os planos

Onde os planos antigos divergiam, ficou assim. Qualquer item pode ser revisto pelo responsável.

| Tema | Mestre | Execução | **Decisão** |
|---|---|---|---|
| Numeração de fases | M0 a M10 | E0 a E5 | **F0 a F7** (§10) |
| Ordem dos módulos | PrazoZero, depois Argumenta, NormaViva, TeseMap | PrazoZero, NormaViva, TeseMap, Argumenta | **PrazoZero → NormaViva → TeseMap → Argumenta.** O Argumenta é o de maior risco (documentos sigilosos, IA, LGPD) e precisa de NormaViva e TeseMap para verificar citações. Do Mestre fica: cada módulo funciona sozinho e o MVP do Argumenta não faz pesquisa jurisprudencial automática. *Decidido nesta unificação; o responsável pode reverter.* |
| API | Fastify desde o início | Server Actions até haver cliente externo | **Execução.** Fastify só quando houver cliente externo (F7) |
| Banco e jobs | PostgreSQL + Supabase | + Drizzle + fila no Postgres (pg-boss) | **Execução** |
| Grafo e busca | Postgres (`nodes`/`edges`), texto antes de embeddings | idem | **Igual** |
| Testes | 100 cenários, 30 normas, 30 decisões, grafo mínimo | + propriedade, E2E, CI | **Somar** (§9) |
| Calendário forense | Lista de tipos de evento (§30) | Método com camadas e fonte obrigatória | **Método** em [`produto/METODO_CALENDARIO_FORENSE.md`](produto/METODO_CALENDARIO_FORENSE.md) |
| Repositórios de prazo (guardianlegis, feriados-brasil, DeHor-Labs) | Reaproveitar | Estudar | **Referência, não dependência.** O motor é próprio e testado; esses projetos servem para conferir regras e dados |
| Plano visual | Casca e identidade | Pausado | **Concluído e fora do roteiro** |
| IA | "Legal Intelligence Engine", saída estruturada | Multiprovedor com créditos | **Os dois:** camada única, schema Zod por tarefa, provedores trocáveis, créditos e teto |

---

## 4. Arquitetura e stack

### 4.1 Stack

| Camada | Escolha | Observação |
|---|---|---|
| Monorepo | pnpm workspaces | `apps/web` + `packages/{core,prazozero,normaviva,tesemap,argumenta}`; pnpm 11.19.0 fixado |
| Web | Next.js (App Router) + React + TypeScript | Tailwind 4 (F0-11); shadcn/ui + Radix para acessibilidade (F0-07) |
| Grafo | React Flow (xyflow) | Não criar canvas próprio |
| Banco, login, arquivos | PostgreSQL + Supabase (região São Paulo), RLS | Documentos de um usuário nunca acessíveis a outro; testes automatizados de RLS |
| Migrações | Drizzle (SQL explícito) | Esquema bitemporal do NormaViva |
| Jobs | `apps/worker` (Node) + pg-boss | Ingestões agendadas e análises longas (fila → processamento → resultado) |
| Documentos | Docling em worker Python isolado | Só quando o Argumenta começar; não criar antes |
| IA | Camada única com saída estruturada (Zod) | Instruções por tarefa (`argumenta.extrair_teses`, `tesemap.classificar_relacao` etc.), cada uma com objetivo, entradas, schema, regras, exemplos e versão |
| Datas | Datas civis puras (F0-10) | Hoje o motor usa UTC controlado; funciona e é testado |
| Testes | `node:test` + tsx hoje; Vitest, fast-check e Playwright planejados | |
| Observabilidade | Sentry, logs estruturados, uptime | F0-09 |
| E-mail | Resend (ou equivalente) | Transacional e alertas |
| Hospedagem | Vercel (web) + Supabase + worker (Fly.io/Railway) | |

### 4.2 Motor de IA (quando houver)

Usuário nunca vê modelo, temperatura, tokens, embeddings, prompt ou agente. Provedores: Gemini, Claude, ChatGPT atrás da mesma interface, com créditos por plano e teto global de gasto ([`produto/IA_E_PRECIFICACAO.md`](produto/IA_E_PRECIFICACAO.md)). Provedor no exterior é transferência internacional (LGPD, art. 33).

### 4.3 Modelo de dados (rascunho)

```text
tribunais(id, sigla, nome, esfera, uf)
calendario_eventos(id, tribunal_id|null, abrangencia, tipo, inicio, fim, efeito,
                   fonte_ato, fonte_url, verificado_em, verificado_por, versao)
regras_prazo(id, regime, ato, dias, base_legal, vigencia_inicio, vigencia_fim)

normas(id, urn_lex, tipo, numero, ano, ementa, fonte_url)
dispositivos(id, norma_id, caminho, rotulo)
versoes_dispositivo(id, dispositivo_id, texto, vigente_de, vigente_ate,        -- tempo do direito
                    conhecido_em, ato_modificador, tipo_alteracao, fonte_url, hash)  -- tempo do sistema

precedentes(id, tribunal, tipo, numero, enunciado, situacao, publicado_em, fonte_url)
relacoes(id, origem, destino, tipo, origem_dado[curado|sugerido_ia], validado_por)

usuarios, perfis, assinaturas, itens_salvos, auditoria(imutável)
```

---

## 5. Fontes de dados

Detalhe e testes de bancada em [`produto/FONTES_E_PIPELINES.md`](produto/FONTES_E_PIPELINES.md). Resumo do que existe de fato:

| Fonte | Oferece | Limite | Uso |
|---|---|---|---|
| **Planalto** | Texto oficial e consolidado, com "Redação dada pela Lei…" | Sem API; HTML a ser interpretado; exige User-Agent de navegador e decodificação windows-1252 | **Fonte primária** do texto e das versões (NormaViva) |
| **Legalize-BR** (`danalec/legalize-br`) | ~198 mil normas federais em Markdown, via LexML | Matéria-prima, não resolve vigência | Importação inicial; identidade, artigos, redações e consolidação são nossos |
| **LexML** | URN:LEX, metadados, OAI-PMH/SRU | Foco em metadados | Identidade canônica das normas |
| **Senado e Câmara (dados abertos)** | Matérias, tramitação, votações; resolvedor LexML | Câmara trata de projetos, não de texto vigente | Alertas de mudança em andamento |
| **STJ, Dados Abertos** | Espelhos de acórdãos, precedentes qualificados, decisões | Download de arquivos, sem tempo real; termo de uso | Temas repetitivos, súmulas, qualificados (TeseMap) |
| **STF, Corte Aberta** | CSV de temas e estatísticas | Sem API de jurisprudência; evitar scraping | Repercussão geral e súmulas vinculantes **curados** |
| **DataJud (CNJ)** | Metadados e movimentos por tribunal | **Não traz ementa nem inteiro teor**; chave pública, cotas | Chave de ligação (processo, órgão, classe) |
| **Comunica API / DJEN** | Intimações publicadas | Exige credenciais do CNJ | Fase tardia (F7); iniciar contato cedo |
| **Calendário forense** | Atos de cada tribunal | **Não há API nem padrão nacional** | Base própria curada, com fonte (§6.1) |
| **ForgeLex** (infra própria) | Índice STJ com procedência | Conector precisa de autorização | Adapter opcional (F4/F6); **integrar, não duplicar** |

**Direito autoral:** leis, decretos e decisões são de livre uso (Lei 9.610/1998, art. 8º, IV). Doutrina, anotações e resumos de terceiros **não** podem ser ingeridos sem licença.

**Acesso a sites oficiais:** `.gov.br` e `.jus.br` derrubam clientes sem User-Agent de navegador. Usar o script `~/.claude/scripts/fetch_oficial.py` (fora do repositório), que também decodifica corretamente o Planalto.

---

## 6. Módulos

### 6.1 PrazoZero

**Fluxo da tela:** "O que aconteceu?" (fui intimado · foi publicada uma decisão · quero recorrer · quero apresentar defesa · informar o prazo manualmente) → quando → qual tribunal → se necessário, qual cidade. Pergunta só o necessário.

**Resultado:** prazo final em destaque; **como foi calculado** (dia a dia, com os dias excluídos e o ato que os excluiu); **base utilizada** (artigos); **eventos considerados** (fins de semana, feriados, suspensão, recesso, indisponibilidade); botão *Adicionar ao calendário*.

**Regras do motor**
- **Determinístico.** A IA pode, no máximo, converter "recebi uma intimação para apelar" em (evento = intimação, ato = apelação, prazo = 15, regime = dias úteis); quem soma os dias é código.
- **Modo conservador (padrão):** mostra a data mais cedo, usando só dias com base verificada; se um dia ainda pendente a alterasse, devolve a data alternativa e qual dia a causaria. O modo `completo` inclui os pendentes.
- Cada dia não útil informa sua base: `lei_federal`, `ato_do_tribunal` ou `pendente`. O selo "calendário conferido" só aparece quando todos os anos do cálculo estão cobertos.
- Regimes: CPC (dias úteis), CLT (dias úteis, art. 775), CPP (corridos, art. 798). Prazos próprios de STF e STJ (recesso e férias coletivas) e de cada tribunal.

**Calendário forense em camadas** (da mais geral à mais específica): regras de contagem · catálogo de prazos · prazos diferenciados (Fazenda, MP, Defensoria, litisconsortes) · dias não úteis nacionais · por esfera (Lei 5.010, art. 62) · suspensões e recesso · eventos locais e extraordinários. **Cada evento tem fonte (ato e URL), abrangência, vigência e verificação.** Método completo, checklist por tribunal e catálogo inicial de prazos: [`produto/METODO_CALENDARIO_FORENSE.md`](produto/METODO_CALENDARIO_FORENSE.md). Fontes já lidas e dúvidas para o revisor: [`produto/VERIFICACAO_FONTES.md`](produto/VERIFICACAO_FONTES.md).

**Feriado municipal:** o sistema não calcula por padrão; avisa e exige comprovação (CPC, art. 1.003, § 6º).

### 6.2 NormaViva

**Interface:** barra "Pesquisar lei, artigo ou assunto" (`art. 489 CPC`, `Lei 14.133`, `desconsideração da personalidade jurídica`). Resultado: **texto vigente** · **em outra data** (qualquer data) · **o que mudou** (redação anterior → alteração legislativa → redação atual, com diff visual) · **linha do tempo** · **jurisprudência** associada · **dispositivos relacionados** (complementam, excepcionam, remetem).

**Motor temporal (coração do produto):** norma → dispositivo → versões com início e fim. "Como era o art. X em maio de 2019?" é resultado **determinístico, nunca gerado por IA**. Duas dimensões: vigência (tempo do direito) e conhecimento (tempo do sistema).

**Sequência:** NV1 pesquisa e texto atual · NV2 fragmentação em artigo, parágrafo, inciso, alínea (parser LC 95/98) · NV3 histórico de alterações (anotações "Redação dada…/Incluído…/Revogado…") · NV4 consulta temporal · NV5 diff visual · NV6 relações normativas · NV7 jurisprudência associada · NV8 explicação por IA, **por último**: a base jurídica vem primeiro.

**Atualização:** rotina diária (Planalto + feeds Câmara, Senado, LexML) com fila de revisão; mudança de página gera alerta em menos de 24 h. Todo texto exibido tem link para a fonte oficial e hash.

### 6.3 TeseMap

**Interface:** pesquisa por tema ("responsabilidade civil do Estado") → mapa com a hierarquia da tese (ação/omissão, específica/genérica). Clicar num nó abre: enunciado, tribunal, precedentes, fundamentos, normas, precedentes anteriores e posteriores, exceções, *distinguishing*, evolução.

**Nós:** tema · questão jurídica · tese · precedente · súmula · dispositivo · conceito · exceção · distinguishing · superação.
**Relações:** interpreta · aplica · cita · confirma · distingue · supera · restringe · amplia · diverge · fundamenta · relaciona-se.

**Dados:** `nodes` e `edges` no Postgres; migrar para banco de grafos só se volume e traversal provarem a necessidade. Toda relação tem procedência (`curado` ou `sugerido_ia`) e validação humana. **Corpus pequeno e declarado** ("N temas do STJ e M do STF"), com data da última atualização visível; não mapear toda a jurisprudência. Fontes por **adaptadores independentes** (`FonteJurisprudencial`: ForgeLex, STF, STJ, futuras); sem scraping acoplado à interface. A v1 usa o STJ (dados abertos ou ForgeLex). Referência arquitetural (não importar bases estrangeiras): `caselaw-mcp`.

### 6.4 Argumenta

**Tela inicial:** "Envie uma decisão para analisar" (arrastar PDF/DOCX ou colar texto) → **Analisar**. Nenhuma configuração obrigatória. Progresso: "Preparando documento… Identificando fundamentos… Construindo teses… Análise pronta."

**Resultado em seis abas:** Visão geral (decisão, resultado, partes, pedidos, questões) · Estrutura (relatório, preliminares, mérito, fundamentos, dispositivo) · **Teses** (cartão por tese: base, premissa, conclusão) · Mapa (fato → norma → interpretação → precedente → inferência → conclusão) · Fragilidades (premissa não demonstrada, salto lógico, fundamento incompleto, precedente aparentemente inadequado, fundamento autônomo não atacado, contradição, argumento circular) · Estratégias (atacar tese, defender tese, criar contratese, comparar com recurso; estas entram em F6).

**Pipeline em etapas previsíveis, cada uma com saída estruturada** (corrigir uma etapa não destrói o resto): 1 segmentar a decisão · 2 identificar questões jurídicas · 3 identificar conclusões · 4 identificar o fundamento de cada conclusão · 5 separar fatos, normas e precedentes · 6 reconstruir relações · 7 **verificar citações** (contra NormaViva e TeseMap; no MVP, ForgeLex opcional) · 8 detectar vulnerabilidades · 9 gerar o mapa.

**Documentos:** arquivo → formato → texto → OCR se preciso → páginas → parágrafos → âncoras → estrutura jurídica. Cada parágrafo preserva página, posição, texto original e id, para que uma tese diga "fundamentação na página 13, §§ 42–45". **Reaproveitar o Docling** (MIT); não escrever parser de PDF. O esquema argumentativo é **brasileiro e processual**; `trusthlt/mining-legal-arguments` (corpus europeu) serve só como referência de taxonomia e benchmark.

**Privacidade desde a primeira versão:** arquivos privados e criptografados, URLs temporárias, isolamento por usuário, exclusão pelo usuário, logs sem o texto integral, retenção clara e opção de exclusão automática. Análises privadas **nunca** entram no corpus geral. RIPD antes do lançamento.

### 6.5 Integrações entre módulos (F6)

| De → Para | Ação |
|---|---|
| Argumenta → NormaViva | ver dispositivo citado |
| Argumenta → TeseMap | explorar precedente |
| Argumenta → PrazoZero | calcular prazo decorrente da decisão |
| NormaViva → TeseMap | ver jurisprudência sobre o artigo |
| TeseMap → NormaViva | abrir dispositivo interpretado |
| PrazoZero → NormaViva | ver o fundamento legal da contagem |

Pesquisa de autoridade (localizar, verificar, obter metadados) passa por um **Jurisdiction Gateway** que fala com o ForgeLex; a análise do documento continua sendo do Argumenta.

---

## 7. Plataforma e operação

- **Conta e perfil:** e-mail e senha, Google, link mágico; verificação de e-mail; 2FA opcional; nome, profissão, OAB (declaratória), tribunal e UF padrão. Direitos LGPD no produto: exportar dados, excluir conta, revogar consentimento (art. 18).
- **Planos (hipóteses a validar):** *Gratuito* (ferramentas sem IA, uso razoável), *Pro* (uso ampliado, alertas por e-mail, `.ics`/PDF, histórico, créditos de IA) e *Pro Estudo* (concurseiros, preço menor). **Sem plano empresarial agora.** IA medida em créditos, com teto global. **Beta gratuito** até haver meio regular de cobrança e emissão fiscal. Cobrança com Pix Automático, cartão, boleto e NFS-e (ex.: Asaas). Informações claras e cancelamento (Decreto 7.962/2013) e arrependimento de 7 dias (CDC, art. 49). Detalhe: [`produto/IA_E_PRECIFICACAO.md`](produto/IA_E_PRECIFICACAO.md).
- **Ambientes:** `dev` → `staging` → `prod`; deploy automático por PR; migrações versionadas; backups com restauração testada; painel de saúde das ingestões; suporte (formulário e e-mail); página de status.
- **Segurança:** OWASP ASVS nível 1, CSP, rate limit, segredos fora do repositório, RLS com testes, revisão de dependências, backups com PITR. Toda ingestão é idempotente, com hash, e **falha de forma visível**.
- **Acessibilidade:** WCAG 2.2 AA. **Desempenho:** orçamento por página; cache de normas e calendário.
- **Documentação pública:** central de ajuda, metodologia (regras aplicadas, versões, limitações, registro de correções), manual do PrazoZero, changelog.

---

## 8. Jurídico e conformidade

| Item | Situação e ação |
|---|---|
| Pessoa jurídica | Ainda não há; decidir com contador antes de cobrar (CNAE, NFS-e). Até lá, beta gratuito |
| Marca | Busca exata "RATIONE" no INPI em 07/10/2026: nada; falta busca por radical e fonética (RATIO, RACION, RAZION), classes 9, 41, 42, 45, e depósito |
| Termos, contrato, privacidade, cookies, uso de IA, aviso legal | **Minutas redigidas** em [`juridico/`](juridico/); revisão por advogado de direito digital pendente |
| DPA e transferência internacional | Contratos com nuvem, e-mail, IA e pagamento (LGPD, art. 33) |
| ROPA, RIPD, encarregado (DPO) | RIPD antes do Argumenta; verificar enquadramento como agente de pequeno porte (Res. CD/ANPD 2/2022) |
| Política de IA | Transparência sobre sugestões automáticas; seguir as recomendações da OAB sobre IA generativa |
| Licenças de dados | Respeitar os termos de cada fonte (ex.: dados abertos do STJ) |
| Seguro | Avaliar seguro de responsabilidade civil/E&O **antes de cobrar pelo PrazoZero** |

Aviso permanente: ferramenta de apoio, não é aconselhamento jurídico; **a tempestividade deve ser conferida**.

---

## 9. Qualidade e testes

Sem transformar desenvolvimento em homologação interminável: validação automática, com a validação jurídica concentrada onde o erro custa caro.

| Módulo | Suíte | Estado |
|---|---|---|
| PrazoZero | ≥ 100 cenários com entrada, calendário, resultado esperado, fundamento e autor/data da validação; testes de propriedade (vencimento nunca em dia não útil; monotonicidade); oráculo independente em Python | 100 gerados, **0 validados por jurista** |
| NormaViva | ~30 normas com histórico conhecido (`data A → redação A`, `data B → redação B`) | não iniciado |
| Argumenta | ~30 decisões públicas com dispositivo, questão, tese principal e fundamentos; avalia-se a **extração estrutural**, não a concordância perfeita da IA | não iniciado |
| TeseMap | Grafo pequeno e conhecido (`A cita B`, `B interpreta C`, `D distingue B`), sem depender de terceiros | não iniciado |
| Transversal | CI a cada push; E2E dos fluxos críticos; regressão visual nas telas-chave; teste de RLS | CI feito |

---

## 10. Roteiro e estado

Prazos são hipóteses para **uma pessoa com assistência de IA** e devem ser recalibrados ao fim da F0.

### F0 — Fundação (~2 a 3 semanas)

| ID | Item | Estado | Pronto quando |
|---|---|---|---|
| F0-01 | Monorepo pnpm (web + 5 pacotes) | feito | `pnpm install && pnpm build` passam |
| F0-02 | CI no GitHub (tipos, testes, gabarito dos cenários, build) | feito | Verde na `main`; falha de teste reprova |
| F0-03 | Alertas de dependências (Dependabot) | feito | 6 de 6 em 07/10/2026: `postcss` e `postcss-selector-parser` por override; `braces` saiu do lockfile com a F0-11 (o Tailwind 4 não usa `micromatch`, `fast-glob` nem `chokidar`) |
| F0-04 | Manutenção do workflow | feito | Actions v7 (Node 24), runner `ubuntu-24.04`, Node 24 |
| F0-05 | Núcleo comum: entidades, tribunais, procedência | parcial | Esquemas Zod e 22 tribunais existem; faltam procedência e adaptadores |
| F0-06 | Banco, login e armazenamento (Supabase, São Paulo, RLS) | não iniciado | Login funciona; usuário A não lê dado do B (teste automatizado) |
| F0-07 | Design system com shadcn/ui | não iniciado | Hoje há tokens e componentes caseiros |
| F0-08 | Deploy em staging e produção | não iniciado | Merge na `main` publica em staging |
| F0-09 | Observabilidade (erros, logs, uptime) | não iniciado | Erro de produção chega ao painel |
| F0-10 | Núcleo de datas civis puras no motor | não iniciado | Motor sem `Date`/UTC; suíte inalterada |
| F0-11 | Migrar Tailwind 3 para 4, antes de o estilo crescer | feito | Tailwind 4.3.3. Visual comparado nos dois builds (estilos computados e geometria de todos os elementos, 9 páginas × claro/escuro × 2 larguras + 18 estados: abas do Argumenta, nós do TeseMap, opções do PrazoZero). Diferenças restantes, todas explicadas: campo de data 2 px mais baixo (preflight do v4), `divide-y` e `ring` com mecanismo novo e traço igual. `braces`, `autoprefixer` e o override de `postcss-selector-parser` saíram |
| F1-03 | Tipografia: decidir o `leading-*` declarado | não iniciado | No v3, `sm:text-*` anulava o `leading-*` do código a partir de `sm`; o v4 aplica o declarado. A migração **preservou o v3** com `sm:leading-*` em 6 elementos (home, resultado do PrazoZero, citação do NormaViva). Decidir se passa a valer o declarado (a data do resultado iria de 48 para 60 px) |
| F1-04 | Espaçamento: trocar `space-y-*` por `flex flex-col gap-*` | não iniciado | No v4, `space-y` é margem inferior: não vale em filho inline, não funciona com `<legend>` e soma com `mt-*` do filho. Cinco telas foram ajustadas na migração; converter o restante quando cada tela for revisitada (junto com F0-07) |

### F1 — Casca do produto

| ID | Item | Estado | Pronto quando |
|---|---|---|---|
| F1-01 | Rotas e homes definitivas de cada ferramenta e do Meu espaço | feito | Telas existem e compilam; **dados de NormaViva, TeseMap e Argumenta são digitados à mão** |
| F1-02 | Páginas de metodologia, termos e privacidade | parcial | Rascunhos; dependem da revisão jurídica (§8) |

### F2 — PrazoZero em produção (~6 a 8 semanas)

| ID | Item | Estado | Pronto quando |
|---|---|---|---|
| F2-01 | Motor CPC, CLT e CPP com memória de cálculo | feito | 120 testes verdes; gabarito de oráculo independente |
| F2-02 | Calendário verificado de STF e STJ | parcial | **Só 2026.** Falta 2027 quando as portarias saírem |
| F2-03 | Calendário como dado (tabela com fonte, vigência, verificação) e painel de curadoria | não iniciado | Hoje são constantes no código |
| F2-04 | Calendário de TRFs e TJs (portarias anuais) | não iniciado | Lei 5.010 já verificada para TRFs; faltam pontos facultativos por tribunal |
| F2-05 | Feriados estaduais e municipais | não iniciado | A tabela atual **não está conferida**; municipal exige comprovação |
| F2-06 | Aviso de prazo próprio no prazo em dobro (CPC 180 §2º, 183 §2º, 186 §4º) | feito | O resultado avisa que o benefício não vale quando a lei fixa prazo próprio e, se a origem for o Diário, que o prazo em dobro só começa com a intimação pessoal (art. 183 §1º). Texto dos artigos lido no Planalto; 2 testes novos |
| F2-07 | JEF e litisconsórcio. **JEF:** regime próprio, dias úteis (Lei 9.099, art. 12-A) e sem prazo em dobro para entes públicos (Lei 10.259, art. 9º; Lei 12.153, art. 7º); a suspensão de 20/12 a 20/01 no JEF fica **pendente** (modo conservador não suspende). **Art. 229:** só aviso, porque o dobro não vale em autos eletrônicos (§2º), que são a regra. **MP e Defensoria:** já cobertos pelo prazo em dobro (F2-06) | feito | Regime JEF no motor e na tela; aviso do art. 229; 9 cenários novos no oráculo (JEF, MP, Defensoria, litisconsórcio); leis lidas no Planalto. **Pendente:** a suspensão de 20/12 a 20/01 no JEF. Consultado em 07/10/2026: o Enunciado 165 do FONAJE trata de contagem contínua (superado pelo art. 12-A) e não do recesso; não achei texto primário sobre o recesso no JEF (o Enunciado 198 do FONAJEF só foi visto em resumo de busca) |
| F2-08 | Catálogo de prazos com base legal | feito | 26 prazos (24 processuais em CPC, CLT, CPP e JEF; 2 materiais fora do cálculo), cada um com base legal, versão lida e data; seletor agrupado na tela que ajusta o regime e mostra a base legal; 4 testes. Lido no texto vigente em 07/10/2026 |
| F2-15 | Verificar o recesso no JEF e os prazos criminais em STF e STJ (férias de janeiro e julho) | em curso | Fontes primárias lidas: Res. CNJ 244/2016, Portarias STJ/GP 584/2022 e 280/2023, comunicado do STF (Portaria GDG 218/2024). Motor, cenários e registro atualizados |
| F2-14 | Prazos materiais (decadência): mandado de segurança (120 dias) e ação rescisória (2 anos) | não iniciado | Estão no catálogo, mas a tela não os calcula; contagem própria (CPC art. 975, § 1º prorroga ao dia útil) |
| F2-09 | Suíte de 100 cenários **validados por jurista** | parcial | **100 gerados** e documento de revisão pronto ([`produto/REVISAO_CENARIOS.md`](produto/REVISAO_CENARIOS.md)); **0 validados**: falta a validação do revisor jurídico |
| F2-10 | Salvar cálculo, exportar PDF e `.ics`, alerta por e-mail (D-3, D-1) | parcial | `.ics` e salvar local existem; PDF e e-mail não |
| F2-11 | Dúvidas jurídicas abertas | em curso | 4 em `VERIFICACAO_FONTES.md` §7, aguardando o revisor |
| F2-13 | CPP: suspensão de 20/12 a 20/01 (art. 798-A, Lei 14.365/2022), salvo réu preso, Maria da Penha e medida urgente | feito | Defeito do F2-01 corrigido (a primeira leitura usou o CPP não compilado). Exceção marcável na tela e aviso; 4 cenários novos e 2 reescritos. **Em aberto:** as férias coletivas de janeiro e julho de STF e STJ não foram conferidas para prazos criminais |
| F2-12 | Relatório "o que pode alterar este prazo" | não iniciado | Lista, por cálculo, os atos que podem mudar a data |

**Pronto quando (fase):** 100 cenários verdes e validados; cada data de calendário com fonte e data de verificação; revisão jurídica registrada; beta fechado com 10 usuários sem erro de cálculo reportado.

### F3 — NormaViva (~8 a 10 semanas)

| ID | Item | Estado |
|---|---|---|
| F3-01 | Coleta do Planalto (CF, CC, CPC, CP, CPP, CLT, CDC + ~20 leis de maior uso) e importação do Legalize-BR | não iniciado |
| F3-02 | Parser LC 95/98 (artigo, parágrafo, inciso, alínea) | não iniciado |
| F3-03 | Versões a partir das anotações "Redação dada/Incluído/Revogado" (modelo bitemporal) | não iniciado |
| F3-04 | Consulta temporal, diff visual e linha do tempo | não iniciado |
| F3-05 | Relações normativas e busca textual (Postgres FTS) | não iniciado |
| F3-06 | Atualização diária com fila de revisão | não iniciado |
| F3-07 | 30 normas de teste com histórico conhecido | não iniciado |
| F3-08 | Explicação do dispositivo por IA (por último) | não iniciado |

Hoje há uma tela estática com 4 dispositivos digitados à mão. **Pronto quando (fase):** todo texto com link oficial e hash; mudança no Planalto gera alerta de revisão em menos de 24 h.

### F4 — TeseMap (~6 a 8 semanas)

| ID | Item | Estado |
|---|---|---|
| F4-01 | Ingestão do STJ (dados abertos): temas repetitivos, súmulas, precedentes qualificados | não iniciado |
| F4-02 | STF: temas de repercussão geral e súmulas vinculantes, curados, sem scraping | não iniciado |
| F4-03 | `nodes`/`edges` e `relacoes` com procedência e validação | não iniciado |
| F4-04 | Grafo com React Flow, navegação por tema e ligação com o NormaViva | não iniciado |
| F4-05 | Grafo mínimo conhecido como teste | não iniciado |
| F4-06 | Adapter ForgeLex (opcional) | não iniciado |

Hoje há uma tela estática com 2 grafos digitados à mão. **Pronto quando (fase):** cobertura declarada, data da última atualização visível, toda relação com procedência.

### F5 — Argumenta (~10 a 12 semanas)

| ID | Item | Estado |
|---|---|---|
| F5-01 | Upload seguro (PDF, DOCX, texto), armazenamento privado criptografado, exclusão pelo usuário | não iniciado |
| F5-02 | Worker Docling, parágrafos com âncoras (página e §) | não iniciado |
| F5-03 | Pipeline de 9 etapas com saída estruturada | não iniciado |
| F5-04 | Verificação de citações contra NormaViva e TeseMap | não iniciado |
| F5-05 | Corpus de 30 decisões públicas e métricas de revisão | não iniciado |
| F5-06 | Controle de custo por análise e limite por plano | não iniciado |
| F5-07 | Relatório de impacto (RIPD) | não iniciado |

Hoje há uma tela estática com 1 decisão fictícia. **Pronto quando (fase):** logs sem texto integral; retenção configurável; usuário exclui e confirma a remoção.

### F6 — Motores avançados e integrações

Argumenta: atacar, defender, contratese, recurso × decisão. NormaViva: versões temporais avançadas e diff. TeseMap: *distinguishing*, precedentes posteriores, evolução. PrazoZero: calendários de mais tribunais. Depois, as seis integrações do §6.5 e o Jurisdiction Gateway com o ForgeLex. **Antes disso cada módulo já deve funcionar isolado.** Estado: não iniciado.

### F7 — Refinamento e escala

Favoritos, histórico, compartilhamento, exportação, referências, atalhos, busca global, desempenho, mobile; depois multiusuário (escritório), API pública (Fastify), integração Comunica/DJEN, SEO e indicação. Estado: não iniciado.

### Trilhas transversais (não são código)

| ID | Item | Estado |
|---|---|---|
| T-01 | CNPJ e forma de cobrança | não iniciado |
| T-02 | Marca: busca por radical e fonética, classes, depósito | não iniciado |
| T-03 | Revisão das minutas jurídicas por advogado | parcial (minutas escritas) |
| T-04 | Preços de Pro e Pro Estudo; planilha de custo e teto de IA | não iniciado |
| T-05 | Horário fixo do responsável para validar calendário e cenários | não definido |
| T-06 | Testes de bancada das fontes (`FONTES_E_PIPELINES.md` §5) | liberados: os hosts passaram a responder pelo script de acesso |

### Próximos passos, em ordem

1. **F2-09**: validação dos 100 cenários pelo revisor jurídico (depende do responsável).
2. **F2-03**: calendário como dado.
3. **F0-06 em diante**, conforme as decisões do responsável (§12).

---

## 11. Riscos

| Risco | Prob./Impacto | Mitigação |
|---|---|---|
| Prazo calculado errado causa dano | Média / **Muito alto** | Calendário curado, modo conservador, validação jurídica, avisos, seguro |
| Calendário forense desatualizado | Alta / Alto | Painel de curadoria, verificação periódica, "verificado em" visível |
| STF/STJ sem API utilizável | Alta / Médio | Corpus curado e declarado; evitar scraping; ForgeLex |
| Mudança de layout do Planalto | Média / Médio | Parser com testes, alerta de diff, fila de revisão |
| Vazamento de documentos (Argumenta) | Baixa / Muito alto | Criptografia, RLS, retenção curta, RIPD; só depois das fases anteriores |
| Custo de IA fora de controle | Média / Médio | Limites por plano, cache, medição por análise |
| Escopo excessivo para uma pessoa | Alta / Alto | Beta só com PrazoZero; módulos entram por fase; regra 1 do §1 |
| Concorrentes estabelecidos | Média / Médio | Diferencial: memória de cálculo auditável e módulos conectados; validar com entrevistas |

---

## 12. Decisões do responsável

**Tomadas (07/10/2026):** público (profissionais do Direito e concurseiros); tribunais prioritários (STF e STJ); calendário parte dos prazos dos códigos, cruza com feriados nacionais e levanta tribunal a tribunal; sem plano empresarial; IA por API multiprovedor, sem tornar o site exclusivamente de IA; marca sem registro prévio; documentos jurídicos redigidos por Claude e revisados pelo responsável; integrações DataJud (metadados) e API de Legislação do Senado; manter um único plano; art. 229 do CPC só como aviso de atenção, porque os autos eletrônicos são a regra; só versões compiladas das leis são verificadas (§1, regra 3).

**Abertas**

| # | Decisão | Recomendação |
|---|---|---|
| 1 | ~~Alerta `braces`~~ | **Decidido em 07/10/2026:** migrar para o Tailwind 4 agora (F0-11), em vez de dispensar o alerta. Migrar depois, com o estilo grande, seria quase recomeçar |
| 2 | Pessoa jurídica ou autônomo para cobrar | Definir com contador; beta gratuito até lá |
| 3 | Preços e teto mensal de IA | Depois da planilha de custo e do beta |
| 4 | Horas semanais para validar calendário e cenários | Reservar horário fixo |
| 5 | Busca de marca por radical e fonética | Antes de investir mais em identidade |
| 6 | Acesso ao ForgeLex | Conectar quando for útil ao TeseMap |
| 7 | Ordem dos módulos (§3) | Manter; reverter só se houver razão de negócio |

---

## 13. Anexos

| Documento | Conteúdo |
|---|---|
| [`produto/METODO_CALENDARIO_FORENSE.md`](produto/METODO_CALENDARIO_FORENSE.md) | Camadas do calendário, checklist por tribunal, catálogo inicial de prazos, manutenção |
| [`produto/VERIFICACAO_FONTES.md`](produto/VERIFICACAO_FONTES.md) | Fontes lidas em 07/10/2026, correções feitas e dúvidas para o revisor jurídico |
| [`produto/REVISAO_CENARIOS.md`](produto/REVISAO_CENARIOS.md) | Os 100 cenários do PrazoZero para o revisor jurídico validar (gerado pelo oráculo; não editar à mão) |
| [`produto/FONTES_E_PIPELINES.md`](produto/FONTES_E_PIPELINES.md) | Viabilidade das fontes e testes de bancada |
| [`produto/IA_E_PRECIFICACAO.md`](produto/IA_E_PRECIFICACAO.md) | Uso de IA, créditos, planos e custos |
| [`juridico/`](juridico/) | Minutas de termos, privacidade, cookies, uso de IA e aviso legal |
| [`arquivo/`](arquivo/) | Planos anteriores (Mestre, Execução, Correções Visuais), só como origem do conteúdo |
