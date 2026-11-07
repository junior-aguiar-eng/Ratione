# IA no Ratione: catálogo de tarefas fechadas

> **Regra do produto (decisão do responsável, 22/10/2026):** a IA do Ratione **nunca conversa**. Cada uso é uma **tarefa fechada**, declarada no código com entrada, contexto, instruções, ferramentas, formato de saída e limites fixos, e o **código conduz tudo**: o que entra, o que o modelo recebe, a ordem dos passos, o que é conferido e o que aparece na tela. O modelo só preenche o formato de saída. Não existe recurso de pergunta livre nem de chat no site.

## 1. Por que

- **Previsível:** o mesmo pedido percorre sempre o mesmo caminho e só pode produzir os campos previstos. O texto que o modelo escreve pode variar, mas o comportamento do sistema não varia.
- **Seguro:** o usuário não escreve instruções ao modelo; o material que vem do usuário ou da base entra delimitado, como dado. Sem ferramentas e sem busca na web, o modelo não alcança nada fora do contexto que o código montou.
- **Barato e controlado:** resultado reaproveitado (cache), cota por usuário e por tarefa, teto de gasto mensal, custo de cada chamada registrado.
- **Verificável:** onde o resultado importa (ex.: se um artigo citado está revogado), quem decide é a base do Ratione, não o modelo.

## 2. O contrato de uma tarefa (`apps/web/src/lib/ia/contrato.ts`)

| Campo | O que fixa |
|---|---|
| `id` | Nome estável da tarefa (também a rota `/api/ia/<id>` e a coluna `tarefa` no banco) |
| `descricao`, `gatilho` | O que faz e onde o usuário dispara: sempre uma ação explícita na tela, nunca automático, nunca campo de conversa |
| `modelo`, `esforco`, `maxTokensSaida` | Modelo com preço registrado, esforço baixo ou médio, teto da resposta |
| `validarEntrada` | O que o usuário pode mandar (de preferência só identificadores); qualquer outra coisa é recusada |
| `montarContexto` | O que o servidor busca nas **fontes** (só leitura das bases do Ratione) para o modelo receber |
| `maxCaracteresMensagem` | Acima disso a tarefa recusa; texto não é cortado em silêncio |
| `instrucoes`, `mensagem` | Instruções fixas (sem data nem dado variável) e a mensagem com o material delimitado |
| `ferramentas` | Sempre vazio: etapas com consulta são código, fora do modelo |
| `esquemaSaida`, `saida`, `conferirSaida` | Formato fechado da resposta, validação no servidor e conferência opcional contra o contexto |
| `cota` (e `analiseDe`) | Como a tarefa conta na **cota do plano** do usuário ([`PLANOS_E_COBRANCA.md`](PLANOS_E_COBRANCA.md)): o tipo (`rapida`, `completa`, `explicacao`) e o modo. `por-chamada`: cada execução é uma análise própria (a explicação de dispositivo). `por-analise`: a tela inicia a análise (`POST /api/analises`), e a entrada traz o `analiseId` (`analiseDe` diz de onde tirá-lo); `consome` marca a etapa que passa a contar na cota e `conclui`, a última. As **quantidades** ficam no banco, por plano, não no contrato |
| `versao` | Muda quando instruções, mensagem ou esquema mudam (invalida o cache) |
| `guardaResultado` | Se a resposta vai para o cache compartilhado. **Falso quando a entrada é material do usuário** (decisão colada no Argumenta): aí nem o texto nem a resposta ficam no banco, só o registro de uso com o hash |

## 3. O executor único (`apps/web/src/lib/ia/executar.ts`)

Toda tarefa passa pela mesma sequência, que nenhuma tarefa altera:

1. IA ligada nesta instalação → 2. tarefa existe no catálogo → 3. usuário logado → 4. entrada válida → 5. contexto montado das fontes → 6. tamanho dentro do limite → 7. **cache** (se já existe, devolve sem custo e fora da cota; pulado quando `guardaResultado` é falso) → 8. **cota do plano**: a tarefa `por-chamada` inicia a própria análise (`analise_iniciar`, atômica: confere a cota do período do plano do usuário uma única vez); a `por-analise` usa a análise que a tela iniciou → 9. **reserva** atômica no banco (`ia_reservar`: a análise é do usuário e está em andamento, uma chamada de cada vez por usuário, orçamento do mês) → 10. **uma** chamada ao modelo, sem ferramentas → 11. validação da saída (formato e conferência) → 12. registro do custo real → 13. a análise é consumida (1ª etapa), concluída (última etapa ou chamada única) → 14. gravação no cache (também pulada quando `guardaResultado` é falso).

