/**
 * Apelidos e nomes das normas do corpus (F3-05): "CPC", "Código de Processo Civil", "Constituição Federal" → id canônico.
 * Servem para resolver "art. 489 do CPC" na barra de pesquisa e "nos termos do art. 5º da Constituição Federal" nas remissões.
 */
export interface NormaConhecida {
  id: string;
  /** Siglas (maiúsculas, sem pontos). */
  siglas: string[];
  /** Nomes por extenso, minúsculos. */
  nomes: string[];
}

export const NORMAS_CONHECIDAS: NormaConhecida[] = [
  { id: 'CF-1988', siglas: ['CF', 'CRFB', 'CF88'], nomes: ['constituição federal', 'constituição da república', 'constituição da república federativa do brasil'] },
  { id: 'LEI-10406-2002', siglas: ['CC', 'CC02'], nomes: ['código civil'] },
  { id: 'LEI-13105-2015', siglas: ['CPC', 'CPC15'], nomes: ['código de processo civil'] },
  { id: 'DL-2848-1940', siglas: ['CP'], nomes: ['código penal'] },
  { id: 'DL-3689-1941', siglas: ['CPP'], nomes: ['código de processo penal'] },
  { id: 'DL-5452-1943', siglas: ['CLT'], nomes: ['consolidação das leis do trabalho'] },
  { id: 'LEI-8078-1990', siglas: ['CDC'], nomes: ['código de defesa do consumidor'] },
  { id: 'DL-4657-1942', siglas: ['LINDB', 'LICC'], nomes: ['lei de introdução às normas do direito brasileiro'] },
  { id: 'LEI-5172-1966', siglas: ['CTN'], nomes: ['código tributário nacional'] },
  { id: 'LEI-8069-1990', siglas: ['ECA'], nomes: ['estatuto da criança e do adolescente'] },
  { id: 'LEI-13709-2018', siglas: ['LGPD'], nomes: ['lei geral de proteção de dados', 'lei geral de proteção de dados pessoais'] },
  { id: 'LEI-14133-2021', siglas: ['NLL'], nomes: ['lei de licitações e contratos administrativos'] },
  { id: 'LEI-8429-1992', siglas: ['LIA'], nomes: ['lei de improbidade administrativa'] },
  { id: 'LEI-12965-2014', siglas: [], nomes: ['marco civil da internet'] },
  { id: 'LEI-11340-2006', siglas: [], nomes: ['lei maria da penha'] },
  { id: 'LEI-9503-1997', siglas: ['CTB'], nomes: ['código de trânsito brasileiro'] },
  { id: 'LEI-7210-1984', siglas: ['LEP'], nomes: ['lei de execução penal'] },
  { id: 'LEI-9099-1995', siglas: [], nomes: ['lei dos juizados especiais'] },
  {
    id: 'LEI-8112-1990',
    siglas: ['RJU'],
    nomes: [
      'regime jurídico dos servidores públicos civis da união',
      'estatuto dos servidores públicos civis da união',
      'estatuto dos servidores públicos federais'
    ]
  },
  { id: 'LEI-8213-1991', siglas: ['PBPS'], nomes: ['planos de benefícios da previdência social', 'lei de benefícios da previdência social'] },
  { id: 'LEI-8245-1991', siglas: [], nomes: ['lei do inquilinato', 'lei de locações', 'lei das locações'] },
  { id: 'LEI-9307-1996', siglas: [], nomes: ['lei de arbitragem', 'lei da arbitragem'] },
  { id: 'LEI-6830-1980', siglas: ['LEF'], nomes: ['lei de execução fiscal', 'lei das execuções fiscais'] },
  { id: 'LEI-7347-1985', siglas: ['LACP'], nomes: ['lei da ação civil pública', 'lei de ação civil pública'] },
  {
    id: 'LEI-11101-2005',
    siglas: ['LREF'],
    nomes: ['lei de recuperação judicial, extrajudicial e falência', 'lei de recuperação judicial', 'lei de falências', 'lei de recuperação e falências']
  },
  { id: 'LEI-11343-2006', siglas: [], nomes: ['lei de drogas', 'lei antidrogas', 'lei de tóxicos'] },
  { id: 'LEI-11419-2006', siglas: [], nomes: ['lei do processo eletrônico', 'lei de informatização do processo judicial'] },
  { id: 'LEI-12016-2009', siglas: ['LMS'], nomes: ['lei do mandado de segurança'] }
];

const IDS_CONHECIDOS = new Set(NORMAS_CONHECIDAS.map(n => n.id));
const POR_SIGLA = new Map(NORMAS_CONHECIDAS.flatMap(n => n.siglas.map(s => [s, n.id] as const)));
const POR_NOME = NORMAS_CONHECIDAS.flatMap(n => n.nomes.map(nome => [nome, n.id] as const)).sort((a, b) => b[0].length - a[0].length);

export function estaNoCorpus(normaId: string): boolean {
  return IDS_CONHECIDOS.has(normaId);
}

/** Reconhece citação a escopo específico de uma norma do corpus (hoje: ADCT da Constituição Federal). */
export function escopoEspecialNoInicio(trecho: string): { normaId: string; escopoDestino: string } | undefined {
  if (/^ADCT(?![\p{L}\p{N}])/u.test(trecho) || /^ato\s+das\s+disposi[çc][õo]es\s+constitucionais\s+transit[óo]rias\b/i.test(trecho)) {
    return { normaId: 'CF-1988', escopoDestino: 'ADCT' };
  }
  return undefined;
}

export function normaPorSigla(texto: string): string | undefined {
  return POR_SIGLA.get(texto.replace(/[.\s]/g, '').toUpperCase());
}

/** Norma cujo nome por extenso aparece no começo do trecho (o nome mais longo vence). */
export function normaPorNomeNoInicio(trecho: string): string | undefined {
  const t = trecho.toLowerCase();
  return POR_NOME.find(([nome]) => t.startsWith(nome))?.[1];
}

/** "Lei nº 8.078, de 1990" → "LEI-8078-1990" (formato dos ids do corpus), se for lei, lei complementar ou decreto-lei. */
export function idDeNormaPelaChave(chave: string): string | undefined {
  const [tipo, numero, ano] = chave.split(':');
  const prefixo = tipo === 'lei' ? 'LEI' : tipo === 'lei-complementar' ? 'LC' : tipo === 'decreto-lei' ? 'DL' : undefined;
  return prefixo ? `${prefixo}-${numero}-${ano}` : undefined;
}
