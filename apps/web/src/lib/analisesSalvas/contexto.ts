/**
 * F5-10: o que as rotas de análises salvas têm em comum: ler o ambiente, descobrir quem é a pessoa logada (cookie de sessão) e montar o
 * armazenamento e o banco reais. Só o servidor usa este arquivo.
 */
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { lerConfigDeAnalisesSalvas } from './config';
import { dependenciasPadrao, type DependenciasDeAnalisesSalvas, type DependenciasDeApagarAnalise } from './servico';
import { armazenamentoEBanco } from './supabase';

export const NAO_HABILITADO = { mensagem: 'Salvar análises ainda não está disponível.' };

export interface ContextoDeAnalises {
  usuario: { id: string } | null;
  /** Com a chave de cifra: só existe com a flag ligada. Gravar e abrir precisam dela. */
  completo: DependenciasDeAnalisesSalvas | null;
  /** Sem a chave: listar, apagar e faxinar funcionam mesmo com o salvamento desligado (o que foi guardado precisa poder sumir). */
  basico: DependenciasDeApagarAnalise;
}

export async function contextoDeAnalises(): Promise<ContextoDeAnalises | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicavel = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const secreta = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !publicavel || !secreta) return null;
  const armazem = await cookies();
  const sessao = createServerClient(url, publicavel, {
    cookies: { getAll: () => armazem.getAll(), setAll: lista => lista.forEach(({ name, value, options }) => armazem.set(name, value, options)) }
  });
  const { data } = await sessao.auth.getUser();
  const servidor = createClient(url, secreta, { auth: { persistSession: false, autoRefreshToken: false } });
  const reais = armazenamentoEBanco(servidor);
  const config = lerConfigDeAnalisesSalvas(process.env);
  return {
    usuario: data.user ? { id: data.user.id } : null,
    completo: config ? { chave: config.chave, ...dependenciasPadrao(), ...reais } : null,
    basico: { ...dependenciasPadrao(), ...reais }
  };
}
