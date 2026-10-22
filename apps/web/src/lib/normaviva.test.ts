import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { emLotes, IDS_POR_CONSULTA } from './normaviva';

describe('Consulta em lotes (F3-05: o .in() vai na URL)', () => {
  it('parte os ids em lotes, junta as linhas na ordem e nenhuma consulta passa do tamanho', async () => {
    const ids = Array.from({ length: 200 }, (_, i) => `D${i}`);
    const tamanhos: number[] = [];
    const r = await emLotes<string>(ids, async lote => (tamanhos.push(lote.length), { data: lote, error: null }), 80);
    assert.deepEqual(tamanhos, [80, 80, 40]);
    assert.deepEqual(r.data, ids);
    assert.equal(r.error, null);
  });

  it('o maior artigo do corpus (~700 ids) cabe em consultas com URL bem abaixo de 8 KB', async () => {
    const ids = Array.from({ length: 700 }, (_, i) => `LEI-14133-2021-D${String(i).padStart(5, '0')}`);
    let maior = 0;
    await emLotes<string>(ids, async lote => ((maior = Math.max(maior, lote.join(',').length)), { data: [], error: null }));
    assert.ok(maior < 4000, `maior lista de ids: ${maior} caracteres`);
    assert.ok(IDS_POR_CONSULTA <= 100);
  });

  it('sem ids não consulta nada; erro de um lote é devolvido', async () => {
    let chamadas = 0;
    assert.deepEqual(await emLotes<string>([], async () => (chamadas++, { data: [], error: null })), { data: [], error: null });
    assert.equal(chamadas, 0);
    const r = await emLotes<string>(['a', 'b', 'c'], async lote => (lote[0] === 'c' ? { data: null, error: { message: 'falhou' } } : { data: lote, error: null }), 2);
    assert.equal(r.error?.message, 'falhou');
  });
});
