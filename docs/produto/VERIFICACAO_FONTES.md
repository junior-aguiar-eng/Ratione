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

- **Feriados estaduais** (tabela do código): nenhum conferido, exceto onde há ato lido (TJSP e TJMG em 2026, seção 11). A Lei 9.093/1995, art. 1º, II, só reconhece como feriado civil estadual a **data magna** fixada em lei estadual. Há entradas suspeitas: ES (Nossa Senhora da Penha varia com a Páscoa), MT 20/11 (já é nacional), GO 24/10 (aniversário de Goiânia, municipal).
- **Feriados municipais:** não calculados (CPC, art. 1.003, § 6º).
- **Carnaval, Corpus Christi, Cinzas e pontos facultativos** de TJs e demais tribunais; calendário de **STF e STJ de 2027** (os tribunais só divulgam o ano seguinte no fim do ano; por isso a suíte e o selo cobrem apenas 2026).
- **Portarias de suspensão por indisponibilidade** do sistema (CPC, art. 224, § 1º, parte final).

## 7. Dúvidas jurídicas para o revisor

1. ~~**Consulta em dia não útil (intimação eletrônica).**~~ **Resolvida em 07/10/2026 pelo revisor: vale a leitura A.** Consulta em dia não útil: a intimação se realiza no primeiro dia útil seguinte (Lei 11.419, art. 5º, § 2º), esse dia é o dia do começo (excluído, CPC art. 224) e a contagem começa no dia útil seguinte a ele. Exemplo: consulta no sábado 14/03/2026, 5 dias úteis, vence em 23/03/2026. É o que o motor já fazia. Cenário `portal-sabado` validado; o limite de 10 dias corridos da ciência tácita (art. 5º, § 3º) segue a mesma lógica.
2. **Ponto facultativo no meio do prazo.** O STF informa que prazos "que se iniciarem ou se encerrarem" nesses dias são prorrogados; a Portaria do STJ os lista "para os fins dos arts. 219 e 224, § 1º". O motor trata esses dias como **sem expediente** (não computados, CPC art. 216). Confirmar se, no meio do prazo, o dia conta.
3. **Prazo em dobro com prazo próprio** (CPC 180, § 2º; 183, § 2º; 186, § 4º): o campo "Prazo em dobro" da tela não distingue. Não há como o motor saber se a lei fixou prazo próprio.
4. **TST e TSE** (seção 2).
5. **Mandado de segurança: vencimento em dia sem expediente.** A Lei 12.016, art. 23, não prevê prorrogação e o Código Civil, art. 132, § 1º, só a prevê para feriado. O motor mostra o 120º dia como data-limite e a prorrogação ao dia útil como alternativa. A jurisprudência sobre fim de semana e ponto facultativo não foi verificada.
6. **Mandado de segurança e a ADI 4296.** A página do Planalto marca o art. 23 com "Vide ADIN 4296". O efeito dessa ação sobre o prazo de 120 dias não foi verificado.
7. **Ação rescisória em 29/02.** O art. 132, § 3º, do Código Civil manda expirar "no imediato" se faltar correspondência: o motor adota 28/02 (a mais cedo) e avisa que a leitura literal seria 1º/03.

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

## 11. Calendário dos tribunais estaduais (F2-03 e F2-04), lido em 07/10/2026

Os eventos ficam em `packages/prazozero/src/calendario/eventos.ts`, cada um com a sua fonte. O selo "calendário conferido" só vale para tribunal e ano com cobertura declarada.

