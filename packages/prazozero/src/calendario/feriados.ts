export interface FeriadoLegal {
  data: string; // ISO "YYYY-MM-DD"
  nome: string;
  tipo: 'nacional' | 'estadual' | 'forense' | 'suspensao_legal';
  uf?: string;
  tribunalId?: string;
  fundamentoLegal: string;
}

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
 * Feriados Estaduais Catalogados com Lei Estadual Instituidora
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
 * Retorna todos os feriados nacionais, móveis e estaduais para um ano específico.
 */
export function obterFeriadosAno(ano: number, uf?: string, tribunalSigla?: string): Map<string, FeriadoLegal> {
  const mapa = new Map<string, FeriadoLegal>();

  function registrar(dataIso: string, feriado: Omit<FeriadoLegal, 'data'>) {
    mapa.set(dataIso, { data: dataIso, ...feriado });
  }

  // 1. Feriados Nacionais Fixos (Lei Federal 10.607/2002 e Lei 6.802/1980)
  registrar(`${ano}-01-01`, {
    nome: 'Confraternização Universal',
    tipo: 'nacional',
    fundamentoLegal: 'Lei Federal nº 10.607/2002, art. 1º'
  });
  registrar(`${ano}-04-21`, {
    nome: 'Tiradentes',
    tipo: 'nacional',
    fundamentoLegal: 'Lei Federal nº 10.607/2002, art. 1º'
  });
  registrar(`${ano}-05-01`, {
    nome: 'Dia Mundial do Trabalho',
    tipo: 'nacional',
    fundamentoLegal: 'Lei Federal nº 10.607/2002, art. 1º'
  });
  registrar(`${ano}-09-07`, {
    nome: 'Independência do Brasil',
    tipo: 'nacional',
    fundamentoLegal: 'Lei Federal nº 10.607/2002, art. 1º'
  });
  registrar(`${ano}-10-12`, {
    nome: 'Nossa Senhora Aparecida (Padroeira do Brasil)',
    tipo: 'nacional',
    fundamentoLegal: 'Lei Federal nº 6.802/1980, art. 1º'
  });
  registrar(`${ano}-11-02`, {
    nome: 'Finados',
    tipo: 'nacional',
    fundamentoLegal: 'Lei Federal nº 10.607/2002, art. 1º'
  });
  registrar(`${ano}-11-15`, {
    nome: 'Proclamação da República',
    tipo: 'nacional',
    fundamentoLegal: 'Lei Federal nº 10.607/2002, art. 1º'
  });
  registrar(`${ano}-11-20`, {
    nome: 'Dia Nacional de Zumbi e da Consciência Negra',
    tipo: 'nacional',
    fundamentoLegal: 'Lei Federal nº 14.759/2023, art. 1º'
  });
  registrar(`${ano}-12-25`, {
    nome: 'Natal',
    tipo: 'nacional',
    fundamentoLegal: 'Lei Federal nº 10.607/2002, art. 1º'
  });

  // 2. Feriados Nacionais Móveis e Tradição Judiciária (Gauss/Meeus)
  const pascoa = calcularPascoa(ano);
  const sextaFeiraSanta = somarDias(pascoa, -2);
  const segundaCarnaval = somarDias(pascoa, -48);
  const tercaCarnaval = somarDias(pascoa, -47);
  const quartaCinzas = somarDias(pascoa, -46);
  const corpusChristi = somarDias(pascoa, 60);

  registrar(formatarDataIso(sextaFeiraSanta), {
    nome: 'Paixão de Cristo (Sexta-feira Santa)',
    tipo: 'nacional',
    fundamentoLegal: 'Lei Federal nº 9.093/1995, art. 2º'
  });

  // Carnaval e Corpus Christi nos Tribunais do Brasil
  registrar(formatarDataIso(segundaCarnaval), {
    nome: 'Carnaval (Segunda-feira)',
    tipo: 'forense',
    fundamentoLegal: 'Regimento Interno e Atos Regimentais dos Tribunais / Lei nº 5.010/1966'
  });
  registrar(formatarDataIso(tercaCarnaval), {
    nome: 'Carnaval (Terça-feira)',
    tipo: 'forense',
    fundamentoLegal: 'Regimento Interno e Atos Regimentais dos Tribunais / Lei nº 5.010/1966'
  });
  registrar(formatarDataIso(quartaCinzas), {
    nome: 'Quarta-feira de Cinzas (Expediente forense após 14h ou suspenso)',
    tipo: 'forense',
    fundamentoLegal: 'CPC, art. 224, § 1º (Expediente encerrado/iniciado fora do horário normal)'
  });
  registrar(formatarDataIso(corpusChristi), {
    nome: 'Corpus Christi',
    tipo: 'nacional',
    fundamentoLegal: 'Decreto Federal / Ponto Facultativo Nacional e Atos dos Tribunais'
  });

  // 3. Feriados Forenses da Justiça Federal e Tribunais Superiores (Lei 5.010/1966)
  const ehJusticaFederalOuSuperior = tribunalSigla && ['STF', 'STJ', 'TST', 'TSE', 'TRF1', 'TRF2', 'TRF3', 'TRF4', 'TRF5', 'TRF6'].includes(tribunalSigla.toUpperCase());
  if (ehJusticaFederalOuSuperior) {
    // Quarta e Quinta-Feira Santa
    const quartaSanta = somarDias(pascoa, -4);
    const quintaSanta = somarDias(pascoa, -3);
    registrar(formatarDataIso(quartaSanta), {
      nome: 'Semana Santa (Quarta-feira)',
      tipo: 'forense',
      fundamentoLegal: 'Lei Federal nº 5.010/1966, art. 62, inciso II'
    });
    registrar(formatarDataIso(quintaSanta), {
      nome: 'Semana Santa (Quinta-feira)',
      tipo: 'forense',
      fundamentoLegal: 'Lei Federal nº 5.010/1966, art. 62, inciso II'
    });
    registrar(`${ano}-08-11`, {
      nome: 'Dia da Criação dos Cursos Jurídicos / Dia do Magistrado e Advogado',
      tipo: 'forense',
      fundamentoLegal: 'Lei Federal nº 5.010/1966, art. 62, inciso IV'
    });
    registrar(`${ano}-11-01`, {
      nome: 'Dia de Todos os Santos',
      tipo: 'forense',
      fundamentoLegal: 'Lei Federal nº 5.010/1966, art. 62, inciso IV'
    });
    registrar(`${ano}-12-08`, {
      nome: 'Dia da Justiça',
      tipo: 'forense',
      fundamentoLegal: 'Lei Federal nº 5.010/1966, art. 62, inciso IV e Decreto-Lei nº 8.292/1945'
    });
  }

  // 4. Feriados Estaduais
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
 * Verifica se uma data específica está abrangida pelo recesso forense do Art. 220 do CPC
 * (20 de dezembro do ano X até 20 de janeiro do ano X+1, inclusive)
 */
export function estaEmRecessoForenseCpc(dataIso: string): boolean {
  const [anoStr, mesStr, diaStr] = dataIso.split('-');
  const mes = parseInt(mesStr, 10);
  const dia = parseInt(diaStr, 10);

  if (mes === 12 && dia >= 20) {
    return true;
  }
  if (mes === 1 && dia <= 20) {
    return true;
  }
  return false;
}
