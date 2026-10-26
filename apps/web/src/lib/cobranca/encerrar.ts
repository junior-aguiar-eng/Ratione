import type { SupabaseClient } from '@supabase/supabase-js';
import { cobrancaPronta, type ConfigCobranca } from './config';
import type { ClienteMp } from './mercadopago';
import { registrar } from '../log';

/**
 * Cancela, no Mercado Pago, as assinaturas vivas de quem vai ter a conta excluída. O Mercado Pago cobra por conta própria: apagar a conta
 * sem cancelar deixaria o cartão sendo cobrado todo mês, sem conta nem tela para cancelar. Devolve `true` quando não havia assinatura viva
 * ou quando todas foram canceladas; `false` em qualquer outro caso (a exclusão da conta então não acontece).
 *
 * "Viva" é toda assinatura que não está `cancelada` e já tem id no Mercado Pago; a pendente que nunca chegou lá não cobra nada.
 */
export async function encerrarAssinaturasDoUsuario(
  servidor: SupabaseClient,
  usuarioId: string,
  cfg: ConfigCobranca,
  clienteMp: (token: string) => Pick<ClienteMp, 'cancelarAssinatura'>
): Promise<boolean> {
  const { data, error } = await servidor.from('assinaturas').select('id, mp_assinatura_id').eq('usuario_id', usuarioId).neq('situacao', 'cancelada');
  if (error) {
    registrar('ERROR', 'Exclusão de conta: não leu as assinaturas', { erro_mensagem: error.message });
    return false;
  }
  const vivas = (data ?? []).filter(a => a.mp_assinatura_id);
  if (vivas.length === 0) return true;
  // Com assinatura viva e sem cobrança configurada aqui, não dá para cancelar: recusar é melhor do que apagar a conta e deixar o cartão cobrando
  if (!cobrancaPronta(cfg)) {
    registrar('ERROR', 'Exclusão de conta: há assinatura no Mercado Pago, mas a cobrança não está configurada', { assinaturas: vivas.length });
    return false;
  }
  const mp = clienteMp(cfg.tokenMp!);
  for (const a of vivas) {
    try {
      await mp.cancelarAssinatura(a.mp_assinatura_id as string);
    } catch (e) {
      registrar('ERROR', 'Exclusão de conta: não cancelou a assinatura no Mercado Pago', { erro_mensagem: (e as Error).message.slice(0, 300) });
      return false;
    }
  }
  return true;
}
