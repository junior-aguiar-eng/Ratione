import grafoMinimo from '@ratione/tesemap/grafo-minimo.json';

/**
 * Dados do grafo mínimo do Tema 1.076/STJ (F4-05) para as vitrines da página inicial: o mesmo arquivo que vai ao banco. Só as relações validadas
 * entram. Usado pela vitrine da seção do TeseMap e pela demonstração do topo.
 */
export type PapelDoNo = 'precedente' | 'dispositivo' | 'tema';

export interface ArestaVitrine {
  id: string;
  origem: string;
  destino: string;
  tipo: string;
  rotulo: string;
  validacao: { status: string; por: string | null; em: string | null };
}

const PREFIXO_DISPOSITIVO = 'NV|';

export const rotuloDoNo = (id: string): string => {
  if (id.startsWith(PREFIXO_DISPOSITIVO)) return grafoMinimo.dispositivos.find(d => PREFIXO_DISPOSITIVO + d.id === id)?.rotulo ?? id;
  const stj = id.match(/^STJ-TEMA-(\d+)$/);
  if (stj) return `Tema ${Number(stj[1]).toLocaleString('pt-BR')} do STJ`;
  const rg = id.match(/^STF-RG-(\d+)$/);
  if (rg) return `Tema ${Number(rg[1]).toLocaleString('pt-BR')} do STF (repercussão geral)`;
  return id;
};

export const papelDoNo = (id: string): PapelDoNo => (id.startsWith(PREFIXO_DISPOSITIVO) ? 'dispositivo' : id.startsWith('STF-RG-') ? 'tema' : 'precedente');

export const COR_DO_PAPEL: Record<PapelDoNo, string> = { precedente: 'rgb(var(--warn))', dispositivo: 'rgb(var(--info))', tema: 'rgb(var(--rel))' };

export const LEGENDA_DO_GRAFO: Array<[string, string]> = [
  ['bg-warn', 'Precedente qualificado do STJ'],
  ['bg-info', 'Dispositivo de lei (NormaViva)'],
  ['bg-rel', 'Tema de repercussão geral do STF']
];

// Duas colunas (viewBox 640x320): o Tema 1.076 no meio da esquerda, o § 6º-A acima dele e o Tema 1.255 abaixo; os parágrafos que ele interpreta à direita.
export const ALTURA_DO_NO = 62;
const ESQ = { x: 10, w: 250 };
const DIR = { x: 380, w: 250 };
export const POSICOES_DO_GRAFO: Record<string, { x: number; y: number; w: number }> = {
  'NV|LEI-13105-2015|corpo|art. 85, § 6º-A': { ...ESQ, y: 8 },
  'STJ-TEMA-1076': { ...ESQ, y: 128 },
  'STF-RG-1255': { ...ESQ, y: 248 },
  'NV|LEI-13105-2015|corpo|art. 85, § 2º': { ...DIR, y: 8 },
  'NV|LEI-13105-2015|corpo|art. 85, § 3º': { ...DIR, y: 128 },
  'NV|LEI-13105-2015|corpo|art. 85, § 8º': { ...DIR, y: 248 }
};

export const NO_CENTRAL = 'STJ-TEMA-1076';

export const arestasValidadas = (): ArestaVitrine[] => (grafoMinimo.arestas as ArestaVitrine[]).filter(a => a.validacao.status === 'validado');

/** Relações validadas que tocam o nó (saindo ou chegando). */
export const arestasDoNo = (id: string): ArestaVitrine[] => arestasValidadas().filter(a => a.origem === id || a.destino === id);
