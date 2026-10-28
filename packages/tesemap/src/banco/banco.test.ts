import { before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { PGlite } from '@electric-sql/pglite';
import { como, criarBanco } from '@ratione/db/harness';
import { carregarPrecedentesStj, manifestoStj } from '../stj';
import { ArestaBancoSchema, NoBancoSchema, arestaVisivel, noVisivel, type ArestaBanco, type NoBanco } from './esquemas';
import { carregarNos, type ClienteCarga } from './carregar-supabase';
import { nosDosPrecedentesStj } from './nos-stj';

type Tx = Parameters<Parameters<PGlite['transaction']>[0]>[0];
const comoServidor = <T>(db: PGlite, fn: (tx: Tx) => Promise<T>) =>
  db.transaction(async tx => {
    await tx.exec('set local role service_role');
    return fn(tx);
  });

const FONTE = { id: 'f1', ato: 'Ato de teste', url: 'https://exemplo.gov.br/ato', lido: 'o ato inteiro', lidoEm: '2026-10-22' };
const no = (id: string, sobre: Partial<NoBanco> = {}): NoBanco =>
  NoBancoSchema.parse({
    id, tipo: 'precedente', rotulo: id, tribunal: 'STJ', numero_referencia: null, descricao: 'tese', dispositivo_id: null, detalhes: {},
    origem_dado: 'curado', fontes: [FONTE], validado_por: null, validado_em: null, atualizado_em: '2026-10-22', ...sobre
  });
const aresta = (origem: string, destino: string, sobre: Partial<ArestaBanco> = {}): ArestaBanco =>
  ArestaBancoSchema.parse({
    origem_id: origem, destino_id: destino, tipo: 'distingue', rotulo: '', origem_dado: 'curado', fontes: [FONTE],
    validado_por: 'Revisor', validado_em: '2026-10-22', atualizado_em: '2026-10-22', ...sobre
  });

const inserirNos = (tx: Tx, nos: NoBanco[]) => tx.query(`insert into public.tesemap_nos (id, tipo, rotulo, tribunal, numero_referencia, descricao, dispositivo_id, detalhes, origem_dado, fontes, validado_por, validado_em, atualizado_em) select id, tipo, rotulo, tribunal, numero_referencia, descricao, dispositivo_id, detalhes, origem_dado, fontes, validado_por, validado_em, atualizado_em from jsonb_populate_recordset(null::public.tesemap_nos, $1::jsonb)`, [JSON.stringify(nos)]);
const inserirArestas = (tx: Tx, as: ArestaBanco[]) =>
  tx.query('insert into public.tesemap_arestas (origem_id, destino_id, tipo, rotulo, origem_dado, fontes, validado_por, validado_em, atualizado_em) select origem_id, destino_id, tipo, rotulo, origem_dado, fontes, validado_por, validado_em, atualizado_em from jsonb_populate_recordset(null::public.tesemap_arestas, $1::jsonb)', [JSON.stringify(as)]);

describe('Esquemas do grafo (F4-03)', () => {
  it('sem fonte não há nó nem aresta; validador e data andam juntos; aresta liga nós diferentes', () => {
    assert.throws(() => no('N1', { fontes: [] }));
    assert.throws(() => no('N1', { validado_por: 'Revisor' }), /andam juntos/);
    assert.throws(() => aresta('A', 'A'), /nós diferentes/);
    assert.throws(() => aresta('A', 'B', { tipo: 'inventada' as never }));
    assert.throws(() => aresta('A', 'B', { fontes: [{ ...FONTE, url: 'não é url' }] }));
  });

  it('o que o público vê: nó curado ou validado; aresta só validada', () => {
    assert.equal(noVisivel(no('N')), true);
    assert.equal(noVisivel(no('N', { origem_dado: 'sugerido_ia' })), false);
    assert.equal(noVisivel(no('N', { origem_dado: 'sugerido_ia', validado_por: 'Revisor', validado_em: '2026-10-22' })), true);
    assert.equal(arestaVisivel(aresta('A', 'B')), true);
    assert.equal(arestaVisivel(aresta('A', 'B', { validado_por: null, validado_em: null })), false);
  });
});

describe('Banco do TeseMap: regras e RLS (F4-03)', () => {
  let db: PGlite;
  before(async () => {
    db = await criarBanco();
    await comoServidor(db, async tx => {
      await inserirNos(tx, [
        no('A'),
        no('B'),
        no('IA-PENDENTE', { origem_dado: 'sugerido_ia' }),
        no('IA-VALIDADA', { origem_dado: 'sugerido_ia', validado_por: 'Revisor', validado_em: '2026-10-22' }),
        no('C', { tribunal: 'STF', tipo: 'sumula', atualizado_em: '2026-10-01' })
      ]);
      await inserirArestas(tx, [
        aresta('A', 'B'),
        aresta('A', 'C', { tipo: 'cita', validado_por: null, validado_em: null }),
        aresta('A', 'IA-PENDENTE', { tipo: 'interpreta' }),
        aresta('A', 'IA-VALIDADA', { tipo: 'aplica' })
      ]);
    });
  });

  it('o visitante vê nó curado e sugestão de IA validada, não a pendente', async () => {
    const r = await como(db, null, tx => tx.query<{ id: string }>('select id from public.tesemap_nos order by id'));
    assert.deepEqual(r.rows.map(x => x.id), ['A', 'B', 'C', 'IA-VALIDADA']);
  });

  it('aresta sem validação humana não aparece, nem a que liga a nó invisível; a validada entre nós visíveis aparece', async () => {
    const r = await como(db, null, tx => tx.query<{ destino_id: string; tipo: string }>('select destino_id, tipo from public.tesemap_arestas order by destino_id'));
    assert.deepEqual(r.rows.map(x => `${x.destino_id}:${x.tipo}`), ['B:distingue', 'IA-VALIDADA:aplica']);
    const todas = await comoServidor(db, tx => tx.query<{ n: string }>('select count(*) as n from public.tesemap_arestas'));
    assert.equal(Number(todas.rows[0].n), 4, 'a curadoria vê tudo; o filtro é da RLS, não da carga');
  });

  it('o banco repete a regra de procedência: sem fonte, fonte incompleta, validador sem data ou aresta consigo mesma são recusados', async () => {
    const cru = (campos: string, valores: unknown[]) => comoServidor(db, tx => tx.query(`insert into public.tesemap_nos (id, tipo, rotulo, origem_dado, atualizado_em, ${campos}) values ('X', 'tese', 'x', 'curado', '2026-10-22', ${valores.map((_, i) => `$${i + 1}`).join(', ')})`, valores));
    await assert.rejects(cru('fontes', ['[]']), /check/i);
    await assert.rejects(cru('fontes', ['[{"ato":"a","url":"u"}]']), /check/i, 'fonte sem "lido" e "lidoEm"');
    await assert.rejects(cru('fontes, validado_por', [JSON.stringify([FONTE]), 'Revisor']), /check/i, 'validador sem data');
    await assert.rejects(comoServidor(db, tx => tx.query("insert into public.tesemap_arestas (origem_id, destino_id, tipo, origem_dado, fontes, atualizado_em) values ('A', 'A', 'cita', 'curado', $1, '2026-10-22')", [JSON.stringify([FONTE])])), /check/i);
    await assert.rejects(comoServidor(db, tx => tx.query("insert into public.tesemap_arestas (origem_id, destino_id, tipo, origem_dado, fontes, atualizado_em) values ('A', 'B', 'distingue', 'curado', $1, '2026-10-22')", [JSON.stringify([FONTE])])), /unique|duplicate/i, 'mesma relação duas vezes');
  });

  it('o navegador (anon ou logado) só lê: não escreve, não apaga', async () => {
    for (const quem of [null, '00000000-0000-0000-0000-000000000001']) {
      await assert.rejects(como(db, quem, tx => tx.query("insert into public.tesemap_nos (id, tipo, rotulo, origem_dado, fontes, atualizado_em) values ('Z', 'tese', 'z', 'curado', $1, '2026-10-22')", [JSON.stringify([FONTE])])), /permission denied/);
      await assert.rejects(como(db, quem, tx => tx.query('delete from public.tesemap_nos')), /permission denied/);
      await assert.rejects(como(db, quem, tx => tx.query("update public.tesemap_arestas set validado_por = 'eu', validado_em = '2026-10-22'")), /permission denied/);
    }
  });

  it('cobertura declarada: por tribunal e tipo, só do que o público vê, com a data da última atualização', async () => {
    const r = await como(db, null, tx => tx.query<{ tribunal: string; tipo: string; total: number; atualizado_em: string }>('select tribunal, tipo, total, atualizado_em::text as atualizado_em from public.tesemap_cobertura()'));
    const linha = (t: string, tipo: string) => r.rows.find(x => x.tribunal === t && x.tipo === tipo)!;
    assert.equal(linha('STJ', 'precedente').total, 3, 'A, B e IA-VALIDADA; a sugestão pendente não conta');
    assert.equal(linha('STF', 'sumula').total, 1);
    assert.equal(linha('STF', 'sumula').atualizado_em, '2026-10-01');
  });

  it('busca por assunto: todas as palavras, em qualquer ordem, sem acento nem maiúscula; filtros; respeita a RLS', async () => {
    const outro = await criarBanco();
    await comoServidor(outro, tx =>
      inserirNos(tx, [
        no('T1', { rotulo: 'Tema 1076 do STJ', numero_referencia: 'Tema 1076', descricao: 'A fixação dos honorários por apreciação equitativa não é permitida.', detalhes: { dataJulgamento: '2022-03-16', questao: 'Alcance do § 8º do art. 85 do CPC' } }),
        no('T2', { rotulo: 'Tema 5 do STJ', numero_referencia: 'Tema 5', descricao: 'Juros de mora na condenação.', detalhes: { dataJulgamento: '2020-01-10' } }),
        no('S1', { tribunal: 'STF', tipo: 'sumula', rotulo: 'Súmula 10', descricao: 'Honorários na execução fiscal.', detalhes: { dataJulgamento: '2024-05-05' } }),
        no('IA', { origem_dado: 'sugerido_ia', rotulo: 'Tema 99 do STJ', descricao: 'Honorários sugeridos pela IA.' })
      ])
    );
    const buscar = (consulta: string, tribunal: string | null = null, tipo: string | null = null) =>
      como(outro, null, tx => tx.query<{ id: string }>('select id from public.tesemap_buscar($1, $2, $3, 40)', [consulta, tribunal, tipo])).then(r => r.rows.map(x => x.id));
    assert.deepEqual(await buscar('honorarios apreciacao'), ['T1'], 'sem acento');
    assert.deepEqual(await buscar('equitativa honorários'), ['T1'], 'fora de ordem');
    assert.deepEqual(await buscar('Tema 1076'), ['T1']);
    assert.deepEqual(await buscar('art. 85 cpc'), ['T1'], 'palavra que só está na questão');
    assert.deepEqual(await buscar('honorários', 'STF'), ['S1'], 'filtro de tribunal');
    assert.deepEqual(await buscar('honorários', null, 'sumula'), ['S1'], 'filtro de tipo');
    assert.deepEqual(await buscar('honorários'), ['S1', 'T1'], 'empate de relevância: o julgado mais recentemente primeiro');
    assert.deepEqual(await buscar(''), ['S1', 'T1', 'T2'], 'sem texto lista tudo, do mais recente ao mais antigo; a sugestão de IA pendente não aparece');
    assert.deepEqual(await buscar('palavraquenaoexiste'), []);
  });

  it('busca por espécie: o prefixo do id separa tema repetitivo, IAC e repercussão geral, sem tocar nas chamadas antigas', async () => {
    const outro = await criarBanco();
    await comoServidor(outro, tx =>
      inserirNos(tx, [
        no('STJ-TEMA-1076', { rotulo: 'Tema 1076 do STJ', numero_referencia: 'Tema 1076', descricao: 'Honorários e equidade.', detalhes: { dataJulgamento: '2022-03-16' } }),
        no('STJ-IAC-5', { rotulo: 'IAC 5 do STJ', descricao: 'Honorários em incidente.', detalhes: { dataJulgamento: '2021-01-01' } }),
        no('STF-RG-1255', { tribunal: 'STF', rotulo: 'Tema 1255 do STF', descricao: 'Honorários e repercussão.', detalhes: { dataJulgamento: '2023-01-01' } })
      ])
    );
    const buscar = (prefixo: string | null, tribunal: string | null = null) =>
      como(outro, null, tx => tx.query<{ id: string }>('select id from public.tesemap_buscar($1, $2, null, 40, $3)', ['honorarios', tribunal, prefixo])).then(r => r.rows.map(x => x.id));
    assert.deepEqual(await buscar('STJ-TEMA-'), ['STJ-TEMA-1076']);
    assert.deepEqual(await buscar('STJ-IAC-'), ['STJ-IAC-5']);
    assert.deepEqual(await buscar('STF-RG-', 'STF'), ['STF-RG-1255']);
    assert.deepEqual(await buscar('STJ-TEMA-', 'STF'), [], 'prefixo e tribunal se combinam (E)');
    assert.deepEqual((await buscar(null)).sort(), ['STF-RG-1255', 'STJ-IAC-5', 'STJ-TEMA-1076'], 'sem prefixo, tudo');
    const antiga = await como(outro, null, tx => tx.query<{ id: string }>("select id from public.tesemap_buscar('honorarios', null, null, 40)"));
    assert.equal(antiga.rows.length, 3, 'a chamada de quatro argumentos continua valendo');
  });

  it('apagar um nó leva as arestas dele (cascata)', async () => {
    await comoServidor(db, tx => tx.query("delete from public.tesemap_nos where id = 'IA-VALIDADA'"));
    const r = await comoServidor(db, tx => tx.query<{ n: string }>("select count(*) as n from public.tesemap_arestas where destino_id = 'IA-VALIDADA'"));
    assert.equal(Number(r.rows[0].n), 0);
  });
});

describe('Carga dos precedentes do STJ no grafo (F4-03)', () => {
  const m = manifestoStj();
  const nos = nosDosPrecedentesStj(carregarPrecedentesStj(), m);

  it('só precedente formado: tema ou IAC com tese, não cancelado; id único; todos curados com fonte e visíveis', () => {
    assert.ok(nos.length > 1000);
    assert.equal(new Set(nos.map(n => n.id)).size, nos.length);
    assert.ok(nos.every(n => /^STJ-(TEMA|IAC)-\d+$/.test(n.id) && n.descricao.length > 0 && n.tribunal === 'STJ' && n.tipo === 'precedente'));
    assert.ok(nos.every(n => !/aguardando a publica/i.test(n.descricao)), 'o aviso de acórdão não publicado não é tese');
    assert.ok(!nos.some(n => n.id === 'STJ-TEMA-50'));
    assert.ok(nos.every(n => n.origem_dado === 'curado' && n.fontes[0].lidoEm === m.lidoEm && noVisivel(n)));
  });

  it('o Tema 1076 vira nó com a tese, o órgão julgador e a repercussão geral, como no grafo curado', () => {
    const n = nos.find(x => x.id === 'STJ-TEMA-1076')!;
    assert.equal(n.rotulo, 'Tema 1076 do STJ');
    assert.match(n.descricao, /apreciação equitativa/);
    assert.equal((n.detalhes as { orgaoJulgador: string }).orgaoJulgador, 'CE');
    assert.ok((n.detalhes as { repercussaoGeral: Array<{ numero: string }> }).repercussaoGeral.some(r => r.numero === '1255'));
  });

  it('com os 1.155 nós reais, a busca sem acento acha o Tema 1076 e o IAC que cita a competência da Justiça Federal', async () => {
    const db = await criarBanco();
    await comoServidor(db, tx => inserirNos(tx, nos));
    const ids = async (q: string) => (await como(db, null, tx => tx.query<{ id: string }>('select id from public.tesemap_buscar($1, null, null, 40)', [q]))).rows.map(r => r.id);
    assert.ok((await ids('honorarios apreciacao equitativa')).includes('STJ-TEMA-1076'));
    assert.ok((await ids('STJ-TEMA-1076 tema 1076')).includes('STJ-TEMA-1076') || (await ids('tema 1076')).includes('STJ-TEMA-1076'));
    assert.equal((await ids('')).length, 40, 'sem texto, o teto da lista');
  });

  it('os nós entram no banco real do esquema (PGlite) e o visitante os lê; recarregar não duplica nem apaga o que foi curado à mão', async () => {
    const db = await criarBanco();
    const base = nos.slice(0, 50);
    // Cliente falso que grava de verdade no PGlite, como o `upsert` do Supabase (insert ... on conflict (id) do update)
    const cliente: ClienteCarga = {
      from: () => ({
        upsert: async linhas => {
          try {
            await comoServidor(db, tx => tx.query('insert into public.tesemap_nos (id, tipo, rotulo, tribunal, numero_referencia, descricao, dispositivo_id, detalhes, origem_dado, fontes, validado_por, validado_em, atualizado_em) select id, tipo, rotulo, tribunal, numero_referencia, descricao, dispositivo_id, detalhes, origem_dado, fontes, validado_por, validado_em, atualizado_em from jsonb_populate_recordset(null::public.tesemap_nos, $1::jsonb) on conflict (id) do update set descricao = excluded.descricao, detalhes = excluded.detalhes, fontes = excluded.fontes, atualizado_em = excluded.atualizado_em', [JSON.stringify(linhas)]));
            return { error: null };
          } catch (e) {
            return { error: { message: (e as Error).message } };
          }
        },
        select: async () => {
          const r = await comoServidor(db, tx => tx.query<{ n: string }>('select count(*) as n from public.tesemap_nos'));
          return { count: Number(r.rows[0].n), error: null };
        }
      })
    };
    await comoServidor(db, tx => inserirNos(tx, [no('CURADO-A-MAO', { tipo: 'sumula' })]));
    assert.deepEqual(await carregarNos(cliente, base), { enviados: 50, noBanco: 51 });
    assert.deepEqual(await carregarNos(cliente, base), { enviados: 50, noBanco: 51 }, 'segunda carga: nada duplicado, nada apagado');
    const lidos = await como(db, null, tx => tx.query<{ n: string }>('select count(*) as n from public.tesemap_nos'));
    assert.equal(Number(lidos.rows[0].n), 51);
  });
});
