import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { historicoEmCsv, paragrafosDaAnalise, tamanhoDaAnalise, type LinhaAnalise } from './uso';

describe('Tamanho da decisão no histórico (F8-04)', () => {
  it('aceita somente número inteiro entre 1 e o limite de 800 parágrafos', () => {
    for (const n of [1,17,800]) assert.deepEqual(paragrafosDaAnalise(n),{ok:true,paragrafos:n});
    for (const n of [0,-1,801,1.5,NaN,Infinity,'17',{},[],true]) assert.equal(paragrafosDaAnalise(n).ok,false);
    for (const n of [null,undefined]) assert.deepEqual(paragrafosDaAnalise(n),{ok:true,paragrafos:null});
  });
  it('distingue singular, plural e tamanho não registrado; explicação não é decisão', () => {
    assert.equal(tamanhoDaAnalise({tipo:'rapida',paragrafos:1}),'1 parágrafo');
    assert.equal(tamanhoDaAnalise({tipo:'rapida',paragrafos:17}),'17 parágrafos');
    assert.equal(tamanhoDaAnalise({tipo:'completa',paragrafos:800}),'800 parágrafos');
    for(const n of [null,undefined,0]) assert.equal(tamanhoDaAnalise({tipo:'rapida',paragrafos:n}),'Tamanho não registrado');
    assert.equal(tamanhoDaAnalise({tipo:'explicacao',paragrafos:1}),null);
  });
  it('exporta o número, deixando em branco os registros antigos e explicações, sem inferir zero ou páginas', () => {
    const base: LinhaAnalise={id:'a',tipo:'rapida',rotulo:null,situacao:'concluida',consumiu:true,falhas:0,criada_em:'2026-10-24T12:00:00Z',concluida_em:'2026-10-24T12:00:01Z'};
    const csv=historicoEmCsv([{...base,paragrafos:17},base,{...base,tipo:'explicacao',paragrafos:1}]);
    const linhas=csv.trim().split('\r\n');
    assert.ok(linhas[0].endsWith(';"Parágrafos"'));
    assert.ok(linhas[1].endsWith(';"17"'));
    assert.ok(linhas[2].endsWith(';""'));
    assert.ok(linhas[3].endsWith(';""'));
  });
});
