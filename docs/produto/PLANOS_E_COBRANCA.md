# Planos, uso transparente e cobrança (F8)

> **Estado: proposta para decisão do responsável (23/10/2026).** Nada daqui está implementado. Substitui a tabela de planos *Gratuito / Pro / Pro Estudo* e a menção ao Asaas de [`IA_E_PRECIFICACAO.md`](IA_E_PRECIFICACAO.md) §4 e do PLANO §7. As regras de IA ([`IA_TAREFAS.md`](IA_TAREFAS.md)) continuam valendo.
>
> Números de cota e preço são **hipóteses**, calibradas por custo na §3. Nenhum preço de provedor (Anthropic, Mercado Pago) está fixado aqui: eles mudam e devem ser conferidos na fonte oficial antes de cada decisão.

## 1. Princípios

1. **O cliente vê o que consome, em unidades que ele entende:** análises, não chamadas, tokens nem dólares.
2. **Falha não é cobrada.** O que o sistema não entregou (erro, recusa do modelo, saída descartada) não gasta saldo do cliente.
3. **O cliente sabe o custo antes de clicar** e o que sobrou depois.
4. **O nível da análise é escolha do cliente**; o modelo por trás é detalhe documentado, não o rótulo principal.
5. **Nada do documento do cliente é guardado** (regra do Argumenta): o histórico guarda só metadados.
6. **O Ratione nunca toca em dado de cartão:** o pagamento é feito na página do Mercado Pago.

## 2. Níveis de análise e planos

### 2.1 Dois níveis, definidos pela complexidade

| | **Análise básica** | **Análise aprofundada** |
|---|---|---|
| Para quê | Decisão curta e de uma tese: entender a estrutura, as questões, as conclusões e os fundamentos | Acórdão ou sentença longa, várias teses, preliminares, votos divergentes |
| O que entrega | Hoje: etapas 1 a 4 do pipeline (estrutura, questões, conclusões, fundamentos), com o parágrafo de origem | Tudo da básica **mais** as etapas seguintes do PLANO §6.4: fragilidades da fundamentação (CPC, art. 489, § 1º), mapa de argumentos e verificação de citações contra NormaViva e TeseMap, **conforme forem ficando prontas** (F5-04) |
| Tamanho máximo | ~6 páginas (21.000 caracteres, como hoje) | ~15 páginas, o que exige dividir a decisão em partes (a mensagem de uma chamada hoje é limitada a 30.000 caracteres) |
| Modelo | Claude Haiku 5.5 | Claude Sonnet 5.5 (a confirmar pelo corpus da F5-05, §6) |
| Quando faz sentido | Primeira leitura, triagem, estudo | Peça que vai embasar recurso ou parecer |

A aprofundada **não existe até haver conteúdo que a justifique**: hoje ela seria só a básica com outro modelo. Ela entra quando houver (a) a verificação de citações ou as fragilidades e (b) a medição do corpus mostrando ganho real do Sonnet em decisão longa.

### 2.2 Planos (hipótese de cotas)

| | **Gratuito** | **Básico** | **Avançado** |
|---|---|---|---|
| Análise básica (Haiku) | **1 por semana** | 20 por mês | 60 por mês |
| Análise aprofundada (Sonnet) | — | — | 10 por mês |
| Explicar dispositivo (NormaViva) | dentro do 1 por semana | 60 por mês | 150 por mês |
| Tamanho da decisão | até 6 páginas | até 6 páginas | até 6 páginas (básica) e 15 (aprofundada) |
| Histórico de consumo | 30 dias | 12 meses | 12 meses |
| Exportar histórico (CSV) | — | sim | sim |
| Ferramentas sem IA (PrazoZero, NormaViva, TeseMap) | todas, uso razoável | todas | todas |
| Preço | R$ 0 | R$ **[A DEFINIR]**/mês | R$ **[A DEFINIR]**/mês |

Regras:
- **Gratuito = 1 uso de IA por semana no total.** Escolhi contar a explicação de dispositivo dentro desse 1, para seguir o combinado literalmente. Decisão sua: se o gratuito deve ter também algumas explicações (que custam bem menos), a cota separada é fácil de acrescentar.
- **Semana:** de segunda a domingo, no horário de Brasília. **Mês** dos planos pagos: ciclo de cobrança (renova na data da cobrança). A data de renovação é sempre visível.
- **Cota não acumula** de um período para outro.
- Plano mensal sem fidelidade; anual com desconto fica para depois da primeira versão.
- **Pacote avulso** de análises (sem assinatura): fora da primeira versão. Quando entrar, a validade precisa ser revista contra o CDC (o rascunho antigo falava em 12 meses).