| Tribunal | Fonte lida | O que entrou | Selo |
|---|---|---|---|
| **TJSP** | **Provimento CSM nº 2.813/2025** (DJE 25/11/2025), inteiro teor no portal de legislação do TJSP | 16 e 17/02 (Carnaval), 02 e 03/04, 20/04, 04 e 05/06, **09/07 (Data Magna, Lei Estadual 9.497/1997)** e 10/07, 07 e **08/12**, 30/10 (Dia do Servidor, transferido de 28/10 pelo Provimento CSM 2.845/2026, **citado no próprio provimento mas não lido**), recesso de 1º a 6/01 e de 20 a 31/12, e Quarta de Cinzas (18/02) com jornada começando 3 horas depois (expediente parcial) | 2026 |
| **TJMG** | **Portaria Conjunta nº 1.764/PR/2026** (DJe 13/01/2026) e **Resolução OE nº 458/2004** (alterada pela 1.081/2024), art. 1º | 2026: 16 a 18/02 (Quarta de Cinzas **inteira**), 01 a 03/04, 20/04, 30/10, 07/12. Permanente (Res. 458): Carnaval de segunda a quarta, Semana Santa de quarta a sexta, 8/12. **Pendentes por comarca:** 04 e 05/06 (Corpus Christi, feriado municipal em Belo Horizonte e em outras comarcas) | 2026 |
| **TJAL** | (1) **Ato Normativo do TJAL (03/2026 pela notícia)**, texto lido na p. 7 do **DJE, Caderno Administrativo, ed. 3944, de 28/01/2026** (PDF do responsável; o número do ato fica na página anterior, não lida): suspende 20/04, 05/06, 10/08 e 07/12 e cita 04/06, 11/08 e 08/12 como feriados; **28/08 só nos municípios que preveem o feriado, pendente**. (2) **Lei estadual 6.564/2005 consolidada** (site do TJAL, cabeçalho "alterada até a Lei 8.850/2021"; arts. 35 a 38 sem marca de alteração), lida em 07/10/2026: art. 36 (Semana Santa de quarta a domingo de Páscoa, 11/08, 8/12, Carnaval de segunda a quarta) e art. 37 (feriados forenses de 23/06 a 01/07 e de 20 a 31/12) | Eventos 2026 do ato + regras anuais do art. 36 e de 20 a 31/12 (conferidos). **Pendentes:** 23/06 a 01/07 (art. 37: texto lido, mas nenhum ato de tribunal que o aplique foi visto e o efeito é de 9 dias) e 28/08. Limite: alterações da lei depois de 2021 não foram verificadas | 2026 |
| **TJRJ** | **Informativo oficial do TJRJ** "Suspensão de prazos e de expediente forense, calendário de feriados 2026" (atualizado em 05/10/2026), PDF de 39 páginas lido em 07/10/2026 pelo navegador do app (o servidor envia a cadeia de certificados incompleta e o script recusa; a verificação do certificado **não** foi desligada). O documento se diz informativo e que não substitui a publicação oficial, mas cita cada ato com número e página do DJERJ; os atos em si **não foram lidos** | Ocorrências de **todo o Estado** até 12/10: 05/02 e 27/03 (prorrogação por indisponibilidade), 13/02, Carnaval 16 a 18/02 (Lei 10.633/2024, art. 83, III), 27/02 (chuvas), 02 e 03/04 (art. 83, IV), 23/04 (São Jorge, Lei estadual 5.198/2008), 24/04, 04/06 (Corpus Christi, Lei estadual 11.002/2025), 05/06, 24/06 e 29/06 (Copa), 29/07, 07/08, 11/08 (Dia do Advogado), 04/09 e 11/09. Não entram: comarcas e fóruns regionais isolados, suspensões que valem só para INSS ou AGU, 20/01 (São Sebastião, só no município do Rio). **Sem selo:** faltam outubro a dezembro (Dia da Justiça, recesso) | não |
| **TJPR** | **Decreto Judiciário nº 621/2025** (Presidência), `https://www.tjpr.jus.br/documents/d/comunicacao/sei_12428873_decreto`, inteiro teor (PDF de 7 páginas, SEI 0064955-90.2025.8.16.6000), lido em 10/10/2026 pelo script oficial; **Resolução nº 515/2025** (recesso 2025/2026) só pelo comunicado do TJPR de 17/12/2025 | 2026: art. 1º (Carnaval 17/02, Paixão de Cristo 03/04, Corpus Christi 04/06, Dia do Funcionário Público em **30/10**, transferido de 28/10, e Dia da Justiça em **18/12**, transferido de 08/12); art. 2º (suspensão com compensação de 1 hora por dia: 16/02, 02/04, 20/04 e 05/06); art. 3º (24/12 e 31/12). **Fora de propósito:** 08/09 (padroeira de Curitiba, só no município; art. 4º traz os feriados locais de todas as comarcas, que nunca entram: CPC, art. 1.003, § 6º). 08/12 **não** é feriado forense em 2026 (foi transferido). O decreto não trata da Quarta-feira de Cinzas. Recesso: 20/12 a 06/01 e 07 a 20/01, igual ao CPC, art. 220; a resolução de dezembro de 2026 ainda não foi publicada, e o efeito sobre prazos é o mesmo do CPC | 2026 |
| **TJRS** | **Ato nº 05/2025 do Órgão Especial** (assinado em 21/10/2025; 2026), **Ato nº 06/2026 do Órgão Especial** (DJE 02/10/2026; 2027) e **Ato Conjunto nº 004/2026 (P e CGJ)** (DJE 02/07/2026), todos em inteiro teor (PDF de 2 páginas cada), baixados da página oficial de feriados do TJRS em 10/10/2026 | **2026:** Carnaval 16 e 17/02, Sexta-Feira Santa 03/04, Dia da Justiça 08/12 e **02/07 (suspensão dos prazos por falta de energia e indisponibilidade dos sistemas)**; Corpus Christi 04/06 **pendente**. **2027:** Carnaval 08 e 09/02, Sexta-Feira Santa 26/03 e Dia da Justiça 08/12; Corpus Christi 27/05 **pendente**. Os atos marcam com asterisco **02/02 (Navegantes) e Corpus Christi como feriados municipais de Porto Alegre**: 02/02 não entra e Corpus Christi fica pendente (depende da comarca). A Revolução Farroupilha (20/09) já é regra anual conferida. Os atos não tratam da Quarta-feira de Cinzas nem do recesso (o efeito sobre prazos é o do CPC, art. 220). **Limite:** não localizei outros atos pontuais de 2026 (as notícias de suspensão em dias de jogos do Brasil são de 2022), mas não posso provar que não existam | 2026 e 2027 |
| **TJBA** | **Decreto Judiciário nº 1050/2025** (DJE nº 3.944, 05/12/2025, pp. 6 a 8), `https://www.tjba.jus.br/portal/wp-content/uploads/2025/12/Decreto-1050-25_-expediente-forense-2026.pdf`, inteiro teor; **Decreto Judiciário nº 944/2026** (25/06/2026), texto no site do TJBA, que ressalva não substituir o do DJE de 26/06/2026; **Decretos 111/2026 e 959/2026** (lidos: confirmam o calendário em vigor; o 959 trata só de uma comarca). Todos lidos em 10/10/2026 | 2026: art. 5º lista **feriados e pontos facultativos juntos, todos "sem expediente forense"**, e o art. 8º prorroga os prazos que vencem neles; por isso todos contam como dia não útil: Carnaval e **Quarta-feira de Cinzas por inteiro** (12, 13, 16, 17 e 18/02), Endoenças e Sexta-feira Santa (02 e 03/04), 20/04, Corpus Christi e emenda (04 e 05/06), **São João (22, 23 e 24/06)**, **Independência da Bahia (02 e 03/07)**, 10 e 11/08, 30/10 (transferido de 28/10) e 07 e 08/12; mais **29/06 (Decreto 944/2026: prazos suspensos no jogo da Seleção; Nova Viçosa foi excepcionada pelo Decreto 959/2026, feriado municipal)**. Os feriados federais do art. 5º não se repetem; 02/01 já está no recesso. Recesso (arts. 2º e 4º: 20/12 a 06/01 e 07 a 20/01) igual ao CPC, art. 220. **Os feriados municipais por comarca (Decreto Judiciário 09/2026 e alterações) nunca entram** (CPC, art. 1.003, § 6º); o art. 10 admite outros feriados locais por determinação do Presidente. O art. 9º permite alterar o calendário. **Limite:** o 944 foi lido pelo texto do site, não pelo DJE; não localizei outros atos gerais de 2026, mas não posso provar que não existam | 2026 |
| **TJDF (TJDFT)** | **Portaria Conjunta nº 105/2025** (17/12/2025; Diário Administrativo 26/12/2025), `https://www.tjdft.jus.br/institucional/imprensa/noticias/imagens-e-arquivos-2025/sei_4868188_portaria_conjunta_105-1.pdf`, inteiro teor (PDF de 4 páginas, SEI 0047698/2025); **Portaria Conjunta nº 48/2026** (10/06/2026), inteiro teor (3 páginas), alterada pela **53/2026** (só pelas notícias oficiais). Conferidas com a página oficial "Feriados e expedientes suspensos" do TJDFT. Lidas em 10/10/2026 | 2026: o art. 2º lista feriados e **pontos facultativos juntos**, o art. 4º suspende o expediente e o art. 5º prorroga os prazos; por isso todos contam como dia não útil: Carnaval e **Quarta-feira de Cinzas por inteiro** (16, 17 e 18/02), Semana Santa (01 a 05/04), 20/04, Corpus Christi e emenda (04 e 05/06), 10 e 11/08, 30/10 (transferido de 28/10), 07 e 08/12, 24/12 e 31/12. **Copa do Mundo (Portaria 48/2026):** 29/06 ponto facultativo (jogo às 14h, redação da 53/2026) e **24/06 com expediente das 9h às 16h, em que os prazos que começam ou terminam no dia são prorrogados** (efeito `expediente_parcial`); 19/06 teve expediente normal (jogo após as 20h). **30/11 (Dia do Evangélico) vale só para os ofícios extrajudiciais (art. 3º): não é feriado forense**, o que reforça a correção da seção 14. Feriados federais da lista não se repetem. Recesso (página oficial: 02 a 06/01 e 20 a 31/12, Lei 11.697/2008, art. 60) igual ao CPC, art. 220. **Limite:** não localizei avisos para jogos do Brasil depois de 29/06, nem outros atos gerais de 2026; a Portaria 53/2026 não foi lida por inteiro | 2026 |
| **TJSC** | **Resolução GP nº 1/2026** (16/01/2026; DJE nº 4.649, 19/01/2026), **texto compilado** (com as alterações das Resoluções GP 10, 12 e 45/2026), lido em 10/10/2026 pela API do sistema de busca de textos do TJSC (`busca.tjsc.jus.br/buscatextual/rest/documento/integraCompilado/1/188428`; a página pública é uma aplicação JavaScript); **Resolução GP nº 31/2026** (27/05/2026; DJE 28/05/2026), inteiro teor; **notícia oficial de 13/02/2026** (Carnaval e Quarta-feira de Cinzas) | 2026, só as 16 linhas do Anexo Único que valem para "Tribunal de Justiça, Turmas Recursais e todas as comarcas do Estado" (as outras 195 são municipais e nunca entram: CPC, art. 1.003, § 6º): Carnaval 16 e 17/02, Quinta e Sexta-feira Santa (02 e 03/04), Corpus Christi 04/06, **Dia do Funcionário Público em 28/10 (em SC não é transferido para 30/10)** e **Dia da Justiça 08/12 ("efeitos forenses")**; mais os federais. Sem emenda de Tiradentes (20/04 é só municipal). **Quarta-feira de Cinzas (18/02): expediente a partir das 12h** (Res. GP 13/2022 e Res. TJ 7/2006, só pela notícia): `expediente_parcial`. **Copa (Res. GP 31/2026):** nos dias úteis de jogo entre 14h e 19h o horário é excepcional e o dia do começo e o do vencimento dos prazos são postergados (art. 2º); **24/06 (jogo às 19h, expediente das 10h às 17h) conferido pela notícia oficial de 09/06/2026**; 13/06 (sábado) e 19/06 (21h30) ficam fora. **29/06 fica `pendente`**: a resolução o alcançaria (jogo às 14h, segundo os avisos do TJDFT e do TJBA), mas não localizei aviso do TJSC. O recesso fica para "resolução própria" (art. 1º, parágrafo único), não localizada; o efeito sobre prazos é o do CPC, art. 220. **O 11/08 não consta do anexo estadual**, o que confirma a remoção da seção 14. **Limite:** sem avisos de jogos do Brasil depois de 29/06 nem outros atos gerais de 2026 localizados; as Resoluções GP 1/1985, 74/2023 e 13/2022 não foram lidas | 2026 |
| **TJPE** | **Ato Conjunto nº 43/2025** (13/10/2025; DJe nº 304/2025, 14/10/2025), `https://portal.tjpe.jus.br/documents/d/portal/feriados-2026-pdf`, inteiro teor (2 páginas do DJe); **Ato nº 966/2026** (12/05/2026), inteiro teor; **Ato nº 977/2026** (14/05/2026; DJe nº 109/2026), inteiro teor na página do DJe. Lidos em 10/10/2026 | 2026: art. 1º (Carnaval 16 e 17/02, **Quarta-feira de Cinzas 18/02 sem expediente por inteiro**, Quinta e Sexta-feira Santa 02 e 03/04, **Corpus Christi transferido de 04/06 para 22/06 (o 04/06 é dia normal)**, São João 24/06, **10/08 antecipado do Dia dos Cursos Jurídicos (11/08 é dia normal)**, 30/10 transferido de 28/10, 08/12) e o **parágrafo único (COJE, art. 94): feriados forenses em 23 e 25 a 30/06**, além de 02 a 06/01 e 20 a 31/12 (estes já no recesso do CPC, art. 220); o 06/03 (Data Magna) já é regra anual conferida por lei. **Atos 966 e 977/2026: prazos suspensos de 11 a 15/05/2026 por instabilidade do PJe** (1º e 2º graus). **Fora:** 16/07 (feriado municipal, só na Comarca do Recife; art. 2º) e os feriados municipais do interior (art. 4º), por CPC, art. 1.003, § 6º; em 13/02 o expediente é normal, com trabalho remoto em prédios de Recife (art. 3º). **Limite:** não localizei ato do TJPE para os jogos do Brasil na Copa de 2026 (as notícias achadas são de 2018 e 2022) nem outros atos gerais; não posso provar que não existam. O art. 6º permite alterar o calendário | 2026 |
| **TJCE** | **Portaria nº 2924/2025** (Presidência; 17/12/2025; DJEA nº 3.690), `https://portal.tjce.jus.br/uploads/2026/04/PORT-FERIADOS-E-PONTO-FACULTATIVO-2026-1776690769.pdf`, inteiro teor (3 páginas); **Portarias nº 1169/2026** (05/06), **1401/2026** (24/06, Copa), **1440/2026** (29/06, Copa) e **727/2026** (13/04, Fortaleza), lidas em inteiro teor no site do TJCE. Lidas em 10/10/2026 | 2026: o art. 1º e os considerandos da 2924 dizem que as datas do anexo, **feriados e pontos facultativos, são dias sem expediente forense que impactam a contagem dos prazos (CPC, arts. 219 e 224)**; por isso todos contam como dia não útil: Carnaval (16 e 17/02, ponto facultativo), **São José (19/03, ponto facultativo)**, **Data Magna do Ceará (25/03, feriado estadual, EC estadual 73/2011)**, Quinta e Sexta-feira Santa (02 e 03/04), Corpus Christi (04/06), **05/06 (Portaria 1169/2026)**, **Dia do Servidor Público Estadual em 28/10 (não é transferido)** e 08/12 (Lei estadual 12.342/1994); mais os federais. **Quarta-feira de Cinzas (18/02): ponto facultativo até as 14h, expediente normal a partir das 14h** (`expediente_parcial`). **Copa:** 24/06 (jogo às 19h, expediente das 8h às 15h, Portaria 1401) e 29/06 (Brasil x Japão às 14h, expediente das 8h às 12h, Portaria 1440): `expediente_parcial` (CPC, art. 224, § 1º). **13/04 (Portaria 727/2026) vale só nos órgãos da Comarca de Fortaleza** (aniversário da cidade, Lei municipal 7.335/1994): **pendente**, como o Corpus Christi do TJMG. Recesso 20/12/2026 a 06/01/2027 é ponto facultativo (CNJ 244/2016), com o efeito do CPC, art. 220. Feriados municipais seguem a lei de cada município (art. 2º) e nunca entram. **Limite:** o texto da EC estadual 73/2011 não foi lido (a Portaria a cita); não localizei portarias para jogos do Brasil depois de 29/06 nem outros atos gerais de 2026; a Portaria 1401 foi republicada por incorreção (li a versão vigente) | 2026 |
| **TJES** | **Ato Normativo nº 176/2026** (Presidência; 29/09/2026, disponibilizado em 30/09/2026), `https://www.tjes.jus.br/ato-normativo-no-176-2026-disp-30-09-2026/`, inteiro teor da versão vigente (**republicação** que revoga o Ato 319/2025; o texto do 319, tachado na página, não foi usado); **Atos Normativos nº 103/2026** (24/06) e **113/2026** (29/06), da Copa; **nº 124/2026** (08/07) e **130/2026** (31/07), do PJe, todos em inteiro teor. Lidos em 10/10/2026 | 2026: o Anexo Único lista feriados e **pontos facultativos** (o art. 4º manda compensá-los, então são dias sem expediente), por isso contam como dia não útil: Carnaval (16 e 17/02), **Quarta-feira de Cinzas (18/02, listada como feriado)**, Quinta e Sexta-feira Santa (02 e 03/04), **Nossa Senhora da Penha (13/04, Lei estadual 11.010/2019, art. 1º: conferida em 2026 pelo ato)**, 20/04, Corpus Christi (04/06, ponto facultativo onde não houver lei municipal), 05/06, 10/08, Dia do Advogado (11/08), **Dia do Servidor transferido de 28 para 30/10**, 07/12 e Dia da Justiça (08/12); mais os federais. **Atos 124 e 130: prazos que venceram em 08/07 e 31/07 prorrogados** por falha do PJe (`expediente_parcial`). **Copa: 24/06 (11h às 17h) e 29/06 (7h às 12h) ficam `pendentes`**: os atos não tratam de prazos e a notícia oficial de 15/06/2026 diz que "não haverá suspensão dos prazos processuais"; o modo conservador mostra a data mais cedo. **Fora:** 24 e 31/12 (o art. 1º suspende só as unidades administrativas), 08/09 (feriado só em Vitória, art. 3º), o recesso (CPC, art. 220) e os atos de comarcas e unidades específicas (043, 112 e 177/2026, entre outros). **Limite:** as Leis Complementares estaduais 234/2002 e 46/1994 e a Lei 11.010/2019 não foram lidas; a página de atos de 2026 foi varrida pelo título, não item a item; Cinzas como feriado pleno vem só do anexo | 2026 |
| TJGO | **não pesquisados nesta rodada** (o TJCE publicou portaria de feriados e pontos facultativos de 2026; o TJDFT, o TJPE e o TJCE têm atos próprios) | nada | não |

