import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { carregarPrecedentesStj, manifestoStj } from './corpus';
import { lerSumulasStj, temasRepetitivosNoTexto } from './sumulas';
import { carregarSumulasStj, manifestoSumulasStj } from './sumulas-corpus';
import { nosDosPrecedentesStj } from '../banco/nos-stj';
import { nosDasSumulasStj, orgaoPorExtenso, temasQueLigamSumulas } from '../banco/nos-sumulas-stj';

const bloco = (n: number, corpo: string, marcador = '') => `q SÚMULA ${n}${marcador}                 VEJA MAIS\n\n${corpo}\n`;
const ok = (n: number) => bloco(n, `Enunciado da súmula ${n}. (SEGUNDA SEÇÃO, julgado em 27/06/2012, DJe 01/08/2012)`);

describe('Súmulas do STJ: leitura do texto do PDF (F4-01)', () => {
  it('lê cabeçalho, enunciado, órgão, julgamento, publicação e nota; descarta o rodapé da página', () => {
    const texto = [
      'Enunciados das\nSúmulas do STJ\n',
      bloco(2, 'Enunciado dois, que continua\nna linha seguinte. (SÚMULA 2, CORTE ESPECIAL, julgado em 03/03/2010, REPDJe 27/05/2010, DJe 24/05/2010)'),
      'scon.stj.jus.br/SCON/sumstj/                                        7\n\f',
      bloco(1, 'Enunciado um. (SEGUNDA SEÇÃO, julgado em 10/9/2025, DJEN de 2/12/2025) SÚMULA REVISADA: ao julgar o REsp 2.001.973/RS (tema repetitivo 1194). REDAÇÃO ANTERIOR: outra. (SÚMULA 1, SEGUNDA SEÇÃO, julgado em 24/4/2019, DJe de 29/4/2019)', ' (SÚMULA ALTERADA)'),
      bloco(3, 'Enunciado antigo. (SÚMULA 3, CORTE ESPECIAL, DJ 15/03/1999, p. 326, DJ 25/02/1999, p. 77) SÚMULA CANCELADA: a Corte Especial cancelou.', ' (SÚMULA CANCELADA)')
    ].join('\n');
    const [um, dois, tres] = lerSumulasStj(texto);
    assert.deepEqual([um.numero, dois.numero, tres.numero], [1, 2, 3]);
    assert.equal(um.situacao, 'alterada');
    assert.equal(um.enunciado, 'Enunciado um.');
    assert.equal(um.publicacao, 'DJEN de 2/12/2025');
    assert.equal(um.dataJulgamento, '2025-09-10');
    assert.match(um.nota!, /^SÚMULA REVISADA:.*REDAÇÃO ANTERIOR: outra\./);
    assert.deepEqual(um.temasRepetitivos, [1194]);
    assert.equal(dois.enunciado, 'Enunciado dois, que continua na linha seguinte.');
    assert.equal(dois.publicacao, 'REPDJe 27/05/2010, DJe 24/05/2010');
    assert.equal(dois.nota, null, 'o rodapé não entra');
    assert.equal(tres.situacao, 'cancelada');
    assert.equal(tres.dataJulgamento, null);
  });

  it('recusa: lacuna na numeração, número repetido, súmula sem parêntese de publicação e enunciado que arrasta a nota do STJ', () => {
    assert.throws(() => lerSumulasStj(ok(1) + ok(3)), /faltam na numeração 2/);
    assert.throws(() => lerSumulasStj(ok(1) + ok(1)), /repetido/);
    assert.throws(() => lerSumulasStj(ok(1) + bloco(2, 'Sem parêntese.')), /parêntese/);
    // Publicação num formato que o leitor não conhece: o único parêntese reconhecido seria o da redação anterior
    assert.throws(
      () => lerSumulasStj(bloco(1, 'Novo. (SEGUNDA SEÇÃO, julgado em 10/9/2025, DJX de 2/12/2025) SÚMULA REVISADA: x. REDAÇÃO ANTERIOR: velho. (SÚMULA 1, SEGUNDA SEÇÃO, julgado em 24/4/2019, DJe de 29/4/2019)')),
      /contém a nota do STJ/
    );
    assert.throws(() => lerSumulasStj('texto qualquer'), /nenhuma súmula/);
  });

  it('tema repetitivo citado no texto', () => {
    assert.deepEqual(temasRepetitivosNoTexto('ao julgar o REsp (tema repetitivo 1194) e o Tema Repetitivo n. 1.076'), [1076, 1194]);
    assert.deepEqual(temasRepetitivosNoTexto('Tema 6 da repercussão geral'), []);
  });
});

