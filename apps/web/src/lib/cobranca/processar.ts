import type { AssinaturaMp, CobrancaMp } from './mercadopago';
import { situacaoAposCobranca, situacaoDaAssinatura, situacaoDaCobranca, type SituacaoAssinatura, type SituacaoCobranca } from './estados';

/**
 * Processamento de um aviso (webhook) do Mercado Pago, já com a assinatura validada. Regra de ouro: o corpo do aviso só diz QUE algo mudou
 * e QUAL recurso; o que mudou é relido na API do Mercado Pago (`buscar…`), então um aviso forjado ou repetido não consegue inventar estado.
 * Idempotente: processar o mesmo aviso duas vezes dá o mesmo resultado.
 */

export interface Aviso {
  /** `subscription_preapproval` (a assinatura mudou) ou `subscription_authorized_payment` (uma cobrança dela). Outros são ignorados. */
  topico: string;
  recursoId: string;
}

export type ResultadoDoAviso = 'aplicado' | 'ignorado' | 'sem_assinatura' | 'recurso_inexistente';

export interface LeituraMp {
  buscarAssinatura(id: string): Promise<AssinaturaMp | null>;
  buscarCobranca(id: string): Promise<CobrancaMp | null>;
}

export interface BancoDaCobranca {
  /** Acha a nossa assinatura pelo id que mandamos ao Mercado Pago (`external_reference`) ou pelo id de lá. */
  acharAssinatura(p: { referencia: string | null; mpId: string | null }): Promise<{ id: string; situacao: SituacaoAssinatura } | null>;
  aplicar(assinaturaId: string, situacao: SituacaoAssinatura, mpSituacao: string, fimDoCiclo: string | null): Promise<void>;
  registrarCobranca(p: { assinaturaId: string; pagamentoId: string; valorCentavos: number; situacao: SituacaoCobranca; meio: string | null; pagaEm: string | null }): Promise<void>;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function processarAviso(aviso: Aviso, mp: LeituraMp, banco: BancoDaCobranca): Promise<ResultadoDoAviso> {
  if (aviso.topico === 'subscription_preapproval') {
    const a = await mp.buscarAssinatura(aviso.recursoId);
    if (!a) return 'recurso_inexistente';
    const nossa = await banco.acharAssinatura({ referencia: a.referencia && UUID.test(a.referencia) ? a.referencia : null, mpId: a.id });
    if (!nossa) return 'sem_assinatura';
    const situacao = situacaoDaAssinatura(a.status);
    if (!situacao) return 'ignorado';
    // Assinatura autorizada que estava "em atraso" só volta a "ativa" por uma cobrança aprovada, não por este aviso
    const final = situacao === 'ativa' && nossa.situacao === 'em_atraso' ? 'em_atraso' : situacao;
    await banco.aplicar(nossa.id, final, a.status, a.proximaCobranca);
    return 'aplicado';
  }

  if (aviso.topico === 'subscription_authorized_payment') {
    const c = await mp.buscarCobranca(aviso.recursoId);
    if (!c) return 'recurso_inexistente';
    const nossa = await banco.acharAssinatura({ referencia: null, mpId: c.assinaturaMpId });
    if (!nossa) return 'sem_assinatura';
    const situacao = situacaoDaCobranca(c.status);
    if (!situacao || !c.pagamentoId || c.valorCentavos === null) return 'ignorado';
    await banco.registrarCobranca({ assinaturaId: nossa.id, pagamentoId: c.pagamentoId, valorCentavos: c.valorCentavos, situacao, meio: c.meio, pagaEm: c.pagaEm });
    const depois = situacaoAposCobranca(nossa.situacao, situacao);
    if (depois !== nossa.situacao) await banco.aplicar(nossa.id, depois, depois === 'em_atraso' ? 'cobranca_rejeitada' : 'authorized', null);
    return 'aplicado';
  }

  return 'ignorado';
}
