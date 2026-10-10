import { diferencaDiasIso } from '@ratione/prazozero';
import { obterSupabase } from './supabase/client';
import type { Lembrete } from './lembretes';

/**
 * Lembretes de prazo no navegador (F2-10): criar, listar e cancelar. A segurança está no banco (RLS): cada pessoa só vê e
 * apaga os próprios lembretes, e não há permissão para alterar a marca de envio (ver supabase/migrations).
 */

/** Quais avisos ainda fazem sentido para um prazo que vence em `vencimento`, visto de `hoje` (AAAA-MM-DD). */
export function opcoesDeAviso(hoje: string, vencimento: string): { dias: number; tres: boolean; um: boolean } {
  const dias = diferencaDiasIso(hoje, vencimento);
  return { dias, tres: dias >= 3, um: dias >= 1 };
}

export type ResultadoLembrete = { ok: true } | { ok: false; mensagem: string };

export interface NovoLembrete {
  titulo: string;
  tribunal?: string;
  vencimento: string;
  avisar3Dias: boolean;
  avisar1Dia: boolean;
}

export async function criarLembrete(dados: NovoLembrete, usuarioId: string): Promise<ResultadoLembrete> {
  const sb = obterSupabase();
  if (!sb) return { ok: false, mensagem: 'A conta não está disponível agora.' };
  const titulo = dados.titulo.trim().slice(0, 200);
  if (!titulo) return { ok: false, mensagem: 'Dê um nome ao aviso.' };
  if (!dados.avisar3Dias && !dados.avisar1Dia) return { ok: false, mensagem: 'Escolha pelo menos um aviso.' };
  const { error } = await sb.from('lembretes_prazo').insert({
    usuario_id: usuarioId,
    titulo,
    tribunal: dados.tribunal ? dados.tribunal.slice(0, 20) : null,
    vencimento: dados.vencimento,
    avisar_3_dias: dados.avisar3Dias,
    avisar_1_dia: dados.avisar1Dia
  });
  if (error) {
    if (/limite de 200/.test(error.message)) return { ok: false, mensagem: 'Você já tem 200 avisos ativos. Cancele algum em Meu espaço para criar outro.' };
    return { ok: false, mensagem: 'Não foi possível ativar o aviso agora. Tente de novo em instantes.' };
  }
  return { ok: true };
}

export async function listarLembretes(): Promise<Lembrete[]> {
  const sb = obterSupabase();
  if (!sb) return [];
  const { data, error } = await sb.from('lembretes_prazo').select('*').order('vencimento', { ascending: true });
  return error ? [] : ((data ?? []) as Lembrete[]);
}

export async function cancelarLembrete(id: string): Promise<boolean> {
  const sb = obterSupabase();
  if (!sb) return false;
  const { error } = await sb.from('lembretes_prazo').delete().eq('id', id);
  return !error;
}
