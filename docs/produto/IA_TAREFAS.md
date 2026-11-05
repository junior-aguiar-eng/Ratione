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
- **Trava no servidor:** o trecho de cada campo preenchido tem de existir, palavra por palavra (sem contar caixa, acento nem espaços), no texto; o tribunal tem de existir na lista; a data tem de ser válida e estar **escrita no trecho** (03/11/2026, 3.11.26 ou "3 de novembro de 2026"); o número de dias tem de estar no trecho. Saída que não passa é descartada e a cota não é gasta.
- **A pessoa confere:** a tela mostra cada campo com o trecho de onde veio e só preenche o formulário quando a pessoa clica em "Usar estes dados". O "prazo mencionado" é só informação.
- **Material do usuário:** `guardaResultado: false`; o registro de uso leva só um hash curto do texto. Conta na cota de explicações do plano (não gasta análise). Modelo `claude-haiku-5-5`, esforço baixo, até 900 tokens de saída.
- **Desligada por padrão:** o campo só aparece com `NEXT_PUBLIC_IA_INTIMACAO=sim` (variável de repositório `IA_INTIMACAO`), e o servidor só executa com `IA_INTIMACAO_LIGADA=sim`. Só ligar depois de testada com intimações reais de alguns tribunais.

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
