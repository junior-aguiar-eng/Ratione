# RATIONE — MÉTODO DO CALENDÁRIO FORENSE E CATÁLOGO DE PRAZOS

> Abordagem definida: partir dos **prazos previstos nos grandes códigos**, cruzar com os **feriados nacionais** e acrescentar, tribunal a tribunal, os **calendários forenses**. **Prioridade: STF e STJ**; depois TRFs e TJs.
> Tudo que está marcado **[VERIFICAR]** é hipótese de trabalho e **não pode ir à produção sem fonte** (ato, URL e data de verificação).

---

## 1. Camadas do cálculo (da mais geral à mais específica)

| Camada | Conteúdo | Origem | Onde vive |
|---|---|---|---|
| **1. Regras de contagem** | Dias úteis (CPC, art. 219), exclusão do dia do começo e inclusão do vencimento (art. 224), prorrogação (art. 224, § 1º), disponibilização × publicação (art. 224, §§ 2º–3º) | Lei | Código dos motores (testado) |
| **2. Catálogo de prazos** | Cada ato, quantos dias, regime, base legal | CPC, CLT, CPP, leis especiais, regimentos | Tabela `regras_prazo` (dado versionado) |
| **3. Prazos diferenciados** | Fazenda (art. 183), MP (art. 180), Defensoria (art. 186), litisconsortes com advogados distintos (art. 229) | CPC | Parâmetros do cálculo |
| **4. Dias não úteis nacionais** | Feriados nacionais fixos e móveis | Leis federais | `calendario_eventos` (nacional) |
| **5. Dias não úteis por esfera** | Justiça Federal e Tribunais Superiores (Lei 5.010/1966, art. 62) | Lei | `calendario_eventos` (esfera) |
| **6. Suspensões e recesso** | Recesso do CPC (art. 220: 20/12 a 20/01) e atos dos tribunais | CPC + portarias | `calendario_eventos` (tribunal) |
| **7. Eventos locais e extraordinários** | Feriados estaduais/municipais, indisponibilidade do sistema, prorrogações | Atos do tribunal | `calendario_eventos` (tribunal/comarca) |

**Regra de ouro:** cada linha de `calendario_eventos` tem **fonte (ato + URL)**, **abrangência**, **vigência** e **verificado_em / verificado_por**. Sem fonte, não entra.

---

## 2. Prioridade 1: STF e STJ

### 2.1 O que levantar (checklist por tribunal)
- [ ] **Regimento Interno** (RISTF / RISTJ): prazos próprios, recesso e férias coletivas, e se esses períodos **suspendem prazos** **[VERIFICAR]**.
- [ ] **Portarias/Resoluções anuais** de expediente, feriados e recesso (publicadas a cada ano).
- [ ] **Lei 5.010/1966, art. 62** (feriados forenses da Justiça Federal e Tribunais Superiores) **[VERIFICAR a redação vigente e o alcance sobre STF/STJ]**.
- [ ] Horário de expediente e **fim do peticionamento eletrônico** (dia do vencimento).
- [ ] Regras de **intimação eletrônica** do tribunal (portal/DJe) e prazo de consulta (Lei 11.419/2006, art. 5º).
- [ ] Atos de **indisponibilidade do sistema** (prorrogação do prazo).
- [ ] Página oficial de **calendário/feriados** do tribunal (para conferência cruzada).

### 2.2 Catálogo inicial de prazos (para validação jurídica)
Base: CPC/2015, **conferir cada item contra o texto vigente** antes de codificar. Regra geral: art. 1.003, § 5º (15 dias, exceto embargos de declaração).

| Ato | Dias | Base **[VERIFICAR]** |
|---|---|---|
| Apelação | 15 | CPC, arts. 1.003, § 5º, e 1.009 |
| Agravo de instrumento | 15 | CPC, arts. 1.003, § 5º, e 1.015 |
| Agravo interno | 15 | CPC, art. 1.021, § 2º |
| Embargos de declaração | 5 | CPC, art. 1.023 |
| Recurso extraordinário | 15 | CPC, arts. 1.003, § 5º, e 1.029 |
| Recurso especial | 15 | CPC, arts. 1.003, § 5º, e 1.029 |
| Agravo em RE/REsp (inadmissão) | 15 | CPC, art. 1.042 |
| Embargos de divergência | 15 | CPC, art. 1.043 e ss. |
| Recurso ordinário constitucional | 15 | CPC, art. 1.028 |
| Contrarrazões / resposta a recurso | 15 | CPC, art. 1.010, § 1º, e art. 1.030 |
| Contestação | 15 | CPC, art. 335 |
| Réplica | 15 | CPC, arts. 350–351 |
| Impugnação ao cumprimento de sentença | 15 | CPC, art. 525 |
| Prazo supletivo (sem previsão) | 5 | CPC, art. 218, § 3º |
| Mandado de segurança (prazo para impetrar) | 120 dias (**decadência, corridos**) | Lei 12.016/2009, art. 23 |
| Ação rescisória | 2 anos (**decadência**) | CPC, art. 975 |

Observações para o modelo de dados:
- Distinguir **prazo processual** (dias úteis) de **prazo material/decadencial** (corridos, regra própria).
- Os **prazos dos regimentos internos** (STF/STJ) podem diferir do CPC em atos próprios **[VERIFICAR]**.
- Campos: `ato`, `dias`, `regime`, `tipo[processual|material]`, `base_legal`, `vigencia_inicio/fim`, `observacao`.

---

## 3. Prioridade 2: TRFs e TJs

1. **Feriados nacionais** (camada 4) + **esfera Justiça Federal** (camada 5) para os TRFs.
2. **Feriados estaduais** a partir de **lei estadual**, cada um com número e URL oficial. A tabela atual do repositório **não pode ser reaproveitada sem conferência ato a ato**: várias leis citadas não foram confirmadas.
3. **Calendário forense do tribunal**: portaria anual de recesso/feriados/pontos facultativos.
4. **Feriado municipal:** o sistema **não calcula** por padrão; avisa e exige que o usuário informe/comprove (CPC, art. 1.003, § 6º).
5. **Ordem sugerida de TJs:** definida pelo seu público (incluir **TJAL** se for o seu mercado).

---

## 4. Processo de manutenção do calendário (contínuo)

1. **Painel de curadoria** interno: criar/editar evento com fonte obrigatória.
2. **Rotina anual** (novembro): levantar portarias de recesso e calendário do ano seguinte, tribunal por tribunal.
3. **Monitoramento**: checagem semanal das páginas oficiais; mudança gera tarefa de revisão.
4. **Selo de verificação** visível ao usuário: "Calendário do TJXX verificado em DD/MM/AAAA".
5. **Registro de correções** público (o que mudou, quando, por quê).
6. **Modo conservador** quando o calendário do tribunal **não estiver verificado para o período**: o sistema avisa e **não** apresenta o resultado como definitivo.

---

## 5. Validação jurídica (você é o revisor)

- **Suíte de ≥ 100 cenários**, cada um com: entrada, tribunal, calendário usado, resultado esperado, **fundamento** e **autor/data da validação**.
- Cenários obrigatórios (mínimo): disponibilização na sexta; véspera de feriado; Carnaval e Semana Santa; recesso de 20/12 a 20/01; prazo em dobro; litisconsórcio; prorrogação por indisponibilidade; ano bissexto; virada de ano; STF e STJ com expediente próprio.
- **Regressão:** qualquer alteração em regra ou calendário reexecuta toda a suíte.
