# Normas de teste com histórico conhecido (F3-07)

> **Gerado por `pnpm historico` (em `packages/normaviva`). Não edite à mão:** a validação fica em `packages/normaviva/corpus/historico-conhecido.json` (campo `validacao`) e este documento é regenerado.

**30 casos em 10 normas** · validados: **0** · pendentes: **30**

Cada caso diz: até a véspera da publicação do ato, o dispositivo tinha a redação **A**; a partir dela, a redação **B** (a vigente hoje). Servem de gabarito para a consulta temporal do NormaViva (F3-04).

## De onde vem cada coisa

- **Redação B:** o corpus, lido do Planalto (só a redação vigente).
- **Redação A:** o texto **tachado** da própria página do Planalto, só quando o trecho tachado é o dispositivo inteiro (mesmo tipo e número). Tachado de palavras soltas não reconstrói o texto e fica de fora. O tachado vale aqui só como evidência histórica, nunca como texto vigente.
- **Data:** a da publicação do ato que deu a redação B (API do Senado). **É provisória** (`vigenciaConfirmada: false`): a vigência pode ter começado em outro dia (*vacatio legis*, cláusula própria).
- **O caso vale pelo rótulo.** Se a lei renumerou dispositivos, A é o texto que ocupava aquele rótulo na época; os casos em que A e B quase não se parecem trazem um aviso.
- **Limite:** só as normas cujas páginas do Planalto trazem texto tachado têm casos. Sem casos, por não haver tachado: DL-2848-1940, DL-3689-1941, DL-4657-1942, LEI-10406-2002, LEI-11101-2005, LEI-11419-2006, LEI-12016-2009, LEI-12965-2014, LEI-13105-2015, LEI-13709-2018, LEI-5172-1966, LEI-7210-1984, LEI-7347-1985, LEI-8069-1990, LEI-8078-1990, LEI-8245-1991, LEI-8429-1992, LEI-9503-1997.

## Como validar

Confira, no Diário Oficial ou no texto original do ato, se A era mesmo a redação anterior e B a que o ato deu. Para registrar, em `corpus/historico-conhecido.json`, troque no caso `"validacao": {"status": "pendente", "por": null, "em": null}` por `{"status": "validado", "por": "<nome>", "em": "AAAA-MM-DD"}` e rode `pnpm historico`.

## Constituição da República Federativa do Brasil de 1988 (CF-1988)

### art. 103-B, § 4º, III

- **Ato que deu a redação B:** Emenda Constitucional nº 103 de 12/11/2019 · publicado em **13/11/2019** (provisório)
- **Redação A** (até 12/11/2019): receber e conhecer das reclamações contra membros ou órgãos do Poder Judiciário, inclusive contra seus serviços auxiliares, serventias e órgãos prestadores de serviços notariais e de registro que atuem por delegação do poder público ou oficializados, sem prejuízo da competência disciplinar e correicional dos tribunais, podendo avocar processos disciplinares em curso e determinar a remoção, a disponibilidade ou a aposentadoria com subsídios ou proventos proporcionais ao tempo de serviço e aplicar outras sanções administrativas, assegurada ampla defesa; *(anotação do Planalto: Incluído pela Emenda Constitucional nº 45, de 2004)*
- **Redação B** (a partir de 13/11/2019): receber e conhecer das reclamações contra membros ou órgãos do Poder Judiciário, inclusive contra seus serviços auxiliares, serventias e órgãos prestadores de serviços notariais e de registro que atuem por delegação do poder público ou oficializados, sem prejuízo da competência disciplinar e correicional dos tribunais, podendo avocar processos disciplinares em curso, determinar a remoção ou a disponibilidade e aplicar outras sanções administrativas, assegurada ampla defesa;
- **Fonte:** [texto compilado do Planalto](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm), lido em 19/10/2026
- **Validação:** pendente

### art. 166, § 13

