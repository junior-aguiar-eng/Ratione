import { before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import type { PGlite } from '@electric-sql/pglite';
import { criarBanco } from '@ratione/db/harness';
import { inserirNorma, linhasDoCorpus, resolverDestinos } from './carga';
import { GRUPOS_DE_SINONIMOS, MAX_VARIANTES, variantesDaConsulta } from './sinonimos';

describe('Variantes de pesquisa por sinônimo (F3-05)', () => {
  it('troca a expressão que casa e mantém o resto da consulta', () => {
    const v = variantesDaConsulta('prazo do aluguel residencial');
    assert.deepEqual(v, [{ consulta: 'prazo do locação residencial', termo: 'locação' }]);
  });

  it('acentos e maiúsculas não impedem o casamento; palavra inteira, não pedaço', () => {
    assert.equal(variantesDaConsulta('Escuta Telefônica ilegal')[0].termo, 'grampo');
    assert.deepEqual(variantesDaConsulta('desalugueis'), [], '"aluguel" dentro de outra palavra não conta');
  });

  it('expressão longa cobre a curta: "demissão sem justa causa" não vira também uma troca de "justa causa"', () => {
    const v = variantesDaConsulta('demissão sem justa causa');
    assert.deepEqual(v.map(x => x.termo), ['dispensa sem justa causa', 'dispensa imotivada']);
  });

  it('consulta sem expressão do dicionário, ou igual a si mesma, não gera variante; o total é limitado', () => {
    assert.deepEqual(variantesDaConsulta('desconsideração da personalidade jurídica'), []);
    const muitas = variantesDaConsulta('escuta telefônica aluguel inquilino senhorio hora extra');
    assert.ok(muitas.length <= MAX_VARIANTES);
  });

  it('dicionário coerente: grupos com 2 ou mais expressões e nenhuma expressão em dois grupos (evita troca ambígua)', () => {
    const todas = GRUPOS_DE_SINONIMOS.flat().map(t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase());
    assert.ok(GRUPOS_DE_SINONIMOS.every(g => g.length >= 2));
    assert.equal(new Set(todas).size, todas.length);
  });
});

describe('Sinônimos contra o corpus do Planalto (F3-05)', () => {
  let db: PGlite;
  before(async () => {
    db = await criarBanco();
    for (const l of linhasDoCorpus(join(__dirname, '..', '..', 'corpus'))) await inserirNorma(db, l);
    await resolverDestinos(db);
  });
  const buscar = async (q: string, norma: string | null = null) => (await db.query<{ norma_id: string; rotulo: string }>('select norma_id, rotulo from buscar_dispositivos($1, $2, 100)', [q, norma])).rows;

  it('todo grupo tem ao menos uma expressão que a base conhece (senão o grupo não serve para nada)', async () => {
    for (const g of GRUPOS_DE_SINONIMOS) {
      const achou = (await Promise.all(g.map(async t => (await buscar(t)).length))).some(n => n > 0);
      assert.ok(achou, `nenhuma expressão do grupo existe no corpus: ${g.join(' | ')}`);
    }
  });

  it('o caso que motivou: o que o leigo escreve não acha, o termo da lei acha', async () => {
    assert.equal((await buscar('escuta telefônica')).length, 0);
    const lei = await buscar('interceptação das comunicações telefônicas');
    assert.ok(lei.some(r => r.norma_id === 'CF-1988'), 'a Constituição (art. 5º, XII) está entre os resultados');
    assert.equal((await buscar('senhorio', 'LEI-8245-1991')).length, 0);
    assert.ok((await buscar('locador', 'LEI-8245-1991')).length > 0, 'a Lei do Inquilinato fala em locador');
    assert.ok((await buscar('dispensa sem justa causa', 'DL-5452-1943')).length > 0, 'a CLT trata da dispensa sem justa causa');
  });
});
