import type { SupabaseClient } from '@supabase/supabase-js';
import type { DependenciasExecucao, InicioDeAnalise, MotivoCota, MotivoReserva } from './executar';
import { registrar } from '../log';

/**
 * Adaptadores entre o executor das tarefas de IA e o banco (funções da migração 20261023000001): cota por análise, reserva, custo e cache.
 * Recebem o cliente do servidor (chave de serviço); nada daqui roda no navegador.
 */

type LinhaInicio = { ok: boolean; motivo: string | null; analise_id: string | null; restantes: number | null; plano: string; renova_em: string };

/** Inicia uma análise no banco: confere a cota do plano do usuário e reserva a vaga. */
export async function iniciarAnaliseNoBanco(servidor: SupabaseClient, usuarioId: string, tipo: string, rotulo: string | null = null): Promise<InicioDeAnalise & { plano: string }> {
  const { data, error } = await servidor.rpc('analise_iniciar', { p_usuario: usuarioId, p_tipo: tipo, p_rotulo: rotulo });
  if (error) throw new Error(`iniciar análise: ${error.message}`);
  const l = (data as LinhaInicio[])[0];
  if (l.ok && l.analise_id) return { ok: true, analiseId: l.analise_id, restantes: l.restantes ?? 0, renovaEm: l.renova_em, plano: l.plano };
  const motivos: MotivoCota[] = ['sem_cota_no_plano', 'limite_periodo', 'orcamento_gratuito', 'orcamento_pagantes'];
  const motivo = motivos.find(m => m === l.motivo) ?? 'limite_periodo';
  return { ok: false, motivo, renovaEm: l.renova_em, plano: l.plano };
}

async function chamar(servidor: SupabaseClient, funcao: string, analiseId: string, usuarioId: string): Promise<void> {
  const { error } = await servidor.rpc(funcao, { p_analise: analiseId, p_usuario: usuarioId });
  if (error) throw new Error(`${funcao}: ${error.message}`);
}

/** Tudo o que o executor pede ao banco. O que não é banco (ligada, fontes, usuário, modelo, orçamento, log) a rota acrescenta. */
export function dependenciasDoBanco(
  servidor: SupabaseClient
): Pick<
  DependenciasExecucao,
  'lerCache' | 'iniciarAnalise' | 'consumirAnalise' | 'concluirAnalise' | 'falhaAnalise' | 'cancelarAnalise' | 'reservar' | 'registrarCache' | 'finalizar' | 'gravarCache'
> {
  return {
    lerCache: async ({ tarefa, chave }) => {
      const { data, error } = await servidor.from('ia_respostas').select('resposta').eq('tarefa', tarefa).eq('chave', chave).maybeSingle();
      if (error) throw new Error(`ler cache: ${error.message}`);
      return data?.resposta ?? null;
    },
    iniciarAnalise: ({ usuarioId, tipo }) => iniciarAnaliseNoBanco(servidor, usuarioId, tipo),
    consumirAnalise: (analiseId, usuarioId) => chamar(servidor, 'analise_consumir', analiseId, usuarioId),
    concluirAnalise: (analiseId, usuarioId) => chamar(servidor, 'analise_concluir', analiseId, usuarioId),
    falhaAnalise: (analiseId, usuarioId) => chamar(servidor, 'analise_falha', analiseId, usuarioId),
    cancelarAnalise: (analiseId, usuarioId) => chamar(servidor, 'analise_cancelar', analiseId, usuarioId),
    reservar: async p => {
      const { data, error } = await servidor.rpc('ia_reservar', {
        p_tarefa: p.tarefa,
        p_usuario: p.usuarioId,
        p_referencia: p.referencia,
        p_chave: p.chave,
        p_analise: p.analiseId,
        p_custo_maximo_usd: p.custoMaximoUsd
      });
      if (error) throw new Error(`reservar: ${error.message}`);
      const linha = (data as Array<{ ok: boolean; motivo: string | null; reserva_id: number | null }>)[0];
      return linha.ok ? { ok: true, id: Number(linha.reserva_id) } : { ok: false, motivo: linha.motivo as MotivoReserva };
    },
    registrarCache: async p => {
      const { error } = await servidor.rpc('ia_registrar_cache', { p_tarefa: p.tarefa, p_usuario: p.usuarioId, p_referencia: p.referencia, p_chave: p.chave });
      if (error) throw new Error(`registrar uso do cache: ${error.message}`);
    },
    finalizar: async (id, situacao, uso, custo) => {
      const { error } = await servidor.rpc('ia_finalizar', {
        p_reserva: id,
        p_situacao: situacao,
        p_tokens_entrada: uso?.input_tokens ?? null,
        p_tokens_saida: uso?.output_tokens ?? null,
        p_tokens_cache_leitura: uso?.cache_read_input_tokens ?? null,
        p_tokens_cache_escrita: uso?.cache_creation_input_tokens ?? null,
        p_custo_usd: custo
      });
      if (error) registrar('ERROR', 'IA: não fechou a reserva', { reserva: id, erro_mensagem: error.message });
    },
    gravarCache: async p => {
      const { error } = await servidor.from('ia_respostas').insert({
        tarefa: p.tarefa,
        chave: p.chave,
        referencia: p.referencia,
        versao: p.versao,
        modelo: p.modelo,
        resposta: p.resposta
      });
      // Dois usuários pedindo a mesma coisa ao mesmo tempo: a segunda gravação colide e não faz falta
      if (error && error.code !== '23505') registrar('ERROR', 'IA: não gravou o cache', { tarefa: p.tarefa, erro_mensagem: error.message });
    }
  };
}