- **Ato que deu a redação B:** Emenda Constitucional nº 100 de 26/06/2019 · publicado em **27/06/2019** (provisório)
- **Redação A** (até 26/06/2019): Quando a transferência obrigatória da União, para a execução da programação prevista no §11 deste artigo, for destinada a Estados, ao Distrito Federal e a Municípios, independerá da adimplência do ente federativo destinatário e não integrará a base de cálculo da receita corrente líquida para fins de aplicação dos limites de despesa de pessoal de que trata o caput do art. 169. *(anotação do Planalto: Incluído pela Emenda Constitucional nº 86, de 2015)*
- **Redação B** (a partir de 27/06/2019): As programações orçamentárias previstas nos §§ 11 e 12 deste artigo não serão de execução obrigatória nos casos dos impedimentos de ordem técnica.
- **Atenção:** A e B são muito diferentes. Pode ter havido renumeração: nesse caso A é o texto que ocupava este rótulo, não a versão anterior do mesmo dispositivo. Confira no ato antes de validar.
- **Fonte:** [texto compilado do Planalto](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm), lido em 19/10/2026
- **Validação:** pendente

### art. 243

- **Ato que deu a redação B:** Emenda Constitucional nº 81 de 05/06/2014 · publicado em **06/06/2014** (provisório)
- **Redação A** (até 05/06/2014): As glebas de qualquer região do País onde forem localizadas culturas ilegais de plantas psicotrópicas serão imediatamente expropriadas e especificamente destinadas ao assentamento de colonos, para o cultivo de produtos alimentícios e medicamentosos, sem qualquer indenização ao proprietário e sem prejuízo de outras sanções previstas em lei.
- **Redação B** (a partir de 06/06/2014): As propriedades rurais e urbanas de qualquer região do País onde forem localizadas culturas ilegais de plantas psicotrópicas ou a exploração de trabalho escravo na forma da lei serão expropriadas e destinadas à reforma agrária e a programas de habitação popular, sem qualquer indenização ao proprietário e sem prejuízo de outras sanções previstas em lei, observado, no que couber, o disposto no art. 5º.
- **Fonte:** [texto compilado do Planalto](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm), lido em 19/10/2026
- **Validação:** pendente

### art. 29-A, IV

- **Ato que deu a redação B:** Emenda Constitucional nº 58 de 23/09/2009 · publicado em **24/09/2009** (provisório)
- **Redação A** (até 23/09/2009): cinco por cento para Municípios com população acima de quinhentos mil habitantes. *(anotação do Planalto: Incluído pela Emenda Constitucional nº 25, de 2000)*
- **Redação B** (a partir de 24/09/2009): 4,5% (quatro inteiros e cinco décimos por cento) para Municípios com população entre 500.001 (quinhentos mil e um) e 3.000.000 (três milhões) de habitantes;
- **Fonte:** [texto compilado do Planalto](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm), lido em 19/10/2026
- **Validação:** pendente

### art. 73, § 1º, I

- **Ato que deu a redação B:** Emenda Constitucional nº 122 de 17/05/2022 · publicado em **18/05/2022** (provisório)
- **Redação A** (até 17/05/2022): mais de trinta e cinco e menos de sessenta e cinco anos de idade;
- **Redação B** (a partir de 18/05/2022): mais de trinta e cinco e menos de setenta anos de idade;
- **Fonte:** [texto compilado do Planalto](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm), lido em 19/10/2026
- **Validação:** pendente

### art. 7º, XII

- **Ato que deu a redação B:** Emenda Constitucional nº 20 de 15/12/1998 · publicado em **16/12/1998** (provisório)
- **Redação A** (até 15/12/1998): salário-família para os seus dependentes;
- **Redação B** (a partir de 16/12/1998): salário-família pago em razão do dependente do trabalhador de baixa renda nos termos da lei;
- **Atenção:** A e B são muito diferentes. Pode ter havido renumeração: nesse caso A é o texto que ocupava este rótulo, não a versão anterior do mesmo dispositivo. Confira no ato antes de validar.
- **Fonte:** [texto compilado do Planalto](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm), lido em 19/10/2026
- **Validação:** pendente

## Decreto-Lei nº 5.452/1943 (Consolidação das Leis do Trabalho) (DL-5452-1943)

### art. 73, § 4º

- **Ato que deu a redação B:** Decreto-Lei nº 9.666 de 28/08/1946 · publicado em **30/08/1946** (provisório)
- **Redação A** (até 29/08/1946): As prorrogações do trabalho noturno aplica-se o disposto neste capítulo.
- **Redação B** (a partir de 30/08/1946): Nos horários mistos, assim entendidos os que abrangem períodos diurnos e noturnos, aplica-se às horas de trabalho noturno o disposto neste artigo e seus parágrafos.
- **Atenção:** A e B são muito diferentes. Pode ter havido renumeração: nesse caso A é o texto que ocupava este rótulo, não a versão anterior do mesmo dispositivo. Confira no ato antes de validar.
- **Fonte:** [texto compilado do Planalto](https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452compilado.htm), lido em 19/10/2026
- **Validação:** pendente