Correções que a leitura trouxe: (1) o **TJSP suspende o expediente em 8/12** em 2026, ao contrário do que um cenário meu afirmava (o cenário foi reescrito); (2) o **9 de julho no TJSP é feriado conferido** em 2026 (Lei Estadual 9.497/1997), e continua pendente nos anos sem provimento; (3) no TJMG a **Quarta-feira de Cinzas é suspensa por inteiro**, e não apenas até as 14h como em STF, STJ e TJSP.
Limites: feriados **municipais** nunca entram (CPC, art. 1.003, § 6º); o TJSP publica ainda suspensões por comarca, não modeladas; as páginas do TJSP e do TJAL só abrem com JavaScript, então foram lidas pelo navegador do app, e não pelo script.

## 12. Prazos materiais (F2-14), lido em 07/10/2026

Código em `packages/prazozero/src/motor/materiais.ts`, fora do motor processual porque decadência não se suspende (CC, art. 207).

| Prazo | Texto lido | Regra implementada |
|---|---|---|
| **Mandado de segurança** | Lei 12.016/2009, art. 23 (página anotada do Planalto, texto não tachado) e Código Civil, arts. 132 e 207 (compilado) | 120 dias corridos contados da ciência do ato, sem o dia da ciência. Não suspende no recesso. Se o 120º dia não tem expediente, a data-limite continua sendo o 120º dia e a prorrogação aparece como alternativa (dúvida 5) |
| **Ação rescisória** | CPC, art. 975 (compilado) e Código Civil, art. 132, § 3º | Mesmo dia e mês, 2 anos depois do trânsito em julgado. Prorroga ao primeiro dia útil se expirar em férias forenses, recesso, feriado ou dia sem expediente (art. 975, § 1º), usando o calendário do tribunal escolhido. Os §§ 2º (prova nova) e 3º (simulação ou colusão) só geram aviso |