describe('Súmulas do STJ no corpus (PDF do SCON de 22/10/2026)', () => {
  const sumulas = carregarSumulasStj();
  const porNumero = new Map(sumulas.map(s => [s.numero, s]));

  it('676 súmulas, de 1 a 676, sem lacuna; 641 aprovadas, 29 canceladas, 5 alteradas e 1 revogada; o manifesto confere', () => {
    assert.equal(sumulas.length, 676);
    assert.equal(sumulas[675].numero, 676);
    const conta = (sit: string) => sumulas.filter(s => s.situacao === sit).length;
    assert.deepEqual([conta('aprovada'), conta('cancelada'), conta('alterada'), conta('revogada')], [641, 29, 5, 1]);
    assert.deepEqual(manifestoSumulasStj().conferencia, { total: 676, maiorNumero: 676, porSituacao: { aprovada: 641, cancelada: 29, alterada: 5, revogada: 1 } });
  });

  it('texto oficial: a 479, a 676 (a última) e as 545 e 630 com a redação revisada em 2025', () => {
    assert.match(porNumero.get(479)!.enunciado, /^As instituições financeiras respondem objetivamente pelos danos gerados por fortuito interno/);
    assert.equal(porNumero.get(676)!.dataJulgamento, '2024-12-11');
    for (const n of [545, 630]) {
      const s = porNumero.get(n)!;
      assert.equal(s.situacao, 'alterada');
      assert.equal(s.publicacao, 'DJEN de 2/12/2025');
      assert.doesNotMatch(s.enunciado, /REDAÇÃO ANTERIOR/);
      assert.match(s.nota!, /REDAÇÃO ANTERIOR/);
      assert.deepEqual(s.temasRepetitivos, [1194]);
    }
    assert.match(porNumero.get(545)!.enunciado, /independentemente de ser utilizada na formação do convencimento do julgador\.$/);
  });

  it('SHA-256 alterado no manifesto é recusado', () => {
    assert.throws(() => carregarSumulasStj({ ...manifestoSumulasStj(), texto: { ...manifestoSumulasStj().texto, sha256: '0'.repeat(64) } }), /SHA-256/);
  });

  describe('nós do grafo', () => {
    const precedentes = carregarPrecedentesStj();
    const nosStj = nosDosPrecedentesStj(precedentes, manifestoStj());
    const existentes = new Set(nosStj.map(n => n.id));
    const nos = nosDasSumulasStj(sumulas, manifestoSumulasStj(), temasQueLigamSumulas(precedentes), existentes);
    const porId = new Map(nos.map(n => [n.id, n]));

    it('só as súmulas em vigor (aprovadas e alteradas), com o enunciado oficial, a fonte do SCON e o órgão por extenso', () => {
      assert.equal(nos.length, 646);
      assert.equal(porId.has('STJ-SUMULA-603'), false, 'cancelada fica de fora');
      assert.equal(porId.has('STJ-SUMULA-357'), false, 'revogada fica de fora');
      const s479 = porId.get('STJ-SUMULA-479')!;
      assert.equal(s479.tribunal, 'STJ');
      assert.equal(s479.detalhes.orgaoJulgador, 'Segunda Seção');
      assert.equal(s479.detalhes.situacao, 'Aprovada');
      assert.match(s479.fontes[0].url, /^https:\/\/scon\.stj\.jus\.br\/SCON\/sumstj\/$/);
      assert.match(s479.fontes[0].lido, new RegExp(manifestoSumulasStj().pdf.sha256));
      assert.equal(porId.get('STJ-SUMULA-630')!.detalhes.situacao, 'Alterada');
    });

    it('ligação registrada pelo STJ: o tema que originou a súmula aparece nela, e só tema que existe no grafo', () => {
      const tema = precedentes.find(p => p.tipo === 'Tema' && p.sumulaOriginada && existentes.has(p.id) && porId.has(`STJ-SUMULA-${Number(p.sumulaOriginada)}`))!;
      const temas = porId.get(`STJ-SUMULA-${Number(tema.sumulaOriginada)}`)!.detalhes.temasStj as Array<{ numero: string }>;
      assert.ok(temas.some(t => t.numero === String(tema.numero)));
      for (const n of nos) for (const t of n.detalhes.temasStj as Array<{ numero: string }>) assert.ok(existentes.has(`STJ-TEMA-${t.numero}`));
    });

    it('órgão por extenso', () => {
      assert.equal(orgaoPorExtenso('CORTE ESPECIAL'), 'Corte Especial');
      assert.equal(orgaoPorExtenso('PRIMEIRA SEÇÃO'), 'Primeira Seção');
    });
  });
});
