import { before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import type { PGlite } from '@electric-sql/pglite';
import { criarBanco, como } from '@ratione/db/harness';
import { interpretarConsulta } from './consulta';
import { extrairRemissoes } from './referencias';
import { inserirNorma, linhasDoCorpus, resolverDestinos } from './carga';

describe('Remissões expressas (F3-05)', () => {
  it('"deste Código" e "desta Lei" são a mesma norma; sem escopo é presumido', () => {
    const r = extrairRemissoes('Aplica-se o disposto no art. 85, § 2º, deste Código, e no art. 86.');
    assert.deepStrictEqual(r.map(x => [x.artigo, x.detalhe, x.escopo]), [['85', '§ 2º', 'mesma'], ['86', null, 'presumido']]);
  });

  it('norma citada por nome, por sigla ou por número é explícita ou externa', () => {
    const r = extrairRemissoes('Nos termos do art. 5º da Constituição Federal, do art. 489 do CPC e do art. 7º da Lei nº 9.099, de 1995.');
    assert.deepStrictEqual(r.map(x => [x.artigo, x.escopo, x.normaDestinoId]), [
      ['5º', 'explicito', 'CF-1988'],
      ['489', 'explicito', 'LEI-13105-2015'],
      ['7º', 'externo', 'LEI-9099-1995']
    ]);
  });

  it('artigo com letra e milhar: "art. 1.015" e "art. 22-A"', () => {
    const r = extrairRemissoes('Cabe agravo (art. 1.015) e vale o art. 22-A.');
    assert.deepStrictEqual(r.map(x => x.artigo), ['1.015', '22-A']);
  });

  it('lista no plural: "arts. 485 e 932" e "arts. 5º, 7º e 9º deste Código"', () => {
    assert.deepStrictEqual(extrairRemissoes('com base nos arts. 485 e 932;').map(x => x.artigo), ['485', '932']);
    const r = extrairRemissoes('Aplicam-se os arts. 5º, 7º e 9º deste Código.');
    assert.deepStrictEqual(r.map(x => [x.artigo, x.escopo]), [['5º', 'mesma'], ['7º', 'mesma'], ['9º', 'mesma']]);
  });
});

describe('Barra de pesquisa (F3-05)', () => {
  const normas = ['LEI-14133-2021', 'LEI-8078-1990', 'DL-2848-1940'];
  it('citação de artigo com sigla, nome por extenso ou sem norma', () => {
    assert.deepStrictEqual(interpretarConsulta('art. 489 CPC'), { tipo: 'dispositivo', normaId: 'LEI-13105-2015', artigo: '489', detalhe: null });
    assert.deepStrictEqual(interpretarConsulta('art. 85, § 2º do Código de Processo Civil'), { tipo: 'dispositivo', normaId: 'LEI-13105-2015', artigo: '85', detalhe: '§ 2º' });
    assert.deepStrictEqual(interpretarConsulta('Art. 5º'), { tipo: 'dispositivo', normaId: null, artigo: '5º', detalhe: null });
  });

  it('lei por número, sigla ou nome; frase com assunto vai para o texto livre', () => {
    assert.deepStrictEqual(interpretarConsulta('Lei 14.133', normas), { tipo: 'norma', normaId: 'LEI-14133-2021' });
    assert.deepStrictEqual(interpretarConsulta('Lei nº 8.078/1990', normas), { tipo: 'norma', normaId: 'LEI-8078-1990' });
    assert.deepStrictEqual(interpretarConsulta('CPC'), { tipo: 'norma', normaId: 'LEI-13105-2015' });
    assert.deepStrictEqual(interpretarConsulta('Código Penal'), { tipo: 'norma', normaId: 'DL-2848-1940' });
    assert.deepStrictEqual(interpretarConsulta('desconsideração da personalidade jurídica'), { tipo: 'texto', termos: 'desconsideração da personalidade jurídica' });
    assert.deepStrictEqual(interpretarConsulta('art. 489 xyz'), { tipo: 'texto', termos: 'art. 489 xyz' });
  });
});

describe('Banco do NormaViva com o corpus do Planalto (F3-05)', () => {
  let db: PGlite;
  before(async () => {
    db = await criarBanco();
    for (const l of linhasDoCorpus(join(__dirname, '..', '..', 'corpus'))) await inserirNorma(db, l);
    await resolverDestinos(db);
  });

  it('carrega as 28 normas e os dispositivos, com hash e fonte', async () => {
    const n = await db.query<{ normas: string; disp: string; vers: string }>(
      'select (select count(*) from normas) as normas, (select count(*) from dispositivos) as disp, (select count(*) from versoes_dispositivo) as vers'
    );
    assert.strictEqual(Number(n.rows[0].normas), 28);
    assert.ok(Number(n.rows[0].disp) > 29000);
    assert.strictEqual(n.rows[0].disp, n.rows[0].vers);
    const f = await db.query<{ fonte_sha256: string }>("select fonte_sha256 from normas where id = 'LEI-13105-2015'");
    assert.match(f.rows[0].fonte_sha256, /^[0-9a-f]{64}$/);
  });

  it('busca por assunto acha o art. 85 do CPC para "honorários advocatícios"', async () => {
    const r = await db.query<{ rotulo: string; norma_id: string; trecho: string }>(
      "select rotulo, norma_id, trecho from buscar_dispositivos('honorários advocatícios', 'LEI-13105-2015', 20)"
    );
    assert.ok(r.rows.length > 0);
    assert.ok(r.rows.some(x => x.rotulo.startsWith('art. 85')), 'o art. 85 está entre os resultados');
    assert.ok(r.rows.every(x => x.norma_id === 'LEI-13105-2015'));
  });

  it('a busca ignora dispositivos revogados e respeita o limite', async () => {
    const r = await db.query<{ n: string }>("select count(*) as n from buscar_dispositivos('lei', null, 500)");
    assert.strictEqual(Number(r.rows[0].n), 100, 'teto de 100 resultados');
    const rev = await db.query<{ n: string }>('select count(*) as n from buscar_dispositivos(\'revogado\', null, 100) b join dispositivos d on d.id = b.id where d.revogado');
    assert.strictEqual(Number(rev.rows[0].n), 0);
  });

  it('busca por proximidade: "desconsideração da personalidade jurídica" acha o art. 50 do CC e o incidente do CPC', async () => {
    const r = await db.query<{ norma_id: string; rotulo: string }>("select norma_id, rotulo from buscar_dispositivos('desconsideração da personalidade jurídica', null, 30)");
    const i = r.rows.findIndex(x => x.norma_id === 'LEI-10406-2002' && x.rotulo === 'art. 50');
    assert.ok(i >= 0 && i < 15, `art. 50 do CC entre os 15 primeiros (posição ${i + 1})`);
    assert.ok(r.rows.slice(0, 8).some(x => x.norma_id === 'LEI-13105-2015' && /^art\. 13[3-7]/.test(x.rotulo)), 'o incidente de desconsideração do CPC (arts. 133 a 137) está no topo');
  });

  it('busca: quem tem todas as palavras vem antes de quem tem só parte delas; consulta sem palavra útil volta vazia', async () => {
    const r = await db.query<{ relevancia: number }>("select relevancia from buscar_dispositivos('prisão preventiva requisitos', null, 30)");
    assert.ok(r.rows.length > 3);
    const rels = r.rows.map(x => Math.floor(x.relevancia));
    assert.deepStrictEqual(rels, [...rels].sort((a, b) => b - a), 'ordenado por quantidade de palavras achadas');
    assert.strictEqual(rels[0], 3, 'o primeiro tem as 3 palavras');
    const vazia = await db.query("select * from buscar_dispositivos('a', null, 10)");
    assert.strictEqual(vazia.rows.length, 0);
    const realce = await db.query<{ trecho: string }>("select trecho from buscar_dispositivos('legítima defesa', 'DL-2848-1940', 1)");
    assert.match(realce.rows[0].trecho, /<b>/);
  });

  it('citação de artigo localiza o dispositivo e seus filhos pela hierarquia', async () => {
    const q = interpretarConsulta('art. 85, § 2º do CPC');
    assert.strictEqual(q.tipo, 'dispositivo');
    const pai = await db.query<{ id: string }>("select id from dispositivos where norma_id = 'LEI-13105-2015' and escopo = 'corpo' and rotulo = 'art. 85, § 2º'");
    assert.strictEqual(pai.rows.length, 1);
    const filhos = await db.query<{ rotulo: string }>('select rotulo from dispositivos where pai_id = $1 order by ordem', [pai.rows[0].id]);
    assert.deepStrictEqual(filhos.rows.map(f => f.rotulo).slice(0, 2), ['art. 85, § 2º, I', 'art. 85, § 2º, II']);
  });

  it('versão do art. 85, § 6º-A: incluída pela Lei 14.365/2022, vigência provisória em 03/06/2022', async () => {
    const r = await db.query<{ origem: string; ato_chave: string; vigente_de: string | Date; vigencia_confirmada: boolean; texto_anterior_disponivel: boolean }>(
      `select v.origem, v.ato_chave, v.vigente_de, v.vigencia_confirmada, v.texto_anterior_disponivel
       from versoes_dispositivo v join dispositivos d on d.id = v.dispositivo_id
       where d.norma_id = 'LEI-13105-2015' and d.rotulo = 'art. 85, § 6º-A'`
    );
    assert.strictEqual(r.rows[0].origem, 'incluido');
    assert.strictEqual(r.rows[0].ato_chave, 'lei:14365:2022');
    assert.strictEqual(new Date(r.rows[0].vigente_de).toISOString().slice(0, 10), '2022-06-03');
    assert.strictEqual(r.rows[0].vigencia_confirmada, false);
    assert.strictEqual(r.rows[0].texto_anterior_disponivel, false);
  });

  it('remissões do CPC: as internas ligam ao artigo de destino; as de outra norma ficam explícitas ou externas', async () => {
    const r = await db.query<{ escopo: string; n: string; ligadas: string }>(
      "select escopo, count(*) as n, count(destino_id) as ligadas from relacoes where tipo = 'remete' and origem_id like 'LEI-13105-2015|%' group by escopo order by escopo"
    );
    const por = Object.fromEntries(r.rows.map(x => [x.escopo, x]));
    // no CPC quase toda remissão interna vem sem "deste Código": é presumida, e a maioria encontra o artigo no corpus
    assert.ok(Number(por.presumido.n) > 200, 'há remissões internas presumidas');
    assert.ok(Number(por.presumido.ligadas) / Number(por.presumido.n) > 0.9, 'quase todas encontram o artigo de destino');
    assert.ok(Number(por.mesma.n) >= 1 && Number(por.explicito.n) >= 1 && Number(por.externo.n) >= 1, 'as quatro classes de escopo aparecem');
  });

  it('resolver_destinos_relacoes: só a chave de serviço executa, e rodar de novo não liga nada a mais', async () => {
    await assert.rejects(como(db, null, tx => tx.query('select resolver_destinos_relacoes()')), /permission denied/);
    const r = await db.query<{ n: number }>('select resolver_destinos_relacoes() as n');
    assert.strictEqual(r.rows[0].n, 0, 'a carga já resolveu tudo o que dava para resolver');
  });

  it('visitante lê, mas não escreve (RLS e privilégios)', async () => {
    const lido = await como(db, null, tx => tx.query('select count(*)::int as n from normas'));
    assert.strictEqual((lido.rows[0] as { n: number }).n, 28);
    await assert.rejects(como(db, null, tx => tx.query("insert into normas (id, nome, fonte_url, fonte_tipo_pagina, fonte_sha256, lido_em) values ('X', 'X', 'u', 'compilada', repeat('0', 64), now())")), /permission denied/);
    await assert.rejects(como(db, null, tx => tx.query("update dispositivos set texto = 'x' where true")), /permission denied/);
  });
});
