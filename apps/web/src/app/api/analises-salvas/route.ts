import { NextResponse } from 'next/server';
import { contextoDeAnalises, NAO_HABILITADO } from '../../../lib/analisesSalvas/contexto';
import { analisesQueCitam, listarAnalises, salvarAnalise } from '../../../lib/analisesSalvas/servico';
import { LIMITES_DE_ANALISE_SALVA } from '../../../lib/analisesSalvas/validar';
import { lerJsonLimitado } from '../../../lib/corpoJson';
import { veioDoSite } from '../../../lib/origem';
import { registrar } from '../../../lib/log';

/**
 * F5-10: análises salvas por decisão expressa da pessoa (docs/produto/ARGUMENTA.md §11, RIPD 0.3 seção 7.3).
 * `POST` guarda uma análise: `{ conteudo, prazo: '30d' | '6m' | '1a' | 'sempre', rotulo? }`; o conteúdo é cifrado antes de ser guardado e a
 * pessoa tem no máximo 10. `GET` lista as da pessoa; `GET ?cita=normaviva:<id>` ou `tesemap:<id>` lista só as que citam aquela fonte.
 * Gravar exige `ARGUMENTA_SALVAR_LIGADO=sim` e `ANALISES_CHAVE`; sem eles a rota responde 503 e nada é guardado.
 */
export const dynamic = 'force-dynamic';

// O conteúdo (decisão completa) chega a 5 MB; a rota recusa antes de ler mais que isso, com folga para o envelope
const LIMITE_DO_CORPO = LIMITES_DE_ANALISE_SALVA.maxBytes + 256 * 1024;

export async function POST(request: Request) {
  const ctx = await contextoDeAnalises();
  if (!ctx?.completo) return NextResponse.json(NAO_HABILITADO, { status: 503 });
  if (!veioDoSite(request)) return NextResponse.json({ mensagem: 'Origem não permitida.' }, { status: 403 });
  if (!ctx.usuario) return NextResponse.json({ mensagem: 'Entre na sua conta para salvar a análise.' }, { status: 401 });

  type Pedido = { conteudo?: unknown; prazo?: unknown; rotulo?: unknown };
  let pedido = null as Pedido | null;
  try {
    const lido = await lerJsonLimitado(request, LIMITE_DO_CORPO);
    if (!lido.ok) return NextResponse.json({ mensagem: lido.mensagem }, { status: lido.status });
    pedido = lido.valor as Pedido | null;
  } catch {
    pedido = null;
  }
  if (!pedido || typeof pedido !== 'object') return NextResponse.json({ mensagem: 'Pedido inválido.' }, { status: 400 });

  try {
    const r = await salvarAnalise(ctx.usuario.id, { conteudo: pedido.conteudo, prazo: pedido.prazo, rotulo: pedido.rotulo }, ctx.completo);
    if (!r.ok) return NextResponse.json({ mensagem: r.mensagem }, { status: r.status });
    return NextResponse.json({ analise: r.analise }, { status: 201 });
  } catch (e) {
    // Só o motivo técnico no log: nunca o conteúdo nem o rótulo
    registrar('ERROR', 'Análises salvas: erro ao guardar', { erro_mensagem: (e as Error).message });
    return NextResponse.json({ mensagem: 'Não foi possível salvar a análise agora. Tente de novo em alguns minutos.' }, { status: 500 });
  }
}

const CITACAO = /^(normaviva|tesemap):[^\u0000-\u001f]{1,120}$/;

export async function GET(request: Request) {
  const ctx = await contextoDeAnalises();
  if (!ctx) return NextResponse.json(NAO_HABILITADO, { status: 503 });
  if (!ctx.usuario) return NextResponse.json({ mensagem: 'Entre na sua conta.' }, { status: 401 });
  const cita = new URL(request.url).searchParams.get('cita');
  if (cita !== null && !CITACAO.test(cita)) return NextResponse.json({ mensagem: 'Citação inválida.' }, { status: 400 });
  try {
    const analises = cita ? await analisesQueCitam(ctx.usuario.id, cita, ctx.basico) : await listarAnalises(ctx.usuario.id, ctx.basico);
    return NextResponse.json({ analises, salvarLigado: ctx.completo !== null });
  } catch (e) {
    registrar('ERROR', 'Análises salvas: erro ao listar', { erro_mensagem: (e as Error).message });
    return NextResponse.json({ mensagem: 'Não foi possível listar as análises agora.' }, { status: 500 });
  }
}
