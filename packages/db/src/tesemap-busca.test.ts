import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { PGlite } from '@electric-sql/pglite';
import { como, criarBanco } from './harness';

const FONTE = JSON.stringify([
  { id: 'f1', ato: 'Ato de teste', url: 'https://exemplo.gov.br/ato', lido: 'o ato inteiro', lidoEm: '2026-11-13' }
]);

describe('TeseMap: tesemap_buscar com consulta vazia, stopwords ou pontuação', () => {
  let db: PGlite;

  before(async () => {
    db = await criarBanco();
    await db.transaction(async tx => {
      await tx.exec('set local role service_role');
      await tx.query(
        `insert into public.tesemap_nos (id, tipo, rotulo, tribunal, numero_referencia, descricao, dispositivo_id, detalhes, origem_dado, fontes, atualizado_em)
         values
           ('STJ-TEMA-1076', 'precedente', 'Tema 1076 do STJ', 'STJ', 'Tema 1076', 'Honorários por apreciação equitativa.', null, '{"dataJulgamento":"2022-03-16"}', 'curado', $1::jsonb, '2026-11-13'),
           ('STJ-IAC-5', 'precedente', 'IAC 5 do STJ', 'STJ', 'IAC 5', 'Competência da Justiça Federal.', null, '{"dataJulgamento":"2021-01-01"}', 'curado', $1::jsonb, '2026-11-13')`,
        [FONTE]
      );
    });
  });

  after(async () => {
    await db?.close();
  });

  it('consulta só com stopwords ("de da do") ou só pontuação retorna a lista padrão em vez de 0 linhas', async () => {
    for (const consulta of ['de da do', 'a o e para com', '... --- !!!', '', '   ']) {
      const r = await como(db, null, tx =>
        tx.query<{ id: string }>('select id from public.tesemap_buscar($1, null, null, 20, null)', [consulta])
      );
      assert.deepEqual(
        r.rows.map(x => x.id),
        ['STJ-TEMA-1076', 'STJ-IAC-5'],
        `esperava retorno padrão para consulta=${JSON.stringify(consulta)}`
      );
    }
  });

  it('consulta com termo válido continua filtrando por relevância e respeitando prefixo e grants', async () => {
    const termo = await como(db, null, tx =>
      tx.query<{ id: string }>('select id from public.tesemap_buscar($1, null, null, 20, null)', ['honorarios'])
    );
    assert.deepEqual(termo.rows.map(x => x.id), ['STJ-TEMA-1076']);

    const prefixo = await como(db, null, tx =>
      tx.query<{ id: string }>('select id from public.tesemap_buscar($1, null, null, 20, $2)', ['de da do', 'STJ-IAC-'])
    );
    assert.deepEqual(prefixo.rows.map(x => x.id), ['STJ-IAC-5']);
  });
});
