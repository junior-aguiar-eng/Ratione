# Avaliação do Argumenta: rodada 2026-11-04T1454

Modelo: **claude-haiku-5-5** · casos avaliados: **30** de 30 validados

## Resultado

| Métrica | Resultado |
|---|---|
| Intervalo do dispositivo certo (sobreposição ≥ 80%) | 26 de 30 (86,7%) |
| Questões esperadas encontradas (cobertura dos parágrafos ≥ 50%) | 91 de 101 (90,1%) |
| Citações esperadas encontradas | 160 de 192 (83,3%) |
| Saídas descartadas pelo código | 0 de 90 (0,0%) |
| Questões achadas que o gabarito não tem | 22 |
| Citações achadas que o gabarito não tem (o gabarito lista só o essencial; ver a lista abaixo) | 181 de 330 (54,8%) |
| Citações com número que não está no texto da decisão (indício de invenção) | 1 de 330 (0,3%) |

## Custo

Total da rodada: **US$ 0,1720** · médio por decisão avaliada: **US$ 0,0057** (três etapas, preço do `politica.ts`).

## Tempo por etapa

| Etapa | Chamadas | Média | Máximo (caso) |
|---|---|---|---|
| estrutura | 30 | 9,4 s | 19,2 s (stj-resp-1362524-penal) |
| questões | 30 | 5,0 s | 8,7 s (trf4-ac-5007789-prev) |
| fundamentos | 30 | 8,7 s | 20,9 s (tjal-juri-sentenca) |

## Por decisão

| Caso | Parágrafos | Dispositivo | Questões | Citações | Etapas | Custo |
|---|---|---|---|---|---|---|
| stj-resp-1090898-trib | 129 | certo | 2/2 | 3/3 | ok / ok / ok | US$ 0,0064 |
| stj-resp-1104900-trib | 85 | certo | 2/2 (+1) | 1/1 | ok / ok / ok | US$ 0,0052 |
| stj-resp-1123306-certidao-fazenda-municipal | 97 | certo | 2/2 | 2/2 | ok / ok / ok | US$ 0,0061 |
| stj-resp-1144810-adm | 60 | certo | 3/3 | 3/4 | ok / ok / ok | US$ 0,0043 |
| stj-resp-1151364-civil | 70 | certo | 1/1 | 1/2 | ok / ok / ok | US$ 0,0041 |
| stj-resp-1192556-trib | 81 | certo | 1/1 (+1) | 9/9 | ok / ok / ok | US$ 0,0044 |
| stj-resp-1267995-desistencia-acao | 80 | errado (50,0%) | 2/2 | 2/2 | ok / ok / ok | US$ 0,0050 |
| stj-resp-1349059-adm | 114 | errado (33,3%) | 1/1 (+1) | 6/6 | ok / ok / ok | US$ 0,0051 |
| stj-resp-1362524-penal | 129 | certo | 3/3 | 5/5 | ok / ok / ok | US$ 0,0067 |
| stj-resp-1388030-civil | 149 | certo | 2/2 (+1) | 2/2 | ok / ok / ok | US$ 0,0070 |
| stj-resp-1452840-embargos-terceiro-honorarios | 118 | certo | 2/2 | 6/6 | ok / ok / ok | US$ 0,0067 |
| tjal-apelacao-saude-uniao | 148 | certo | 3/3 | 4/6 | ok / ok / ok | US$ 0,0104 |
| tjal-juri-acordao-desaforamento | 49 | certo | 2/2 | 4/6 | ok / ok / ok | US$ 0,0066 |
| tjal-juri-contrarrazoes-mp | 39 | certo | 4/4 | 4/4 | ok / ok / ok | US$ 0,0036 |
| tjal-juri-decisao-1grau | 29 | errado (50,0%) | 2/2 | 3/3 | ok / ok / ok | US$ 0,0024 |
| tjal-juri-denuncia-mp | 44 | certo | 2/3 (+1) | 5/5 | ok / ok / ok | US$ 0,0037 |
| tjal-juri-embargos-defesa | 62 | errado (66,7%) | 4/4 | 5/5 | ok / ok / ok | US$ 0,0043 |
| tjal-juri-razoes-apelacao | 348 | certo | 5/6 (+2) | 11/13 | ok / ok / ok | US$ 0,0128 |
| tjal-juri-resp | 171 | certo | 3/4 (+3) | 5/9 | ok / ok / ok | US$ 0,0068 |
| tjal-juri-sentenca | 111 | certo | 6/10 (+4) | 18/24 | ok / ok / ok | US$ 0,0094 |
| tjal-sentenca-saude-revelia | 36 | certo | 4/6 (+2) | 6/8 | ok / ok / ok | US$ 0,0041 |
| tjpa-apc-0003808-civil | 180 | certo | 2/2 (+1) | 4/4 | ok / ok / ok | US$ 0,0048 |
| trf4-ac-5007789-prev | 74 | certo | 3/3 (+1) | 7/7 | ok / ok / ok | US$ 0,0049 |
| trf4-ac-5009245-prev | 49 | certo | 2/2 | 4/5 | ok / ok / ok | US$ 0,0037 |
| trt4-ro-0000501-trab | 47 | certo | 4/4 | 3/3 | ok / ok / ok | US$ 0,0042 |
| trt4-rot-0020476-trab | 86 | certo | 3/3 | 6/7 | ok / ok / ok | US$ 0,0052 |
| trt4-rot-0020592-trab | 117 | certo | 9/9 | 10/14 | ok / ok / ok | US$ 0,0069 |
| trt4-rot-0021425-trab | 107 | certo | 2/3 (+2) | 8/11 | ok / ok / ok | US$ 0,0060 |
| trt4-rot-0022282-trab | 91 | certo | 6/6 (+1) | 6/8 | ok / ok / ok | US$ 0,0060 |
| tst-airr-1001572-trab | 116 | certo | 4/4 (+1) | 7/8 | ok / ok / ok | US$ 0,0052 |

