/** Soma `n` dias a uma data civil AAAA-MM-DD, em UTC (sem fuso nem horário de verão). */
export function somarDiasIso(iso: string, n: number): string {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10);
}
