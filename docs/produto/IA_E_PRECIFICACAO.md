# RATIONE — IA, LIMITES DE USO E PRECIFICAÇÃO

> Princípio: **o Ratione não é um site de IA.** A base é composta por ferramentas determinísticas e verificáveis.
> A IA é um **recurso opcional, medido e sempre identificado**, que acelera tarefas, mas **nunca** calcula prazo, decide vigência ou cria relação jurisprudencial sem revisão.
> Valores em reais são **hipóteses a calibrar** com os custos reais medidos no beta. Nenhum preço de provedor de IA está fixado aqui: ele muda, e deve ser preenchido na planilha de custo (§5) com a tabela vigente de cada provedor.

---

## 1. Matriz: o que usa IA e o que não usa

| Ferramenta / função | Usa IA? | Observação |
|---|---|---|
| **PrazoZero** — cálculo, memória, calendário, `.ics`, PDF, alertas | **Não** | Regras e calendário versionados. Nunca IA. |
| PrazoZero — "Ler intimação" (colar texto e extrair ato, data, processo) | Opcional | Apenas **preenche o formulário**; o usuário confere; o cálculo continua determinístico |
| **NormaViva** — texto, linha do tempo, "redação em D", diff, busca | **Não** | Dados do Planalto/LexML/Senado, com fonte e hash |
| NormaViva — "Explicar dispositivo" | Opcional | Marcado como "explicação gerada por IA"; cita o texto vigente |
| **TeseMap** — navegação por temas, precedentes e relações curadas | **Não** | Relações validadas por humano |
| TeseMap — "Sugerir relações" (curadoria interna) | Sim (interno) | Resultado entra como `sugerido_ia` até validação; **não** é exibido como fato |
| Ementa/resumo de precedente (STJ/STF) | Opcional | Texto oficial sempre visível; resumo por IA é complemento identificado |
| **Argumenta** — análise de decisão (teses, premissas, fragilidades) | **Sim (central)** | Saída estruturada; citações verificadas contra NormaViva/TeseMap |
| Busca semântica | Opcional (futuro) | Só quando a busca textual provar insuficiente |
| Meu espaço, conta, exportações | **Não** | — |

**Regra de produto:** todo resultado com IA exibe o selo **"Gerado com IA. Confira nas fontes"**, o modelo/versão usado (proveniência) e um link para a fonte quando houver.

---

## 2. Camada única de IA (multiprovedor)

Um módulo `packages/ai` (gateway) expõe operações **por tarefa**, nunca "chat livre":

```text
ai.extrairIntimacao(texto)        -> { ato, dataEvento, processo, tribunal }   (Zod)
ai.explicarDispositivo(dispositivo)-> { explicacao, trechosCitados[] }
ai.analisarDecisao(documento)     -> EstruturaDecisaoCanonica                   (pipeline em etapas)
ai.resumirEmenta(ementa)          -> { resumo }
```

### 2.1 Provedores e roteamento
- Provedores: **Anthropic (Claude), Google (Gemini), OpenAI (ChatGPT/GPT)**, atrás de uma interface única.
- Cada tarefa tem um **perfil de modelo** configurável, não um modelo fixo no código:

| Perfil | Tarefas típicas | Critério |
|---|---|---|
| `rapido` | Extração simples, classificação, resumo curto | Menor custo e latência |
| `padrao` | Explicação de dispositivo, etapas do Argumenta | Equilíbrio custo e qualidade |
| `premium` | Etapas críticas do Argumenta, casos longos/ambíguos | Maior qualidade; **cota própria** |

- **Fallback entre provedores** em caso de erro/indisponibilidade; **circuit breaker** por provedor.
- **Avaliação (evals) por tarefa:** conjunto fixo (ex.: 30 decisões públicas) para decidir qual modelo atende cada perfil. Trocar de modelo exige **rodar os evals**.
- Registrar em cada resultado: `provedor`, `modelo`, `versão do prompt`, `tokens`, `custo`, `latência`.
- Saída **estruturada e validada** (Zod); falha de validação = nova tentativa limitada, depois erro explícito (nunca texto livre aceito).

### 2.2 Privacidade no envio a provedores
1. Usar **apenas contas/planos de API** cujos termos vigentes **não treinem com dados do cliente** (confirmar por escrito, por provedor, antes de ligar).
2. **Pseudonimização antes do envio** (Argumenta): CPF, CNPJ, RG, telefone, e-mail, endereço e nomes de partes viram marcadores reversíveis (`[PARTE_A]`), restaurados só na exibição ao usuário.
3. **Aviso e consentimento** no upload: o usuário declara ter base legal para tratar o documento; documentos em **segredo de justiça** exigem confirmação expressa.
4. **Retenção mínima:** arquivo e texto extraído com prazo configurável (padrão curto) e exclusão pelo usuário.
5. Provedores no exterior = **transferência internacional** (LGPD, art. 33): registrar mecanismo (cláusulas-padrão/contrato) e listar os provedores na Política de Privacidade.
6. Logs **sem conteúdo integral** dos documentos.

---

## 3. Política de limites de uso

### 3.1 Unidade: **créditos de IA**
- Operações **sem IA** não consomem crédito; têm **uso razoável** (anti-abuso).
- Operações com IA consomem créditos proporcionais ao **custo esperado** (tamanho do documento × perfil do modelo).

