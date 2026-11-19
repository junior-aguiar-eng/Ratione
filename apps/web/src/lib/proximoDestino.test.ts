import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { destinoDeRetorno, caminhoSeguro } from './proximoDestino';

describe('destinoDeRetorno e caminhoSeguro', () => {
  it('preserva pathname e search em links profundos', () => {
    assert.equal(destinoDeRetorno('/prazozero', '?ato=sentenca&tribunal=TJSP'), '/prazozero?ato=sentenca&tribunal=TJSP');
    assert.equal(destinoDeRetorno('/argumenta', ''), '/argumenta');
  });

  it('rejeita URLs externas e payloads de open-redirect no parâmetro proximo', () => {
    assert.equal(caminhoSeguro('https://evil.com'), '/meu-espaco');
    assert.equal(caminhoSeguro('http://evil.com/phish'), '/meu-espaco');
    assert.equal(caminhoSeguro('//evil.com'), '/meu-espaco');
    assert.equal(caminhoSeguro('/\\evil.com'), '/meu-espaco');
    assert.equal(caminhoSeguro('javascript:alert(1)'), '/meu-espaco');
    assert.equal(caminhoSeguro(''), '/meu-espaco');
    assert.equal(caminhoSeguro('   '), '/meu-espaco');
    assert.equal(caminhoSeguro(null), '/meu-espaco');
    assert.equal(caminhoSeguro(undefined), '/meu-espaco');
    assert.equal(caminhoSeguro('https://evil.com', '/prazozero'), '/prazozero');
  });

  it('preserva caminhos relativos válidos com query string e hash', () => {
    assert.equal(caminhoSeguro('/normaviva?d=CPC'), '/normaviva?d=CPC');
    assert.equal(caminhoSeguro('/prazozero?ato=sentenca#calculo'), '/prazozero?ato=sentenca#calculo');
    assert.equal(caminhoSeguro('  /conta/nova-senha  '), '/conta/nova-senha');
  });
});
