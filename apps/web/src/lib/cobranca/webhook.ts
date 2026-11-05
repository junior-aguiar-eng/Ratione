import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Validação do aviso (webhook) do Mercado Pago, como descreve a documentação deles: o cabeçalho `x-signature` traz `ts=<instante>,v1=<hash>`;
 * o hash é o HMAC-SHA256, em hexadecimal, da chave secreta da aplicação sobre o manifesto
 * `id:<data.id>;request-id:<x-request-id>;ts:<ts>;` (par ausente é omitido; `data.id` alfanumérico entra em minúsculas).
 * Aviso sem assinatura válida é recusado (401) e nada é gravado. O `ts` **não recusa** (o Mercado Pago pode reenviar um aviso legítimo horas depois, com a
 * assinatura original, e recusá-lo perderia o evento): quando é antigo, a rota só registra um aviso no log (`idadeDoAvisoEmSegundos`). O mesmo aviso
 * reenviado é barrado pelo registro de eventos (`mp_eventos`, por `x-request-id`), e todo processamento relê o recurso na API do Mercado Pago
 * em vez de confiar no corpo.
 */

export interface DadosDaAssinatura {
  xSignature: string | null;
  xRequestId: string | null;
  /** O `data.id` da query string do aviso. */
  dataId: string | null;
  segredo: string;
}

/** Extrai `ts` e `v1` de `ts=1704908010,v1=618c85…`. */
export function partesDaAssinatura(xSignature: string): { ts: string | null; v1: string | null } {
  let ts: string | null = null;
  let v1: string | null = null;
  for (const parte of xSignature.split(',')) {
    const i = parte.indexOf('=');
    if (i < 0) continue;
    const chave = parte.slice(0, i).trim();
    const valor = parte.slice(i + 1).trim();
    if (chave === 'ts') ts = valor;
    else if (chave === 'v1') v1 = valor;
  }
  return { ts, v1 };
}

/** O manifesto que o Mercado Pago assina. */
export function manifesto(dataId: string | null, xRequestId: string | null, ts: string): string {
  const id = dataId ? (/^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId) : null;
  return [id ? `id:${id};` : '', xRequestId ? `request-id:${xRequestId};` : '', `ts:${ts};`].join('');
}

/** O aviso veio mesmo do Mercado Pago? Comparação em tempo constante. */
export function assinaturaValida(d: DadosDaAssinatura): boolean {
  if (!d.xSignature || !d.segredo) return false;
  const { ts, v1 } = partesDaAssinatura(d.xSignature);
  if (!ts || !v1 || !/^[0-9a-f]+$/i.test(v1)) return false;
  const esperado = createHmac('sha256', d.segredo).update(manifesto(d.dataId, d.xRequestId, ts)).digest();
  const recebido = Buffer.from(v1.toLowerCase(), 'hex');
  return recebido.length === esperado.length && timingSafeEqual(recebido, esperado);
}

/** Gera a assinatura que o Mercado Pago geraria (para os testes e para simular um aviso em ambiente de teste). */
export function assinarAviso(segredo: string, dataId: string | null, xRequestId: string | null, ts: string): string {
  const v1 = createHmac('sha256', segredo).update(manifesto(dataId, xRequestId, ts)).digest('hex');
  return `ts=${ts},v1=${v1}`;
}

/**
 * Idade do aviso, em segundos, pelo `ts` da assinatura (segundos ou milissegundos desde 1970); `null` se não houver `ts` legível.
 * Só informa: a rota usa para registrar no log um aviso antigo, sem recusá-lo.
 */
export function idadeDoAvisoEmSegundos(xSignature: string | null, agoraMs: number): number | null {
  const { ts } = partesDaAssinatura(xSignature ?? '');
  if (!ts || !/^\d+$/.test(ts)) return null;
  const n = Number(ts);
  const emMs = n > 1e12 ? n : n * 1000;
  return Math.max(0, Math.round((agoraMs - emMs) / 1000));
}
