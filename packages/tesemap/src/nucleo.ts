import { PrecedenteSchema, type Precedente, type Procedencia, type TipoPrecedente } from '@ratione/core';
import type { GrafoTopologicoTeses, NoGrafo } from './index';

/**
 * "Tema 1.076" no STJ → repetitivo; no STF → repercussão geral. "Súmula 479" → súmula do tribunal;
 * "Súmula Vinculante 10" → súmula vinculante do STF. O que não cabe nesses padrões (IAC, IRDR, controle
 * concentrado) é recusado: o nó precisa ser classificado à mão, não adivinhado.
 */
function classificar(tribunal: string, referencia: string): { tipo: TipoPrecedente; chave: string } {
  const ref = referencia.trim();
  let m = ref.match(/^Súmula Vinculante\s+(\d+)$/i);
  if (m && tribunal === 'STF') return { tipo: 'stf_sumula_vinculante', chave: `SV-${m[1]}` };
  m = ref.match(/^Súmula\s+(\d+)$/i);
  if (m && tribunal === 'STJ') return { tipo: 'sumula_stj', chave: `SUMULA-${m[1]}` };
  if (m && tribunal === 'STF') return { tipo: 'sumula_stf', chave: `SUMULA-${m[1]}` };
  m = ref.match(/^Tema\s+([\d.]+)$/i);
  if (m && tribunal === 'STJ') return { tipo: 'stj_repetitivo', chave: `TEMA-${m[1].replace(/\./g, '')}` };
  if (m && tribunal === 'STF') return { tipo: 'stf_repercussao_geral', chave: `TEMA-${m[1].replace(/\./g, '')}` };
  throw new Error(`Não foi possível classificar o precedente "${referencia}" (${tribunal}).`);
}

/** Um nó `tese_vinculante` vira o precedente do núcleo, com id canônico (ex.: `STJ-TEMA-1076`). */
export function noParaPrecedente(no: NoGrafo, procedencia: Procedencia): Precedente {
  if (no.tipo !== 'tese_vinculante') throw new Error(`O nó "${no.id}" é ${no.tipo}, não tese vinculante.`);
  if (!no.tribunal || !no.numeroReferencia) throw new Error(`O nó "${no.id}" não informa tribunal e número de referência.`);
  const { tipo, chave } = classificar(no.tribunal, no.numeroReferencia);
  return PrecedenteSchema.parse({
    id: `${no.tribunal}-${chave}`,
    tribunal: no.tribunal,
    tipo,
    numeroOuTema: no.numeroReferencia,
    enunciadoTese: no.descricao,
    // Os nós de dispositivo do grafo usam ids locais, que não são os do núcleo: a ligação fica para o F4-03.
    dispositivosRelacionados: [],
    procedencia
  });
}

/** Todos os precedentes vinculantes de um grafo. */
export function precedentesDoGrafo(grafo: GrafoTopologicoTeses, procedencia: Procedencia): Precedente[] {
  return grafo.nos.filter(n => n.tipo === 'tese_vinculante').map(n => noParaPrecedente(n, procedencia));
}
