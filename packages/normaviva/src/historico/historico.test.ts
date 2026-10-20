import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { join } from 'node:path';
import { detectarCharset, type EntradaManifesto } from '../coleta/coletar';
import { paragrafosComTachado, paragrafosDoHtml } from '../parser';
import { linhasDoCorpus } from '../busca/carga';
import { gerarHistorico, type CasoHistorico } from './historico';
import { documentoDeRevisao } from './gerar';
import { somarDiasIso } from './datas';

const PASTA = join(__dirname, '..', '..', 'corpus');
const casos: CasoHistorico[] = JSON.parse(readFileSync(join(PASTA, 'historico-conhecido.json'), 'utf-8'));

describe('Leitor de HTML: texto tachado à parte (F3-07)', () => {
  const HTML = `
    <p><strike>Art. 50. Quando interpostos contra sentença, os embargos de declaração suspenderão o prazo para recurso.</strike></p>
    <p>Art. 50. Os embargos de declaração interrompem o prazo para a interposição de recurso. (Redação dada pela Lei nº 13.105, de 2015)</p>
    <p>Art. 51. Texto sem alteração nenhuma neste dispositivo de teste.</p>
    <p>Art. 52. O réu <strike>poderá</strike> deverá comparecer.</p>`;

  it('o parágrafo inteiro tachado espera o parágrafo com a redação nova', () => {
    const ps = paragrafosComTachado(HTML);
    assert.equal(ps.length, 3);
    assert.deepEqual(ps[0].tachados, ['Art. 50. Quando interpostos contra sentença, os embargos de declaração suspenderão o prazo para recurso.']);
    assert.match(ps[0].texto, /^Art\. 50\. Os embargos de declaração interrompem/);
    assert.deepEqual(ps[1].tachados, []);
  });

  it('tachado de palavra solta fica no próprio parágrafo, e o texto vigente não o contém', () => {
    const ps = paragrafosComTachado(HTML);
    assert.deepEqual(ps[2].tachados, ['poderá']);
    assert.equal(ps[2].texto, 'Art. 52. O réu deverá comparecer.');
  });

  it('a entrada do parser não muda: os mesmos textos de antes, sem tachado', () => {
    assert.deepEqual(paragrafosDoHtml(HTML), paragrafosComTachado(HTML).map(p => p.texto));
    assert.ok(!paragrafosDoHtml(HTML).join(' ').includes('suspenderão'));
  });
});

