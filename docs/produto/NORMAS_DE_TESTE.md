# Normas de teste com histórico conhecido (F3-07)

> **Gerado por `pnpm historico` (em `packages/normaviva`). Não edite à mão:** a validação fica em `packages/normaviva/corpus/historico-conhecido.json` (campo `validacao`) e este documento é regenerado.

**57 casos em 25 normas** · validados: **0** · pendentes: **57**

Cada caso diz: até a véspera da publicação do ato, o dispositivo tinha a redação **A**; a partir dela, a redação **B** (a vigente hoje). Servem de gabarito para a consulta temporal do NormaViva (F3-04).

## De onde vem cada coisa

- **Redação B:** o corpus, lido do Planalto (só a redação vigente).
- **Redação A:** o texto **tachado** da página do Planalto, só quando o trecho tachado é o dispositivo inteiro (mesmo tipo e número). Tachado de palavras soltas não reconstrói o texto e fica de fora. O tachado vale aqui só como evidência histórica, nunca como texto vigente. A página é a do próprio corpus; nas normas cujo corpus vem da versão compilada (que não traz o tachado), é a **página anotada** da mesma norma, coletada à parte em `corpus/planalto/anotadas/` (`pnpm coletar:anotadas`). A linha **Fonte** de cada caso diz qual foi.
- **Data:** a da publicação do ato que deu a redação B (API do Senado). **É provisória** (`vigenciaConfirmada: false`): a vigência pode ter começado em outro dia (*vacatio legis*, cláusula própria).
- **O caso vale pelo rótulo.** Se a lei renumerou dispositivos, A é o texto que ocupava aquele rótulo na época; os casos em que A e B quase não se parecem trazem um aviso.
- **Limite:** só as normas cujas páginas do Planalto trazem texto tachado de redações antigas têm casos. Sem casos: LEI-11419-2006, LEI-12016-2009, LEI-12965-2014. A Lei 12.965 só tem tachado de medida provisória rejeitada ("Rejeitada"), que não é alteração de lei; as Leis 11.419 e 12.016 não têm tachado nenhum.

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

## Decreto-Lei nº 2.848/1940 (Código Penal) (DL-2848-1940)

### art. 155, § 8º

- **Ato que deu a redação B:** Lei nº 15.397 de 30/04/2026 · publicado em **04/05/2026** (provisório)
- **Redação A** (até 03/05/2026): A pena é de reclusão de 2 (dois) a 8 (oito) anos e multa, se a subtração for de fios, cabos ou equipamentos utilizados para fornecimento ou transmissão de energia elétrica ou de telefonia ou para transferência de dados, bem como equipamentos ou materiais ferroviários ou metroviários, aplicável, em qualquer caso, o disposto no § 2º deste artigo. *(anotação do Planalto: Incluído pela Lei nº 15.181, de 2025)*
- **Redação B** (a partir de 04/05/2026): A pena é de reclusão, de 2 (dois) a 8 (oito) anos, e multa, se a subtração for de fios, cabos ou equipamentos utilizados para fornecimento ou transmissão de energia elétrica ou de telefonia ou para transferência de dados, bem como equipamentos ou materiais ferroviários ou metroviários, aplicável, em qualquer caso, o disposto no § 2º deste artigo.
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848.htm), lido em 20/10/2026
- **Validação:** pendente

### art. 46

- **Ato que deu a redação B:** Lei nº 9.714 de 25/11/1998 · publicado em **26/11/1998** (provisório)
- **Redação A** (até 25/11/1998): A prestação de serviços a comunidade consiste na atribuição ao condenado de tarefas gratuitas junto a entidades assistências, hospitais, escolas, orfanatos e outros estabelecimentos congêneres, em programas comunitários ou estatais. *(anotação do Planalto: Redação dada pela Lei nº 7.209, de 1984)*
- **Redação B** (a partir de 26/11/1998): A prestação de serviços à comunidade ou a entidades públicas é aplicável às condenações superiores a seis meses de privação da liberdade.
- **Atenção:** A e B são muito diferentes. Pode ter havido renumeração: nesse caso A é o texto que ocupava este rótulo, não a versão anterior do mesmo dispositivo. Confira no ato antes de validar.
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848.htm), lido em 20/10/2026
- **Validação:** pendente

