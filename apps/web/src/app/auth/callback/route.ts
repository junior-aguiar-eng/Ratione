import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/**
 * Retorno do link enviado por e-mail (confirmação de cadastro e recuperação de senha).
 * Troca o código de uso único por uma sessão e a grava nos cookies.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const codigo = searchParams.get('code');
  const pedido = searchParams.get('proximo') ?? '/meu-espaco';
  // Só caminhos internos: evita redirecionar o usuário para outro site
  const proximo = pedido.startsWith('/') && !pedido.startsWith('//') ? pedido : '/meu-espaco';

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (codigo && url && chave) {
    const armazem = await cookies();
    const supabase = createServerClient(url, chave, {
      cookies: {
        getAll: () => armazem.getAll(),
        setAll: lista => lista.forEach(({ name, value, options }) => armazem.set(name, value, options))
      }
    });
    const { error } = await supabase.auth.exchangeCodeForSession(codigo);
    if (!error) return NextResponse.redirect(`${origin}${proximo}`);
  }
  return NextResponse.redirect(`${origin}/entrar?erro=link`);
}
