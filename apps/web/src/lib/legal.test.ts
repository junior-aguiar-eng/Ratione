import { describe, it } from 'node:test';
import assert from 'node:assert';
import { RESPONSAVEL, VERSAO_TEXTOS, VIGENCIA_TEXTOS, dadosDeAceite } from './legal';

describe('Textos jurídicos: dados do responsável e registro do aceite', () => {
  it('o cadastro registra a versão dos termos aceita e o horário', () => {
    const d = dadosDeAceite(new Date('2026-10-10T12:00:00Z'));
    assert.deepStrictEqual(d, { termos_versao: VERSAO_TEXTOS, termos_aceitos_em: '2026-10-10T12:00:00.000Z' });
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
