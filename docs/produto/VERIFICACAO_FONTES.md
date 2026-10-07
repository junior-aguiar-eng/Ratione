# RATIONE — REGISTRO DE VERIFICAÇÃO DE FONTES (PrazoZero)

> Conferido em **07/10/2026**, lendo o texto oficial (Planalto, STJ, STF) com `~/.claude/scripts/fetch_oficial.py`.
> "Verificado" aqui significa **texto lido na fonte**; não substitui a **validação jurídica** (coluna final), que cabe ao revisor.
> Regra de ouro (METODO_CALENDARIO_FORENSE.md): sem ato e URL, o dia não entra no cálculo conservador.
> **Regra de versão (decidida em 07/10/2026):** Só se verifica a **versão compilada** da lei, que já não traz o texto revogado. No Planalto, usar a URL `...compilado.htm` quando existir (códigos e decretos-lei, ex.: `del3689compilado.htm`); onde o Planalto só publica a página anotada, vale o texto que **não** está tachado: o `fetch_oficial.py` marca o tachado com `~~`, e trecho entre `~~` nunca é fonte de regra. Registrar a versão lida e a data.

## 1. Feriados nacionais (lei federal)

| Dia | Base lida | URL | Situação no código |
|---|---|---|---|
| 1/1, 21/4, 1/5, 7/9, 2/11, 15/11, 25/12 | Lei 662/1949, art. 1º, redação da Lei 10.607/2002 | planalto.gov.br/ccivil_03/leis/l0662.htm e /leis/2002/l10607.htm | `lei_federal` |
| 12/10 | Lei 6.802/1980, art. 1º | planalto.gov.br/ccivil_03/leis/l6802.htm | `lei_federal` |
| 20/11 | Lei 14.759/2023, art. 1º (DOU 22/12/2023) | planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14759.htm | `lei_federal` a partir de 2024; antes, `pendente` |

**Correção feita:** o código citava a Lei 9.093/1995, art. 2º, como base de feriado **nacional** para a Sexta-feira da Paixão. O art. 2º trata de **feriados religiosos declarados em lei municipal**, em número máximo de quatro, "neste incluída a Sexta-Feira da Paixão". Ela não é feriado nacional por lei federal. Na Justiça Federal e nos tribunais que aplicam a Lei 5.010 vale como Semana Santa (art. 62, II); nos demais é `pendente`.

## 2. Lei 5.010/1966, art. 62 (Justiça Federal "inclusive nos Tribunais Superiores")

Texto lido (planalto.gov.br/ccivil_03/leis/l5010.htm, com a redação da Lei 6.741/1979 para o inciso IV):
I. 20/12 a 6/1, inclusive · II. Semana Santa, da quarta-feira ao Domingo de Páscoa · III. segunda e terça de Carnaval · IV. 11/8, 1º/11, 2/11 e 8/12.

| Tribunal | Alcance | Prova | Situação |
|---|---|---|---|
| TRF1 a TRF6 | Justiça Federal (texto da lei) | Lei 5.010, art. 62 | `lei_federal` |
| STJ | Aplica o art. 62 (II, III, IV) | Portaria STJ/GDG 1.010/2025, art. 1º, II, IV, XI e XVIII | `lei_federal` |
| STF | Aplica o art. 62 (II, III, IV); recesso do RISTF, art. 78, § 1º | Calendário oficial STF 2026 | `lei_federal` |
| TST, TSE | O art. 62 cita "Tribunais Superiores", mas não há ato próprio lido | — | `pendente` |

Pergunta para o revisor: o TST e o TSE aplicam o art. 62 por força da expressão "inclusive nos Tribunais Superiores"? Se sim, mover para `lei_federal`.

## 3. STJ — calendário de 2026

