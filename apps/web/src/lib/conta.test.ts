import { describe, it } from 'node:test';
import assert from 'node:assert';
import { linhaParaRegistro, registroParaLinha } from './historico';
import { traduzirErroAuth } from './erros-auth';

describe('Histórico na conta: conversão entre registro e linha do banco', () => {
  it('registro vira linha respeitando os limites do banco', () => {
    const l = registroParaLinha({ modulo: 'PrazoZero', tipo: 'prazo', titulo: 'x'.repeat(400), detalhe: 'd'.repeat(2000), url: '/prazozero' }, 'u1');
    assert.strictEqual(l.usuario_id, 'u1');
    assert.strictEqual(l.titulo.length, 300);
    assert.strictEqual(l.detalhe!.length, 1000);
    assert.strictEqual(l.url, '/prazozero');
  });

  it('URL externa ou protocolo-relativa é trocada por "/" (o banco só aceita caminho interno)', () => {
    for (const url of ['https://externo.com', '//externo.com', 'javascript:alert(1)', '']) {
      assert.strictEqual(registroParaLinha({ modulo: 'NormaViva', tipo: 'norma', titulo: 't', url }, 'u').url, '/', url);
    }
  });

  it('título vazio vira "Sem título" e detalhe ausente vira null', () => {
    const l = registroParaLinha({ modulo: 'TeseMap', tipo: 'tese', titulo: '   ', url: '/tesemap' }, 'u');
    assert.strictEqual(l.titulo, 'Sem título');
    assert.strictEqual(l.detalhe, null);
  });

  it('preserva a data original ao importar do navegador', () => {
    const l = registroParaLinha({ modulo: 'Argumenta', tipo: 'decisao', titulo: 't', url: '/argumenta' }, 'u', '2026-10-01T10:00:00.000Z');
    assert.strictEqual((l as { criado_em?: string }).criado_em, '2026-10-01T10:00:00.000Z');
  });

  it('linha vira registro (detalhe nulo some, URL nula vira "/")', () => {
    const r = linhaParaRegistro({ id: 'a', modulo: 'PrazoZero', tipo: 'prazo', titulo: 't', detalhe: null, url: null, criado_em: '2026-10-07T00:00:00Z' });
    assert.deepStrictEqual(r, { id: 'a', modulo: 'PrazoZero', tipo: 'prazo', titulo: 't', url: '/', criadoEm: '2026-10-07T00:00:00Z' });
  });
});

describe('Mensagens de erro do login', () => {
  it('traduz os erros comuns sem revelar se o e-mail existe', () => {
    assert.strictEqual(traduzirErroAuth('Invalid login credentials'), 'E-mail ou senha incorretos.');
    assert.match(traduzirErroAuth('Email not confirmed'), /Confirme seu e-mail/);
    assert.match(traduzirErroAuth('email rate limit exceeded'), /Muitas tentativas/);
    assert.match(traduzirErroAuth('Password should be at least 6 characters'), /Senha fraca/);
    assert.match(traduzirErroAuth('algo inesperado'), /Tente novamente/);
  });
});
