import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { dataBrParaIso, juntarEspacos, USER_AGENT_NAVEGADOR } from './texto';

describe('Utilitários de texto', () => {
  it('juntarEspacos', () => {
    assert.equal(juntarEspacos('  a\n\tb   c  '), 'a b c');
    assert.equal(juntarEspacos(''), '');
  });

  it('dataBrParaIso: com e sem zero à esquerda; recusa formato estranho e data inexistente', () => {
    assert.equal(dataBrParaIso('02/12/2025'), '2025-12-02');
    assert.equal(dataBrParaIso('2/1/2025'), '2025-01-02');
    assert.throws(() => dataBrParaIso('2025-12-02'), /formato/);
    assert.throws(() => dataBrParaIso('31/02/2025'), /inexistente/);
  });

  it('User-Agent de navegador', () => assert.match(USER_AGENT_NAVEGADOR, /^Mozilla\/5\.0 .*Chrome\//));
});