## 13. Auditoria (07/10/2026, F2-17)

Método: leitura do código e dos textos públicos contra o que foi verificado, conferência dos dados digitados à mão contra a versão compilada, e dois testes novos que procuram defeitos fora dos cenários escritos: **invariantes** em 4.000 entradas aleatórias (contagem de N dias em sequência, vencimento fora de fim de semana e de suspensão, modo conservador nunca depois do completo, monotonicidade, dobro) e **confronto diferencial** do motor com o oráculo Python em 600 entradas aleatórias.

| # | Achado | Gravidade | Correção |
|---|---|---|---|
| 1 | **NormaViva: o texto do art. 85, § 6º-A do CPC estava errado** (paráfrase digitada de memória). O texto compilado diz que, sendo líquido ou liquidável o valor da condenação, do proveito ou da causa, é proibida a apreciação equitativa, salvo as hipóteses do § 8º | alta (texto de lei exibido ao usuário) | Texto trocado pelo do Planalto; arts. 85, § 2º, 219 e 489, § 1º conferidos e corretos; 4 testes novos (vigência de 03/06/2022 confirmada na Lei 14.365/2022, art. 5º) |
| 2 | **Página pública de metodologia afirmava que Carnaval, Cinzas e Corpus Christi "são tratados como dias não úteis em todos os tribunais"**, que atos de tribunal "não são cadastrados" e que os feriados estaduais estavam catalogados | alta (afirmação jurídica falsa) | Página reescrita: modo conservador, calendário conferido por tribunal e ano, limites reais, validação jurídica pendente |
| 3 | **README: "testados contra cenários reais de jurisprudência" e "ingestão de leis estaduais"** | média (promessa sem base) | Reescrito com o que existe de fato |
| 4 | **Prazo em dobro no CLT usava o texto do CPC.** Na Justiça do Trabalho a base é o Decreto-Lei 779/1969, art. 1º, III: dobro só para recurso e só para União, Estados, DF, Municípios e autarquias ou fundações de direito público (texto lido no Planalto) | média | Aviso próprio quando o regime é CLT |
| 5 | **Feriados estaduais provisórios eram aplicados a tribunais federais** (TRF3 em São Paulo recebia o 9 de julho como dia pendente, TRF4 o 20 de setembro etc.), embora a Justiça Federal siga a Lei 5.010 | média (data alternativa enganosa) | A tabela estadual só vale para tribunais estaduais; o oráculo ganhou a mesma tabela e o mapa de UF de todos os TJs |
| 6 | Citações de lei estadual da tabela provisória apareciam como se fossem conferidas | média | A memória de cálculo passa a dizer "(citação não conferida)" |
| 7 | Certidão de cálculo citava só CLT 775 e, no JEF, só a Lei 9.099 | baixa | Inclui CLT 775-A e, no JEF, CPC 220 e Res. CNJ 244/2016 |
| 8 | `fetch_oficial.py` devolvia 752 caracteres do Código Civil (o HTML do Planalto tem `</html>` prematuro e o `lxml` para ali) | média (ferramenta de verificação) | Usa `html.parser` e escolhe o corpo certo quando o `lxml` perde texto; Constituição inalterada |
| 9 | CI não conferia o novo gabarito aleatório; `pnpm lint` não fazia nada; `@types/node` 22 com Node 24; sem `.gitattributes` | baixa | CI confere `cenarios_aleatorios.json`; script trocado por `typecheck`; `@types/node` 24; `.gitattributes` com `eol=lf`; NormaViva ganhou script de teste |

