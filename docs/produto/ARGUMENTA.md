# Argumenta: análise de decisão colada (F5, primeira fatia)

> **Decisões do responsável (22/10/2026):** a F5 começa pelo **texto colado**, sem upload nem armazenamento (que esperam o RIPD, F5-07), e pelas **etapas 1 a 4** do pipeline do PLANO §6.4; a **pseudonimização é sempre ligada**; o modelo é o **Claude Haiku 5.5**, e o corpus de avaliação (F5-05) é que vai dizer se alguma etapa precisa de modelo maior. Qualquer mudança nessas regras precisa de nova decisão do responsável.
>
> As três etapas de IA são tarefas do **catálogo de tarefas de IA** ([`IA_TAREFAS.md`](IA_TAREFAS.md)) e seguem o contrato, o executor único e as travas descritos lá.

## 1. O que é

No `/argumenta`, a pessoa logada cola o texto de uma sentença, acórdão ou decisão e clica em **"Analisar decisão"**. A tela mostra:

- **Visão geral:** tipo de decisão, resultado, resumo e pedidos;
- **Estrutura:** as partes da decisão (cabeçalho, ementa, relatório, preliminares, fundamentação, dispositivo) com o intervalo de parágrafos;
- **Questões e fundamentos:** cada questão resolvida (preliminar, prejudicial, mérito ou acessória), a conclusão, como a alegação foi tratada (acolhida, rejeitada…) e os fundamentos dela (fato, prova, norma, precedente, doutrina, argumento), com a citação como aparece no texto.

Cada item aponta o parágrafo de origem (§), e o clique destaca o **texto original** do parágrafo ao lado. O modelo nunca escreve o trecho mostrado: só indica números de parágrafo.

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
| Nada fica guardado | `guardaResultado: false`: o executor não lê nem grava o cache; o registro de uso (`ia_uso`) leva só o hash da decisão (`decisao:<16 hex>`) e o hash da mensagem; os logs só levam tarefa, referência e motivo |
| Resposta só cita parágrafos que existem | `conferirSaida` descarta a resposta inteira se citar parágrafo fora da decisão, questão repetida ou fundamento de questão que não veio |
| Texto longo não é cortado em silêncio | Acima de 21.000 caracteres (cerca de 6 páginas) ou 800 parágrafos, a tela avisa e o servidor recusa (400) |
| Sem ferramentas, sem busca, sem dado de outra base | `ferramentas: []`; o contexto é só a decisão enviada |

## 4. Limites

| Limite | Valor |
|---|---|
| Cota por tarefa | 5 por dia e 40 por mês por usuário (uma análise usa uma de cada tarefa) |
| Mensagem | 30.000 caracteres (a decisão até 21.000, mais até 10 questões na etapa de fundamentos) |
| Resposta | 3.000 tokens (estrutura) e 4.000 (questões, fundamentos) |
| Itens | até 15 pedidos, 15 partes, 10 questões e 30 fundamentos |
| Custo estimado | cerca de US$ 0,01 por análise com o Haiku 5.5 (três chamadas de até ~10 mil tokens de entrada) |

## 5. Limitações conhecidas

- A pseudonimização acha identificadores formatados e nomes **rotulados**; um nome citado só no meio do texto, sem rótulo, passa, se o usuário não o acrescentar à lista. Por isso a tela mostra o texto como será enviado.
- A segmentação de texto copiado de PDF usa heurística (linha mais curta terminada em ponto encerra o parágrafo; título em caixa alta e linha com rótulo ficam sozinhos). Não há página: a âncora é o parágrafo. Página e posição vêm com o Docling (F5-02).
- A citação é a do texto, **não verificada**: a verificação contra NormaViva e TeseMap é a F5-04.
- Sem fragilidades, teses, mapa nem estratégias: a análise de exemplo, abaixo do formulário, mostra aonde o módulo vai chegar.

## 6. Avaliação (F5-05)

O corpus de **30 decisões públicas** avalia a **extração estrutural**, não a concordância perfeita com a IA. Para cada decisão: fonte e data de acesso, texto, e o esperado conferido por jurista (`validado_por`): intervalo do dispositivo, questões com a conclusão e os parágrafos, e os fundamentos citados (normas e precedentes). Métricas: acerto do intervalo do dispositivo, questões esperadas encontradas (por sobreposição de parágrafos), citações esperadas encontradas e taxa de saídas descartadas. Estado: formato definido; decisões ainda a reunir.

## 7. Ligar

As tarefas usam a mesma chave da IA do resto do site (`IA_EXPLICACAO_LIGADA=sim` e `ANTHROPIC_API_KEY` no servidor; `NEXT_PUBLIC_IA_EXPLICACAO=sim` no build para mostrar o formulário). Não há migração nova: o registro de uso usa as tabelas de `20261022000002_ia_tarefas.sql`. Sem a IA ligada, a tela mostra só a análise de exemplo.
