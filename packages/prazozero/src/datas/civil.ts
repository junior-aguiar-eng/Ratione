/**
 * Datas civis puras (PLANO F0-10): dia, mês e ano do calendário gregoriano, sem fuso, sem horário e sem `Date`.
 * Uma data é uma string ISO "AAAA-MM-DD". A aritmética usa o número de dias desde 01/01/1970 (algoritmos de Howard Hinnant,
 * "chrono-Compatible Low-Level Date Algorithms"), de modo que o resultado nunca depende da máquina nem do fuso.
 */
export interface DataCivil {
  ano: number;
  mes: number; // 1 a 12
  dia: number; // 1 a 31
}

export function ehBissexto(ano: number): boolean {
  return (ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0;
}

export function diasNoMes(ano: number, mes: number): number {
  if (mes === 2) return ehBissexto(ano) ? 29 : 28;
  return [4, 6, 9, 11].includes(mes) ? 30 : 31;
}

/** Dias desde 01/01/1970 (negativo antes). */
export function paraDias(ano: number, mes: number, dia: number): number {
  const y = mes <= 2 ? ano - 1 : ano;
  const era = Math.floor(y / 400);
  const yoe = y - era * 400;
  const doy = Math.floor((153 * (mes + (mes > 2 ? -3 : 9)) + 2) / 5) + dia - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

export function deDias(dias: number): DataCivil {
  const z = dias + 719468;
  const era = Math.floor(z / 146097);
  const doe = z - era * 146097;
  const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const dia = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const mes = mp < 10 ? mp + 3 : mp - 9;
  return { ano: yoe + era * 400 + (mes <= 2 ? 1 : 0), mes, dia };
}

export function formatarCivil({ ano, mes, dia }: DataCivil): string {
  return `${String(ano).padStart(4, '0')}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

/** `null` se não for uma data real no formato AAAA-MM-DD. */
export function lerCivil(iso: string): DataCivil | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const ano = Number(m[1]);
  const mes = Number(m[2]);
  const dia = Number(m[3]);
  if (mes < 1 || mes > 12 || dia < 1 || dia > diasNoMes(ano, mes)) return null;
  return { ano, mes, dia };
}

export function ehDataIsoValida(iso: string): boolean {
  return lerCivil(iso) !== null;
}

/** Lê uma data que o código já garantiu válida; lança se não for. */
export function civil(iso: string): DataCivil {
  const d = lerCivil(iso);
  if (!d) throw new Error(`data inválida: "${iso}"`);
  return d;
}

export function paraDiasIso(iso: string): number {
  const { ano, mes, dia } = civil(iso);
  return paraDias(ano, mes, dia);
}

export function somarDiasIso(iso: string, n: number): string {
  return formatarCivil(deDias(paraDiasIso(iso) + n));
}

/** 0 = domingo, 6 = sábado. */
export function diaDaSemanaIso(iso: string): number {
  // 01/01/1970 foi quinta-feira (4)
  return (((paraDiasIso(iso) + 4) % 7) + 7) % 7;
}

/** Quantos dias de `a` até `b` (positivo se `b` é depois). */
export function diferencaDiasIso(a: string, b: string): number {
  return paraDiasIso(b) - paraDiasIso(a);
}

export function anoDe(iso: string): number {
  return civil(iso).ano;
}

/** Domingo de Páscoa (Meeus/Jones/Butcher), calendário gregoriano. */
export function pascoaIso(ano: number): string {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return formatarCivil({ ano, mes, dia });
}
