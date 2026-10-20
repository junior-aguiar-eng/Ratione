/** Número do artigo como o parser escreve ("5º" até 9; sem ordinal a partir de 10). Módulo puro: roda no navegador. */
export function numeroComoNoParser(digitos: string, ordinal: boolean, letra: string | undefined): string {
  const n = Number(digitos.replace(/\./g, ''));
  const base = ordinal && n <= 9 ? `${digitos}º` : digitos;
  return letra ? `${base}-${letra}` : base;
}
