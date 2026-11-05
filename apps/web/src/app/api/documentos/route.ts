import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { lerConfigDeDocumentos } from '../../../lib/documentos/config';
import { dependenciasPadrao, enviarDocumento, listarDocumentos, type DependenciasDeDocumentos } from '../../../lib/documentos/servico';
import { armazenamentoEBanco } from '../../../lib/documentos/supabase';
import { LIMITES_DE_DOCUMENTO } from '../../../lib/documentos/validar';
import { veioDoSite } from '../../../lib/origem';
import { registrar } from '../../../lib/log';

/**
 * F5-01: documentos do usuário (docs/produto/ARGUMENTA.md §9). `POST` envia um arquivo (multipart, campo `arquivo`); `GET` lista os do
 * usuário. O arquivo é cifrado antes de ser guardado, expira em até 7 dias e nunca tem o nome guardado. Desligado por padrão: sem
 * `ARGUMENTA_UPLOAD_LIGADO=sim` e `DOCUMENTOS_CHAVE` a rota responde 503 (RIPD, seção 7).
 */
export const dynamic = 'force-dynamic';

const NAO_HABILITADO = { mensagem: 'O envio de documentos ainda não está disponível.' };

async function contexto() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicavel = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const secreta = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const config = lerConfigDeDocumentos(process.env);
  if (!url || !publicavel || !secreta || !config) return null;
  const armazem = await cookies();
  const sessao = createServerClient(url, publicavel, {
    cookies: { getAll: () => armazem.getAll(), setAll: lista => lista.forEach(({ name, value, options }) => armazem.set(name, value, options)) }
  });
  const { data } = await sessao.auth.getUser();
  const servidor = createClient(url, secreta, { auth: { persistSession: false, autoRefreshToken: false } });
  const dep: DependenciasDeDocumentos = { chave: config.chave, retencaoDias: config.retencaoDias, ...dependenciasPadrao(), ...armazenamentoEBanco(servidor) };
  return { usuario: data.user, dep };
}

export async function POST(request: Request) {
  const ctx = await contexto();
  if (!ctx) return NextResponse.json(NAO_HABILITADO, { status: 503 });
  if (!veioDoSite(request)) return NextResponse.json({ mensagem: 'Origem não permitida.' }, { status: 403 });
  if (!ctx.usuario) return NextResponse.json({ mensagem: 'Entre na sua conta para enviar um documento.' }, { status: 401 });

  // Recusa antes de ler o corpo inteiro quando o tamanho declarado já passa do limite (com folga para o envelope multipart)
  const declarado = Number(request.headers.get('content-length'));
  if (Number.isFinite(declarado) && declarado > LIMITES_DE_DOCUMENTO.maxBytes + 64 * 1024) {
    return NextResponse.json({ mensagem: `O arquivo passa de ${LIMITES_DE_DOCUMENTO.maxBytes / 1024 / 1024} MB.` }, { status: 413 });
  }
  let arquivo: FormDataEntryValue | null = null;
  try {
    arquivo = (await request.formData()).get('arquivo');
  } catch {
    arquivo = null;
  }
  if (!(arquivo instanceof File)) return NextResponse.json({ mensagem: 'Envie um arquivo no campo "arquivo".' }, { status: 400 });

  try {
    const r = await enviarDocumento(ctx.usuario.id, new Uint8Array(await arquivo.arrayBuffer()), ctx.dep);
    if (!r.ok) return NextResponse.json({ mensagem: r.mensagem }, { status: r.status });
    return NextResponse.json({ documento: r.documento }, { status: 201 });
  } catch (e) {
    // Só o motivo técnico no log: nunca o nome nem o conteúdo do arquivo
    registrar('ERROR', 'Documentos: erro ao guardar', { erro_mensagem: (e as Error).message });
    return NextResponse.json({ mensagem: 'Não foi possível guardar o arquivo agora. Tente de novo em alguns minutos.' }, { status: 500 });
  }
}

export async function GET() {
  const ctx = await contexto();
  if (!ctx) return NextResponse.json(NAO_HABILITADO, { status: 503 });
  if (!ctx.usuario) return NextResponse.json({ mensagem: 'Entre na sua conta.' }, { status: 401 });
  try {
    return NextResponse.json({ documentos: await listarDocumentos(ctx.usuario.id, ctx.dep) });
  } catch (e) {
    registrar('ERROR', 'Documentos: erro ao listar', { erro_mensagem: (e as Error).message });
    return NextResponse.json({ mensagem: 'Não foi possível listar os arquivos agora.' }, { status: 500 });
  }
}