## Citações com número que não está no texto

- stj-resp-1090898-trib: CF, art. 105, III, alíneas a e c

## Citações que o gabarito não tem

O gabarito lista só o essencial: nem toda citação daqui é invenção. Conferir cada uma no texto da decisão.

- stj-resp-1090898-trib: CF, art. 105, III, alíneas a e c
- stj-resp-1090898-trib: CPC, art. 543-C; Resolução STJ n.º 08/2008
- stj-resp-1090898-trib: EREsp 870.428/RS, Rel. Min. Teori Albino Zavascki, DJU de 13.08.07
- stj-resp-1090898-trib: AgRg no AG 1.108.499/SP, Rel. Min. Castro Meira, Segunda Turma, DJe de 27.04.09
- stj-resp-1090898-trib: AgRg no AG 1.093.104/SP, Rel. Min. Eliana Calmon, Segunda Turma, DJe de 29.04.09
- stj-resp-1090898-trib: AgRg no REsp 646.647/SP, Rel. Min. Herman Benjamin, Segunda Turma, DJe de 17.03.09
- stj-resp-1090898-trib: REsp 939.853/SP, Rel. Min. Mauro Campbell, Segunda Turma, DJe de 12.12.08
- stj-resp-1090898-trib: REsp 867.305/RS, Rel. Min. Eliana Calmon, DJe 16.9.08
- stj-resp-1090898-trib: AgRg no REsp 983.227/RS, Rel. p/ acórdão Min. Teori Zavascki, DJe de 11.12.08
- stj-resp-1090898-trib: AgRg no REsp 1.051.540/RS, Rel. Min. Francisco Falcão, DJe 27.08.08
- stj-resp-1090898-trib: AgRg no REsp 825.990/RS, Rel. Min. Denise Arruda, Primeira Turma, DJe de 09.10.08
- stj-resp-1090898-trib: AgRg no REsp 935.593/SP, Rel. Min. Humberto Martins, DJ 29.11.2007
- stj-resp-1104900-trib: EREsp 702.232/RS, 1ª Seção, Rel. Min. Castro Meira
- stj-resp-1104900-trib: REsp 900.371/SP, 1ª Turma, Rel. Min. Teori Albino Zavascki
- stj-resp-1104900-trib: REsp 750.581/RJ, 2ª Turma, Rel. Min. Francisco Peçanha Martins
- stj-resp-1104900-trib: REsp 704.014/RS, 2ª Turma, Rel. Min. Eliana Calmon
- stj-resp-1104900-trib: CTN, art. 204; Lei 6.830/80, art. 3º
- stj-resp-1104900-trib: Lei 6.830/80, art. 2º, § 5º, I; CTN, art. 202, I; CPC, art. 568, I
- stj-resp-1104900-trib: AgRg no REsp 987.231/SP, 2ª Turma, Rel. Min. Humberto Martins
- stj-resp-1104900-trib: AgRg no REsp 778.467/SP, 2ª Turma, Rel. Min. Mauro Campbell Marques
- stj-resp-1104900-trib: AgRg no Ag 1.060.318/SC, 1ª Turma, Rel. Min. Luiz Fux
- stj-resp-1104900-trib: AgRg no REsp 1.049.954/MG, 1ª Turma, Rel. Min. Francisco Falcão
- stj-resp-1104900-trib: CPC, art. 543-C; Resolução 8/2008 - Presidência/STJ
- stj-resp-1104900-trib: CPC, art. 543-C, § 7º
- stj-resp-1104900-trib: Resolução 8/2008 - Presidência/STJ, art. 5º, II
- stj-resp-1123306-certidao-fazenda-municipal: CTN, arts. 205 e 206
- stj-resp-1123306-certidao-fazenda-municipal: REsp 601.313/RS, Rel. Min. CASTRO MEIRA, DJ de 20.9.2004
- stj-resp-1123306-certidao-fazenda-municipal: Ag 1.150.803/PR, Rel. Min. CASTRO MEIRA, DJ 05.08.2009
- stj-resp-1123306-certidao-fazenda-municipal: REsp 1.074.253/MG, Rel. Min. BENEDITO GONÇALVES, DJ 10.03.2009
- stj-resp-1123306-certidao-fazenda-municipal: AgRg no Ag 936.196/BA, Rel. Ministra ELIANA CALMON, DJe 29/04/2008
- stj-resp-1123306-certidao-fazenda-municipal: AgRg no REsp 736.730/SC, Rel. Ministro FRANCISCO FALCÃO, DJ 17/10/2005
- stj-resp-1123306-certidao-fazenda-municipal: REsp 497923/SC, Rel. Ministro JOÃO OTÁVIO DE NORONHA, DJ 02/08/2006
- stj-resp-1123306-certidao-fazenda-municipal: REsp 443.024/RS, Rel. Min. LUIZ FUX, DJ 02.12.02
- stj-resp-1123306-certidao-fazenda-municipal: REsp 381.459/SC, Rel. Min. Humberto Gomes de Barros, DJU de 17.11.03
- stj-resp-1123306-certidao-fazenda-municipal: REsp 376.341/SC, Rel. Min. Garcia Vieira, DJU de 21.10.02
- stj-resp-1144810-adm: Súmula 282 do STF
- stj-resp-1144810-adm: AgRg no REsp 1129844/RJ, 1ª T., Min. Hamilton Carvalhido, DJe 02/12/2009
- stj-resp-1144810-adm: AgRg no REsp 1027557/RJ, 2ª T., Min. Humberto Martins, DJe 26/02/2009
- stj-resp-1144810-adm: CF, art. 5º, II
- stj-resp-1144810-adm: Parecer do Ministério Público Federal
- stj-resp-1151364-civil: REsp 902.100/PB, 1ª T., Min. Denise Arruda, DJ 29/11/2007
- stj-resp-1151364-civil: REsp 725.595/PB, 2ª T., Min. Humberto Martins, DJ 14/02/2007
- stj-resp-1151364-civil: REsp 806.558/RJ, 5ª T., Min. Laurita Vaz, DJe 28/09/2009
- stj-resp-1192556-trib: REsp 1.178.479/SE, 2ª Turma, Rel. Min. Castro Meira, DJe de 29.4.2010
- stj-resp-1192556-trib: AgRg no Ag 1.203.675/PE, 2ª Turma, Rel. Min. Humberto Martins, DJe de 10.3.2010
- stj-resp-1267995-desistencia-acao: CF, art. 105, III, "a"
- stj-resp-1267995-desistencia-acao: CPC, art. 543-C; Resolução STJ n. 8/08
- stj-resp-1267995-desistencia-acao: Primeira Seção do STJ (orientação das Turmas)
- stj-resp-1267995-desistencia-acao: REsp 638.382/DF; REsp 241.780/PR
- stj-resp-1267995-desistencia-acao: REsp 651.721/RJ
- stj-resp-1267995-desistencia-acao: REsp 1.173.663/PR
- stj-resp-1267995-desistencia-acao: REsp 1.184.935/MG
- stj-resp-1267995-desistencia-acao: REsp 864432/PR; REsp 976861/SP; REsp 241780/PR; REsp 115642/SP
- stj-resp-1267995-desistencia-acao: REsp 90738/RJ
- stj-resp-1267995-desistencia-acao: Luiz Fux, Curso de Direito Processual Civil
- stj-resp-1349059-adm: AgRg no REsp 1313963/RS, Rel. Ministro Castro Meira, Segunda Turma, julgado em 9/10/2012, DJe 18/10/2012
- stj-resp-1349059-adm: EDcl no AgRg no REsp 1300129/SP, Rel. Ministro Humberto Martins, Segunda Turma, julgado em 09/10/2012, DJe 19/10/2012
- stj-resp-1349059-adm: REsp 1196043/ES, Rel. Ministro Mauro Campbell Marques, Segunda Turma, julgado em 28/09/2010, DJe 15/10/2010
- stj-resp-1349059-adm: REsp 1176691/ES, Rel. Ministro Teori Albino Zavascki, Primeira Turma, julgado em 15/6/2010, DJe 29/6/2010
- stj-resp-1349059-adm: PEDILEF 00110467020054036311, TNU, DOU 01/06/2012
- stj-resp-1362524-penal: CF, art. 105, III, a
- stj-resp-1362524-penal: CF, art. 5º, LXIII
- stj-resp-1362524-penal: NUCCI, Gulherme de Sousa. Código Penal Comentado. 11ª ed., São Paulo: Ed. RT, 2012, pág. 1.132 e 1.133
- stj-resp-1362524-penal: AgRg no AgRg no AREsp n. 185.094/DF, DJe 22/3/2013
- stj-resp-1362524-penal: AgRg no REsp n. 1.350.825, Ministro Jorge Mussi, DJe 7/3/2013
- stj-resp-1362524-penal: STJ, HC 188.937/SP, Rel. Ministro Marco Aurélio Bellizze, Quinta Turma, DJe 11/05/2012
- stj-resp-1362524-penal: STJ, HC 151.802/MS, Rel. Ministra Maria Thereza de Assis Moura, Sexta Turma, DJe 30/04/2012
- stj-resp-1388030-civil: CPC, art. 543-C
- stj-resp-1388030-civil: BERMUDES, Sérgio e FERREIRA, Frederico. Termo inicial da prescrição do Seguro DPVAT.
- stj-resp-1388030-civil: AREsp 235.825/SP
- stj-resp-1388030-civil: Ag 1.334.648/MT
- stj-resp-1388030-civil: REsp 1.305.993/MT
- stj-resp-1388030-civil: REsp 1.243.351/MT
- stj-resp-1388030-civil: TJ/MG, fl. 184
- stj-resp-1388030-civil: CC, arts. 193, 206, §3º, IX, 2.028; CPC, arts. 219, §5º, 269, IV
- stj-resp-1452840-embargos-terceiro-honorarios: AgRg no REsp 462.647/SC, Rel. Ministro Castro Meira, Segunda Turma, DJ 30/08/2004, p. 244
- stj-resp-1452840-embargos-terceiro-honorarios: AgRg no REsp 1282370/PE, Rel. Ministro Benedito Gonçalves, Primeira Turma, DJe 06/03/2012
- stj-resp-1452840-embargos-terceiro-honorarios: EDcl nos EDcl no REsp 375.026/PR, Rel. Ministro Carlos Fernando Mathias, Segunda Turma, DJe 15/04/2008
- stj-resp-1452840-embargos-terceiro-honorarios: REsp 724.341/MG, Rel. Ministra Denise Arruda, Primeira Turma, DJ 12/11/2007, p. 158
- stj-resp-1452840-embargos-terceiro-honorarios: CPC/2015, art. 1040 (antigo art. 543-C, § 7º, do CPC/1973)
- tjal-apelacao-saude-uniao: STF - RE 1299773 PR, Relator Alexandre de Moraes, 08/03/2021
- tjal-apelacao-saude-uniao: CF, art. 196; CF, art. 23, II e parágrafo único
- tjal-apelacao-saude-uniao: Luciana da Veiga Oliveira e Ana Carolina Morozowski
- tjal-apelacao-saude-uniao: TJ-RS - AC 70084142272, Relator Luiz Felipe Silveira Difini, 29/04/2020
- tjal-apelacao-saude-uniao: TJ-PR - AI 00483019320198160000, Relator Juiz Rogério Ribas, 09/03/2020
- tjal-apelacao-saude-uniao: TJ-SE - AC 00091691120188250001, Relator Roberto Eugenio da Fonseca Porto, 05/11/2019
- tjal-apelacao-saude-uniao: CF, art. 109, I
- tjal-apelacao-saude-uniao: CF, art. 196
- tjal-apelacao-saude-uniao: TJ-MS - AI 14050872020158120000, Relator Marcos José de Brito Rodrigues, 06/07/2015
- tjal-apelacao-saude-uniao: TRF-2 - AC 00072552020124025101, Relator Julio Emilio Abranches Mansur, 19/12/2016
- tjal-apelacao-saude-uniao: CNJ, Enunciado nº 51
- tjal-apelacao-saude-uniao: CNJ, Enunciado nº 62; Lei 9.656/98, art. 35-C
- tjal-apelacao-saude-uniao: CNJ, Enunciado nº 69
- tjal-apelacao-saude-uniao: TRF-5 - Agravo de Instrumento, 1ª Turma, Relator Elio Wanderley de Siqueira Filho
- tjal-apelacao-saude-uniao: CNJ, Enunciados nº 15, 19 e 32
- tjal-apelacao-saude-uniao: CNJ, Enunciado nº 67
- tjal-apelacao-saude-uniao: TRF-4 - AG 50035068020194040000, Relator Altair Antonio Gregório, 21/05/2019
- tjal-apelacao-saude-uniao: TRF-5 - Terceira Turma, Relator Fernando Braga Damasceno, disponibilizado em 18/03/2020
- tjal-apelacao-saude-uniao: TRF-5 - Apelação 08025013220184058100, Relator Rogério Roberto Gonçalves de Abreu, 13/02/2019
- tjal-juri-acordao-desaforamento: STJ, HC 488.528/PB, Rel. Min. Reynaldo Soares da Fonseca, Quinta Turma, julg. em 6/8/2019
- tjal-juri-acordao-desaforamento: STJ, HC 811245/PR, Rel. Min. Ribeiro Dantas, 5a Turma, julg. em 27/06/2023
- tjal-juri-acordao-desaforamento: TJAL, Desaforamento de Julgamento no [PROCESSO_1], Rel. Juiz Conv. [JUIZ CONVOCADO], Câmara Criminal, julg. em 12/12/2024
- tjal-juri-acordao-desaforamento: STJ, Habeas Corpus no 445.864/RJ, Rel. Ministro Sebastião Reis Júnior, Sexta Turma, julgado em 07/06/2018, DJe 13/06/2018
- tjal-juri-acordao-desaforamento: STJ, RESP no 1483838/10, Rel. Ministro Felix Fischer, Quinta Turma, julgado em 18/06/2015, DJe 04/09/2015
- tjal-juri-contrarrazoes-mp: princípio do livre convencimento motivado
- tjal-juri-denuncia-mp: Procedimento especial do CPP para crimes dolosos contra a vida
- tjal-juri-embargos-defesa: CP, art. 61, II, f
- tjal-juri-razoes-apelacao: [PROCESSO_1], Câmara Criminal, julgamento em 17/09/2025
- tjal-juri-razoes-apelacao: [PROCESSO_2], Câmara Criminal, julgamento em 03/09/2025
- tjal-juri-razoes-apelacao: STJ - AgRg no HC 642.571/SC, Rel. Ministro Antônio Saldanha Palheiro, Sexta Turma, julgado em 15/06/2021, DJe 21/06/2021
- tjal-juri-razoes-apelacao: [PROCESSO_3], Câmara Criminal, julgamento em 26/03/2025
- tjal-juri-razoes-apelacao: Lei nº 11.340/2006, art. 5º, inciso I
- tjal-juri-razoes-apelacao: Tema 1197 do STJ; TJDF, embargos de declaração em apelação
- tjal-juri-resp: Súmula 7 do STJ
- tjal-juri-resp: CP, arts. 59, 14, II e 61, II, e
- tjal-juri-resp: CPP, arts. 158 e 168, §2º
- tjal-juri-resp: Lei 11.340/2006, art. 5º, I
- tjal-juri-resp: TJDF, embargos de declaração em apelação (lesão corporal, art. 129, §13, CP)
- tjal-juri-sentenca: AgRg no AgRg nos EDcl no HC n. 497.114/SC, Sexta Turma, julgado em 22/9/2020
- tjal-juri-sentenca: REsp n. 2.174.008/AL, Terceira Seção, julgado em 8/5/2025 (Tema Repetitivo 1.318)
- tjal-juri-sentenca: HC n. 507.207/DF, Sexta Turma, julgado em 19/5/2020
- tjal-juri-sentenca: AgRg no HC n. 832.360/SC, Sexta Turma, julgado em 11/3/2024
- tjal-juri-sentenca: AgRg no AREsp n. 1.441.372/GO, Sexta Turma, julgado em 16/5/2019
- tjal-juri-sentenca: HC n. 704.196/SP, Sexta Turma, julgado em 14/6/2022
- tjal-juri-sentenca: AgRg no AgRg no AREsp n. 1.843.720/DF, Quinta Turma, julgado em 18/5/2021
- tjal-juri-sentenca: AgRg no AREsp n. 1.737.903/MS, Quinta Turma, julgado em 22/6/2021
- tjal-juri-sentenca: Circunstâncias do delito conforme decisão citada no texto (sem autor identificado no trecho)
- tjal-juri-sentenca: MASSON, Cleber. Direito Penal Parte Geral Esquematizado
- tjal-juri-sentenca: AgRg no AREsp n. 1.766.271/RJ, Quinta Turma, julgado em 23/3/2021
- tjal-juri-sentenca: AgRg no HC n. 798.665/SP, Quinta Turma, julgado em 14/8/2023
- tjal-juri-sentenca: AgRg no REsp n. 2.113.425/SP, Quinta Turma, julgado em 3/9/2024
- tjal-juri-sentenca: STF, RE 1.235.340 (Tema 1.068)
- tjal-sentenca-saude-revelia: CPC, art. 355, II
- tjal-sentenca-saude-revelia: NATJUS
- tjal-sentenca-saude-revelia: TJ-AL - Apelação Cível: [PROCESSO_1]
- tjal-sentenca-saude-revelia: TJ-AL - Apelação Cível: [PROCESSO_2]
- tjal-sentenca-saude-revelia: SISBAJUD
- tjal-sentenca-saude-revelia: Lei nº 6.830/80, art. 39
- tjpa-apc-0003808-civil: Apelação Cível Nº 70047403654, Décima Segunda Câmara Cível, TJ-RS
- tjpa-apc-0003808-civil: Recurso Cível Nº 71007811326, Segunda Turma Recursal Cível, TJ-RS
- trf4-ac-5007789-prev: TRF4, Apelação Cível nº [PROCESSO_2], 6ª Turma, Desembargadora Federal Tais Schilling Ferraz
- trf4-ac-5007789-prev: TRF4, AC 2002.71.00.050349-7, Terceira Seção, Relator para Acórdão Celso Kipper
- trf4-ac-5009245-prev: TRF4, AC [PROCESSO_2], Décima Primeira Turma, Relator Ana Cristina Ferro Blasi
- trf4-ac-5009245-prev: TRF4, Apelação Cível Nº 5007105-37.2018.404.9999, 5ª Turma, Juíza Federal Gisele Lemke
- trt4-ro-0000501-trab: Súmula 366 do TST
- trt4-ro-0000501-trab: Súmula 297, I, do TST
- trt4-ro-0000501-trab: OJ nº 118 da SDI-1 do TST
- trt4-rot-0020476-trab: CC, art. 186
- trt4-rot-0020476-trab: CF, art. 114, I
- trt4-rot-0020476-trab: TRT da 04ª Região, 8A. Turma, [PROCESSO_3] RO, em 11/12/2014, Desembargador Fernando Luiz de Moura Cassal - Relator
- trt4-rot-0020476-trab: TST, RR 39800-04.2007.5.12.0043, 3ª Turma, Relator Ministro Alberto Luiz Bresciani de Fontan Pereira, DEJT 14/05/2010
- trt4-rot-0020476-trab: Súmula 46 do TST
- trt4-rot-0020476-trab: CF, art. 7º, XXIX
- trt4-rot-0020476-trab: Sérgio Cavalieri Filho, Programa de Responsabilidade Civil, 10. ed., 2012, p.143
- trt4-rot-0020476-trab: CC/2002, art. 206, § 3º, V
- trt4-rot-0020592-trab: CLT, art. 71
- trt4-rot-0020592-trab: Súmula 212 do TST
- trt4-rot-0020592-trab: RR - 222500-10.2009.5.02.0316 (3ª Turma, Relator Ministro Maurício Godinho Delgado)
- trt4-rot-0020592-trab: Súmula 338, I e III, do TST
- trt4-rot-0020592-trab: Súmula 172 do TST
- trt4-rot-0021425-trab: TRT da 4ª Região, 1ª Turma, [PROCESSO_2] ROT, em 18/08/2021
- trt4-rot-0021425-trab: TRT da 4ª Região, 7ª Turma, [PROCESSO_3] ROT, em 22/06/2022
- trt4-rot-0022282-trab: CLT, art. 790, §3º; CF, art. 5º, LXXIV
- trt4-rot-0022282-trab: CLT, art. 477, §6º
- trt4-rot-0022282-trab: Súmula nº 58 do TRT4
- trt4-rot-0022282-trab: CLT, art. 468
- trt4-rot-0022282-trab: Laudo ID 1662819
- trt4-rot-0022282-trab: ID 1173112 e 1173119
- trt4-rot-0022282-trab: CC, arts. 186 e 927
- trt4-rot-0022282-trab: TRT da 4ª Região, 1ª Turma, [PROCESSO_2] RO, 19/03/2014
- trt4-rot-0022282-trab: TRT da 4ª Região, 1ª Turma, [PROCESSO_3] RO, 26/02/2014
- trt4-rot-0022282-trab: Lei 1.060/50
- trt4-rot-0022282-trab: Súmula 450 do STF
- trt4-rot-0022282-trab: Súmula 61 do TRT4
- trt4-rot-0022282-trab: Súmulas nº 219 e 329 do TST
- tst-airr-1001572-trab: RR-812-87.2012.5.05.0024, Relator Ministro Walmir Oliveira da Costa, 1ª Turma, DEJT 23/3/2018
- tst-airr-1001572-trab: RR-3-22.2010.5.05.0007, Relatora Ministra Delaíde Miranda Arantes, 2ª Turma, DEJT 16/3/2018
- tst-airr-1001572-trab: RR 737188-75.2001.5.17.5555, Relator Ministro Lelio Bentes Corrêa, SDI-I, DEJT 28/08/2009
- tst-airr-1001572-trab: RR-503-59.2014.5.05.0036, Relator Ministro Aloysio Corrêa da Veiga, 6ª Turma, DEJT 30/06/2017
- tst-airr-1001572-trab: RR de relatoria do Ministro Alexandre de Souza Agra Belmonte, 3ª Turma, DEJT 24/08/2018
- tst-airr-1001572-trab: ARR-21822-39.2015.5.04.0016, Relatora Ministra Maria Cristina Irigoyen Peduzzi, 8ª Turma, DEJT 10/08/2018

## Como ler

Avalia a **extração estrutural**, não a concordância com o texto da IA. Com 30 decisões, a amostra é pequena: use os números para decidir o que olhar, não para fixar um limite fino. O gabarito é do revisor (José Bonifácio de Aguiar Santos Júnior).