## 3. Como calibrar cotas e preço

O custo de cada análise é medido, não presumido. A tabela `ia_uso` já guarda tokens e custo em dólares por chamada.

```text
custo_IA_máximo_do_plano = cota_básica × custo_médio_básica
                         + cota_aprofundada × custo_médio_aprofundada
                         + cota_explicação × custo_médio_explicação

preço_mínimo = (custo_IA_máximo + custo_fixo_por_cliente
               + taxa_Mercado_Pago + impostos) / (1 − margem_alvo)
```

| Item | Valor | Fonte |
|---|---|---|
| Custo médio da análise básica (3 chamadas) | **medir** (estimativa inicial: ~US$ 0,01) | média de `ia_uso` por análise, depois de algumas dezenas de análises reais |
| Custo médio da análise aprofundada | **medir** (preço do Sonnet 5.5: conferir na página de preços da Anthropic e registrar em `politica.ts`) | idem, após a F5-05 |
| Taxa do Mercado Pago | **conferir na sua conta** (varia por meio de pagamento e prazo de recebimento) | painel do Mercado Pago |
| Impostos e nota fiscal | **depende de como você vai faturar** (pessoa física, MEI ou empresa) | contador (T-01) |
| Margem alvo | você define | — |

Pelo desenho (cotas fixas por nível), o **pior caso de custo por cliente é conhecido de antemão**: é a cota inteira usada. Isso é o que permite um preço fixo sem créditos. Créditos com pesos só entram se, depois do beta, os clientes pedirem flexibilidade entre os níveis.

## 4. Transparência para o cliente: "Meu uso"

Tela no Meu espaço (`/meu-espaco/uso`), alimentada pelo banco do próprio Ratione (não pela API da Anthropic, que mostra o gasto da organização, não o de cada cliente).

1. **Resumo do plano:** plano atual, preço, próxima renovação e, por tipo, "usadas / total / restantes" no período, com a data em que renova.
2. **Histórico por análise:** data e hora, tipo (básica, aprofundada, explicação), **resultado** (concluída, falhou, cancelada), se **consumiu** cota, o rótulo que o cliente deu e o tamanho (páginas, parágrafos). Sem o texto da decisão e sem a resposta.
3. **Falhas visíveis e sem custo:** "Falhou, não consumiu".
4. **Antes de enviar:** "Esta análise usa 1 das suas 20 análises básicas deste mês (restam 14)" e, se faltar saldo, o que fazer (esperar a renovação, mudar de plano).
5. **Exportar** o histórico em CSV (Básico e Avançado), para quem reembolsa ou presta contas.
6. **Fatura e cobrança:** lista das cobranças (data, valor, forma, situação), link para cancelar e para o recibo do Mercado Pago.
7. **Modelo e versão:** num recolhido "Detalhes da análise" (nome do modelo, versão das instruções, data). O rótulo em destaque é o **nível**. A Política de Uso de IA passa a dizer isso em vez de "exibidos" ao lado de cada resultado.

**Para o responsável:** painel administrativo (acesso restrito) que soma a mesma base com o custo real em dólares, a receita, a margem por plano e o gasto do mês contra o teto de US$ 5.

## 5. Regras de consumo

| Situação | Consome saldo do cliente? |
|---|---|
| Análise concluída (as 3 etapas, ou todas as do nível) | **Sim**, 1 análise do nível |
| Erro do sistema, falha da API, recusa do modelo, saída descartada | **Não** (estorno automático da reserva) |
| Cliente fecha a página no meio | **Sim**, se pelo menos a primeira etapa foi cobrada pelo provedor; a reserva fica registrada como "interrompida" (decisão a confirmar) |
| "Tentar de novo" depois de falha parcial | **Não** gasta outra análise: continua a mesma |
| Analisar de novo a mesma decisão | **Sim**, nova análise (não guardamos o texto, então não há como reaproveitar) |
| Explicação de dispositivo já gerada para outro usuário (cache) | **Não** (como hoje) |

**Como fica no código:**
- **Análise vira a unidade:** tabela `analises` (id, usuário, nível, rótulo, situação, criada em, concluída em, consumiu, páginas). As chamadas de `ia_uso` ganham `analise_id`. Hoje elas só se ligam pelo hash da decisão, o que se mistura se a mesma decisão for analisada duas vezes.
- **A cota é conferida uma vez, no começo da análise**, por uma função `analise_iniciar` no banco (atômica, como `ia_reservar`). As três chamadas da análise carregam o `analise_id` e **não** contam de novo.
- **As cotas por chamada** (hoje 5 por dia e 40 por mês por tarefa) deixam de ser regra de produto e ficam só como trava antiga contra abuso, em valor alto.
- **Nível na entrada** das tarefas como valor de lista fechada (`basica` ou `aprofundada`), nunca texto livre; o contrato da tarefa passa a declarar um modelo por nível; a reserva de orçamento usa o custo máximo do nível.

