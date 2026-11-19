# ForgeLex — plano de implementação do novo fluxo e da integração com o Ratione

Nov 9, 2026 · @Boni

O novo fluxo entra primeiro, em seis fases atrás das flags que o ForgeLex já usa, com a Mesa como centro. A integração com o Ratione vem depois, por contrato entre serviços, e só reaproveita pontos de extensão deixados na fase 2.

## Ordem de execução

&#91;embedded content: roadmap · 6 fases da Trilha A, 7 etapas da Trilha B, 1 gate\]

A Trilha A segue em ordem. Da Trilha B, só B0 e B2 (auditoria e API no Ratione) andam em paralelo; B1, B3 e B4 esperam a Mesa com o ponto de extensão pronto; B5 e B6 esperam decisão de produto.

## Premissas já decididas

- Rascunho e Revisão deixam de ser ferramentas independentes: a peça vive na Mesa, em painel ao lado da conversa, no estilo de artefatos. O código já aponta nessa direção (`WritingDeskScreen` integra o chat e o `DraftStudioScreen` em modo integrado).
- A Jurisprudência continua ferramenta independente. Com um caso selecionado, a busca passa a ser ancorada nas questões jurídicas do caso; sem caso, é a busca comum de hoje.
- Dois selos que nunca se misturam: **aderência** (análise da IA, rotulada como tal) e **verificada** (conferência contra a fonte, gratuita). A aderência aparece como frase (aproxima / distancia), nunca como percentual.
- O caso entra por três caminhos: tela Casos, a própria Mesa ("Criar caso a partir desta conversa") e o MCP. Só o nome é obrigatório.
- Escopo comercial de jurisprudência continua sendo o STJ, com busca textual no Postgres. Nada do Ratione entra como pesquisa do ForgeLex nem é cobrado como tal.
- Toda fase sai atrás das flags `VITE_FORGELEX_AGENTIC_WORKSPACE_ENABLED`, `VITE_FORGELEX_CASE_WORKSPACE_ENABLED` e `VITE_FORGELEX_SAVED_RESEARCH_ENABLED`, hoje com padrão `false` no `cloudbuild.yaml`. O visual novo e o fluxo novo podem ser ligados separadamente.

## Trilha A · Fase 0 — fundação visual

Objetivo: o sistema branco gelo existir como tokens, sem mudar nenhuma tela ainda.

