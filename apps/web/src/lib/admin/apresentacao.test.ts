import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { plural } from './apresentacao';

describe('Painel administrativo: plural dos contadores', () => {
  it('só o 1 fica no singular', () => {
    assert.equal(plural(1, 'conta', 'contas'), 'conta');
    assert.equal(plural(0, 'conta', 'contas'), 'contas');
    assert.equal(plural(2, 'conta', 'contas'), 'contas');
    assert.equal(plural(1000, 'conta', 'contas'), 'contas');
  });

  it('serve para a frase do custo por conta ("1 conta com chamadas registradas")', () => {
    const frase = (n: number) => `${n} ${plural(n, 'conta', 'contas')} com chamadas registradas no mês`;
    assert.equal(frase(1), '1 conta com chamadas registradas no mês');
    assert.equal(frase(2), '2 contas com chamadas registradas no mês');
  });
});
