# Argumenta: análise de decisão colada (F5, primeira fatia)

> **Decisões do responsável (22/10/2026):** a F5 começa pelo **texto colado**, sem upload nem armazenamento (que esperam o RIPD, F5-07), e pelas **etapas 1 a 4** do pipeline do PLANO §6.4; a **pseudonimização é sempre ligada**; o modelo é o **Claude Haiku 5.5**, e o corpus de avaliação (F5-05) é que vai dizer se alguma etapa precisa de modelo maior. Qualquer mudança nessas regras precisa de nova decisão do responsável.
>
> As três etapas de IA são tarefas do **catálogo de tarefas de IA** ([`IA_TAREFAS.md`](IA_TAREFAS.md)) e seguem o contrato, o executor único e as travas descritos lá.

## 1. O que é

No `/argumenta`, a pessoa logada cola o texto de uma sentença, acórdão ou decisão e clica em **"Analisar decisão"**. A tela mostra:

- **Visão geral:** tipo de decisão, resultado, resumo e pedidos;
- **Estrutura:** as partes da decisão (cabeçalho, ementa, relatório, preliminares, fundamentação, dispositivo) com acesso aos trechos correspondentes;
- **Questões e fundamentos:** cada questão resolvida (preliminar, prejudicial, mérito ou acessória), a conclusão, como a alegação foi tratada (acolhida, rejeitada…) e os fundamentos dela (fato, prova, norma, precedente, doutrina, argumento), com a citação como aparece no texto.

Cada item permite localizar e destacar os **trechos originais** correspondentes, sem exibir a numeração técnica. O texto integral fica recolhido durante a leitura dos resultados e abre quando a pessoa escolhe “Consultar texto da decisão” ou “Ver no texto”; os trechos destacados aparecem em fluxo de leitura, sem cartões ou rótulos por fragmento. O modelo nunca escreve o trecho mostrado: só indica posições internas no texto preparado.

## 2. Fluxo

```text
navegador                                       servidor (/api/ia/<tarefa>)            modelo
─────────                                       ───────────────────────────            ──────
texto colado
 → segmentar em parágrafos (§1, §2…)
 → pseudonimizar (tabela fica no navegador)
 → argumenta-estrutura  { paragrafos } ───────→ confere formato e dado pessoal ──────→ estrutura
 → argumenta-questoes   { paragrafos } ───────→ idem ────────────────────────────────→ questões e conclusões
 → argumenta-fundamentos { paragrafos, questoes } → idem ────────────────────────────→ fundamentos
 ← respostas com marcadores → restaurar os dados reais só na tela
```

O código encadeia as etapas; se uma falha, "Tentar de novo" retoma dela, sem refazer as anteriores.

| Etapa do PLANO §6.4 | Onde |
|---|---|
| 1. segmentar a decisão | `segmentar` (código) e `argumenta-estrutura` (partes da decisão) |
| 2. identificar questões jurídicas · 3. identificar conclusões | `argumenta-questoes` |
| 4. identificar o fundamento de cada conclusão (e já separar fatos, normas e precedentes, parte da etapa 5) | `argumenta-fundamentos` |
| 5 a 9 (relações, verificação de citações, vulnerabilidades, mapa) | ainda não |

## 3. Regras fixas