Conferido e correto: Tema 1.076/STJ no TeseMap (Corte Especial, REsp 1.850.512-SP, julgado em 16/03/2022, tese em duas partes; fonte: notícia do STJ de 16/03/2022 e Informativo 730). O motor passou nos 4.000 casos de invariantes. Os dois testes não encontraram defeito de contagem; a única divergência com o oráculo era a tabela estadual (item 5).

Não corrigido (fica no PLANO): validação jurídica dos cenários (F2-09), calendário dos demais TJs e TRFs (F2-04), feriados estaduais ainda sem ato (F2-05), versões maiores das dependências (F0-12), conferência do TeseMap e do NormaViva além dos itens do exemplo (F3 e F4).

## 14. Feriados estaduais por lei (F2-05), lido em 07/10/2026

Marco legal lido no Planalto: Lei 9.093/1995, art. 1º, II ("a data magna do Estado fixada em lei estadual" é feriado civil; só uma por Estado) e CPC, art. 216 ("além dos declarados em lei, são feriados, para efeito forense, os sábados, os domingos e os dias em que não haja expediente forense"). Feriado religioso depende de lei municipal (Lei 9.093, art. 2º) e nunca entra no cálculo. Nova categoria de verificação no código: `lei_estadual` (norma lida na fonte oficial; vale em todo ano).