| Operação (hipótese) | Créditos |
|---|---|
| Ler intimação (texto curto) | 1 |
| Explicar dispositivo | 1 |
| Resumir ementa | 1 |
| Analisar decisão até 10 páginas | 10 |
| Analisar decisão 11–30 páginas | 25 |
| Analisar decisão > 30 páginas | 50 (ou por faixa) |
| Reanálise do mesmo documento (cache) | 20% do original |

> A tabela acima é uma **proposta**. Os valores finais saem da fórmula da §5, depois da medição real.

### 3.2 Limites técnicos (por plano)
| Limite | Finalidade |
|---|---|
| Créditos IA por mês | Controle de custo |
| Páginas e tamanho por documento | Evita custo imprevisível |
| Requisições por minuto e concorrência | Estabilidade |
| Documentos armazenados | Custo de storage |
| Itens salvos em Meu espaço | Custo de banco |
| Exportações (PDF/.ics) por mês | Uso razoável |

### 3.3 Proteções
- **Teto global mensal de gasto com IA** (circuit breaker): ao atingir 80% alerta; a 100% a IA é pausada para novos usos, mantendo as ferramentas sem IA.
- **Reserva de crédito antes da execução** e **estorno automático** se a operação falhar por erro do sistema.
- Detecção de abuso (picos, contas múltiplas, compartilhamento de credenciais).
- **Mensagens claras** de limite ("faltam X créditos; renova em D") com opção de **pacote avulso**.

---

## 4. Planos (sem plano empresarial neste momento)

| | **Gratuito** | **Pro** | **Pro Estudo** (concurseiros) |
|---|---|---|---|
| Ferramentas sem IA | Com limites de uso razoável | Uso razoável ampliado | Uso razoável ampliado |
| PrazoZero: salvar, `.ics`, PDF | Limitado | Sim | Sim |
| Alertas de prazo por e-mail | — | Sim | — |
| Créditos de IA/mês | 0 a poucos (bônus) | Pacote médio | Pacote menor |
| Pacotes avulsos de créditos | Não | Sim | Sim |
| Histórico/Meu espaço | Limitado | Ampliado | Ampliado |
| Preço | R$ 0 | **R$ [A DEFINIR]** | **R$ [A DEFINIR]** |

Regras:
- **Anual com desconto**; mensal sem fidelidade.
- Créditos mensais **não acumulam**; **pacotes avulsos valem por 12 meses** (prazo curto de validade em crédito pré-pago é ponto sensível no CDC: revisar).
- **Pro Estudo:** definir como comprovar (ex.: autodeclaração + cupom) sem coletar dado excessivo.
- **Sem plano empresarial/escritório agora.** Reabrir quando houver demanda comprovada e entidade jurídica.
- Enquanto **não houver pessoa jurídica ou meio de cobrança regular**, o **beta é gratuito** (com limites de IA próprios). Cobrança só depois de resolvida a emissão de nota fiscal.

---

## 5. Modelo de custo e preço

### 5.1 Custo variável por operação
```text
custo_ia = (tokens_entrada × preço_entrada + tokens_saída × preço_saída) / 1.000.000
         × (1 + taxa_de_repetição)            # retries e validação de schema
         + custo_de_etapas_adicionais          # pipeline do Argumenta tem várias chamadas
```
**Ordem de grandeza de tokens (aproximação a medir):**
- 1 página de texto jurídico em português ≈ 800–1.200 tokens.
- Decisão de 8 páginas ≈ 8–10 mil tokens de entrada **por etapa**; o pipeline do Argumenta faz várias etapas, então a entrada total pode ser **3 a 5 vezes** o tamanho do documento (mitigável com **cache de prompt** e extração por trechos).

### 5.2 Preço mínimo por plano
```text
preço_mínimo = (custo_IA_esperado_por_usuário
              + custo_fixo_por_usuário          # banco, storage, e-mail, suporte
              + taxa_do_gateway_de_pagamento
              + impostos)
              / (1 − margem_alvo)
```
**Planilha a preencher (uma por provedor, com a tabela vigente):**

| Campo | Claude | Gemini | OpenAI |
|---|---|---|---|
| Modelo `rapido` | | | |
| Modelo `padrao` | | | |
| Modelo `premium` | | | |
| Preço por 1M tokens (entrada) | | | |
| Preço por 1M tokens (saída) | | | |
| Desconto de cache/lote | | | |
| Termos de dados (sem treino / retenção) | | | |
| Região/transferência | | | |

### 5.3 Metas e indicadores
- **Margem bruta alvo** por plano: definir (ex.: ≥ 60%) após medir.
- Monitorar: custo de IA por usuário ativo, % de usuários que esgotam créditos, taxa de falha/estorno, custo por análise por faixa de páginas, conversão Gratuito → Pro.
- **Revisão trimestral** de preços e créditos (os preços dos provedores mudam).

---

## 6. Decisões que dependem de você
1. **Preços** do Pro e do Pro Estudo (após a planilha da §5.2).
2. **Teto mensal de gasto com IA** no beta (valor em reais).
3. **Provedor padrão** de cada perfil (`rapido/padrao/premium`) após os evals.
4. **Política de créditos avulsos** (validade de 12 meses é minha recomendação).
5. **Critério do Pro Estudo.**
6. Nível de **pseudonimização** exigido por padrão no Argumenta (recomendo: sempre ligada, com opção de desligar apenas para quem aceitar o aviso).
