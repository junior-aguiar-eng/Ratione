import { NextResponse } from 'next/server';
import { abrirContexto, usuarioDaCobranca } from '../../../../lib/cobranca/contexto';
import { aplicarSituacao, criarAssinaturaPendente, vincularAoMp } from '../../../../lib/cobranca/banco';
import { ErroMp, criarClienteMp } from '../../../../lib/cobranca/mercadopago';
import { origemPublica } from '../../../../lib/origem';
import { registrar } from '../../../../lib/log';

/**
 * `POST /api/cobranca/assinar` com `{ plano }`: cria a assinatura pendente (o preço vem do banco, nunca do navegador) e a assinatura no
 * Mercado Pago, e devolve o link da página de pagamento de lá. O cartão nunca passa por aqui. Desligada ou fora da lista de teste: 503.
 */
const INDISPONIVEL = { mensagem: 'A assinatura de planos ainda não está disponível.' };
const CINCO_ANOS_MS = 5 * 365 * 24 * 3600 * 1000;

export async function POST(request: Request) {
  const ctx = await abrirContexto();
  if (!ctx) return NextResponse.json(INDISPONIVEL, { status: 503 });

  const origem = request.headers.get('origin');
  if (origem && origem !== origemPublica(request)) return NextResponse.json({ mensagem: 'Origem não permitida.' }, { status: 403 });

  const usuario = await usuarioDaCobranca(ctx);
  if (!usuario) return NextResponse.json(INDISPONIVEL, { status: 503 });

  const plano = ((await request.json().catch(() => null)) as { plano?: unknown } | null)?.plano;
  if (plano !== 'essencial' && plano !== 'profissional') return NextResponse.json({ mensagem: 'Plano inválido.' }, { status: 400 });

  try {
    const pendente = await criarAssinaturaPendente(ctx.servidor, usuario.id, plano, ctx.cfg.ambiente);
    if ('erro' in pendente) {
      const mensagens = {
        plano_invalido: 'Plano inválido.',
        preco_nao_definido: 'O preço deste plano ainda não foi definido.',
        ja_assinante: 'Você já tem uma assinatura. Cancele a atual antes de assinar outro plano.'
      } as const;
      return NextResponse.json({ mensagem: mensagens[pendente.erro], motivo: pendente.erro }, { status: pendente.erro === 'plano_invalido' ? 400 : 409 });
    }

    const mp = criarClienteMp(ctx.cfg.tokenMp!);
    // Checkout abandonado de antes: cancela lá também, para não ficar assinatura pendente solta (falha aqui não impede a nova)
    for (const antiga of pendente.antigas) await mp.cancelarAssinatura(antiga).catch(() => undefined);

    try {
      const nome = plano === 'essencial' ? 'Essencial' : 'Profissional';
      const criada = await mp.criarAssinatura({
        motivo: `Ratione, plano ${nome}`,
        referencia: pendente.assinaturaId,
        email: usuario.email,
        valorCentavos: pendente.valorCentavos,
        backUrl: `${origemPublica(request)}/meu-espaco/uso?assinatura=retorno`,
        fim: new Date(Date.now() + CINCO_ANOS_MS)
      });
      await vincularAoMp(ctx.servidor, pendente.assinaturaId, criada.id);
      return NextResponse.json({ url: criada.linkDePagamento });
    } catch (e) {
      // Não conseguiu criar lá: a pendente local não serve para nada
      await aplicarSituacao(ctx.servidor, pendente.assinaturaId, 'cancelada', 'falha_ao_criar', null).catch(() => undefined);
      registrar('ERROR', 'Cobrança: não criou a assinatura no Mercado Pago', { erro_mensagem: (e as Error).message.slice(0, 300), status_mp: e instanceof ErroMp ? e.status : null });
      return NextResponse.json({ mensagem: 'Não foi possível iniciar a assinatura agora. Tente de novo em alguns minutos.' }, { status: 502 });
    }
  } catch (e) {
    registrar('ERROR', 'Cobrança: erro ao assinar', { erro_mensagem: (e as Error).message.slice(0, 300) });
    return NextResponse.json({ mensagem: 'Não foi possível iniciar a assinatura agora. Tente de novo em alguns minutos.' }, { status: 500 });
  }
}
