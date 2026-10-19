import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { join } from 'node:path';
import { detectarCharset } from '../coleta/coletar';
import { atosDoTexto, chaveDoAto } from '../coleta/conferir';
import { paragrafosDoHtml, parsearDispositivos } from '../parser';
import { versaoDoDispositivo, versoesDaNorma, type DatasDaNorma } from './versoes';

const DATAS: DatasDaNorma = {
  norma: { nome: 'Lei nº 13.105 de 16/03/2015', assinatura: '2015-03-16', publicacao: '2015-03-17' },
  atos: {
    'lei:14365:2022': { nome: 'Lei nº 14.365 de 02/06/2022', assinatura: '2022-06-02', publicacao: '2022-06-03' },
    'lei:13256:2016': { nome: 'Lei nº 13.256 de 04/02/2016', assinatura: '2016-02-04', publicacao: '2016-02-05' }
  }
};

const parse = (linhas: string[]) => parsearDispositivos(linhas).dispositivos;

describe('Citação de atos nas anotações (F3-03)', () => {
  it('reconhece as variações do Planalto: ano de 2 dígitos, Lcp, Leinº, MP reeditada, número com espaço, "sem de"', () => {
    const chaves = (t: string) => atosDoTexto(t).map(a => a.chave);
    assert.deepStrictEqual(chaves('Redação dada pela Lei nº 8.745, de 10.12.97'), ['lei:8745:1997']);
    assert.deepStrictEqual(chaves('Incluída pela Lcp nº 118, de 2005'), ['lei-complementar:118:2005']);
    assert.deepStrictEqual(chaves('Incluído pela Leinº 8.000, de 1990'), ['lei:8000:1990']);
    assert.deepStrictEqual(chaves('Redação dada pela Medida Provisória nº 2.225-45, de 4.9.2001'), ['medida-provisoria:2225:2001']);
    assert.deepStrictEqual(chaves('Incluído pela Lei nº 13. 281, de 2016'), ['lei:13281:2016']);
    assert.deepStrictEqual(chaves('Redação dada pelo Decreto-lei nº 4.000, 19.12.1941'), ['decreto-lei:4000:1941']);
    assert.deepStrictEqual(chaves('Incluída pela Emenda Constituição Constitucional nº 45, de 2004'), ['emenda-constitucional:45:2004']);
    assert.strictEqual(chaveDoAto('lei', '8.745', '97'), 'lei:8745:1997');
  });

  it('devolve a data completa quando a anotação a traz', () => {
    assert.deepStrictEqual(atosDoTexto('Redação dada pela Lei nº 7.209, de 11.7.1984'), [{ chave: 'lei:7209:1984', dataIso: '1984-07-11' }]);
    assert.strictEqual(atosDoTexto('Incluído pela Lei nº 10.695, de 1º.7.2003')[0].dataIso, '2003-07-01');
    assert.strictEqual(atosDoTexto('Revogado pela Lei nº 13.105, de 2015')[0].dataIso, null);
  });
});

describe('Versões dos dispositivos (F3-03)', () => {
  it('dispositivo sem anotação: redação original, vigência provisória na publicação da norma', () => {
    const [d] = parse(['Art. 1º O processo civil será ordenado.']);
    const v = versaoDoDispositivo('LEI-13105-2015', d, DATAS);
    assert.strictEqual(v.origem, 'redacao_original');
    assert.strictEqual(v.ato, null);
    assert.strictEqual(v.vigenteDe, '2015-03-17');
    assert.strictEqual(v.vigenciaConfirmada, false);
    assert.strictEqual(v.vigenteAte, null);
    assert.strictEqual(v.textoAnteriorDisponivel, false);
  });

  it('incluído por lei posterior: ato e vigência provisória na publicação do Senado', () => {
    const ds = parse(['Art. 85. A sentença condenará.', '§ 6º-A Quando o valor for líquido. (Incluído pela Lei nº 14.365, de 2022)']);
    const v = versaoDoDispositivo('LEI-13105-2015', ds[1], DATAS);
    assert.strictEqual(v.origem, 'incluido');
    assert.strictEqual(v.vigenteDe, '2022-06-03');
    assert.strictEqual(v.ato?.fonteDaData, 'publicacao_senado');
    assert.strictEqual(v.ato?.rotulo, 'Lei nº 14.365 de 02/06/2022');
  });

  it('várias redações: vale a do ato mais recente, mesmo fora de ordem', () => {
    const [d] = parse(['Art. 5º Texto atual. (Redação dada pela Lei nº 14.365, de 2022) (Redação dada pela Lei nº 13.256, de 2016)']);
    const v = versaoDoDispositivo('LEI-13105-2015', d, DATAS);
    assert.strictEqual(v.origem, 'redacao_dada');
    assert.strictEqual(v.ato?.chave, 'lei:14365:2022');
  });

  it('revogado, vetado e ato fora do Senado (data da anotação ou só o ano)', () => {
    const ds = parse(['Art. 9º (Revogado pela Lei nº 13.256, de 2016)', 'Art. 10. (VETADO)', 'Art. 11. Texto. (Redação dada pela Lei nº 7.209, de 11.7.1984)', 'Art. 12. Texto. (Redação dada pela Lei nº 9.999, de 1999)']);
    const [rev, vet, anot, ano] = ds.map(d => versaoDoDispositivo('X', d, DATAS));
    assert.strictEqual(rev.origem, 'revogado');
    assert.ok(rev.revogado);
    assert.strictEqual(rev.vigenteDe, '2016-02-05');
    assert.strictEqual(vet.origem, 'vetado');
    assert.strictEqual(vet.vigenteDe, null);
    assert.strictEqual(anot.vigenteDe, '1984-07-11');
    assert.strictEqual(anot.ato?.fonteDaData, 'anotacao');
    assert.strictEqual(ano.vigenteDe, null);
    assert.strictEqual(ano.anoDoAto, 1999);
    assert.strictEqual(ano.ato?.fonteDaData, 'ano');
  });

  it('versoesDaNorma devolve uma versão por dispositivo', () => {
    const ds = parse(['Art. 1º A.', '§ 1º B.', 'Art. 2º C.']);
    assert.strictEqual(versoesDaNorma('X', ds, DATAS).length, 3);
  });
});

describe('Versões no corpus real (F3-03)', () => {
  it('CPC art. 85, § 6º-A: incluído pela Lei 14.365/2022, vigência provisória em 03/06/2022 (DOU)', () => {
    const pasta = join(__dirname, '..', '..', 'corpus');
    const html = detectarCharset(gunzipSync(readFileSync(join(pasta, 'planalto', 'LEI-13105-2015.html.gz'))), null).texto;
    const datas = JSON.parse(readFileSync(join(pasta, 'atos-senado.json'), 'utf-8')).normas['LEI-13105-2015'];
    const vs = versoesDaNorma('LEI-13105-2015', parsearDispositivos(paragrafosDoHtml(html)).dispositivos, datas);
    const v = vs.find(x => x.rotulo === 'art. 85, § 6º-A')!;
    assert.strictEqual(v.origem, 'incluido');
    assert.strictEqual(v.ato?.chave, 'lei:14365:2022');
    assert.strictEqual(v.vigenteDe, '2022-06-03');
    assert.ok(vs.every(x => x.vigenciaConfirmada === false), 'nenhuma vigência é dada como confirmada');
  });
});
