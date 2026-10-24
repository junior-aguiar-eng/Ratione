/** Cotação manual só para a apresentação; sem consulta externa, persistência ou alteração dos fundos. */
export function lerCotacao(texto: string): number | null {
  const s = texto.trim();
  if (!/^\d{1,4}(?:[.,]\d{1,6})?$/.test(s)) return null;
  const numero = Number(s.replace(',','.'));
  return numero > 0 && numero <= 1000 ? numero : null;
}

export function margemAposIa(receitaCentavos: number, custoUsd: number, cotacao: number | null): { saldoReais: number; percentual: number } | null {
  if (!cotacao || !Number.isFinite(cotacao) || cotacao <= 0 || receitaCentavos <= 0) return null;
  const receita = receitaCentavos / 100;
  const saldoReais = receita - custoUsd * cotacao;
  return { saldoReais, percentual: 100 * saldoReais / receita };
}

export function situacaoFundo(orcamento: number, custo: number, reservado: number): { percentual: number; situacao: 'normal' | 'alerta' | 'esgotado' } {
  const percentual = orcamento > 0 ? 100 * (custo + reservado) / orcamento : 100;
  return { percentual, situacao: percentual >= 100 ? 'esgotado' : percentual >= 80 ? 'alerta' : 'normal' };
}

export const dolares = (valor: number) => `US$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
