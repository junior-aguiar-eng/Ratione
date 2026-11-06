import { NextResponse } from 'next/server';
import { contextoDeAnalises, NAO_HABILITADO } from '../../../../lib/analisesSalvas/contexto';
import { abrirAnalise, apagarAnalise } from '../../../../lib/analisesSalvas/servico';
import { veioDoSite } from '../../../../lib/origem';
import { registrar } from '../../../../lib/log';

/**
 * F5-10: `GET /api/analises-salvas/<id>` devolve o conteúdo decifrado de uma análise da própria pessoa; `DELETE` apaga (arquivo cifrado e
 * linha). Abrir exige a chave de cifra (flag ligada); apagar não depende dela: o que foi guardado precisa poder sumir mesmo com o salvamento desligado.
 */
export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

type Parametros = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Parametros) {
  const ctx = await contextoDeAnalises();
  if (!ctx?.completo) return NextResponse.json(NAO_HABILITADO, { status: 503 });
  if (!ctx.usuario) return NextResponse.json({ mensagem: 'Entre na sua conta.' }, { status: 401 });
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ mensagem: 'Análise não encontrada.' }, { status: 404 });
  try {
    const r = await abrirAnalise(ctx.usuario.id, id, ctx.completo);
    if (!r.ok) return NextResponse.json({ mensagem: r.mensagem }, { status: r.status });
    return NextResponse.json({ analise: r.analise, conteudo: r.conteudo }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    registrar('ERROR', 'Análises salvas: erro ao abrir', { erro_mensagem: (e as Error).message });
    return NextResponse.json({ mensagem: 'Não foi possível abrir a análise agora.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Parametros) {
  const ctx = await contextoDeAnalises();
  if (!ctx) return NextResponse.json(NAO_HABILITADO, { status: 503 });
  if (!veioDoSite(request)) return NextResponse.json({ mensagem: 'Origem não permitida.' }, { status: 403 });
  if (!ctx.usuario) return NextResponse.json({ mensagem: 'Entre na sua conta.' }, { status: 401 });
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ mensagem: 'Análise não encontrada.' }, { status: 404 });
  try {
    return (await apagarAnalise(ctx.usuario.id, id, ctx.basico))
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ mensagem: 'Análise não encontrada.' }, { status: 404 });
  } catch (e) {
    registrar('ERROR', 'Análises salvas: erro ao apagar', { erro_mensagem: (e as Error).message });
    return NextResponse.json({ mensagem: 'Não foi possível apagar a análise agora. Tente de novo.' }, { status: 500 });
  }
}
