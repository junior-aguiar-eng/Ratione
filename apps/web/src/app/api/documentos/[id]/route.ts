import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { apagarDocumento, dependenciasPadrao } from '../../../../lib/documentos/servico';
import { armazenamentoEBanco } from '../../../../lib/documentos/supabase';
import { veioDoSite } from '../../../../lib/origem';
import { registrar } from '../../../../lib/log';

/** F5-01: `DELETE /api/documentos/<id>` apaga um documento do próprio usuário (o arquivo cifrado e a linha). */
export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicavel = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const secreta = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // Apagar não depende da flag do envio: o que foi guardado precisa poder ser apagado mesmo com o envio desligado
  if (!url || !publicavel || !secreta) {
    return NextResponse.json({ mensagem: 'O envio de documentos ainda não está disponível.' }, { status: 503 });
  }
  if (!veioDoSite(request)) return NextResponse.json({ mensagem: 'Origem não permitida.' }, { status: 403 });

  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ mensagem: 'Arquivo não encontrado.' }, { status: 404 });

  const armazem = await cookies();
  const sessao = createServerClient(url, publicavel, {
    cookies: { getAll: () => armazem.getAll(), setAll: lista => lista.forEach(({ name, value, options }) => armazem.set(name, value, options)) }
  });
  const { data } = await sessao.auth.getUser();
  if (!data.user) return NextResponse.json({ mensagem: 'Entre na sua conta.' }, { status: 401 });

  try {
    const servidor = createClient(url, secreta, { auth: { persistSession: false, autoRefreshToken: false } });
    const apagou = await apagarDocumento(data.user.id, id, { ...dependenciasPadrao(), ...armazenamentoEBanco(servidor) });
    return apagou ? NextResponse.json({ ok: true }) : NextResponse.json({ mensagem: 'Arquivo não encontrado.' }, { status: 404 });
  } catch (e) {
    registrar('ERROR', 'Documentos: erro ao apagar', { erro_mensagem: (e as Error).message });
    return NextResponse.json({ mensagem: 'Não foi possível apagar o arquivo agora. Tente de novo.' }, { status: 500 });
  }
}
