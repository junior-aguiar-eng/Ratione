import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { atoCitadoNoTexto, atosAlteradoresDoPlanalto, chaveDoNomeSenado, ehAlteracao, textoSemHtml } from './conferir';

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