## Lei nº 11.340/2006 (Lei Maria da Penha) (LEI-11340-2006)

### art. 18, II

- **Ato que deu a redação B:** Lei nº 13.894 de 29/10/2019 · publicado em **30/10/2019** (provisório)
- **Redação A** (até 29/10/2019): determinar o encaminhamento da ofendida ao órgão de assistência judiciária, quando for o caso;
- **Redação B** (a partir de 30/10/2019): determinar o encaminhamento da ofendida ao órgão de assistência judiciária, quando for o caso, inclusive para o ajuizamento da ação de separação judicial, de divórcio, de anulação de casamento ou de dissolução de união estável perante o juízo competente;
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11340.htm), lido em 19/10/2026
- **Validação:** pendente

### art. 22, § 4º

- **Ato que deu a redação B:** Lei nº 15.412 de 20/05/2026 · publicado em **21/05/2026** (provisório)
- **Redação A** (até 20/05/2026): Aplica-se às hipóteses previstas neste artigo, no que couber, o disposto no caput e nos §§ 5º e 6º do art. 461 da Lei no 5.869, de 11 de janeiro de 1973 (Código de Processo Civil).
- **Redação B** (a partir de 21/05/2026): Na aplicação das medidas protetivas de urgência, o juiz concederá a tutela específica ou determinará providências que assegurem a obtenção de tutela pelo resultado prático equivalente.
- **Atenção:** A e B são muito diferentes. Pode ter havido renumeração: nesse caso A é o texto que ocupava este rótulo, não a versão anterior do mesmo dispositivo. Confira no ato antes de validar.
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11340.htm), lido em 19/10/2026
- **Validação:** pendente

### art. 38-A, parágrafo único

- **Ato que deu a redação B:** Lei nº 14.310 de 08/03/2022 · publicado em **09/03/2022** (provisório)
- **Redação A** (até 08/03/2022): As medidas protetivas de urgência serão registradas em banco de dados mantido e regulamentado pelo Conselho Nacional de Justiça, garantido o acesso do Ministério Público, da Defensoria Pública e dos órgãos de segurança pública e de assistência social, com vistas à fiscalização e à efetividade das medidas protetivas. *(anotação do Planalto: Incluído pela Lei nº 13.827, de 2019)*
- **Redação B** (a partir de 09/03/2022): As medidas protetivas de urgência serão, após sua concessão, imediatamente registradas em banco de dados mantido e regulamentado pelo Conselho Nacional de Justiça, garantido o acesso instantâneo do Ministério Público, da Defensoria Pública e dos órgãos de segurança pública e de assistência social, com vistas à fiscalização e à efetividade das medidas protetivas. Vigência
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11340.htm), lido em 19/10/2026
- **Validação:** pendente

### art. 7º, II

- **Ato que deu a redação B:** Lei nº 13.772 de 19/12/2018 · publicado em **20/12/2018** (provisório)
- **Redação A** (até 19/12/2018): a violência psicológica, entendida como qualquer conduta que lhe cause dano emocional e diminuição da auto-estima ou que lhe prejudique e perturbe o pleno desenvolvimento ou que vise degradar ou controlar suas ações, comportamentos, crenças e decisões, mediante ameaça, constrangimento, humilhação, manipulação, isolamento, vigilância constante, perseguição contumaz, insulto, chantagem, ridicularização, exploração e limitação do direito de ir e vir ou qualquer outro meio que lhe cause prejuízo à saúde psicológica e à autodeterminação;
- **Redação B** (a partir de 20/12/2018): a violência psicológica, entendida como qualquer conduta que lhe cause dano emocional e diminuição da autoestima ou que lhe prejudique e perturbe o pleno desenvolvimento ou que vise degradar ou controlar suas ações, comportamentos, crenças e decisões, mediante ameaça, constrangimento, humilhação, manipulação, isolamento, vigilância constante, perseguição contumaz, insulto, chantagem, violação de sua intimidade, ridicularização, exploração e limitação do direito de ir e vir ou qualquer outro meio que lhe cause prejuízo à saúde psicológica e à autodeterminação;
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11340.htm), lido em 19/10/2026
- **Validação:** pendente

