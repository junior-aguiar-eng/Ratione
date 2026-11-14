/**
 * Monta o caminho completo de retorno preservando a query string original.
 */
export function destinoDeRetorno(pathname: string, search: string): string {
  return search ? `${pathname}${search}` : pathname;
}

/**
 * Garante que o destino de redirecionamento seja um caminho interno relativo,
 * rejeitando URLs externas, protocol-relative (`//`), backslashes e valores vazios.
 */
export function caminhoSeguro(pedido: string | null | undefined, padrao = '/meu-espaco'): string {
  const valor = pedido?.trim();
  if (!valor) return padrao;
  if (!valor.startsWith('/') || valor.startsWith('//') || valor.includes('\\')) return padrao;
  return valor;
}