## Decreto-Lei nº 3.689/1941 (Código de Processo Penal) (DL-3689-1941)

### art. 341

- **Ato que deu a redação B:** Lei nº 12.403 de 04/05/2011 · publicado em **05/05/2011** (provisório)
- **Redação A** (até 04/05/2011): Julgar-se-á quebrada a fiança quando o réu, legalmente intimado para ato do processo, deixar de comparecer, sem provar, incontinenti, motivo justo, ou quando, na vigência da fiança, praticar outra infração penal.
- **Redação B** (a partir de 05/05/2011): Julgar-se-á quebrada a fiança quando o acusado: .
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/decreto-lei/del3689.htm), lido em 20/10/2026
- **Validação:** pendente

### art. 3º-B, § 1º

- **Ato que deu a redação B:** Lei nº 15.358 de 24/03/2026 · publicado em **25/03/2026** (provisório)
- **Redação A** (até 24/03/2026): O preso em flagrante ou por força de mandado de prisão provisória será encaminhado à presença do juiz de garantias no prazo de 24 (vinte e quatro) horas, momento em que se realizará audiência com a presença do Ministério Público e da Defensoria Pública ou de advogado constituído, vedado o emprego de videoconferência. *(anotação do Planalto: Incluído pela Lei nº 13.964, de 2019)*
- **Redação B** (a partir de 25/03/2026): O preso em flagrante ou por força de mandado de prisão provisória será encaminhado à presença do juiz competente para celebração da audiência de custódia no prazo de 24 (vinte e quatro) horas, momento em que se realizará, por videoconferência, audiência com a presença do Ministério Público e da Defensoria Pública ou de advogado constituído, na forma estabelecida no art. 310 deste Código.
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/decreto-lei/del3689.htm), lido em 20/10/2026
- **Validação:** pendente

## Decreto-Lei nº 4.657/1942 (Lei de Introdução às Normas do Direito Brasileiro) (DL-4657-1942)

### art. 10, § 1º

- **Ato que deu a redação B:** Lei nº 9.047 de 18/05/1995 · publicado em **19/05/1995** (provisório)
- **Redação A** (até 18/05/1995): A vocação para suceder em bens de estrangeiro situados no Brasil. será regulada pela lei brasileira em benefício do cônjuge brasileiro e dos filhos do casal, sempre que não lhes seja mais favorável a lei do domicílio.
- **Redação B** (a partir de 19/05/1995): A sucessão de bens de estrangeiros, situados no País, será regulada pela lei brasileira em benefício do cônjuge ou dos filhos brasileiros, ou de quem os represente, sempre que não lhes seja mais favorável a lei pessoal do de cujus.
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/decreto-lei/del4657.htm), lido em 20/10/2026
- **Validação:** pendente

### art. 6º

- **Ato que deu a redação B:** Lei nº 3.238 de 01/08/1957 · publicado em **03/08/1957** (provisório)
- **Redação A** (até 02/08/1957): A lei em vigor terá efeito imediato e geral. Não atingirá, entretanto, salvo disposição expressa em contrário, as situações jurídicas definitivamente constituídas e a execução do ato jurídico perfeito.
- **Redação B** (a partir de 03/08/1957): A Lei em vigor terá efeito imediato e geral, respeitados o ato jurídico perfeito, o direito adquirido e a coisa julgada.
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/decreto-lei/del4657.htm), lido em 20/10/2026
- **Validação:** pendente

## Decreto-Lei nº 5.452/1943 (Consolidação das Leis do Trabalho) (DL-5452-1943)

