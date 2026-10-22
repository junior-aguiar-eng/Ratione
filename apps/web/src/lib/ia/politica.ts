/**
 * Política da explicação de dispositivo por IA (F3-08). Decisão do responsável (22/10/2026): Claude Haiku 5.5, só sob demanda,
 * com controle rígido de uso. Tudo o que limita o uso está aqui; a especificação completa é `docs/produto/EXPLICACAO_IA.md`.
 *
 * Regras que não dependem de configuração:
 * - Só quem tem conta e está logado pede. Nunca há chamada automática (ao abrir a página, ao pesquisar, em lote).
 * - O pedido leva só o id do dispositivo. O texto vem do banco (o mesmo que a tela mostra); o usuário não escreve pergunta.
 * - Sem ferramentas e sem busca na web: o modelo só vê o texto oficial do dispositivo.
 * - A mesma explicação é reaproveitada (cache por modelo, versão do prompt, dispositivo e hash do texto) e não conta na cota.
 * - Toda chamada é reservada antes (cota e orçamento conferidos no banco, de forma atômica) e registrada depois, com o custo.
 */

export const MODELO = 'claude-haiku-5-5';
/** Muda quando o prompt muda: invalida o cache das explicações antigas. */
export const VERSAO_PROMPT = 'v1-2026-10-22';
/** Pouco raciocínio basta para explicar um texto curto; mantém custo e tempo baixos. */
export const ESFORCO = 'low' as const;
/** Teto da resposta (o raciocínio também conta aqui). */
export const MAX_TOKENS = 2000;
/** Dispositivo com os parágrafos e incisos acima disto não é explicado (não se corta texto de lei em silêncio). */
export const MAX_CARACTERES_TEXTO = 20_000;
/** Tempo máximo da chamada ao modelo, em milissegundos, e uma nova tentativa só em falha transitória. */
export const TEMPO_MAXIMO_MS = 30_000;
export const TENTATIVAS_EXTRAS = 1;

/** Preço do Claude Haiku 5.5 (US$ por milhão de tokens, prompt de até 100 mil tokens), conferido em 22/10/2026. */
export const PRECO_USD_POR_MILHAO = { entrada: 0.1, saida: 0.5, leituraCache: 0.01, escritaCache: 0.125 } as const;

export interface Limites {
  /** Explicações novas por usuário por dia (fuso de Brasília). */
  porDia: number;
  /** Explicações novas por usuário por mês. */
  porMes: number;
  /** Teto de gasto de todos os usuários somados no mês, em US$. */
  orcamentoMensalUsd: number;
}

export const LIMITES_PADRAO: Limites = { porDia: 5, porMes: 60, orcamentoMensalUsd: 5 };

/** Liga a funcionalidade: sem `IA_EXPLICACAO_LIGADA=sim` e sem a chave da API, nada é chamado. */
export function iaLigada(env: Record<string, string | undefined>): boolean {
  return env.IA_EXPLICACAO_LIGADA === 'sim' && !!env.ANTHROPIC_API_KEY;
}

/** Os limites podem ser apertados pelo ambiente; um valor inválido (ou acima do padrão em dobro) cai para o padrão. */
export function limitesDoAmbiente(env: Record<string, string | undefined>): Limites {
  const ler = (nome: string, padrao: number) => {
    const v = Number(env[nome]);
    return Number.isFinite(v) && v >= 0 && v <= padrao * 2 ? v : padrao;
  };
  return {
    porDia: ler('IA_LIMITE_DIA', LIMITES_PADRAO.porDia),
    porMes: ler('IA_LIMITE_MES', LIMITES_PADRAO.porMes),
    orcamentoMensalUsd: ler('IA_ORCAMENTO_MES_USD', LIMITES_PADRAO.orcamentoMensalUsd)
  };
}

export interface Uso {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
}

/** Custo de uma chamada em US$, pelo `usage` que a API devolve. */
export function custoUsd(u: Uso): number {
  const p = PRECO_USD_POR_MILHAO;
  const total =
    u.input_tokens * p.entrada + u.output_tokens * p.saida + (u.cache_read_input_tokens ?? 0) * p.leituraCache + (u.cache_creation_input_tokens ?? 0) * p.escritaCache;
  return Math.round((total / 1_000_000) * 1e6) / 1e6;
}

/** Custo máximo de uma chamada, reservado no orçamento antes dela (texto no teto, ~3 caracteres por token, e a resposta inteira). */
export function custoMaximoUsd(): number {
  return custoUsd({ input_tokens: Math.ceil(MAX_CARACTERES_TEXTO / 3) + 2_000, output_tokens: MAX_TOKENS });
}
