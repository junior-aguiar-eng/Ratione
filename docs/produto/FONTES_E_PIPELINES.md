# RATIONE — FONTES DE DADOS E PIPELINES (viabilidade e testes de bancada)

> Este documento responde, ponto a ponto, às propostas de integração. O que **não pude verificar** nesta sessão está marcado **[NÃO VERIFICADO]** e vira um **teste de bancada** (§5).

---

## 1. DataJud → ementa (proposta: "puxar a ementa a partir do metadado")

### 1.1 Resultado da análise
- A API pública do DataJud entrega **metadados**: número do processo, tribunal, grau, órgão julgador, classe, assuntos, movimentos (com complementos), prioridade, sistema de tramitação e polos quando pessoa jurídica. **Processos em segredo de justiça não aparecem.**
- **Ementa e inteiro teor não constam** dos campos descritos nas fontes consultadas **[confirmar com consulta real]**.

**Conclusão:** o DataJud **não fornece a ementa**. Ele serve como **chave de ligação** (identifica o processo, o órgão e os movimentos). A ementa precisa vir de **outra fonte**, por tribunal.

### 1.2 Caminho viável por tribunal

| Tribunal | Fonte da ementa | Viabilidade | Observação |
|---|---|---|---|
| **STJ** | **Dados Abertos do STJ**: *espelhos de acórdãos* (campos incluem ementa, informações complementares e termos auxiliares) | **Alta** | Arquivos para download, sem API em tempo real; atualização defasada; casar por número do processo/registro **[NÃO VERIFICADO]** |
| **STF** | Sem API oficial de jurisprudência. **Corte Aberta** (CSV de temas/estatísticas); portal de pesquisa de jurisprudência | **Média/baixa** | Raspagem é frágil e exige análise dos termos de uso. Começar com **temas de repercussão geral e súmulas vinculantes curados** |
| TRFs / TJs | Portal de jurisprudência de cada tribunal | **Baixa no curto prazo** | Sem padrão nacional. **Fora do escopo da v1** (prioridade: superiores) |

### 1.3 Pipeline proposto (STJ)
```text
número CNJ do processo
   │
   ▼  DataJud (metadados, movimentos)         → confirma processo, órgão, classe
   │
   ▼  Índice local dos espelhos do STJ         → casar por nº do processo / nº de registro
   │     (carga periódica dos dados abertos)
   ▼
ementa oficial + metadados (relator, órgão, data de julgamento, referências legislativas)
   │
   ▼  Exibição com fonte e data de coleta; resumo por IA opcional (identificado)
```
Riscos: **um processo gera vários acórdãos** (embargos, agravos); o casamento por número pode devolver mais de um resultado → exibir lista, nunca escolher sozinho.

---

## 2. Senado Federal — API de Legislação (indicada por você)

- Documentação: `legis.senado.leg.br/dadosabertos/api-docs/swagger-ui/` (grupo **Legislação**).
- Segundo as fontes consultadas: base `legis.senado.leg.br/dadosabertos`, **sem autenticação**, XML por padrão e JSON por cabeçalho `Accept`; atua como resolvedor LexML de normas, com identificação, publicação e histórico de alteração **[NÃO VERIFICADO nesta sessão: o ambiente bloqueia o host]**.

**Uso previsto:** identidade e metadados das normas (URN), histórico de alterações e **alertas de novas normas**, cruzados com o **texto do Planalto** (fonte do texto consolidado).

**A decidir após o teste de bancada:** se o endpoint de legislação traz o **texto** das normas (e em que formato) ou apenas metadados e referências. Isso define se o Planalto é fonte primária do texto ou apenas verificador.

---

## 3. Demais fontes (resumo)

| Fonte | Papel | Estado |
|---|---|---|
| **Planalto** | Texto oficial consolidado e anotações de alteração | Parser próprio; sem API |
| **LexML** (URN:LEX, SRU, OAI-PMH) | Identificador canônico e metadados | A testar |
| **Câmara** (`dadosabertos.camara.leg.br/api/v2`) | Projetos em tramitação (alertas) | API aberta |
| **STJ Dados Abertos** | Espelhos, precedentes qualificados | Download de arquivos |
| **STF Corte Aberta** | Temas, estatísticas | CSV |
| **Comunica API/DJEN (CNJ)** | Intimações | Exige credencial do CNJ; fase tardia |
| **Calendários forenses** | Eventos por tribunal | Curadoria própria (ver `METODO_CALENDARIO_FORENSE.md`) |

---

## 4. Princípios de ingestão
1. **Idempotente**: reexecutar não duplica; compara por `hash`.
2. **Procedência**: guardar `fonte_url`, `coletado_em`, `versao_parser`, `hash`.
3. **Falha visível**: erro de coleta gera alerta e **não** apaga o último dado válido.
4. **Cache e cortesia**: respeitar limites e `robots`/termos de cada fonte; identificar o cliente.
5. **Fila de revisão**: mudanças relevantes (texto de norma, calendário) passam por conferência humana antes de publicar.
6. **Separar dado bruto e dado interpretado** (reprocessar sem recoletar).

---

## 5. Testes de bancada (para quando a rede permitir)

Cada teste termina com um **relatório curto**: o que funciona, o que não, exemplos reais e decisão.

| # | Teste | Hosts necessários | Pergunta a responder |
|---|---|---|---|
| T1 | Consulta real ao **DataJud** (STJ e STF): 20 processos | `api-publica.datajud.cnj.jus.br` | Quais campos voltam? Há algum texto decisório? Cota/limite? |
| T2 | Baixar **espelhos de acórdãos do STJ** (amostra) e inspecionar o dicionário de dados | portal de dados abertos do STJ | Campo de ementa? Chave de ligação com o nº do processo? Frequência de atualização? |
| T3 | Explorar a **API de Legislação do Senado** (swagger) | `legis.senado.leg.br` | Retorna texto? Histórico de alterações? Formato? |
| T4 | Coletar **CPC e CF do Planalto** e extrair artigos/anotações | `www.planalto.gov.br` | Qualidade do parser para "Redação dada pela…" |
| T5 | **LexML**: resolver URN do CPC e consultar SRU | `www.lexml.gov.br` | Metadados e vínculos úteis? |
| T6 | **Corte Aberta (STF)**: baixar CSV de temas de repercussão geral | portal do STF | Campos e atualização? |
| T7 | Páginas de **calendário/portarias do STF e do STJ** | sites dos tribunais | Há formato estável para monitorar? |

> **Para executar T1–T7 nesta sessão,** é preciso liberar os domínios acima nas configurações de rede do ambiente (ver mensagem ao final).
