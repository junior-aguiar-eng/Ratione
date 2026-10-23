/**
 * Tradução entre o que o Mercado Pago diz e o que o Ratione guarda (docs/produto/PLANOS_E_COBRANCA.md §7.2). O Mercado Pago manda o
 * estado da assinatura e o das cobranças; aqui eles viram as situações de `assinaturas` e de `cobrancas`. Estado que não conhecemos é
 * ignorado (devolve `null`), nunca interpretado por palpite.
 */

export type SituacaoAssinatura = 'pendente' | 'ativa' | 'em_atraso' | 'pausada' | 'cancelada';
export type SituacaoCobranca = 'aprovada' | 'pendente' | 'rejeitada' | 'reembolsada' | 'cancelada';

/** Estado da assinatura no Mercado Pago (`/preapproval`): pending, authorized, paused, cancelled. */
export function situacaoDaAssinatura(statusMp: string | null | undefined): SituacaoAssinatura | null {
  switch ((statusMp ?? '').toLowerCase()) {
    case 'pending':
      return 'pendente';
    case 'authorized':
      return 'ativa';
    case 'paused':
      return 'pausada';
    case 'cancelled':
    case 'canceled':
      return 'cancelada';
    default:
      return null;
  }
}

/** Estado de uma cobrança no Mercado Pago (pagamento da assinatura). */
export function situacaoDaCobranca(statusMp: string | null | undefined): SituacaoCobranca | null {
  switch ((statusMp ?? '').toLowerCase()) {
    case 'approved':
    case 'processed':
      return 'aprovada';
    case 'pending':
    case 'in_process':
    case 'authorized':
    case 'recycling':
      return 'pendente';
    case 'rejected':
      return 'rejeitada';
    case 'refunded':
    case 'charged_back':
      return 'reembolsada';
    case 'cancelled':
    case 'canceled':
      return 'cancelada';
    default:
      return null;
  }
}

/**
 * Situação da assinatura depois de uma cobrança: aprovada tira de "em atraso"; rejeitada de uma assinatura ativa coloca em atraso.
 * Qualquer outra combinação mantém a situação atual (a assinatura em si é governada pelo estado dela no Mercado Pago).
 */
export function situacaoAposCobranca(atual: SituacaoAssinatura, cobranca: SituacaoCobranca): SituacaoAssinatura {
  if (cobranca === 'rejeitada' && atual === 'ativa') return 'em_atraso';
  if (cobranca === 'aprovada' && atual === 'em_atraso') return 'ativa';
  return atual;
}
