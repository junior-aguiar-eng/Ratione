// GERADO por `cenarios/gerar_trts.py` a partir de `cenarios/trts-2026.json`. Não edite à mão: altere o JSON e rode o gerador.
import type { EfeitoEvento, FonteCalendario, VerificacaoEvento } from './eventos';

/** Fontes dos calendários dos Tribunais Regionais do Trabalho (um ato por entrada). */
export const FONTES_TRTS = {
  "trt7-portaria-518-2025": {
    "ato": "Portaria TRT7.GP nº 518, de 18/11/2025 (DEJT nº 4354), alterada pelas Portarias TRT7.GP nº 64, de 20/02/2026 (DEJT nº 4420, inclui os pontos facultativos de 20/04, 05/06, 10/08 e 07/12) e nº 127, de 09/04/2026 (DEJT nº 4448, só feriados municipais): dias sem expediente na Justiça do Trabalho da 7ª Região em 2026",
    "url": "https://www.trt7.jus.br/files/atos_normativos/portarias_presidencia/2025/PORTARIA%20PRESI%20518-2025%20este.pdf",
    "lido": "inteiro teor da Portaria 518/2025 (PDF republicado, 6 páginas) e da Portaria 64/2026, lidos em 28/10/2026 pelo script de acesso; a Portaria 127/2026 só pelo resumo de busca (altera feriados municipais). O art. 1º determina que não haverá expediente nos dias da tabela, os pontos facultativos incluídos, e o art. 3º prorroga para o primeiro dia útil os prazos que começam ou vencem nessas datas; por isso todos contam como dia sem expediente (e 28/10, Dia do Servidor, foi transferido para 30/10). Fora: os feriados municipais do art. 2º (CPC, art. 1.003, § 6º), 20 a 31/12 e 02 a 06/01 já no recesso. Atos posteriores não lidos",
    "lidoEm": "2026-10-28"
  },
  "trt4-portaria-8-2025": {
    "ato": "Portaria TRT4 nº 08, de 08/07/2025, da Corregedoria Regional (texto compilado com as Portarias 17/2025, 24/2025 e 04/2026): calendário oficial de feriados de 2026, Anexo Único",
    "url": "https://www.trt4.jus.br/portais/documento-ato/1065334/Texto%20Compilado%20Portaria%208%20de%202025%20Calend%C3%A1rio%20Oficial.pdf",
    "lido": "texto compilado de 8 páginas, lido por inteiro em 28/10/2026 (cópia obtida pela ferramenta de leitura de páginas; o script de acesso expira neste host). Contam os feriados nacionais e estaduais do Anexo Único (Carnaval 16 e 17/02, Semana Santa 1 a 3/04, 11/08, 20/09 Revolução Farroupilha, 30/10, 01 e 02/11, 08/12 e os recessos de 01 a 06/01 e 20 a 31/12). Fora: os feriados municipais da segunda parte do Anexo (inclusive Corpus Christi, que só é feriado municipal no Rio Grande do Sul; CPC, art. 1.003, § 6º). A Nota 1 trata da suspensão dos prazos de 07 a 20/01 (CPC, art. 220), que já está no motor. Atos posteriores à Portaria 04/2026 não lidos",
    "lidoEm": "2026-10-28"
  },
  "trt4-ra-10-2026": {
    "ato": "Resolução Administrativa TRT4 nº 10/2026 (Órgão Especial): pontos facultativos de 2026 na Justiça do Trabalho da 4ª Região",
    "url": "https://www.trt4.jus.br/portais/documento-ato/1066096/RA%2010-2026.pdf",
    "lido": "inteiro teor (4 páginas), lido em 28/10/2026. O art. 1º estabelece 18/02 (até as 14h), 20/04, 05/06, 10/08 e 07/12 como pontos facultativos e o parágrafo único diz que, nesses dias, não haverá contagem de prazos nos processos judiciais de primeiro e segundo graus; a adesão das unidades é facultativa (arts. 2º e 3º), mas o art. 3º, § 4º mantém a ausência de contagem de prazos mesmo nas unidades que não aderirem. Por isso os cinco dias contam como dia sem expediente para os prazos",
    "lidoEm": "2026-10-28"
  },
  "trt6-portaria-495-2025": {
    "ato": "Portaria TRT6-GP nº 495/2025 (01/09/2025, decisão do Pleno Administrativo de 01/09/2025): feriados e pontos facultativos de 2026 no Tribunal e nas Varas do Trabalho da 6ª Região",
    "url": "https://www.trt6.jus.br/portal/sites/default/files/documents/portaria_gp_495-2025_-_feriados_2026_assinada1_0.pdf",
    "lido": "inteiro teor (3 páginas), lido em 28/10/2026 pelo script de acesso. O art. 1º lista os feriados e o recesso do exercício, todos como dias sem expediente forense; o art. 3º suspende os prazos no recesso (Lei 5.010, art. 62, I, e CPC, art. 220); o art. 6º remete aos feriados locais (municipais, fora: CPC, art. 1.003, § 6º). Corpus Christi está em 23/06 (adiamento do feriado religioso) e não em 04/06. O ato não lista nenhum dos pontos facultativos de 20/04, 05/06, 10/08 e 07/12 que TST e outros TRTs adotaram, e nenhum outro ato do TRT6 sobre eles foi encontrado: ficam de fora. Atos posteriores não lidos",
    "lidoEm": "2026-10-28"
  },
  "trt15-portaria-gp-cr-16-2025": {
    "ato": "Portaria GP-CR nº 016/2025, de 23/10/2025 (republicada por erro material), do TRT15, com o Anexo (feriados com emenda em 2026): dias em que não haverá expediente nos órgãos da Justiça do Trabalho da 15ª Região em 2026",
    "url": "https://trt15.jus.br/legislacao/normas-institucionais/portarias/portaria-gp-cr-no-0162025",
    "lido": "texto da portaria e Anexo (PDF de 1 página, lido por inteiro em 28/10/2026 pelo script de acesso; a tabela foi conferida em imagem, onde 11/08 e 28/10 aparecem riscados por terem sido transferidos para 10/08 e 30/10). Contam os dias da tabela marcados como feriado, recesso ou suspensão de expediente: 02 a 06/01, 16 a 18/02, 01 a 03/04, 20/04, 05/06, 09 e 10/07 (Data Magna do Estado de São Paulo e suspensão), 10/08, 30/10, 07 e 08/12 e 21 a 31/12. Ficam de fora os dias que a própria tabela dá como municipais de Campinas (Corpus Christi em 04/06, Dia do Evangélico em 12/08 e Padroeira em 08/12; CPC, art. 1.003, § 6º, mas 08/12 conta como Dia da Justiça). Atos posteriores não lidos",
    "lidoEm": "2026-10-28"
  },
  "trt12-portaria-seap-191-2024": {
    "ato": "Portaria SEAP nº 191, de 19/11/2024 (republicada no DEJT de 20/03/2026 por erro material, com as alterações da Portaria SEAP nº 52, de 16/03/2026), do TRT12: feriados de 2026 na 12ª Região, com o Anexo I (nacionais, estaduais e regimentais) e o Anexo II (municipais); Portaria SEAP nº 25, de 02/02/2026 (DEJT de 04/02/2026)",
    "url": "https://dspace.trt12.jus.br/server/api/core/bitstreams/6ff50119-8297-4376-8920-9e84ef24fccf/content",
    "lido": "inteiro teor da Portaria 191/2024 republicada (PDF de 5 páginas, tabelas conferidas em imagem) e da Portaria 25/2026, lidos em 28/10/2026 pelo script de acesso. Contam os feriados regimentais do Anexo I (art. 153 e art. 154 do Regimento Interno): 02 a 06/01, 16 a 18/02 (Carnaval e Cinzas), 01 a 05/04 (Semana Santa), 10/08 (transferido de 11/08), 30/10 (transferido de 28/10), 01 e 02/11, 07/12 (transferido de 08/12) e 20 a 31/12; o art. 2º da portaria transfere esses três feriados. Os feriados estaduais de SC (16/08 e 29/11) caem em domingo. Alertam: 20/04 e 05/06, que a Portaria 25/2026 acrescentou à tabela de \"Feriados Regimentais/Pontos Facultativos\" mas que a republicação de 20/03/2026 (Portaria 52/2026, não lida) já não traz na tabela, e 04/06 (Corpus Christi, \"feriado em todos os Municípios-Sede\" no Anexo II, mas de lei municipal; CPC, art. 1.003, § 6º). Fora: os demais feriados municipais do Anexo II. Atos posteriores não lidos",
    "lidoEm": "2026-10-28"
  },
  "trt1-ato-109-2025": {
    "ato": "Ato TRT1 nº 109/2025 (DEJT de 07/10/2025): dias sem expediente nos órgãos da Justiça do Trabalho da 1ª Região em 2026; Ato TRT1 nº 56/2026 (DEJT de 07/03/2026): suspensão do expediente e dos prazos em 20/04 e 05/06/2026",
    "url": "https://bibliotecadigital.trt1.jus.br/jspui/html/1001/4472618/Ato2025-0109-C.htm",
    "lido": "inteiro teor dos dois atos (páginas da Biblioteca Digital do TRT1, lidas em 28/10/2026 pelo script de acesso). O Ato 109/2025 lista os feriados em que não haverá expediente (recesso de 02 a 06/01, Carnaval de 16 a 18/02, Semana Santa de 01 a 03/04, São Jorge em 23/04 pela Lei estadual 5.198/2008, Corpus Christi em 04/06, 11/08, 30/10 em lugar de 28/10, 08/12 e recesso de 20 a 31/12; os feriados municipais ficam no Ato 110/2025, fora: CPC, art. 1.003, § 6º). O art. 2º manda trabalhar a distância em 20/04, 05/06, 10/08 e 07/12, com suspensão só do atendimento presencial e dos prazos dos processos migrados que dependam de volumes físicos; por isso 10/08 e 07/12 só alertam. O Ato 56/2026 suspendeu o expediente e todos os prazos processuais em 20/04 e 05/06, que passam a contar como dia sem expediente. Ato 110/2025 e atos posteriores a abril/2026 não lidos",
    "lidoEm": "2026-10-28"
  },
  "trt2-portaria-gp-50-2025": {
    "ato": "Portaria GP nº 50, de 02/10/2025 (DEJT nº 4322), do TRT2: calendário de feriados de 2026 dos órgãos da Justiça do Trabalho da 2ª Região, com Anexo",
    "url": "https://basis.trt2.jus.br/bitstream/handle/123456789/17686/2025_port0050_gp.pdf?sequence=4&isAllowed=y",
    "lido": "inteiro teor (PDF de 5 páginas do repositório do TRT2, lido em 28/10/2026 pelo script de acesso). Contam só as linhas do Anexo com abrangência \"Segunda Região\" (toda a jurisdição): recesso de 02 a 06/01 e de 20 a 31/12, Carnaval em 16 e 17/02, Cinzas em 18/02 (suspensão do expediente), Semana Santa de 01 a 05/04, suspensões de expediente em 20/04, 05/06 e 10/07, Data Magna do Estado de São Paulo em 09/07, 10/08 (antecipação do Dia dos Cursos Jurídicos), 30/10 (transferência do Dia do Servidor), 01 e 02/11 e 07/12 (antecipação do Dia da Justiça). Ficam fora as linhas de abrangência municipal (CPC, art. 1.003, § 6º), inclusive Corpus Christi. O art. 1º, parágrafo único, manda observar os arts. 219 e 224, § 1º, do CPC. A Portaria GP 19/2026 trata só do calendário de 2027. Atos de suspensão local e posteriores não lidos",
    "lidoEm": "2026-10-28"
  },
  "trt3-ra-109-2025": {
    "ato": "Resolução Administrativa TRT3 nº 109, de 12/08/2025 (DEJT nº 4285, de 13/08/2025, p. 14-16): calendário institucional de 2026 da Justiça do Trabalho da 3ª Região",
    "url": "https://portal.trt3.jus.br/internet/conheca-o-trt/comunicacao/noticias-institucionais/downloads/ra-trt3_setpoe-109_2025-orig-1.pdf",
    "lido": "inteiro teor (PDF de 4 páginas, lido em 28/10/2026; cópia obtida pela ferramenta de leitura de páginas porque o script expira neste host). Contam os feriados em todo o Estado e as suspensões de expediente em todos os órgãos: recesso de 01 a 06/01 e de 20 a 31/12, Carnaval em 16 e 17/02, Cinzas em 18/02 (suspensão), Semana Santa de 01 a 05/04, 20/04 (suspensão), 21/04 (Tiradentes e Data Magna de Minas), 14/08 (feriado dos Cursos Jurídicos alterado de 11 para 14/08), 30/10 (alterado de 28/10), 01 e 02/11, 08/12. Fora: os feriados municipais de Belo Horizonte (04/06, 05/06 e 15/08) e do interior (CPC, art. 1.003, § 6º). Atos posteriores não lidos, inclusive eventuais pontos facultativos",
    "lidoEm": "2026-10-28"
  },
  "trt5-ra-37-2025": {
    "ato": "Resolução Administrativa TRT5 nº 037, de 10/06/2025 (DEJT, caderno administrativo de 10/06/2025): calendário de 2026 do TRT5 (Anexo: feriados comuns a toda a região); Ato GP nº 16, de 13/01/2026: altera o calendário, transfere o Dia do Servidor e institui pontos facultativos com suspensão de expediente e de prazos",
    "url": "https://www.trt5.jus.br/sites/default/files/sistema/normas/2025-06/0037-2025_aprova_calendario_exercicio_de_2026.pdf",
    "lido": "inteiro teor da RA 037/2025 (PDF de 4 páginas) e do Ato GP 16/2026 (PDF de 1 página), lidos em 28/10/2026 pelo script de acesso. Contam os \"feriados comuns a toda a região\" da RA 037/2025: recesso 01 a 06/01 e 20 a 31/12, Carnaval 16 e 17/02, Cinzas 18/02, Semana Santa 01 a 05/04, 04/06 (Corpus Christi), 23 e 24/06 (Véspera de São João e São João), 02/07 (Independência da Bahia), 11/08, 01 e 02/11 e 08/12 (Padroeira do Estado e feriado forense). O Ato GP 16/2026 transfere o Dia do Servidor de 28 para 30/10 e, no art. 2º, declara ponto facultativo com suspensão do expediente e dos prazos processuais em toda a região em 20/04, 05/06, 03/07, 10/08 e 07/12, com retomada da contagem no primeiro dia útil seguinte: esses cinco dias contam como dia sem expediente. Ficam fora os feriados das cidades (CPC, art. 1.003, § 6º). Atos posteriores não lidos",
    "lidoEm": "2026-10-28"
  },
  "trt8-calendario-2026": {
    "ato": "Calendário 2026 do TRT8 (PDF institucional \"02. Calendário 2026.ATUAL\", com a legenda \"Feriados – Portaria PRESI nº 1200/2025\"; o cabeçalho a chama também de Resolução nº 1.200/2025)",
    "url": "https://www.trt8.jus.br/sites/portal/files/roles/institucional/02._calendario_2026.atual__9.pdf",
    "lido": "PDF de 2 páginas lido por inteiro em 28/10/2026 pelo script de acesso (texto e legenda). Não é o ato normativo: nem a Portaria PRESI 1200/2025 nem o PROAD 7958/2025 foram lidos. Contam os dias que a legenda dá como feriado ou \"suspensão de expediente - Portaria nº 1200/2025\": Carnaval 16 e 17/02, Semana Santa de 01 a 03/04, suspensões em 20/04, 05/06, 10/08 e 07/12, 11/08, 30/10 (Dia do Servidor transferido de 28/10), 01 e 02/11 e 08/12, mais o recesso do art. 62, I (02 a 06/01 e 20 a 31/12). 18/02 só alerta (\"ponto facultativo - PROAD 7958/2025\"). Ficam fora: Corpus Christi em 04/06 (Lei municipal de Belém 6.307/1967; CPC, art. 1.003, § 6º), o Círio em 26/10 (ponto facultativo local) e 15/08 (Adesão do Pará, sábado). Atos posteriores não lidos",
    "lidoEm": "2026-10-28"
  },
  "trt10-calendario-2026": {
    "ato": "Calendário 2026 do TRT10 (PDF institucional do tribunal, com a lista de feriados e os recessos)",
    "url": "https://www.trt10.jus.br/docsweb/institucional/calendario/pdf/calendario_2026.pdf",
    "lido": "PDF lido por inteiro em 28/10/2026 pelo script de acesso (calendário ilustrado com a lista de feriados e a nota do recesso: \"Recesso Forense: 2 a 6/1 e 20 a 31/12\" e, pelo art. 256, § 2º, do Regimento Interno, de 7 a 20/1). Não é um ato normativo: nenhuma portaria do tribunal foi lida. Contam os feriados da lista geral: Carnaval em 16 e 17/02, Semana Santa de 01 a 05/04, 04/06 (Corpus Christi), 11/08, 01 e 02/11 e 08/12, mais o recesso. 28/10 (Dia do Servidor) vem sem transferência no calendário, mas TST e vários TRTs a transferiram para 30/10: 28/10 e 30/10 só alertam. Cinzas, 20/04, 05/06, 10/08 e 07/12 não constam. Ficam fora os feriados estaduais de Tocantins (08/09 e 05/10) e os municipais de Palmas e do interior, que valem só nas unidades locais (CPC, art. 1.003, § 6º). Atos posteriores não lidos",
    "lidoEm": "2026-10-28"
  },
  "trt14-portaria-gp-1640-2025": {
    "ato": "Portaria GP nº 1640/2025 do TRT14, com o Anexo Único \"Calendário de Feriados e Recesso Forense 2026\" (PROAD 6972/2025, doc. 530, juntado em 18/12/2025), e a notícia oficial que informa a transferência do Dia do Servidor para 30/10",
    "url": "https://files.trt14.jus.br/portal/public/feriados-2025-12/PORTARIA%201640-2025-Anexo%20%C3%BAnico%20-%20Calend%C3%A1rio%202026.pdf",
    "lido": "Anexo Único inteiro (PDF de 3 páginas, lido em 28/10/2026 pelo script de acesso); o texto da portaria em si não foi lido. Contam as linhas de alcance Nacional e Regimental: recesso de 01 a 06/01 e de 20 a 31/12, 16/02 (feriado regimental), 17/02 (Carnaval), 18/02 (Cinzas), 01 a 03/04 (Quarta e Quinta Santa e Sexta-feira da Paixão), 04/06 (Corpus Christi, \"Nacional\"), 11/08, 08/12 e 30/10, que a notícia oficial informa ter sido transferido de 28/10 pela mesma portaria (não há expediente e os prazos são prorrogados). Alertam 23/01 e 17/11 (feriados do Estado do Acre, válidos só nas unidades acreanas). Fora: feriados municipais e o feriado estadual de Rondônia que cai em domingo (CPC, art. 1.003, § 6º). Atos posteriores não lidos",
    "lidoEm": "2026-10-28"
  },
  "trt14-portaria-gp-550-2026": {
    "ato": "Portaria GP nº 0550, de 19/05/2026, do TRT14: ponto facultativo em 05/06/2026 em todas as unidades de Rondônia e do Acre",
    "url": "http://portal.trt14.jus.br/portal/noticias/justica-do-trabalho-decreta-ponto-facultativo-no-dia-5-de-junho-apos-feriado-de-corpus",
    "lido": "só a notícia oficial do tribunal, lida em 28/10/2026: o funcionamento será exclusivamente em plantão judiciário e os prazos processuais são prorrogados automaticamente para o próximo dia útil; o texto da portaria não foi lido. Por isso 05/06 conta como dia sem expediente",
    "lidoEm": "2026-10-28"
  },
  "trt19-ato-170-2025": {
    "ato": "Ato nº 170/GP/TRT 19ª, de 29/09/2025 (DEJT e BI nº 10, de 08/10/2025): feriados e pontos facultativos de 2026 na Justiça do Trabalho da 19ª Região",
    "url": "https://asp1.trt19.jus.br/docspdf/rhdocs/BOLETIM_20251008092236621.PDF",
    "lido": "inteiro teor (PDF de 2 páginas, lido em 28/10/2026 pelo script de acesso). O art. 1º divulga os feriados e estabelece os pontos facultativos de 20/04, 05/06, 10/08 e 07/12 (iguais aos do STF), sem dizer que não haverá expediente; por isso esses quatro dias só alertam. Contam os demais dias da tabela: recesso de 02 a 06/01 e de 20 a 31/12, Carnaval em 16 e 17/02, Cinzas em 18/02, Semana Santa de 01 a 03/04, 04/06 (Corpus Christi), 24/06 (São João, Lei estadual 5.508/1993), 29/06 (São Pedro, Lei estadual 5.509/1993), 11/08, 16/09 (Emancipação Política de Alagoas), 30/10 (transferência do Dia do Servidor) e 08/12 (Dia da Justiça). O art. 2º manda observar os arts. 219 e 224, § 1º, do CPC. Fora: 27/08 (Padroeira de Maceió, municipal) e os feriados locais do interior (art. 3º; CPC, art. 1.003, § 6º). Atos posteriores não lidos",
    "lidoEm": "2026-10-28"
  },
  "trt20-calendario-2026": {
    "ato": "Calendário 2026 do TRT20 (PDF institucional \"Calendário 2026 - TRT da 20ª Região\", com carimbo de assinatura de 16/01/2026); notícia oficial \"TRT-SE disponibiliza calendário de feriados para o exercício de 2026\"",
    "url": "https://www.trt20.jus.br/images/documentos/calendario/Calendario_2026.pdf",
    "lido": "PDF de 1 página (digitalizado), lido em imagem em 28/10/2026, e a notícia oficial, que diz que nos feriados nacionais e estaduais ficam suspensos o expediente, o atendimento ao público e os prazos em todas as unidades. Não é o ato normativo: nenhum ato do tribunal foi lido. Contam os dias \"Toda a Região\" que o calendário dá como feriado: recesso de 01 a 06/01 e de 20 a 31/12, Carnaval em 16 e 17/02, Cinzas em 18/02 (feriado regimental), Semana Santa de 01 a 03/04, 04/06 (Corpus Christi), 24/06 (São João), 08/07 (Independência de Sergipe), 11/08, 30/10 (Dia do Servidor, remanejado de 28/10) e 08/12. Os pontos facultativos 20/04, 05/06, 10/08 e 07/12 só são rotulados \"ponto facultativo\" e por isso só alertam. Fora: os feriados municipais (Aracaju e interior; CPC, art. 1.003, § 6º). Atos posteriores não lidos",
    "lidoEm": "2026-10-28"
  },
  "trt23-portaria-conjunta-007-2026": {
    "ato": "Portaria Conjunta TRT CORREG GP nº 007/2026 (assinada em 05 e 06/08/2026), que altera o Calendário Forense de 2026 do TRT23 estabelecido pela Portaria Conjunta TRT CORREG GP nº 028/2025, na forma do anexo \"Calendário - 2026\"",
    "url": "https://portal.trt23.jus.br/portal/sites/portal/files/groups/governanca/portaria_unificada_calendario_forense_2026.pdf",
    "lido": "inteiro teor da portaria e do anexo (PDF de 4 páginas; as tabelas foram conferidas em imagem), lidos em 28/10/2026 pelo script de acesso. Contam as linhas de alcance \"Nacional\" e \"Regional\" que são feriado, recesso ou suspensão de prazo: recesso de 02 a 06/01 e de 20 a 31/12, Carnaval de 16 a 18/02, Semana Santa de 01 a 05/04, Corpus Christi em 04/06 (regimental, Portaria Conjunta 31/2015), Dia do Advogado em 11/08, suspensão de prazo em 28/10 (Portaria Conjunta 007/2026), 30/10 (Dia do Servidor Público regimental), 01 e 02/11, 20/11 e 08/12. Fora: as linhas municipais (CPC, art. 1.003, § 6º) e a Semana Jurídica de 04 a 08/05 e de 14 a 18/12, que o anexo trata como categoria própria e não como suspensão de prazo. A suspensão de 07 a 20/01 (CPC, art. 220) já está no motor. O ato-base 028/2025 não foi lido; atos posteriores não lidos",
    "lidoEm": "2026-10-28"
  },
  "trt16-portaria-gp-681-2025": {
    "ato": "Portaria GP/TRT16 nº 681/2025 (assinada em 19/09/2025, SEI 000006304/2025): aprova o Calendário Institucional de 2026 do TRT16, decreta pontos facultativos e transfere feriados",
    "url": "https://www.trt16.jus.br/site/conteudo/publicacoes/pub_inteiro_teor.php?id=76277",
    "lido": "inteiro teor da portaria e do Calendário 2026 anexo (PDF de 9 páginas), lidos em 28/10/2026 (cópia baixada direto, porque o script de acesso devolve o PDF corrompido neste host). O art. 2º decreta ponto facultativo com suspensão do expediente, dos prazos judiciais, das audiências e do atendimento em 20/04, 05/06 e 07/12, com prorrogação dos prazos; o art. 3º transfere, com a mesma suspensão, os feriados de 28/07 para 27/07, de 11/08 para 10/08 e de 28/10 para 30/10. Por isso todos esses dias contam como dia sem expediente. Contam também, pelo calendário anexo, o recesso de 02 a 06/01 e de 20 a 31/12, Carnaval de 16 a 18/02, Semana Santa de 01 a 03/04, 04/06 (Corpus Christi) e 08/12 (Dia da Justiça). Fora: os feriados municipais (CPC, art. 1.003, § 6º). Atos posteriores não lidos",
    "lidoEm": "2026-10-28"
  },
  "trt24-calendario-2026": {
    "ato": "Calendário 2026 do TRT24 (PDF institucional do tribunal, com a legenda de feriados e suspensões \"Portaria TRT/GP/SGJ nº 51/2025\")",
    "url": "https://www.trt24.jus.br/documents/20182/0/Calend%C3%A1rio+2026.pdf/ed8dc485-5c7e-e05c-e569-215ec9cd1389?t=1767889939074",
    "lido": "PDF inteiro lido em 28/10/2026 (cópia baixada direto; o script de acesso expira neste host). Não é o ato normativo: a Portaria TRT/GP/SGJ 51/2025 não foi lida. Contam os dias da legenda: Carnaval em 16 e 17/02, suspensão do expediente em 20/04, 05/06 e 10/08 (Portaria 51/2025), Semana Santa de 01 a 03/04, 04/06 (Corpus Christi, Lei 9.093/1995 c/c Lei municipal 1.019/1967, listado sem a ressalva \"exclusivo da Capital\" que a legenda faz em 26/08), 11/08, 30/10 (Dia do Servidor transferido de 28/10), 01 e 02/11 e 08/12; 18/02 vale só até as 13h (expediente parcial). 07/12 só alerta: a legenda traz \"07 de novembro - Suspensão expediente\", provável erro de digitação. O recesso (02 a 06/01 e 20 a 31/12) não tem as datas na legenda: aplicou-se o padrão do art. 62, I, da Lei 5.010. Ficam fora o padroeiro de Campo Grande (13/06, sábado), 26/08 (só a Capital) e 11/10 (domingo). Uma notícia do tribunal fala em suspensão de prazos de 20/12 a 23/01, não modelada e de ano não conferido. Atos posteriores não lidos",
    "lidoEm": "2026-10-28"
  },
  "trt22-ato-gp-184-2025": {
    "ato": "Ato GP nº 184/2025 do TRT22 (calendário de feriados de 2026, divulgado em 16/12/2025) e Ato GP nº 185/2025 (suspensão de prazos nas Semanas Institucionais), pelo calendário institucional \"calendário 2026\" e pela notícia oficial do tribunal",
    "url": "https://www.trt22.jus.br/sites/default/files/drive-imce/estrutura-do-tribunal/calendarios/2026/calendario-2026-v1.pdf",
    "lido": "calendário institucional (PDF de 1 página, lido em 28/10/2026 pelo download direto) e notícia oficial \"TRT Piauí divulga calendário oficial de feriados para 2026\"; os Atos GP 184/2025 e 185/2025 em si não foram lidos. Contam os dias de toda a região: recesso de 01 a 06/01 e de 20 a 31/12, Carnaval em 16 e 17/02, 18/02 (suspensão excepcional das atividades), Semana Santa de 01 a 03/04, 04/06 (Corpus Christi), 11/08, 19/10 (Dia do Piauí, Lei estadual 176/1937), 30/10 (Dia do Servidor transferido de 28/10), 01 e 02/11 e 08/12, e as semanas institucionais em que os prazos ficam suspensos (11 a 15/05 e 14 a 18/09, Ato GP 185/2025; prazos que terminam nelas passam ao primeiro dia útil). Ficam fora os feriados locais \"somente na Vara\" ou \"somente no Posto\" (CPC, art. 1.003, § 6º), inclusive 08/12 de Oeiras. Atos posteriores não lidos",
    "lidoEm": "2026-10-28"
  },
  "trt11-calendario-2026": {
    "ato": "Calendário 2026 do TRT11 (PDF \"Aprovado pela Resolução Administrativa nº 322/2025 e alterado pela RA nº 214/2026\", com legenda de feriados, suspensão do expediente e suspensão de prazos)",
    "url": "https://portal.trt11.jus.br/images/arquivos/Calendarios/2026/Calendario_2026_Aprovado_Alterado_ANEXO_RA_214-2026_-_Calendrio_2026.pdf",
    "lido": "PDF de 1 página lido em 28/10/2026 (texto e imagem, onde os dias em vermelho são feriados e em laranja a \"suspensão do expediente RA nº 322/2025\"). Não é o ato normativo: as RAs 322/2025 e 214/2026 não foram lidas. Contam os feriados da legenda: recesso de 01 a 06/01 e de 20 a 31/12, Carnaval em 16 e 17/02, Cinzas em 18/02, Semana Santa de 01 a 03/04, 04/06 (Corpus Christi), 11/08, 28/10 (Dia do Servidor, sem transferência no calendário), 02/11, 08/12 e 15/12 (Instalação do TRT11), e as suspensões de expediente em laranja: 20/04, 05/06 e 10/08. Ficam fora os feriados que caem em fim de semana e os municipais (CPC, art. 1.003, § 6º). A suspensão de prazos de 20/12 a 20/01 (CPC, art. 220) já está no motor. Atos posteriores não lidos",
    "lidoEm": "2026-10-28"
  }
} satisfies Record<string, FonteCalendario>;

