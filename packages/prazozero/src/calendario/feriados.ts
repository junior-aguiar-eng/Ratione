export interface FeriadoLegal {
  data: string; // ISO "YYYY-MM-DD"
  nome: string;
  tipo: 'nacional' | 'estadual' | 'forense' | 'suspensao_legal';
  uf?: string;
  tribunalId?: string;
  fundamentoLegal: string;
  /** `nao_util`: o dia não conta. `expediente_parcial`: só protrai o dia do começo ou do vencimento (CPC, art. 224, § 1º). */
  efeito: 'nao_util' | 'expediente_parcial';
  /**
   * `lei_federal`: texto de lei federal conferido no Planalto; entra em qualquer cálculo.
   * `ato_do_tribunal`: ato do próprio tribunal lido na fonte oficial (ver `fonte`); vale para o ano do ato.
   * `pendente`: ainda sem ato e URL conferidos (METODO_CALENDARIO_FORENSE.md); só entra no modo `completo`.
   */
  verificacao: 'lei_federal' | 'ato_do_tribunal' | 'pendente';
  /** Ato e URL de onde o dia foi conferido (presente quando `verificacao` é `ato_do_tribunal`). */
  fonte?: { ato: string; url: string; verificadoEm: string };
}

/**
 * Tribunais cujo calendário anual foi conferido contra o ato oficial, e os anos cobertos.
 * Fora disso o resultado nunca é apresentado como calendário verificado.
 */
export const CALENDARIO_VERIFICADO: Record<string, { anos: number[]; fontes: Array<{ ato: string; url: string }> }> = {
  STJ: {
    anos: [2026],
    fontes: [
      {
        ato: 'Portaria STJ/GDG nº 1.010/2025 (DJe 26/12/2025): feriados e pontos facultativos de 2026',
        url: 'https://bdjur.stj.jus.br/server/api/core/bitstreams/6257b5ff-8c9d-408f-a7d5-c6d7064af8eb/content'
      },
      {
        ato: 'STJ, Horários de funcionamento: feriados, pontos facultativos e recesso',
        url: 'https://www.stj.jus.br/sites/portalp/Contato-e-ajuda/Fale-conosco/Horarios-de-funcionamento'
      }
    ]
  },
  STF: {
    anos: [2026],
    fontes: [
      {
        ato: 'Calendário oficial do STF 2026 (Portaria GDG/STF nº 189/2025; RISTF, art. 78)',
        url: 'https://www.stf.jus.br/arquivo/cms/processoCalendarioStf/anexo/CalendarioSTFOficial2026.pdf'
      }
    ]
  }
};

/** Justiça Federal e tribunais que aplicam a Lei 5.010/1966, art. 62 (texto da lei e atos de STF e STJ de 2026, conferidos em 07/10/2026). */
const APLICAM_LEI_5010_ART_62 = new Set(['STF', 'STJ', 'TRF1', 'TRF2', 'TRF3', 'TRF4', 'TRF5', 'TRF6']);
/** O art. 62 menciona "Tribunais Superiores", mas não há ato próprio conferido para estes. */
const OUTROS_SUPERIORES = new Set(['TST', 'TSE']);

const FONTE_STJ_2026 = {
  ato: 'Portaria STJ/GDG nº 1.010/2025',
  url: CALENDARIO_VERIFICADO.STJ.fontes[0].url,
  verificadoEm: '2026-10-07'
};
const FONTE_STF_2026 = {
  ato: 'Calendário oficial do STF 2026 (Portaria GDG/STF nº 189/2025)',
  url: CALENDARIO_VERIFICADO.STF.fontes[0].url,
  verificadoEm: '2026-10-07'
};

/** Pontos facultativos de 2026, idênticos em STF e STJ (lidos nos dois atos). */
const PONTOS_FACULTATIVOS_2026: Array<{ data: string; nome: string; parcial?: boolean }> = [
  { data: '2026-02-18', nome: 'Quarta-feira de Cinzas (ponto facultativo até as 14h)', parcial: true },
  { data: '2026-04-20', nome: 'Ponto facultativo' },
  { data: '2026-06-04', nome: 'Corpus Christi (ponto facultativo)' },
  { data: '2026-06-05', nome: 'Ponto facultativo' },
  { data: '2026-08-10', nome: 'Ponto facultativo' },
  { data: '2026-10-30', nome: 'Ponto facultativo (transferência do Dia do Servidor, 28/10)' },
  { data: '2026-12-07', nome: 'Ponto facultativo' }
];

