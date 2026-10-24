import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { autorizarAdministrador } from './acesso';

/** Exclusivo do servidor. Não usa e-mail, user_metadata, parâmetro de URL ou cota/plano como papel administrativo. */
export async function administradorAtual(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const ids = process.env.RATIONE_ADMIN_USUARIO_IDS;
  if (!url || !chave || !ids) return false;
  const armazem = await cookies();
  const sessao = createServerClient(url, chave, {
    cookies: {
      getAll: () => armazem.getAll(),
      // O proxy renova a sessão da página. Em Server Components os cookies são somente leitura.
      setAll: lista => { try { lista.forEach(({ name, value, options }) => armazem.set(name, value, options)); } catch { /* somente leitura */ } }
    }
  });
  return autorizarAdministrador(ids, () => sessao.auth.getUser());
}

export async function abrirServidorAdmin() {
  if (!await administradorAtual()) return null;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!chave) throw new Error('Painel não configurado.');
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, chave, { auth: { persistSession: false, autoRefreshToken: false } });
}