**Falha não consome a cota do cliente.** Falha, recusa e saída fora do formato são registradas no log e com o custo real em `ia_uso` (é custo nosso), mas a análise é tratada assim: na `por-chamada`, é cancelada e a vaga volta; na `por-analise`, a falha é contada (`analise_falha`): antes da 1ª etapa entregue, o cliente pode tentar de novo e a 3ª falha desiste; depois dela, a 2ª falha desiste e **estorna** a cota. Chamada servida do cache não gasta cota.

## 4. Tarefas de várias etapas

Quando um recurso precisa de mais de um passo (ex.: conferir as citações de um texto), **quem encadeia é o código**. O Argumenta já funciona assim: a tela chama `argumenta-estrutura`, `argumenta-questoes` e `argumenta-fundamentos` em sequência, e a última recebe as questões da anterior ([`ARGUMENTA.md`](ARGUMENTA.md)). Cada passo de IA é uma tarefa do catálogo, pequena e conferível; os passos de verificação são código determinístico sobre as bases do Ratione. Exemplo planejado (ainda não implementado):

1. tarefa `extrair-citacoes`: o modelo só lista as citações do texto, em formato fechado;
2. código: confere cada citação no NormaViva (existe, revogada, alterada desde quando);
3. código: monta o relatório com modelos de texto fixos.

O veredito sobre cada citação vem da base, nunca do modelo.

## 5. Travas automáticas (`apps/web/src/lib/ia/catalogo.test.ts`)

- Cada tarefa do catálogo tem o contrato completo e dentro dos tetos (`TETOS` em `politica.ts`): modelo com preço, esforço baixo ou médio, saída e mensagem limitadas, cota limitada, versão com data, sem ferramentas, instruções sem data, esquema fechado em todos os níveis, entrada vazia ou texto livre recusados.
- **Só `lib/ia/cliente.ts` importa o SDK da Anthropic** ou chama a API; **só a rota `/api/ia/[tarefa]` usa o cliente**, e sempre pelo executor. Qualquer outro caminho até o modelo faz o teste falhar.

## 6. Limites globais (`apps/web/src/lib/ia/politica.ts`)

| Limite | Valor |
|---|---|
| Orçamento de gasto do mês | **dois fundos** na tabela `ia_fundos` do banco, somando todas as tarefas de cada grupo: `gratuito` US$ 15 (quem está no plano Gratuito) e `pagantes` US$ 5 (quem tem plano pago). Um fundo que acaba não derruba o outro. Ajuste: `update public.ia_fundos set orcamento_mes_usd = … where fundo = …`; situação: `select * from public.ia_fundos_situacao();` ([`PLANOS_E_COBRANCA.md`](PLANOS_E_COBRANCA.md) §3.2). A variável `IA_ORCAMENTO_MES_USD` deixou de existir |
| Uma chamada de cada vez por usuário | em todas as tarefas |
| Cota de uso | **do plano do usuário**, por análise e por período (Gratuito: semana; pagos: ciclo de cobrança), conferida uma vez ao iniciar a análise; quantidades em `plano_cotas` (migração `20261023000001`). As variáveis `IA_LIMITE_DIA` e `IA_LIMITE_MES` deixaram de existir |
| Teto de resposta / mensagem | 7.000 tokens (a etapa de fundamentos; as outras usam 3.000 e 4.000) / 85.000 caracteres (tempo máximo por chamada: 45 s) |
| Modelos | só com preço registrado (hoje, Claude Haiku 5.5) |

## 7. Como acrescentar uma tarefa

1. Decisão do responsável sobre o recurso (o que faz, para quem, limites).
2. Arquivo em `apps/web/src/lib/ia/tarefas/` com o contrato completo; se precisar de dado novo, uma fonte de leitura em `lib/ia/fontes/` e no tipo `Fontes`.
3. Registro em `lib/ia/catalogo.ts` e uma linha na tabela do §8.
4. Testes da tarefa (entrada recusada, mensagem, saída) e, na tela, um botão que chama `/api/ia/<id>` com `{ entrada }`.

## 8. Tarefas do catálogo