- **Ato:** Portaria STJ/GDG nº 1.010/2025 (24/12/2025; DJe 26/12/2025). URL: bdjur.stj.jus.br/server/api/core/bitstreams/6257b5ff-8c9d-408f-a7d5-c6d7064af8eb/content
- **Pontos facultativos lidos:** 18/2 (Cinzas, até 14h), 20/4, 4/6 (Corpus Christi), 5/6, 10/8, 30/10 (transferência do 28/10), 7/12.
- **Conferência cruzada:** página "Horários de funcionamento" do STJ (atualizada em 04/02/2026) e comunicados de 17/12/2025, 16/04/2026, 28/05/2026 e 29/06/2026.
- **Suspensão de prazos:** 20/12 a 31/01 (Portaria STJ/GP 941/2025) e 2 a 31/07 (Portaria STJ/GP 455/2026), com base no art. 66, § 1º, da LC 35/1979 (texto lido no Planalto) e nos arts. 81 e 106 do RISTJ (citados pelo STJ; **o texto do RISTJ não foi lido diretamente**).
- **Correção feita:** o motor aplicava a todos os tribunais a suspensão do art. 220 do CPC (20/12 a 20/01). No STJ e no STF o prazo só volta a correr depois de 31/01, e também fica suspenso em julho.

## 4. STF — calendário de 2026

- **Ato:** calendário oficial do STF 2026, que cita a Portaria GDG/STF nº 189/2025. URL: stf.jus.br/arquivo/cms/processoCalendarioStf/anexo/CalendarioSTFOficial2026.pdf. A portaria em si **não foi lida** (o link do portal de atos retornou 404).
- **Regimento:** RISTF, art. 78 (férias em janeiro e julho; § 1º recesso de 20/12 a 6/1) e art. 105 ("Não correm os prazos nos períodos de férias e recesso"), lidos no PDF integral.
- **Pontos facultativos:** os mesmos sete do STJ. Comunicado de 03/06/2026: prazos que começam ou terminam em 4 e 5/6 vão para 8/6.

## 5. Regras de contagem (texto lido no Planalto)

| Norma | Conferido | Efeito no código |
|---|---|---|
| CPC, arts. 216, 219, 220, 224 (caput, §§ 1º a 3º) | texto literal | Corresponde ao motor |
| CPC, art. 231, V | "dia útil seguinte à consulta ao teor … ou ao término do prazo para que a consulta se dê" | **Corrigido:** a intimação eletrônica tinha o dia do começo errado (contava um dia cedo) |
| Lei 11.419/2006, art. 5º, §§ 1º a 3º | consulta = intimação realizada; consulta em dia não útil realiza no útil seguinte; 10 dias corridos para consultar | Ver ponto 1 da seção 7 |
| CPC, arts. 180, 183, 186 | prazo em dobro; **§ 2º de cada um**: não se aplica se a lei fixar prazo próprio | Aviso a incluir (item 3 da seção 7) |
| CPC, art. 229, § 2º | dobro dos litisconsortes não vale em autos eletrônicos | Fora do escopo atual |
| CLT, art. 775 (compilada) | dias úteis, com a redação da Lei 13.467/2017 | Corresponde |
| CLT, art. 775-A | recesso de 20/12 a 20/01 suspende os prazos | **Corrigido:** o motor não aplicava o recesso na CLT |
| CPP, art. 798 (caput, §§ 1º e 3º) | prazos contínuos, não se interrompem por férias; término em domingo ou feriado prorroga | Corresponde |
| CPP, art. 798-A (Lei 14.365/2022) | suspende o prazo de 20/12 a 20/01, **salvo** réu preso, Lei Maria da Penha e medida urgente | **Corrigido em 07/10/2026:** o motor contava o CPP sem suspensão. A primeira leitura usou o CPP **não compilado** (`del3689.htm`), que não traz o 798-A; a versão correta é `del3689compilado.htm`. Achado a partir da Res. TRF4 nº 228/2022, que cita o 798-A |
| CF, art. 93, XII | vedadas férias coletivas em 2º grau | Fundamenta a diferença entre STJ/STF e os TJs/TRFs (**texto não lido nesta rodada**) |

## 6. O que continua `pendente`