### art. 9º

- **Ato que deu a redação B:** Lei nº 14.887 de 12/06/2024 · publicado em **13/06/2024** (provisório)
- **Redação A** (até 12/06/2024): A assistência à mulher em situação de violência doméstica e familiar será prestada de forma articulada e conforme os princípios e as diretrizes previstos na Lei Orgânica da Assistência Social, no Sistema Único de Saúde, no Sistema Único de Segurança Pública, entre outras normas e políticas públicas de proteção, e emergencialmente quando for o caso.
- **Redação B** (a partir de 13/06/2024): A assistência à mulher em situação de violência doméstica e familiar será prestada em caráter prioritário no Sistema Único de Saúde (SUS) e no Sistema Único de Segurança Pública (Susp), de forma articulada e conforme os princípios e as diretrizes previstos na Lei nº 8.742, de 7 de dezembro de 1993 (Lei Orgânica da Assistência Social), e em outras normas e políticas públicas de proteção, e emergencialmente, quando for o caso.
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11340.htm), lido em 19/10/2026
- **Validação:** pendente

## Lei nº 11.343/2006 (Lei de Drogas) (LEI-11343-2006)

### art. 32

- **Ato que deu a redação B:** Lei nº 12.961 de 04/04/2014 · publicado em **07/04/2014** (provisório)
- **Redação A** (até 06/04/2014): As plantações ilícitas serão imediatamente destruídas pelas autoridades de polícia judiciária, que recolherão quantidade suficiente para exame pericial, de tudo lavrando auto de levantamento das condições encontradas, com a delimitação do local, asseguradas as medidas necessárias para a preservação da prova.
- **Redação B** (a partir de 07/04/2014): As plantações ilícitas serão imediatamente destruídas pelo delegado de polícia na forma do art. 50-A, que recolherá quantidade suficiente para exame pericial, de tudo lavrando auto de levantamento das condições encontradas, com a delimitação do local, asseguradas as medidas necessárias para a preservação da prova.
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11343.htm), lido em 19/10/2026
- **Validação:** pendente

### art. 62, § 4º

- **Ato que deu a redação B:** Lei nº 13.840 de 05/06/2019 · publicado em **06/06/2019** (provisório)
- **Redação A** (até 05/06/2019): Após a instauração da competente ação penal, o Ministério Público, mediante petição autônoma, requererá ao juízo competente que, em caráter cautelar, proceda à alienação dos bens apreendidos, excetuados aqueles que a União, por intermédio da Senad, indicar para serem colocados sob uso e custódia da autoridade de polícia judiciária, de órgãos de inteligência ou militares, envolvidos nas ações de prevenção ao uso indevido de drogas e operações de repressão à produção não autorizada e ao tráfico ilícito de drogas, exclusivamente no interesse dessas atividades.
- **Redação B** (a partir de 06/06/2019): Quando a autorização judicial recair sobre veículos, embarcações ou aeronaves, o juiz ordenará à autoridade ou ao órgão de registro e controle a expedição de certificado provisório de registro e licenciamento em favor do órgão ao qual tenha deferido o uso ou custódia, ficando este livre do pagamento de multas, encargos e tributos anteriores à decisão de utilização do bem até o trânsito em julgado da decisão que decretar o seu perdimento em favor da União.
- **Atenção:** A e B são muito diferentes. Pode ter havido renumeração: nesse caso A é o texto que ocupava este rótulo, não a versão anterior do mesmo dispositivo. Confira no ato antes de validar.
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11343.htm), lido em 19/10/2026
- **Validação:** pendente

### art. 73

- **Ato que deu a redação B:** Lei nº 12.219 de 31/03/2010 · publicado em **01/04/2010** (provisório)
- **Redação A** (até 31/03/2010): A União poderá celebrar convênios com os Estados visando à prevenção e repressão do tráfico ilícito e do uso indevido de drogas.
- **Redação B** (a partir de 01/04/2010): A União poderá estabelecer convênios com os Estados e o com o Distrito Federal, visando à prevenção e repressão do tráfico ilícito e do uso indevido de drogas, e com os Municípios, com o objetivo de prevenir o uso indevido delas e de possibilitar a atenção e reinserção social de usuários e dependentes de drogas.
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11343.htm), lido em 19/10/2026
- **Validação:** pendente