## 6. Modelos: quando entra o Sonnet

1. Reunir as 30 decisões do corpus (F5-05), **incluindo acórdãos longos e complexos**, não só sentenças curtas.
2. Rodar as mesmas decisões em Haiku e Sonnet e conferir contra o esperado validado por você (intervalo do dispositivo, questões, fundamentos, taxa de saídas descartadas).
3. Se a diferença for pequena, o nível aprofundada usa o Haiku com as etapas extras. Se for grande nas decisões longas, usa o Sonnet.
4. Gemini e ChatGPT ficam fora da primeira versão: exigem um cliente novo, esquema de saída próprio, contrato e RIPD por provedor (transferência internacional, LGPD art. 33). Reabrir só se os números do corpus justificarem.

## 7. Cobrança com Mercado Pago

**Decisão do responsável (23/10/2026):** hoje o responsável é **pessoa física, sem MEI**, em Maceió/AL, com faturamento esperado de até R$ 5 mil. A infraestrutura de cobrança será construída **pronta e desligada**: nada é publicado como comercial, e a cobrança só liga quando houver MEI (ou outra forma de empresa) e a conta do Mercado Pago correspondente. Até lá, o Ratione continua em **beta gratuito** e o Mercado Pago roda **só com credenciais e usuários de teste**, que não cobram de verdade.

**Por que não cobrar como pessoa física nem por uma "ponte":** o plano de assinatura e a assinatura pertencem à conta do Mercado Pago que os criou. Cliente pagante criado numa conta de pessoa física **não migra** para a conta do MEI: teria de cancelar e assinar de novo. Por isso o primeiro cliente pagante só entra depois da conta definitiva.

**Antes de abrir o MEI:** conferir no Portal do Empreendedor se a **atividade do Ratione cabe nas atividades permitidas ao MEI**. Eu não consegui confirmar isso, e é a principal incerteza: licenciar um sistema como serviço pode não caber. Se não couber, o caminho é ME ou SLU no Simples Nacional, com contador. O faturamento esperado (R$ 5 mil, entendido como por mês, ou R$ 60 mil por ano) fica abaixo do teto que eu conheço do MEI (R$ 81 mil por ano; **confirmar o valor atual**), mas qualquer crescimento perto do teto muda a conta.

### 7.1 Escolha técnica

| Peça | Uso | Observação |
|---|---|---|
| **Assinaturas** (API de planos `preapproval_plan` e assinaturas `preapproval`) | Cobrança mensal recorrente dos planos Básico e Avançado | A documentação do Mercado Pago descreve criar o plano (título, valor, frequência), criar a assinatura a partir dele e gerenciá-la (alterar valor, trocar cartão, pausar, cancelar, reativar, teste grátis). Cada plano tem um `preapproval_plan_id` |
| **Página de pagamento do Mercado Pago** (a assinatura nasce na página do Mercado Pago, e o cliente volta ao Ratione) | Para o cliente informar o cartão | O cartão nunca passa pelo nosso servidor (escopo de segurança de dados de cartão reduzido) |
| **Webhooks** | O Mercado Pago avisa mudanças de assinatura e de pagamento | Validação da assinatura do aviso com o cabeçalho `x-signature`, `x-request-id` e o `data.id` da consulta, com o segredo da aplicação (o SDK oficial `mercadopago` tem `WebhookSignatureValidator`) |
| **Preferência de pagamento** (Checkout Pro) | **Fase posterior**: compra de 30 dias de acesso por Pix ou boleto, sem renovação automática, para quem não quer cartão | O campo `external_reference` liga o pagamento ao nosso pedido; `notification_url` recebe o aviso |

**A confirmar antes de implementar** (não verifiquei na documentação): se as assinaturas aceitam Pix recorrente ("Pix Automático") ou só cartão, e quais meios de pagamento valem para os planos; o prazo de recebimento e as taxas de cada meio; se o Mercado Pago emite nota fiscal (o PLANO partia do pressuposto de um gateway que emitisse NFS-e; se não emitir, a nota é responsabilidade sua, via contador).

### 7.2 Fluxo