| Entrega | Onde | Aceite |
| --- | --- | --- |
| Tokens de cor (fundo #F4F7F8, superfície #FFFFFF, borda #DCE4E7, petróleo #0F5C6E / #0B4552, texto #101619, apoio #4C585F e #67727A, verde #1F6B4C) | `apps/web/tailwind.config.js` e `src/index.css`, como variáveis CSS | Nenhuma cor literal nova em componentes; só tokens |
| Tipografia: Spectral para títulos e texto jurídico, Inter para interface | `index.html` (fontes) e `tailwind.config.js` | Fontes carregam com fallback; sem salto de layout visível |
| Contraste corrigido: o cinza de apoio #8B959C reprova AA e vira #67727A | tokens | `axe` sem violação de contraste nas telas existentes |
| Primitivos: botão primário e fantasma, cartão, selo, campo, foco visível | `src/components/ui` (ou equivalente existente) | Foco por teclado com contorno de 2 px petróleo |
| Flag de aparência separada (`VITE_FORGELEX_NEW_UI_ENABLED`, a criar) | `cloudbuild.yaml` e leitura no `App.tsx` | Com a flag desligada, a interface atual não muda um pixel |

Tamanho: pequeno. Risco principal: os testes e2e Playwright localizam por papel e rótulo, não por classe, então trocar estilo não deve quebrá-los; qualquer teste que dependa de texto precisa ser conferido contra `tests/public-copy.test.ts`.

## Trilha A · Fase 1 — casca e telas públicas

Objetivo: navegação e portas de entrada no visual novo, sem tocar no fluxo de trabalho.

| Entrega | Onde | Aceite |
| --- | --- | --- |
| Lateral com Mesa, Casos e Jurisprudência, e conta no rodapé | `Sidebar.tsx`, `navigation/routes.ts` | Rotas e redirecionamentos antigos (Rascunho e Revisão para a Mesa) continuam funcionando |
| Cabeçalho enxuto | `Header.tsx` | Sem item que leve a ferramenta removida |
| Entrar e Produto | telas públicas | O título aprovado exigido por `public-copy.test.ts` permanece; o título do protótipo ("Do caso à minuta…") não entra |
| Visão com cartão "Primeiros passos" que o usuário pode ocultar | tela de visão geral | Estado oculto persiste por usuário |
| "Consulta processual" renomeada para "Andamento processual" | rotas e rótulos | Testes de cópia atualizados no mesmo commit |

Tamanho: pequeno a médio. Pode ir a produção sozinha, porque não depende de nada do fluxo.

## Trilha A · Fase 2 — Mesa com a peça integrada

Objetivo: o núcleo do produto. Conversa à esquerda, peça à direita, caso escolhido no cabeçalho. É a fase maior e a que decide se o restante faz sentido.

| Entrega | Onde | Aceite |
| --- | --- | --- |
| Layout em duas colunas: chat e painel da peça com abas Texto, Fontes e Revisão | `WritingDeskScreen.tsx`, `AgenticWorkspaceScreen.tsx`, `agentic-workspace/*` | A peça abre sem sair da Mesa; fechar o painel devolve a conversa inteira |
| Revisão como aba: sugestões da IA aceitas ou recusadas uma a uma, "aplicar aceitas" gera nova versão | `DraftStudioScreen` em modo integrado, `desk-model.ts` | Versão anterior recuperável; nada é aplicado sem aceite |
| Seletor de caso no cabeçalho, com a opção "Sem caso — somente texto" | cabeçalho da Mesa, estado do caso | Trocar de caso não apaga a conversa; sem caso, o fluxo não pergunta fatos nem pede aprovação de prova central |
| "Criar caso a partir desta conversa" | Mesa e API `/api/v2/matters` | O caso nasce só com nome; fatos e documentos são opcionais |
| Estado vazio com exemplos, glossário e a explicação dos dois selos | `Composer.tsx` e vazio da Mesa | Primeiro uso entendido sem ler documentação |
| Etapas do trabalho visíveis (status, pergunta, aprovação, resultado) a partir dos eventos STATUS, QUESTION, DELIVERY, DEBIT, ERROR | `packages/legal-workflows/src/agentic-case-task` | Cada evento tem representação visual; ERROR nunca fica mudo |
| **Ponto de extensão para a Trilha B**: a aba Fontes e o modelo de selos aceitam uma terceira origem, com rótulo e fonte próprios | modelo de fontes e selos | Nenhuma lógica do Ratione ainda; só o espaço e o tipo de dado |

Tamanho: grande. Entrega em duas partes: layout e revisão primeiro, depois seletor de caso e criação de caso.

## Trilha A · Fase 3 — busca ancorada no caso

Objetivo: a Jurisprudência e a aba Fontes passam a trabalhar a partir das questões do caso.

| Entrega | Onde | Aceite |
| --- | --- | --- |
| Interruptor "Pesquisar com o caso" na Jurisprudência, com o caso escolhido | `ResearchDeskScreen.tsx` | Desligado, a busca é idêntica à atual |
| Consultas geradas a partir das questões jurídicas (Q1, Q2, Q3), mostradas ao usuário antes de gastar | `legal-researcher` e `coveredIssueIds` no grafo de orquestração | O usuário vê as consultas usadas e pode editá-las |
| Teto de custo visível ("até 3 · R$ 0,60") | composer e pesquisa | A execução para no teto; a cobrança debita só o realizado |
| Aderência por resultado em uma frase (aproxima / distancia), rotulada "análise da IA" | resultados e `Decisao` | Nenhum número percentual; texto fixo "A análise não substitui a verificação" |
| "Verificar citação" gratuito e selo verificada / sem correspondência | busca FTS em `jurisprudence-repository.ts` | Verificação não consome saldo; divergência aparece sem ser completada pela plataforma |
| "Salvar na questão N do caso" e "Citar na peça da Mesa" | `Decisao`, API de autoridades e questões | A citação entra no parágrafo escolhido já com o selo |
| Lacuna de questão (Q3 sem fonte) com ação "Pesquisar" | aba Fontes | Achado volta como candidato, nunca como citação automática |

Decisão pendente de Boni: a tarifa da análise de aderência, que usa inferência própria. Sem decisão, a fase sai com a frase de aderência gerada junto da pesquisa de R$ 0,20 e sem cobrança adicional, com a tarifa marcada "a definir" no próprio produto.

Tamanho: médio a grande. A parte de inferência é a de maior risco; a verificação gratuita e o salvamento na questão podem sair antes.

## Trilha A · Fase 4 — Casos, Caso novo, Conectar e Conta

Objetivo: fechar o percurso Caso, Questões, Fontes, Peça, e deixar a conta compreensível.

| Entrega | Onde | Aceite |
| --- | --- | --- |
| Lista de casos com linha de situação e cobertura das questões (verificadas e lacunas) | tela Casos, `/api/v2/matters`, `issues`, `authorities` | A cobertura vem dos dados reais, não de contagem em tela |
| Caso novo: nome obrigatório; importar PDF ou colar texto como opção; aprovação da base com "Analisar documento" | tela Caso novo | Caso criado só com nome continua válido |
| "Outros jeitos de começar": pela Mesa e pela IA do cliente via MCP | Caso novo e Conectar | Os três caminhos produzem o mesmo objeto de caso |
| Conectar (MCP) com estado da conexão e instrução por assistente | tela Conectar, `forgelex.connection_status` | Estado da conexão confere sem consumir saldo |
| Conta com saldo pré-pago em reais, extrato e tabela de custos por operação | tela Conta | Valores exibidos batem com os debitados nos eventos DEBIT |

Tamanho: médio. Os botões hoje inertes no protótipo (Decisão e Conta) precisam de comportamento real ou sair da tela.

## Trilha A · Fase 5 — acabamento e liberação

Objetivo: o fluxo novo ficar ligerável em produção com segurança.

- **Mobile:** o painel da peça vira abas Conversa e Peça abaixo de 768 px; composer fixo no rodapé; alvos de toque de 44 px.
- **Acessibilidade:** `axe` WCAG 2.1 AA em todas as telas novas, ordem de foco entre chat e painel, anúncio de eventos STATUS e ERROR para leitor de tela, estado de foco visível em todos os primitivos.
- **Estados de erro e vazio:** pesquisa sem resultado, falha de verificação, saldo insuficiente, caso sem questões.
- **Liberação:** primeiro para a conta de Boni (flag por ambiente), depois para um grupo pequeno, depois geral. Conferir o valor real das três flags no último deploy antes de começar, porque o padrão do `cloudbuild.yaml` é `false`.
- **Reversibilidade:** desligar as flags devolve a interface anterior sem migração de dados.

Tamanho: médio.

## Trilha B · integração com o Ratione

Princípio: integração por contrato entre serviços. Nenhum código é fundido: o ForgeLex (Vite, React 18, Tailwind 3) e o Ratione (Next 16, React 19, Tailwind 4, shadcn) continuam repositórios, bancos e deploys separados. O ForgeLex trata o Ratione como fonte externa, com selo próprio, distinta de "verificada" (que continua significando conferido no índice do STJ).

| Etapa | Lado ForgeLex | Lado Ratione | Depende de | Aceite |
| --- | --- | --- | --- | --- |
| B0 — auditoria | Confirmar se os dois usam o mesmo projeto Supabase e a mesma autenticação; ler `legislation-catalog.ts` para medir o que já existe de legislação | Confirmar rotas e parâmetros aceitos em PrazoZero, NormaViva e TeseMap | Nada | Documento curto com a resposta, que define o desenho de B2 |
| B1 — links profundos | Artigo citado na peça abre o NormaViva; tema ou súmula abre o TeseMap; movimentação do DataJud abre o PrazoZero com a data preenchida | Páginas passam a aceitar parâmetros na URL | Fase 2 (peça e Fontes) e Fase 1 (andamento) | Link abre o item certo, em nova aba, sem enviar dados do caso na URL |
| B2 — API de serviço somente leitura | Cliente HTTP com chave de serviço, cache e tempo limite | Endpoints de prazo, texto de norma em uma data e precedentes por tema ou dispositivo; autenticação entre servidores; sem estado do usuário | B0 | Sem chave válida, nega; sem IA no caminho; resposta determinística e versionada |
| B3 — selos na Mesa | Terceiro selo "conferida no Ratione": norma vigente na data do fato; "alcançada pelo Tema X" por questão na aba Fontes; prazo dentro do caso | Nada novo | Fase 2 (ponto de extensão) e B2 | O selo cita a fonte e a data de consulta; precedente do STF aparece como fonte Ratione, nunca como pesquisa cobrada do ForgeLex |
| B4 — MCP | Ferramentas do MCP do ForgeLex que repassam B2 ao assistente do cliente (prazo, norma na data, tema aplicável) | Mesmos endpoints | B3 | Funções separadas das tools `research_*` e do módulo de agentes comerciais, que permanece independente |
| B5 — Argumenta no caso | "Analisar documento" chama o Argumenta para ler a decisão recorrida e alimentar questões | Chamada sem guardar texto nem resultado, conforme `docs/juridico/RIPD_ARGUMENTA.md` | B3, política de retenção e cobrança decididas | Nenhum texto do caso persiste no Ratione; usuário vê que o documento será enviado antes de confirmar |
| B6 — conta e cobrança | Login único e saldo único, se decidido | Planos com cota hoje, com Mercado Pago desligado | Decisão de produto | Só depois de B3 em uso real |

As etapas B0 a B4 servem tanto para dois produtos ligados quanto para um produto com o Ratione como área de ferramentas; B5 e B6 são as que exigem escolher entre os dois caminhos.

Tamanho: B0 e B1 pequenas; B2 média (no Ratione); B3 média; B4 pequena; B5 e B6 grandes.

## Verificação e critérios de aceite

As verificações existentes do projeto valem para cada fase, e os acréscimos abaixo são por fase.

| Fase | Verificação específica |
| --- | --- |
| 0 e 1 | Suite e2e Playwright sem alteração de seletor; `axe` sem violações; `tests/public-copy.test.ts` verde com os textos aprovados |
| 2 | E2E novo: abrir Mesa, escolher caso, receber peça, aceitar uma sugestão, aplicar, recuperar a versão anterior; E2E sem caso |
| 3 | Teste de que o interruptor desligado reproduz a busca atual; teste de teto de custo (não ultrapassa); teste de que verificar não debita |
| 4 | Os três caminhos de criação produzem o mesmo caso; cobertura exibida bate com `issues` e `authorities` |
| 5 | Passada manual em 360 px e 768 px; leitor de tela nos eventos STATUS e ERROR; rollback pela flag |
| B2 a B4 | Teste de contrato entre os dois serviços; falha do Ratione não derruba a Mesa (selo some, aviso aparece) |

Regra comum: nenhum selo "verificada" sai de fonte que não seja o índice do STJ, e nenhum selo de aderência aparece sem o rótulo "análise da IA".

## Riscos e decisões em aberto

| Item | Risco ou pergunta | Quem decide |
| --- | --- | --- |
| Tarifa da aderência | Inferência própria tem custo; sem tarifa, o custo sai da margem da pesquisa de R$ 0,20 | Boni |
| Mesmo Supabase? | Define se o login único é simples ou exige troca de token | Auditoria B0 |
| Escopo do STF | Os dados do TeseMap incluem STF; o escopo comercial do ForgeLex é só STJ | Boni: aparecer como fonte Ratione, separada |
| Argumenta e privacidade | O caso do ForgeLex guarda documentos; o Argumenta não guarda | Boni, com o RIPD do Argumenta |
| Dois sistemas de design | Ratione usa petróleo e névoa; o ForgeLex ficará em branco gelo | Convergir para um conjunto de tokens na Fase 0 |
| Título do hero | O do protótipo diverge do aprovado exigido pelo teste de cópia | Boni escolhe qual vale |
| Corpus e validação humana | Cobertura do TeseMap depende de validação manual; selo não pode prometer mais do que o corpus cobre | Mostrar "sem cobertura" quando não houver nó |
| Dois produtos ou um | Decide se B5 e B6 acontecem | Boni, depois de B3 em uso |
