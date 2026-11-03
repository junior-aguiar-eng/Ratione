# Avaliação do Argumenta: rodada 2026-11-03T1516

Modelo: **claude-haiku-5-5** · casos avaliados: **30** de 30 validados

## Resultado

| Métrica | Resultado |
|---|---|
| Intervalo do dispositivo certo (sobreposição ≥ 80%) | 28 de 30 (93,3%) |
| Questões esperadas encontradas (cobertura dos parágrafos ≥ 50%) | 90 de 101 (89,1%) |
| Citações esperadas encontradas | 154 de 192 (80,2%) |
| Saídas descartadas pelo código | 1 de 90 (1,1%) |
| Questões achadas que o gabarito não tem | 23 |
| Citações achadas que o gabarito não tem (o gabarito lista só o essencial; ver a lista abaixo) | 179 de 329 (54,4%) |
| Citações com número que não está no texto da decisão (indício de invenção) | 3 de 329 (0,9%) |

## Custo

Total da rodada: **US$ 0,1721** · médio por decisão avaliada: **US$ 0,0057** (três etapas, preço do `politica.ts`).

## Tempo por etapa

| Etapa | Chamadas | Média | Máximo (caso) |
|---|---|---|---|
| estrutura | 30 | 9,4 s | 14,5 s (tjal-juri-sentenca) |
| questões | 30 | 5,2 s | 10,2 s (trt4-rot-0021425-trab) |
| fundamentos | 30 | 8,7 s | 18,1 s (tjal-juri-razoes-apelacao) |

## Por decisão

| Caso | Parágrafos | Dispositivo | Questões | Citações | Etapas | Custo |
|---|---|---|---|---|---|---|
| stj-resp-1090898-trib | 129 | certo | 2/2 | 3/3 | ok / ok / ok | US$ 0,0062 |
| stj-resp-1104900-trib | 85 | certo | 2/2 | 1/1 | ok / ok / ok | US$ 0,0061 |
| stj-resp-1123306-certidao-fazenda-municipal | 97 | certo | 2/2 | 1/2 | ok / ok / ok | US$ 0,0060 |
| stj-resp-1144810-adm | 60 | certo | 3/3 | 4/4 | ok / ok / ok | US$ 0,0042 |
| stj-resp-1151364-civil | 70 | certo | 1/1 | 1/2 | ok / ok / ok | US$ 0,0038 |
| stj-resp-1192556-trib | 81 | certo | 1/1 (+1) | 9/9 | ok / ok / ok | US$ 0,0046 |
| stj-resp-1267995-desistencia-acao | 80 | certo | 2/2 | 2/2 | ok / ok / ok | US$ 0,0060 |
| stj-resp-1349059-adm | 114 | certo | 1/1 (+1) | 6/6 | ok / ok / ok | US$ 0,0059 |
| stj-resp-1362524-penal | 129 | errado (33,3%) | 3/3 (+1) | 5/5 | ok / ok / ok | US$ 0,0059 |
| stj-resp-1388030-civil | 149 | certo | 2/2 (+1) | 2/2 | ok / ok / ok | US$ 0,0064 |
| stj-resp-1452840-embargos-terceiro-honorarios | 118 | certo | 2/2 | 4/6 | ok / ok / ok | US$ 0,0063 |
| tjal-apelacao-saude-uniao | 148 | certo | 3/3 | 3/6 | ok / ok / ok | US$ 0,0103 |
| tjal-juri-acordao-desaforamento | 49 | certo | 0/2 (+3) | 5/6 | ok / ok / ok | US$ 0,0057 |
| tjal-juri-contrarrazoes-mp | 39 | certo | 4/4 | 4/4 | ok / ok / ok | US$ 0,0038 |
| tjal-juri-decisao-1grau | 29 | certo | 2/2 | 2/3 | ok / ok / ok | US$ 0,0027 |
| tjal-juri-denuncia-mp | 44 | certo | 3/3 (+1) | 5/5 | ok / ok / ok | US$ 0,0040 |
| tjal-juri-embargos-defesa | 62 | certo | 3/4 | 3/5 | ok / ok / ok | US$ 0,0041 |
| tjal-juri-razoes-apelacao | 348 | certo | 5/6 (+2) | 11/13 | ok / ok / ok | US$ 0,0127 |
| tjal-juri-resp | 171 | certo | 3/4 (+2) | 6/9 | ok / ok / ok | US$ 0,0065 |
| tjal-juri-sentenca | 111 | não achou | 6/10 (+3) | 16/24 | cortada / ok / ok | US$ 0,0089 |
| tjal-sentenca-saude-revelia | 36 | certo | 4/6 (+1) | 5/8 | ok / ok / ok | US$ 0,0039 |
| tjpa-apc-0003808-civil | 180 | certo | 2/2 (+1) | 4/4 | ok / ok / ok | US$ 0,0051 |
| trf4-ac-5007789-prev | 74 | certo | 3/3 | 7/7 | ok / ok / ok | US$ 0,0046 |
| trf4-ac-5009245-prev | 49 | certo | 2/2 | 2/5 | ok / ok / ok | US$ 0,0037 |
| trt4-ro-0000501-trab | 47 | certo | 4/4 | 3/3 | ok / ok / ok | US$ 0,0041 |
| trt4-rot-0020476-trab | 86 | certo | 3/3 (+1) | 6/7 | ok / ok / ok | US$ 0,0055 |
| trt4-rot-0020592-trab | 117 | certo | 9/9 | 8/14 | ok / ok / ok | US$ 0,0070 |
| trt4-rot-0021425-trab | 107 | certo | 3/3 (+3) | 11/11 | ok / ok / ok | US$ 0,0064 |
| trt4-rot-0022282-trab | 91 | certo | 6/6 | 8/8 | ok / ok / ok | US$ 0,0063 |
| tst-airr-1001572-trab | 116 | certo | 4/4 (+2) | 7/8 | ok / ok / ok | US$ 0,0055 |

