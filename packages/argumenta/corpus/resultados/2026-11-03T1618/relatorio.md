# Avaliação do Argumenta: rodada 2026-11-03T1618

Modelo: **claude-sonnet-5-5** · casos avaliados: **30** de 30 validados

## Resultado

| Métrica | Resultado |
|---|---|
| Intervalo do dispositivo certo (sobreposição ≥ 80%) | 23 de 30 (76,7%) |
| Questões esperadas encontradas (cobertura dos parágrafos ≥ 50%) | 82 de 101 (81,2%) |
| Citações esperadas encontradas | 135 de 192 (70,3%) |
| Saídas descartadas pelo código | 0 de 90 (0,0%) |
| Questões achadas que o gabarito não tem | 30 |
| Citações achadas que o gabarito não tem (o gabarito lista só o essencial; ver a lista abaixo) | 162 de 292 (55,5%) |
| Citações com número que não está no texto da decisão (indício de invenção) | 0 de 292 (0,0%) |

## Custo

Total da rodada: **US$ 2,8812** · médio por decisão avaliada: **US$ 0,0960** (três etapas, preço do `politica.ts`).

## Tempo por etapa

| Etapa | Chamadas | Média | Máximo (caso) |
|---|---|---|---|
| estrutura | 30 | 5,3 s | 9,1 s (tjpa-apc-0003808-civil) |
| questões | 30 | 6,1 s | 10,8 s (tjal-juri-sentenca) |
| fundamentos | 30 | 12,2 s | 25,7 s (tjal-juri-razoes-apelacao) |

## Por decisão

| Caso | Parágrafos | Dispositivo | Questões | Citações | Etapas | Custo |
|---|---|---|---|---|---|---|
| stj-resp-1090898-trib | 129 | certo | 2/2 | 1/3 | ok / ok / ok | US$ 0,1081 |
| stj-resp-1104900-trib | 85 | certo | 2/2 (+1) | 1/1 | ok / ok / ok | US$ 0,1018 |
| stj-resp-1123306-certidao-fazenda-municipal | 97 | errado (40,0%) | 2/2 | 2/2 | ok / ok / ok | US$ 0,1008 |
| stj-resp-1144810-adm | 60 | certo | 3/3 | 2/4 | ok / ok / ok | US$ 0,0658 |
| stj-resp-1151364-civil | 70 | errado (75,0%) | 1/1 | 1/2 | ok / ok / ok | US$ 0,0628 |
| stj-resp-1192556-trib | 81 | errado (40,0%) | 1/1 (+1) | 5/9 | ok / ok / ok | US$ 0,0697 |
| stj-resp-1267995-desistencia-acao | 80 | errado (62,5%) | 2/2 | 2/2 | ok / ok / ok | US$ 0,0898 |
| stj-resp-1349059-adm | 114 | certo | 1/1 (+1) | 3/6 | ok / ok / ok | US$ 0,1013 |
| stj-resp-1362524-penal | 129 | certo | 3/3 | 5/5 | ok / ok / ok | US$ 0,1047 |
| stj-resp-1388030-civil | 149 | errado (37,5%) | 2/2 (+1) | 2/2 | ok / ok / ok | US$ 0,0962 |
| stj-resp-1452840-embargos-terceiro-honorarios | 118 | certo | 2/2 | 6/6 | ok / ok / ok | US$ 0,1002 |
| tjal-apelacao-saude-uniao | 148 | errado (66,7%) | 3/3 | 5/6 | ok / ok / ok | US$ 0,1888 |
| tjal-juri-acordao-desaforamento | 49 | certo | 2/2 | 4/6 | ok / ok / ok | US$ 0,1090 |
| tjal-juri-contrarrazoes-mp | 39 | certo | 4/4 (+1) | 1/4 | ok / ok / ok | US$ 0,0569 |
| tjal-juri-decisao-1grau | 29 | certo | 2/2 | 2/3 | ok / ok / ok | US$ 0,0407 |
| tjal-juri-denuncia-mp | 44 | certo | 3/3 | 4/5 | ok / ok / ok | US$ 0,0564 |
| tjal-juri-embargos-defesa | 62 | errado (60,0%) | 4/4 | 5/5 | ok / ok / ok | US$ 0,0718 |
| tjal-juri-razoes-apelacao | 348 | certo | 0/6 (+7) | 10/13 | ok / ok / ok | US$ 0,2343 |
| tjal-juri-resp | 171 | certo | 1/4 (+4) | 5/9 | ok / ok / ok | US$ 0,1170 |
| tjal-juri-sentenca | 111 | certo | 3/10 (+7) | 19/24 | ok / ok / ok | US$ 0,1540 |
| tjal-sentenca-saude-revelia | 36 | certo | 3/6 (+2) | 5/8 | ok / ok / ok | US$ 0,0662 |
| tjpa-apc-0003808-civil | 180 | certo | 2/2 (+1) | 1/4 | ok / ok / ok | US$ 0,0828 |
| trf4-ac-5007789-prev | 74 | certo | 3/3 | 6/7 | ok / ok / ok | US$ 0,0764 |
| trf4-ac-5009245-prev | 49 | certo | 2/2 | 2/5 | ok / ok / ok | US$ 0,0553 |
| trt4-ro-0000501-trab | 47 | certo | 4/4 | 2/3 | ok / ok / ok | US$ 0,0682 |
| trt4-rot-0020476-trab | 86 | certo | 3/3 | 7/7 | ok / ok / ok | US$ 0,0874 |
| trt4-rot-0020592-trab | 117 | certo | 9/9 | 7/14 | ok / ok / ok | US$ 0,1136 |
| trt4-rot-0021425-trab | 107 | certo | 3/3 (+2) | 9/11 | ok / ok / ok | US$ 0,0999 |
| trt4-rot-0022282-trab | 91 | certo | 6/6 (+1) | 5/8 | ok / ok / ok | US$ 0,1029 |
| tst-airr-1001572-trab | 116 | certo | 4/4 (+1) | 6/8 | ok / ok / ok | US$ 0,0982 |