| UF / tribunal | Data | Resultado | Fonte lida |
|---|---|---|---|
| **PE / TJPE** | 6 de março | **conferido** (`lei_estadual`; em 2026 também no Ato Conjunto 43/2025, art. 1º, V) | Lei estadual 16.241/2017, art. 49, na base da Alepe (a Lei 16.059/2017, que a tabela citava, foi **revogada** pelo art. 426, CCCLXVII, da 16.241) |
| **RS / TJRS** | 20 de setembro | **conferido** (`lei_estadual`) | Decreto estadual 36.180/1995 (Assembleia Legislativa), que cita a Constituição Estadual, art. 6º, parágrafo único; o texto da Constituição não foi lido |
| **GO / TJGO** | 24 de outubro | **conferido** (`lei_estadual`) | Lei estadual 19.850/2017, art. 1º ("feriado estadual de 24 de outubro"); a lei que o instituiu não foi lida |
| **SP / TJSP** | 9 de julho | conferido em 2026 (Provimento CSM 2.813/2025, F2-04); nos outros anos, pendente | seção 11 |
| **RJ / TJRJ** | 23 de abril | conferido em 2026 (informativo do TJRJ, que cita a Lei estadual 5.198/2008); nos outros anos, pendente | seção 11 |
| **ES / TJES** | segunda-feira após a oitava da Páscoa | pendente como lei; **em 2026 conferido pelo ato do tribunal** (Ato Normativo 176/2026, 13/04); pendente nos demais anos, **com a data corrigida** (a tabela tinha 17/04 fixo; a regra é Páscoa + 8 dias) | Aviso do TJES de 14/04/2023, que cita a Lei estadual 11.010/2019; texto da lei não lido |
| **CE / TJCE** | 25 de março | pendente como lei; **em 2026 conferido pelo ato do tribunal** (Portaria 2924/2025, Anexo Único, que cita a EC estadual 73/2011); pendente nos demais anos, **data corrigida** (a tabela tinha 19/03, São José, que é só ponto facultativo) | Constituição Estadual, art. 18, parágrafo único (EC 73/2011), por imprensa; o texto no site da Assembleia está desatualizado (até a EC 56/2004) |
| **BA / TJBA** | 2 de julho | pendente como lei; **em 2026 conferido pelo ato do tribunal** (Decreto Judiciário 1050/2025, art. 5º, VIII, que traz 02 e 03/07) | Constituição da Bahia, por imprensa; o PDF da Sefaz está até a EC 14/2010 e o portal Legisla Bahia recusou a conexão (falha de TLS) |
| **AL / TJAL** | 16 de setembro | pendente | nenhuma lei encontrada; só decretos anuais e municípios |
| **PR / TJPR** | 19 de dezembro | **removido**: não é feriado civil | Lei estadual 18.384/2014, art. 1º, conforme o Decreto Judiciário TJPR 759/2018 (que suspende o expediente em 19/12/2018 por ato próprio, com base no art. 2º, ponto facultativo) |
| **DF / TJDF** | 30 de novembro | **removido** para o TJDFT | Aviso do TJDFT de 26/11/2020: Dia do Evangélico (Lei distrital 963/1995) não é feriado para o TJDFT, órgão federal (Lei 9.093, art. 1º) |
| **SC / TJSC** | 11 de agosto | **removido; em 2026 confirmado ausente do anexo estadual** da Resolução GP 1/2026 (texto compilado, seção 11) | A Lei 12.906/2004 (página do ALESC toda tachada, superada pelas consolidações 16.719/2015 e 17.335/2017) e a Lei 13.408/2005 mandam transferir o feriado para o domingo seguinte quando cair em dia útil; o texto vigente não foi lido |
| MT, MS, RO, AC, AP, RR, TO, PA, AM, MA, RN, PB, SE, PI | vários | pendentes, **não pesquisados** (citação não conferida) | tabela provisória em `feriados.ts` |

Efeito prático: nos tribunais de PE, RS e GO esses dias passam a contar como sem expediente em todo ano, também no modo conservador; nos demais, só no modo completo (data alternativa). Nenhum ganhou selo de calendário: o selo continua exigindo o ato anual do tribunal.

## 15. Como repetir esta verificação

```bash
python ~/.claude/scripts/fetch_oficial.py https://www.planalto.gov.br/ccivil_03/decreto-lei/del3689compilado.htm
```

PDFs (portarias, RISTF) são salvos e lidos à parte. Calendário de outro tribunal ou de outro ano: baixar o ato, registrar aqui (ato, URL, data) e só então incluir em `CALENDARIO_VERIFICADO` (`packages/prazozero/src/calendario/feriados.ts`).