- **Feriados estaduais** (tabela do código): nenhum conferido. A Lei 9.093/1995, art. 1º, II, só reconhece como feriado civil estadual a **data magna** fixada em lei estadual. Há entradas suspeitas: ES (Nossa Senhora da Penha varia com a Páscoa), MT 20/11 (já é nacional), GO 24/10 (aniversário de Goiânia, municipal).
- **Feriados municipais:** não calculados (CPC, art. 1.003, § 6º).
- **Carnaval, Corpus Christi, Cinzas e pontos facultativos** de TJs e demais tribunais; calendário de **STF e STJ de 2027** (os tribunais só divulgam o ano seguinte no fim do ano; por isso a suíte e o selo cobrem apenas 2026).
- **Portarias de suspensão por indisponibilidade** do sistema (CPC, art. 224, § 1º, parte final).

## 7. Dúvidas jurídicas para o revisor

1. **Consulta em dia não útil (intimação eletrônica).** Leitura literal do CPC 231, V: dia do começo = dia útil seguinte à consulta, e a contagem começa no dia seguinte a esse. A Lei 11.419, art. 5º, § 2º, diz que a intimação se realiza no primeiro dia útil seguinte; somando o art. 231, V, alguns entendem que o dia do começo seria o útil depois disso (um dia a mais). O motor usa a leitura literal (data mais cedo). Cenário `portal-sabado`.
2. **Ponto facultativo no meio do prazo.** O STF informa que prazos "que se iniciarem ou se encerrarem" nesses dias são prorrogados; a Portaria do STJ os lista "para os fins dos arts. 219 e 224, § 1º". O motor trata esses dias como **sem expediente** (não computados, CPC art. 216). Confirmar se, no meio do prazo, o dia conta.
3. **Prazo em dobro com prazo próprio** (CPC 180, § 2º; 183, § 2º; 186, § 4º): o campo "Prazo em dobro" da tela não distingue. Não há como o motor saber se a lei fixou prazo próprio.
4. **TST e TSE** (seção 2).

## 8. Auditoria da regra de versão (07/10/2026)

Os 24 artigos em que o motor se apoia foram relidos com o script que marca o tachado (`~~`). **Nenhum** tem texto tachado nem "(Revogado)":
CPC 180, 183, 186, 216, 219, 220, 224, 229, 231 · Lei 662/1949 art. 1º · Lei 6.802/1980 art. 1º · Lei 9.093/1995 arts. 1º e 2º · Lei 14.759/2023 art. 1º · CLT (compilada) 775 e 775-A · CPP (compilado) 798 e 798-A · Lei 11.419/2006 art. 5º · LC 35/1979 art. 66 · Lei 9.099/1995 arts. 12-A, 42 e 49 · Lei 10.259/2001 art. 9º · Lei 12.153/2009 art. 7º.
Ressalvas: a Lei 5.010/1966, art. 62, tem o inciso IV antigo tachado e o vigente (Lei 6.741/1979) logo abaixo, e o motor usa o vigente. Na Lei 9.099, o art. 50 (vizinho do 49) aparece tachado e não é usado.

## 9. Catálogo de prazos (F2-08), lido em 07/10/2026

| Prazo | Dias | Base lida | Versão |
|---|---|---|---|
| Recursos cíveis em geral (apelação, agravo de instrumento, agravo interno, RE, REsp, agravo em RE/REsp, embargos de divergência, recurso ordinário, contrarrazões) | 15 | CPC, art. 1.003, § 5º (15 dias para interpor e responder, exceto embargos de declaração) | anotada, não tachado |
| Embargos de declaração (CPC) | 5 | CPC, art. 1.023 e § 2º | anotada |
| Contrarrazões à apelação; ao RE/REsp | 15 | CPC, art. 1.010, § 1º; art. 1.030 (redação da Lei 13.256/2016) | anotada |
| Contestação; réplica; impugnação ao cumprimento | 15 | CPC, arts. 335, 350 e 351, 525 | anotada |
| Prazo supletivo | 5 | CPC, art. 218, § 3º | anotada |
| CLT: recurso ordinário; agravo de petição; agravo de instrumento | 8 | CLT, arts. 895 e 897, a e b | compilada |
| CLT: embargos de declaração | 5 | CLT, art. 897-A | compilada |
| CPP: apelação; recurso em sentido estrito | 5 | CPP, arts. 593 e 586 | compilado |
| CPP: razões de apelação; embargos de declaração contra acórdão | 8; 2 | CPP, arts. 600 e 619 | compilado |
| JEF: recurso inominado; embargos | 10; 5 | Lei 9.099/1995, arts. 42 e 49 (e 12-A) | anotada |
| Mandado de segurança (material) | 120 | Lei 12.016/2009, art. 23 | anotada |
| Ação rescisória (material) | 2 anos | CPC, art. 975 e § 1º | anotada |