| Tarefa | O que faz | Gatilho | Limite | Especificação |
|---|---|---|---|---|
| `explicar-dispositivo` | Explica o dispositivo aberto no NormaViva, só a partir do texto oficial | Botão "Explicar com IA" (logado) | 5/dia, 60/mês | [`EXPLICACAO_IA.md`](EXPLICACAO_IA.md) |
| `argumenta-estrutura` | Partes da decisão colada, resultado, resumo e pedidos | Botão "Analisar decisão" (logado), 1ª etapa | 5/dia, 40/mês | [`ARGUMENTA.md`](ARGUMENTA.md) |
| `argumenta-questoes` | Questões jurídicas resolvidas e a conclusão de cada uma | Mesmo botão, 2ª etapa | 5/dia, 40/mês | [`ARGUMENTA.md`](ARGUMENTA.md) |
| `argumenta-fundamentos` | Fundamentos de cada conclusão (fato, prova, norma, precedente, doutrina, argumento) | Mesmo botão, 3ª etapa | 5/dia, 40/mês | [`ARGUMENTA.md`](ARGUMENTA.md) |
| `explicar-precedente` | Explica em linguagem clara a tese firmada (ou o enunciado) do precedente aberto no TeseMap, só a partir do texto que o tribunal registra, com o trecho da tese que enuncia a regra | Botão "Explicar com IA" no TeseMap (logado) | Cota de explicações do plano; a resposta é guardada e serve a todos | Seção 8.3 abaixo |
| `ler-intimacao` | Extrai da intimação colada o tribunal, o tipo e a data do evento e o prazo mencionado, só para preencher o PrazoZero | Campo "Preencher pela intimação" no PrazoZero (logado) | Cota de explicações do plano | Seção 8.2 abaixo |
| `relacionar-com-o-caso` | Como o dispositivo ou precedente aberto a partir da análise se relaciona com a questão do caso (aplica, distingue ou trata de outro ponto), com o trecho da fonte que sustenta | Botão "Relacionar com a minha questão" no NormaViva ou no TeseMap, depois de abrir uma citação da análise (logado) | Cota de explicações do plano; a tela limita a 10 por caso | Seção 8.1 abaixo |

### 8.1 `relacionar-com-o-caso` (decisão do responsável de 05/11/2026)

- **Entrada:** a ferramenta (`normaviva` ou `tesemap`), o id do dispositivo ou do nó, e o enunciado e a conclusão da questão **como a análise do Argumenta os produziu, com marcadores no lugar dos dados pessoais**. O servidor confere de novo e recusa texto com dado pessoal detectável. O texto da fonte o servidor lê do banco; nada dele vem do navegador.
- **Saída fechada:** `relacao` (`aplica`, `distingue` ou `outro_ponto`), `resumo`, `trecho` e `limite`. O modelo não conversa, não recebe ferramentas e não vê a decisão, só a questão e a fonte.
- **Trava no servidor:** o `trecho` tem de existir, palavra por palavra (sem contar caixa, acento nem espaços), no texto da fonte; senão a saída é descartada e a cota não é gasta. O resumo e o limite não podem dizer quem tem razão nem o que fazer.
- **Material do usuário:** `guardaResultado: false`. Nem a questão nem a resposta ficam no banco; o registro de uso leva só o destino e um hash curto da questão.
- **Cota:** conta na **cota de explicações** do plano (não gasta análise). O limite de **10 por caso** é da tela (memória da aba), não do servidor; o teto verdadeiro é a cota do plano e o fundo de gasto.
- **Modelo:** `claude-haiku-5-5`, esforço baixo, até 1.200 tokens de saída. Custo esperado da ordem de US$ 0,005 por consulta.
- **Desligada por padrão:** o botão só aparece com `NEXT_PUBLIC_IA_RELACAO=sim` (variável de repositório `IA_RELACAO`), e o servidor só executa com `IA_RELACAO_LIGADA=sim`. Só ligar depois de medida (abaixo).
- **Medição antes de ligar:** `pnpm --filter web avaliar-relacao` usa as decisões do corpus: cada fundamento de norma ou precedente que a própria decisão usou na questão deve sair como `aplica`; cada fonte de outra questão, de assunto diferente, não deve sair como `aplica`. O relatório mostra a taxa de acerto e a de trecho descartado.

### 8.2 `ler-intimacao` (decisão do responsável de 05/11/2026)

