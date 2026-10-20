/**
 * Linha do tempo das redações de um dispositivo (F3-04): da mais antiga para a atual, com o período, o ato e o que a base sabe (ou não) sobre
 * a data e a conferência do texto. Função pura, sem React.
 */
import type { Versao } from './normaviva';
import { ROTULO_ORIGEM } from './normavivaApresentacao';

export interface EtapaDaLinha {
  chave: string;
  titulo: string;
  /** "de 04/09/1942 a 02/08/1957", "até 02/08/1957", "desde 03/08/1957" ou vazio. */
  periodo: string;
  ato: string;
  atual: boolean;
  /** As datas são as de publicação do ato, não a vigência confirmada. */
  provisoria: boolean;
  /** Só nas redações anteriores: se o revisor conferiu o texto; `null` na atual (texto da página compilada). */
  conferida: boolean | null;
}

export function linhaDoTempo(versoes: Versao[], dataCurta: (iso: string) => string): EtapaDaLinha[] {
  const ordenadas = [...versoes].sort((a, b) => {
    if (!a.vigente_ate !== !b.vigente_ate) return a.vigente_ate ? -1 : 1; // anteriores antes da atual
    return (a.vigente_ate ?? '').localeCompare(b.vigente_ate ?? '');
  });
  return ordenadas.map((v, i) => {
    const atual = !v.vigente_ate;
    const periodo = atual
      ? v.vigente_de
        ? `desde ${dataCurta(v.vigente_de)}`
        : ''
      : v.vigente_de
        ? `de ${dataCurta(v.vigente_de)} a ${dataCurta(v.vigente_ate!)}`
        : `até ${dataCurta(v.vigente_ate!)}`;
    return {
      chave: `${i}-${v.hash}`,
      titulo: atual ? 'Redação atual' : v.origem === 'redacao_original' ? 'Redação original' : 'Redação anterior',
      periodo,
      ato: v.ato_rotulo ? `${ROTULO_ORIGEM[v.origem]}: ${v.ato_rotulo}` : ROTULO_ORIGEM[v.origem],
      atual,
      provisoria: !v.vigencia_confirmada,
      conferida: atual ? null : !!v.conferida_em
    };
  });
}
