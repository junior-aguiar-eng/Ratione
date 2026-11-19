import type { ModeloPermitido, QualquerTarefa, Uso } from './contrato';

/**
 * Política global da IA no Ratione: vale para todas as tarefas do catálogo. Os limites de cada tarefa ficam no contrato dela,
 * sempre dentro dos tetos daqui. Especificação: `docs/produto/IA_TAREFAS.md`.
 */

/** Preço por modelo (US$ por milhão de tokens, prompt de até 100 mil tokens), conferido em 22/10/2026. Sem linha aqui, o modelo não é usado. */
export const PRECO_USD_POR_MILHAO: Record<ModeloPermitido, { entrada: number; saida: number; leituraCache: number; escritaCache: number }> = {
  'claude-haiku-5-5': { entrada: 0.1, saida: 0.5, leituraCache: 0.01, escritaCache: 0.125 },
  // Só para a avaliação do corpus (F5-05); preço da tabela de modelos da API em 03/11/2026, escrita de cache a 1,25x como no Haiku
  'claude-sonnet-5-5': { entrada: 2, saida: 10, leituraCache: 0.2, escritaCache: 2.5 }
};

/** Tetos que nenhuma tarefa pode passar (conferidos em teste para todo o catálogo). A cota de uso vem do plano do usuário, no banco. */
export const TETOS = { maxTokensSaida: 7_000, maxCaracteresMensagem: 85_000 } as const;

/** Tempo máximo de uma chamada, em milissegundos, e uma nova tentativa só em falha transitória. */
export const TEMPO_MAXIMO_MS = 45_000;
export const TENTATIVAS_EXTRAS = 1;

/** O teto de gasto do mês não fica aqui: são dois fundos (gratuito e pagantes) na tabela `ia_fundos` do banco, que o responsável ajusta com uma linha de SQL. */

const CHAVES_IA_MODULOS = [
  'IA_EXPLICACAO_LIGADA',
  'IA_ARGUMENTA_LIGADA',
  'IA_RELACAO_LIGADA',
  'IA_INTIMACAO_LIGADA',
  'IA_PRECEDENTE_LIGADA'
] as const;

/** Liga a IA: precisa de `ANTHROPIC_API_KEY` e de ao menos um módulo de IA ligado no ambiente. */
export function iaLigada(env: Record<string, string | undefined>): boolean {
  return !!env.ANTHROPIC_API_KEY && CHAVES_IA_MODULOS.some(chave => env[chave] === 'sim');
}

function argumentaServidorLigada(env: Record<string, string | undefined>): boolean {
  const dedicada = env.IA_ARGUMENTA_LIGADA;
  if (dedicada !== undefined && dedicada !== '') return dedicada === 'sim';
  return env.IA_EXPLICACAO_LIGADA === 'sim';
}

/** Confere se a tarefa específica do catálogo está habilitada no servidor. */
export function tarefaIaLigada(tarefa: string, env: Record<string, string | undefined>): boolean {
  if (!env.ANTHROPIC_API_KEY) return false;
  switch (tarefa) {
    case 'explicar-dispositivo':
      return env.IA_EXPLICACAO_LIGADA === 'sim';
    case 'argumenta-estrutura':
    case 'argumenta-questoes':
    case 'argumenta-fundamentos':
      return argumentaServidorLigada(env);
    case 'relacionar-com-o-caso':
      return env.IA_RELACAO_LIGADA === 'sim';
    case 'ler-intimacao':
      return env.IA_INTIMACAO_LIGADA === 'sim';
    case 'explicar-precedente':
      return env.IA_PRECEDENTE_LIGADA === 'sim';
    default:
      return false;
  }
}

/**
 * Flag client-safe do Argumenta (`NEXT_PUBLIC_ARGUMENTA_IA_LIGADA`), com fallback legado para
 * `NEXT_PUBLIC_IA_EXPLICACAO` apenas quando a flag dedicada não foi definida no build.
 */
export function argumentaIaLigada(env: {
  NEXT_PUBLIC_ARGUMENTA_IA_LIGADA?: string;
  NEXT_PUBLIC_IA_EXPLICACAO?: string;
}): boolean {
  const dedicada = env.NEXT_PUBLIC_ARGUMENTA_IA_LIGADA;
  if (dedicada !== undefined && dedicada !== '') return dedicada === 'sim';
  return env.NEXT_PUBLIC_IA_EXPLICACAO === 'sim';
}

/** Custo de uma chamada em US$, pelo `usage` que a API devolve. */
export function custoUsd(modelo: ModeloPermitido, u: Uso): number {
  const p = PRECO_USD_POR_MILHAO[modelo];
  const total =
    u.input_tokens * p.entrada + u.output_tokens * p.saida + (u.cache_read_input_tokens ?? 0) * p.leituraCache + (u.cache_creation_input_tokens ?? 0) * p.escritaCache;
  return Math.round((total / 1_000_000) * 1e6) / 1e6;
}

/** Custo máximo de uma chamada da tarefa, reservado no orçamento antes dela (mensagem no teto, ~3 caracteres por token, mais as instruções, e a saída inteira). */
export function custoMaximoUsd(t: QualquerTarefa, modelo: ModeloPermitido = t.modelo): number {
  return custoUsd(modelo, { input_tokens: Math.ceil((t.maxCaracteresMensagem + t.instrucoes.length) / 3) + 500, output_tokens: t.maxTokensSaida });
}
