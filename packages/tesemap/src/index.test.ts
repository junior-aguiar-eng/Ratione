import { describe, it } from 'node:test';
import assert from 'node:assert';
import { GRAFOS_PRECEDENTES_CATALOGADOS, NoGrafoSchema, ArestaGrafoSchema, noParaPrecedente, precedentesDoGrafo } from './index';

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

describe('TeseMap: adaptador para o núcleo', () => {
  const procedencia = {
    origem: 'curado' as const,
    fontes: [{ id: 'stj', ato: 'STJ, Temas repetitivos', url: 'https://www.stj.jus.br/', lido: 'página oficial', lidoEm: '2026-10-10' }]
  };

  it('os grafos catalogados dão Tema 1.076 e Súmula 479 do STJ, com id canônico e tipo certo', () => {
    const todos = Object.values(GRAFOS_PRECEDENTES_CATALOGADOS).flatMap(g => precedentesDoGrafo(g, procedencia));
    const porId = Object.fromEntries(todos.map(p => [p.id, p]));
    assert.strictEqual(porId['STJ-TEMA-1076'].tipo, 'stj_repetitivo');
    assert.strictEqual(porId['STJ-SUMULA-479'].tipo, 'sumula_stj');
    assert.strictEqual(todos.length, 2);
    for (const p of todos) assert.strictEqual(p.procedencia.fontes[0].id, 'stj');
  });

  it('classifica súmula do STF, súmula vinculante e tema de repercussão geral', () => {
    const no = (tribunal: string, numeroReferencia: string) => ({ id: 'n', label: 'l', tipo: 'tese_vinculante' as const, tribunal, numeroReferencia, descricao: 'd' });
    assert.strictEqual(noParaPrecedente(no('STF', 'Súmula 10'), procedencia).tipo, 'sumula_stf');
    assert.strictEqual(noParaPrecedente(no('STF', 'Súmula Vinculante 10'), procedencia).id, 'STF-SV-10');
    assert.strictEqual(noParaPrecedente(no('STF', 'Tema 1.234'), procedencia).tipo, 'stf_repercussao_geral');
  });

  it('recusa nó que não é tese, sem número ou com referência que não dá para classificar', () => {
    const base = { id: 'n', label: 'l', descricao: 'd' };
    assert.throws(() => noParaPrecedente({ ...base, tipo: 'dispositivo_legal' }, procedencia));
    assert.throws(() => noParaPrecedente({ ...base, tipo: 'tese_vinculante', tribunal: 'STJ' }, procedencia));
    assert.throws(() => noParaPrecedente({ ...base, tipo: 'tese_vinculante', tribunal: 'STJ', numeroReferencia: 'IAC 5' }, procedencia));
  });
});