### art. 73, § 4º

- **Ato que deu a redação B:** Decreto-Lei nº 9.666 de 28/08/1946 · publicado em **30/08/1946** (provisório)
- **Redação A** (até 29/08/1946): As prorrogações do trabalho noturno aplica-se o disposto neste capítulo.
- **Redação B** (a partir de 30/08/1946): Nos horários mistos, assim entendidos os que abrangem períodos diurnos e noturnos, aplica-se às horas de trabalho noturno o disposto neste artigo e seus parágrafos.
- **Atenção:** A e B são muito diferentes. Pode ter havido renumeração: nesse caso A é o texto que ocupava este rótulo, não a versão anterior do mesmo dispositivo. Confira no ato antes de validar.
- **Fonte:** [texto compilado do Planalto](https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452compilado.htm), lido em 19/10/2026
- **Validação:** pendente

## Lei nº 10.406/2002 (Código Civil) (LEI-10406-2002)

### art. 1.076, II

- **Ato que deu a redação B:** Lei nº 14.451 de 21/09/2022 · publicado em **22/09/2022** (provisório)
- **Redação A** (até 21/09/2022): pelos votos correspondentes a mais de metade do capital social, nos casos previstos nos incisos II, III, IV e VIII do art. 1.071;
- **Redação B** (a partir de 22/09/2022): pelos votos correspondentes a mais da metade do capital social, nos casos previstos nos incisos II, III, IV, V, VI e VIII do caput do art. 1.071 deste Código; Vigência
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/leis/2002/l10406.htm), lido em 20/10/2026
- **Validação:** pendente

### art. 3º

- **Ato que deu a redação B:** Lei nº 13.146 de 06/07/2015 · publicado em **07/07/2015** (provisório)
- **Redação A** (até 06/07/2015): São absolutamente incapazes de exercer pessoalmente os atos da vida civil:
- **Redação B** (a partir de 07/07/2015): São absolutamente incapazes de exercer pessoalmente os atos da vida civil os menores de 16 (dezesseis) anos.
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/leis/2002/l10406.htm), lido em 20/10/2026
- **Validação:** pendente

## Lei nº 11.101/2005 (Recuperação Judicial, Extrajudicial e Falência) (LEI-11101-2005)

### art. 6º

- **Ato que deu a redação B:** Lei nº 14.112 de 24/12/2020 · publicado em **24/12/2020** (provisório)
- **Redação A** (até 23/12/2020): A decretação da falência ou o deferimento do processamento da recuperação judicial suspende o curso da prescrição e de todas as ações e execuções em face do devedor, inclusive aquelas dos credores particulares do sócio solidário.
- **Redação B** (a partir de 24/12/2020): A decretação da falência ou o deferimento do processamento da recuperação judicial implica:
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2005/lei/l11101.htm), lido em 20/10/2026
- **Validação:** pendente

### art. 72, parágrafo único

- **Ato que deu a redação B:** Lei Complementar nº 147 de 07/08/2014 · publicado em **08/08/2014** (provisório)
- **Redação A** (até 07/08/2014): O juiz também julgará improcedente o pedido de recuperação judicial e decretará a falência do devedor se houver objeções, nos termos do art. 55 desta Lei, de credores titulares de mais da metade dos créditos descritos no inciso I do caput do art. 71 desta Lei.
- **Redação B** (a partir de 08/08/2014): O juiz também julgará improcedente o pedido de recuperação judicial e decretará a falência do devedor se houver objeções, nos termos do art. 55, de credores titulares de mais da metade de qualquer uma das classes de créditos previstos no art. 83, computados na forma do art. 45, todos desta Lei.
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2005/lei/l11101.htm), lido em 20/10/2026
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

## Lei nº 13.105/2015 (Código de Processo Civil) (LEI-13105-2015)

### art. 1.063

