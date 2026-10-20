/**
 * Número do artigo como o parser escreve ("5º" até 9; sem ordinal a partir de 10). Módulo puro: roda no navegador.
 * Quem pesquisa "art. 5 CF" não digita o ordinal, mas a base guarda "art. 5º": de 1 a 9 o ordinal entra sempre.
 */
export function numeroComoNoParser(digitos: string, _ordinal: boolean, letra: string | undefined): string {
  const n = Number(digitos.replace(/\./g, ''));
  const base = n <= 9 ? `${digitos}º` : digitos;
  return letra ? `${base}-${letra}` : base;
}