```text
Cliente (logado) clica em "Assinar Básico"
  → servidor cria a assinatura a partir do plano (preapproval_plan_id), com external_reference = id do cliente + id interno
  → redireciona para a página do Mercado Pago (cartão)
  → cliente volta ao Ratione (back_url) para uma tela "Estamos confirmando seu pagamento"
  → o Mercado Pago chama /api/mercadopago/webhook
       1. valida x-signature (401 se inválida; não grava nada)
       2. grava o evento numa tabela de eventos (idempotência por id do evento/recurso)
       3. consulta o recurso na API do Mercado Pago (não confia no corpo do aviso)
       4. atualiza assinaturas e cobranças; ativa o plano
  → a tela "Meu uso" mostra o plano ativo
```

**Estados da assinatura** (nossos, derivados dos do Mercado Pago):

| Mercado Pago | Ratione | O que o cliente tem |
|---|---|---|
| aguardando autorização | `pendente` | Gratuito, até confirmar |
| autorizada | `ativa` | Plano pago |
| cobrança falhou, assinatura ainda autorizada | `em_atraso` | Plano pago até o fim do ciclo pago + **carência a definir (ex.: 3 dias)** |
| pausada | `pausada` | Gratuito a partir do fim do ciclo pago |
| cancelada | `cancelada` | Plano pago **até o fim do ciclo já pago**, depois Gratuito |

### 7.3 Mudanças de plano, cancelamento e reembolso

- **Cancelar:** botão em "Meu uso" que chama a API (status `cancelled`); o plano vale até o fim do ciclo pago. Sem fidelidade e sem retenção forçada.
- **Arrependimento de 7 dias** (CDC, art. 49), na primeira compra: botão "Cancelar e pedir reembolso" que cancela a assinatura e pede o estorno do pagamento pela API do Mercado Pago. Texto no Termos de Uso e na tela.
- **Subir de plano (Básico → Avançado):** vale na hora; cria-se a nova assinatura e cancela-se a antiga quando a nova ficar `ativa`. Valor proporcional: decisão sua (o Mercado Pago permite valor proporcional em uma cobrança).
- **Descer de plano:** vale no fim do ciclo pago.
- **Trocar de cartão:** pelo Mercado Pago (a API permite trocar o cartão da assinatura), sem passar o cartão por aqui.

### 7.4 Prontidão: infraestrutura pronta, cobrança desligada

Para que a ligação futura seja só troca de credencial e de chave, **sem mexer em código**:

| Regra | Como |
|---|---|
| **Duas chaves de liga** | `COBRANCA_LIGADA` (servidor) e `NEXT_PUBLIC_COBRANCA` (build), ambas **`nao` por padrão**. Desligada: as telas de plano mostram "Em breve" ou ficam ocultas, a rota de assinar responde 503 e o webhook não processa nada |
| **Só credenciais de teste enquanto for pessoa física** | O token de acesso e o segredo do webhook vêm do Secret Manager (`mercadopago-access-token`, `mercadopago-webhook-secret`). O código recusa iniciar a cobrança se o token for de produção e `COBRANCA_AMBIENTE` não for `producao` (e o inverso) |
| **Nada da conta fixo no código** | Os identificadores dos planos do Mercado Pago ficam em tabela ou variável, não no código. Um comando idempotente (`pnpm mp:planos`) cria ou atualiza os planos **na conta cujas credenciais estiverem ativas** e grava os `preapproval_plan_id` |
| **Troca de conta = trocar segredos e rodar o comando** | Ao abrir o MEI: nova conta no Mercado Pago, novas credenciais nos segredos, `pnpm mp:planos`, nova URL de webhook no painel, `COBRANCA_AMBIENTE=producao`, teste de ponta a ponta com valor baixo, e só então `COBRANCA_LIGADA=sim` |
| **Identificação do fornecedor configurável** | Nome empresarial, CNPJ, endereço e e-mail de contato dos Termos, da Privacidade e do rodapé vêm de uma configuração única. Hoje com marcador explícito de "pendente"; o Decreto 7.962/2013 exige o dado real antes de vender |
| **Sem cliente pagante real antes da conta definitiva** | Nenhuma assinatura de produção é criada na conta de pessoa física |

**Checklist de ativação (quando houver MEI ou empresa):**
1. CNPJ aberto com atividade compatível; alvará e inscrição municipal de Maceió, se exigidos; forma de emitir nota fiscal definida com o contador (o MEI pode ter dispensa de nota para venda a pessoa física, mas escritórios e empresas costumam exigi-la; **confirmar as regras de Maceió**).
2. Conta do Mercado Pago do CNPJ aberta e verificada; credenciais e segredo do webhook no Secret Manager; deploy.
3. `pnpm mp:planos` na conta nova; webhook cadastrado; teste de assinatura, cancelamento e reembolso com valor baixo.
4. Termos, Privacidade e rodapé com os dados do fornecedor; revisão por advogado (T-03).
5. Seguro de responsabilidade avaliado (PLANO §8).
6. Ligar as duas chaves e anunciar.

