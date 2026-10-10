import { describe, it } from 'node:test';
import assert from 'node:assert';
import { caminhoSemQuery, descreverErro, linhaDeLog } from './log';

describe('Logs estruturados', () => {
  it('a linha é JSON com severity e message (o que o Cloud Logging lê) e os campos extras', () => {
    const o = JSON.parse(linhaDeLog('ERROR', 'falhou', { rota: '/conta', status: 500 }));
    assert.strictEqual(o.severity, 'ERROR');
    assert.strictEqual(o.message, 'falhou');
    assert.strictEqual(o.rota, '/conta');
    assert.strictEqual(o.status, 500);
  });

  it('o caminho perde a query e o fragmento (a query dos links de e-mail leva token_hash)', () => {
    assert.strictEqual(caminhoSemQuery('/auth/confirm?token_hash=pkce_abc&type=signup'), '/auth/confirm');
    assert.strictEqual(caminhoSemQuery('/conta#dados'), '/conta');
    assert.strictEqual(caminhoSemQuery('/prazozero'), '/prazozero');
  });

  it('exceção vira nome, mensagem e pilha curta; valor que não é Error não quebra', () => {
    const e = descreverErro(new TypeError('x'.repeat(900)));
    assert.strictEqual(e.erro_nome, 'TypeError');
    assert.strictEqual(e.erro_mensagem.length, 500);
    assert.ok(e.erro_pilha!.split('\n').length <= 8);
    assert.deepStrictEqual(descreverErro('texto'), { erro_nome: 'NaoErro', erro_mensagem: 'texto' });
  });
});
