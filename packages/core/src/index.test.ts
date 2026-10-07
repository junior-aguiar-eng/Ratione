import { describe, it } from 'node:test';
import assert from 'node:assert';
import { TRIBUNAIS_BRASIL, TribunalSchema } from './index';

describe('Núcleo: tribunais', () => {
  it('toda entrada do catálogo respeita o esquema e a chave é o id', () => {
    for (const [chave, t] of Object.entries(TRIBUNAIS_BRASIL)) {
      const r = TribunalSchema.safeParse(t);
      assert.ok(r.success, `${chave}: ${r.success ? '' : JSON.stringify(r.error.issues)}`);
      assert.strictEqual(t.id, chave);
      assert.strictEqual(t.sigla, chave);
    }
  });

  it('tribunais estaduais e regionais têm UF; superiores não', () => {
    for (const t of Object.values(TRIBUNAIS_BRASIL)) {
      if (t.esfera === 'estadual') assert.ok(t.uf, `${t.id}: sem UF`);
    }
  });
});
