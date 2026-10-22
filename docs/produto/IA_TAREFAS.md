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
| `limitesPorUsuario` | Cota por dia e por mês nesta tarefa |
| `versao` | Muda quando instruções, mensagem ou esquema mudam (invalida o cache) |

## 3. O executor único (`apps/web/src/lib/ia/executar.ts`)

Toda tarefa passa pela mesma sequência, que nenhuma tarefa altera:

1. IA ligada nesta instalação → 2. tarefa existe no catálogo → 3. usuário logado → 4. entrada válida → 5. contexto montado das fontes → 6. tamanho dentro do limite → 7. **cache** (se já existe, devolve sem custo e fora da cota) → 8. **reserva** atômica no banco (cota da tarefa, uma chamada de cada vez por usuário, orçamento do mês) → 9. **uma** chamada ao modelo, sem ferramentas → 10. validação da saída (formato e conferência) → 11. registro do custo real → 12. gravação no cache.

Falha, recusa e saída fora do formato são registradas e **contam na cota** (insistir não contorna o limite); nada disso é mostrado nem guardado.

## 4. Tarefas de várias etapas

Quando um recurso precisa de mais de um passo (ex.: conferir as citações de um texto), **quem encadeia é o código**. Cada passo de IA é uma tarefa do catálogo, pequena e conferível; os passos de verificação são código determinístico sobre as bases do Ratione. Exemplo planejado (ainda não implementado):

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
| Orçamento de todas as tarefas somadas no mês | US$ 5 (`IA_ORCAMENTO_MES_USD` pode apertar ou, no máximo, dobrar) |
| Uma chamada de cada vez por usuário | em todas as tarefas |
| Teto de cota de qualquer tarefa | 20 por dia, 200 por mês por usuário (`IA_LIMITE_DIA` e `IA_LIMITE_MES` só apertam) |
| Teto de resposta / mensagem | 4.000 tokens / 30.000 caracteres |
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

## 9. Ligar e desligar

A IA inteira fica desligada até o responsável: (1) aplicar as migrações `20261022000001_explicacao_ia.sql` e `20261022000002_ia_tarefas.sql`; (2) guardar a chave da Anthropic no Secret Manager (`anthropic-api-key`) com acesso da conta de serviço do Cloud Run; (3) criar a variável de repositório `IA_EXPLICACAO = sim` e fazer o deploy. Desligar: `IA_EXPLICACAO = nao` e novo deploy, ou, na hora, `gcloud run services update <serviço> --update-env-vars IA_EXPLICACAO_LIGADA=nao`.
