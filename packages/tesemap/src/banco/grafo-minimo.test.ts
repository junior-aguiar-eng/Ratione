import { before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import type { PGlite } from '@electric-sql/pglite';
import { como, criarBanco } from '@ratione/db/harness';
import { inserirNorma, linhasDoCorpus } from '@ratione/normaviva/corpus';
import { carregarPrecedentesStj, manifestoStj } from '../stj';
import { carregarAplicacaoStf, carregarTemasRgStf, manifestoStf } from '../stf';
import { nosDosPrecedentesStj, temasStfCitadosPeloStj } from './nos-stj';
import { nosDosTemasStf } from './nos-stf';
import { arestasDoGrafoMinimo, carregarGrafoMinimo, GrafoMinimoSchema, nosDosDispositivos, PREFIXO_DISPOSITIVO, type GrafoMinimo } from './grafo-minimo';
import { carregarArestas, carregarNos, type ClienteCarga } from './carregar-supabase';
import type { NoBanco } from './esquemas';

type Tx = Parameters<Parameters<PGlite['transaction']>[0]>[0];
const comoServidor = <T>(db: PGlite, fn: (tx: Tx) => Promise<T>) =>
  db.transaction(async tx => {
    await tx.exec('set local role service_role');
    return fn(tx);
  });

const COLUNAS_NO = 'id, tipo, rotulo, tribunal, numero_referencia, descricao, dispositivo_id, detalhes, origem_dado, fontes, validado_por, validado_em, atualizado_em';
const COLUNAS_ARESTA = 'origem_id, destino_id, tipo, rotulo, origem_dado, fontes, validado_por, validado_em, atualizado_em';

/** Cliente falso que grava de verdade no PGlite, como o `upsert` do Supabase (insert ... on conflict do update). */
function clienteDoBanco(db: PGlite): ClienteCarga {
  return {
    from: tabela => ({
      upsert: async (linhas, { onConflict }) => {
        const colunas = tabela === 'tesemap_nos' ? COLUNAS_NO : COLUNAS_ARESTA;
        const chave = onConflict.split(',');
        const atualizar = colunas.split(', ').filter(c => !chave.includes(c)).map(c => `${c} = excluded.${c}`).join(', ');
        try {
          await comoServidor(db, tx =>
            tx.query(`insert into public.${tabela} (${colunas}) select ${colunas} from jsonb_populate_recordset(null::public.${tabela}, $1::jsonb) on conflict (${onConflict}) do update set ${atualizar}`, [JSON.stringify(linhas)])
          );
          return { error: null };
        } catch (e) {
          return { error: { message: (e as Error).message } };
        }
      },
      select: async () => {
        const r = await comoServidor(db, tx => tx.query<{ n: string }>(`select count(*) as n from public.${tabela}`));
        return { count: Number(r.rows[0].n), error: null };
      }
    })
  };
}

const validarTudo = (g: GrafoMinimo): GrafoMinimo => ({ ...g, arestas: g.arestas.map(a => ({ ...a, validacao: { status: 'validado', por: 'Revisor', em: '2026-10-22' } })) });

describe('Grafo mínimo conhecido (F4-05)', () => {
  const grafo = carregarGrafoMinimo();
  const corpus = linhasDoCorpus(join(__dirname, '..', '..', '..', 'normaviva', 'corpus'), ['LEI-13105-2015']);
  const stj = nosDosPrecedentesStj(carregarPrecedentesStj(), manifestoStj(), () => []);
  const stf = nosDosTemasStf(carregarTemasRgStf(), manifestoStf(), () => [], temasStfCitadosPeloStj(stj), carregarAplicacaoStf());
  const dispositivos = nosDosDispositivos(grafo, corpus);
  // Os nós do grafo mínimo saem da importação real: o Tema 1076 do STJ e o Tema 1255 do STF, mais os dispositivos do CPC
  const nos: NoBanco[] = [...stj, ...stf].filter(n => n.id === 'STJ-TEMA-1076' || n.id === 'STF-RG-1255').concat(dispositivos);

  it('os dispositivos viram nós com o texto oficial do Planalto e o atalho para o NormaViva', () => {
    assert.equal(dispositivos.length, 4);
    const p8 = dispositivos.find(n => n.id === `${PREFIXO_DISPOSITIVO}LEI-13105-2015|corpo|art. 85, § 8º`)!;
    assert.equal(p8.dispositivo_id, 'LEI-13105-2015|corpo|art. 85, § 8º');
    assert.match(p8.descricao, /^Nas causas em que for inestimável ou irrisório o proveito econômico/);
    assert.match(p8.fontes[0].url, /planalto\.gov\.br.*l13105compilada\.htm$/);
    assert.equal(p8.origem_dado, 'curado');
    assert.throws(() => nosDosDispositivos({ ...grafo, dispositivos: [{ id: 'LEI-13105-2015|corpo|art. 85, § 99', rotulo: 'x' }] }, corpus), /não existe no corpus/);
  });

  it('as 5 arestas resolvem para nós da importação real, citam trecho literal e nascem sugeridas pela IA e pendentes', () => {
    assert.equal(nos.length, 6, 'Tema 1076, Tema 1255 e os 4 dispositivos');
    const arestas = arestasDoGrafoMinimo(grafo, nos);
    assert.equal(arestas.length, 5);
    for (const a of arestas) {
      assert.equal(a.origem_dado, 'sugerido_ia');
      assert.equal(a.validado_por, null);
      assert.match(a.fontes[0].lido, /^Trecho literal: "/);
      assert.match(a.fontes[0].url, /^https:\/\//);
    }
  });

  it('recusa trecho que não está palavra por palavra no texto oficial, nó inexistente e trecho de quem não é ponta da aresta', () => {
    const [a] = grafo.arestas;
    const com = (sobre: Partial<typeof a>) => ({ ...grafo, arestas: [{ ...a, ...sobre }] });
    assert.throws(() => arestasDoGrafoMinimo(com({ trecho: 'Apenas se admite arbitramento de honorários por equidade em qualquer causa.' }), nos), /palavra por palavra/);
    assert.throws(() => arestasDoGrafoMinimo(com({ destino: 'STJ-TEMA-999999' }), nos), /não existe/);
    assert.throws(() => arestasDoGrafoMinimo(com({ trechoDe: 'STF-RG-1255' }), nos), /uma das pontas/);
    // Espaços a mais não contam como diferença
    assert.equal(arestasDoGrafoMinimo(com({ trecho: a.trecho.replace(/ /g, '  ') }), nos).length, 1);
  });

  it('validação: validado leva nome e data; pendente, nenhum dos dois', () => {
    const [a] = grafo.arestas;
    const comValidacao = (validacao: unknown) => GrafoMinimoSchema.safeParse({ ...grafo, arestas: [{ ...a, validacao }] }).success;
    assert.equal(comValidacao({ status: 'validado', por: 'Revisor', em: '2026-10-22' }), true);
    assert.equal(comValidacao({ status: 'pendente', por: null, em: null }), true);
    assert.equal(comValidacao({ status: 'validado', por: null, em: null }), false);
    assert.equal(comValidacao({ status: 'validado', por: 'Revisor', em: null }), false);
    assert.equal(comValidacao({ status: 'pendente', por: 'Revisor', em: '2026-10-22' }), false);
    assert.equal(arestasDoGrafoMinimo(validarTudo(grafo), nos)[0].validado_em, '2026-10-22');
  });

  describe('no esquema real (PGlite), como a tela lê', () => {
    let db: PGlite;
    const vizinhosDoTema1076 = async () => {
      const r = await como(db, null, tx =>
        tx.query<{ origem_id: string; destino_id: string }>("select origem_id, destino_id from public.tesemap_arestas where origem_id = 'STJ-TEMA-1076' or destino_id = 'STJ-TEMA-1076'")
      );
      return [...new Set(r.rows.map(x => (x.origem_id === 'STJ-TEMA-1076' ? x.destino_id : x.origem_id)))].sort();
    };

    before(async () => {
      db = await criarBanco();
      await inserirNorma(db, corpus[0]);
      const cliente = clienteDoBanco(db);
      await carregarNos(cliente, nos);
      await carregarArestas(cliente, arestasDoGrafoMinimo(grafo, nos));
    });

    it('antes da validação: os nós aparecem (com o atalho para o NormaViva), nenhuma aresta aparece', async () => {
      const n = await como(db, null, tx => tx.query<{ id: string; dispositivo_id: string | null }>('select id, dispositivo_id from public.tesemap_nos order by id'));
      assert.equal(n.rows.length, 6);
      assert.equal(n.rows.filter(x => x.dispositivo_id !== null).length, 4);
      assert.deepEqual(await vizinhosDoTema1076(), []);
      const todas = await comoServidor(db, tx => tx.query<{ n: string }>('select count(*) as n from public.tesemap_arestas'));
      assert.equal(Number(todas.rows[0].n), 5, 'as 5 estão no banco, só não aparecem');
    });

    it('depois da validação: as 5 aparecem e a vizinhança do Tema 1076 é exatamente a esperada; recarregar não duplica', async () => {
      const cliente = clienteDoBanco(db);
      const r = await carregarArestas(cliente, arestasDoGrafoMinimo(validarTudo(grafo), nos));
      assert.deepEqual(r, { enviadas: 5, noBanco: 5 });
      assert.deepEqual(await vizinhosDoTema1076(), [...grafo.esperado.vizinhosDoTema1076].sort());
      const visiveis = await como(db, null, tx => tx.query<{ validado_por: string }>('select validado_por from public.tesemap_arestas'));
      assert.equal(visiveis.rows.length, 5);
      assert.ok(visiveis.rows.every(x => x.validado_por === 'Revisor'));
    });

    it('voltar uma aresta a pendente na recarga a tira do site', async () => {
      const g = validarTudo(grafo);
      g.arestas[0] = { ...g.arestas[0], validacao: { status: 'pendente', por: null, em: null } };
      await carregarArestas(clienteDoBanco(db), arestasDoGrafoMinimo(g, nos));
      assert.equal((await vizinhosDoTema1076()).length, 4);
    });
  });
});
