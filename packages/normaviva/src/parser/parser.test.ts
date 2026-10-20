import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { join } from 'node:path';
import { detectarCharset } from '../coleta/coletar';
import { paragrafosDoHtml } from './html';
import { parsearDispositivos, separarAnotacoes } from './dispositivos';
import { conferirSequencia, numeroBase } from './verificar';

const corpus = (id: string) =>
  parsearDispositivos(paragrafosDoHtml(detectarCharset(gunzipSync(readFileSync(join(__dirname, '..', '..', 'corpus', 'planalto', `${id}.html.gz`))), null).texto));

const rotulos = (r: ReturnType<typeof corpus>) => r.dispositivos.map(d => d.rotulo);

describe('HTML do Planalto → parágrafos (F3-02)', () => {
  it('descarta o texto tachado, junta o "º" escrito como <sup>o</sup> e decodifica entidades', () => {
    const ps = paragrafosDoHtml('<p><strike>§ 1º texto antigo</strike></p><p>Art. 8<sup>o</sup> Texto&nbsp;novo <b>vigente</b>.</p><script>x()</script>');
    assert.deepStrictEqual(ps, ['Art. 8o Texto novo vigente.']);
  });

  it('dispositivo revogado com o texto todo tachado mantém o rótulo para a anotação "(Revogado…)"', () => {
    const ps = paragrafosDoHtml('<p><strike>Art. 117. O mandato dos representantes classistas é de três anos</strike> . (Revogado pela Emenda Constitucional nº 24, de 1999)</p>');
    const r = parsearDispositivos(['Art. 116. Texto.', ...ps]);
    const d = r.dispositivos[1];
    assert.strictEqual(d.rotulo, 'art. 117');
    assert.strictEqual(d.texto, '');
    assert.ok(d.revogado);
    assert.match(d.anotacoes[0].texto, /Emenda Constitucional nº 24/);
  });
});

