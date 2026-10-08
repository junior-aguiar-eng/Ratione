import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Conta obrigatória: as ferramentas e as áreas pessoais só abrem para quem está logado.
 * A decisão é tomada no servidor, antes da página ser entregue (o usuário é validado no Supabase a cada acesso).
 * Ficam públicos: a página inicial, a metodologia, os termos, a privacidade e a tela de entrada.
 * Sem a configuração do Supabase (`.env.local`), o servidor não bloqueia nada: é o ambiente de desenvolvimento sem conta.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !chave) return NextResponse.next();

  let resposta = NextResponse.next({ request });
  const supabase = createServerClient(url, chave, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: lista => {
        lista.forEach(({ name, value }) => request.cookies.set(name, value));
        resposta = NextResponse.next({ request });
        lista.forEach(({ name, value, options }) => resposta.cookies.set(name, value, options));
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    const destino = request.nextUrl.clone();
    destino.pathname = '/entrar';
    destino.search = `?proximo=${encodeURIComponent(request.nextUrl.pathname)}`;
    return NextResponse.redirect(destino);
  }
  return resposta;
}

export const config = {
  matcher: ['/prazozero/:path*', '/normaviva/:path*', '/tesemap/:path*', '/argumenta/:path*', '/meu-espaco/:path*', '/conta/:path*']
};
