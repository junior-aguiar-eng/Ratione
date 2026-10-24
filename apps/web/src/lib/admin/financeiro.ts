import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import { registrar } from '../log';

const valor = z.number().finite().nonnegative();
const contagem = z.number().int().nonnegative().safe();
const custos = { custo_real_usd: valor, reservado_usd: valor };
export const esquemaFinanceiro = z.object({
  inicio: z.string().datetime({ offset: true }), fim: z.string().datetime({ offset: true }),
  planos: z.array(z.object({ plano: z.enum(['gratuito','essencial','profissional','sem_atribuicao']), ...custos, receita_centavos: contagem, reembolsado_centavos: contagem }).strict()).length(4),
  fundos: z.array(z.object({ fundo: z.enum(['gratuito','pagantes']), orcamento_usd: valor, ...custos }).strict()).length(2),
  teste_aprovado_centavos: contagem,
  clientes: z.array(z.object({ usuario_id: z.uuid(), ...custos }).strict()).max(20),
  total_clientes: contagem
}).strict();
export type ResumoFinanceiro = z.infer<typeof esquemaFinanceiro>;

const CABECALHOS = { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store', Vary: 'Cookie' };
const resposta = (corpo: unknown, status = 200) => new Response(JSON.stringify(corpo), { status, headers: CABECALHOS });

/** A abertura do cliente privilegiado acontece APÓS a autorização. Nenhum parâmetro do navegador escolhe o usuário ou papel. */
export async function servirFinanceiro(request: Request, abrir: () => Promise<Pick<SupabaseClient, 'rpc'> | null>): Promise<Response> {
  try {
    const servidor = await abrir();
    if (!servidor) return resposta({ mensagem: 'Página não encontrada.' }, 404);
    const consulta = new URL(request.url).searchParams;
    const bruto = consulta.get('pagina') ?? '0';
    if (!/^\d{1,7}$/.test(bruto) || Number(bruto) > 1000000 || [...consulta.keys()].some(k => k !== 'pagina')) {
      return resposta({ mensagem: 'Página inválida.' }, 400);
    }
    const { data, error } = await servidor.rpc('admin_financeiro', { p_pagina: Number(bruto) });
    if (error) throw new Error('Consulta indisponível.');
    const validado = esquemaFinanceiro.safeParse(data);
    if (!validado.success) throw new Error('Resumo inválido.');
    return resposta(validado.data);
  } catch {
    registrar('ERROR', 'Painel administrativo: resumo indisponível');
    return resposta({ mensagem: 'Não foi possível ler o painel agora. Confira a configuração e a migração do painel.' }, 503);
  }
}
