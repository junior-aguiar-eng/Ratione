/**
 * Helpers puros de apresentação e edição para telas de uso, cálculo de prazos e retorno de assinatura.
 */
import type { RegimeContagem } from '@ratione/prazozero';
import type { ParametrosPrazoZero } from './parametrosSalvos';

/** Percentual inteiro de uso entre 0 e 100; evita `NaN` quando a cota é zero ou inválida. */
export function percentualDeUso(usadas: number, quantidade: number): number {
  if (!Number.isFinite(quantidade) || quantidade <= 0) return 0;
  if (!Number.isFinite(usadas) || usadas <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((usadas / quantidade) * 100)));
}

/** Garante que `memoriaCalculo` possui ao menos dois registros antes de ler `memoriaCalculo[1]`. */
export function exibeMemoriaCalculo<T>(memoriaCalculo: readonly T[] | null | undefined): memoriaCalculo is readonly [T, T, ...T[]] {
  return Array.isArray(memoriaCalculo) && memoriaCalculo.length > 1;
}

/** Mantém o campo numérico temporariamente vazio durante a digitação, sem forçar fallback a cada tecla. */
export function editarCampoNumerico(bruto: string): string {
  if (bruto.trim() === '') return '';
  return bruto.replace(/\D/g, '');
}

/** Converte a string em edição para inteiro ou `null` se estiver vazia/inválida. */
export function numeroEmEdicao(bruto: string): number | null {
  const limpo = bruto.trim();
  if (!limpo) return null;
  const n = Number(limpo);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

/** Resolve o número confirmado (blur/submit), aplicando `padrao` se vazio/inválido e limitando ao intervalo. */
export function resolverNumeroNoIntervalo(bruto: string, minimo: number, maximo: number, padrao = minimo): number {
  const n = numeroEmEdicao(bruto);
  const base = n === null ? Math.trunc(padrao) : n;
  return Math.min(Math.max(base, minimo), maximo);
}

/** Indica se os parâmetros recebidos via URL trazem opções avançadas preenchidas além do padrão do ato. */
export function temOpcoesAvancadasNaUrl(
  salvo: Partial<Pick<ParametrosPrazoZero, 'atoId' | 'regime' | 'dobro' | 'litisconsortes' | 'excecaoCriminal'>>,
  regimePadrao: RegimeContagem = 'cpc_dias_uteis'
): boolean {
  return Boolean(salvo.dobro || salvo.litisconsortes || salvo.excecaoCriminal || (salvo.regime && salvo.regime !== regimePadrao));
}

/** Remove `assinatura` da query string preservando os demais parâmetros e o hash; devolve `null` se não houver o parâmetro. */
export function urlSemParametroAssinatura(caminhoESearch: string): string | null {
  const url = new URL(caminhoESearch, 'https://ratione.local');
  if (!url.searchParams.has('assinatura')) return null;
  url.searchParams.delete('assinatura');
  const search = url.searchParams.toString();
  return `${url.pathname}${search ? `?${search}` : ''}${url.hash}`;
}