- **Para quê:** a pessoa cola o texto de uma intimação ou publicação e a IA **só extrai** o tribunal, o tipo de intimação (disponibilização no DJe, publicação, portal, carga ou audiência), a data desse evento e, se o texto disser, o número de dias do prazo. Quem calcula continua sendo o motor determinístico do PrazoZero; a IA nunca escolhe o ato nem calcula data.
- **Entrada:** só os parágrafos do texto colado, **já pseudonimizados no navegador** (nomes, CPF, CNPJ, número do processo e outros dados viram marcadores). O servidor confere de novo e recusa texto com dado pessoal detectável, mais de 60 parágrafos ou mais de 8.000 caracteres.
- **Saída fechada:** `tribunal` (sigla da lista do Ratione, ou vazio), `tipoEvento`, `dataEvento` (AAAA-MM-DD ou vazio), `diasMencionados` (ou 0) e, para cada campo, o `trecho` copiado do texto.
- **Trava no servidor:** o trecho de cada campo preenchido tem de existir, palavra por palavra (sem contar caixa, acento nem espaços), no texto; o tribunal tem de existir na lista; a data tem de ser válida e estar **escrita no trecho** (03/11/2026, 3.11.26 ou "3 de novembro de 2026"); o número de dias tem de estar no trecho. **O campo que não passa sai da resposta e o resto segue** (v4, 07/11/2026; antes a resposta inteira era descartada): tribunal, data e prazo são conferidos cada um por si, e a forma da intimação sai junto com a data, porque sem data não serve. Só a saída fora do formato é descartada, e aí a cota não é gasta. Se todos os campos saírem, a resposta vem vazia e a cota é gasta, como quando o texto não traz nada.
- **A pessoa confere:** a tela mostra cada campo com o trecho de onde veio e só preenche o formulário quando a pessoa clica em "Usar estes dados". O "prazo mencionado" é só informação.
- **Material do usuário:** `guardaResultado: false`; o registro de uso leva só um hash curto do texto. Conta na cota de explicações do plano (não gasta análise). Modelo `claude-haiku-5-5`, esforço baixo, até 1.400 tokens de saída (eram 900; na medição com textos reais, 5 de 70 respostas foram cortadas).
- **Intimações reais (fora do repositório):** `pnpm --filter web intimacoes rodar-externa --arquivo <amostra.json> [--confirmar]` mede a tarefa sobre uma amostra de intimações reais guardada fora do repositório, porque o texto traz nome de partes e número de processo. O texto vai ao modelo pseudonimizado pelo mesmo caminho do produto (o que a pseudonimização não limpa é recusado e não é enviado), e o relatório é gravado ao lado do arquivo, nunca no repositório. Se o gabarito ainda não foi validado pelo revisor, o relatório avisa no topo que mede a concordância com um gabarito proposto. Atenção ao texto do DJEN: ele não traz a data do evento (vem em campo à parte), então esse formato mede sobretudo se a IA inventa data ou tribunal.
- **Medição com 70 intimações reais (07/11/2026):** amostra de 70 intimações do DJEN (API pública de comunicações do CNJ), 5 de cada um de 14 tribunais (TJSP, TJMG, TJRJ, TJRS, TJPR, TJBA, TJPE, TJCE, TJGO, TJAL, TRT2, TRT4, TRF1, TRF3), disponibilizadas em 03/11/2026. O texto real traz nome de partes: a amostra e os relatórios ficam **fora do repositório**. Haiku 5.5, texto pseudonimizado pelo caminho do produto. **Gabarito proposto por regras, não validado pelo revisor.** Rodada 1 (v3): 41 de 70 respostas chegaram à pessoa; 13 das 24 recusadas eram certas e recusadas porque a conferência só aceitava dias em algarismos sem zero à esquerda ("05 (cinco) dias", "dez dias"), o que foi corrigido. Rodada 2 (HTML da fonte retirado, conferência corrigida, US$ 0,0315): **57 de 70 chegaram**, 48 de 57 iguais ao gabarito proposto, forma da intimação certa em 57 de 57. Dos 13 descartes, 9 foram da regra do tribunal (texto com só "Poder Judiciário…" ou nada, e o modelo concluiu a sigla), 3 foram cortes por tamanho e 1 forma sem data; por isso a v4 passou a retirar só o campo que falha. Erros que sobraram: 4 vêm do gabarito (texto com mais de um prazo, em que a tarefa devolve um número só) e 1 é o risco que importa: a IA tomou como data do evento a de um ato ("intimada do evento processual ocorrido em 29/10/2026"), que não é a data da intimação, e o modelo oscilou entre rodadas. **Ressalvas:** o texto do DJEN **não traz a data da intimação** (vem em campo à parte; só 13 de 559 textos citam uma data de publicação, e as que olhei eram de outra publicação citada), então esse formato mede sobretudo se a IA inventa; e falta o revisor validar o gabarito e decidir o caso da data do ato antes de considerar ligar a tarefa.
- **Medição da v4 com as mesmas 70 intimações (07/11/2026):** rodada em duas partes por causa de uma queda de conexão (casos 1 a 43 e 44 a 70; US$ 0,0316 no total). **As 70 respostas chegaram à pessoa**, sem nenhum descarte, corte ou falha (rodada 2: 57 de 70); o servidor retirou 8 campos sem apoio no texto e manteve o resto. Contra o gabarito proposto: dias 64 de 70, forma da intimação 69, data 67, tribunal 60 (10 omitidos: a IA deixou vazio, a pessoa preenche; nenhum tribunal errado). 52 de 70 intimações com os quatro campos iguais ao gabarito. **Os 10 valores errados ou inventados são de dois tipos:** 6 de prazo em textos com **mais de um prazo** para atos diferentes (a tarefa devolve um número só e o gabarito proposto ficou em 0) e 4 valores em 3 intimações do TJBA em que a IA tomou como data do evento a de um **ato do processo** ("intimada do evento processual ocorrido em 29/10/2026"), e numa delas inventou a forma "portal". Esse segundo tipo é o que mais importa: a pessoa contaria o prazo de uma data que não é a da intimação. Gabarito ainda não validado pelo revisor.
- **Data de ato do processo recusada (v5, 07/11/2026):** a instrução passa a dizer que a data é sempre a de o texto ter sido disponibilizado, publicado ou comunicado à parte, nunca a de um ato que o texto apenas cita ("evento processual ocorrido em", "decisão proferida em", "petição juntada em"), e a mandar deixar a data vazia quando só houver a de um ato. O servidor confere isso à parte: olha a oração que vem logo antes da data no trecho e, se ela traz "evento processual", "ocorrido", "proferido", "juntado", "lavrado", "protocolado" ou "assinado", tira a data e a forma da intimação da resposta; tribunal e prazo seguem. "Decisão proferida em 29/10/2026 e disponibilizada em 03/11/2026" não é recusada para 03/11, porque o "proferida" fica na oração anterior. Cobre o erro das 3 intimações do TJBA da medição acima. **Ainda não medida com intimações reais**: a regra foi testada com textos sintéticos (a frase do TJBA e variações), e a rodada com as 70 intimações fica para quando a amostra estiver à mão.
- **Prazo conferido no trecho (07/11/2026):** o número de dias tem de estar escrito no trecho citado, em algarismos (com ou sem zero à esquerda: "15", "05") ou por extenso colado à palavra "dias" ("dez dias", "cinco (5) dias úteis"). Antes só valiam algarismos sem zero à esquerda, e a medição com intimações reais mostrou que o Diário escreve "05 (cinco) dias" e "dez dias": 13 de 24 respostas recusadas eram certas. O extenso exige "dias" depois, e "vinte e dois" não valida 2 nem "cento e vinte" valida 20.
- **Tribunal conferido contra o trecho (v3, 07/11/2026):** além de o trecho existir no texto e a sigla constar da lista, o trecho tem de identificar o tribunal da sigla: trazer a própria sigla ("TJSP", "TRT2", "TRT da 2ª Região") ou todas as palavras do nome oficial ("Tribunal de Justiça de Pernambuco", com ou sem "do Estado"). Um trecho que também casa com um tribunal de nome mais longo ("Mato Grosso do Sul" para o TJMT) não vale para o mais curto. Antes, uma sigla errada com um trecho verdadeiro do texto chegava à pessoa. Desde a v4, o trecho que não identifica o tribunal tira só o tribunal da resposta. A instrução pede o nome por inteiro no trecho, mesmo em duas linhas. Medido em 07/11/2026 com os mesmos 20 casos: 20 de 20 certos e nenhum descarte pela regra nova (US$ 0,0065, `2026-11-07T0038.md`); inclusive os dois textos com o nome em duas linhas (TJSC e TJCE) vieram com o trecho completo.
- **Desligada por padrão:** o campo só aparece com `NEXT_PUBLIC_IA_INTIMACAO=sim` (variável de repositório `IA_INTIMACAO`), e o servidor só executa com `IA_INTIMACAO_LIGADA=sim`. Só ligar depois de testada com intimações reais de alguns tribunais.
- **Corpus de medição:** 20 intimações sintéticas (nomes, CPF, OAB e processos inventados; redação do Diário e do PJe), com gabarito de dias, forma, data e tribunal em `apps/web/src/lib/avaliacao/intimacoes/casos.ts`. Cobrem prazo diferente do padrão, tribunal não nomeado, duas datas no texto, ciência em audiência e texto com ordem dirigida à IA. O gabarito foi validado pelo revisor em 30/10/2026 para a primeira versão da tarefa, que também extraía o ato; ao passar para a tarefa de hoje o campo do ato saiu e os quatro restantes ficaram como estavam (as regras são as mesmas). Folha de conferência: [`INTIMACAO_CORPUS.md`](INTIMACAO_CORPUS.md). Comando: `pnpm --filter web intimacoes rodar` (sem `--confirmar` só estima o custo; com ele chama o modelo e grava o relatório em `apps/web/corpus-intimacoes/rodadas/`). Mede, por campo, certo, omitido, errado e inventado, e quantas respostas o servidor descartou. **Medida em 07/11/2026** (Haiku 5.5, 20 casos, US$ 0,0058, relatório em `apps/web/corpus-intimacoes/rodadas/2026-11-07T2347.md`): nenhuma resposta descartada; **18 de 20 intimações com os quatro campos certos**. Dias, data e tribunal: 20 de 20. Forma da intimação: 18 de 20, com um **errado** (texto "Publicado no DJe", a IA disse "disponibilização no DJe", o que muda o começo da contagem) e um omitido (texto "Disponibilizado em…", sem citar o Diário; a IA deixou "não informado"). **Instrução reforçada (v2, 07/11/2026)** para escolher a forma pela palavra do texto ("disponibilizado" x "publicado"): nova rodada com os mesmos 20 casos, **20 de 20 certos**, sem erro nem omissão (US$ 0,0059, `2026-11-07T2351.md`). Como o ajuste foi feito olhando esses mesmos casos, a melhora não prova que a regra generaliza. Corpus sintético: não substitui o teste com intimações reais de alguns tribunais, que continua sendo a condição para ligar a tarefa.

