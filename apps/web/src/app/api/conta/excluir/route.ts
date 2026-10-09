import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { excluirConta } from '../../../../lib/excluir-conta';

/**
 * Excluir a própria conta. Exige a chave secreta do Supabase (`SUPABASE_SERVICE_ROLE_KEY`), que existe
 * só no ambiente de deploy e nunca no repositório nem no navegador. Sem ela, a rota recusa.
 */
export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicavel = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const secreta = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !publicavel || !secreta) {
    return NextResponse.json({ mensagem: 'A exclusão da conta ainda não está habilitada nesta instalação.' }, { status: 503 });
  }

  // Só aceita pedido feito a partir do próprio site (defesa contra requisição forjada de outra origem)
  const origem = request.headers.get('origin');
  if (origem && origem !== new URL(request.url).origin) {
    return NextResponse.json({ mensagem: 'Origem não permitida.' }, { status: 403 });
  }

  let corpo: { senha?: unknown } = {};
  try {
    corpo = await request.json();
  } catch {
    /* corpo ausente: a validação abaixo recusa */
  }

  const armazem = await cookies();
  const sessao = createServerClient(url, publicavel, {
    cookies: {
      getAll: () => armazem.getAll(),
      setAll: lista => lista.forEach(({ name, value, options }) => armazem.set(name, value, options))
    }
  });
  const semSessao = { auth: { persistSession: false, autoRefreshToken: false } };

  const resultado = await excluirConta(corpo.senha, {
    usuarioAtual: async () => {
      const { data } = await sessao.auth.getUser();
      return data.user ? { id: data.user.id, email: data.user.email ?? null } : null;
    },
    // Cliente isolado: conferir a senha não troca nem renova a sessão do usuário
    conferirSenha: async (email, senha) => {
      const { error } = await createClient(url, publicavel, semSessao).auth.signInWithPassword({ email, password: senha });
      return !error;
    },
    apagarUsuario: async id => {
      const { error } = await createClient(url, secreta, semSessao).auth.admin.deleteUser(id);
      // Só no log do servidor: "Invalid API key" aqui indica SUPABASE_SERVICE_ROLE_KEY errada ou revogada
      if (error) console.error('[excluir-conta] deleteUser falhou:', error.status, error.message);
      return !error;
    }
  });

  if (!resultado.ok) return NextResponse.json({ mensagem: resultado.mensagem }, { status: resultado.status });
  await sessao.auth.signOut().catch(() => undefined);
  return NextResponse.json({ ok: true });
}