/**
 * Cálculo astronômico e eclesiástico determinístico do Domingo de Páscoa (Algoritmo de Meeus/Jones/Butcher)
 * Válido para qualquer ano do calendário gregoriano.
 */
export function calcularPascoa(ano: number): Date {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31); // 3 = Março, 4 = Abril
  const dia = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(Date.UTC(ano, mes - 1, dia));
}

function formatarDataIso(data: Date): string {
  const y = data.getUTCFullYear();
  const m = String(data.getUTCMonth() + 1).padStart(2, '0');
  const d = String(data.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function somarDias(dataBase: Date, dias: number): Date {
  const d = new Date(dataBase.getTime());
  d.setUTCDate(d.getUTCDate() + dias);
  return d;
}

/**
 * Feriados estaduais AINDA NÃO conferidos ato a ato (todos `pendente`).
 * A Lei 9.093/1995, art. 1º, II, só reconhece como feriado civil estadual a data magna fixada em lei estadual;
 * a lista abaixo é hipótese de trabalho e há itens suspeitos (ES varia com a Páscoa; MT 20/11 já é nacional).
 */
const FERIADOS_ESTADUAIS_TABELA: Record<string, Array<{ mes: number; dia: number; nome: string; fundamento: string }>> = {
  SP: [{ mes: 7, dia: 9, nome: 'Revolução Constitucionalista de 1932', fundamento: 'Lei Estadual nº 9.497/1997' }],
  RJ: [{ mes: 4, dia: 23, nome: 'Dia de São Jorge', fundamento: 'Lei Estadual nº 5.198/2008' }],
  RS: [{ mes: 9, dia: 20, nome: 'Revolução Farroupilha (Dia do Gaúcho)', fundamento: 'Lei Estadual nº 8.423/1987 e Lei nº 9.093/1995' }],
  BA: [{ mes: 7, dia: 2, nome: 'Independência da Bahia', fundamento: 'Constituição do Estado da Bahia e Lei Estadual nº 9.093/1995' }],
  PE: [{ mes: 3, dia: 6, nome: 'Data Magna de Pernambuco', fundamento: 'Lei Estadual nº 16.059/2017' }],
  CE: [{ mes: 3, dia: 19, nome: 'Dia de São José (Padroeiro do Ceará)', fundamento: 'Lei Estadual nº 11.264/1986 e Decreto Estadual' }],
  PR: [{ mes: 12, dia: 19, nome: 'Emancipação Política do Paraná', fundamento: 'Lei Estadual nº 4.658/1962' }],
  SC: [{ mes: 8, dia: 11, nome: 'Criação da Capitania de Santa Catarina', fundamento: 'Lei Estadual nº 12.906/2004' }],
  DF: [{ mes: 11, dia: 30, nome: 'Dia do Evangélico', fundamento: 'Lei Distrital nº 893/1995' }],
  PA: [{ mes: 8, dia: 15, nome: 'Adesão do Grão-Pará à Independência', fundamento: 'Lei Estadual nº 5.999/1996' }],
  AM: [{ mes: 9, dia: 5, nome: 'Elevação do Amazonas à Categoria de Província', fundamento: 'Lei Estadual nº 1.540/1982' }],
  MA: [{ mes: 7, dia: 28, nome: 'Adesão do Maranhão à Independência', fundamento: 'Lei Estadual nº 2.457/1964' }],
  RN: [{ mes: 10, dia: 3, nome: 'Mártires de Cunhaú e Uruuaçu', fundamento: 'Lei Estadual nº 8.913/2006' }],
  PB: [{ mes: 7, dia: 26, nome: 'Homenagem à Memória de João Pessoa', fundamento: 'Lei Estadual nº 3.489/1967' }],
  AL: [{ mes: 9, dia: 16, nome: 'Emancipação Política de Alagoas', fundamento: 'Lei Estadual nº 5.724/1995' }],
  SE: [{ mes: 7, dia: 8, nome: 'Emancipação Política de Sergipe', fundamento: 'Lei Estadual nº 1.303/1963' }],
  PI: [{ mes: 10, dia: 19, nome: 'Dia do Piauí', fundamento: 'Lei Estadual nº 176/1937' }],
  ES: [{ mes: 4, dia: 17, nome: 'Nossa Senhora da Penha (segunda-feira pós-oitava da Páscoa)', fundamento: 'Lei Estadual nº 11.010/2019' }],
  GO: [{ mes: 10, dia: 24, nome: 'Pedra Fundamental de Goiânia', fundamento: 'Lei Estadual nº 11.111 e Tradição Judiciária' }],
  MT: [{ mes: 11, dia: 20, nome: 'Consciência Negra Estadual (Histórico)', fundamento: 'Lei Estadual nº 7.879/2002' }],
  MS: [{ mes: 10, dia: 11, nome: 'Criação do Estado de Mato Grosso do Sul', fundamento: 'Lei Estadual nº 10/1979' }],
  RO: [{ mes: 1, dia: 4, nome: 'Criação do Estado de Rondônia', fundamento: 'Lei Estadual nº 229/1989' }],
  AC: [{ mes: 6, dia: 15, nome: 'Aniversário do Estado do Acre', fundamento: 'Lei Estadual nº 14/1964' }],
  AP: [{ mes: 3, dia: 19, nome: 'Dia de São José', fundamento: 'Lei Estadual nº 0029/1992' }],
  RR: [{ mes: 10, dia: 5, nome: 'Criação do Estado de Roraima', fundamento: 'Lei Estadual nº 553/2001' }],
  TO: [{ mes: 10, dia: 5, nome: 'Criação do Estado do Tocantins', fundamento: 'Lei Estadual nº 96/1989' }]
};

/**
 * Retorna os dias não úteis (e de expediente parcial) de um ano para o tribunal informado.
 * Cada item diz de onde vem a base (`verificacao`); o motor decide o que usar em cada modo.
 */
export function obterFeriadosAno(ano: number, uf?: string, tribunalSigla?: string): Map<string, FeriadoLegal> {
  const mapa = new Map<string, FeriadoLegal>();
  const trib = tribunalSigla?.toUpperCase();

  function registrar(
    dataIso: string,
    feriado: Omit<FeriadoLegal, 'data' | 'efeito' | 'verificacao'> & Partial<Pick<FeriadoLegal, 'efeito' | 'verificacao'>>
  ) {
    mapa.set(dataIso, { efeito: 'nao_util', verificacao: 'pendente', ...feriado, data: dataIso });
  }

  // 1. Feriados nacionais fixos, instituídos por lei federal (texto conferido no Planalto em 07/10/2026)
  const L662 = 'Lei Federal nº 662/1949, art. 1º (redação da Lei nº 10.607/2002)';
  registrar(`${ano}-01-01`, { nome: 'Confraternização Universal', tipo: 'nacional', verificacao: 'lei_federal', fundamentoLegal: L662 });
  registrar(`${ano}-04-21`, { nome: 'Tiradentes', tipo: 'nacional', verificacao: 'lei_federal', fundamentoLegal: L662 });
  registrar(`${ano}-05-01`, { nome: 'Dia Mundial do Trabalho', tipo: 'nacional', verificacao: 'lei_federal', fundamentoLegal: L662 });
  registrar(`${ano}-09-07`, { nome: 'Independência do Brasil', tipo: 'nacional', verificacao: 'lei_federal', fundamentoLegal: L662 });
  registrar(`${ano}-10-12`, {
    nome: 'Nossa Senhora Aparecida (Padroeira do Brasil)',
    tipo: 'nacional',
    verificacao: 'lei_federal',
    fundamentoLegal: 'Lei Federal nº 6.802/1980, art. 1º'
  });
  registrar(`${ano}-11-02`, { nome: 'Finados', tipo: 'nacional', verificacao: 'lei_federal', fundamentoLegal: L662 });
  registrar(`${ano}-11-15`, { nome: 'Proclamação da República', tipo: 'nacional', verificacao: 'lei_federal', fundamentoLegal: L662 });
  registrar(`${ano}-12-25`, { nome: 'Natal', tipo: 'nacional', verificacao: 'lei_federal', fundamentoLegal: L662 });
  // Consciência Negra: nacional desde a Lei 14.759/2023 (publicada em 22/12/2023, vigência em 2024); antes, só onde houvesse lei local.
  registrar(`${ano}-11-20`, {
    nome: 'Dia Nacional de Zumbi e da Consciência Negra',
    tipo: 'nacional',
    verificacao: ano >= 2024 ? 'lei_federal' : 'pendente',
    fundamentoLegal: 'Lei Federal nº 14.759/2023, art. 1º'
  });

  // 2. Datas móveis (Meeus/Jones/Butcher)
  const pascoa = calcularPascoa(ano);
  const aplica5010 = !!trib && APLICAM_LEI_5010_ART_62.has(trib);
  const superiorSemAto = !!trib && OUTROS_SUPERIORES.has(trib);
  const L5010 = 'Lei Federal nº 5.010/1966, art. 62';
  const verif5010: FeriadoLegal['verificacao'] = aplica5010 ? 'lei_federal' : 'pendente';
  const nota5010 = aplica5010
    ? ''
    : superiorSemAto
      ? ' (o art. 62 cita "Tribunais Superiores"; falta ato próprio do tribunal)'
      : ' (ato do tribunal; o art. 62 vale na Justiça Federal)';

  // Sexta-feira da Paixão: a Lei 9.093/1995, art. 2º, a trata como feriado religioso de lei municipal.
  // Na Justiça Federal e nos tribunais que aplicam a Lei 5.010, vale como Semana Santa (art. 62, II).
  registrar(formatarDataIso(somarDias(pascoa, -2)), {
    nome: 'Paixão de Cristo (Sexta-feira Santa)',
    tipo: aplica5010 ? 'forense' : 'nacional',
    verificacao: verif5010,
    fundamentoLegal: aplica5010
      ? `${L5010}, II (Semana Santa)`
      : 'Lei Federal nº 9.093/1995, art. 2º (feriado religioso de lei municipal); conferir ato do tribunal'
  });
  registrar(formatarDataIso(somarDias(pascoa, -48)), {
    nome: 'Carnaval (Segunda-feira)',
    tipo: 'forense',
    verificacao: verif5010,
    fundamentoLegal: `${L5010}, III${nota5010}`
  });
  registrar(formatarDataIso(somarDias(pascoa, -47)), {
    nome: 'Carnaval (Terça-feira)',
    tipo: 'forense',
    verificacao: verif5010,
    fundamentoLegal: `${L5010}, III${nota5010}`
  });
  registrar(formatarDataIso(somarDias(pascoa, -46)), {
    nome: 'Quarta-feira de Cinzas (expediente a partir das 14h)',
    tipo: 'forense',
    efeito: 'expediente_parcial',
    fundamentoLegal: 'CPC, art. 224, § 1º (protrai apenas o dia do começo e o do vencimento); horário conforme ato do tribunal'
  });
  registrar(formatarDataIso(somarDias(pascoa, 60)), {
    nome: 'Corpus Christi',
    tipo: 'nacional',
    fundamentoLegal: 'Ponto facultativo; a suspensão do expediente depende de ato do tribunal'
  });

  // 3. Lei 5.010/1966, art. 62: Justiça Federal e tribunais que a aplicam (texto conferido no Planalto)
  if (aplica5010 || superiorSemAto) {
    registrar(formatarDataIso(somarDias(pascoa, -4)), {
      nome: 'Semana Santa (Quarta-feira)',
      tipo: 'forense',
      verificacao: verif5010,
      fundamentoLegal: `${L5010}, II${nota5010}`
    });
    registrar(formatarDataIso(somarDias(pascoa, -3)), {
      nome: 'Semana Santa (Quinta-feira)',
      tipo: 'forense',
      verificacao: verif5010,
      fundamentoLegal: `${L5010}, II${nota5010}`
    });
    registrar(`${ano}-08-11`, {
      nome: 'Criação dos Cursos Jurídicos (11 de agosto)',
      tipo: 'forense',
      verificacao: verif5010,
      fundamentoLegal: `${L5010}, IV (redação da Lei nº 6.741/1979)${nota5010}`
    });
    registrar(`${ano}-11-01`, {
      nome: 'Dia de Todos os Santos',
      tipo: 'forense',
      verificacao: verif5010,
      fundamentoLegal: `${L5010}, IV (redação da Lei nº 6.741/1979)${nota5010}`
    });
    registrar(`${ano}-12-08`, {
      nome: 'Dia da Justiça',
      tipo: 'forense',
      verificacao: verif5010,
      fundamentoLegal: `${L5010}, IV (redação da Lei nº 6.741/1979)${nota5010}`
    });
    // Art. 62, I: 20/12 a 6/1 são feriados forenses (relevante nos prazos corridos, onde o recesso do CPC não se aplica)
    for (let dia = 20; dia <= 31; dia++) {
      registrar(`${ano}-12-${dia}`, { nome: 'Recesso forense', tipo: 'forense', verificacao: verif5010, fundamentoLegal: `${L5010}, I${nota5010}` });
    }
    for (let dia = 2; dia <= 6; dia++) {
      registrar(`${ano}-01-0${dia}`, { nome: 'Recesso forense', tipo: 'forense', verificacao: verif5010, fundamentoLegal: `${L5010}, I${nota5010}` });
    }
  }

  // 4. Pontos facultativos de 2026 de STF e STJ, lidos nos atos oficiais
  if (ano === 2026 && (trib === 'STF' || trib === 'STJ')) {
    const fonte = trib === 'STJ' ? FONTE_STJ_2026 : FONTE_STF_2026;
    for (const pf of PONTOS_FACULTATIVOS_2026) {
      registrar(pf.data, {
        nome: pf.nome,
        tipo: 'forense',
        efeito: pf.parcial ? 'expediente_parcial' : 'nao_util',
        verificacao: 'ato_do_tribunal',
        fundamentoLegal: fonte.ato,
        fonte
      });
    }
  }

  // 5. Feriados estaduais (pendentes de conferência)
  if (uf && FERIADOS_ESTADUAIS_TABELA[uf.toUpperCase()]) {
    for (const fe of FERIADOS_ESTADUAIS_TABELA[uf.toUpperCase()]) {
      const dataIso = `${ano}-${String(fe.mes).padStart(2, '0')}-${String(fe.dia).padStart(2, '0')}`;
      if (!mapa.has(dataIso)) {
        registrar(dataIso, {
          nome: fe.nome,
          tipo: 'estadual',
          uf: uf.toUpperCase(),
          fundamentoLegal: fe.fundamento
        });
      }
    }
  }

  return mapa;
}

/**
 * Suspensão do curso dos prazos processuais (regimes de dias úteis).
 * - STF e STJ: recesso (20/12 a 6/1) e férias coletivas (2 a 31 de janeiro e de 2 a 31 de julho):
 *   LC 35/1979, art. 66, § 1º; RISTF, arts. 78 e 105; RISTJ, arts. 81 e 106 (Portarias STJ/GP 941/2025 e 455/2026).
 * - Demais tribunais: 20/12 a 20/01 (CPC, art. 220; CLT, art. 775-A).
 */
export function suspensaoDePrazos(
  dataIso: string,
  tribunalId: string | undefined,
  regime: 'cpc_dias_uteis' | 'clt_dias_uteis'
): { suspenso: boolean; descricao: string; fundamentoLegal: string } {
  const mes = parseInt(dataIso.slice(5, 7), 10);
  const dia = parseInt(dataIso.slice(8, 10), 10);
  const trib = tribunalId?.toUpperCase();

  if (trib === 'STF' || trib === 'STJ') {
    const suspenso = (mes === 12 && dia >= 20) || mes === 1 || (mes === 7 && dia >= 2);
    return {
      suspenso,
      descricao: 'Suspensão de prazos: recesso forense e férias coletivas dos ministros',
      fundamentoLegal:
        trib === 'STF'
          ? 'LC 35/1979, art. 66, § 1º; RISTF, arts. 78 e 105'
          : 'LC 35/1979, art. 66, § 1º; RISTJ, arts. 81 e 106 (Portarias STJ/GP 941/2025 e 455/2026)'
    };
  }
  const suspenso = (mes === 12 && dia >= 20) || (mes === 1 && dia <= 20);
  return {
    suspenso,
    descricao: 'Suspensão de prazos processuais e recesso forense',
    fundamentoLegal: regime === 'clt_dias_uteis' ? 'CLT, art. 775-A' : 'CPC, art. 220'
  };
}

/**
 * Verifica se uma data está no recesso forense do art. 220 do CPC (20/12 a 20/01, inclusive).
 * Mantida por compatibilidade; o motor usa `suspensaoDePrazos`, que considera o tribunal.
 */
export function estaEmRecessoForenseCpc(dataIso: string): boolean {
  return suspensaoDePrazos(dataIso, undefined, 'cpc_dias_uteis').suspenso;
}