## Lei nº 14.133/2021 (Licitações e Contratos Administrativos) (LEI-14133-2021)

### art. 86, § 3º

- **Ato que deu a redação B:** Lei nº 14.770 de 22/12/2023 · publicado em **22/12/2023** (provisório)
- **Redação A** (até 21/12/2023): A faculdade conferida pelo § 2º deste artigo estará limitada a órgãos e entidades da Administração Pública federal, estadual, distrital e municipal que, na condição de não participantes, desejarem aderir à ata de registro de preços de órgão ou entidade gerenciadora federal, estadual ou distrital.
- **Redação B** (a partir de 22/12/2023): A faculdade de aderir à ata de registro de preços na condição de não participante poderá ser exercida:
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14133.htm), lido em 19/10/2026
- **Validação:** pendente

## Lei nº 6.830/1980 (Execução Fiscal) (LEI-6830-1980)

### art. 7º-O, II

- **Ato que deu a redação B:** Lei nº 13.043 de 13/11/2014 · publicado em **14/11/2014** (provisório)
- **Redação A** (até 13/11/2014): penhora, se não for paga a dívida, nem garantida a execução, por meio de depósito ou fiança;
- **Redação B** (a partir de 14/11/2014): penhora, se não for paga a dívida, nem garantida a execução, por meio de depósito, fiança ou seguro garantia;
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/leis/l6830.htm), lido em 19/10/2026
- **Validação:** pendente

## Lei nº 8.112/1990 (Regime Jurídico dos Servidores Públicos Civis da União) (LEI-8112-1990)

### art. 247

