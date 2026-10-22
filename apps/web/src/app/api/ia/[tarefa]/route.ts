import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { executarTarefa, type MotivoNegado } from '../../../../lib/ia/executar';
import { criarChamadaAoModelo } from '../../../../lib/ia/cliente';
import { lerDispositivoParaExplicar } from '../../../../lib/ia/fontes/dispositivoDoBanco';
import { iaLigada, orcamentoDoAmbiente } from '../../../../lib/ia/politica';
import { origemPublica } from '../../../../lib/origem';
import { registrar } from '../../../../lib/log';

/**
 * Rota única dos recursos de IA: `POST /api/ia/<tarefa>` com `{ entrada }`. Só executa tarefas do catálogo (`lib/ia/catalogo.ts`),
 * pelo executor único (`lib/ia/executar.ts`). Precisa de `IA_EXPLICACAO_LIGADA=sim`, `ANTHROPIC_API_KEY` e `SUPABASE_SERVICE_ROLE_KEY`
 * no servidor; sem eles, responde 503 e não chama nada. Regras: `docs/produto/IA_TAREFAS.md`.
 */
export async function POST(request: Request, { params }: { params: Promise<{ tarefa: string }> }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicavel = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const secreta = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const chaveApi = process.env.ANTHROPIC_API_KEY;
  if (!url || !publicavel || !secreta || !chaveApi || !iaLigada(process.env)) {
    return NextResponse.json({ mensagem: 'Os recursos de IA não estão disponíveis nesta instalação.' }, { status: 503 });
  }

  // Só a partir do próprio site
  const origem = request.headers.get('origin');
  if (origem && origem !== origemPublica(request)) return NextResponse.json({ mensagem: 'Origem não permitida.' }, { status: 403 });

  const { tarefa } = await params;
  let corpo: { entrada?: unknown } = {};
  try {
    corpo = await request.json();
  } catch {
    /* sem corpo: a validação da entrada recusa */
  }

  const armazem = await cookies();
  const sessao = createServerClient(url, publicavel, {
    cookies: { getAll: () => armazem.getAll(), setAll: lista => lista.forEach(({ name, value, options }) => armazem.set(name, value, options)) }
  });
  const semSessao = { auth: { persistSession: false, autoRefreshToken: false } };
  const publico = createClient(url, publicavel, semSessao);
  const servidor = createClient(url, secreta, semSessao);

  try {
    const r = await executarTarefa(tarefa, corpo.entrada, {
      ligada: true,
      env: process.env,
      orcamentoMensalUsd: orcamentoDoAmbiente(process.env),
      fontes: { lerDispositivo: id => lerDispositivoParaExplicar(publico, id) },
      usuarioAtual: async () => {
        const { data } = await sessao.auth.getUser();
        return data.user ? { id: data.user.id } : null;
      },
      lerCache: async ({ tarefa, chave }) => {
        const { data, error } = await servidor.from('ia_respostas').select('resposta').eq('tarefa', tarefa).eq('chave', chave).maybeSingle();
        if (error) throw new Error(`ler cache: ${error.message}`);
        return data?.resposta ?? null;
      },
      reservar: async p => {
        const { data, error } = await servidor.rpc('ia_reservar', {
          p_tarefa: p.tarefa,
          p_usuario: p.usuarioId,
          p_referencia: p.referencia,
          p_chave: p.chave,
          p_limite_dia: p.porDia,
          p_limite_mes: p.porMes,
          p_orcamento_mes_usd: p.orcamentoMensalUsd,
          p_custo_maximo_usd: p.custoMaximoUsd
        });
        if (error) throw new Error(`reservar: ${error.message}`);
        const linha = (data as Array<{ ok: boolean; motivo: string | null; reserva_id: number | null; restantes_hoje: number | null }>)[0];
        return linha.ok ? { ok: true, id: Number(linha.reserva_id), restantesHoje: linha.restantes_hoje ?? 0 } : { ok: false, motivo: linha.motivo as MotivoNegado };
      },
      registrarCache: async p => {
        const { error } = await servidor.rpc('ia_registrar_cache', { p_tarefa: p.tarefa, p_usuario: p.usuarioId, p_referencia: p.referencia, p_chave: p.chave });
        if (error) throw new Error(`registrar uso do cache: ${error.message}`);
      },
      chamarModelo: criarChamadaAoModelo(chaveApi),
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
      },
      avisar: (mensagem, campos) => registrar('WARNING', mensagem, campos)
    });
    return NextResponse.json(r.corpo, { status: r.status });
  } catch (e) {
    registrar('ERROR', 'IA: erro inesperado', { tarefa, erro_mensagem: (e as Error).message });
    return NextResponse.json({ mensagem: 'O recurso de IA falhou agora. Tente de novo em alguns minutos.' }, { status: 500 });
  }
}