- **Ato que deu a redação B:** Lei nº 14.976 de 18/09/2024 · publicado em **19/09/2024** (provisório)
- **Redação A** (até 18/09/2024): Até a edição de lei específica, os juizados especiais cíveis previstos na Lei nº 9.099, de 26 de setembro de 1995 , continuam competentes para o processamento e julgamento das causas previstas no art. 275, inciso II, da Lei nº 5.869, de 11 de janeiro de 1973
- **Redação B** (a partir de 19/09/2024): Os juizados especiais cíveis previstos na Lei nº 9.099, de 26 de setembro de 1995, continuam competentes para o processamento e o julgamento das causas previstas no inciso II do art. 275 da Lei nº 5.869, de 11 de janeiro de 1973.
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm), lido em 20/10/2026
- **Validação:** pendente

### art. 12

- **Ato que deu a redação B:** Lei nº 13.256 de 04/02/2016 · publicado em **05/02/2016** (provisório)
- **Redação A** (até 04/02/2016): Os juízes e os tribunais deverão obedecer à ordem cronológica de conclusão para proferir sentença ou acórdão.
- **Redação B** (a partir de 05/02/2016): Os juízes e os tribunais atenderão, preferencialmente, à ordem cronológica de conclusão para proferir sentença ou acórdão.
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm), lido em 20/10/2026
- **Validação:** pendente

## Lei nº 13.709/2018 (Lei Geral de Proteção de Dados) (LEI-13709-2018)

### art. 18, V

- **Ato que deu a redação B:** Lei nº 13.853 de 08/07/2019 · publicado em **09/07/2019** (provisório)
- **Redação A** (até 08/07/2019): portabilidade dos dados a outro fornecedor de serviço ou produto, mediante requisição expressa e observados os segredos comercial e industrial, de acordo com a regulamentação do órgão controlador;
- **Redação B** (a partir de 09/07/2019): portabilidade dos dados a outro fornecedor de serviço ou produto, mediante requisição expressa, de acordo com a regulamentação da autoridade nacional, observados os segredos comercial e industrial; Vigência
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm), lido em 20/10/2026
- **Validação:** pendente

## Lei nº 14.133/2021 (Licitações e Contratos Administrativos) (LEI-14133-2021)

### art. 86, § 3º

- **Ato que deu a redação B:** Lei nº 14.770 de 22/12/2023 · publicado em **22/12/2023** (provisório)
- **Redação A** (até 21/12/2023): A faculdade conferida pelo § 2º deste artigo estará limitada a órgãos e entidades da Administração Pública federal, estadual, distrital e municipal que, na condição de não participantes, desejarem aderir à ata de registro de preços de órgão ou entidade gerenciadora federal, estadual ou distrital.
- **Redação B** (a partir de 22/12/2023): A faculdade de aderir à ata de registro de preços na condição de não participante poderá ser exercida:
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14133.htm), lido em 19/10/2026
- **Validação:** pendente

## Lei nº 5.172/1966 (Código Tributário Nacional) (LEI-5172-1966)

### art. 151, III

- **Ato que deu a redação B:** Lei Complementar nº 236 de 04/09/2026 · publicado em **04/09/2026** (provisório)
- **Redação A** (até 03/09/2026): as reclamações e os recursos, nos têrmos das leis reguladoras do processo tributário administrativo;
- **Redação B** (a partir de 04/09/2026): as impugnações, os recursos e a manifestação de inconformidade, nos termos das leis reguladoras do processo tributário administrativo;
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/leis/l5172.htm), lido em 20/10/2026
- **Validação:** pendente

### art. 9º, IV, b)

- **Ato que deu a redação B:** Lei Complementar nº 214 de 16/01/2025 · publicado em **16/01/2025** (provisório)
- **Redação A** (até 15/01/2025): templos de qualquer culto;
- **Redação B** (a partir de 16/01/2025): entidades religiosas e templos de qualquer culto, inclusive suas organizações assistenciais e beneficentes;
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/leis/l5172.htm), lido em 20/10/2026
- **Validação:** pendente

