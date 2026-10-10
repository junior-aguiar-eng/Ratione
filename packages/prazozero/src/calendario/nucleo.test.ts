import { describe, it } from 'node:test';
import assert from 'node:assert';
import { FONTES_CALENDARIO } from './eventos';
import { fonteCalendarioParaNucleo, fontesDoCalendario } from './nucleo';

describe('PrazoZero: fontes do calendário no núcleo', () => {
  it('toda fonte do calendário passa no esquema de Fonte do núcleo (URL e data de leitura válidas)', () => {
    const fontes = fontesDoCalendario();
    assert.strictEqual(fontes.length, Object.keys(FONTES_CALENDARIO).length);
    assert.strictEqual(new Set(fontes.map(f => f.id)).size, fontes.length);
  });

  it('a chave do registro vira o id e o texto lido é preservado', () => {
    const f = fonteCalendarioParaNucleo('stj-gdg-1010', FONTES_CALENDARIO['stj-gdg-1010']);
    assert.strictEqual(f.id, 'stj-gdg-1010');
    assert.strictEqual(f.lido, 'inteiro teor (PDF)');
  });

  it('fonte com URL inválida é recusada, não repassada', () => {
    assert.throws(() => fonteCalendarioParaNucleo('x', { ato: 'a', url: 'sem-url', lido: 'l', lidoEm: '2026-10-07' }));
  });
});