## Citações com número que não está no texto

- stj-resp-1090898-trib: CF, art. 105, III, "a" e "c"
- stj-resp-1267995-desistencia-acao: CF/88, art. 105, III, "a"
- stj-resp-1267995-desistencia-acao: Acórdão citado em §48 (sem número próprio; ementa do REsp de referência)

## Citações que o gabarito não tem

O gabarito lista só o essencial: nem toda citação daqui é invenção. Conferir cada uma no texto da decisão.

- stj-resp-1090898-trib: CF, art. 105, III, "a" e "c"
- stj-resp-1090898-trib: CPC, arts. 620, 655 e 668; Lei 6.830/80, arts. 9º, 11 e 15
- stj-resp-1090898-trib: CPC, art. 656
- stj-resp-1090898-trib: EREsp 870.428/RS, Rel. Min. Teori Albino Zavascki, DJU de 13.08.07
- stj-resp-1090898-trib: AgRg no AG 1.108.499/SP, Segunda Turma
- stj-resp-1090898-trib: AgRg no AG 1.093.104/SP, Segunda Turma
- stj-resp-1090898-trib: AgRg no REsp 646.647/SP, Segunda Turma
- stj-resp-1090898-trib: REsp 939.853/SP, Segunda Turma
- stj-resp-1090898-trib: REsp 867.305/RS, Rel. Min. Eliana Calmon
- stj-resp-1090898-trib: AgRg no REsp 983.227/RS, Rel. p/ acórdão Min. Teori Zavascki
- stj-resp-1090898-trib: AgRg no REsp 1.051.540/RS, Rel. Min. Francisco Falcão
- stj-resp-1090898-trib: AgRg no REsp 825.990/RS, Rel. Min. Denise Arruda
- stj-resp-1090898-trib: AgRg no REsp 935.593/SP, Rel. Min. Humberto Martins
- stj-resp-1090898-trib: REsp 893.519/RS, Rel. Min. Castro Meira
- stj-resp-1090898-trib: REsp nº 1.033.511/SP, Rel. Min. Teori Albino Zavascki
- stj-resp-1104900-trib: EREsp 702.232/RS, 1ª Seção, Rel. Min. Castro Meira
- stj-resp-1104900-trib: REsp 900.371/SP, 1ª Turma, Rel. Min. Teori Albino Zavascki
- stj-resp-1104900-trib: REsp 750.581/RJ, 2ª Turma, Rel. Min. Francisco Peçanha Martins
- stj-resp-1104900-trib: REsp 704.014/RS, 2ª Turma, Rel. Min. Eliana Calmon
- stj-resp-1104900-trib: CTN, art. 204
- stj-resp-1104900-trib: orientação do STJ (citada no voto)
- stj-resp-1104900-trib: AgRg no REsp 987.231/SP, 2ª Turma, Rel. Min. Humberto Martins
- stj-resp-1104900-trib: AgRg no REsp 778.467/SP, 2ª Turma, Rel. Min. Mauro Campbell Marques
- stj-resp-1104900-trib: AgRg no Ag 1.060.318/SC, 1ª Turma, Rel. Min. Luiz Fux
- stj-resp-1104900-trib: AgRg no REsp 1.049.954/MG, 1ª Turma, Rel. Min. Francisco Falcão
- stj-resp-1104900-trib: REsp 803.314/RS, Rel. Min. Teori Albino Zavascki
- stj-resp-1123306-certidao-fazenda-municipal: CTN, arts. 205 e 206
- stj-resp-1123306-certidao-fazenda-municipal: REsp 601.313/RS, relator Min. CASTRO MEIRA, DJ de 20.9.2004
- stj-resp-1123306-certidao-fazenda-municipal: Ag 1.150.803/PR, Rel. Min. CASTRO MEIRA, DJ 05.08.2009
- stj-resp-1123306-certidao-fazenda-municipal: REsp 1.074.253/MG, Rel. Min. BENEDITO GONÇALVES, DJ 10.03.2009
- stj-resp-1123306-certidao-fazenda-municipal: AgRg no Ag 936.196/BA, Rel. Ministra ELIANA CALMON, DJe 29/04/2008
- stj-resp-1123306-certidao-fazenda-municipal: REsp 497923/SC, Rel. Ministro JOÃO OTÁVIO DE NORONHA, DJ 02/08/2006
- stj-resp-1123306-certidao-fazenda-municipal: REsp 443.024/RS, Rel. Min. LUIZ FUX, DJ de 02.12.02
- stj-resp-1123306-certidao-fazenda-municipal: REsp 381.459/SC, Rel. Min. Humberto Gomes de Barros, DJU de 17.11.03
- stj-resp-1123306-certidao-fazenda-municipal: REsp 376.341/SC, Rel. Min. Garcia Vieira, DJU de 21.10.02
- stj-resp-1123306-certidao-fazenda-municipal: AgRg no REsp 736.730/SC, Rel. Ministro FRANCISCO FALCÃO, DJ 17/10/2005
- stj-resp-1144810-adm: Súmula 282 do STF
- stj-resp-1144810-adm: AgRg no REsp 1129844/RJ, 1ª T., Min. Hamilton Carvalhido, DJe 02/12/2009
- stj-resp-1144810-adm: AgRg no REsp 1027557/RJ, 2ª T., Min. Humberto Martins, DJe 26/02/2009
- stj-resp-1144810-adm: CF, art. 5º, II
- stj-resp-1151364-civil: REsp 902.100/PB, 1ª T., Min. Denise Arruda, DJ 29/11/2007
- stj-resp-1151364-civil: REsp 725.595/PB, 2ª T., Min. Humberto Martins, DJ 14/02/2007
- stj-resp-1151364-civil: REsp 806.558/RJ, 5ª T., Min. Laurita Vaz, DJe 28/09/2009
- stj-resp-1151364-civil: Art. 543-C do CPC
- stj-resp-1192556-trib: REsp 1.178.479/SE, 2ª Turma, Rel. Min. Castro Meira, DJe de 29.4.2010
- stj-resp-1192556-trib: AgRg no Ag 1.203.675/PE, 2ª Turma, Rel. Min. Humberto Martins, DJe de 10.3.2010
- stj-resp-1267995-desistencia-acao: CF/88, art. 105, III, "a"
- stj-resp-1267995-desistencia-acao: Primeira Seção do STJ (orientação das Turmas)
- stj-resp-1267995-desistencia-acao: REsp 651.721/RJ, 1ª Turma, Rel. Min. Teori Albino Zavascki, DJ de 28.9.2006
- stj-resp-1267995-desistencia-acao: REsp 1.173.663/PR, 2ª Turma, Rel. Min. Eliana Calmon, DJe de 8.4.2010
- stj-resp-1267995-desistencia-acao: REsp 1.184.935/MG, 1ª Turma, Rel. Min. Luiz Fux, DJe de 17.11.2010
- stj-resp-1267995-desistencia-acao: Acórdão citado em §48 (sem número próprio; ementa do REsp de referência)
- stj-resp-1267995-desistencia-acao: RESP 638.382/DF, 2ª T., Min. Eliana Calmon, DJ de 09.05.2006
- stj-resp-1267995-desistencia-acao: REsp 241.780/PR, 4ª T., Min. Sálvio de Figueiredo Teixeira, DJ 03.04.2000
- stj-resp-1267995-desistencia-acao: REsp 460.748/DF, 2ª T., Min. João Otávio de Noronha, DJ de 03.08.2006
- stj-resp-1267995-desistencia-acao: REsp 864.432/PR, 1ª Turma, Rel. Min. Luiz Fux, DJe 27/03/2008
- stj-resp-1267995-desistencia-acao: REsp 976.861/SP, 2ª Turma, Rel. Min. Castro Meira
- stj-resp-1267995-desistencia-acao: REsp 115.642/SP, 6ª Turma, Rel. Min. Fernando Gonçalves
- stj-resp-1267995-desistencia-acao: REsp 90.738/RJ, Rel. Min. Sálvio de Figueiredo Teixeira, DJ 21.09.1998
- stj-resp-1267995-desistencia-acao: Luiz Fux, Curso de Direito Processual Civil, ed. 3ª, p. 449
- stj-resp-1349059-adm: AgRg no REsp 1313963/RS, Rel. Ministro Castro Meira, Segunda Turma, julgado em 9/10/2012, DJe 18/10/2012
- stj-resp-1349059-adm: EDcl no AgRg no REsp 1300129/SP, Rel. Ministro Humberto Martins, Segunda Turma, julgado em 09/10/2012, DJe 19/10/2012
- stj-resp-1349059-adm: REsp 1196043/ES, Rel. Ministro Mauro Campbell Marques, Segunda Turma, julgado em 28/09/2010, DJe 15/10/2010
- stj-resp-1349059-adm: REsp 1176691/ES, Rel. Ministro Teori Albino Zavascki, Primeira Turma, julgado em 15/6/2010, DJe 29/6/2010
- stj-resp-1349059-adm: PEDILEF 00110467020054036311, TNU, DOU 01/06/2012
- stj-resp-1362524-penal: CF, art. 105, III, a
- stj-resp-1362524-penal: CF, art. 5º, LXIII
- stj-resp-1362524-penal: NUCCI, Guilherme de Sousa. Código Penal Comentado. 11ª ed., São Paulo: Ed. RT, 2012
- stj-resp-1362524-penal: AgRg no AgRg no AREsp n. 185.094/DF
- stj-resp-1362524-penal: AgRg no REsp n. 1.350.825
- stj-resp-1362524-penal: STJ, HC 188.937/SP, Rel. Ministro Marco Aurélio Bellizze, Quinta Turma, DJe 11/05/2012
- stj-resp-1362524-penal: STJ, HC 151.802/MS, Sexta Turma, DJe 30/04/2012
- stj-resp-1362524-penal: CPC, art. 543-C; Resolução n. 8/2008 do STJ
- stj-resp-1388030-civil: CPC, art. 543-C
- stj-resp-1388030-civil: BERMUDES, Sérgio e FERREIRA, Frederico. Termo inicial da prescrição do Seguro DPVAT
- stj-resp-1452840-embargos-terceiro-honorarios: AgRg no REsp 462.647/SC, Rel. Ministro Castro Meira, Segunda Turma, DJ 30/08/2004, p. 244
- stj-resp-1452840-embargos-terceiro-honorarios: AgRg no REsp 1282370/PE, Rel. Ministro Benedito Gonçalves, Primeira Turma, DJe 06/03/2012
- stj-resp-1452840-embargos-terceiro-honorarios: EDcl nos EDcl no REsp 375.026/PR, Rel. Ministro Carlos Fernando Mathias, Segunda Turma, DJe 15/04/2008
- stj-resp-1452840-embargos-terceiro-honorarios: REsp 724.341/MG, Rel. Ministra Denise Arruda, Primeira Turma, DJ 12/11/2007, p. 158
- stj-resp-1452840-embargos-terceiro-honorarios: Art. 1040 do CPC/2015 (antigo art. 543-C, § 7º, do CPC/1973)
- tjal-apelacao-saude-uniao: CF, art. 196
- tjal-apelacao-saude-uniao: CF, art. 23, II e parágrafo único
- tjal-apelacao-saude-uniao: Portaria de Consolidação nº 6/2017
- tjal-apelacao-saude-uniao: Luciana da Veiga Oliveira e Ana Carolina Morozowski, "Da responsabilidade solidária na assistência à saúde no SUS"
- tjal-apelacao-saude-uniao: TJ-RS, AC 70084142272
- tjal-apelacao-saude-uniao: TJ-PR, AI 00483019320198160000
- tjal-apelacao-saude-uniao: TJ-SE, AC 00091691120188250001
- tjal-apelacao-saude-uniao: CF, art. 109, I
- tjal-apelacao-saude-uniao: TJ-MS, AI 14050872020158120000
- tjal-apelacao-saude-uniao: TRF-2, AC 00072552020124025101
- tjal-apelacao-saude-uniao: Enunciado nº 51 do CNJ
- tjal-apelacao-saude-uniao: Enunciado nº 62 do CNJ; Lei 9.656/98, art. 35-C
- tjal-apelacao-saude-uniao: Enunciado nº 69 do CNJ
- tjal-apelacao-saude-uniao: TRF-5, 1ª Turma, agravo de instrumento (processo mascarado)
- tjal-apelacao-saude-uniao: Enunciado nº 15 do CNJ
- tjal-apelacao-saude-uniao: Enunciado nº 19 do CNJ
- tjal-apelacao-saude-uniao: Enunciado nº 32 do CNJ
- tjal-apelacao-saude-uniao: Enunciado nº 67 do CNJ
- tjal-apelacao-saude-uniao: TRF-4, AG 50353940420184040000
- tjal-apelacao-saude-uniao: TRF-4, AG 50035068020194040000
- tjal-apelacao-saude-uniao: TRF-5, 3ª Turma, processo mascarado
- tjal-apelacao-saude-uniao: TRF-5, Apelação 08025013220184058100
- tjal-juri-acordao-desaforamento: STJ, HC 811245/PR, Rel. Min. Ribeiro Dantas, 5a Turma, julg. em 27/06/2023
- tjal-juri-acordao-desaforamento: TJAL, Desaforamento de Julgamento no [PROCESSO_1], Rel. Juiz Conv. [JUIZ CONVOCADO], Câmara Criminal, julg. em 12/12/2024
- tjal-juri-acordao-desaforamento: STJ, HC 488.528/PB, Rel. Min. Reynaldo Soares da Fonseca, Quinta Turma, julg. em 6/8/2019
- tjal-juri-denuncia-mp: CPP, procedimento especial dos crimes dolosos contra a vida
- tjal-juri-razoes-apelacao: [PROCESSO_1], Apelação Criminal, Câmara Criminal, julgado em 17/09/2025
- tjal-juri-razoes-apelacao: [PROCESSO_2], Apelação Criminal, Câmara Criminal, julgado em 03/09/2025
- tjal-juri-razoes-apelacao: STJ - AgRg no HC 642.571/SC, Rel. Ministro Antônio Saldanha Palheiro, Sexta Turma, julgado em 15/06/2021
- tjal-juri-razoes-apelacao: [PROCESSO_3], Apelação Criminal, Câmara Criminal, julgado em 26/03/2025
- tjal-juri-razoes-apelacao: Lei nº 11.340/2006, art. 5º, I
- tjal-juri-razoes-apelacao: STJ, Tema 1197; TJDF, embargos de declaração em apelação criminal
- tjal-juri-razoes-apelacao: TJDF, embargos de declaração em apelação criminal (art. 129, §13, CP)
- tjal-juri-resp: CP, arts. 59, 14, II, e 61, II, 'e'
- tjal-juri-resp: in dubio pro reo
- tjal-juri-resp: Lei 11.340/2006, art. 5º, I
- tjal-juri-resp: Embargos de declaração em apelação, TJDF (ementa transcrita, sem número identificado)
- tjal-juri-sentenca: AgRg no AgRg nos EDcl no HC n. 497.114/SC
- tjal-juri-sentenca: REsp n. 2.174.008/AL, Terceira Seção; Tema Repetitivo n. 1.318
- tjal-juri-sentenca: HC n. 507.207/DF
- tjal-juri-sentenca: AgRg no HC n. 832.360/SC
- tjal-juri-sentenca: AgRg no AREsp n. 1.441.372/GO
- tjal-juri-sentenca: HC n. 704.196/SP
- tjal-juri-sentenca: AgRg no AgRg no AREsp n. 1.843.720/DF
- tjal-juri-sentenca: AgRg no AREsp n. 1.737.903/MS
- tjal-juri-sentenca: AgRg no AREsp n. 1.766.271/RJ
- tjal-juri-sentenca: REsp n. 2.001.973/RS; Tema n. 1.194
- tjal-juri-sentenca: AgRg no HC n. 798.665/SP
- tjal-juri-sentenca: AgRg no REsp n. 2.113.425/SP; REsp n. 1.843.481/PE
- tjal-juri-sentenca: RE n.º 1.235.340
- tjal-juri-sentenca: CPP, art. 804
- tjal-sentenca-saude-revelia: CPC, art. 355, II
- tjal-sentenca-saude-revelia: TJ-AL - Apelação Cível [PROCESSO_1]
- tjal-sentenca-saude-revelia: TJ-AL - Apelação Cível [PROCESSO_2]
- tjal-sentenca-saude-revelia: Lei nº 6.830/80, art. 39
- tjpa-apc-0003808-civil: Firme jurisprudência (sem julgado identificado)
- tjpa-apc-0003808-civil: Apelação Cível Nº 70047403654, Décima Segunda Câmara Cível, TJ-RS
- tjpa-apc-0003808-civil: Recurso Cível Nº 71007811326, Segunda Turma Recursal Cível, TJ-RS
- trf4-ac-5007789-prev: TRF4, APELAÇÃO CÍVEL Nº [PROCESSO_2], 6ª Turma, Desembargadora Federal TAIS SCHILLING FERRAZ
- trf4-ac-5007789-prev: CPC, art. 85, §3º
- trf4-ac-5007789-prev: TRF4, AC 2002.71.00.050349-7, Terceira Seção, Relator para Acórdão Celso Kipper
- trf4-ac-5009245-prev: TRF4, AC [PROCESSO_2], Décima Primeira Turma, Relator Ana Cristina Ferro Blasi, juntado aos autos em 14/07/2024
- trf4-ac-5009245-prev: TRF4, Apelação Cível Nº 5007105-37.2018.404.9999, 5ª Turma, Juíza Federal Gisele Lemke, juntado aos autos em 28/05/2018
- trf4-ac-5009245-prev: artigo 85, § 11, do NCPC
- trf4-ac-5009245-prev: artigo 85, §§ 2º a 6º do NCPC
- trf4-ac-5009245-prev: artigo 85, §3º, inciso I, do NCPC
- trt4-ro-0000501-trab: Súmula 366 do TST
- trt4-ro-0000501-trab: Súmula 297, I, do TST
- trt4-ro-0000501-trab: Orientação Jurisprudencial nº 118 da SDI-1 do TST
- trt4-rot-0020476-trab: CC, art. 186
- trt4-rot-0020476-trab: CF, art. 114, I
- trt4-rot-0020476-trab: TRT da 04ª Região, 8A. TURMA, RO em 11/12/2014, Desembargador Fernando Luiz de Moura Cassal - Relator
- trt4-rot-0020476-trab: RR - 39800-04.2007.5.12.0043, 3ª Turma, Relator Ministro Alberto Luiz Bresciani de Fontan Pereira
- trt4-rot-0020476-trab: Súmula nº 46 do TST (I Jornada de Direito e Processo do Trabalho)
- trt4-rot-0020476-trab: CF, art. 7º, XXIX
- trt4-rot-0020476-trab: Sérgio Cavalieri Filho, Programa de Responsabilidade Civil, 10. ed., 2012, p.143
- trt4-rot-0020476-trab: CC/2002, art. 206, § 3º, V
- trt4-rot-0020592-trab: CLT, art. 71
- trt4-rot-0020592-trab: Súmula 212 do TST
- trt4-rot-0020592-trab: RR - 222500-10.2009.5.02.0316 (3ª Turma do TST, Rel. Min. Maurício Godinho Delgado)
- trt4-rot-0020592-trab: CLT, art. 74, §2º; Súmula 338, I e III, do TST
- trt4-rot-0020592-trab: Lei 605/49, art. 7º, a; Súmula 172 do TST
- trt4-rot-0021425-trab: TRT da 4ª Região, 1ª Turma, [PROCESSO_2] ROT, em 18/08/2021
- trt4-rot-0021425-trab: TRT da 4ª Região, 7ª Turma, [PROCESSO_3] ROT, em 22/06/2022
- trt4-rot-0022282-trab: CF, art. 5º, LXXIV
- trt4-rot-0022282-trab: Súmula nº 58 do TRT da 4ª Região
- trt4-rot-0022282-trab: CLT, art. 468
- trt4-rot-0022282-trab: TRT da 04ª Região, 1a. Turma, [PROCESSO_2] RO, em 19/03/2014
- trt4-rot-0022282-trab: TRT da 04ª Região, 1a. Turma, [PROCESSO_3] RO, em 26/02/2014
- trt4-rot-0022282-trab: Lei 1.060/50
- trt4-rot-0022282-trab: Súmula 450 do STF
- trt4-rot-0022282-trab: Súmula 61 do TRT da 4ª Região
- trt4-rot-0022282-trab: Súmulas nº 219 e 329 do TST
- tst-airr-1001572-trab: RR-812-87.2012.5.05.0024, Relator Ministro Walmir Oliveira da Costa, 1ª Turma, DEJT 23/3/2018
- tst-airr-1001572-trab: RR-3-22.2010.5.05.0007, Relatora Ministra Delaíde Miranda Arantes, 2ª Turma, DEJT 16/3/2018
- tst-airr-1001572-trab: RR - 737188-75.2001.5.17.5555, Relator Ministro Lelio Bentes Corrêa, SDI-1, DEJT 28/08/2009
- tst-airr-1001572-trab: RR - 503-59.2014.5.05.0036, Relator Ministro Aloysio Corrêa da Veiga, 6ª Turma, DEJT 30/06/2017
- tst-airr-1001572-trab: RR - [PROCESSO_2], Relator Ministro Alexandre de Souza Agra Belmonte, 3ª Turma, DEJT 24/08/2018
- tst-airr-1001572-trab: ARR-21822-39.2015.5.04.0016, Relatora Ministra Maria Cristina Irigoyen Peduzzi, 8ª Turma, DEJT 10/08/2018

## Como ler

Avalia a **extração estrutural**, não a concordância com o texto da IA. Com 30 decisões, a amostra é pequena: use os números para decidir o que olhar, não para fixar um limite fino. O gabarito é do revisor (José Bonifácio de Aguiar Santos Júnior).
