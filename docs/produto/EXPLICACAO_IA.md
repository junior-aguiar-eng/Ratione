# Explicação de dispositivo por IA (F3-08)

> **Decisão do responsável (22/10/2026):** a explicação é feita com o **Claude Haiku 5.5** (API da Anthropic), **só sob demanda**, com **controle rígido de uso**, numa implementação própria e separada do resto do NormaViva. Qualquer mudança nas regras abaixo (modelo, limites, o que o modelo recebe, ferramentas) precisa de nova decisão do responsável.
>
> É a tarefa `explicar-dispositivo` do **catálogo de tarefas de IA** ([`IA_TAREFAS.md`](IA_TAREFAS.md)): segue o contrato, o executor único e as travas descritos lá.

## 1. O que é

Na tela de um dispositivo do NormaViva, a pessoa logada pode clicar em **"Explicar com IA"**. O servidor manda ao modelo o texto vigente do dispositivo (e dos parágrafos, incisos e alíneas abaixo dele, como a tela mostra) e devolve uma explicação curta, em seções fixas: resumo, explicação em itens, termos técnicos e pontos de atenção. A tela sempre diz que a explicação foi gerada por IA, que pode conter erro e que não substitui o texto da lei nem orientação jurídica.

## 2. Regras fixas (não dependem de configuração)

| Regra | Como é garantida |
|---|---|
| Só sob demanda: nenhuma chamada automática (ao abrir a página, ao pesquisar, em lote, em segundo plano) | O único caminho é o clique no botão, que faz um `POST` para `/api/ia/explicar-dispositivo`; o componente volta ao estado inicial a cada dispositivo (`key`) |
| Só quem tem conta e está logado | A rota confere a sessão no servidor (`auth.getUser`); sem sessão, 401 e nada é chamado |
| O usuário não escreve pergunta nem texto: o pedido leva só o id do dispositivo | `idDeDispositivoValido` aceita só o formato `NORMA|escopo|rótulo`; qualquer outra coisa é 400 |
| O modelo vê só o texto oficial, lido do banco no servidor | `lerDispositivoParaExplicar` (mesmo texto da tela); o texto vai entre `<dispositivo>` e `</dispositivo>`, tratado como dado |
| **Sem ferramentas e sem busca na web** | O contrato declara `ferramentas: []` e o único cliente da API (`lib/ia/cliente.ts`) não envia `tools`; é uma única mensagem |
| Não cita jurisprudência, súmulas, doutrina nem outras leis além das citadas no próprio texto; não aconselha caso concreto | Instruções fixas da tarefa (`lib/ia/tarefas/explicarDispositivo.ts`), versionadas (`versao`) |
| Resposta em formato fixo | Saída estruturada (`output_config.format`, esquema JSON) e nova validação no servidor (`zod`); fora do formato, nada é mostrado nem guardado |
| Texto longo não é cortado em silêncio | Acima de 20.000 caracteres, a rota recusa (413) e pede um parágrafo ou inciso |
| A mesma explicação é reaproveitada | Cache por tarefa, versão, modelo e mensagem montada (`ia_respostas`); servir do cache não conta na cota nem custa; texto alterado pela lei gera explicação nova |
| Toda chamada é reservada antes e registrada depois, com o custo | `ia_reservar` (atômica, uma de cada vez) e `ia_finalizar` (`ia_uso`) |
| A chave da API fica só no servidor | `ANTHROPIC_API_KEY` vem do Secret Manager no Cloud Run; nunca no repositório, na imagem ou no navegador |

## 3. Limites (no contrato da tarefa e em `lib/ia/politica.ts`)

| Limite | Padrão | Ajuste |
|---|---|---|
| Explicações novas por usuário por dia (fuso de Brasília) | 5 | `IA_LIMITE_DIA` |
| Explicações novas por usuário por mês | 60 | `IA_LIMITE_MES` |
| Gasto de todos os usuários somados no mês | US$ 5,00 | `IA_ORCAMENTO_MES_USD` |
| Uma explicação de cada vez por usuário | (fixo) | chamada "reservada" há menos de 2 minutos barra a próxima |
| Teto da resposta | 2.000 tokens | `maxTokensSaida` (contrato) |
| Tempo da chamada | 30 s, 1 nova tentativa só em falha transitória | código |

