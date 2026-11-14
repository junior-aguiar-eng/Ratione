/**
 * Lê o corpo de um pedido **com limite de bytes em streaming**, antes de interpretar. Sem isso, `request.text()`, `request.json()` ou
 * `request.formData()` carregam o corpo inteiro na memória quando `content-length` está ausente (o Cloud Run só barra acima de 32 MB).
 * Recusa com 413 quando o tamanho declarado ou o lido passa do limite.
 *
 * Para JSON, corpo ausente, vazio ou inválido dá `valor: null`: a validação da própria rota decide a recusa (400), como sempre foi.
 */
export type BytesLidos = { ok: true; bytes: Uint8Array<ArrayBuffer> } | { ok: false; status: 413; mensagem: string };
export type TextoLido = { ok: true; texto: string } | { ok: false; status: 413; mensagem: string };
export type FormDataLido = { ok: true; formData: FormData | null } | { ok: false; status: 413; mensagem: string };
export type CorpoLido = { ok: true; valor: unknown } | { ok: false; status: 413; mensagem: string };

/** Limites por tipo de rota, em bytes. A decisão do Argumenta (até 70.000 caracteres, até 4 bytes cada) cabe com folga em 512 KB. */
export const LIMITE_CORPO = { pequeno: 16 * 1024, analiseDeIA: 512 * 1024 } as const;

const RECUSA: { ok: false; status: 413; mensagem: string } = {
  ok: false,
  status: 413,
  mensagem: 'O pedido é maior do que o permitido.'
};

export async function lerBytesLimitados(request: Request, maxBytes: number): Promise<BytesLidos> {
  const declarado = Number(request.headers.get('content-length'));
  if (Number.isFinite(declarado) && declarado > maxBytes) return RECUSA;
  if (!request.body) return { ok: true, bytes: new Uint8Array(0) };

  const leitor = request.body.getReader();
  const partes: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await leitor.read();
    if (done) break;
    if (!value || value.byteLength === 0) continue;
    total += value.byteLength;
    if (total > maxBytes) {
      await leitor.cancel().catch(() => undefined);
      return RECUSA;
    }
    partes.push(value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const parte of partes) {
    bytes.set(parte, offset);
    offset += parte.byteLength;
  }
  return { ok: true, bytes };
}

export async function lerTextoLimitado(request: Request, maxBytes: number): Promise<TextoLido> {
  const lido = await lerBytesLimitados(request, maxBytes);
  if (!lido.ok) return lido;
  return { ok: true, texto: new TextDecoder().decode(lido.bytes) };
}

export async function lerJsonLimitado(request: Request, maxBytes: number): Promise<CorpoLido> {
  const lido = await lerTextoLimitado(request, maxBytes);
  if (!lido.ok) return lido;
  if (!lido.texto) return { ok: true, valor: null };
  try {
    return { ok: true, valor: JSON.parse(lido.texto) };
  } catch {
    return { ok: true, valor: null };
  }
}

export async function lerFormDataLimitado(request: Request, maxBytes: number): Promise<FormDataLido> {
  const lido = await lerBytesLimitados(request, maxBytes);
  if (!lido.ok) return lido;
  try {
    const formData = await new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body: lido.bytes
    }).formData();
    return { ok: true, formData };
  } catch {
    return { ok: true, formData: null };
  }
}
