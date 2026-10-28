import { obterSupabase } from './supabase/client';
import { irParaPagina } from './navegacao';

/** Encerra a sessão e volta à página inicial (navegação completa: ver `irParaPagina`). */
export async function sairDaConta(): Promise<void> {
  await obterSupabase()?.auth.signOut();
  irParaPagina('/');
}