export interface EventoDeTRT {
  tribunais: string[];
  inicio: string;
  fim: string;
  nome: string;
  efeito: EfeitoEvento;
  verificacao: VerificacaoEvento;
  fundamento: string;
  fonte: keyof typeof FONTES_TRTS;
}

export const EVENTOS_TRTS: EventoDeTRT[] = [
  {
    "tribunais": [
      "TRT7"
    ],
    "inicio": "2026-01-02",
    "fim": "2026-01-06",
    "nome": "Recesso forense (Lei 5.010, art. 62, I)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT7.GP 518/2025, art. 1º, com a Portaria 64/2026",
    "fonte": "trt7-portaria-518-2025"
  },
  {
    "tribunais": [
      "TRT7"
    ],
    "inicio": "2026-02-16",
    "fim": "2026-02-17",
    "nome": "Carnaval",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT7.GP 518/2025, art. 1º, com a Portaria 64/2026",
    "fonte": "trt7-portaria-518-2025"
  },
  {
    "tribunais": [
      "TRT7"
    ],
    "inicio": "2026-02-18",
    "fim": "2026-02-18",
    "nome": "Quarta-feira de Cinzas (sem expediente)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT7.GP 518/2025, art. 1º, com a Portaria 64/2026",
    "fonte": "trt7-portaria-518-2025"
  },
  {
    "tribunais": [
      "TRT7"
    ],
    "inicio": "2026-03-25",
    "fim": "2026-03-25",
    "nome": "Data Magna do Ceará",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT7.GP 518/2025, art. 1º, com a Portaria 64/2026",
    "fonte": "trt7-portaria-518-2025"
  },
  {
    "tribunais": [
      "TRT7"
    ],
    "inicio": "2026-04-01",
    "fim": "2026-04-03",
    "nome": "Semana Santa",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT7.GP 518/2025, art. 1º, com a Portaria 64/2026",
    "fonte": "trt7-portaria-518-2025"
  },
  {
    "tribunais": [
      "TRT7"
    ],
    "inicio": "2026-04-20",
    "fim": "2026-04-20",
    "nome": "Ponto facultativo (sem expediente, Portaria 64/2026)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT7.GP 518/2025, art. 1º, com a Portaria 64/2026",
    "fonte": "trt7-portaria-518-2025"
  },
  {
    "tribunais": [
      "TRT7"
    ],
    "inicio": "2026-06-04",
    "fim": "2026-06-04",
    "nome": "Corpus Christi",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT7.GP 518/2025, art. 1º, com a Portaria 64/2026",
    "fonte": "trt7-portaria-518-2025"
  },
  {
    "tribunais": [
      "TRT7"
    ],
    "inicio": "2026-06-05",
    "fim": "2026-06-05",
    "nome": "Ponto facultativo (sem expediente, Portaria 64/2026)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT7.GP 518/2025, art. 1º, com a Portaria 64/2026",
    "fonte": "trt7-portaria-518-2025"
  },
  {
    "tribunais": [
      "TRT7"
    ],
    "inicio": "2026-08-10",
    "fim": "2026-08-10",
    "nome": "Ponto facultativo (sem expediente, Portaria 64/2026)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT7.GP 518/2025, art. 1º, com a Portaria 64/2026",
    "fonte": "trt7-portaria-518-2025"
  },
  {
    "tribunais": [
      "TRT7"
    ],
    "inicio": "2026-08-11",
    "fim": "2026-08-11",
    "nome": "Criação dos Cursos Jurídicos",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT7.GP 518/2025, art. 1º, com a Portaria 64/2026",
    "fonte": "trt7-portaria-518-2025"
  },
  {
    "tribunais": [
      "TRT7"
    ],
    "inicio": "2026-10-30",
    "fim": "2026-10-30",
    "nome": "Dia do Servidor Público (transferido de 28/10)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT7.GP 518/2025, art. 1º, com a Portaria 64/2026",
    "fonte": "trt7-portaria-518-2025"
  },
  {
    "tribunais": [
      "TRT7"
    ],
    "inicio": "2026-12-07",
    "fim": "2026-12-07",
    "nome": "Ponto facultativo (sem expediente, Portaria 64/2026)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT7.GP 518/2025, art. 1º, com a Portaria 64/2026",
    "fonte": "trt7-portaria-518-2025"
  },
  {
    "tribunais": [
      "TRT7"
    ],
    "inicio": "2026-12-08",
    "fim": "2026-12-08",
    "nome": "Dia da Justiça",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT7.GP 518/2025, art. 1º, com a Portaria 64/2026",
    "fonte": "trt7-portaria-518-2025"
  },
  {
    "tribunais": [
      "TRT7"
    ],
    "inicio": "2026-12-20",
    "fim": "2026-12-31",
    "nome": "Recesso forense (Lei 5.010, art. 62, I)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT7.GP 518/2025, art. 1º, com a Portaria 64/2026",
    "fonte": "trt7-portaria-518-2025"
  },
  {
    "tribunais": [
      "TRT4"
    ],
    "inicio": "2026-01-02",
    "fim": "2026-01-06",
    "nome": "Recesso forense (Lei 5.010, art. 62, I)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT4 08/2025 (compilada), Anexo Único",
    "fonte": "trt4-portaria-8-2025"
  },
  {
    "tribunais": [
      "TRT4"
    ],
    "inicio": "2026-02-16",
    "fim": "2026-02-17",
    "nome": "Carnaval",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT4 08/2025 (compilada), Anexo Único",
    "fonte": "trt4-portaria-8-2025"
  },
  {
    "tribunais": [
      "TRT4"
    ],
    "inicio": "2026-02-18",
    "fim": "2026-02-18",
    "nome": "Quarta-feira de Cinzas (ponto facultativo: não há contagem de prazos)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "RA TRT4 10/2026, art. 1º, I e parágrafo único",
    "fonte": "trt4-ra-10-2026"
  },
  {
    "tribunais": [
      "TRT4"
    ],
    "inicio": "2026-04-01",
    "fim": "2026-04-03",
    "nome": "Semana Santa",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT4 08/2025 (compilada), Anexo Único",
    "fonte": "trt4-portaria-8-2025"
  },
  {
    "tribunais": [
      "TRT4"
    ],
    "inicio": "2026-04-20",
    "fim": "2026-04-20",
    "nome": "Ponto facultativo (não há contagem de prazos)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "RA TRT4 10/2026, art. 1º, II e parágrafo único",
    "fonte": "trt4-ra-10-2026"
  },
  {
    "tribunais": [
      "TRT4"
    ],
    "inicio": "2026-06-05",
    "fim": "2026-06-05",
    "nome": "Ponto facultativo (não há contagem de prazos)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "RA TRT4 10/2026, art. 1º, III e parágrafo único",
    "fonte": "trt4-ra-10-2026"
  },
  {
    "tribunais": [
      "TRT4"
    ],
    "inicio": "2026-08-10",
    "fim": "2026-08-10",
    "nome": "Ponto facultativo (não há contagem de prazos)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "RA TRT4 10/2026, art. 1º, IV e parágrafo único",
    "fonte": "trt4-ra-10-2026"
  },
  {
    "tribunais": [
      "TRT4"
    ],
    "inicio": "2026-08-11",
    "fim": "2026-08-11",
    "nome": "Dia do Magistrado e do Advogado (Lei 5.010, art. 62, IV)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT4 08/2025 (compilada), Anexo Único",
    "fonte": "trt4-portaria-8-2025"
  },
  {
    "tribunais": [
      "TRT4"
    ],
    "inicio": "2026-09-20",
    "fim": "2026-09-20",
    "nome": "Revolução Farroupilha (Lei 9.093, art. 1º, II; Decreto estadual 36.180/1995)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT4 08/2025 (compilada), Anexo Único",
    "fonte": "trt4-portaria-8-2025"
  },
  {
    "tribunais": [
      "TRT4"
    ],
    "inicio": "2026-10-30",
    "fim": "2026-10-30",
    "nome": "Dia do Servidor Público (transferido de 28/10)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT4 08/2025 (compilada), Anexo Único",
    "fonte": "trt4-portaria-8-2025"
  },
  {
    "tribunais": [
      "TRT4"
    ],
    "inicio": "2026-11-01",
    "fim": "2026-11-01",
    "nome": "Dia de Todos os Santos (Lei 5.010, art. 62, IV)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT4 08/2025 (compilada), Anexo Único",
    "fonte": "trt4-portaria-8-2025"
  },
  {
    "tribunais": [
      "TRT4"
    ],
    "inicio": "2026-12-07",
    "fim": "2026-12-07",
    "nome": "Ponto facultativo (não há contagem de prazos)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "RA TRT4 10/2026, art. 1º, V e parágrafo único",
    "fonte": "trt4-ra-10-2026"
  },
  {
    "tribunais": [
      "TRT4"
    ],
    "inicio": "2026-12-08",
    "fim": "2026-12-08",
    "nome": "Dia da Justiça (Lei 5.010, art. 62, IV)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT4 08/2025 (compilada), Anexo Único",
    "fonte": "trt4-portaria-8-2025"
  },
  {
    "tribunais": [
      "TRT4"
    ],
    "inicio": "2026-12-20",
    "fim": "2026-12-31",
    "nome": "Recesso forense (Lei 5.010, art. 62, I)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT4 08/2025 (compilada), Anexo Único",
    "fonte": "trt4-portaria-8-2025"
  },
  {
    "tribunais": [
      "TRT6"
    ],
    "inicio": "2026-01-02",
    "fim": "2026-01-06",
    "nome": "Recesso forense (Lei 5.010, art. 62, I)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT6-GP 495/2025, art. 1º",
    "fonte": "trt6-portaria-495-2025"
  },
  {
    "tribunais": [
      "TRT6"
    ],
    "inicio": "2026-02-16",
    "fim": "2026-02-17",
    "nome": "Carnaval",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT6-GP 495/2025, art. 1º",
    "fonte": "trt6-portaria-495-2025"
  },
  {
    "tribunais": [
      "TRT6"
    ],
    "inicio": "2026-02-18",
    "fim": "2026-02-18",
    "nome": "Quarta-feira de Cinzas (feriado regimental)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT6-GP 495/2025, art. 1º",
    "fonte": "trt6-portaria-495-2025"
  },
  {
    "tribunais": [
      "TRT6"
    ],
    "inicio": "2026-03-06",
    "fim": "2026-03-06",
    "nome": "Data Magna do Estado de Pernambuco",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT6-GP 495/2025, art. 1º",
    "fonte": "trt6-portaria-495-2025"
  },
  {
    "tribunais": [
      "TRT6"
    ],
    "inicio": "2026-04-01",
    "fim": "2026-04-03",
    "nome": "Semana Santa",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT6-GP 495/2025, art. 1º",
    "fonte": "trt6-portaria-495-2025"
  },
  {
    "tribunais": [
      "TRT6"
    ],
    "inicio": "2026-06-23",
    "fim": "2026-06-23",
    "nome": "Corpus Christi (adiamento do feriado religioso)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT6-GP 495/2025, art. 1º",
    "fonte": "trt6-portaria-495-2025"
  },
  {
    "tribunais": [
      "TRT6"
    ],
    "inicio": "2026-06-24",
    "fim": "2026-06-24",
    "nome": "São João (feriado estadual e regimental)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT6-GP 495/2025, art. 1º",
    "fonte": "trt6-portaria-495-2025"
  },
  {
    "tribunais": [
      "TRT6"
    ],
    "inicio": "2026-08-11",
    "fim": "2026-08-11",
    "nome": "Criação dos Cursos Jurídicos (Lei 5.010, art. 62, IV)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT6-GP 495/2025, art. 1º",
    "fonte": "trt6-portaria-495-2025"
  },
  {
    "tribunais": [
      "TRT6"
    ],
    "inicio": "2026-10-30",
    "fim": "2026-10-30",
    "nome": "Dia do Servidor Público (adiamento do feriado)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT6-GP 495/2025, art. 1º",
    "fonte": "trt6-portaria-495-2025"
  },
  {
    "tribunais": [
      "TRT6"
    ],
    "inicio": "2026-11-02",
    "fim": "2026-11-02",
    "nome": "Finados (Lei 5.010, art. 62, IV)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT6-GP 495/2025, art. 1º",
    "fonte": "trt6-portaria-495-2025"
  },
  {
    "tribunais": [
      "TRT6"
    ],
    "inicio": "2026-12-08",
    "fim": "2026-12-08",
    "nome": "Dia da Justiça",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT6-GP 495/2025, art. 1º",
    "fonte": "trt6-portaria-495-2025"
  },
  {
    "tribunais": [
      "TRT6"
    ],
    "inicio": "2026-12-21",
    "fim": "2026-12-31",
    "nome": "Recesso forense (Lei 5.010, art. 62, I)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria TRT6-GP 495/2025, art. 1º",
    "fonte": "trt6-portaria-495-2025"
  },
  {
    "tribunais": [
      "TRT15"
    ],
    "inicio": "2026-01-02",
    "fim": "2026-01-06",
    "nome": "Recesso forense (Lei 5.010, art. 62, I)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP-CR TRT15 016/2025, Anexo",
    "fonte": "trt15-portaria-gp-cr-16-2025"
  },
  {
    "tribunais": [
      "TRT15"
    ],
    "inicio": "2026-02-16",
    "fim": "2026-02-17",
    "nome": "Carnaval",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP-CR TRT15 016/2025, Anexo",
    "fonte": "trt15-portaria-gp-cr-16-2025"
  },
  {
    "tribunais": [
      "TRT15"
    ],
    "inicio": "2026-02-18",
    "fim": "2026-02-18",
    "nome": "Quarta-feira de Cinzas (suspensão de expediente)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP-CR TRT15 016/2025, Anexo",
    "fonte": "trt15-portaria-gp-cr-16-2025"
  },
  {
    "tribunais": [
      "TRT15"
    ],
    "inicio": "2026-04-01",
    "fim": "2026-04-03",
    "nome": "Semana Santa",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP-CR TRT15 016/2025, Anexo",
    "fonte": "trt15-portaria-gp-cr-16-2025"
  },
  {
    "tribunais": [
      "TRT15"
    ],
    "inicio": "2026-04-20",
    "fim": "2026-04-20",
    "nome": "Suspensão de expediente",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP-CR TRT15 016/2025, Anexo",
    "fonte": "trt15-portaria-gp-cr-16-2025"
  },
  {
    "tribunais": [
      "TRT15"
    ],
    "inicio": "2026-06-05",
    "fim": "2026-06-05",
    "nome": "Suspensão de expediente",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP-CR TRT15 016/2025, Anexo",
    "fonte": "trt15-portaria-gp-cr-16-2025"
  },
  {
    "tribunais": [
      "TRT15"
    ],
    "inicio": "2026-07-09",
    "fim": "2026-07-09",
    "nome": "Data Magna do Estado de São Paulo",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP-CR TRT15 016/2025, Anexo",
    "fonte": "trt15-portaria-gp-cr-16-2025"
  },
  {
    "tribunais": [
      "TRT15"
    ],
    "inicio": "2026-07-10",
    "fim": "2026-07-10",
    "nome": "Suspensão de expediente",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP-CR TRT15 016/2025, Anexo",
    "fonte": "trt15-portaria-gp-cr-16-2025"
  },
  {
    "tribunais": [
      "TRT15"
    ],
    "inicio": "2026-08-10",
    "fim": "2026-08-10",
    "nome": "Suspensão de expediente (feriado dos Cursos Jurídicos transferido de 11/08)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP-CR TRT15 016/2025, Anexo",
    "fonte": "trt15-portaria-gp-cr-16-2025"
  },
  {
    "tribunais": [
      "TRT15"
    ],
    "inicio": "2026-10-30",
    "fim": "2026-10-30",
    "nome": "Dia do Servidor Público (transferido de 28/10)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP-CR TRT15 016/2025, Anexo",
    "fonte": "trt15-portaria-gp-cr-16-2025"
  },
  {
    "tribunais": [
      "TRT15"
    ],
    "inicio": "2026-12-07",
    "fim": "2026-12-07",
    "nome": "Suspensão de expediente",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP-CR TRT15 016/2025, Anexo",
    "fonte": "trt15-portaria-gp-cr-16-2025"
  },
  {
    "tribunais": [
      "TRT15"
    ],
    "inicio": "2026-12-08",
    "fim": "2026-12-08",
    "nome": "Dia da Justiça",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP-CR TRT15 016/2025, Anexo",
    "fonte": "trt15-portaria-gp-cr-16-2025"
  },
  {
    "tribunais": [
      "TRT15"
    ],
    "inicio": "2026-12-21",
    "fim": "2026-12-31",
    "nome": "Recesso forense (Lei 5.010, art. 62, I)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP-CR TRT15 016/2025, Anexo",
    "fonte": "trt15-portaria-gp-cr-16-2025"
  },
  {
    "tribunais": [
      "TRT12"
    ],
    "inicio": "2026-01-02",
    "fim": "2026-01-06",
    "nome": "Recesso forense (Regimento Interno, art. 153)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria SEAP TRT12 191/2024 (republicada), Anexo I",
    "fonte": "trt12-portaria-seap-191-2024"
  },
  {
    "tribunais": [
      "TRT12"
    ],
    "inicio": "2026-02-16",
    "fim": "2026-02-18",
    "nome": "Carnaval e Quarta-feira de Cinzas (Regimento Interno, art. 154)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria SEAP TRT12 191/2024 (republicada), Anexo I",
    "fonte": "trt12-portaria-seap-191-2024"
  },
  {
    "tribunais": [
      "TRT12"
    ],
    "inicio": "2026-04-01",
    "fim": "2026-04-05",
    "nome": "Semana Santa (Regimento Interno, art. 154)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria SEAP TRT12 191/2024 (republicada), Anexo I",
    "fonte": "trt12-portaria-seap-191-2024"
  },
  {
    "tribunais": [
      "TRT12"
    ],
    "inicio": "2026-04-20",
    "fim": "2026-04-20",
    "nome": "Feriado regimental/ponto facultativo (Portaria SEAP 25/2026; a republicação de 20/03/2026 não o traz)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria SEAP TRT12 25/2026",
    "fonte": "trt12-portaria-seap-191-2024"
  },
  {
    "tribunais": [
      "TRT12"
    ],
    "inicio": "2026-06-04",
    "fim": "2026-06-04",
    "nome": "Corpus Christi (feriado municipal nos municípios-sede; Anexo II)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria SEAP TRT12 191/2024, Anexo II",
    "fonte": "trt12-portaria-seap-191-2024"
  },
  {
    "tribunais": [
      "TRT12"
    ],
    "inicio": "2026-06-05",
    "fim": "2026-06-05",
    "nome": "Feriado regimental/ponto facultativo (Portaria SEAP 25/2026; a republicação de 20/03/2026 não o traz)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria SEAP TRT12 25/2026",
    "fonte": "trt12-portaria-seap-191-2024"
  },
  {
    "tribunais": [
      "TRT12"
    ],
    "inicio": "2026-08-10",
    "fim": "2026-08-10",
    "nome": "Dia do Magistrado e do Advogado (transferido de 11/08, art. 2º)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria SEAP TRT12 191/2024 (republicada), Anexo I",
    "fonte": "trt12-portaria-seap-191-2024"
  },
  {
    "tribunais": [
      "TRT12"
    ],
    "inicio": "2026-10-30",
    "fim": "2026-10-30",
    "nome": "Dia do Servidor Público (transferido de 28/10, art. 2º)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria SEAP TRT12 191/2024 (republicada), Anexo I",
    "fonte": "trt12-portaria-seap-191-2024"
  },
  {
    "tribunais": [
      "TRT12"
    ],
    "inicio": "2026-11-01",
    "fim": "2026-11-02",
    "nome": "Todos os Santos e Finados (Regimento Interno, art. 154)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria SEAP TRT12 191/2024 (republicada), Anexo I",
    "fonte": "trt12-portaria-seap-191-2024"
  },
  {
    "tribunais": [
      "TRT12"
    ],
    "inicio": "2026-12-07",
    "fim": "2026-12-07",
    "nome": "Dia da Justiça (transferido de 08/12, art. 2º)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria SEAP TRT12 191/2024 (republicada), Anexo I",
    "fonte": "trt12-portaria-seap-191-2024"
  },
  {
    "tribunais": [
      "TRT12"
    ],
    "inicio": "2026-12-20",
    "fim": "2026-12-31",
    "nome": "Recesso forense (Regimento Interno, art. 153)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria SEAP TRT12 191/2024 (republicada), Anexo I",
    "fonte": "trt12-portaria-seap-191-2024"
  },
  {
    "tribunais": [
      "TRT1"
    ],
    "inicio": "2026-01-02",
    "fim": "2026-01-06",
    "nome": "Recesso forense (Lei 5.010, art. 62, I)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato TRT1 109/2025",
    "fonte": "trt1-ato-109-2025"
  },
  {
    "tribunais": [
      "TRT1"
    ],
    "inicio": "2026-02-16",
    "fim": "2026-02-18",
    "nome": "Carnaval (inclui a Quarta-feira de Cinzas)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato TRT1 109/2025",
    "fonte": "trt1-ato-109-2025"
  },
  {
    "tribunais": [
      "TRT1"
    ],
    "inicio": "2026-04-01",
    "fim": "2026-04-03",
    "nome": "Semana Santa",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato TRT1 109/2025",
    "fonte": "trt1-ato-109-2025"
  },
  {
    "tribunais": [
      "TRT1"
    ],
    "inicio": "2026-04-20",
    "fim": "2026-04-20",
    "nome": "Suspensão do expediente e dos prazos (Ato 56/2026)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato TRT1 56/2026, arts. 1º e 2º",
    "fonte": "trt1-ato-109-2025"
  },
  {
    "tribunais": [
      "TRT1"
    ],
    "inicio": "2026-04-23",
    "fim": "2026-04-23",
    "nome": "São Jorge (Lei estadual 5.198/2008)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato TRT1 109/2025",
    "fonte": "trt1-ato-109-2025"
  },
  {
    "tribunais": [
      "TRT1"
    ],
    "inicio": "2026-06-04",
    "fim": "2026-06-04",
    "nome": "Corpus Christi (Lei 9.093/1995; Lei estadual 11.002/2025)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato TRT1 109/2025",
    "fonte": "trt1-ato-109-2025"
  },
  {
    "tribunais": [
      "TRT1"
    ],
    "inicio": "2026-06-05",
    "fim": "2026-06-05",
    "nome": "Suspensão do expediente e dos prazos (Ato 56/2026)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato TRT1 56/2026, arts. 1º e 2º",
    "fonte": "trt1-ato-109-2025"
  },
  {
    "tribunais": [
      "TRT1"
    ],
    "inicio": "2026-08-10",
    "fim": "2026-08-10",
    "nome": "Trabalho a distância (Ato 109/2025, art. 2º): só alerta",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato TRT1 109/2025, art. 2º",
    "fonte": "trt1-ato-109-2025"
  },
  {
    "tribunais": [
      "TRT1"
    ],
    "inicio": "2026-08-11",
    "fim": "2026-08-11",
    "nome": "Instituição dos Cursos Jurídicos (Lei 5.010, art. 62, IV)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato TRT1 109/2025",
    "fonte": "trt1-ato-109-2025"
  },
  {
    "tribunais": [
      "TRT1"
    ],
    "inicio": "2026-10-30",
    "fim": "2026-10-30",
    "nome": "Dia do Servidor Público",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato TRT1 109/2025",
    "fonte": "trt1-ato-109-2025"
  },
  {
    "tribunais": [
      "TRT1"
    ],
    "inicio": "2026-12-07",
    "fim": "2026-12-07",
    "nome": "Trabalho a distância (Ato 109/2025, art. 2º): só alerta",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato TRT1 109/2025, art. 2º",
    "fonte": "trt1-ato-109-2025"
  },
  {
    "tribunais": [
      "TRT1"
    ],
    "inicio": "2026-12-08",
    "fim": "2026-12-08",
    "nome": "Dia da Justiça (Lei 5.010, art. 62, IV)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato TRT1 109/2025",
    "fonte": "trt1-ato-109-2025"
  },
  {
    "tribunais": [
      "TRT1"
    ],
    "inicio": "2026-12-20",
    "fim": "2026-12-31",
    "nome": "Recesso forense (Lei 5.010, art. 62, I)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato TRT1 109/2025",
    "fonte": "trt1-ato-109-2025"
  },
  {
    "tribunais": [
      "TRT2"
    ],
    "inicio": "2026-01-02",
    "fim": "2026-01-06",
    "nome": "Recesso forense (Lei 5.010, art. 62, I)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP TRT2 50/2025, Anexo",
    "fonte": "trt2-portaria-gp-50-2025"
  },
  {
    "tribunais": [
      "TRT2"
    ],
    "inicio": "2026-02-16",
    "fim": "2026-02-17",
    "nome": "Carnaval",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP TRT2 50/2025, Anexo",
    "fonte": "trt2-portaria-gp-50-2025"
  },
  {
    "tribunais": [
      "TRT2"
    ],
    "inicio": "2026-02-18",
    "fim": "2026-02-18",
    "nome": "Quarta-feira de Cinzas (suspensão do expediente)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP TRT2 50/2025, Anexo",
    "fonte": "trt2-portaria-gp-50-2025"
  },
  {
    "tribunais": [
      "TRT2"
    ],
    "inicio": "2026-04-01",
    "fim": "2026-04-05",
    "nome": "Semana Santa",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP TRT2 50/2025, Anexo",
    "fonte": "trt2-portaria-gp-50-2025"
  },
  {
    "tribunais": [
      "TRT2"
    ],
    "inicio": "2026-04-20",
    "fim": "2026-04-20",
    "nome": "Suspensão do expediente",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP TRT2 50/2025, Anexo",
    "fonte": "trt2-portaria-gp-50-2025"
  },
  {
    "tribunais": [
      "TRT2"
    ],
    "inicio": "2026-06-05",
    "fim": "2026-06-05",
    "nome": "Suspensão do expediente",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP TRT2 50/2025, Anexo",
    "fonte": "trt2-portaria-gp-50-2025"
  },
  {
    "tribunais": [
      "TRT2"
    ],
    "inicio": "2026-07-09",
    "fim": "2026-07-09",
    "nome": "Data Magna do Estado de São Paulo (Lei estadual 9.497/1997)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP TRT2 50/2025, Anexo",
    "fonte": "trt2-portaria-gp-50-2025"
  },
  {
    "tribunais": [
      "TRT2"
    ],
    "inicio": "2026-07-10",
    "fim": "2026-07-10",
    "nome": "Suspensão do expediente",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP TRT2 50/2025, Anexo",
    "fonte": "trt2-portaria-gp-50-2025"
  },
  {
    "tribunais": [
      "TRT2"
    ],
    "inicio": "2026-08-10",
    "fim": "2026-08-10",
    "nome": "Antecipação do Dia da Instalação dos Cursos Jurídicos",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP TRT2 50/2025, Anexo",
    "fonte": "trt2-portaria-gp-50-2025"
  },
  {
    "tribunais": [
      "TRT2"
    ],
    "inicio": "2026-10-30",
    "fim": "2026-10-30",
    "nome": "Dia do Servidor Público (transferência)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP TRT2 50/2025, Anexo",
    "fonte": "trt2-portaria-gp-50-2025"
  },
  {
    "tribunais": [
      "TRT2"
    ],
    "inicio": "2026-11-01",
    "fim": "2026-11-02",
    "nome": "Todos os Santos e Finados (Lei 5.010, art. 62, IV)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP TRT2 50/2025, Anexo",
    "fonte": "trt2-portaria-gp-50-2025"
  },
  {
    "tribunais": [
      "TRT2"
    ],
    "inicio": "2026-12-07",
    "fim": "2026-12-07",
    "nome": "Antecipação do Dia da Justiça",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP TRT2 50/2025, Anexo",
    "fonte": "trt2-portaria-gp-50-2025"
  },
  {
    "tribunais": [
      "TRT2"
    ],
    "inicio": "2026-12-20",
    "fim": "2026-12-31",
    "nome": "Recesso forense (Lei 5.010, art. 62, I)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP TRT2 50/2025, Anexo",
    "fonte": "trt2-portaria-gp-50-2025"
  },
  {
    "tribunais": [
      "TRT3"
    ],
    "inicio": "2026-01-02",
    "fim": "2026-01-06",
    "nome": "Recesso forense (Lei 5.010, art. 62, I)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Resolução Administrativa TRT3 109/2025",
    "fonte": "trt3-ra-109-2025"
  },
  {
    "tribunais": [
      "TRT3"
    ],
    "inicio": "2026-02-16",
    "fim": "2026-02-17",
    "nome": "Carnaval",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Resolução Administrativa TRT3 109/2025",
    "fonte": "trt3-ra-109-2025"
  },
  {
    "tribunais": [
      "TRT3"
    ],
    "inicio": "2026-02-18",
    "fim": "2026-02-18",
    "nome": "Quarta-feira de Cinzas (suspensão de expediente)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Resolução Administrativa TRT3 109/2025",
    "fonte": "trt3-ra-109-2025"
  },
  {
    "tribunais": [
      "TRT3"
    ],
    "inicio": "2026-04-01",
    "fim": "2026-04-05",
    "nome": "Semana Santa",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Resolução Administrativa TRT3 109/2025",
    "fonte": "trt3-ra-109-2025"
  },
  {
    "tribunais": [
      "TRT3"
    ],
    "inicio": "2026-04-20",
    "fim": "2026-04-20",
    "nome": "Suspensão de expediente (feriado de Tiradentes no dia seguinte)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Resolução Administrativa TRT3 109/2025",
    "fonte": "trt3-ra-109-2025"
  },
  {
    "tribunais": [
      "TRT3"
    ],
    "inicio": "2026-04-21",
    "fim": "2026-04-21",
    "nome": "Tiradentes e Data Magna de Minas Gerais",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Resolução Administrativa TRT3 109/2025",
    "fonte": "trt3-ra-109-2025"
  },
  {
    "tribunais": [
      "TRT3"
    ],
    "inicio": "2026-08-14",
    "fim": "2026-08-14",
    "nome": "Dia da Criação dos Cursos Jurídicos (alterado de 11/08)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Resolução Administrativa TRT3 109/2025",
    "fonte": "trt3-ra-109-2025"
  },
  {
    "tribunais": [
      "TRT3"
    ],
    "inicio": "2026-10-30",
    "fim": "2026-10-30",
    "nome": "Dia do Servidor Público (alterado de 28/10)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Resolução Administrativa TRT3 109/2025",
    "fonte": "trt3-ra-109-2025"
  },
  {
    "tribunais": [
      "TRT3"
    ],
    "inicio": "2026-11-01",
    "fim": "2026-11-02",
    "nome": "Todos os Santos e Finados (Lei 5.010, art. 62, IV)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Resolução Administrativa TRT3 109/2025",
    "fonte": "trt3-ra-109-2025"
  },
  {
    "tribunais": [
      "TRT3"
    ],
    "inicio": "2026-12-08",
    "fim": "2026-12-08",
    "nome": "Dia da Justiça (Lei 5.010, art. 62, IV)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Resolução Administrativa TRT3 109/2025",
    "fonte": "trt3-ra-109-2025"
  },
  {
    "tribunais": [
      "TRT3"
    ],
    "inicio": "2026-12-20",
    "fim": "2026-12-31",
    "nome": "Recesso forense (Lei 5.010, art. 62, I)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Resolução Administrativa TRT3 109/2025",
    "fonte": "trt3-ra-109-2025"
  },
  {
    "tribunais": [
      "TRT5"
    ],
    "inicio": "2026-01-02",
    "fim": "2026-01-06",
    "nome": "Recesso forense",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Resolução Administrativa TRT5 037/2025, Anexo (feriados comuns a toda a região)",
    "fonte": "trt5-ra-37-2025"
  },
  {
    "tribunais": [
      "TRT5"
    ],
    "inicio": "2026-02-16",
    "fim": "2026-02-17",
    "nome": "Carnaval",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Resolução Administrativa TRT5 037/2025, Anexo (feriados comuns a toda a região)",
    "fonte": "trt5-ra-37-2025"
  },
  {
    "tribunais": [
      "TRT5"
    ],
    "inicio": "2026-02-18",
    "fim": "2026-02-18",
    "nome": "Quarta-feira de Cinzas",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Resolução Administrativa TRT5 037/2025, Anexo (feriados comuns a toda a região)",
    "fonte": "trt5-ra-37-2025"
  },
  {
    "tribunais": [
      "TRT5"
    ],
    "inicio": "2026-04-01",
    "fim": "2026-04-05",
    "nome": "Semana Santa",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Resolução Administrativa TRT5 037/2025, Anexo (feriados comuns a toda a região)",
    "fonte": "trt5-ra-37-2025"
  },
  {
    "tribunais": [
      "TRT5"
    ],
    "inicio": "2026-04-20",
    "fim": "2026-04-20",
    "nome": "Ponto facultativo com suspensão do expediente e dos prazos",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato GP TRT5 16/2026, art. 2º",
    "fonte": "trt5-ra-37-2025"
  },
  {
    "tribunais": [
      "TRT5"
    ],
    "inicio": "2026-06-04",
    "fim": "2026-06-04",
    "nome": "Corpus Christi",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Resolução Administrativa TRT5 037/2025, Anexo (feriados comuns a toda a região)",
    "fonte": "trt5-ra-37-2025"
  },
  {
    "tribunais": [
      "TRT5"
    ],
    "inicio": "2026-06-05",
    "fim": "2026-06-05",
    "nome": "Ponto facultativo com suspensão do expediente e dos prazos",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato GP TRT5 16/2026, art. 2º",
    "fonte": "trt5-ra-37-2025"
  },
  {
    "tribunais": [
      "TRT5"
    ],
    "inicio": "2026-06-23",
    "fim": "2026-06-23",
    "nome": "Véspera de São João",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Resolução Administrativa TRT5 037/2025, Anexo (feriados comuns a toda a região)",
    "fonte": "trt5-ra-37-2025"
  },
  {
    "tribunais": [
      "TRT5"
    ],
    "inicio": "2026-06-24",
    "fim": "2026-06-24",
    "nome": "São João",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Resolução Administrativa TRT5 037/2025, Anexo (feriados comuns a toda a região)",
    "fonte": "trt5-ra-37-2025"
  },
  {
    "tribunais": [
      "TRT5"
    ],
    "inicio": "2026-07-02",
    "fim": "2026-07-02",
    "nome": "Independência da Bahia",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Resolução Administrativa TRT5 037/2025, Anexo (feriados comuns a toda a região)",
    "fonte": "trt5-ra-37-2025"
  },
  {
    "tribunais": [
      "TRT5"
    ],
    "inicio": "2026-07-03",
    "fim": "2026-07-03",
    "nome": "Ponto facultativo com suspensão do expediente e dos prazos",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato GP TRT5 16/2026, art. 2º",
    "fonte": "trt5-ra-37-2025"
  },
  {
    "tribunais": [
      "TRT5"
    ],
    "inicio": "2026-08-10",
    "fim": "2026-08-10",
    "nome": "Ponto facultativo com suspensão do expediente e dos prazos",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato GP TRT5 16/2026, art. 2º",
    "fonte": "trt5-ra-37-2025"
  },
  {
    "tribunais": [
      "TRT5"
    ],
    "inicio": "2026-08-11",
    "fim": "2026-08-11",
    "nome": "Dia do Magistrado",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Resolução Administrativa TRT5 037/2025, Anexo (feriados comuns a toda a região)",
    "fonte": "trt5-ra-37-2025"
  },
  {
    "tribunais": [
      "TRT5"
    ],
    "inicio": "2026-10-30",
    "fim": "2026-10-30",
    "nome": "Dia do Servidor Público (transferido de 28/10)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato GP TRT5 16/2026, art. 1º",
    "fonte": "trt5-ra-37-2025"
  },
  {
    "tribunais": [
      "TRT5"
    ],
    "inicio": "2026-11-01",
    "fim": "2026-11-02",
    "nome": "Todos os Santos e Finados",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Resolução Administrativa TRT5 037/2025, Anexo (feriados comuns a toda a região)",
    "fonte": "trt5-ra-37-2025"
  },
  {
    "tribunais": [
      "TRT5"
    ],
    "inicio": "2026-12-07",
    "fim": "2026-12-07",
    "nome": "Ponto facultativo com suspensão do expediente e dos prazos",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato GP TRT5 16/2026, art. 2º",
    "fonte": "trt5-ra-37-2025"
  },
  {
    "tribunais": [
      "TRT5"
    ],
    "inicio": "2026-12-08",
    "fim": "2026-12-08",
    "nome": "Padroeira do Estado da Bahia e feriado forense",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Resolução Administrativa TRT5 037/2025, Anexo (feriados comuns a toda a região)",
    "fonte": "trt5-ra-37-2025"
  },
  {
    "tribunais": [
      "TRT5"
    ],
    "inicio": "2026-12-20",
    "fim": "2026-12-31",
    "nome": "Recesso forense",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Resolução Administrativa TRT5 037/2025, Anexo (feriados comuns a toda a região)",
    "fonte": "trt5-ra-37-2025"
  },
  {
    "tribunais": [
      "TRT8"
    ],
    "inicio": "2026-01-02",
    "fim": "2026-01-06",
    "nome": "Recesso forense (Lei 5.010, art. 62, I)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT8 (Portaria PRESI 1200/2025)",
    "fonte": "trt8-calendario-2026"
  },
  {
    "tribunais": [
      "TRT8"
    ],
    "inicio": "2026-02-16",
    "fim": "2026-02-17",
    "nome": "Carnaval",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT8 (Portaria PRESI 1200/2025)",
    "fonte": "trt8-calendario-2026"
  },
  {
    "tribunais": [
      "TRT8"
    ],
    "inicio": "2026-02-18",
    "fim": "2026-02-18",
    "nome": "Quarta-feira de Cinzas (ponto facultativo, PROAD 7958/2025): só alerta",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT8 (PROAD 7958/2025)",
    "fonte": "trt8-calendario-2026"
  },
  {
    "tribunais": [
      "TRT8"
    ],
    "inicio": "2026-04-01",
    "fim": "2026-04-03",
    "nome": "Semana Santa",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT8 (Portaria PRESI 1200/2025)",
    "fonte": "trt8-calendario-2026"
  },
  {
    "tribunais": [
      "TRT8"
    ],
    "inicio": "2026-04-20",
    "fim": "2026-04-20",
    "nome": "Suspensão de expediente (Portaria 1200/2025)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT8 (Portaria PRESI 1200/2025)",
    "fonte": "trt8-calendario-2026"
  },
  {
    "tribunais": [
      "TRT8"
    ],
    "inicio": "2026-06-05",
    "fim": "2026-06-05",
    "nome": "Suspensão de expediente (Portaria 1200/2025)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT8 (Portaria PRESI 1200/2025)",
    "fonte": "trt8-calendario-2026"
  },
  {
    "tribunais": [
      "TRT8"
    ],
    "inicio": "2026-08-10",
    "fim": "2026-08-10",
    "nome": "Suspensão de expediente (Portaria 1200/2025)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT8 (Portaria PRESI 1200/2025)",
    "fonte": "trt8-calendario-2026"
  },
  {
    "tribunais": [
      "TRT8"
    ],
    "inicio": "2026-08-11",
    "fim": "2026-08-11",
    "nome": "Instalação dos Cursos Jurídicos (Lei 5.010, art. 62, IV)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT8 (Portaria PRESI 1200/2025)",
    "fonte": "trt8-calendario-2026"
  },
  {
    "tribunais": [
      "TRT8"
    ],
    "inicio": "2026-10-30",
    "fim": "2026-10-30",
    "nome": "Dia do Servidor Público (transferido de 28/10)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT8 (Portaria PRESI 1200/2025)",
    "fonte": "trt8-calendario-2026"
  },
  {
    "tribunais": [
      "TRT8"
    ],
    "inicio": "2026-11-01",
    "fim": "2026-11-02",
    "nome": "Todos os Santos e Finados (Lei 5.010, art. 62, IV)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT8 (Portaria PRESI 1200/2025)",
    "fonte": "trt8-calendario-2026"
  },
  {
    "tribunais": [
      "TRT8"
    ],
    "inicio": "2026-12-07",
    "fim": "2026-12-07",
    "nome": "Suspensão de expediente (Portaria 1200/2025)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT8 (Portaria PRESI 1200/2025)",
    "fonte": "trt8-calendario-2026"
  },
  {
    "tribunais": [
      "TRT8"
    ],
    "inicio": "2026-12-08",
    "fim": "2026-12-08",
    "nome": "Dia da Justiça (Lei 5.010, art. 62, IV)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT8 (Portaria PRESI 1200/2025)",
    "fonte": "trt8-calendario-2026"
  },
  {
    "tribunais": [
      "TRT8"
    ],
    "inicio": "2026-12-20",
    "fim": "2026-12-31",
    "nome": "Recesso forense (Lei 5.010, art. 62, I)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT8 (Portaria PRESI 1200/2025)",
    "fonte": "trt8-calendario-2026"
  },
  {
    "tribunais": [
      "TRT10"
    ],
    "inicio": "2026-01-02",
    "fim": "2026-01-06",
    "nome": "Recesso forense (Lei 5.010, art. 62, I)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT10",
    "fonte": "trt10-calendario-2026"
  },
  {
    "tribunais": [
      "TRT10"
    ],
    "inicio": "2026-02-16",
    "fim": "2026-02-17",
    "nome": "Carnaval",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT10",
    "fonte": "trt10-calendario-2026"
  },
  {
    "tribunais": [
      "TRT10"
    ],
    "inicio": "2026-04-01",
    "fim": "2026-04-05",
    "nome": "Semana Santa",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT10",
    "fonte": "trt10-calendario-2026"
  },
  {
    "tribunais": [
      "TRT10"
    ],
    "inicio": "2026-06-04",
    "fim": "2026-06-04",
    "nome": "Corpus Christi",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT10",
    "fonte": "trt10-calendario-2026"
  },
  {
    "tribunais": [
      "TRT10"
    ],
    "inicio": "2026-08-11",
    "fim": "2026-08-11",
    "nome": "Instalação dos Cursos Jurídicos e Dia do Advogado",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT10",
    "fonte": "trt10-calendario-2026"
  },
  {
    "tribunais": [
      "TRT10"
    ],
    "inicio": "2026-10-28",
    "fim": "2026-10-28",
    "nome": "Dia do Servidor Público (o calendário não o transfere; TST e outros TRTs o transferiram para 30/10): só alerta",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT10",
    "fonte": "trt10-calendario-2026"
  },
  {
    "tribunais": [
      "TRT10"
    ],
    "inicio": "2026-10-30",
    "fim": "2026-10-30",
    "nome": "Possível transferência do Dia do Servidor Público (ato não lido): só alerta",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT10",
    "fonte": "trt10-calendario-2026"
  },
  {
    "tribunais": [
      "TRT10"
    ],
    "inicio": "2026-11-01",
    "fim": "2026-11-02",
    "nome": "Todos os Santos e Finados",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT10",
    "fonte": "trt10-calendario-2026"
  },
  {
    "tribunais": [
      "TRT10"
    ],
    "inicio": "2026-12-08",
    "fim": "2026-12-08",
    "nome": "Dia da Justiça",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT10",
    "fonte": "trt10-calendario-2026"
  },
  {
    "tribunais": [
      "TRT10"
    ],
    "inicio": "2026-12-20",
    "fim": "2026-12-31",
    "nome": "Recesso forense (Lei 5.010, art. 62, I)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT10",
    "fonte": "trt10-calendario-2026"
  },
  {
    "tribunais": [
      "TRT14"
    ],
    "inicio": "2026-01-02",
    "fim": "2026-01-06",
    "nome": "Recesso forense (regimental)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP TRT14 1640/2025, Anexo Único",
    "fonte": "trt14-portaria-gp-1640-2025"
  },
  {
    "tribunais": [
      "TRT14"
    ],
    "inicio": "2026-01-23",
    "fim": "2026-01-23",
    "nome": "Dia do Evangélico no Estado do Acre (só nas unidades do Acre): só alerta",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP TRT14 1640/2025, Anexo Único",
    "fonte": "trt14-portaria-gp-1640-2025"
  },
  {
    "tribunais": [
      "TRT14"
    ],
    "inicio": "2026-02-16",
    "fim": "2026-02-16",
    "nome": "Feriado regimental (Carnaval)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP TRT14 1640/2025, Anexo Único",
    "fonte": "trt14-portaria-gp-1640-2025"
  },
  {
    "tribunais": [
      "TRT14"
    ],
    "inicio": "2026-02-17",
    "fim": "2026-02-17",
    "nome": "Carnaval",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP TRT14 1640/2025, Anexo Único",
    "fonte": "trt14-portaria-gp-1640-2025"
  },
  {
    "tribunais": [
      "TRT14"
    ],
    "inicio": "2026-02-18",
    "fim": "2026-02-18",
    "nome": "Quarta-feira de Cinzas (regimental)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP TRT14 1640/2025, Anexo Único",
    "fonte": "trt14-portaria-gp-1640-2025"
  },
  {
    "tribunais": [
      "TRT14"
    ],
    "inicio": "2026-04-01",
    "fim": "2026-04-03",
    "nome": "Semana Santa (Quarta e Quinta Santa regimentais; Sexta-feira da Paixão)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP TRT14 1640/2025, Anexo Único",
    "fonte": "trt14-portaria-gp-1640-2025"
  },
  {
    "tribunais": [
      "TRT14"
    ],
    "inicio": "2026-06-04",
    "fim": "2026-06-04",
    "nome": "Corpus Christi",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP TRT14 1640/2025, Anexo Único",
    "fonte": "trt14-portaria-gp-1640-2025"
  },
  {
    "tribunais": [
      "TRT14"
    ],
    "inicio": "2026-06-05",
    "fim": "2026-06-05",
    "nome": "Ponto facultativo (plantão; prazos prorrogados, Portaria GP 550/2026)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP TRT14 550/2026 (notícia oficial)",
    "fonte": "trt14-portaria-gp-550-2026"
  },
  {
    "tribunais": [
      "TRT14"
    ],
    "inicio": "2026-08-11",
    "fim": "2026-08-11",
    "nome": "Criação dos Cursos Jurídicos, da Magistratura e do Advogado (regimental)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP TRT14 1640/2025, Anexo Único",
    "fonte": "trt14-portaria-gp-1640-2025"
  },
  {
    "tribunais": [
      "TRT14"
    ],
    "inicio": "2026-10-30",
    "fim": "2026-10-30",
    "nome": "Dia do Servidor Público (transferido de 28/10)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP TRT14 1640/2025, Anexo Único",
    "fonte": "trt14-portaria-gp-1640-2025"
  },
  {
    "tribunais": [
      "TRT14"
    ],
    "inicio": "2026-11-17",
    "fim": "2026-11-17",
    "nome": "Tratado de Petrópolis (feriado do Estado do Acre, só nas unidades do Acre): só alerta",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP TRT14 1640/2025, Anexo Único",
    "fonte": "trt14-portaria-gp-1640-2025"
  },
  {
    "tribunais": [
      "TRT14"
    ],
    "inicio": "2026-12-08",
    "fim": "2026-12-08",
    "nome": "Dia da Justiça (regimental)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP TRT14 1640/2025, Anexo Único",
    "fonte": "trt14-portaria-gp-1640-2025"
  },
  {
    "tribunais": [
      "TRT14"
    ],
    "inicio": "2026-12-20",
    "fim": "2026-12-31",
    "nome": "Recesso forense (regimental)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP TRT14 1640/2025, Anexo Único",
    "fonte": "trt14-portaria-gp-1640-2025"
  },
  {
    "tribunais": [
      "TRT19"
    ],
    "inicio": "2026-01-02",
    "fim": "2026-01-06",
    "nome": "Recesso forense (Lei 5.010)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato 170/GP/TRT 19ª de 2025",
    "fonte": "trt19-ato-170-2025"
  },
  {
    "tribunais": [
      "TRT19"
    ],
    "inicio": "2026-02-16",
    "fim": "2026-02-17",
    "nome": "Carnaval",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato 170/GP/TRT 19ª de 2025",
    "fonte": "trt19-ato-170-2025"
  },
  {
    "tribunais": [
      "TRT19"
    ],
    "inicio": "2026-02-18",
    "fim": "2026-02-18",
    "nome": "Cinzas",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato 170/GP/TRT 19ª de 2025",
    "fonte": "trt19-ato-170-2025"
  },
  {
    "tribunais": [
      "TRT19"
    ],
    "inicio": "2026-04-01",
    "fim": "2026-04-03",
    "nome": "Semana Santa",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato 170/GP/TRT 19ª de 2025",
    "fonte": "trt19-ato-170-2025"
  },
  {
    "tribunais": [
      "TRT19"
    ],
    "inicio": "2026-04-20",
    "fim": "2026-04-20",
    "nome": "Ponto facultativo (Ato 170/2025): só alerta",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato 170/GP/TRT 19ª de 2025",
    "fonte": "trt19-ato-170-2025"
  },
  {
    "tribunais": [
      "TRT19"
    ],
    "inicio": "2026-06-04",
    "fim": "2026-06-04",
    "nome": "Corpus Christi",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato 170/GP/TRT 19ª de 2025",
    "fonte": "trt19-ato-170-2025"
  },
  {
    "tribunais": [
      "TRT19"
    ],
    "inicio": "2026-06-05",
    "fim": "2026-06-05",
    "nome": "Ponto facultativo (Ato 170/2025): só alerta",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato 170/GP/TRT 19ª de 2025",
    "fonte": "trt19-ato-170-2025"
  },
  {
    "tribunais": [
      "TRT19"
    ],
    "inicio": "2026-06-24",
    "fim": "2026-06-24",
    "nome": "São João (Lei estadual 5.508/1993)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato 170/GP/TRT 19ª de 2025",
    "fonte": "trt19-ato-170-2025"
  },
  {
    "tribunais": [
      "TRT19"
    ],
    "inicio": "2026-06-29",
    "fim": "2026-06-29",
    "nome": "São Pedro (Lei estadual 5.509/1993)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato 170/GP/TRT 19ª de 2025",
    "fonte": "trt19-ato-170-2025"
  },
  {
    "tribunais": [
      "TRT19"
    ],
    "inicio": "2026-08-10",
    "fim": "2026-08-10",
    "nome": "Ponto facultativo (Ato 170/2025): só alerta",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato 170/GP/TRT 19ª de 2025",
    "fonte": "trt19-ato-170-2025"
  },
  {
    "tribunais": [
      "TRT19"
    ],
    "inicio": "2026-08-11",
    "fim": "2026-08-11",
    "nome": "Criação dos Cursos Jurídicos, Dia da Magistratura e do Advogado",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato 170/GP/TRT 19ª de 2025",
    "fonte": "trt19-ato-170-2025"
  },
  {
    "tribunais": [
      "TRT19"
    ],
    "inicio": "2026-09-16",
    "fim": "2026-09-16",
    "nome": "Emancipação Política do Estado de Alagoas",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato 170/GP/TRT 19ª de 2025",
    "fonte": "trt19-ato-170-2025"
  },
  {
    "tribunais": [
      "TRT19"
    ],
    "inicio": "2026-10-30",
    "fim": "2026-10-30",
    "nome": "Transferência do Dia do Servidor Público (28/10)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato 170/GP/TRT 19ª de 2025",
    "fonte": "trt19-ato-170-2025"
  },
  {
    "tribunais": [
      "TRT19"
    ],
    "inicio": "2026-12-07",
    "fim": "2026-12-07",
    "nome": "Ponto facultativo (Ato 170/2025): só alerta",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato 170/GP/TRT 19ª de 2025",
    "fonte": "trt19-ato-170-2025"
  },
  {
    "tribunais": [
      "TRT19"
    ],
    "inicio": "2026-12-08",
    "fim": "2026-12-08",
    "nome": "Dia da Justiça",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato 170/GP/TRT 19ª de 2025",
    "fonte": "trt19-ato-170-2025"
  },
  {
    "tribunais": [
      "TRT19"
    ],
    "inicio": "2026-12-20",
    "fim": "2026-12-31",
    "nome": "Recesso forense (Lei 5.010)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato 170/GP/TRT 19ª de 2025",
    "fonte": "trt19-ato-170-2025"
  },
  {
    "tribunais": [
      "TRT20"
    ],
    "inicio": "2026-01-02",
    "fim": "2026-01-06",
    "nome": "Recesso forense (Lei 5.010)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT20",
    "fonte": "trt20-calendario-2026"
  },
  {
    "tribunais": [
      "TRT20"
    ],
    "inicio": "2026-02-16",
    "fim": "2026-02-17",
    "nome": "Carnaval",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT20",
    "fonte": "trt20-calendario-2026"
  },
  {
    "tribunais": [
      "TRT20"
    ],
    "inicio": "2026-02-18",
    "fim": "2026-02-18",
    "nome": "Quarta-feira de Cinzas (feriado regimental)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT20",
    "fonte": "trt20-calendario-2026"
  },
  {
    "tribunais": [
      "TRT20"
    ],
    "inicio": "2026-04-01",
    "fim": "2026-04-03",
    "nome": "Semana Santa",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT20",
    "fonte": "trt20-calendario-2026"
  },
  {
    "tribunais": [
      "TRT20"
    ],
    "inicio": "2026-04-20",
    "fim": "2026-04-20",
    "nome": "Ponto facultativo: só alerta",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT20",
    "fonte": "trt20-calendario-2026"
  },
  {
    "tribunais": [
      "TRT20"
    ],
    "inicio": "2026-06-04",
    "fim": "2026-06-04",
    "nome": "Corpus Christi",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT20",
    "fonte": "trt20-calendario-2026"
  },
  {
    "tribunais": [
      "TRT20"
    ],
    "inicio": "2026-06-05",
    "fim": "2026-06-05",
    "nome": "Ponto facultativo: só alerta",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT20",
    "fonte": "trt20-calendario-2026"
  },
  {
    "tribunais": [
      "TRT20"
    ],
    "inicio": "2026-06-24",
    "fim": "2026-06-24",
    "nome": "São João",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT20",
    "fonte": "trt20-calendario-2026"
  },
  {
    "tribunais": [
      "TRT20"
    ],
    "inicio": "2026-07-08",
    "fim": "2026-07-08",
    "nome": "Independência de Sergipe (Constituição do Estado)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT20",
    "fonte": "trt20-calendario-2026"
  },
  {
    "tribunais": [
      "TRT20"
    ],
    "inicio": "2026-08-10",
    "fim": "2026-08-10",
    "nome": "Ponto facultativo: só alerta",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT20",
    "fonte": "trt20-calendario-2026"
  },
  {
    "tribunais": [
      "TRT20"
    ],
    "inicio": "2026-08-11",
    "fim": "2026-08-11",
    "nome": "Dia do Magistrado (Lei 5.010)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT20",
    "fonte": "trt20-calendario-2026"
  },
  {
    "tribunais": [
      "TRT20"
    ],
    "inicio": "2026-10-30",
    "fim": "2026-10-30",
    "nome": "Dia do Servidor Público (remanejado de 28/10)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT20",
    "fonte": "trt20-calendario-2026"
  },
  {
    "tribunais": [
      "TRT20"
    ],
    "inicio": "2026-12-07",
    "fim": "2026-12-07",
    "nome": "Ponto facultativo: só alerta",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT20",
    "fonte": "trt20-calendario-2026"
  },
  {
    "tribunais": [
      "TRT20"
    ],
    "inicio": "2026-12-08",
    "fim": "2026-12-08",
    "nome": "Nossa Senhora da Conceição (Lei 5.010, Dia da Justiça)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT20",
    "fonte": "trt20-calendario-2026"
  },
  {
    "tribunais": [
      "TRT20"
    ],
    "inicio": "2026-12-20",
    "fim": "2026-12-31",
    "nome": "Recesso forense (Lei 5.010)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT20",
    "fonte": "trt20-calendario-2026"
  },
  {
    "tribunais": [
      "TRT23"
    ],
    "inicio": "2026-01-02",
    "fim": "2026-01-06",
    "nome": "Recesso forense (regimental)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria Conjunta TRT CORREG GP 007/2026, Calendário 2026",
    "fonte": "trt23-portaria-conjunta-007-2026"
  },
  {
    "tribunais": [
      "TRT23"
    ],
    "inicio": "2026-02-16",
    "fim": "2026-02-18",
    "nome": "Carnaval (regimental)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria Conjunta TRT CORREG GP 007/2026, Calendário 2026",
    "fonte": "trt23-portaria-conjunta-007-2026"
  },
  {
    "tribunais": [
      "TRT23"
    ],
    "inicio": "2026-04-01",
    "fim": "2026-04-05",
    "nome": "Semana Santa (regimental)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria Conjunta TRT CORREG GP 007/2026, Calendário 2026",
    "fonte": "trt23-portaria-conjunta-007-2026"
  },
  {
    "tribunais": [
      "TRT23"
    ],
    "inicio": "2026-06-04",
    "fim": "2026-06-04",
    "nome": "Corpus Christi (regimental)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria Conjunta TRT CORREG GP 007/2026, Calendário 2026",
    "fonte": "trt23-portaria-conjunta-007-2026"
  },
  {
    "tribunais": [
      "TRT23"
    ],
    "inicio": "2026-08-11",
    "fim": "2026-08-11",
    "nome": "Dia do Advogado (regimental)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria Conjunta TRT CORREG GP 007/2026, Calendário 2026",
    "fonte": "trt23-portaria-conjunta-007-2026"
  },
  {
    "tribunais": [
      "TRT23"
    ],
    "inicio": "2026-10-28",
    "fim": "2026-10-28",
    "nome": "Suspensão de prazo (Portaria Conjunta 007/2026)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria Conjunta TRT CORREG GP 007/2026, Calendário 2026",
    "fonte": "trt23-portaria-conjunta-007-2026"
  },
  {
    "tribunais": [
      "TRT23"
    ],
    "inicio": "2026-10-30",
    "fim": "2026-10-30",
    "nome": "Dia do Servidor Público (regimental)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria Conjunta TRT CORREG GP 007/2026, Calendário 2026",
    "fonte": "trt23-portaria-conjunta-007-2026"
  },
  {
    "tribunais": [
      "TRT23"
    ],
    "inicio": "2026-11-01",
    "fim": "2026-11-02",
    "nome": "Todos os Santos (regimental) e Finados",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria Conjunta TRT CORREG GP 007/2026, Calendário 2026",
    "fonte": "trt23-portaria-conjunta-007-2026"
  },
  {
    "tribunais": [
      "TRT23"
    ],
    "inicio": "2026-11-20",
    "fim": "2026-11-20",
    "nome": "Dia Nacional de Zumbi dos Palmares e da Consciência Negra",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria Conjunta TRT CORREG GP 007/2026, Calendário 2026",
    "fonte": "trt23-portaria-conjunta-007-2026"
  },
  {
    "tribunais": [
      "TRT23"
    ],
    "inicio": "2026-12-08",
    "fim": "2026-12-08",
    "nome": "Dia da Justiça (regimental)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria Conjunta TRT CORREG GP 007/2026, Calendário 2026",
    "fonte": "trt23-portaria-conjunta-007-2026"
  },
  {
    "tribunais": [
      "TRT23"
    ],
    "inicio": "2026-12-20",
    "fim": "2026-12-31",
    "nome": "Recesso forense (regimental)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria Conjunta TRT CORREG GP 007/2026, Calendário 2026",
    "fonte": "trt23-portaria-conjunta-007-2026"
  },
  {
    "tribunais": [
      "TRT16"
    ],
    "inicio": "2026-01-02",
    "fim": "2026-01-06",
    "nome": "Recesso forense",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP/TRT16 681/2025 e Calendário Institucional de 2026",
    "fonte": "trt16-portaria-gp-681-2025"
  },
  {
    "tribunais": [
      "TRT16"
    ],
    "inicio": "2026-02-16",
    "fim": "2026-02-18",
    "nome": "Carnaval (segunda, terça e quarta-feira)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP/TRT16 681/2025 e Calendário Institucional de 2026",
    "fonte": "trt16-portaria-gp-681-2025"
  },
  {
    "tribunais": [
      "TRT16"
    ],
    "inicio": "2026-04-01",
    "fim": "2026-04-03",
    "nome": "Semana Santa",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP/TRT16 681/2025 e Calendário Institucional de 2026",
    "fonte": "trt16-portaria-gp-681-2025"
  },
  {
    "tribunais": [
      "TRT16"
    ],
    "inicio": "2026-04-20",
    "fim": "2026-04-20",
    "nome": "Ponto facultativo com suspensão do expediente e dos prazos",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP/TRT16 681/2025, art. 2º",
    "fonte": "trt16-portaria-gp-681-2025"
  },
  {
    "tribunais": [
      "TRT16"
    ],
    "inicio": "2026-06-04",
    "fim": "2026-06-04",
    "nome": "Corpus Christi",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP/TRT16 681/2025 e Calendário Institucional de 2026",
    "fonte": "trt16-portaria-gp-681-2025"
  },
  {
    "tribunais": [
      "TRT16"
    ],
    "inicio": "2026-06-05",
    "fim": "2026-06-05",
    "nome": "Ponto facultativo com suspensão do expediente e dos prazos",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP/TRT16 681/2025, art. 2º",
    "fonte": "trt16-portaria-gp-681-2025"
  },
  {
    "tribunais": [
      "TRT16"
    ],
    "inicio": "2026-07-27",
    "fim": "2026-07-27",
    "nome": "Adesão do Maranhão à Independência (feriado transferido de 28/07)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP/TRT16 681/2025, art. 3º",
    "fonte": "trt16-portaria-gp-681-2025"
  },
  {
    "tribunais": [
      "TRT16"
    ],
    "inicio": "2026-08-10",
    "fim": "2026-08-10",
    "nome": "Criação dos Cursos Jurídicos (feriado transferido de 11/08)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP/TRT16 681/2025, art. 3º",
    "fonte": "trt16-portaria-gp-681-2025"
  },
  {
    "tribunais": [
      "TRT16"
    ],
    "inicio": "2026-10-30",
    "fim": "2026-10-30",
    "nome": "Dia do Servidor Público (feriado transferido de 28/10)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP/TRT16 681/2025, art. 3º",
    "fonte": "trt16-portaria-gp-681-2025"
  },
  {
    "tribunais": [
      "TRT16"
    ],
    "inicio": "2026-12-07",
    "fim": "2026-12-07",
    "nome": "Ponto facultativo com suspensão do expediente e dos prazos",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP/TRT16 681/2025, art. 2º",
    "fonte": "trt16-portaria-gp-681-2025"
  },
  {
    "tribunais": [
      "TRT16"
    ],
    "inicio": "2026-12-08",
    "fim": "2026-12-08",
    "nome": "Nossa Senhora da Conceição e Dia da Justiça",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP/TRT16 681/2025 e Calendário Institucional de 2026",
    "fonte": "trt16-portaria-gp-681-2025"
  },
  {
    "tribunais": [
      "TRT16"
    ],
    "inicio": "2026-12-20",
    "fim": "2026-12-31",
    "nome": "Recesso forense",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Portaria GP/TRT16 681/2025 e Calendário Institucional de 2026",
    "fonte": "trt16-portaria-gp-681-2025"
  },
  {
    "tribunais": [
      "TRT24"
    ],
    "inicio": "2026-01-02",
    "fim": "2026-01-06",
    "nome": "Recesso forense (padrão do art. 62, I, da Lei 5.010)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT24 (Portaria TRT/GP/SGJ 51/2025)",
    "fonte": "trt24-calendario-2026"
  },
  {
    "tribunais": [
      "TRT24"
    ],
    "inicio": "2026-02-16",
    "fim": "2026-02-17",
    "nome": "Carnaval (Lei 5.010, art. 62, III)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT24 (Portaria TRT/GP/SGJ 51/2025)",
    "fonte": "trt24-calendario-2026"
  },
  {
    "tribunais": [
      "TRT24"
    ],
    "inicio": "2026-02-18",
    "fim": "2026-02-18",
    "nome": "Quarta-feira de Cinzas (suspensão do expediente até as 13h)",
    "efeito": "expediente_parcial",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT24 (Portaria TRT/GP/SGJ 51/2025)",
    "fonte": "trt24-calendario-2026"
  },
  {
    "tribunais": [
      "TRT24"
    ],
    "inicio": "2026-04-01",
    "fim": "2026-04-03",
    "nome": "Semana Santa (Lei 5.010, art. 62, II)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT24 (Portaria TRT/GP/SGJ 51/2025)",
    "fonte": "trt24-calendario-2026"
  },
  {
    "tribunais": [
      "TRT24"
    ],
    "inicio": "2026-04-20",
    "fim": "2026-04-20",
    "nome": "Suspensão do expediente (Portaria 51/2025)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT24 (Portaria TRT/GP/SGJ 51/2025)",
    "fonte": "trt24-calendario-2026"
  },
  {
    "tribunais": [
      "TRT24"
    ],
    "inicio": "2026-06-04",
    "fim": "2026-06-04",
    "nome": "Corpus Christi (Lei 9.093/1995; Lei municipal 1.019/1967)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT24 (Portaria TRT/GP/SGJ 51/2025)",
    "fonte": "trt24-calendario-2026"
  },
  {
    "tribunais": [
      "TRT24"
    ],
    "inicio": "2026-06-05",
    "fim": "2026-06-05",
    "nome": "Suspensão do expediente (Portaria 51/2025)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT24 (Portaria TRT/GP/SGJ 51/2025)",
    "fonte": "trt24-calendario-2026"
  },
  {
    "tribunais": [
      "TRT24"
    ],
    "inicio": "2026-08-10",
    "fim": "2026-08-10",
    "nome": "Suspensão do expediente (Portaria 51/2025)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT24 (Portaria TRT/GP/SGJ 51/2025)",
    "fonte": "trt24-calendario-2026"
  },
  {
    "tribunais": [
      "TRT24"
    ],
    "inicio": "2026-08-11",
    "fim": "2026-08-11",
    "nome": "Criação dos Cursos Jurídicos (Lei 5.010, art. 62, IV)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT24 (Portaria TRT/GP/SGJ 51/2025)",
    "fonte": "trt24-calendario-2026"
  },
  {
    "tribunais": [
      "TRT24"
    ],
    "inicio": "2026-10-30",
    "fim": "2026-10-30",
    "nome": "Dia do Servidor Público (transferido de 28/10)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT24 (Portaria TRT/GP/SGJ 51/2025)",
    "fonte": "trt24-calendario-2026"
  },
  {
    "tribunais": [
      "TRT24"
    ],
    "inicio": "2026-11-01",
    "fim": "2026-11-02",
    "nome": "Todos os Santos e Finados (Lei 5.010, art. 62, IV)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT24 (Portaria TRT/GP/SGJ 51/2025)",
    "fonte": "trt24-calendario-2026"
  },
  {
    "tribunais": [
      "TRT24"
    ],
    "inicio": "2026-12-07",
    "fim": "2026-12-07",
    "nome": "Suspensão do expediente (a legenda traz \"07 de novembro\"): só alerta",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT24 (Portaria TRT/GP/SGJ 51/2025)",
    "fonte": "trt24-calendario-2026"
  },
  {
    "tribunais": [
      "TRT24"
    ],
    "inicio": "2026-12-08",
    "fim": "2026-12-08",
    "nome": "Dia da Justiça (Lei 5.010, art. 62, IV)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT24 (Portaria TRT/GP/SGJ 51/2025)",
    "fonte": "trt24-calendario-2026"
  },
  {
    "tribunais": [
      "TRT24"
    ],
    "inicio": "2026-12-20",
    "fim": "2026-12-31",
    "nome": "Recesso forense (padrão do art. 62, I, da Lei 5.010)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT24 (Portaria TRT/GP/SGJ 51/2025)",
    "fonte": "trt24-calendario-2026"
  },
  {
    "tribunais": [
      "TRT22"
    ],
    "inicio": "2026-01-02",
    "fim": "2026-01-06",
    "nome": "Recesso forense (Lei 5.010, art. 62, I)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato GP TRT22 184/2025 (calendário 2026)",
    "fonte": "trt22-ato-gp-184-2025"
  },
  {
    "tribunais": [
      "TRT22"
    ],
    "inicio": "2026-02-16",
    "fim": "2026-02-17",
    "nome": "Carnaval (Lei 5.010, art. 62, III)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato GP TRT22 184/2025 (calendário 2026)",
    "fonte": "trt22-ato-gp-184-2025"
  },
  {
    "tribunais": [
      "TRT22"
    ],
    "inicio": "2026-02-18",
    "fim": "2026-02-18",
    "nome": "Quarta-feira de Cinzas (suspensão excepcional das atividades)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato GP TRT22 184/2025 (calendário 2026)",
    "fonte": "trt22-ato-gp-184-2025"
  },
  {
    "tribunais": [
      "TRT22"
    ],
    "inicio": "2026-04-01",
    "fim": "2026-04-03",
    "nome": "Semana Santa (Lei 5.010, art. 62, II)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato GP TRT22 184/2025 (calendário 2026)",
    "fonte": "trt22-ato-gp-184-2025"
  },
  {
    "tribunais": [
      "TRT22"
    ],
    "inicio": "2026-05-11",
    "fim": "2026-05-15",
    "nome": "Semana Institucional (prazos suspensos, Ato GP 185/2025)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato GP TRT22 185/2025",
    "fonte": "trt22-ato-gp-184-2025"
  },
  {
    "tribunais": [
      "TRT22"
    ],
    "inicio": "2026-06-04",
    "fim": "2026-06-04",
    "nome": "Corpus Christi",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato GP TRT22 184/2025 (calendário 2026)",
    "fonte": "trt22-ato-gp-184-2025"
  },
  {
    "tribunais": [
      "TRT22"
    ],
    "inicio": "2026-08-11",
    "fim": "2026-08-11",
    "nome": "Criação dos Cursos Jurídicos, Dia do Advogado e do Magistrado (Lei 5.010, art. 62, IV)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato GP TRT22 184/2025 (calendário 2026)",
    "fonte": "trt22-ato-gp-184-2025"
  },
  {
    "tribunais": [
      "TRT22"
    ],
    "inicio": "2026-09-14",
    "fim": "2026-09-18",
    "nome": "Semana Institucional (prazos suspensos, Ato GP 185/2025)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato GP TRT22 185/2025",
    "fonte": "trt22-ato-gp-184-2025"
  },
  {
    "tribunais": [
      "TRT22"
    ],
    "inicio": "2026-10-19",
    "fim": "2026-10-19",
    "nome": "Dia do Piauí (Lei 9.093/1995; Lei estadual 176/1937)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato GP TRT22 184/2025 (calendário 2026)",
    "fonte": "trt22-ato-gp-184-2025"
  },
  {
    "tribunais": [
      "TRT22"
    ],
    "inicio": "2026-10-30",
    "fim": "2026-10-30",
    "nome": "Dia do Servidor Público (transferido de 28/10)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato GP TRT22 184/2025 (calendário 2026)",
    "fonte": "trt22-ato-gp-184-2025"
  },
  {
    "tribunais": [
      "TRT22"
    ],
    "inicio": "2026-11-01",
    "fim": "2026-11-02",
    "nome": "Todos os Santos e Finados",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato GP TRT22 184/2025 (calendário 2026)",
    "fonte": "trt22-ato-gp-184-2025"
  },
  {
    "tribunais": [
      "TRT22"
    ],
    "inicio": "2026-12-08",
    "fim": "2026-12-08",
    "nome": "Dia da Justiça (Lei 5.010, art. 62, IV)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato GP TRT22 184/2025 (calendário 2026)",
    "fonte": "trt22-ato-gp-184-2025"
  },
  {
    "tribunais": [
      "TRT22"
    ],
    "inicio": "2026-12-20",
    "fim": "2026-12-31",
    "nome": "Recesso forense (Lei 5.010, art. 62, I)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Ato GP TRT22 184/2025 (calendário 2026)",
    "fonte": "trt22-ato-gp-184-2025"
  },
  {
    "tribunais": [
      "TRT11"
    ],
    "inicio": "2026-01-02",
    "fim": "2026-01-06",
    "nome": "Recesso forense",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT11 (RA 322/2025, alterada pela RA 214/2026)",
    "fonte": "trt11-calendario-2026"
  },
  {
    "tribunais": [
      "TRT11"
    ],
    "inicio": "2026-02-16",
    "fim": "2026-02-17",
    "nome": "Carnaval",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT11 (RA 322/2025, alterada pela RA 214/2026)",
    "fonte": "trt11-calendario-2026"
  },
  {
    "tribunais": [
      "TRT11"
    ],
    "inicio": "2026-02-18",
    "fim": "2026-02-18",
    "nome": "Quarta-feira de Cinzas",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT11 (RA 322/2025, alterada pela RA 214/2026)",
    "fonte": "trt11-calendario-2026"
  },
  {
    "tribunais": [
      "TRT11"
    ],
    "inicio": "2026-04-01",
    "fim": "2026-04-03",
    "nome": "Semana Santa",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT11 (RA 322/2025, alterada pela RA 214/2026)",
    "fonte": "trt11-calendario-2026"
  },
  {
    "tribunais": [
      "TRT11"
    ],
    "inicio": "2026-04-20",
    "fim": "2026-04-20",
    "nome": "Suspensão do expediente (RA 322/2025)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT11 (RA 322/2025, alterada pela RA 214/2026)",
    "fonte": "trt11-calendario-2026"
  },
  {
    "tribunais": [
      "TRT11"
    ],
    "inicio": "2026-06-04",
    "fim": "2026-06-04",
    "nome": "Corpus Christi",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT11 (RA 322/2025, alterada pela RA 214/2026)",
    "fonte": "trt11-calendario-2026"
  },
  {
    "tribunais": [
      "TRT11"
    ],
    "inicio": "2026-06-05",
    "fim": "2026-06-05",
    "nome": "Suspensão do expediente (RA 322/2025)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT11 (RA 322/2025, alterada pela RA 214/2026)",
    "fonte": "trt11-calendario-2026"
  },
  {
    "tribunais": [
      "TRT11"
    ],
    "inicio": "2026-08-10",
    "fim": "2026-08-10",
    "nome": "Suspensão do expediente (RA 322/2025)",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT11 (RA 322/2025, alterada pela RA 214/2026)",
    "fonte": "trt11-calendario-2026"
  },
  {
    "tribunais": [
      "TRT11"
    ],
    "inicio": "2026-08-11",
    "fim": "2026-08-11",
    "nome": "Instituição dos Cursos Jurídicos",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT11 (RA 322/2025, alterada pela RA 214/2026)",
    "fonte": "trt11-calendario-2026"
  },
  {
    "tribunais": [
      "TRT11"
    ],
    "inicio": "2026-10-28",
    "fim": "2026-10-28",
    "nome": "Dia do Servidor Público",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT11 (RA 322/2025, alterada pela RA 214/2026)",
    "fonte": "trt11-calendario-2026"
  },
  {
    "tribunais": [
      "TRT11"
    ],
    "inicio": "2026-11-02",
    "fim": "2026-11-02",
    "nome": "Finados",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT11 (RA 322/2025, alterada pela RA 214/2026)",
    "fonte": "trt11-calendario-2026"
  },
  {
    "tribunais": [
      "TRT11"
    ],
    "inicio": "2026-12-08",
    "fim": "2026-12-08",
    "nome": "Dia da Justiça e de Nossa Senhora da Conceição",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT11 (RA 322/2025, alterada pela RA 214/2026)",
    "fonte": "trt11-calendario-2026"
  },
  {
    "tribunais": [
      "TRT11"
    ],
    "inicio": "2026-12-15",
    "fim": "2026-12-15",
    "nome": "Instalação do TRT11",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT11 (RA 322/2025, alterada pela RA 214/2026)",
    "fonte": "trt11-calendario-2026"
  },
  {
    "tribunais": [
      "TRT11"
    ],
    "inicio": "2026-12-20",
    "fim": "2026-12-31",
    "nome": "Recesso forense",
    "efeito": "nao_util",
    "verificacao": "ato_do_tribunal",
    "fundamento": "Calendário 2026 do TRT11 (RA 322/2025, alterada pela RA 214/2026)",
    "fonte": "trt11-calendario-2026"
  }
];

