/**
 * Abre o diálogo de impressão do navegador (opção "Salvar como PDF"). O título da página vira o nome sugerido do arquivo.
 * `antes` roda antes de imprimir (ex.: abrir seções recolhidas) e devolve uma função que desfaz o que fez.
 */
export function exportarPdf(nomeArquivo: string, antes?: () => () => void): void {
  const tituloOriginal = document.title;
  const desfazer = antes?.();
  document.title = nomeArquivo;
  const restaurar = () => {
    document.title = tituloOriginal;
    desfazer?.();
    window.removeEventListener('afterprint', restaurar);
  };
  window.addEventListener('afterprint', restaurar);
  // Dá um quadro para a tela aplicar o que `antes` abriu
  setTimeout(() => window.print(), 100);
}

export function nomeArquivoSeguro(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