| Regra | Como é garantida |
|---|---|
| Só sob demanda e só logado | Clique em "Analisar decisão"; a rota confere a sessão (401 sem ela) |
| Dados pessoais não saem do navegador | `prepararDecisao` (`@ratione/argumenta`) troca nomes rotulados de partes e advogados, nomes ligados por "ajuizada por… em face de…", CPF, CNPJ, RG, OAB, número CNJ do processo, e-mail, telefone, CEP e endereço com número por marcadores (`[PARTE_1]`, `[CPF_1]`…). A tela mostra a lista do que foi trocado, o texto exatamente como será enviado e aceita outros nomes a ocultar |
| O servidor não aceita texto com dado pessoal detectável | `validarEntrada` roda a mesma detecção (`temDadoPessoal`) e recusa (400) se ainda achar algo |
| Pessoas jurídicas de direito público rotuladas (União, Estado, Município, INSS, Ministério Público…) ficam no texto | Não são dado pessoal e ajudam a análise; o usuário pode ocultá-las pela lista de nomes |
| Texto e resposta não ficam guardados | `guardaResultado: false`: o executor não lê nem grava o cache; o registro de uso (`ia_uso`) leva só o hash da decisão (`decisao:<16 hex>`) e o hash da mensagem; os logs só levam tarefa, referência e motivo. `analises` guarda metadados de uso, incluindo nome opcional e, nas novas análises, quantidade de parágrafos, sem conteúdo |
| Resposta só cita parágrafos que existem | `conferirSaida` descarta a resposta inteira se citar parágrafo fora da decisão, questão repetida ou fundamento de questão que não veio |
| Texto longo não é cortado em silêncio | Acima de 21.000 caracteres (cerca de 6 páginas) ou 800 parágrafos, a tela avisa e o servidor recusa (400) |
| Sem ferramentas, sem busca, sem dado de outra base | `ferramentas: []`; o contexto é só a decisão enviada |

## 4. Limites

| Limite | Valor |
|---|---|
| Cota | **do plano do usuário**, por análise rápida: Gratuito 3 por semana, Essencial 40 e Profissional 150 por mês ([`PLANOS_E_COBRANCA.md`](PLANOS_E_COBRANCA.md) §2.2). A cota é conferida uma vez, ao iniciar a análise (`POST /api/analises`); as três etapas carregam o mesmo `analiseId`. A análise passa a contar quando a **1ª etapa** é entregue; falha sem solução **estorna**. "Tentar de novo" continua a mesma análise |
| Mensagem | 30.000 caracteres (a decisão até 21.000, mais até 10 questões na etapa de fundamentos) |
| Resposta | 3.000 tokens (estrutura) e 4.000 (questões, fundamentos). O raciocínio do modelo conta dentro desse limite; por isso a etapa de fundamentos roda em esforço **baixo** (30/10/2026: em esforço médio, numa decisão de 97 parágrafos, 2.946 de 4.581 tokens foram só raciocínio e a resposta foi cortada; em baixo, 2.142 tokens, sem raciocínio) |
| Itens | até 15 pedidos, 15 partes, 10 questões e 30 fundamentos |
| Custo estimado | cerca de US$ 0,004 por análise com o Haiku 5.5 (três chamadas; conferido em 23/10/2026 com os preços de `politica.ts` e com o gasto do Console da Anthropic) |

## 5. Limitações conhecidas

- A pseudonimização acha identificadores formatados e nomes **rotulados**; um nome citado só no meio do texto, sem rótulo, passa, se o usuário não o acrescentar à lista. Por isso a tela mostra o texto como será enviado.
- A segmentação de texto copiado de PDF usa heurística (linha mais curta terminada em ponto encerra o parágrafo; título em caixa alta e linha com rótulo ficam sozinhos). Não há página: a âncora é o parágrafo. Página e posição vêm com o Docling (F5-02).
- A citação é a do texto. O selo da F5-04 (§8) diz se a base do Ratione a tem, mas não se ela está certa nem o que o precedente afirma.
- Sem fragilidades, teses, mapa nem estratégias: a análise de exemplo, abaixo do formulário, mostra aonde o módulo vai chegar.

## 6. Avaliação (F5-05)

