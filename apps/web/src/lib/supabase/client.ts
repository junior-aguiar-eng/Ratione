import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente do Supabase no navegador. Usa só a URL e a chave publicável do projeto (valores públicos);
 * a proteção dos dados vem da RLS do banco (`supabase/migrations`, testada em `packages/db`).
 * Sem a configuração (`.env.local`), devolve `null` e o site funciona como antes, só com o navegador.
 */
let cliente: SupabaseClient | null | undefined;

export function obterSupabase(): SupabaseClient | null {
  if (cliente !== undefined) return cliente;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  cliente = url && chave ? createBrowserClient(url, chave) : null;
  return cliente;
}

export function contaDisponivel(): boolean {
  return obterSupabase() !== null;
}
