import type { ModeloPermitido, QualquerTarefa, Uso } from './contrato';

/**
 * Política global da IA no Ratione: vale para todas as tarefas do catálogo. Os limites de cada tarefa ficam no contrato dela,
 * sempre dentro dos tetos daqui. Especificação: `docs/produto/IA_TAREFAS.md`.
 */

/** Preço por modelo (US$ por milhão de tokens, prompt de até 100 mil tokens), conferido em 22/10/2026. Sem linha aqui, o modelo não é usado. */
export const PRECO_USD_POR_MILHAO: Record<ModeloPermitido, { entrada: number; saida: number; leituraCache: number; escritaCache: number }> = {
  'claude-haiku-5-5': { entrada: 0.1, saida: 0.5, leituraCache: 0.01, escritaCache: 0.125 }
};

/** Tetos que nenhuma tarefa pode passar (conferidos em teste para todo o catálogo). A cota de uso vem do plano do usuário, no banco. */
export const TETOS = { maxTokensSaida: 7_000, maxCaracteresMensagem: 85_000 } as const;

/** Tempo máximo de uma chamada, em milissegundos, e uma nova tentativa só em falha transitória. */
export const TEMPO_MAXIMO_MS = 45_000;
export const TENTATIVAS_EXTRAS = 1;

/** O teto de gasto do mês não fica aqui: são dois fundos (gratuito e pagantes) na tabela `ia_fundos` do banco, que o responsável ajusta com uma linha de SQL. */

/** Liga a IA: sem `IA_EXPLICACAO_LIGADA=sim` e sem a chave da API, nenhuma tarefa chama o modelo. */
export function iaLigada(env: Record<string, string | undefined>): boolean {
  return env.IA_EXPLICACAO_LIGADA === 'sim' && !!env.ANTHROPIC_API_KEY;
}

/** Custo de uma chamada em US$, pelo `usage` que a API devolve. */
export function custoUsd(modelo: ModeloPermitido, u: Uso): number {
  const p = PRECO_USD_POR_MILHAO[modelo];
  const total =
    u.input_tokens * p.entrada + u.output_tokens * p.saida + (u.cache_read_input_tokens ?? 0) * p.leituraCache + (u.cache_creation_input_tokens ?? 0) * p.escritaCache;
  return Math.round((total / 1_000_000) * 1e6) / 1e6;
}

/** Custo máximo de uma chamada da tarefa, reservado no orçamento antes dela (mensagem no teto, ~3 caracteres por token, mais as instruções, e a saída inteira). */
export function custoMaximoUsd(t: QualquerTarefa): number {
  return custoUsd(t.modelo, { input_tokens: Math.ceil((t.maxCaracteresMensagem + t.instrucoes.length) / 3) + 500, output_tokens: t.maxTokensSaida });
}
