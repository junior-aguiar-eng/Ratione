import { NextResponse } from 'next/server';
import { abrirContexto, usuarioDaCobranca } from '../../../../lib/cobranca/contexto';
import { aplicarSituacao, assinaturaDoUsuario } from '../../../../lib/cobranca/banco';
import { ErroMp, criarClienteMp } from '../../../../lib/cobranca/mercadopago';
import { origemPublica } from '../../../../lib/origem';
import { registrar } from '../../../../lib/log';

/**
 * `POST /api/cobranca/cancelar`: cancela a assinatura do usuário no Mercado Pago. O plano vale até o fim do ciclo já pago (o fim do ciclo é
 * lido do Mercado Pago ANTES de cancelar, porque depois da próxima cobrança deixa de existir lá). Sem multa, sem retenção.
 */
const INDISPONIVEL = { mensagem: 'O cancelamento de planos ainda não está disponível.' };

export async function POST(request: Request) {
  const ctx = await abrirContexto();
  if (!ctx) return NextResponse.json(INDISPONIVEL, { status: 503 });

  const origem = request.headers.get('origin');
  if (origem && origem !== origemPublica(request)) return NextResponse.json({ mensagem: 'Origem não permitida.' }, { status: 403 });

  const usuario = await usuarioDaCobranca(ctx);
  if (!usuario) return NextResponse.json(INDISPONIVEL, { status: 503 });

  try {
    const a = await assinaturaDoUsuario(ctx.servidor, usuario.id);
    if (!a || a.situacao === 'cancelada') return NextResponse.json({ mensagem: 'Você não tem uma assinatura para cancelar.' }, { status: 404 });
    if (!a.mpId) {
      // Pendente que nunca chegou ao Mercado Pago: só encerra aqui
      await aplicarSituacao(ctx.servidor, a.id, 'cancelada', 'cancelada_pelo_cliente', null);
      return NextResponse.json({ ok: true, cicloFim: null });
    }

    const mp = criarClienteMp(ctx.cfg.tokenMp!);
    const atual = await mp.buscarAssinatura(a.mpId);
    await mp.cancelarAssinatura(a.mpId);
    const fim = atual?.proximaCobranca ?? null;
    await aplicarSituacao(ctx.servidor, a.id, 'cancelada', 'cancelled', fim);
    return NextResponse.json({ ok: true, cicloFim: fim ?? a.cicloFim });
  } catch (e) {
    registrar('ERROR', 'Cobrança: erro ao cancelar', { erro_mensagem: (e as Error).message.slice(0, 300), status_mp: e instanceof ErroMp ? e.status : null });
    return NextResponse.json({ mensagem: 'Não foi possível cancelar agora. Tente de novo em alguns minutos.' }, { status: 502 });
  }
}
