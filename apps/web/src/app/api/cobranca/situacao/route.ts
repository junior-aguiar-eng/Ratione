import { NextResponse } from 'next/server';
import { abrirContexto, usuarioDaCobranca } from '../../../../lib/cobranca/contexto';
import { assinaturaDoUsuario } from '../../../../lib/cobranca/banco';
import { registrar } from '../../../../lib/log';

/**
 * `GET /api/cobranca/situacao`: o que a tela precisa para mostrar (ou não) os planos pagos. Se a cobrança está desligada, ou o usuário não
 * está liberado (em teste, fora da lista), a resposta é sempre `{ disponivel: false }`, igual nos dois casos: não revela se a cobrança existe.
 */
const NAO = { disponivel: false } as const;

export async function GET() {
  try {
    const ctx = await abrirContexto();
    if (!ctx) return NextResponse.json(NAO);
    const usuario = await usuarioDaCobranca(ctx);
    if (!usuario) return NextResponse.json(NAO);

    const planos = await ctx.servidor.from('planos').select('id, nome, preco_mensal_centavos').in('id', ['essencial', 'profissional']).not('preco_mensal_centavos', 'is', null).order('ordem');
    if (planos.error) throw new Error(`ler planos: ${planos.error.message}`);
    const assinatura = await assinaturaDoUsuario(ctx.servidor, usuario.id);
    return NextResponse.json({
      disponivel: true,
      ambiente: ctx.cfg.ambiente,
      planos: (planos.data ?? []).map(p => ({ id: p.id, nome: p.nome, precoCentavos: p.preco_mensal_centavos })),
      assinatura: assinatura ? { plano: assinatura.plano, situacao: assinatura.situacao, cicloFim: assinatura.cicloFim } : null
    });
  } catch (e) {
    registrar('ERROR', 'Cobrança: erro ao ler a situação', { erro_mensagem: (e as Error).message.slice(0, 300) });
    return NextResponse.json(NAO);
  }
}
