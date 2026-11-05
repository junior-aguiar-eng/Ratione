import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { LIMITE_CORPO, lerJsonLimitado } from './corpoJson';
import { veioDoSite } from './origem';

const pedido = (corpo: string | null, cabecalhos: Record<string, string> = {}) =>
  new Request('http://localhost:3000/api/x', { method: 'POST', body: corpo, headers: cabecalhos });

describe('leitura do corpo JSON com limite', () => {
  it('lê um JSON dentro do limite', async () => {
    assert.deepEqual(await lerJsonLimitado(pedido('{"a":1,"b":"ç"}'), 1024), { ok: true, valor: { a: 1, b: 'ç' } });
  });

  it('corpo ausente, vazio ou que não é JSON dá valor nulo (a validação da rota recusa depois)', async () => {
    assert.deepEqual(await lerJsonLimitado(pedido(null), 1024), { ok: true, valor: null });
    assert.deepEqual(await lerJsonLimitado(pedido(''), 1024), { ok: true, valor: null });
    assert.deepEqual(await lerJsonLimitado(pedido('não é json'), 1024), { ok: true, valor: null });
  });

  it('recusa com 413 quando o tamanho declarado já passa do limite, sem ler o corpo', async () => {
    const r = await lerJsonLimitado(pedido('{}', { 'content-length': '999999' }), 1024);
    assert.deepEqual(r, { ok: false, status: 413, mensagem: 'O pedido é maior do que o permitido.' });
  });

  it('recusa com 413 quando o corpo lido passa do limite, mesmo sem tamanho declarado', async () => {
    const grande = JSON.stringify({ texto: 'x'.repeat(5000) });
    const fluxo = new ReadableStream<Uint8Array>({
      start(c) {
        const bytes = new TextEncoder().encode(grande);
        for (let i = 0; i < bytes.length; i += 1000) c.enqueue(bytes.subarray(i, i + 1000));
        c.close();
      }
    });
    const r = await lerJsonLimitado(new Request('http://localhost:3000/api/x', { method: 'POST', body: fluxo, duplex: 'half' } as RequestInit), 2048);
    assert.equal(r.ok, false);
    assert.equal(!r.ok && r.status, 413);
  });

  it('o limite da análise de IA comporta uma decisão de 70.000 caracteres acentuados', () => {
    // até 2 bytes por caractere em português, mais as aspas e o envelope JSON
    assert.ok(70_000 * 2 + 10_000 < LIMITE_CORPO.analiseDeIA);
    assert.ok(LIMITE_CORPO.pequeno < LIMITE_CORPO.analiseDeIA);
  });
});

describe('origem estrita nas rotas que alteram dados', () => {
  const req = (h: Record<string, string>) => new Request('https://ratione.nexojuris.ia.br/api/x', { method: 'POST', headers: h });
  it('aceita só o Origin igual ao do site', () => {
    assert.equal(veioDoSite(req({ host: 'ratione.nexojuris.ia.br', 'x-forwarded-proto': 'https', origin: 'https://ratione.nexojuris.ia.br' })), true);
  });
  it('recusa Origin de outro site, e também a falta de Origin', () => {
    assert.equal(veioDoSite(req({ host: 'ratione.nexojuris.ia.br', 'x-forwarded-proto': 'https', origin: 'https://outro-site.com' })), false);
    assert.equal(veioDoSite(req({ host: 'ratione.nexojuris.ia.br', 'x-forwarded-proto': 'https' })), false);
    assert.equal(veioDoSite(req({ host: 'ratione.nexojuris.ia.br', 'x-forwarded-proto': 'https', origin: 'null' })), false);
  });
});