## Lei nº 6.830/1980 (Execução Fiscal) (LEI-6830-1980)

### art. 7º, II

- **Ato que deu a redação B:** Lei nº 13.043 de 13/11/2014 · publicado em **14/11/2014** (provisório)
- **Redação A** (até 13/11/2014): penhora, se não for paga a dívida, nem garantida a execução, por meio de depósito ou fiança;
- **Redação B** (a partir de 14/11/2014): penhora, se não for paga a dívida, nem garantida a execução, por meio de depósito, fiança ou seguro garantia;
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/leis/l6830.htm), lido em 19/10/2026
- **Validação:** pendente

## Lei nº 7.210/1984 (Lei de Execução Penal) (LEI-7210-1984)

### art. 112, I

- **Ato que deu a redação B:** Lei nº 15.402 de 08/05/2026 · publicado em **08/05/2026** (provisório)
- **Redação A** (até 07/05/2026): 16% (dezesseis por cento) da pena, se o apenado for primário e o crime tiver sido cometido sem violência à pessoa ou grave ameaça; *(anotação do Planalto: Incluído pela Lei nº 13.964, de 2019)*
- **Redação B** (a partir de 08/05/2026): se o apenado for primário e for condenado pela prática de crime mediante o exercício de violência ou grave ameaça, salvo em relação aos crimes previstos no Título XII da Parte Especial do Decreto-Lei nº 2.848, de 7 de dezembro de 1940 (Código Penal), deverão ser cumpridos ao menos 25% (vinte e cinco por cento) da pena;
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/leis/l7210.htm), lido em 20/10/2026
- **Validação:** pendente

### art. 9º-A, § 5º

- **Ato que deu a redação B:** Lei nº 15.295 de 19/12/2025 · publicado em **22/12/2025** (provisório)
- **Redação A** (até 21/12/2025): A amostra biológica coletada só poderá ser utilizada para o único e exclusivo fim de permitir a identificação pelo perfil genético, não estando autorizadas as práticas de fenotipagem genética ou de busca familiar. *(anotação do Planalto: Incluído pela Lei nº 13.964, de 2019)*
- **Redação B** (a partir de 22/12/2025): A amostra biológica coletada só poderá ser utilizada para o único e exclusivo fim de permitir a identificação pelo perfil genético, não estando autorizadas as práticas de fenotipagem genética. Vigência
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/leis/l7210.htm), lido em 20/10/2026
- **Validação:** pendente

## Lei nº 7.347/1985 (Ação Civil Pública) (LEI-7347-1985)

### art. 15

- **Ato que deu a redação B:** Lei nº 8.078 de 11/09/1990 · publicado em **12/09/1990** (provisório)
- **Redação A** (até 11/09/1990): Decorridos 60 (sessenta) dias do trânsito em julgado da sentença condenatória, sem que a associação autora lhe promova a execução, deverá fazê-lo o Ministério Público.
- **Redação B** (a partir de 12/09/1990): Decorridos sessenta dias do trânsito em julgado da sentença condenatória, sem que a associação autora lhe promova a execução, deverá fazê-lo o Ministério Público, facultada igual iniciativa aos demais legitimados.
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/leis/l7347orig.htm), lido em 20/10/2026
- **Validação:** pendente

### art. 1º, V

- **Ato que deu a redação B:** Lei nº 12.529 de 30/11/2011 · publicado em **01/12/2011** (provisório)
- **Redação A** (até 30/11/2011): por infração da ordem econômica e da economia popular; *(anotação do Planalto: Redação dada pela Medida provisória nº 2.180-35, de 2001)*
- **Redação B** (a partir de 01/12/2011): por infração da ordem econômica; .
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/leis/l7347orig.htm), lido em 20/10/2026
- **Validação:** pendente

