/**
 * Dispositivos do NormaViva que fundamentam cada prazo do catálogo, para a tela abrir o artigo exato (e a ferramenta do NormaViva apontar
 * de volta para o prazo). `baseLegal` (texto livre) continua sendo a citação que o usuário lê; isto é só o endereço de cada dispositivo.
 * O teste `fundamentos.test.ts` do app confere cada `normaId` e `rotulo` contra o corpus carregado, então um rótulo errado não passa.
 */
export interface FundamentoNormativo {
  /** Id da norma no corpus do NormaViva (`LEI-13105-2015`). */
  normaId: string;
  /** Rótulo do dispositivo no corpus, na forma do parser (`art. 1.003, § 5º`). */
  rotulo: string;
}

const CPC = 'LEI-13105-2015';
const CLT = 'DL-5452-1943';
const CPP = 'DL-3689-1941';
const JEC = 'LEI-9099-1995';
const MS = 'LEI-12016-2009';

const cpc = (rotulo: string): FundamentoNormativo => ({ normaId: CPC, rotulo });
const regraGeralRecursos = cpc('art. 1.003, § 5º');

export const FUNDAMENTOS_DOS_PRAZOS: Record<string, FundamentoNormativo[]> = {
  apelacao: [cpc('art. 1.009'), regraGeralRecursos],
  'agravo-instrumento': [cpc('art. 1.015'), regraGeralRecursos],
  'agravo-interno': [cpc('art. 1.021, § 2º'), regraGeralRecursos],
  'embargos-declaracao': [cpc('art. 1.023')],
  'recurso-extraordinario': [cpc('art. 1.029'), regraGeralRecursos],
  'recurso-especial': [cpc('art. 1.029'), regraGeralRecursos],
  'agravo-re-resp': [cpc('art. 1.042'), regraGeralRecursos],
  'embargos-divergencia': [cpc('art. 1.043'), regraGeralRecursos],
  'recurso-ordinario-cpc': [cpc('art. 1.028'), regraGeralRecursos],
  contrarrazoes: [cpc('art. 1.010, § 1º'), cpc('art. 1.030'), regraGeralRecursos],
  contestacao: [cpc('art. 335')],
  replica: [cpc('art. 350'), cpc('art. 351')],
  'impugnacao-cumprimento': [cpc('art. 525')],
  supletivo: [cpc('art. 218, § 3º')],
  'recurso-ordinario-clt': [{ normaId: CLT, rotulo: 'art. 895' }],
  'agravo-peticao': [{ normaId: CLT, rotulo: 'art. 897, a)' }],
  'agravo-instrumento-clt': [{ normaId: CLT, rotulo: 'art. 897, b)' }],
  'embargos-declaracao-clt': [{ normaId: CLT, rotulo: 'art. 897-A' }],
  'apelacao-criminal': [{ normaId: CPP, rotulo: 'art. 593' }],
  rese: [{ normaId: CPP, rotulo: 'art. 586' }],
  'razoes-apelacao-criminal': [{ normaId: CPP, rotulo: 'art. 600' }],
  'embargos-declaracao-criminal': [{ normaId: CPP, rotulo: 'art. 619' }],
  'recurso-inominado': [{ normaId: JEC, rotulo: 'art. 42' }, { normaId: JEC, rotulo: 'art. 12-A' }],
  'embargos-declaracao-jef': [{ normaId: JEC, rotulo: 'art. 49' }, { normaId: JEC, rotulo: 'art. 12-A' }],
  'mandado-seguranca': [{ normaId: MS, rotulo: 'art. 23' }],
  'acao-rescisoria': [cpc('art. 975')]
};

/** O id do dispositivo no corpus: `norma|escopo|rótulo`, o mesmo que o NormaViva abre por `?d=`. */
export function idDoDispositivo(f: FundamentoNormativo): string {
  return `${f.normaId}|corpo|${f.rotulo}`;
}

/** Prazos do catálogo que têm o dispositivo como fundamento (o artigo exato ou, se o dispositivo for um parágrafo, o artigo que o contém). */
export function prazosFundamentadosPor(dispositivoId: string): string[] {
  const [normaId, escopo, rotulo] = dispositivoId.split('|');
  if (escopo !== 'corpo' || !rotulo) return [];
  const artigo = rotulo.split(',')[0];
  return Object.entries(FUNDAMENTOS_DOS_PRAZOS)
    .filter(([, lista]) => lista.some(f => f.normaId === normaId && (f.rotulo === rotulo || f.rotulo.split(',')[0] === artigo)))
    .map(([id]) => id);
}
