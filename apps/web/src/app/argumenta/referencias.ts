/** Mantém as âncoras para a navegação sem apresentá-las como parágrafos legais. */
export function referenciaVisual(numeros: readonly number[]) {
  const trechos = [...new Set(numeros)].sort((a, b) => a - b);
  return {
    trechos,
    rotulo: 'Ver no texto',
    descricao: trechos.length === 1
      ? 'Localizar trecho no texto da decisão'
      : `Localizar ${trechos.length} trechos no texto da decisão`
  };
}
