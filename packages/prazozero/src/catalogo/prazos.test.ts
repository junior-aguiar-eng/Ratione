import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CATALOGO_PRAZOS, prazosCalculaveis, buscarPrazo } from './prazos';
import { MotorPrazoZero } from '../motor/calculadora';

describe('Catálogo de prazos', () => {
  it('ids únicos, base legal e data de leitura em todas as entradas', () => {
    assert.strictEqual(new Set(CATALOGO_PRAZOS.map(p => p.id)).size, CATALOGO_PRAZOS.length);
    for (const p of CATALOGO_PRAZOS) {
      assert.ok(Number.isInteger(p.dias) && p.dias > 0, `${p.id}: dias`);
      assert.ok(p.baseLegal.length > 5, `${p.id}: base legal`);
      assert.match(p.fonte.lidoEm, /^\d{4}-\d{2}-\d{2}$/, `${p.id}: lidoEm`);
    }
  });

  it('prazo processual tem regime; prazo material não tem e fica fora do cálculo', () => {
    for (const p of CATALOGO_PRAZOS) {
      if (p.natureza === 'processual') assert.ok(p.regime, `${p.id}: falta regime`);
      else assert.strictEqual(p.regime, undefined, `${p.id}: prazo material não tem regime`);
    }
    assert.ok(prazosCalculaveis().every(p => p.natureza === 'processual'));
    assert.ok(!prazosCalculaveis().some(p => p.id === 'mandado-seguranca'));
  });

  it('valores conferidos na lei (07/10/2026)', () => {
    const dias = (id: string) => buscarPrazo(id)?.dias;
    assert.strictEqual(dias('apelacao'), 15);
    assert.strictEqual(dias('embargos-declaracao'), 5, 'exceção do art. 1.003, § 5º');
    assert.strictEqual(dias('contestacao'), 15);
    assert.strictEqual(dias('supletivo'), 5);
    assert.strictEqual(dias('recurso-ordinario-clt'), 8);
    assert.strictEqual(dias('embargos-declaracao-clt'), 5);
    assert.strictEqual(dias('apelacao-criminal'), 5);
    assert.strictEqual(dias('embargos-declaracao-criminal'), 2);
    assert.strictEqual(dias('recurso-inominado'), 10);
    assert.strictEqual(dias('mandado-seguranca'), 120);
  });

  it('todo prazo calculável roda no motor com o regime do catálogo', () => {
    const motor = new MotorPrazoZero();
    for (const p of prazosCalculaveis()) {
      const r = motor.calcularPrazo({
        dataEvento: '2026-03-10',
        tipoEvento: 'publicacao',
        diasPrazo: p.dias,
        regime: p.regime,
        tribunalId: 'TJSP',
        nomeAto: p.ato
      });
      assert.ok(r.dataVencimentoFinal > '2026-03-10', p.id);
      assert.strictEqual(r.regime, p.regime);
    }
  });
});
