import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cobrancaPronta, lerConfigCobranca, usuarioPodeUsarCobranca, type ConfigCobranca } from './config';

/**
 * Contexto das rotas de cobrança: a configuração (desligada por padrão), o cliente com a sessão do usuário e o cliente do servidor (chave de
 * serviço). Devolve `null` quando a cobrança não está pronta nesta instalação: a rota responde 503 e não toca em nada.
 */

export interface ContextoDaCobranca {
  cfg: ConfigCobranca;
  sessao: SupabaseClient;
  servidor: SupabaseClient;
}

export async function abrirContexto(): Promise<ContextoDaCobranca | null> {
  const cfg = lerConfigCobranca(process.env);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicavel = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const secreta = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!cobrancaPronta(cfg) || !url || !publicavel || !secreta) return null;

  const armazem = await cookies();
  const sessao = createServerClient(url, publicavel, {
    cookies: { getAll: () => armazem.getAll(), setAll: lista => lista.forEach(({ name, value, options }) => armazem.set(name, value, options)) }
  });
  const servidor = createClient(url, secreta, { auth: { persistSession: false, autoRefreshToken: false } });
  return { cfg, sessao, servidor };
}

/** O usuário logado, se a cobrança estiver liberada para ele (em teste, só quem está na lista). `null` para todos os outros casos, sem distinguir. */
export async function usuarioDaCobranca(ctx: ContextoDaCobranca): Promise<{ id: string; email: string } | null> {
  const { data } = await ctx.sessao.auth.getUser();
  const u = data.user;
  if (!u?.email || !usuarioPodeUsarCobranca(ctx.cfg, u.email)) return null;
  return { id: u.id, email: u.email };
}
