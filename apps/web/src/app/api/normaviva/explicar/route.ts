import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { explicarDispositivo } from '../../../../lib/ia/explicar';
import { criarChamadaAoModelo } from '../../../../lib/ia/cliente';
import { lerDispositivoParaExplicar } from '../../../../lib/ia/dispositivoDoBanco';
import { MODELO, VERSAO_PROMPT, iaLigada, limitesDoAmbiente } from '../../../../lib/ia/politica';
import { RespostaExplicacao } from '../../../../lib/ia/prompt';
import { origemPublica } from '../../../../lib/origem';
import { registrar } from '../../../../lib/log';

/**
 * Explicação de um dispositivo por IA (F3-08), sob demanda. Regras em `lib/ia/politica.ts` e `docs/produto/EXPLICACAO_IA.md`.
 * Precisa de `IA_EXPLICACAO_LIGADA=sim`, `ANTHROPIC_API_KEY` e `SUPABASE_SERVICE_ROLE_KEY` no servidor; sem eles, responde 503 e não chama nada.
 */
export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicavel = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const secreta = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const chaveApi = process.env.ANTHROPIC_API_KEY;
  if (!url || !publicavel || !secreta || !chaveApi || !iaLigada(process.env)) {
    return NextResponse.json({ mensagem: 'A explicação por IA não está disponível nesta instalação.' }, { status: 503 });
  }

  // Só a partir do próprio site
  const origem = request.headers.get('origin');
  if (origem && origem !== origemPublica(request)) return NextResponse.json({ mensagem: 'Origem não permitida.' }, { status: 403 });

  let corpo: { dispositivoId?: unknown } = {};
  try {
    corpo = await request.json();
  } catch {
    /* sem corpo: a validação do id recusa */
  }

  const armazem = await cookies();
  const sessao = createServerClient(url, publicavel, {
    cookies: { getAll: () => armazem.getAll(), setAll: lista => lista.forEach(({ name, value, options }) => armazem.set(name, value, options)) }
  });
  const semSessao = { auth: { persistSession: false, autoRefreshToken: false } };
  const publico = createClient(url, publicavel, semSessao);
  const servidor = createClient(url, secreta, semSessao);
  const chamarModelo = criarChamadaAoModelo(chaveApi);

  try {
    const r = await explicarDispositivo(corpo.dispositivoId, {
      ligada: true,
      limites: limitesDoAmbiente(process.env),
      usuarioAtual: async () => {
        const { data } = await sessao.auth.getUser();
        return data.user ? { id: data.user.id } : null;
      },
      lerDispositivo: id => lerDispositivoParaExplicar(publico, id),
      lerCache: async chave => {
        const { data, error } = await servidor.from('ia_explicacoes').select('explicacao').eq('chave', chave).maybeSingle();
        if (error) throw new Error(`ler cache: ${error.message}`);
        const valido = data ? RespostaExplicacao.safeParse(data.explicacao) : null;
        return valido?.success ? valido.data : null;
      },
      reservar: async p => {
        const { data, error } = await servidor.rpc('ia_reservar', {
          p_usuario: p.usuarioId,
          p_dispositivo: p.dispositivoId,
          p_chave: p.chave,
          p_limite_dia: p.limites.porDia,
          p_limite_mes: p.limites.porMes,
          p_orcamento_mes_usd: p.limites.orcamentoMensalUsd,
          p_custo_maximo_usd: p.custoMaximoUsd
        });
        if (error) throw new Error(`reservar: ${error.message}`);
        const linha = (data as Array<{ ok: boolean; motivo: string | null; reserva_id: number | null; restantes_hoje: number | null }>)[0];
        return linha.ok
          ? { ok: true, id: Number(linha.reserva_id), restantesHoje: linha.restantes_hoje ?? 0 }
          : { ok: false, motivo: linha.motivo as 'limite_dia' | 'limite_mes' | 'orcamento' | 'em_andamento' };
      },
      registrarCache: async p => {
        const { error } = await servidor.rpc('ia_registrar_cache', { p_usuario: p.usuarioId, p_dispositivo: p.dispositivoId, p_chave: p.chave });
        if (error) throw new Error(`registrar uso do cache: ${error.message}`);
      },
      chamarModelo: async d => {
        const r = await chamarModelo(d);
        if (r.tipo === 'falha') registrar('ERROR', 'Explicação por IA: chamada falhou', { dispositivo: d.id, erro_mensagem: r.mensagem });
        if (r.tipo === 'recusa') registrar('WARNING', 'Explicação por IA: modelo recusou', { dispositivo: d.id });
        return r;
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
        if (error) registrar('ERROR', 'Explicação por IA: não fechou a reserva', { reserva: id, erro_mensagem: error.message });
      },
      gravarCache: async ({ chave, dispositivo, resposta }) => {
        const { error } = await servidor.from('ia_explicacoes').insert({
          chave,
          dispositivo_id: dispositivo.id,
          hash_texto: createHash('sha256').update(dispositivo.texto).digest('hex'),
          modelo: MODELO,
          versao_prompt: VERSAO_PROMPT,
          explicacao: resposta
        });
        // Dois usuários pedindo o mesmo dispositivo ao mesmo tempo: a segunda gravação colide e não faz falta
        if (error && error.code !== '23505') registrar('ERROR', 'Explicação por IA: não gravou o cache', { erro_mensagem: error.message });
      }
    });
    return NextResponse.json(r.corpo, { status: r.status });
  } catch (e) {
    registrar('ERROR', 'Explicação por IA: erro inesperado', { erro_mensagem: (e as Error).message });
    return NextResponse.json({ mensagem: 'A explicação por IA falhou agora. Tente de novo em alguns minutos.' }, { status: 500 });
  }
}