- **Ato que deu a redação B:** Lei nº 8.162 de 08/01/1991 · publicado em **09/01/1991** (provisório)
- **Redação A** (até 08/01/1991): Para efeito do disposto no § 2° do art. 231, haverá ajuste de contas com a Previdência Social, correspondente ao período de contribuição por parte dos servidores celetistas abrangidos pelo art. 243.
- **Redação B** (a partir de 09/01/1991): Para efeito do disposto no Título VI desta Lei, haverá ajuste de contas com a Previdência Social, correspondente ao período de contribuição por parte dos servidores celetistas abrangidos pelo art. 243.
- **Fonte:** [texto compilado do Planalto](https://www.planalto.gov.br/ccivil_03/leis/l8112cons.htm), lido em 19/10/2026
- **Validação:** pendente

### art. 9º, II

- **Ato que deu a redação B:** Lei nº 9.527 de 10/12/1997 · publicado em **11/12/1997** (provisório)
- **Redação A** (até 10/12/1997): em comissão, para cargos de confiança, de livre exoneração.
- **Redação B** (a partir de 11/12/1997): em comissão, inclusive na condição de interino, para cargos de confiança vagos.
- **Fonte:** [texto compilado do Planalto](https://www.planalto.gov.br/ccivil_03/leis/l8112cons.htm), lido em 19/10/2026
- **Validação:** pendente

## Lei nº 8.213/1991 (Planos de Benefícios da Previdência Social) (LEI-8213-1991)

### art. 151

- **Ato que deu a redação B:** Lei nº 13.135 de 17/06/2015 · publicado em **18/06/2015** (provisório)
- **Redação A** (até 17/06/2015): Até que seja elaborada a lista de doenças mencionadas no inciso II do art. 26, independe de carência a concessão de auxílio-doença e aposentadoria por invalidez ao segurado que, após filiar-se ao Regime Geral de Previdência Social, for acometido das seguintes doenças: tuberculose ativa; hanseníase; alienação mental; neoplasia maligna; cegueira; paralisia irreversível e incapacitante; cardiopatia grave; doença de Parkinson; espondiloartrose anquilosante; nefropatia grave; estado avançado da doença de Paget (osteíte deformante); síndrome da deficiência imunológica adquirida-Aids; e contaminação por radiação, com base em conclusão da medicina especializada.
- **Redação B** (a partir de 18/06/2015): Até que seja elaborada a lista de doenças mencionada no inciso II do art. 26, independe de carência a concessão de auxílio-doença e de aposentadoria por invalidez ao segurado que, após filiar-se ao RGPS, for acometido das seguintes doenças: tuberculose ativa, hanseníase, alienação mental, esclerose múltipla, hepatopatia grave, neoplasia maligna, cegueira, paralisia irreversível e incapacitante, cardiopatia grave, doença de Parkinson, espondiloartrose anquilosante, nefropatia grave, estado avançado da doença de Paget (osteíte deformante), síndrome da deficiência imunológica adquirida (aids) ou contaminação por radiação, com base em conclusão da medicina especializada.
- **Fonte:** [texto compilado do Planalto](https://www.planalto.gov.br/ccivil_03/leis/l8213cons.htm), lido em 19/10/2026
- **Validação:** pendente

### art. 29, § 3º

- **Ato que deu a redação B:** Lei nº 8.870 de 15/04/1994 · publicado em **16/04/1994** (provisório)
- **Redação A** (até 15/04/1994): Serão considerados para o cálculo do salário-de-benefício os ganhos habituais do segurado empregado, a qualquer título, sob forma de moeda corrente ou de utilidades, sobre os quais tenha incidido contribuição previdenciária.
- **Redação B** (a partir de 16/04/1994): Serão considerados para cálculo do salário-de-benefício os ganhos habituais do segurado empregado, a qualquer título, sob forma de moeda corrente ou de utilidades, sobre os quais tenha incidido contribuições previdenciárias, exceto o décimo-terceiro salário (gratificação natalina).
- **Fonte:** [texto compilado do Planalto](https://www.planalto.gov.br/ccivil_03/leis/l8213cons.htm), lido em 19/10/2026
- **Validação:** pendente

### art. 44

- **Ato que deu a redação B:** Lei nº 9.032 de 28/04/1995 · publicado em **29/04/1995** (provisório)
- **Redação A** (até 28/04/1995): A aposentadoria por invalidez, observado o disposto na Seção III deste capítulo, especialmente no art. 33, consistirá numa renda mensal correspondente a:
- **Redação B** (a partir de 29/04/1995): A aposentadoria por invalidez, inclusive a decorrente de acidente do trabalho, consistirá numa renda mensal correspondente a 100% (cem por cento) do salário-de-benefício, observado o disposto na Seção III, especialmente no art. 33 desta Lei.
- **Fonte:** [texto compilado do Planalto](https://www.planalto.gov.br/ccivil_03/leis/l8213cons.htm), lido em 19/10/2026
- **Validação:** pendente

### art. 6º

- **Ato que deu a redação B:** Lei nº 9.711 de 20/11/1998 · publicado em **21/11/1998** (provisório)
- **Redação A** (até 20/11/1998): O Conselho Nacional de Previdência Social (CNPS) deverá indicar cidadão de notório conhecimento na área para exercer a função de Ouvidor Geral da Previdência Social, que terá mandato de 2 (dois) anos, sendo vedada a sua recondução.
- **Redação B** (a partir de 21/11/1998): Haverá, no âmbito da Previdência Social, uma Ouvidoria-Geral, cujas atribuições serão definidas em regulamento.
- **Atenção:** A e B são muito diferentes. Pode ter havido renumeração: nesse caso A é o texto que ocupava este rótulo, não a versão anterior do mesmo dispositivo. Confira no ato antes de validar.
- **Fonte:** [texto compilado do Planalto](https://www.planalto.gov.br/ccivil_03/leis/l8213cons.htm), lido em 19/10/2026
- **Validação:** pendente

### art. 72

- **Ato que deu a redação B:** Lei nº 9.876 de 26/11/1999 · publicado em **29/11/1999** (provisório)
- **Redação A** (até 28/11/1999): O salário-maternidade para a segurada empregada ou trabalhadora avulsa consistirá numa renda mensal igual à sua remuneração integral e será pago pela empresa, efetivando-se a compensação quando do recolhimento das contribuições, sobre a folha de salários.
- **Redação B** (a partir de 29/11/1999): O salário-maternidade para a segurada empregada ou trabalhadora avulsa consistirá numa renda mensal igual a sua remuneração integral.
- **Fonte:** [texto compilado do Planalto](https://www.planalto.gov.br/ccivil_03/leis/l8213cons.htm), lido em 19/10/2026
- **Validação:** pendente

## Lei nº 9.099/1995 (Juizados Especiais Cíveis e Criminais) (LEI-9099-1995)

### art. 23

- **Ato que deu a redação B:** Lei nº 13.994 de 24/04/2020 · publicado em **27/04/2020** (provisório)
- **Redação A** (até 26/04/2020): Não comparecendo o demandado, o Juiz togado proferirá sentença.
- **Redação B** (a partir de 27/04/2020): Se o demandado não comparecer ou recusar-se a participar da tentativa de conciliação não presencial, o Juiz togado proferirá sentença.
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/leis/l9099.htm), lido em 19/10/2026
- **Validação:** pendente

### art. 60

- **Ato que deu a redação B:** Lei nº 11.313 de 28/06/2006 · publicado em **29/06/2006** (provisório)
- **Redação A** (até 28/06/2006): O Juizado Especial Criminal, provido por Juízes togados ou togados e leigos, tem competência para a conciliação, o julgamento e a execução das infrações penais de menor potencial ofensivo.
- **Redação B** (a partir de 29/06/2006): O Juizado Especial Criminal, provido por juízes togados ou togados e leigos, tem competência para a conciliação, o julgamento e a execução das infrações penais de menor potencial ofensivo, respeitadas as regras de conexão e continência.
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/leis/l9099.htm), lido em 19/10/2026
- **Validação:** pendente

### art. 69, parágrafo único

- **Ato que deu a redação B:** Lei nº 10.455 de 13/05/2002 · publicado em **14/05/2002** (provisório)
- **Redação A** (até 13/05/2002): Ao autor do fato que, após a lavratura do termo, for imediatamente encaminhado ao Juizado ou assumir o compromisso de a ele comparecer, não se imporá prisão em flagrante, nem se exigirá fiança.
- **Redação B** (a partir de 14/05/2002): Ao autor do fato que, após a lavratura do termo, for imediatamente encaminhado ao juizado ou assumir o compromisso de a ele comparecer, não se imporá prisão em flagrante, nem se exigirá fiança. Em caso de violência doméstica, o juiz poderá determinar, como medida de cautela, seu afastamento do lar, domicílio ou local de convivência com a vítima. )
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/leis/l9099.htm), lido em 19/10/2026
- **Validação:** pendente

### art. 83, § 2º

- **Ato que deu a redação B:** Lei nº 13.105 de 16/03/2015 · publicado em **17/03/2015** (provisório)
- **Redação A** (até 16/03/2015): Quando opostos contra sentença, os embargos de declaração suspenderão o prazo para o recurso.
- **Redação B** (a partir de 17/03/2015): Os embargos de declaração interrompem o prazo para a interposição de recurso.
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/leis/l9099.htm), lido em 19/10/2026
- **Validação:** pendente

### art. 8º, § 1º

- **Ato que deu a redação B:** Lei nº 12.126 de 16/12/2009 · publicado em **17/12/2009** (provisório)
- **Redação A** (até 16/12/2009): Somente as pessoas físicas capazes serão admitidas a propor ação perante o Juizado Especial, excluídos os cessionários de direito de pessoas jurídicas.
- **Redação B** (a partir de 17/12/2009): Somente serão admitidas a propor ação perante o Juizado Especial:
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/leis/l9099.htm), lido em 19/10/2026
- **Validação:** pendente

## Lei nº 9.307/1996 (Arbitragem) (LEI-9307-1996)

### art. 13, § 4º

- **Ato que deu a redação B:** Lei nº 13.129 de 26/05/2015 · publicado em **27/05/2015** (provisório)
- **Redação A** (até 26/05/2015): Sendo nomeados vários árbitros, estes, por maioria, elegerão o presidente do tribunal arbitral. Não havendo consenso, será designado presidente o mais idoso.
- **Redação B** (a partir de 27/05/2015): As partes, de comum acordo, poderão afastar a aplicação de dispositivo do regulamento do órgão arbitral institucional ou entidade especializada que limite a escolha do árbitro único, coárbitro ou presidente do tribunal à respectiva lista de árbitros, autorizado o controle da escolha pelos órgãos competentes da instituição, sendo que, nos casos de impasse e arbitragem multiparte, deverá ser observado o que dispuser o regulamento aplicável.
- **Atenção:** A e B são muito diferentes. Pode ter havido renumeração: nesse caso A é o texto que ocupava este rótulo, não a versão anterior do mesmo dispositivo. Confira no ato antes de validar.
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/leis/l9307.htm), lido em 19/10/2026
- **Validação:** pendente

