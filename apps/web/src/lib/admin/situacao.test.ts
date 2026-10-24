import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { servirAcessoAdministrativo } from './situacao';

describe('Atalho administrativo: autorização privada da sessão', () => {
  it('somente a autorização do servidor permite mostrar o atalho', async () => {
    for (const autorizado of [false, true]) {
      const resposta = await servirAcessoAdministrativo(async () => autorizado);
      assert.equal(resposta.status, 200);
      assert.deepEqual(await resposta.json(), { administrador: autorizado });
      assert.equal(resposta.headers.get('Cache-Control'), 'private, no-store');
      assert.equal(resposta.headers.get('Vary'), 'Cookie');
    }
  });
  it('falha de autenticação mantém o atalho oculto sem expor detalhes', async () => {
    const resposta = await servirAcessoAdministrativo(async () => { throw new Error('detalhe interno'); });
    assert.equal(resposta.status, 503);
    assert.deepEqual(await resposta.json(), { administrador: false });
    assert.equal(resposta.headers.get('Cache-Control'), 'private, no-store');
  });
});
