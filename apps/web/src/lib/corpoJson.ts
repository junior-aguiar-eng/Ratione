/**
 * Lê o corpo JSON de um pedido **com limite de bytes**, antes de interpretar. Sem isso, `request.json()` carrega o corpo inteiro na memória
 * (o Cloud Run só barra acima de 32 MB). Recusa com 413 quando o tamanho declarado ou o lido passa do limite.
 *
 * Corpo ausente, vazio ou que não é JSON dá `valor: null`: a validação da própria rota decide a recusa (400), como sempre foi.
 */
export type CorpoLido = { ok: true; valor: unknown } | { ok: false; status: 413; mensagem: string };

/** Limites por tipo de rota, em bytes. A decisão do Argumenta (até 70.000 caracteres, até 4 bytes cada) cabe com folga em 512 KB. */
export const LIMITE_CORPO = { pequeno: 16 * 1024, analiseDeIA: 512 * 1024 } as const;

const RECUSA: CorpoLido = { ok: false, status: 413, mensagem: 'O pedido é maior do que o permitido.' };

export async function lerJsonLimitado(request: Request, maxBytes: number): Promise<CorpoLido> {
  const declarado = Number(request.headers.get('content-length'));
  if (Number.isFinite(declarado) && declarado > maxBytes) return RECUSA;
  if (!request.body) return { ok: true, valor: null };

  const leitor = request.body.getReader();
  const partes: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await leitor.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await leitor.cancel().catch(() => undefined);
      return RECUSA;
    }
    partes.push(value);
  }
  try {
    return { ok: true, valor: JSON.parse(Buffer.concat(partes).toString('utf8')) };
  } catch {
    return { ok: true, valor: null };
  }
}
