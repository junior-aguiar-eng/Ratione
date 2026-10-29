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
  }
];

/** Pontos facultativos que só alertam (o ato não diz que não haverá expediente). */
export const PONTOS_FACULTATIVOS_TRTS: Record<string, string[]> = {};

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
  }
};