## Lei nº 8.069/1990 (Estatuto da Criança e do Adolescente) (LEI-8069-1990)

### art. 4º

- **Ato que deu a redação B:** Lei nº 15.512 de 22/09/2026 · publicado em **23/09/2026** (provisório)
- **Redação A** (até 22/09/2026): É dever da família, da comunidade, da sociedade em geral e do poder público assegurar, com absoluta prioridade, a efetivação dos direitos referentes à vida, à saúde, à alimentação, à educação, ao esporte, ao lazer, à profissionalização, à cultura, à dignidade, ao respeito, à liberdade e à convivência familiar e comunitária.
- **Redação B** (a partir de 23/09/2026): É dever da família, da comunidade, da sociedade em geral e do poder público assegurar, com absoluta prioridade, a efetivação dos direitos referentes à vida, à saúde, à alimentação, à educação, ao esporte, ao lazer, à profissionalização, à cultura, à dignidade, ao respeito, à liberdade, à natureza e à convivência familiar e comunitária.
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/leis/l8069.htm), lido em 20/10/2026
- **Validação:** pendente

### art. 87, II

- **Ato que deu a redação B:** Lei nº 13.257 de 08/03/2016 · publicado em **09/03/2016** (provisório)
- **Redação A** (até 08/03/2016): políticas e programas de assistência social, em caráter supletivo, para aqueles que deles necessitem
- **Redação B** (a partir de 09/03/2016): serviços, programas, projetos e benefícios de assistência social de garantia de proteção social e de prevenção e redução de violações de direitos, seus agravamentos ou reincidências;
- **Atenção:** A e B são muito diferentes. Pode ter havido renumeração: nesse caso A é o texto que ocupava este rótulo, não a versão anterior do mesmo dispositivo. Confira no ato antes de validar.
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/leis/l8069.htm), lido em 20/10/2026
- **Validação:** pendente

## Lei nº 8.078/1990 (Código de Defesa do Consumidor) (LEI-8078-1990)

### art. 4º

- **Ato que deu a redação B:** Lei nº 9.008 de 21/03/1995 · publicado em **22/03/1995** (provisório)
- **Redação A** (até 21/03/1995): A Política Nacional de Relações de Consumo tem por objetivo o atendimento das necessidades dos consumidores, o respeito a sua dignidade, saúde e segurança, a proteção de seus interesses econômicos, a melhoria da sua qualidade de vida, bem como a transferência e harmonia das relações de consumo, atendidos os seguintes princípios:
- **Redação B** (a partir de 22/03/1995): A Política Nacional das Relações de Consumo tem por objetivo o atendimento das necessidades dos consumidores, o respeito à sua dignidade, saúde e segurança, a proteção de seus interesses econômicos, a melhoria da sua qualidade de vida, bem como a transparência e harmonia das relações de consumo, atendidos os seguintes princípios:
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/leis/l8078.htm), lido em 20/10/2026
- **Validação:** pendente

### art. 57

- **Ato que deu a redação B:** Lei nº 8.656 de 21/05/1993 · publicado em **22/05/1993** (provisório)
- **Redação A** (até 21/05/1993): A pena de multa, graduada de acordo com a gravidade da infração, a vantagem auferida e a condição econômica do fornecedor será aplicada mediante procedimento administrativo nos termos da lei, revertendo para o fundo de que trata a Lei n° 7.347, de 24 de julho de 1985, sendo a infração ou dano de âmbito nacional, ou para os fundos estaduais de proteção ao consumidor nos demais casos.
- **Redação B** (a partir de 22/05/1993): A pena de multa, graduada de acordo com a gravidade da infração, a vantagem auferida e a condição econômica do fornecedor, será aplicada mediante procedimento administrativo, revertendo para o Fundo de que trata a Lei nº 7.347, de 24 de julho de 1985, os valores cabíveis à União, ou para os Fundos estaduais ou municipais de proteção ao consumidor nos demais casos.
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/leis/l8078.htm), lido em 20/10/2026
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