## Citações que o gabarito não tem

O gabarito lista só o essencial: nem toda citação daqui é invenção. Conferir cada uma no texto da decisão.

- stj-resp-1090898-trib: Art. 15 - Em qualquer fase do processo, será deferida pelo Juiz: I - ao executado, a substituição da penhora por depósito em dinheiro ou fiança bancária
- stj-resp-1090898-trib: Art. 11 - A penhora ou arresto de bens obedecerá à seguinte ordem
- stj-resp-1090898-trib: EREsp 870.428/RS, Rel. Min. Teori Albino Zavascki, DJU de 13.8.07
- stj-resp-1090898-trib: AgRg no REsp 935.593/SP, Rel. Min. Humberto Martins, DJ 29.11.2007
- stj-resp-1090898-trib: AgRg no AG 1.108.499/SP, Rel. Min. Castro Meira, Segunda Turma, DJe de 27.04.09
- stj-resp-1090898-trib: AgRg no AG 1.093.104/SP, Rel. Min. Eliana Calmon, Segunda Turma, DJe de 29.04.09
- stj-resp-1090898-trib: AgRg no REsp 646.647/SP, Rel. Min. Herman Benjamin, Segunda Turma, DJe de 17.03.09
- stj-resp-1090898-trib: REsp 939.853/SP, Rel. Min. Mauro Campbell, Segunda Turma, DJe de 12.12.08
- stj-resp-1090898-trib: REsp 867.305/RS, Rel. Min. Eliana Calmon, DJe 16.9.08
- stj-resp-1090898-trib: AgRg no REsp 983.227/RS, Rel. p/ acórdão Min. Teori Zavascki, DJe de 11.12.08
- stj-resp-1090898-trib: AgRg no REsp 1.051.540/RS, Rel. Min. Francisco Falcão, DJe 27.08.08
- stj-resp-1090898-trib: AgRg no REsp 825.990/RS, Rel. Min. Denise Arruda, Primeira Turma, DJe de 09.10.08
- stj-resp-1104900-trib: EREsp 702.232/RS, 1ª Seção, Rel. Min. Castro Meira, DJ de 26.9.2005
- stj-resp-1104900-trib: REsp 900.371/SP, 1ª Turma, Rel. Min. Teori Albino Zavascki, DJe de 2.6.2008
- stj-resp-1104900-trib: REsp 750.581/RJ, 2ª Turma, Rel. Min. Francisco Peçanha Martins, DJ de 7.11.2005
- stj-resp-1104900-trib: REsp 704.014/RS, 2ª Turma, Rel. Min. Eliana Calmon, DJ de 3.10.2005
- stj-resp-1104900-trib: AgRg no REsp 987.231/SP, 2ª Turma, Rel. Min. Humberto Martins, DJe de 26.2.2009
- stj-resp-1104900-trib: AgRg no REsp 778.467/SP, 2ª Turma, Rel. Min. Mauro Campbell Marques, DJe de 6.2.2009
- stj-resp-1104900-trib: AgRg no Ag 1.060.318/SC, 1ª Turma, Rel. Min. Luiz Fux, DJe de 17.12.2008
- stj-resp-1104900-trib: AgRg no REsp 1.049.954/MG, 1ª Turma, Rel. Min. Francisco Falcão, DJe de 27.8.2008
- stj-resp-1104900-trib: art. 543-C, § 7º, do CPC
- stj-resp-1104900-trib: art. 5º, II, da Resolução 8/2008 - Presidência/STJ
- stj-resp-1123306-certidao-fazenda-municipal: REsp 601.313/RS, relator Min. CASTRO MEIRA, DJ de 20.9.2004
- stj-resp-1123306-certidao-fazenda-municipal: Ag 1.150.803/PR, Rel. Min. CASTRO MEIRA, DJ. 05.08.2009
- stj-resp-1123306-certidao-fazenda-municipal: REsp 1.074.253/MG, Rel. Min. BENEDITO GONÇALVES, DJ. 10.03.2009
- stj-resp-1123306-certidao-fazenda-municipal: AgRg no Ag 936.196/BA, Rel. Ministra ELIANA CALMON, SEGUNDA TURMA, julgado em 15/04/2008, DJe 29/04/2008
- stj-resp-1123306-certidao-fazenda-municipal: AgRg no REsp 736.730/SC, Rel. Ministro FRANCISCO FALCÃO, PRIMEIRA TURMA, julgado em 16/08/2005, DJ 17/10/2005
- stj-resp-1123306-certidao-fazenda-municipal: REsp 497923/SC, Rel. Ministro JOÃO OTÁVIO DE NORONHA, SEGUNDA TURMA, julgado em 16/05/2006, DJ 02/08/2006
- stj-resp-1123306-certidao-fazenda-municipal: REsp 443.024/RS, Rel. Min. Luiz Fux, DJU de 02.12.02
- stj-resp-1123306-certidao-fazenda-municipal: REsp 381.459/SC, Rel. Min. Humberto Gomes de Barros, DJU de 17.11.03
- stj-resp-1123306-certidao-fazenda-municipal: REsp 376.341/SC, Rel. Min. Garcia Vieira, DJU de 21.10.02
- stj-resp-1144810-adm: Súmula 282 do Supremo Tribunal Federal
- stj-resp-1144810-adm: AgRg no REsp 1129844/RJ, 1ª T., Min. Hamilton Carvalhido, DJe 02/12/2009
- stj-resp-1144810-adm: AgRg no REsp 1027557/RJ, 2ª T., Min. Humberto Martins, DJe 26/02/2009
- stj-resp-1144810-adm: Constituição Federal, art. 5º, II
- stj-resp-1151364-civil: REsp 902.100/PB, 1ª T., Min. Denise Arruda, DJ 29/11/2007
- stj-resp-1151364-civil: REsp 725.595/PB, 2ª T., Min. Humberto Martins, DJ 14/02/2007
- stj-resp-1151364-civil: REsp 806.558/RJ, 5ª T., Min. Laurita Vaz, DJe 28/09/2009
- stj-resp-1192556-trib: REsp 1.178.479/SE, 2ª Turma, Rel. Min. Castro Meira, DJe de 29.4.2010
- stj-resp-1192556-trib: AgRg no Ag 1.203.675/PE, 2ª Turma, Rel. Min. Humberto Martins, DJe de 10.3.2010
- stj-resp-1267995-desistencia-acao: art. 105, III, "a", da Constituição Federal de 1988
- stj-resp-1267995-desistencia-acao: REsp 651.721/RJ, 1ª Turma, Rel. Min. Teori Albino Zavascki, DJ de 28.9.2006
- stj-resp-1267995-desistencia-acao: REsp 1.173.663/PR, 2ª Turma, Rel. Min. Eliana Calmon, DJe de 8.4.2010
- stj-resp-1267995-desistencia-acao: REsp 1.184.935/MG, 1ª Turma, Rel. Min. Luiz Fux, DJe de 17.11.2010
- stj-resp-1267995-desistencia-acao: RESP 460.748/DF, 2ª T., Min. João Otávio de Noronha, DJ de 03.08.2006
- stj-resp-1267995-desistencia-acao: RESP 638.382/DF, 2ª T., Min. Eliana Calmon, DJ de 09.05.2006
- stj-resp-1267995-desistencia-acao: REsp 241.780/PR, 4ª T., Min. Sálvio de Figueiredo Teixeira, DJ 03.04.2000
- stj-resp-1349059-adm: art. 543-C do CPC e da Resolução STJ 8/2008
- stj-resp-1349059-adm: Leis n. 5.705/71, 5.958/73 e 8.036/90, art. 3º
- stj-resp-1349059-adm: AgRg no REsp 1313963/RS, Rel. Ministro Castro Meira, Segunda Turma, julgado em 9/10/2012
- stj-resp-1349059-adm: EDcl no AgRg no REsp 1300129/SP, Rel. Ministro Humberto Martins, Segunda Turma, julgado em 09/10/2012
- stj-resp-1349059-adm: REsp 1196043/ES, Rel. Ministro Mauro Campbell Marques, Segunda Turma, julgado em 28/09/2010
- stj-resp-1349059-adm: REsp 1176691/ES, Rel. Ministro Teori Albino Zavascki, Primeira Turma, julgado em 15/6/2010
- stj-resp-1349059-adm: PEDILEF 00110467020054036311, TNU, DOU 01/06/2012
- stj-resp-1362524-penal: art. 105, III, a, da Constituição Federal
- stj-resp-1362524-penal: art. 5º, LXIII, da CF
- stj-resp-1362524-penal: NUCCI, Gulherme de Sousa. Código Penal Comentado. 11ª ed., 2012
- stj-resp-1362524-penal: AgRg no AgRg no AREsp n. 185.094/DF
- stj-resp-1362524-penal: HC 188.937/SP, Rel. Ministro Marco Aurélio Bellizze, Quinta Turma, DJe de 11/05/2012
- stj-resp-1362524-penal: HC 151.802/MS, Rel. Ministra Maria Thereza de Assis Moura, Sexta Turma, DJe de 30/04/2012
- stj-resp-1362524-penal: AgRg no REsp n. 1.350.825, Ministro Jorge Mussi, DJe 7/3/2013
- stj-resp-1388030-civil: BERMUDES, Sérgio e FERREIRA, Frederico. Termo inicial da prescrição do Seguro DPVAT
- stj-resp-1452840-embargos-terceiro-honorarios: AgRg no REsp 462.647/SC, Rel. Ministro CASTRO MEIRA, SEGUNDA TURMA, DJ 30/08/2004
- stj-resp-1452840-embargos-terceiro-honorarios: AgRg no REsp 1282370/PE, Rel. Ministro BENEDITO GONÇALVES, PRIMEIRA TURMA, julgado em 01/03/2012
- stj-resp-1452840-embargos-terceiro-honorarios: REsp 724.341/MG, Rel. Ministra DENISE ARRUDA, PRIMEIRA TURMA, DJ 12/11/2007
- stj-resp-1452840-embargos-terceiro-honorarios: EDcl nos EDcl no REsp 375.026/PR, Rel. Ministro CARLOS FERNANDO MATHIAS, SEGUNDA TURMA, julgado em 25/03/2008
- stj-resp-1452840-embargos-terceiro-honorarios: art. 1040 do CPC/2015 (antigo art. 543-C, § 7º, do CPC/1973)
- tjal-apelacao-saude-uniao: TRF-4 - AG: 50507630420194040000 [PROCESSO_2], Relator: Jairo Gilberto Schafer
- tjal-apelacao-saude-uniao: TJ-RS - AC: 70084142272 RS, Relator: Luiz Felipe Silveira Difini
- tjal-apelacao-saude-uniao: TJ-PR - AI: 00483019320198160000 PR, Relator: Juiz Rogério Ribas
- tjal-apelacao-saude-uniao: TJ-SE - AC: 00091691120188250001, Relator: Roberto Eugenio da Fonseca Porto
- tjal-apelacao-saude-uniao: STF - RE: 1299773 PR, Relator: Alexandre de Moraes, Primeira Turma, 08/03/2021
- tjal-apelacao-saude-uniao: CF/1988, art. 196
- tjal-apelacao-saude-uniao: TJ-MS - AI: 14050872020158120000 MS, Relator: Des. Marcos José de Brito Rodrigues
- tjal-apelacao-saude-uniao: TRF-2 - AC: 00072552020124025101 RJ, Relator: Julio Emilio Abranches Mansur
- tjal-apelacao-saude-uniao: Agravo de Instrumento, Relator Desembargador Federal Elio Wanderley de Siqueira Filho, TRF 5ª Região, Primeira Turma
- tjal-apelacao-saude-uniao: Enunciados nº 51 e 62 do CNJ
- tjal-apelacao-saude-uniao: Enunciado nº 69 do CNJ
- tjal-apelacao-saude-uniao: CPC, art. 300
- tjal-apelacao-saude-uniao: Enunciados nº 15, 19, 32 e 67 do CNJ
- tjal-apelacao-saude-uniao: TRF-4 - AG: 50035068020194040000, Relator: Altair Antonio Gregório
- tjal-apelacao-saude-uniao: TRF-5 - Terceira Turma - Relator Desembargador Federal Fernando Braga Damasceno
- tjal-apelacao-saude-uniao: TRF-5 - Apelação: 08025013220184058100, Relator: Desembargador Federal Rogério Roberto Gonçalves de Abreu
- tjal-juri-acordao-desaforamento: STJ, HC 811245/PR, Rel. Min. Ribeiro Dantas, 5a Turma, julg. em 27/06/2023
- tjal-juri-acordao-desaforamento: TJAL, Desaforamento de Julgamento no [PROCESSO_1], Rel. Juiz Conv. [JUIZ CONVOCADO], Câmara Criminal, julg. em 12/12/2024
- tjal-juri-contrarrazoes-mp: art. 121, § 2º, VI; § 2º-A, I
- tjal-juri-contrarrazoes-mp: art. 61, II, “e”
- tjal-juri-razoes-apelacao: Código Penal, arts. 59 e 68; CF, arts. 5º, LIV, e 93, IX
- tjal-juri-razoes-apelacao: [PROCESSO_1], Câmara Criminal, Des. [RELATOR], julgado em 17/09/2025
- tjal-juri-razoes-apelacao: [PROCESSO_2], Câmara Criminal, Des. [RELATOR], julgado em 03/09/2025
- tjal-juri-razoes-apelacao: AgRg no HC 642.571/SC, Rel. Ministro Antônio Saldanha Palheiro, Sexta Turma, julgado em 15/06/2021
- tjal-juri-razoes-apelacao: [PROCESSO_3], Câmara Criminal, Des. [RELATOR], julgado em 26/03/2025
- tjal-juri-razoes-apelacao: Lei nº 11.340/2006, art. 5º, I
- tjal-juri-razoes-apelacao: REsp 2.027.794/MS
- tjal-juri-resp: Súmula 7 do Superior Tribunal de Justiça
- tjal-juri-resp: STJ - HC: 598.765/SP, Rel. Ministro Reynaldo Soares da Fonseca, Quinta Turma, julgado em 06/10/2020, DJe 14/10/2020
- tjal-juri-resp: Lei nº 11.340/2006, art. 5º, I
- tjal-juri-resp: Tema 1197, STJ (TJDF, embargos de declaração em apelação)
- tjal-juri-sentenca: Constituição Federal, art. 5º, XL
- tjal-juri-sentenca: Tema Repetitivo n. 1.318 (REsp n. 2.174.008/AL)
- tjal-juri-sentenca: AgRg no AgRg nos EDcl no HC n. 497.114/SC
- tjal-juri-sentenca: HC n. 507.207/DF
- tjal-juri-sentenca: AgRg no HC n. 832.360/SC
- tjal-juri-sentenca: AgRg no AREsp n. 1.441.372/GO
- tjal-juri-sentenca: HC n. 704.196/SP
- tjal-juri-sentenca: AgRg no AgRg no AREsp n. 1.843.720/DF
- tjal-juri-sentenca: AgRg no AREsp n. 1.737.903/MS
- tjal-juri-sentenca: AgRg no AREsp n. 1.766.271/RJ
- tjal-juri-sentenca: Tema n. 1.194 (REsp n. 2.001.973/RS)
- tjal-juri-sentenca: AgRg no HC n. 798.665/SP
- tjal-juri-sentenca: AgRg no REsp n. 2.113.425/SP
- tjal-juri-sentenca: Tema 1.068 da repercussão geral (RE 1.235.340)
- tjal-juri-sentenca: Código de Processo Penal, art. 804
- tjal-sentenca-saude-revelia: arts. 6º e 196 da Constituição Federal
- tjal-sentenca-saude-revelia: TJ-AL - Apelação Cível: [PROCESSO_1]
- tjal-sentenca-saude-revelia: TJ-AL - Apelação Cível: [PROCESSO_2]
- tjpa-apc-0003808-civil: Código de Trânsito Brasileiro (Lei nº 9503/97), arts. 34, 35 e parágrafo único, e 38, inc. II e parágrafo único
- tjpa-apc-0003808-civil: Apelação Cível Nº 70047403654, Décima Segunda Câmara Cível, Tribunal de Justiça do RS
- tjpa-apc-0003808-civil: Recurso Cível Nº 71007811326, Segunda Turma Recursal Cível, Turmas Recursais
- trf4-ac-5007789-prev: TRF4, APELAÇÃO CÍVEL Nº [PROCESSO_2], 6ª Turma, Desembargadora Federal TAIS SCHILLING FERRAZ, JUNTADO AOS AUTOS EM 19/08/2025
- trf4-ac-5007789-prev: art. 85, § 3º, do CPC
- trf4-ac-5007789-prev: TRF4, AC 2002.71.00.050349-7, Terceira Seção, Relator para Acórdão Celso Kipper, D.E. 01/10/2007
- trf4-ac-5009245-prev: TRF4, AC [PROCESSO_2], Décima Primeira Turma, Relator Ana Cristina Ferro Blasi, juntado aos autos em 14/07/2024
- trf4-ac-5009245-prev: TRF4, Apelação Cível Nº 5007105-37.2018.404.9999, 5ª Turma, Juíza Federal Gisele Lemke, juntado aos autos em 28/05/2018
- trf4-ac-5009245-prev: artigo 85, § 11, do NCPC
- trf4-ac-5009245-prev: artigo 85, §3º, inciso I, do NCPC
- trt4-ro-0000501-trab: Súmula 366 do TST
- trt4-ro-0000501-trab: Orientação Jurisprudencial nº 394 da SDI-I do TST
- trt4-ro-0000501-trab: Súmula nº 297, I, do TST
- trt4-ro-0000501-trab: Orientação Jurisprudencial nº 118 da SDI-1 do TST
- trt4-rot-0020476-trab: art. 186 do CC
- trt4-rot-0020476-trab: art. 114, I, da CF
- trt4-rot-0020476-trab: TRT da 04ª Região, 8A. TURMA, [PROCESSO_3] RO, em 11/12/2014, Desembargador Fernando Luiz de Moura Cassal
- trt4-rot-0020476-trab: art. 7º, XXIX, da CF
- trt4-rot-0020476-trab: Súmula nº 46 do TST
- trt4-rot-0020476-trab: RR - 39800-04.2007.5.12.0043, Relator Ministro Alberto Luiz Bresciani de Fontan Pereira, 3ª Turma, 28/04/2010
- trt4-rot-0020476-trab: art. 206, § 3º, V, do CC/2002
- trt4-rot-0020476-trab: Sérgio Cavalieri Filho, Programa de Responsabilidade Civil, 10. ed., 2012, p.143
- trt4-rot-0020592-trab: Súmula 212 do TST
- trt4-rot-0020592-trab: RR - 222500-10.2009.5.02.0316, Relator Ministro Maurício Godinho Delgado, 3ª Turma, DEJT 19/09/2014
- trt4-rot-0020592-trab: Súmula 338, itens I e III, do TST
- trt4-rot-0020592-trab: Lei 605/49, art. 7º, "a"; Súmula 172 do TST; CLT, art. 142, §5º; Súmula 145 do TST; Lei 8.036/90, art. 15; CLT, art. 487, §5º
- trt4-rot-0021425-trab: TRT da 4ª Região, 7ª Turma, [PROCESSO_3] ROT, em 22/06/2022
- trt4-rot-0021425-trab: TRT da 4ª Região, 1ª Turma, [PROCESSO_2] ROT, em 18/08/2021
- trt4-rot-0021425-trab: Tema 252
- trt4-rot-0022282-trab: CLT, art. 477, §§ 6º e 8º
- trt4-rot-0022282-trab: Súmula nº 58 deste Tribunal
- trt4-rot-0022282-trab: Código Civil, arts. 186 e 927
- trt4-rot-0022282-trab: TRT da 04ª Região, 1a. Turma, [PROCESSO_2] RO, em 19/03/2014
- trt4-rot-0022282-trab: TRT da 04ª Região, 1a. Turma, [PROCESSO_3] RO, em 26/02/2014
- trt4-rot-0022282-trab: Lei 1.060/50
- trt4-rot-0022282-trab: Súmula 450 do STF e Súmula 61 deste Tribunal
- trt4-rot-0022282-trab: Súmulas nº 219 e 329 do TST
- tst-airr-1001572-trab: TST-AIRR-21132-48.2017-5.04.0304
- tst-airr-1001572-trab: TST-Ag-AIRR-1226-02.2017.5.12.0029
- tst-airr-1001572-trab: TST-Ag-AIRR-10444-47.2014.5.15.0103
- tst-airr-1001572-trab: RR-812-87.2012.5.05.0024
- tst-airr-1001572-trab: RR-3-22.2010.5.05.0007
- tst-airr-1001572-trab: RR - 737188-75.2001.5.17.5555
- tst-airr-1001572-trab: RR - 503-59.2014.5.05.0036
- tst-airr-1001572-trab: RR - [PROCESSO_2]
- tst-airr-1001572-trab: ARR - 21822-39.2015.5.04.0016

## Como ler

Avalia a **extração estrutural**, não a concordância com o texto da IA. Com 30 decisões, a amostra é pequena: use os números para decidir o que olhar, não para fixar um limite fino. O gabarito é do revisor (José Bonifácio de Aguiar Santos Júnior).
