import type { ModeloPermitido, QualquerTarefa, Uso } from './contrato';

/**
 * Política global da IA no Ratione: vale para todas as tarefas do catálogo. Os limites de cada tarefa ficam no contrato dela,
 * sempre dentro dos tetos daqui. Especificação: `docs/produto/IA_TAREFAS.md`.
 */

/** Preço por modelo (US$ por milhão de tokens, prompt de até 100 mil tokens), conferido em 22/10/2026. Sem linha aqui, o modelo não é usado. */
export const PRECO_USD_POR_MILHAO: Record<ModeloPermitido, { entrada: number; saida: number; leituraCache: number; escritaCache: number }> = {
  'claude-haiku-5-5': { entrada: 0.1, saida: 0.5, leituraCache: 0.01, escritaCache: 0.125 }
};

/** Tetos que nenhuma tarefa pode passar (conferidos em teste para todo o catálogo). */
export const TETOS = { maxTokensSaida: 4_000, maxCaracteresMensagem: 30_000, porDia: 20, porMes: 200 } as const;

/** Tempo máximo de uma chamada, em milissegundos, e uma nova tentativa só em falha transitória. */
export const TEMPO_MAXIMO_MS = 30_000;
export const TENTATIVAS_EXTRAS = 1;

/** Teto de gasto de todas as tarefas e todos os usuários somados no mês, em US$. */
export const ORCAMENTO_MENSAL_PADRAO_USD = 5;

/** Liga a IA: sem `IA_EXPLICACAO_LIGADA=sim` e sem a chave da API, nenhuma tarefa chama o modelo. */
export function iaLigada(env: Record<string, string | undefined>): boolean {
  return env.IA_EXPLICACAO_LIGADA === 'sim' && !!env.ANTHROPIC_API_KEY;
}

const lerNumero = (env: Record<string, string | undefined>, nome: string, padrao: number) => {
  const v = Number(env[nome]);
  return Number.isFinite(v) && v >= 0 && v <= padrao * 2 ? v : padrao;
};

/** Orçamento do mês: o ambiente pode apertar ou, no máximo, dobrar o padrão; valor inválido cai no padrão. */
export function orcamentoDoAmbiente(env: Record<string, string | undefined>): number {
  return lerNumero(env, 'IA_ORCAMENTO_MES_USD', ORCAMENTO_MENSAL_PADRAO_USD);
}

/** Limites de uma tarefa para o usuário: os do contrato, que o ambiente só pode apertar (`IA_LIMITE_DIA`, `IA_LIMITE_MES`). */
export function limitesDaTarefa(t: QualquerTarefa, env: Record<string, string | undefined>): { porDia: number; porMes: number } {
  const aperto = (nome: string, doContrato: number) => {
    const v = Number(env[nome]);
    return env[nome] !== undefined && Number.isFinite(v) && v >= 0 ? Math.min(v, doContrato) : doContrato;
  };
  return { porDia: aperto('IA_LIMITE_DIA', t.limitesPorUsuario.porDia), porMes: aperto('IA_LIMITE_MES', t.limitesPorUsuario.porMes) };
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