## Lei nº 8.245/1991 (Locações de imóveis urbanos) (LEI-8245-1991)

### art. 12

- **Ato que deu a redação B:** Lei nº 12.112 de 09/12/2009 · publicado em **10/12/2009** (provisório)
- **Redação A** (até 09/12/2009): Em casos de separação de fato, separação judicial, divórcio ou dissolução da sociedade concubinária, a locação prosseguirá automaticamente com o cônjuge ou companheiro que permanecer no imóvel.
- **Redação B** (a partir de 10/12/2009): Em casos de separação de fato, separação judicial, divórcio ou dissolução da união estável, a locação residencial prosseguirá automaticamente com o cônjuge ou companheiro que permanecer no imóvel.
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/leis/l8245.htm), lido em 20/10/2026
- **Validação:** pendente

## Lei nº 8.429/1992 (Improbidade Administrativa) (LEI-8429-1992)

### art. 1º

- **Ato que deu a redação B:** Lei nº 14.230 de 25/10/2021 · publicado em **26/10/2021** (provisório)
- **Redação A** (até 25/10/2021): Os atos de improbidade praticados por qualquer agente público, servidor ou não, contra a administração direta, indireta ou fundacional de qualquer dos Poderes da União, dos Estados, do Distrito Federal, dos Municípios, de Território, de empresa incorporada ao patrimônio público ou de entidade para cuja criação ou custeio o erário haja concorrido ou concorra com mais de cinqüenta por cento do patrimônio ou da receita anual, serão punidos na forma desta lei.
- **Redação B** (a partir de 26/10/2021): O sistema de responsabilização por atos de improbidade administrativa tutelará a probidade na organização do Estado e no exercício de suas funções, como forma de assegurar a integridade do patrimônio público e social, nos termos desta Lei.
- **Atenção:** A e B são muito diferentes. Pode ter havido renumeração: nesse caso A é o texto que ocupava este rótulo, não a versão anterior do mesmo dispositivo. Confira no ato antes de validar.
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/leis/l8429.htm), lido em 20/10/2026
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

## Lei nº 9.503/1997 (Código de Trânsito Brasileiro) (LEI-9503-1997)

### art. 174

- **Ato que deu a redação B:** Lei nº 12.971 de 09/05/2014 · publicado em **12/05/2014** (provisório)
- **Redação A** (até 11/05/2014): Promover, na via, competição esportiva, eventos organizados, exibição e demonstração de perícia em manobra de veículo, ou deles participar, como condutor, sem permissão da autoridade de trânsito com circunscrição sobre a via:
- **Redação B** (a partir de 12/05/2014): Promover, na via, competição, eventos organizados, exibição e demonstração de perícia em manobra de veículo, ou deles participar, como condutor, sem permissão da autoridade de trânsito com circunscrição sobre a via:
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/leis/l9503.htm), lido em 20/10/2026
- **Validação:** pendente

### art. 2º, parágrafo único

- **Ato que deu a redação B:** Lei nº 13.146 de 06/07/2015 · publicado em **07/07/2015** (provisório)
- **Redação A** (até 06/07/2015): Para os efeitos deste Código, são consideradas vias terrestres as praias abertas à circulação pública e as vias internas pertencentes aos condomínios constituídos por unidades autônomas.
- **Redação B** (a partir de 07/07/2015): Para os efeitos deste Código, são consideradas vias terrestres as praias abertas à circulação pública, as vias internas pertencentes aos condomínios constituídos por unidades autônomas e as vias e áreas de estacionamento de estabelecimentos privados de uso coletivo.
- **Fonte:** [página anotada do Planalto](https://www.planalto.gov.br/ccivil_03/leis/l9503.htm), lido em 20/10/2026
- **Validação:** pendente

