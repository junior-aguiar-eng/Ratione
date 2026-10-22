import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { atoCitadoNoTexto, atosAlteradoresDoPlanalto, atosDoTexto, chaveDoNomeSenado, ehAlteracao, textoSemHtml } from './conferir';

describe('Conferência do Planalto com o Senado (F3-01)', () => {
  it('textoSemHtml tira tags, decodifica entidades e junta espaços', () => {
    assert.strictEqual(textoSemHtml('<a href="x">(Reda&ccedil;&atilde;o\r\ndada pela Lei n&ordm; 7.209)</a>').trim(), '(Redação dada pela Lei nº 7.209)');
  });

  it('acha os atos das anotações, em todos os formatos de data do Planalto', () => {
    const html = `<p>(Redação dada pela Lei nº 7.209, de 11.7.1984)</p>
      <p>(Incluído pela Lei Complementar nº 95/1998)</p>
      <p>(Revogado pela Lei nº 13.105, de 2015)</p>
      <p>(Redação dada pelo Decreto-Lei nº 4.000, de 1º de dezembro de 1942)</p>
      <p>(Vide Lei nº 9.999, de 2001)</p>`;
    const r = atosAlteradoresDoPlanalto(html);
    assert.ok(r.has('lei:7209:1984'));
    assert.ok(r.has('lei-complementar:95:1998'));
    assert.ok(r.has('lei:13105:2015'));
    assert.ok(!r.has('lei:9999:2001'), '"Vide" sem anotação de alteração não conta');
  });

  it('chaves do Senado e do Planalto coincidem; a regex global não guarda estado entre chamadas', () => {
    assert.strictEqual(chaveDoNomeSenado('Lei nº 13.256 de 04/02/2016'), 'lei:13256:2016');
    assert.strictEqual(chaveDoNomeSenado('Medida Provisória nº 1.012 de 13/07/1995'), 'medida-provisoria:1012:1995');
    assert.strictEqual(chaveDoNomeSenado('Lei Complementar nº 214 de 16/01/2025'), 'lei-complementar:214:2025');
    // regressão: chamar o Senado antes não pode fazer o Planalto pular achados
    assert.ok(atosAlteradoresDoPlanalto('(Redação dada pela Lei nº 7.209, de 11.7.1984)').has('lei:7209:1984'));
  });

  it('só alteração permanente conta; provisória, regulamentação e correlata ficam de fora', () => {
    assert.ok(ehAlteracao('Declaração de Alteração Permanente'));
    assert.ok(!ehAlteracao('Declaração de Alteração Provisória'));
    assert.ok(!ehAlteracao('Declaração de Regulamentação Permanente de Norma'));
    assert.ok(!ehAlteracao('Declaração de Legislação Correlata'));
  });

  it('atoCitadoNoTexto acha o ato fora de anotação', () => {
    assert.ok(atoCitadoNoTexto('lei:8884:1994', 'conforme a Lei nº 8.884, de 11.6.1994, que'));
    assert.ok(!atoCitadoNoTexto('lei:8885:1994', 'conforme a Lei nº 8.884, de 11.6.1994, que'));
  });
});

describe('Reconhecimento de atos com a data por extenso (21/10/2026)', () => {
  const chaves = (t: string) => atosDoTexto(t).map(a => a.chave);

  it('"de 26 de setembro de 1995" é o ano de 1995, não "2026" (o dia não é o ano)', () => {
    assert.deepStrictEqual(chaves('Altera a Lei nº 9.099, de 26 de setembro de 1995, para dispor.'), ['lei:9099:1995']);
    assert.deepStrictEqual(chaves('Lei nº 13.105, de 16 de março de 2015'), ['lei:13105:2015']);
    assert.deepStrictEqual(chaves('art. 1.275 da Lei nº 10.406, de 10 de janeiro de 2002 (Código Civil)'), ['lei:10406:2002']);
    assert.deepStrictEqual(chaves('Lei Complementar nº 41, de 22 de dezembro de 1981'), ['lei-complementar:41:1981']);
  });

  it('sem o "de" antes do mês, como o Planalto às vezes escreve ("de 24 julho de 1991")', () => {
    assert.deepStrictEqual(chaves('art. 12 da Lei no 8.212, de 24 julho de 1991;'), ['lei:8212:1991']);
    assert.deepStrictEqual(chaves('Lei nº 8.212, de 1991, e a Lei nº 9.876, de 26 de novembro de 1999'), ['lei:8212:1991', 'lei:9876:1999']);
  });

  it('dia com ordinal, mês com acento e a forma sem vírgula continuam certos', () => {
    assert.deepStrictEqual(chaves('Lei nº 5.172, de 1º de outubro de 1966'), ['lei:5172:1966']);
    assert.deepStrictEqual(chaves('Lei nº 1.060, de 5 de fevereiro de 1950'), ['lei:1060:1950']);
    assert.deepStrictEqual(chaves('Lei nº 4.737 de 15 de julho de 1965'), ['lei:4737:1965']);
  });

  it('as outras formas de data não mudaram: só o ano, data numérica e ponto como separador', () => {
    assert.deepStrictEqual(chaves('Lei nº 9.099, de 1995'), ['lei:9099:1995']);
    assert.deepStrictEqual(chaves('Lei nº 13.256 de 04/02/2016'), ['lei:13256:2016']);
    assert.deepStrictEqual(chaves('Lei nº 8.078, de 11.9.1990'), ['lei:8078:1990']);
    assert.deepStrictEqual(chaves('Medida Provisória nº 2.225-45, de 4.9.2001'), ['medida-provisoria:2225:2001']);
  });
});