Achados da leitura: o art. 1.030 do CPC tem o caput antigo tachado e o vigente mantém os 15 dias; o art. 1.042 foi reescrito em **2026** (Lei 15.484/2026, "relevância da questão de direito federal infraconstitucional"), sem mudar o prazo de 15 dias.
Fora do catálogo, por não terem sido lidos: recurso de revista e embargos à SDI (CLT/Lei 5.584), embargos de declaração de sentença criminal (CPP, art. 382), habeas corpus, recursos dos Juizados Especiais Federais e demais ritos especiais.

## 10. Recesso no JEF e prazos criminais em STF e STJ (F2-15), lido em 07/10/2026

| Ponto | Fonte lida | Conclusão |
|---|---|---|
| Suspensão de 20/12 a 20/01 no JEF | **Res. CNJ 244/2016, art. 3º** (situação: vigente, atos.cnj.jus.br): "Será suspensa a contagem dos prazos processuais em todos os órgãos do Poder Judiciário, inclusive da União, entre 20 de dezembro a 20 de janeiro … art. 220 do CPC, independentemente da fixação ou não do recesso" | Vale nos Juizados. Confirmado por ato de tribunal: Portaria Presi 431/2016 do TRF1 ("2º Grau, 1º Grau, Juizados Especiais Federais e Turmas Recursais") e Portaria Conjunta 1.512/2023 do TJMG (suspensão em 1ª e 2ª instâncias, citando Juizados e Turmas Recursais nas urgências) |
| Enunciado 165 do FONAJE | Artigo de doutrina (Empório do Direito, 2018) | Trata de contagem contínua de prazos, **não** do recesso; superado pelo art. 12-A da Lei 9.099 |
| STJ, prazos criminais, recesso e férias de janeiro | Comunicado do STJ de 16/12/2022 sobre a **Portaria STJ/GP 584/2022** | Suspensão de 20/12 a 31/01 "excetua os prazos processuais em matéria penal, em razão do art. 798-A do CPP" |
| STJ, prazos criminais, férias de julho | Comunicado do STJ de 29/06/2023 sobre a **Portaria STJ/GP 280/2023** | Suspensão de 2 a 31/07; "nos penais, o art. 798, §§ 1º e 3º, do CPP" (contínuos, prorrogando só o vencimento em dia sem expediente) |
| STF, prazos criminais | Comunicado do STF de 06/12/2024 sobre a **Portaria GDG 218/2024** | Prazos suspensos de 20/12 a 31/01 "com exceção das regras aplicáveis a processos penais, previstas no CPP"; o RISTF, art. 105, remete ao CPP, art. 798, caput ("correm nas férias") |

Limites: as portarias do STJ e do STF foram lidas pelos **comunicados oficiais** do tribunal, não pelo inteiro teor. Calendários de STF e STJ para 2027 ainda não existem (os tribunais divulgam o ano seguinte no fim do ano).

## 11. Como repetir esta verificação

```bash
python ~/.claude/scripts/fetch_oficial.py https://www.planalto.gov.br/ccivil_03/decreto-lei/del3689compilado.htm
```

PDFs (portarias, RISTF) são salvos e lidos à parte. Calendário de outro tribunal ou de outro ano: baixar o ato, registrar aqui (ato, URL, data) e só então incluir em `CALENDARIO_VERIFICADO` (`packages/prazozero/src/calendario/feriados.ts`).
