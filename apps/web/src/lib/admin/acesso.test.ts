import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { autorizarAdministrador } from './acesso';

const ADMIN = 'aaaaaaaa-1111-4111-8111-111111111111';
const OUTRO = 'bbbbbbbb-2222-4222-8222-222222222222';
const sessao = (id: string, extra = {}) => async () => ({ data: { user: { id, ...extra } }, error: null });

describe('Painel administrativo: autorização no servidor', () => {
  it('só libera id explicitamente configurado e devolvido pela verificação da sessão', async () => {
    assert.equal(await autorizarAdministrador(` ${ADMIN.toUpperCase()};${OUTRO}`, sessao(ADMIN)), true);
    assert.equal(await autorizarAdministrador(ADMIN, sessao(OUTRO)), false);
    assert.equal(await autorizarAdministrador(ADMIN, sessao(OUTRO, { user_metadata: { admin: true, role: 'admin', id: ADMIN } })), false);
  });
  it('sem configuração válida não verifica sessão nem permite acesso', async () => {
    for (const ids of [undefined, '', '*', 'admin@exemplo.com', 'id-invalido']) {
      assert.equal(await autorizarAdministrador(ids, async () => assert.fail('não deve verificar')), false);
    }
  });
  it('ausência de usuário, erro de autenticação ou conta anônima não autorizam', async () => {
    assert.equal(await autorizarAdministrador(ADMIN, async () => ({ data: { user: null }, error: null })), false);
    assert.equal(await autorizarAdministrador(ADMIN, async () => ({ data: { user: { id: ADMIN } }, error: new Error('token inválido') })), false);
    assert.equal(await autorizarAdministrador(ADMIN, sessao(ADMIN, { is_anonymous: true })), false);
    assert.equal(await autorizarAdministrador(ADMIN, async () => { throw new Error('auth indisponível'); }), false);
  });
});
