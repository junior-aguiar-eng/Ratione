import Anthropic from '@anthropic-ai/sdk';
import type { PedidoModelo, ResultadoModelo, Uso } from './contrato';
import { TEMPO_MAXIMO_MS, TENTATIVAS_EXTRAS } from './politica';

/**
 * A única chamada à API da Anthropic no Ratione (o teste `catalogo.test.ts` falha se outro arquivo importar o SDK).
 * Recebe só o pedido que o executor monta a partir do contrato da tarefa: sem `tools` (nenhuma busca na web, nenhum acesso a outra fonte),
 * uma única mensagem, resposta no esquema fixo. A chave (`ANTHROPIC_API_KEY`) existe só no servidor de produção, nunca no navegador.
 */
export function criarChamadaAoModelo(apiKey: string): (p: PedidoModelo) => Promise<ResultadoModelo> {
  const cliente = new Anthropic({ apiKey, timeout: TEMPO_MAXIMO_MS, maxRetries: TENTATIVAS_EXTRAS });
  return async p => {
    try {
      const r = await cliente.messages.create({
        model: p.modelo,
        max_tokens: p.maxTokens,
        system: p.instrucoes,
        output_config: { effort: p.esforco, format: { type: 'json_schema', schema: p.esquema as unknown as Record<string, unknown> } },
        messages: [{ role: 'user', content: p.mensagem }]
      });
      const uso: Uso = {
        input_tokens: r.usage.input_tokens,
        output_tokens: r.usage.output_tokens,
        cache_read_input_tokens: r.usage.cache_read_input_tokens,
        cache_creation_input_tokens: r.usage.cache_creation_input_tokens
      };
      if (r.stop_reason === 'refusal') return { tipo: 'recusa', uso };
      if (r.stop_reason !== 'end_turn') return { tipo: 'cortada', uso };
      // A resposta pode começar com blocos de raciocínio: lê só os de texto
      const json = r.content.map(b => (b.type === 'text' ? b.text : '')).join('');
      return json ? { tipo: 'ok', json, uso } : { tipo: 'cortada', uso };
    } catch (e) {
      if (e instanceof Anthropic.RateLimitError) return { tipo: 'falha', mensagem: 'limite de taxa da API (429)' };
      if (e instanceof Anthropic.AuthenticationError) return { tipo: 'falha', mensagem: 'chave da API inválida (401)' };
      if (e instanceof Anthropic.BadRequestError) return { tipo: 'falha', mensagem: `pedido recusado pela API (400): ${e.message}` };
      if (e instanceof Anthropic.APIConnectionTimeoutError) return { tipo: 'falha', mensagem: 'tempo esgotado' };
      if (e instanceof Anthropic.APIError) return { tipo: 'falha', mensagem: `erro da API (${e.status ?? 'sem status'})` };
      return { tipo: 'falha', mensagem: (e as Error).message };
    }
  };
}