### 8.3 `explicar-precedente` (decisão do responsável de 05/11/2026)

- **Para quê:** o TeseMap mostra a tese como o tribunal a escreve, e ela costuma ser difícil de ler. A IA a explica em português claro (resumo, até cinco itens, até cinco termos e o que o texto não permite concluir), sem acrescentar nada que não esteja no texto.
- **Entrada:** só o id do precedente (`STJ-TEMA-1076`); texto livre é recusado. O texto da tese o servidor lê do banco público do TeseMap; nada dele vem do navegador. Precedente sem tese firmada (só a questão registrada) não tem o que explicar: a rota responde 404 e a tela nem mostra o botão.
- **Saída fechada:** `resumo`, `explicacao`, `termos`, `trecho` e `atencao`.
- **Trava no servidor:** o `trecho` tem de existir, palavra por palavra (sem contar caixa, acento nem espaços), na questão ou na tese do precedente; nenhum tema, súmula, artigo ou lei pode aparecer na explicação sem estar no texto do precedente; e a explicação não pode dizer quem tem razão nem o que fazer. Saída que não passa é descartada e a cota não é gasta.
- **Material público:** `guardaResultado: true`. A chave do cache é a mensagem inteira (inclui a tese), então a mesma explicação serve a todos e muda sozinha se o tribunal alterar a tese. Resposta guardada não gasta cota.
- **Cota e modelo:** cota de explicações do plano (não gasta análise); `claude-haiku-5-5`, esforço baixo, até 1.800 tokens de saída; custo esperado da ordem de US$ 0,004 por precedente novo.
- **Desligada por padrão:** o botão só aparece com `NEXT_PUBLIC_IA_PRECEDENTE=sim` (variável de repositório `IA_PRECEDENTE`), e o servidor só executa com `IA_PRECEDENTE_LIGADA=sim`. Só ligar depois de a pessoa responsável ler as explicações de uma amostra de precedentes de cada tribunal (STF e STJ, teses e súmulas) e achá-las fiéis ao texto.

## 9. Ligar e desligar

A IA inteira fica desligada até o responsável: (1) aplicar as migrações `20261022000001_explicacao_ia.sql` e `20261022000002_ia_tarefas.sql`; (2) guardar a chave da Anthropic no Secret Manager (`anthropic-api-key`) com acesso da conta de serviço do Cloud Run; (3) criar a variável de repositório `IA_EXPLICACAO = sim` e fazer o deploy. Desligar: `IA_EXPLICACAO = nao` e novo deploy, ou, na hora, `gcloud run services update <serviço> --update-env-vars IA_EXPLICACAO_LIGADA=nao`.
