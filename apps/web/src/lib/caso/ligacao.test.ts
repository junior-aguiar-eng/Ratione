import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { comCaso, destinoDoEndereco, fundamentosQueApontamPara, lerQuestaoDoCaso, urlDeVoltaAoCaso } from './ligacao';
import type { CasoEmMemoria } from './memoria';
import type { VerificacaoDaCitacao } from '../argumenta/verificarCitacoes';

describe('Caso entre as ferramentas: ligação', () => {
  it('acrescenta a questão ao endereço da citação, mantendo os outros parâmetros', () => {
    assert.equal(comCaso('/normaviva?d=CF-1988%23art-159', 'Q2'), '/normaviva?d=CF-1988%23art-159&caso=Q2');
    assert.equal(comCaso('/tesemap?n=STJ-TEMA-1076', 'Q10'), '/tesemap?n=STJ-TEMA-1076&caso=Q10');
    assert.equal(comCaso('/normaviva', 'Q1'), '/normaviva?caso=Q1');
  });

  it('questão fora do formato não entra na URL', () => {
    for (const q of ['Q0', 'Q11', 'q2', '2', '<script>', '', null, undefined]) assert.equal(comCaso('/tesemap?n=A', q as string), '/tesemap?n=A');
  });

  it('lê a questão da URL só se estiver no formato', () => {
    assert.equal(lerQuestaoDoCaso('?n=A&caso=Q3'), 'Q3');
    assert.equal(lerQuestaoDoCaso('?caso=Q11'), null);
    assert.equal(lerQuestaoDoCaso('?caso=abc'), null);
    assert.equal(lerQuestaoDoCaso(''), null);
  });

  it('o retorno leva ao Argumenta, na questão', () => {
    assert.equal(urlDeVoltaAoCaso('Q4'), '/argumenta?caso=Q4');
  });

  it('identifica o destino de cada endereço', () => {
    assert.deepEqual(destinoDoEndereco('/normaviva?d=ABC&caso=Q1'), { ferramenta: 'normaviva', id: 'ABC' });
    assert.deepEqual(destinoDoEndereco('/tesemap?n=STF-TEMA-660'), { ferramenta: 'tesemap', id: 'STF-TEMA-660' });
    assert.equal(destinoDoEndereco('/normaviva'), null);
    assert.equal(destinoDoEndereco('/prazozero?ato=apelacao'), null);
  });

  it('acha os fundamentos da questão que apontam para o dispositivo aberto, e só eles', () => {
    const selo = (href: string): VerificacaoDaCitacao => ({ estado: 'encontrada', links: [{ rotulo: 'Abrir', href }] });
    const caso = {
      resultados: {
        fundamentos: {
          fundamentos: [
            { questao: 'Q1', tipo: 'norma', descricao: 'Revelia', citacao: 'CPC, art. 344', paragrafos: [1] },
            { questao: 'Q2', tipo: 'norma', descricao: 'Revelia em outra questão', citacao: 'CPC, art. 344', paragrafos: [2] },
            { questao: 'Q1', tipo: 'precedente', descricao: 'Tema', citacao: 'Tema 1076 do STJ', paragrafos: [3] },
            { questao: 'Q1', tipo: 'doutrina', descricao: 'Autor', citacao: 'Nelson Nery', paragrafos: [4] }
          ]
        }
      },
      selos: new Map([
        ['CPC, art. 344', selo('/normaviva?d=CPC%23art-344')],
        ['Tema 1076 do STJ', selo('/tesemap?n=STJ-TEMA-1076')]
      ])
    } as unknown as Pick<CasoEmMemoria, 'resultados' | 'selos'>;

    assert.deepEqual(fundamentosQueApontamPara(caso, 'Q1', 'normaviva', 'CPC#art-344').map(f => f.descricao), ['Revelia']);
    assert.deepEqual(fundamentosQueApontamPara(caso, 'Q1', 'tesemap', 'STJ-TEMA-1076').map(f => f.descricao), ['Tema']);
    // outro dispositivo, outra ferramenta ou sem destino: nada é afirmado
    assert.deepEqual(fundamentosQueApontamPara(caso, 'Q1', 'normaviva', 'CPC#art-345'), []);
    assert.deepEqual(fundamentosQueApontamPara(caso, 'Q1', 'tesemap', 'CPC#art-344'), []);
    assert.deepEqual(fundamentosQueApontamPara(caso, 'Q1', 'normaviva', null), []);
  });
});