O corpus de **30 decisões públicas** avalia a **extração estrutural**, não a concordância perfeita com a IA. Para cada decisão: fonte e data de acesso, texto, e o esperado conferido por jurista (`validado_por`): intervalo do dispositivo, questões com a conclusão e os parágrafos, e os fundamentos citados (normas e precedentes). Métricas: acerto do intervalo do dispositivo, questões esperadas encontradas (por sobreposição de parágrafos), citações esperadas encontradas e taxa de saídas descartadas. **Ferramentas prontas (25/10/2026):** `pnpm --filter web avaliacao` cria o caso, gera a folha de conferência, valida o gabarito, roda o pipeline (com `--confirmar`, por gastar dinheiro) e escreve o relatório; fluxo e definição de cada métrica em [`packages/argumenta/corpus/LEIA-ME.md`](../../packages/argumenta/corpus/LEIA-ME.md). **Estado (30/10/2026):** 14 de 30 decisões validadas (STJ, TRF4 e TST; penal, civil, tributário, administrativo, previdenciário e trabalhista) e três rodadas reais com o Haiku 5.5 (a última sobre as 14: dispositivo 12 de 14, questões 23 de 29, citações 52 de 62, US$ 0,0051 por decisão, depois de alinhar os gabaritos); faltam 16, com TJs e sentenças. A régua de questões e de citações está descrita no `LEIA-ME` do corpus, com o histórico da mudança.

## 7. Ligar

As tarefas usam a mesma chave da IA do resto do site (`IA_EXPLICACAO_LIGADA=sim` e `ANTHROPIC_API_KEY` no servidor; `NEXT_PUBLIC_IA_EXPLICACAO=sim` no build para mostrar o formulário). Exige a migração `20261023000001_planos_e_analises.sql` (planos, análises e a cota por análise), **aplicada antes** de publicar este código (`supabase/LEIA-ME.md`). A contagem de parágrafos das novas análises também exige `20261024000002_tamanho_analise.sql` antes de disponibilizar o frontend novo (§4.2 de `PLANOS_E_COBRANCA.md`); nesta entrega só foi aplicada em teste local. Sem a IA ligada, a tela mostra só a análise de exemplo.

## 8. Verificação de citações (F5-04)

Depois que os fundamentos chegam, a tela confere a **citação** de cada um (`"CDC, art. 14"`, `"Súmula 479 do STJ"`) contra o corpus público e mostra um selo ao lado dela. É **código, sem IA**: `lib/argumenta/citacoes.ts` reconhece o formato e `lib/argumenta/verificarCitacoes.ts` consulta o banco.

| Reconhece | Confere em | Selo |
|---|---|---|
| Artigo de uma das 28 normas (com parágrafo, inciso ou alínea) e lei por número e ano | `dispositivos` e `normas` (NormaViva) | **Encontrada na base**, com link; se só o artigo existe, avisa que o detalhe não foi conferido |
| Súmula do STF ou do STJ, vinculante ou não; tema de repercussão geral (STF) ou repetitivo (STJ) | `tesemap_nos` (TeseMap) | **Encontrada na base**, com link, ou **Não localizada na base** |
| ADI, ADPF, ADC e ADO | `tesemap_nos` | **Encontrada** ou **Fora da base** (a base só tem as de mérito julgado) |
| Norma ou súmula de outro tribunal, lei fora das 28 | não confere | **Fora da base** |

**Regras.** O selo diz se a base do Ratione tem a citação; **não diz que ela esteja certa ou errada**, e não confere o que o precedente afirma. Doutrina, recurso (`REsp 1.234.567`), "art. 14" sem norma e várias súmulas numa citação só ficam **sem selo**, e falha de leitura também: na dúvida, a tela não afirma nada. A leitura é a de qualquer visitante (chave publicável, RLS), feita pelo navegador; **só a string da citação sai da página**, nunca o texto da decisão, e nada é gravado. No máximo 60 citações distintas por análise.

**Conferência no banco de produção (25/10/2026, como visitante anônimo, só leitura):** `STJ-TEMA-1076`, `STF-RG-660` e `STF-ADI-4675` existem pelo id; `Súmula 479` (STJ), `SV 10` e `Súmula 339` (STF) existem por `tribunal` + `numero_referencia`; `art. 14` do CDC e `art. 85, § 2º` do CPC existem em `dispositivos`; `art. 9999` do CDC não existe. É o formato em que o reconhecedor monta a consulta.
