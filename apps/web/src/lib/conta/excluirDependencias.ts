import type { SupabaseClient } from '@supabase/supabase-js';
import { apagarTodosDoUsuario as apagarTodosDocumentos, dependenciasPadrao as dependenciasPadraoDocumentos } from '../documentos/servico';
import { armazenamentoEBanco as armazenamentoEBancoDocumentos } from '../documentos/supabase';
import { apagarTodasDoUsuario as apagarTodasAnalises, dependenciasPadrao as dependenciasPadraoAnalises } from '../analisesSalvas/servico';
import { armazenamentoEBanco as armazenamentoEBancoAnalises } from '../analisesSalvas/supabase';

const RECURSO_AUSENTE = /does not exist|could not find the table|schema cache|relation .* does not exist|not found/i;

/** Reconhece erros de tabela ou bucket ainda não criados no ambiente, que não devem impedir a exclusão da conta. */
export function erroDeRecursoAusente(erro: unknown): boolean {
  if (!erro || typeof erro !== 'object') return false;
  const e = erro as { code?: unknown; message?: unknown };
  if (e.code === '42P01') return true;
  return typeof e.message === 'string' && RECURSO_AUSENTE.test(e.message);
}

async function executarTolerandoRecursoAusente(acao: () => Promise<unknown>): Promise<true> {
  try {
    await acao();
    return true;
  } catch (e) {
    if (erroDeRecursoAusente(e)) return true;
    throw e;
  }
}

/** Apaga os documentos do usuário tolerando ambiente em que tabela ou bucket `documentos` ainda não foi provisionado. */
export async function apagarDocumentos(servidor: SupabaseClient, usuarioId: string): Promise<boolean> {
  return executarTolerandoRecursoAusente(() =>
    apagarTodosDocumentos(usuarioId, { ...dependenciasPadraoDocumentos(), ...armazenamentoEBancoDocumentos(servidor) })
  );
}

/** Apaga as análises salvas do usuário tolerando ambiente em que tabela ou bucket `analises-salvas` ainda não foi provisionado. */
export async function apagarAnalisesSalvas(servidor: SupabaseClient, usuarioId: string): Promise<boolean> {
  return executarTolerandoRecursoAusente(() =>
    apagarTodasAnalises(usuarioId, { ...dependenciasPadraoAnalises(), ...armazenamentoEBancoAnalises(servidor) })
  );
}
