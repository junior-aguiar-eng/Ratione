import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { contarPorCaso, ehErroDeLimiteDeCasos, validarNomeDoCaso } from './casos';
import { linhaParaRegistro } from './historico';

describe('Casos: nome', () => {
  it('limpa os espaços e aceita de 1 a 80 caracteres', () => {
    assert.deepEqual(validarNomeDoCaso('  Ação   de cobrança  A '), { ok: true, nome: 'Ação de cobrança A' });
    assert.deepEqual(validarNomeDoCaso('x'.repeat(80)), { ok: true, nome: 'x'.repeat(80) });
  });

  it('recusa vazio e acima de 80', () => {
    assert.equal(validarNomeDoCaso('   ').ok, false);
    assert.equal(validarNomeDoCaso('x'.repeat(81)).ok, false);
  });

  it('recusa o que a detecção reconhece como dado pessoal: CPF, e-mail, número de processo', () => {
    for (const n of ['Caso 529.982.247-25', 'maria@exemplo.com.br', 'Processo 0001234-56.2024.8.26.0100']) {
      const r = validarNomeDoCaso(n);
      assert.equal(r.ok, false, n);
      assert.match(r.ok ? '' : r.mensagem, /nome que só você entenda/);
    }
  });
});

describe('Casos: contagem e itens', () => {
  it('conta os itens de cada caso e os soltos', () => {
    const r = contarPorCaso([{ casoId: 'a' }, { casoId: 'a' }, { casoId: 'b' }, {}, {}]);
    assert.deepEqual([...r.porCaso], [['a', 2], ['b', 1]]);
    assert.equal(r.soltos, 2);
  });

  it('reconhece o aviso de limite do banco', () => {
    assert.equal(ehErroDeLimiteDeCasos('limite de 50 casos por conta'), true);
    assert.equal(ehErroDeLimiteDeCasos('outro erro'), false);
    assert.equal(ehErroDeLimiteDeCasos(undefined), false);
  });

  it('o registro da conta leva o caso só quando há', () => {
    const base = { id: 'a', modulo: 'NormaViva' as const, tipo: 'norma' as const, titulo: 't', detalhe: null, url: null, criado_em: '2026-11-05T00:00:00Z' };
    assert.equal('casoId' in linhaParaRegistro(base), false);
    assert.equal(linhaParaRegistro({ ...base, caso_id: 'c1' }).casoId, 'c1');
    assert.equal('casoId' in linhaParaRegistro({ ...base, caso_id: null }), false);
  });
});
