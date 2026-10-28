import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { apelidoDoEmail, iniciais, nomeParaExibir, primeiroNome } from './nomeDeExibicao';

describe('Cabeçalho: nome de quem está logado', () => {
  it('usa o primeiro nome do perfil', () => {
    assert.equal(primeiroNome('José Bonifácio de Aguiar Santos Júnior'), 'José');
    assert.equal(primeiroNome('  Maria   Souza '), 'Maria');
    assert.equal(primeiroNome('Ana'), 'Ana');
  });

  it('perfil sem nome não conta', () => {
    assert.equal(primeiroNome(''), null);
    assert.equal(primeiroNome('   '), null);
    assert.equal(primeiroNome(null), null);
    assert.equal(primeiroNome(undefined), null);
  });

  it('nome comprido é limitado', () => {
    assert.equal(primeiroNome('A'.repeat(80))?.length, 24);
  });

  it('sem nome no perfil, usa só a parte do e-mail antes do @, sem mostrar o endereço', () => {
    assert.equal(apelidoDoEmail('maria.souza@exemplo.com'), 'Maria');
    assert.equal(apelidoDoEmail('joao_silva@exemplo.com'), 'Joao');
    assert.equal(apelidoDoEmail('advogado123@exemplo.com'), 'Advogado123');
    assert.equal(apelidoDoEmail('+tag@exemplo.com'), 'Tag');
    assert.equal(apelidoDoEmail('+-_@exemplo.com'), null);
    assert.equal(apelidoDoEmail('123@exemplo.com'), null);
    assert.equal(apelidoDoEmail(''), null);
    assert.equal(apelidoDoEmail(null), null);
    assert.ok(!nomeParaExibir(null, 'maria.souza@exemplo.com').includes('@'));
  });

  it('prefere o nome do perfil e, na falta de tudo, mostra "Conta"', () => {
    assert.equal(nomeParaExibir('Carlos Lima', 'outro@exemplo.com'), 'Carlos');
    assert.equal(nomeParaExibir('', 'maria.souza@exemplo.com'), 'Maria');
    assert.equal(nomeParaExibir(null, null), 'Conta');
    assert.equal(nomeParaExibir('', '+@x.com'), 'Conta');
  });

  it('inicial do círculo, maiúscula e com acento', () => {
    assert.equal(iniciais('José'), 'J');
    assert.equal(iniciais('émerson'), 'É');
    assert.equal(iniciais(''), '?');
    assert.equal(iniciais('123'), '?');
  });
});
