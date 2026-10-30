import { MAX_PARAGRAFOS, segmentar } from './segmentar';
import { pseudonimizar, type Substituicao } from './pseudonimizar';

/**
 * A decisão como sai do navegador: parágrafos já pseudonimizados. É o mesmo formato nas três etapas de IA do Argumenta
 * (`argumenta-estrutura`, `argumenta-questoes`, `argumenta-fundamentos`) e na tela.
 */

/**
 * Tamanho máximo da decisão montada para o modelo (cerca de 20 páginas). Com as até 10 questões que a etapa de fundamentos recebe
 * junto, a mensagem fica abaixo do teto de 85.000 caracteres da política de IA. Era 21.000 (cerca de 6 páginas) até 30/10/2026: a
 * medição do corpus mostrou chamadas de até 13 s com entradas de 30 mil caracteres, e a saída é limitada por itens, não pela entrada.
 */
export const LIMITE_CARACTERES_DECISAO = 70_000;

export interface DecisaoPreparada {
  /** Parágrafos com marcadores no lugar dos dados pessoais: é só isso que vai ao servidor. */
  paragrafos: string[];
  /** Tabela de troca: fica no navegador, para mostrar os dados reais. */
  substituicoes: Substituicao[];
  /** Tamanho da decisão montada para o modelo, para a tela avisar antes de enviar. */
  caracteres: number;
}

/** Segmenta e depois pseudonimiza (assim um nome quebrado entre duas linhas do PDF já chega inteiro à detecção). */
export function prepararDecisao(texto: string, nomesExtras: readonly string[] = []): DecisaoPreparada {
  const brutos = segmentar(texto);
  const { texto: trocado, substituicoes } = pseudonimizar(brutos.join('\n\n'), nomesExtras);
  const paragrafos = trocado.split('\n\n');
  return { paragrafos, substituicoes, caracteres: blocoDaDecisao(paragrafos).length };
}

/** A decisão entre marcas, um parágrafo por linha com o número: as etapas só citam parágrafos por esse número. */
export function blocoDaDecisao(paragrafos: readonly string[]): string {
  return ['<decisao>', ...paragrafos.map((p, i) => `§${i + 1}. ${p}`), '</decisao>'].join('\n');
}

/** Parágrafos aceitáveis vindos do navegador: lista de textos curtos, sem quebra de parágrafo dentro, dentro dos limites. */
export function paragrafosValidos(bruto: unknown): bruto is string[] {
  return (
    Array.isArray(bruto) &&
    bruto.length >= 1 &&
    bruto.length <= MAX_PARAGRAFOS &&
    bruto.every(p => typeof p === 'string' && p.trim().length > 0 && p.length <= 8_000 && !p.includes('\n\n')) &&
    blocoDaDecisao(bruto).length <= LIMITE_CARACTERES_DECISAO
  );
}

/** Todos os números de parágrafo citados existem na decisão (1 a `total`). */
export function paragrafosExistem(numeros: readonly number[], total: number): boolean {
  return numeros.every(n => Number.isInteger(n) && n >= 1 && n <= total);
}
