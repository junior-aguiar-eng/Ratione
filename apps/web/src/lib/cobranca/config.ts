/**
 * Configuração da cobrança com o Mercado Pago (F8-05, docs/produto/PLANOS_E_COBRANCA.md §7). DESLIGADA por padrão: sem
 * `COBRANCA_LIGADA=sim` nenhuma rota de cobrança faz nada (503). Em ambiente de teste (o padrão quando ligada), só os e-mails da lista
 * `COBRANCA_TESTE_EMAILS` veem e usam a cobrança; o site continua sem anunciar plano pago para ninguém mais. Só `COBRANCA_AMBIENTE=producao`
 * abre a cobrança a todos os usuários logados, e isso só se faz depois de abrir o MEI ou a empresa (checklist em §7.4).
 */

export type Ambiente = 'teste' | 'producao';

export interface ConfigCobranca {
  ligada: boolean;
  ambiente: Ambiente;
  /** E-mails (minúsculos) que podem usar a cobrança enquanto o ambiente for de teste. */
  emailsDeTeste: string[];
  tokenMp: string | null;
  segredoWebhook: string | null;
}

type Env = Record<string, string | undefined>;

/** Lê a configuração do ambiente do servidor. Qualquer valor diferente de `sim` mantém a cobrança desligada. */
export function lerConfigCobranca(env: Env): ConfigCobranca {
  return {
    ligada: env.COBRANCA_LIGADA === 'sim',
    ambiente: env.COBRANCA_AMBIENTE === 'producao' ? 'producao' : 'teste',
    emailsDeTeste: (env.COBRANCA_TESTE_EMAILS ?? '')
      .split(/[\s,;]+/)
      .map(e => e.trim().toLowerCase())
      .filter(Boolean),
    tokenMp: env.MERCADOPAGO_ACCESS_TOKEN?.trim() || null,
    segredoWebhook: env.MERCADOPAGO_WEBHOOK_SECRET?.trim() || null
  };
}

/** A cobrança está ligada e tem o que precisa para falar com o Mercado Pago e validar os avisos. */
export function cobrancaPronta(c: ConfigCobranca): boolean {
  return c.ligada && !!c.tokenMp && !!c.segredoWebhook;
}

/** Este usuário pode ver e usar a cobrança agora? Em teste, só quem está na lista; em produção, qualquer usuário logado. */
export function usuarioPodeUsarCobranca(c: ConfigCobranca, email: string | null | undefined): boolean {
  if (!cobrancaPronta(c)) return false;
  if (c.ambiente === 'producao') return true;
  return !!email && c.emailsDeTeste.includes(email.trim().toLowerCase());
}
