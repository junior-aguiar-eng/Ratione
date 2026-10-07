import { describe, it } from 'node:test';
import assert from 'node:assert';
import { GRAFOS_PRECEDENTES_CATALOGADOS, NoGrafoSchema, ArestaGrafoSchema } from './index';

describe('TeseMap: grafos catalogados', () => {
  for (const [id, g] of Object.entries(GRAFOS_PRECEDENTES_CATALOGADOS)) {
    it(`${id}: nós e arestas respeitam o esquema e as arestas ligam nós existentes`, () => {
      const ids = new Set(g.nos.map(n => n.id));
      assert.strictEqual(ids.size, g.nos.length, 'ids de nó repetidos');
      for (const n of g.nos) assert.ok(NoGrafoSchema.safeParse(n).success, n.id);
      for (const a of g.arestas) {
        assert.ok(ArestaGrafoSchema.safeParse(a).success, a.id);
        assert.ok(ids.has(a.source) && ids.has(a.target), `${a.id}: aresta para nó inexistente`);
      }
    });
  }
});
