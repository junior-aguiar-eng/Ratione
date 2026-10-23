/**
 * Cliente mínimo da API do Mercado Pago para assinaturas (docs/produto/PLANOS_E_COBRANCA.md §7.1), sem SDK: só `fetch`, para testar sem rede
 * e sem dependência nova. Usa a assinatura SEM plano associado e com pagamento pendente (`POST /preapproval` com `status: pending`): cada
 * assinatura nasce por usuário, com `external_reference` igual ao id da nossa assinatura, e devolve o link da página de pagamento do
 * Mercado Pago (o cartão nunca passa pelo nosso servidor). O token vem do Secret Manager; nunca é logado nem devolvido.
 *
 * ATENÇÃO: os formatos de resposta abaixo vêm da documentação, lida em 23/10/2026, e ainda NÃO foram confirmados contra o sandbox do
 * Mercado Pago (isso exige as contas de teste). A leitura é tolerante: o que não vier no formato esperado vira `null`, nunca um palpite.
 */

export class ErroMp extends Error {
  constructor(
    mensagem: string,
    readonly status: number
  ) {
    super(mensagem);
    this.name = 'ErroMp';
  }
}

export interface AssinaturaMp {
  id: string;
  status: string;
  /** O id da nossa assinatura, que mandamos ao criar. */
  referencia: string | null;
  /** Data da próxima cobrança (ISO): o fim do ciclo já pago. */
  proximaCobranca: string | null;
  /** Link da página de pagamento do Mercado Pago, quando a assinatura está pendente. */
  linkDePagamento: string | null;
}

export interface CobrancaMp {
  id: string;
  assinaturaMpId: string | null;
  status: string | null;
  valorCentavos: number | null;
  pagamentoId: string | null;
  meio: string | null;
  pagaEm: string | null;
}

export interface OpcoesClienteMp {
  fetch?: typeof fetch;
  base?: string;
  tempoMaximoMs?: number;
}

export interface NovaAssinatura {
  motivo: string;
  referencia: string;
  email: string;
  valorCentavos: number;
  backUrl: string;
  /** Fim da assinatura. O Mercado Pago pede uma data final; usamos uma data distante e o cliente cancela quando quiser. */
  fim: Date;
}

const texto = (v: unknown): string | null => (typeof v === 'string' && v.trim() !== '' ? v : null);
const numero = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const objeto = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' ? (v as Record<string, unknown>) : {});

function lerAssinatura(bruta: unknown): AssinaturaMp {
  const o = objeto(bruta);
  const id = texto(o.id);
  if (!id) throw new ErroMp('Resposta do Mercado Pago sem o id da assinatura.', 502);
  return {
    id,
    status: texto(o.status) ?? '',
    referencia: texto(o.external_reference),
    proximaCobranca: texto(o.next_payment_date),
    linkDePagamento: texto(o.init_point)
  };
}

function lerCobranca(bruta: unknown): CobrancaMp {
  const o = objeto(bruta);
  const pagamento = objeto(o.payment);
  const id = texto(o.id) ?? (numero(o.id) !== null ? String(o.id) : null);
  if (!id) throw new ErroMp('Resposta do Mercado Pago sem o id da cobrança.', 502);
  const valor = numero(o.transaction_amount);
  const pagamentoId = texto(pagamento.id) ?? (numero(pagamento.id) !== null ? String(pagamento.id) : null);
  return {
    id,
    assinaturaMpId: texto(o.preapproval_id),
    status: texto(pagamento.status) ?? texto(o.status),
    valorCentavos: valor === null ? null : Math.round(valor * 100),
    pagamentoId,
    meio: texto(pagamento.payment_method_id) ?? texto(o.payment_method_id),
    pagaEm: texto(pagamento.date_approved) ?? texto(o.debit_date)
  };
}

export function criarClienteMp(token: string, opcoes: OpcoesClienteMp = {}) {
  const f = opcoes.fetch ?? fetch;
  const base = opcoes.base ?? 'https://api.mercadopago.com';
  const tempoMaximoMs = opcoes.tempoMaximoMs ?? 15_000;

  async function chamar(metodo: 'GET' | 'POST' | 'PUT', caminho: string, corpo?: unknown): Promise<unknown | null> {
    let r: Response;
    try {
      r = await f(`${base}${caminho}`, {
        method: metodo,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: corpo === undefined ? undefined : JSON.stringify(corpo),
        signal: AbortSignal.timeout(tempoMaximoMs)
      });
    } catch {
      throw new ErroMp('Não foi possível falar com o Mercado Pago.', 504);
    }
    if (r.status === 404) return null;
    const json = await r.json().catch(() => ({}));
    // A mensagem de erro do Mercado Pago não traz o token, mas só repassamos o código: o detalhe vai para o log do servidor, não para o cliente
    if (!r.ok) throw new ErroMp(`Mercado Pago respondeu ${r.status}${texto(objeto(json).message) ? `: ${texto(objeto(json).message)}` : ''}`, r.status);
    return json;
  }

  return {
    /** Cria a assinatura pendente e devolve o link da página de pagamento. */
    async criarAssinatura(n: NovaAssinatura): Promise<AssinaturaMp & { linkDePagamento: string }> {
      const a = lerAssinatura(
        await chamar('POST', '/preapproval', {
          reason: n.motivo,
          external_reference: n.referencia,
          payer_email: n.email,
          auto_recurring: {
            frequency: 1,
            frequency_type: 'months',
            end_date: n.fim.toISOString(),
            transaction_amount: n.valorCentavos / 100,
            currency_id: 'BRL'
          },
          back_url: n.backUrl,
          status: 'pending'
        })
      );
      if (!a.linkDePagamento) throw new ErroMp('O Mercado Pago não devolveu o link de pagamento.', 502);
      return { ...a, linkDePagamento: a.linkDePagamento };
    },

    async buscarAssinatura(id: string): Promise<AssinaturaMp | null> {
      const r = await chamar('GET', `/preapproval/${encodeURIComponent(id)}`);
      return r === null ? null : lerAssinatura(r);
    },

    /** Cancela a assinatura no Mercado Pago (não há como desfazer). */
    async cancelarAssinatura(id: string): Promise<void> {
      await chamar('PUT', `/preapproval/${encodeURIComponent(id)}`, { status: 'cancelled' });
    },

    /** Uma cobrança da assinatura (aviso `subscription_authorized_payment`). */
    async buscarCobranca(id: string): Promise<CobrancaMp | null> {
      const r = await chamar('GET', `/authorized_payments/${encodeURIComponent(id)}`);
      return r === null ? null : lerCobranca(r);
    }
  };
}

export type ClienteMp = ReturnType<typeof criarClienteMp>;
