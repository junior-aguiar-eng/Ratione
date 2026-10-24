import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { autorizarAdministrador, idsAdministradores } from './acesso';

/** Exclusivo do servidor. Não usa e-mail, user_metadata, parâmetro de URL ou cota/plano como papel administrativo. */
export async function administradorAtual(): Promise<boolean> {
  return (await usuarioAdministradorAtual()) !== null;
}

async function usuarioAdministradorAtual(): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const ids = process.env.RATIONE_ADMIN_USUARIO_IDS;
  if (!url || !chave || !ids) return null;
  const armazem = await cookies();
  const sessao = createServerClient(url, chave, {
    cookies: {
      getAll: () => armazem.getAll(),
      // O proxy renova a sessão da página. Em Server Components os cookies são somente leitura.
      setAll: lista => { try { lista.forEach(({ name, value, options }) => armazem.set(name, value, options)); } catch { /* somente leitura */ } }
    }
  });
  let usuarioId: string | null = null;
  const autorizado = await autorizarAdministrador(ids, async () => {
    const r = await sessao.auth.getUser();
    usuarioId = r.data.user?.id ?? null;
    return r;
  });
  return autorizado ? usuarioId : null;
}

export async function abrirServidorAdmin() {
  return (await abrirContextoAdmin())?.servidor ?? null;
}

export async function abrirContextoAdmin() {
  const usuarioId = await usuarioAdministradorAtual();
  if (!usuarioId) return null;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!chave) throw new Error('Painel não configurado.');
  const servidor = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, chave, { auth: { persistSession: false, autoRefreshToken: false } });
  return { servidor, usuarioId, protegidos: idsAdministradores(process.env.RATIONE_ADMIN_USUARIO_IDS) };
}
