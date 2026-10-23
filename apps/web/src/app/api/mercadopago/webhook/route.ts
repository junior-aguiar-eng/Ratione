import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cobrancaPronta, lerConfigCobranca } from '../../../../lib/cobranca/config';
import { assinaturaValida } from '../../../../lib/cobranca/webhook';
import { criarClienteMp } from '../../../../lib/cobranca/mercadopago';
import { processarAviso } from '../../../../lib/cobranca/processar';
import { bancoDaCobranca, concluirEvento, descartarEvento, registrarEvento } from '../../../../lib/cobranca/banco';
import { registrar } from '../../../../lib/log';

/**
 * `POST /api/mercadopago/webhook`: avisos do Mercado Pago sobre assinaturas e cobranças. Cobrança desligada: 503 e nada é lido.
 * Ordem: assinatura do aviso (HMAC com o segredo da aplicação; inválida = 401 sem gravar nada) → registro do aviso (o mesmo `x-request-id`
 * não é processado duas vezes) → o recurso é RELIDO na API do Mercado Pago (o corpo do aviso só diz qual recurso mudou) → banco.
 * Falha no processamento: o registro do aviso é descartado e a resposta é 500, para o Mercado Pago reenviar.
 */
export async function POST(request: Request) {
  const cfg = lerConfigCobranca(process.env);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secreta = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!cobrancaPronta(cfg) || !url || !secreta) return NextResponse.json({ ok: false }, { status: 503 });

  const consulta = new URL(request.url).searchParams;
  const corpo = (await request.json().catch(() => null)) as { type?: unknown; data?: { id?: unknown } } | null;
  const dataId = consulta.get('data.id') ?? (typeof corpo?.data?.id === 'string' || typeof corpo?.data?.id === 'number' ? String(corpo.data.id) : null);
  const requestId = request.headers.get('x-request-id');

  if (!assinaturaValida({ xSignature: request.headers.get('x-signature'), xRequestId: requestId, dataId: consulta.get('data.id'), segredo: cfg.segredoWebhook! })) {
    registrar('WARNING', 'Cobrança: aviso com assinatura inválida');
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const topico = consulta.get('type') ?? (typeof corpo?.type === 'string' ? corpo.type : null);
  if (!topico || !dataId) return NextResponse.json({ ok: true, resultado: 'ignorado' });

  const servidor = createClient(url, secreta, { auth: { persistSession: false, autoRefreshToken: false } });
  let eventoId: number | null = null;
  try {
    eventoId = await registrarEvento(servidor, cfg.ambiente, topico, dataId, requestId);
    if (eventoId === null) return NextResponse.json({ ok: true, resultado: 'repetido' });

    const resultado = await processarAviso({ topico, recursoId: dataId }, criarClienteMp(cfg.tokenMp!), bancoDaCobranca(servidor));
    await concluirEvento(servidor, eventoId, resultado);
    return NextResponse.json({ ok: true, resultado });
  } catch (e) {
    registrar('ERROR', 'Cobrança: erro ao processar o aviso', { topico, erro_mensagem: (e as Error).message.slice(0, 300) });
    if (eventoId !== null) await descartarEvento(servidor, eventoId).catch(() => undefined);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