describe('Normas de teste com histórico conhecido (F3-07)', () => {
  const corpus = new Map(linhasDoCorpus(PASTA).map(l => [l.norma.id, l]));

  it('são 57 casos em 25 normas, com id único; as normas de página compilada entram pela página anotada complementar', () => {
    assert.equal(casos.length, 57);
    assert.equal(new Set(casos.map(c => c.normaId)).size, 25);
    assert.equal(new Set(casos.map(c => c.id)).size, casos.length);
    for (const id of ['DL-2848-1940', 'DL-3689-1941', 'LEI-10406-2002', 'LEI-13105-2015', 'LEI-8078-1990', 'LEI-13709-2018']) {
      const c = casos.find(x => x.normaId === id);
      assert.ok(c, `${id} sem caso`);
      assert.equal(c.fonte.tipoPagina, 'anotada', id);
    }
  });

  it('a redação A aparece de fato tachada na página de origem de cada caso (evidência, não só cópia)', () => {
    const manifestos = [
      ...(JSON.parse(readFileSync(join(PASTA, 'planalto', 'manifesto.json'), 'utf-8')) as EntradaManifesto[]).map(m => ({ ...m, caminho: join(PASTA, 'planalto', m.arquivo) })),
      ...(JSON.parse(readFileSync(join(PASTA, 'planalto', 'anotadas', 'manifesto.json'), 'utf-8')) as EntradaManifesto[]).map(m => ({ ...m, caminho: join(PASTA, 'planalto', 'anotadas', m.arquivo) }))
    ];
    const tachadosPorUrl = new Map<string, string[]>();
    for (const c of casos) {
      const m = manifestos.find(x => x.url === c.fonte.url);
      assert.ok(m, `${c.id}: página de origem fora dos manifestos (${c.fonte.url})`);
      if (!tachadosPorUrl.has(m.url)) {
        const html = detectarCharset(gunzipSync(readFileSync(m.caminho)), null).texto;
        tachadosPorUrl.set(m.url, paragrafosComTachado(html).flatMap(p => p.tachados));
      }
      assert.ok(tachadosPorUrl.get(m.url)!.some(t => t.includes(c.antes.texto)), `${c.id}: a redação A não está tachada na página de origem`);
    }
  });

  it('as páginas anotadas complementares estão íntegras: o SHA-256 do manifesto é o dos bytes lidos', () => {
    const manifesto = JSON.parse(readFileSync(join(PASTA, 'planalto', 'anotadas', 'manifesto.json'), 'utf-8')) as EntradaManifesto[];
    assert.equal(manifesto.length, 15);
    for (const m of manifesto) {
      assert.equal(m.tipoPagina, 'anotada', m.id);
      const bytes = gunzipSync(readFileSync(join(PASTA, 'planalto', 'anotadas', m.arquivo)));
      assert.equal(createHash('sha256').update(bytes).digest('hex'), m.sha256, m.id);
      assert.equal(bytes.length, m.bytes, m.id);
    }
  });

  it('a redação B de cada caso é exatamente o texto do dispositivo no corpus, com o ato e a data que o corpus registra', () => {
    for (const c of casos) {
      const l = corpus.get(c.normaId);
      assert.ok(l, c.id);
      const d = l.dispositivos.find(x => x.id === c.dispositivoId);
      assert.ok(d, `${c.id}: dispositivo ausente do corpus`);
      assert.equal(d.rotulo, c.rotulo, c.id);
      assert.equal(d.texto, c.depois.texto, c.id);
      const v = l.versoes.find(x => x.dispositivo_id === d.id);
      assert.ok(v, c.id);
      assert.equal(v.origem, 'redacao_dada', c.id);
      assert.equal(v.ato_rotulo, c.depois.atoRotulo, c.id);
      assert.equal(v.vigente_de, c.depois.vigenteDe, c.id);
    }
  });

  it('a redação A existe, difere da B e o dispositivo não é ambíguo no corpus (sem rótulo repetido)', () => {
    for (const c of casos) {
      assert.ok(c.antes.texto.length >= 25, c.id);
      assert.notEqual(c.antes.texto, c.depois.texto, c.id);
      assert.ok(!c.id.includes('#'), c.id);
      assert.ok(!/\((Reda[çc][ãa]o dada|Inclu[ií]d)/.test(c.antes.texto), `${c.id}: anotação ficou no texto da redação A`);
    }
  });

  it('a consulta da véspera espera a redação A e a do dia da publicação, a B; a vigência segue provisória', () => {
    for (const c of casos) {
      assert.equal(c.vigenciaConfirmada, false, c.id);
      assert.deepEqual(c.consultas, [
        { em: somarDiasIso(c.depois.vigenteDe, -1), esperado: 'antes' },
        { em: c.depois.vigenteDe, esperado: 'depois' }
      ], c.id);
      assert.match(c.depois.vigenteDe, /^\d{4}-\d{2}-\d{2}$/, c.id);
    }
  });

  it('o arquivo versionado é o que o gerador produz do corpus (regenere com `pnpm historico` se o corpus mudou)', () => {
    const validacoes = Object.fromEntries(casos.map(c => [c.id, c.validacao]));
    assert.deepEqual(gerarHistorico(PASTA, validacoes).casos, casos);
  });

  it('a validação é pendente ou tem quem e quando', () => {
    for (const c of casos) {
      if (c.validacao.status === 'validado') {
        assert.ok(c.validacao.por && c.validacao.em, c.id);
        assert.match(c.validacao.em!, /^\d{4}-\d{2}-\d{2}$/, c.id);
      } else assert.deepEqual(c.validacao, { status: 'pendente', por: null, em: null }, c.id);
    }
  });

  it('o documento de revisão traz os totais e cada caso', () => {
    const doc = documentoDeRevisao(casos, ['LEI-X-2000']);
    const pend = casos.filter(c => c.validacao.status !== 'validado').length;
    assert.match(doc, new RegExp(`\\*\\*${casos.length} casos em ${new Set(casos.map(c => c.normaId)).size} normas\\*\\*`));
    assert.match(doc, new RegExp(`pendentes: \\*\\*${pend}\\*\\*`));
    for (const c of casos) assert.ok(doc.includes(`### ${c.rotulo}`), c.id);
    assert.ok(doc.includes('LEI-X-2000'));
  });

  it('o documento versionado está em dia com o arquivo de casos', () => {
    const doc = readFileSync(join(__dirname, '..', '..', '..', '..', 'docs', 'produto', 'NORMAS_DE_TESTE.md'), 'utf-8');
    const comCaso = new Set(casos.map(c => c.normaId));
    const sem = [...corpus.keys()].filter(id => !comCaso.has(id));
    assert.equal(doc.trimEnd(), documentoDeRevisao(casos, sem).trimEnd());
  });
});