describe('Parser LC 95/98 (F3-02)', () => {
  it('artigo, parágrafo, inciso e alínea com o caminho completo e as anotações separadas do texto', () => {
    const r = parsearDispositivos([
      'Art. 85. A sentença condenará o vencido a pagar honorários ao advogado do vencedor.',
      '§ 2º Os honorários serão fixados entre o mínimo de dez e o máximo de vinte por cento, atendidos:',
      'I - o grau de zelo do profissional;',
      'a) primeira alínea; (Incluído pela Lei nº 1, de 2020)',
      '§ 6º-A Quando o valor for líquido, é proibida a apreciação equitativa. (Incluído pela Lei nº 14.365, de 2022)',
      'Art. 86. Se cada litigante for, em parte, vencedor e vencido.',
      'Parágrafo único. Se um litigante sucumbir em parte mínima.'
    ]);
    assert.deepStrictEqual(rotulos(r), ['art. 85', 'art. 85, § 2º', 'art. 85, § 2º, I', 'art. 85, § 2º, I, a)', 'art. 85, § 6º-A', 'art. 86', 'art. 86, parágrafo único']);
    const p6a = r.dispositivos[4];
    assert.strictEqual(p6a.texto, 'Quando o valor for líquido, é proibida a apreciação equitativa.');
    assert.deepStrictEqual(p6a.anotacoes, [{ tipo: 'incluido', texto: 'Incluído pela Lei nº 14.365, de 2022' }]);
  });

  it('formatos do Planalto: "Art. 8º -", "Art. 1.015.", "§ 2 o", "Art. . 154" e inciso revogado sem texto', () => {
    const r = parsearDispositivos(['Art. 8º - Texto.', '§ 2 o Súmulas e outros enunciados.', 'Art. 1.015. Cabe agravo.', 'Art. . 154 - Observância.', 'I (Revogado pela Lei nº 2, de 2001)']);
    assert.deepStrictEqual(rotulos(r), ['art. 8º', 'art. 8º, § 2º', 'art. 1.015', 'art. 154', 'art. 154, I']);
    assert.ok(r.dispositivos[4].revogado);
  });

  it('faixa de artigos revogados vira um dispositivo revogado por artigo', () => {
    const r = parsearDispositivos(['Art. 51. Texto.', 'Arts. 52 a 54 . (Revogados pelo Decreto-lei nº 406, de 1968)', 'Art. 1.620. a 1.622. (Revogados pela Lei nº 12.010, de 2009)']);
    assert.deepStrictEqual(rotulos(r), ['art. 51', 'art. 52', 'art. 53', 'art. 54', 'art. 1.620', 'art. 1.621', 'art. 1.622']);
    assert.ok(r.dispositivos.slice(1).every(d => d.revogado));
  });

  it('artigos revogados colados no mesmo parágrafo são separados', () => {
    const r = parsearDispositivos(['Art. 186. Procede-se mediante queixa.', 'Violação Art 187. (Revogado pela Lei nº 9.279, de 1996) Falsa atribuição Art. 188. (Revogado pela Lei nº 9.279, de 1996)']);
    assert.ok(rotulos(r).includes('art. 187') && rotulos(r).includes('art. 188'));
  });

  it('redação que a lei dá a outra norma (entre aspas) não vira dispositivo desta', () => {
    const r = parsearDispositivos([
      'Art. 178. O Código Penal passa a vigorar acrescido do seguinte Capítulo:',
      '“CAPÍTULO II-B',
      'Art. 337-E. Admitir contratação direta ilegal:',
      '§ 1º Texto citado.',
      'Pena - reclusão.” (NR)',
      'Art. 179. Texto da lei.'
    ]);
    assert.deepStrictEqual(rotulos(r), ['art. 178', 'art. 179']);
    assert.ok(r.dispositivos[0].continuacao.some(l => l.includes('337-E')));
  });

  it('separarAnotacoes tira "(Redação dada…)" e mantém parênteses que não são anotação', () => {
    const r = separarAnotacoes('Os valores (em reais) serão pagos. (Redação dada pela Lei nº 5, de 2000) (Vide ADIN 4.296)');
    assert.strictEqual(r.texto, 'Os valores (em reais) serão pagos.');
    assert.deepStrictEqual(r.anotacoes.map(a => a.tipo), ['redacao_dada', 'vide']);
  });

  it('conferirSequencia acha lacunas e quebras', () => {
    const r = conferirSequencia([1, 2, 4, 5, 3]);
    assert.deepStrictEqual(r.lacunas, []);
    assert.deepStrictEqual(r.quebras, ['5→3']);
    assert.deepStrictEqual(conferirSequencia([1, 2, 5]).lacunas, [3, 4]);
    assert.strictEqual(numeroBase('1.045-A'), 1045);
  });
});

describe('Parser no corpus real do Planalto (F3-02)', () => {
  it('CPC: 1.072 artigos, sem lacuna, e o art. 85, § 6º-A com a anotação da Lei 14.365/2022', () => {
    const r = corpus('LEI-13105-2015');
    const arts = r.dispositivos.filter(d => d.tipo === 'artigo');
    const seq = conferirSequencia(arts.map(a => numeroBase(a.numero)));
    assert.strictEqual(seq.maior, 1072);
    assert.deepStrictEqual(seq.lacunas, []);
    const d = r.dispositivos.find(x => x.rotulo === 'art. 85, § 6º-A')!;
    assert.ok(d, 'art. 85, § 6º-A existe');
    assert.ok(d.anotacoes.some(a => a.tipo === 'incluido' && /14\.365/.test(a.texto)));
    assert.match(d.texto, /^Quando o valor da condenação/);
  });

  it('CDC (119 artigos), CC (2.046), CP (361), CLT (922) e Lei 14.133 (194): sem lacuna de artigo', () => {
    for (const [id, total] of [['LEI-8078-1990', 119], ['LEI-10406-2002', 2046], ['DL-2848-1940', 361], ['DL-5452-1943', 922], ['LEI-14133-2021', 194]] as const) {
      const seq = conferirSequencia(corpus(id).dispositivos.filter(d => d.tipo === 'artigo' && d.escopo === 'corpo').map(a => numeroBase(a.numero)));
      assert.strictEqual(seq.maior, total, `${id}: maior artigo`);
      assert.deepStrictEqual(seq.lacunas, [], `${id}: lacunas`);
    }
  });

  it('CF: artigos do corpo e do ADCT separados; art. 117 revogado preservado', () => {
    const r = corpus('CF-1988');
    assert.ok(r.dispositivos.some(d => d.escopo === 'ADCT'));
    const seq = conferirSequencia(r.dispositivos.filter(d => d.tipo === 'artigo' && d.escopo === 'corpo').map(a => numeroBase(a.numero)));
    assert.strictEqual(seq.maior, 250);
    assert.ok(r.dispositivos.find(d => d.escopo === 'corpo' && d.rotulo === 'art. 117')?.revogado);
  });
});

