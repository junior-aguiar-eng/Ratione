// GERADO por `cenarios/gerar_trts.py` a partir de `cenarios/trts-2026.json`. Não edite à mão: altere o JSON e rode o gerador.
import type { EfeitoEvento, FonteCalendario, VerificacaoEvento } from './eventos';

/** Fontes dos calendários dos Tribunais Regionais do Trabalho (um ato por entrada). */
export const FONTES_TRTS = {
  "trt7-portaria-518-2025": {
    "ato": "Portaria TRT7.GP nº 518, de 18/11/2025 (DEJT nº 4354), alterada pelas Portarias TRT7.GP nº 64, de 20/02/2026 (DEJT nº 4420, inclui os pontos facultativos de 20/04, 05/06, 10/08 e 07/12) e nº 127, de 09/04/2026 (DEJT nº 4448, só feriados municipais): dias sem expediente na Justiça do Trabalho da 7ª Região em 2026",
    "url": "https://www.trt7.jus.br/files/atos_normativos/portarias_presidencia/2025/PORTARIA%20PRESI%20518-2025%20este.pdf",
    "lido": "inteiro teor da Portaria 518/2025 (PDF republicado, 6 páginas) e da Portaria 64/2026, lidos em 28/10/2026 pelo script de acesso; a Portaria 127/2026 só pelo resumo de busca (altera feriados municipais). O art. 1º determina que não haverá expediente nos dias da tabela, os pontos facultativos incluídos, e o art. 3º prorroga para o primeiro dia útil os prazos que começam ou vencem nessas datas; por isso todos contam como dia sem expediente (e 28/10, Dia do Servidor, foi transferido para 30/10). Fora: os feriados municipais do art. 2º (CPC, art. 1.003, § 6º), 20 a 31/12 e 02 a 06/01 já no recesso. Atos posteriores não lidos",
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
  }
};
