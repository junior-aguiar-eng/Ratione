import type { SupabaseClient } from '@supabase/supabase-js';
import type { BancoDaCobranca } from './processar';
import type { Ambiente } from './config';
import type { SituacaoAssinatura } from './estados';

/**
 * Adaptadores entre a cobrança e o banco (funções da migração 20261023000003). Recebem o cliente do servidor (chave de serviço);
 * nada daqui roda no navegador.
 */

export type ErroDeAssinatura = 'plano_invalido' | 'preco_nao_definido' | 'ja_assinante';

/** Cria a assinatura pendente. Devolve o erro conhecido (o servidor traduz para o cliente) ou o id, o valor e as pendentes antigas a cancelar no Mercado Pago. */
export async function criarAssinaturaPendente(
  servidor: SupabaseClient,
  usuarioId: string,
  plano: string,
  ambiente: Ambiente
): Promise<{ erro: ErroDeAssinatura } | { assinaturaId: string; valorCentavos: number; antigas: string[] }> {
  const { data, error } = await servidor.rpc('assinatura_criar_pendente', { p_usuario: usuarioId, p_plano: plano, p_ambiente: ambiente });
  if (error) {
    for (const conhecido of ['plano_invalido', 'preco_nao_definido', 'ja_assinante'] as const) {
      if (error.message.includes(conhecido)) return { erro: conhecido };
    }
    throw new Error(`criar assinatura: ${error.message}`);
  }
  const l = (data as Array<{ assinatura_id: string; valor_centavos: number; antigas: string[] | null }>)[0];
  return { assinaturaId: l.assinatura_id, valorCentavos: l.valor_centavos, antigas: l.antigas ?? [] };
}

async function rpc(servidor: SupabaseClient, funcao: string, args: Record<string, unknown>): Promise<unknown> {
  const { data, error } = await servidor.rpc(funcao, args);
  if (error) throw new Error(`${funcao}: ${error.message}`);
  return data;
}

export const vincularAoMp = (servidor: SupabaseClient, assinaturaId: string, mpId: string) => rpc(servidor, 'assinatura_vincular_mp', { p_assinatura: assinaturaId, p_mp_id: mpId });

export const aplicarSituacao = (servidor: SupabaseClient, assinaturaId: string, situacao: SituacaoAssinatura, mpSituacao: string, fimDoCiclo: string | null) =>
  rpc(servidor, 'assinatura_aplicar', { p_assinatura: assinaturaId, p_situacao: situacao, p_mp_situacao: mpSituacao, p_fim_do_ciclo: fimDoCiclo });

/** Registra um aviso recebido. Devolve o id, ou `null` se o mesmo aviso já tinha chegado. */
export async function registrarEvento(servidor: SupabaseClient, ambiente: Ambiente, topico: string, recursoId: string, requestId: string | null): Promise<number | null> {
  const id = await rpc(servidor, 'mp_evento_registrar', { p_ambiente: ambiente, p_topico: topico, p_recurso_id: recursoId, p_request_id: requestId });
  return id === null || id === undefined ? null : Number(id);
}
export const concluirEvento = (servidor: SupabaseClient, id: number, resultado: string) => rpc(servidor, 'mp_evento_concluir', { p_id: id, p_resultado: resultado });
export const descartarEvento = (servidor: SupabaseClient, id: number) => rpc(servidor, 'mp_evento_descartar', { p_id: id });

export interface AssinaturaDoUsuario {
  id: string;
  plano: string;
  situacao: SituacaoAssinatura;
  mpId: string | null;
  cicloFim: string | null;
}

/** A assinatura mais recente do usuário (a que a tela mostra e que o cancelamento age). */
export async function assinaturaDoUsuario(servidor: SupabaseClient, usuarioId: string): Promise<AssinaturaDoUsuario | null> {
  const { data, error } = await servidor
    .from('assinaturas')
    .select('id, plano_id, situacao, mp_assinatura_id, ciclo_fim')
    .eq('usuario_id', usuarioId)
    .order('criada_em', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`ler assinatura: ${error.message}`);
  return data ? { id: data.id, plano: data.plano_id, situacao: data.situacao, mpId: data.mp_assinatura_id, cicloFim: data.ciclo_fim } : null;
}

/** O que o processamento dos avisos precisa do banco. */
export function bancoDaCobranca(servidor: SupabaseClient): BancoDaCobranca {
  return {
    // Primeiro pela referência que mandamos ao Mercado Pago (o id da nossa assinatura); se não achar, pelo id de lá
    acharAssinatura: async ({ referencia, mpId }) => {
      const tentativas: Array<['id' | 'mp_assinatura_id', string]> = [];
      if (referencia) tentativas.push(['id', referencia]);
      if (mpId) tentativas.push(['mp_assinatura_id', mpId]);
      for (const [coluna, valor] of tentativas) {
        const { data, error } = await servidor.from('assinaturas').select('id, situacao').eq(coluna, valor).maybeSingle();
        if (error) throw new Error(`achar assinatura: ${error.message}`);
        if (data) return { id: data.id, situacao: data.situacao };
      }
      return null;
    },
    aplicar: async (id, situacao, mpSituacao, fim) => void (await aplicarSituacao(servidor, id, situacao, mpSituacao, fim)),
    registrarCobranca: async p =>
      void (await rpc(servidor, 'cobranca_registrar', {
        p_assinatura: p.assinaturaId,
        p_mp_pagamento: p.pagamentoId,
        p_valor_centavos: p.valorCentavos,
        p_situacao: p.situacao,
        p_meio: p.meio,
        p_paga_em: p.pagaEm
      }))
  };
}