describe('Anotação "(Produção de efeito)" (20/10/2026)', () => {
  it('sai do texto e fica em `anotacoes` como vigência', () => {
    const r = separarAnotacoes('dispor sobre critérios de execução equitativa. (Redação dada pela Emenda Constitucional nº 102, de 2019) (Produção de efeito)');
    assert.strictEqual(r.texto, 'dispor sobre critérios de execução equitativa.');
    assert.deepStrictEqual(r.anotacoes.map(a => a.tipo), ['redacao_dada', 'vigencia']);
  });

  it('dispositivo revogado que traz só "(Produção de efeito)" fica revogado, com texto vazio (antes aparecia como vigente)', () => {
    const r = parsearDispositivos(['Art. 1º Texto qualquer do primeiro artigo.', 'Art. 86. (Revogado pela Lei Complementar nº 104, de 2001) (Produção de efeito)']);
    const art86 = r.dispositivos.find(d => d.rotulo === 'art. 86')!;
    assert.strictEqual(art86.texto, '');
    assert.strictEqual(art86.revogado, true);
  });

  it('"Produção de efeitos" sem parênteses (texto de link) sai do fim do texto, só junto de outra anotação', () => {
    const r = separarAnotacoes('Excetuam-se da desvinculação de que trata o caput: (Incluído pela Emenda Constitucional nº 112, de 2021) Produção de efeitos');
    assert.strictEqual(r.texto, 'Excetuam-se da desvinculação de que trata o caput:');
    assert.deepStrictEqual(r.anotacoes.map(a => a.tipo), ['incluido', 'vigencia']);
    // texto de lei que termina assim, sem outra anotação, não é cortado
    assert.strictEqual(separarAnotacoes('A lei regula a Produção de efeitos').texto, 'A lei regula a Produção de efeitos');
  });

  it('nenhum dispositivo do corpus guarda a anotação colada ao texto, e os artigos revogados saem como revogados', () => {
    const ids = ['CF-1988', 'DL-5452-1943', 'LEI-10406-2002', 'LEI-11101-2005', 'LEI-5172-1966', 'LEI-8069-1990', 'LEI-8213-1991', 'LEI-9503-1997'];
    const colados = ids.flatMap(id => corpus(id).dispositivos.filter(d => /Produ[çc][ãa]o de efeitos?/.test(d.texto)).map(d => `${id} ${d.rotulo}`));
    assert.deepStrictEqual(colados, []);
    const ctn = corpus('LEI-5172-1966').dispositivos;
    for (const n of ['86', '87', '88', '89', '93', '94']) assert.ok(ctn.find(d => d.rotulo === `art. ${n}`)?.revogado, `CTN art. ${n}`);
    assert.ok(corpus('LEI-8069-1990').dispositivos.find(d => d.rotulo === 'art. 260, § 1º')?.revogado);
    const cf = corpus('CF-1988').dispositivos;
    assert.ok(cf.find(d => d.escopo === 'ADCT' && d.rotulo === 'art. 76, § 1º')?.revogado);
  });
});