### 7.5 Segurança e conformidade

- **Credenciais:** o token de acesso e o segredo do webhook ficam no Secret Manager do Google Cloud (`mercadopago-access-token`, `mercadopago-webhook-secret`), entregues ao Cloud Run pelo workflow de deploy como já se faz com a Anthropic. Nunca no repositório, na imagem ou no navegador.
- **Dados guardados:** identificadores do Mercado Pago (assinatura, pagamento), valor, data, situação e forma de pagamento. **Não** guardamos número de cartão, validade nem CPF além do que a nota fiscal exigir.
- **Webhook:** só HTTPS, assinatura validada, idempotente, sempre consulta o recurso na API, resposta 200 rápida e processamento seguro para reentrega.
- **Ambientes:** credenciais de teste e usuários de teste do Mercado Pago para tudo antes do lançamento; credenciais de produção só no deploy final.
- **Documentos a atualizar:** Termos de Uso (planos, cancelamento, arrependimento, o que acontece com a cota), Política de Privacidade (Mercado Pago como operador de dados de pagamento), Política de Uso de IA (nível e detalhes do modelo), Metodologia.

## 8. Itens e ordem

| ID | Item | Depende de |
|---|---|---|
| F8-01 | **Decisões do responsável** (§9). Forma de recebimento decidida (§7); resta cotas, preços e as demais | — |
| F8-02 | Modelo de dados: planos, assinaturas, análises, cobranças, eventos do Mercado Pago, com RLS e testes de RLS | F8-01 |
| F8-03 | Análise como unidade de cota: `analise_iniciar`, estorno de falha, `analise_id` nas chamadas, trava por chamada só como anti-abuso | F8-02 |
| F8-04 | Tela "Meu uso" (resumo, histórico, falhas, aviso antes de enviar, exportação) e painel administrativo | F8-03 |
| F8-05 | Mercado Pago em **teste**: criar planos, assinatura pela página do Mercado Pago, volta, webhook validado e idempotente, estados | F8-02 |
| F8-06 | Cancelamento, arrependimento com reembolso, subir e descer de plano, troca de cartão | F8-05 |
| F8-07 | Documentos legais atualizados e revisados (T-03); planilha de custo e preços (T-04) | F8-01, F8-04 |
| F8-08 | Nível aprofundada: contrato por nível, preço do modelo em `politica.ts`, divisão de decisão longa, depois do corpus | F5-05, F5-04 |
| F8-09 | Pagamento avulso por Pix ou boleto (Checkout Pro), se a análise de Pix recorrente indicar necessidade | F8-06 |
| F8-10 | Ativação da cobrança (checklist da §7.4), **depois de abrir o MEI ou a empresa**: credenciais de produção, teste de ponta a ponta com pagamento de valor baixo, beta fechado | tudo, T-01 |

Ordem recomendada: F8-01 → F8-02 → F8-03 → F8-04 (a transparência e a cota por análise funcionam **sem cobrança**, já no gratuito e no beta) → F8-05 e F8-06 (cobrança em teste) → F8-07 → F8-10. O nível aprofundada (F8-08) acompanha o corpus e não bloqueia a cobrança: o Avançado pode sair antes dele, com mais análises básicas e as explicações, e ganhar a aprofundada quando ela existir (o cliente do Avançado precisa saber disso no momento da compra).

## 9. Decisões que dependem de você

1. ~~**Forma de recebimento**~~ **Decidido em 23/10/2026:** infraestrutura pronta e desligada (§7 e §7.4); a cobrança liga quando houver MEI ou empresa. **Resta:** conferir se a atividade cabe no MEI, a emissão de nota em Maceió e abrir o MEI (checklist da §7.4).
2. **Cotas e preços** de Básico e Avançado (§2.2 e §3), depois da medição de custo.
3. O gratuito inclui **só** 1 uso por semana no total, ou também algumas explicações de dispositivo?
4. **Fechar a página no meio** consome a análise? (§5)
5. **Carência** de pagamento atrasado (§7.2) e **valor proporcional** ao subir de plano (§7.3).
6. **Nome** dos níveis na tela ("Análise básica" e "Análise aprofundada") e dos planos ("Básico" e "Avançado" são nomes de trabalho; "Avançado" e "Aprofundada" podem confundir).
7. Quando aposentar o `Pro` e o `Pro Estudo` do PLANO (Pro Estudo, para concurseiros, fica **fora** desta primeira versão; se quiser, volta como um quarto plano).