O ambiente só pode **apertar** os limites ou, no máximo, dobrá-los; valor inválido cai no padrão. Falha, recusa e resposta fora do formato **contam na cota** (para que insistir não contorne o limite), mas só pelo custo real cobrado. O orçamento soma o custo real das chamadas feitas e o custo máximo das que estão em curso: nunca passa do teto.

## 4. Modelo e custo

- Modelo: `claude-haiku-5-5`, esforço `low` (pouco raciocínio, suficiente para explicar texto curto), sem amostragem customizada nem prefill.
- Preço (Anthropic, prompt de até 100 mil tokens, conferido em 22/10/2026): US$ 0,10 por milhão de tokens de entrada e US$ 0,50 por milhão de saída. Uma explicação típica (cerca de 1.000 tokens de entrada e 500 de saída) custa cerca de US$ 0,0004; a reserva máxima por chamada é menor que US$ 0,002. Com o orçamento padrão de US$ 5, o teto mensal fica na casa de milhares de explicações.
- O custo de cada chamada é calculado pelo `usage` que a API devolve e gravado em `ia_uso.custo_usd`.

## 5. Como ligar (passo do responsável)

Nada é chamado enquanto os três passos abaixo não forem feitos; até lá, o botão nem aparece.

1. **Banco:** aplicar, nesta ordem, `supabase/migrations/20261022000001_explicacao_ia.sql` e `20261022000002_ia_tarefas.sql` no SQL Editor do projeto `ratione`.
2. **Chave:** criar uma chave na Console da Anthropic (de preferência num workspace só do Ratione, com limite de gasto mensal configurado lá também) e guardá-la no Secret Manager do Google Cloud com o nome `anthropic-api-key`, dando à conta de serviço do Cloud Run (`GCP_RUNTIME_SA`) o papel "Secret Manager Secret Accessor" nesse segredo. A chave não passa pelo repositório nem por esta conversa.
3. **Interruptor:** criar a variável de repositório `IA_EXPLICACAO` = `sim` (GitHub → Settings → Variables) e rodar o deploy. O build passa a mostrar o botão e o servidor recebe a chave e `IA_EXPLICACAO_LIGADA=sim`.

**Desligar:** `IA_EXPLICACAO` = `nao` e novo deploy. Para desligar na hora, sem deploy: `gcloud run services update <serviço> --update-env-vars IA_EXPLICACAO_LIGADA=nao` (a rota passa a responder 503; o botão continua visível até o próximo deploy e mostra que não está disponível).

## 6. Acompanhamento

No SQL Editor:

```sql
-- Gasto e uso do mês, por tarefa e resultado
select tarefa, situacao, count(*), sum(custo_usd) from public.ia_uso
where criado_em >= date_trunc('month', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo'
group by tarefa, situacao;
```

Falhas e recusas também aparecem no log do Cloud Run ("Explicação por IA: …").

## 7. Onde está o código

| Arquivo | Papel |
|---|---|
| `apps/web/src/lib/ia/tarefas/explicarDispositivo.ts` | O contrato da tarefa: entrada, instruções, mensagem, esquema da resposta, limites |
| `apps/web/src/lib/ia/fontes/dispositivoDoBanco.ts` | Texto do dispositivo lido do banco |
| `apps/web/src/lib/ia/catalogo.ts`, `executar.ts`, `cliente.ts`, `politica.ts` | Catálogo, executor único, a única chamada à API, política global (ver `IA_TAREFAS.md`) |
| `apps/web/src/app/api/ia/[tarefa]/route.ts` | Rota única dos recursos de IA |
| `apps/web/src/app/normaviva/ExplicacaoIA.tsx` | Botão e exibição |
| `supabase/migrations/20261022000001_explicacao_ia.sql`, `20261022000002_ia_tarefas.sql` | Cache, registro de uso, reserva atômica por tarefa |

Testes: `apps/web/src/lib/ia/executar.test.ts` (ordem das verificações, cache, falhas, custo, política, mensagem), `catalogo.test.ts` (contrato e travas) e `packages/db/src/ia.test.ts` (acesso, cota por tarefa, chamada em andamento, orçamento, migração sobre dados existentes).
