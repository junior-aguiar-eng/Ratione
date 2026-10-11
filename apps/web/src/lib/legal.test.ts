import { describe, it } from 'node:test';
import assert from 'node:assert';
import { RESPONSAVEL, VERSAO_TEXTOS, VIGENCIA_TEXTOS, dadosDeAceite } from './legal';

describe('Textos jurídicos: dados do responsável e registro do aceite', () => {
  it('o cadastro envia só a versão dos termos aceita: o horário é do servidor, não do navegador', () => {
    assert.deepStrictEqual(dadosDeAceite(), { termos_versao: VERSAO_TEXTOS });
  });

  it('a versão enviada tem o formato que o banco aceita', () => {
    assert.match(VERSAO_TEXTOS, /^[0-9]+(\.[0-9]+){0,2}$/);
  });

  it('responsável e canal do titular estão preenchidos e o e-mail tem formato válido', () => {
    assert.ok(RESPONSAVEL.nome.trim().split(/\s+/).length >= 3, 'nome completo');
    assert.match(RESPONSAVEL.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it('a vigência é uma data ISO que existe', () => {
    assert.match(VIGENCIA_TEXTOS, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(!Number.isNaN(new Date(`${VIGENCIA_TEXTOS}T00:00:00Z`).getTime()));
  });
});