/** Pontos facultativos que só alertam (o ato não diz que não haverá expediente). */
export const PONTOS_FACULTATIVOS_TRTS: Record<string, string[]> = {
  "TRT12": [
    "2026-04-20",
    "2026-06-04",
    "2026-06-05"
  ],
  "TRT1": [
    "2026-08-10",
    "2026-12-07"
  ],
  "TRT8": [
    "2026-02-18"
  ],
  "TRT10": [
    "2026-10-28",
    "2026-10-30"
  ],
  "TRT14": [
    "2026-01-23",
    "2026-11-17"
  ],
  "TRT19": [
    "2026-04-20",
    "2026-06-05",
    "2026-08-10",
    "2026-12-07"
  ],
  "TRT20": [
    "2026-04-20",
    "2026-06-05",
    "2026-08-10",
    "2026-12-07"
  ],
  "TRT24": [
    "2026-12-07"
  ]
};

export const COBERTURA_TRTS: Record<string, { anos: number[]; fontes: Array<keyof typeof FONTES_TRTS> }> = {
  "TRT7": {
    "anos": [
      2026
    ],
    "fontes": [
      "trt7-portaria-518-2025"
    ]
  },
  "TRT4": {
    "anos": [
      2026
    ],
    "fontes": [
      "trt4-portaria-8-2025",
      "trt4-ra-10-2026"
    ]
  },
  "TRT6": {
    "anos": [
      2026
    ],
    "fontes": [
      "trt6-portaria-495-2025"
    ]
  },
  "TRT15": {
    "anos": [
      2026
    ],
    "fontes": [
      "trt15-portaria-gp-cr-16-2025"
    ]
  },
  "TRT12": {
    "anos": [
      2026
    ],
    "fontes": [
      "trt12-portaria-seap-191-2024"
    ]
  },
  "TRT1": {
    "anos": [
      2026
    ],
    "fontes": [
      "trt1-ato-109-2025"
    ]
  },
  "TRT2": {
    "anos": [
      2026
    ],
    "fontes": [
      "trt2-portaria-gp-50-2025"
    ]
  },
  "TRT3": {
    "anos": [
      2026
    ],
    "fontes": [
      "trt3-ra-109-2025"
    ]
  },
  "TRT5": {
    "anos": [
      2026
    ],
    "fontes": [
      "trt5-ra-37-2025"
    ]
  },
  "TRT8": {
    "anos": [
      2026
    ],
    "fontes": [
      "trt8-calendario-2026"
    ]
  },
  "TRT10": {
    "anos": [
      2026
    ],
    "fontes": [
      "trt10-calendario-2026"
    ]
  },
  "TRT14": {
    "anos": [
      2026
    ],
    "fontes": [
      "trt14-portaria-gp-1640-2025",
      "trt14-portaria-gp-550-2026"
    ]
  },
  "TRT19": {
    "anos": [
      2026
    ],
    "fontes": [
      "trt19-ato-170-2025"
    ]
  },
  "TRT20": {
    "anos": [
      2026
    ],
    "fontes": [
      "trt20-calendario-2026"
    ]
  },
  "TRT23": {
    "anos": [
      2026
    ],
    "fontes": [
      "trt23-portaria-conjunta-007-2026"
    ]
  },
  "TRT16": {
    "anos": [
      2026
    ],
    "fontes": [
      "trt16-portaria-gp-681-2025"
    ]
  },
  "TRT24": {
    "anos": [
      2026
    ],
    "fontes": [
      "trt24-calendario-2026"
    ]
  },
  "TRT22": {
    "anos": [
      2026
    ],
    "fontes": [
      "trt22-ato-gp-184-2025"
    ]
  },
  "TRT11": {
    "anos": [
      2026
    ],
    "fontes": [
      "trt11-calendario-2026"
    ]
  }
};
