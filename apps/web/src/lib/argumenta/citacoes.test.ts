import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { reconhecerCitacao } from './citacoes';

const NORMAS = ['CF-1988', 'LEI-10406-2002', 'LEI-13105-2015', 'DL-2848-1940', 'LEI-8078-1990', 'LEI-14133-2021', 'LEI-9099-1995'];
const rec = (t: string) => reconhecerCitacao(t, NORMAS);

describe('Argumenta F5-04: reconhecimento de citações', () => {
  it('dispositivo de lei, com a norma antes ou depois do artigo', () => {
    assert.deepEqual(rec('CDC, art. 14'), { tipo: 'dispositivo', normaId: 'LEI-8078-1990', artigo: '14', detalhe: null });
    assert.deepEqual(rec('art. 14 do CDC'), { tipo: 'dispositivo', normaId: 'LEI-8078-1990', artigo: '14', detalhe: null });
    assert.deepEqual(rec('Código de Processo Civil, art. 489'), { tipo: 'dispositivo', normaId: 'LEI-13105-2015', artigo: '489', detalhe: null });
    assert.equal(rec('art. 85, § 2º, do CPC')?.tipo, 'dispositivo');
  });

  it('artigo sem norma nomeada não é conferido', () => {
    assert.equal(rec('art. 14'), null);
  });

  it('lei por número e ano', () => {
    assert.deepEqual(rec('Lei 14.133/2021'), { tipo: 'norma', normaId: 'LEI-14133-2021' });
    assert.deepEqual(rec('Lei nº 9.099/95'), { tipo: 'norma', normaId: 'LEI-9099-1995' });
  });

  it('norma que a base não cobre vira "fora", e não "inexistente"', () => {
    assert.equal(rec('Lei 9.999/1999')?.tipo, 'fora');
    assert.equal(rec('Lei nº 8.666/1993, art. 3º')?.tipo, 'fora');
    assert.equal(rec('art. 5º da Portaria XYZ')?.tipo, 'fora');
  });

  it('súmula: tribunal pela sigla, por extenso ou, se ausente, nos dois', () => {
    assert.deepEqual(rec('Súmula 479 do STJ'), { tipo: 'sumula', tribunais: ['STJ'], numero: '479', vinculante: false });
    assert.deepEqual(rec('Súmula nº 7/STJ'), { tipo: 'sumula', tribunais: ['STJ'], numero: '7', vinculante: false });
    assert.deepEqual(rec('Súmula 339 do Supremo Tribunal Federal'), { tipo: 'sumula', tribunais: ['STF'], numero: '339', vinculante: false });
    assert.deepEqual(rec('Súmula 479'), { tipo: 'sumula', tribunais: ['STF', 'STJ'], numero: '479', vinculante: false });
  });

  it('súmula vinculante é sempre do STF', () => {
    assert.deepEqual(rec('Súmula Vinculante 10'), { tipo: 'sumula', tribunais: ['STF'], numero: '10', vinculante: true });
  });

  it('mais de uma súmula na mesma citação não é conferida', () => {
    assert.equal(rec('Súmulas 283 e 284 do STF'), null);
    assert.equal(rec('Súmula 7, 83 do STJ'), null);
  });

  it('súmula de outro tribunal fica fora da base', () => {
    assert.equal(rec('Súmula 331 do TST')?.tipo, 'fora');
    assert.equal(rec('Súmula 100 do TJSP')?.tipo, 'fora');
  });

  it('tema: número com ponto, tribunal pela sigla ou pela natureza do tema', () => {
    assert.deepEqual(rec('Tema 1.076 do STJ'), { tipo: 'tema', tribunais: ['STJ'], numero: '1076' });
    assert.deepEqual(rec('Tema 660 da repercussão geral'), { tipo: 'tema', tribunais: ['STF'], numero: '660' });
    assert.deepEqual(rec('Tema 1076 (recurso repetitivo)'), { tipo: 'tema', tribunais: ['STJ'], numero: '1076' });
    assert.deepEqual(rec('Tema 339'), { tipo: 'tema', tribunais: ['STF', 'STJ'], numero: '339' });
  });

  it('ações de controle concentrado', () => {
    assert.deepEqual(rec('ADI 4.357'), { tipo: 'acao', classe: 'ADI', numero: '4357' });
    assert.deepEqual(rec('ADPF nº 54'), { tipo: 'acao', classe: 'ADPF', numero: '54' });
    assert.deepEqual(rec('STF, ADC 43'), { tipo: 'acao', classe: 'ADC', numero: '43' });
  });

  it('doutrina, recurso e texto que não é citação não recebem selo', () => {
    assert.equal(rec('Nelson Nery Jr.'), null);
    assert.equal(rec('REsp 1.234.567/SP'), null);
    assert.equal(rec('CPC'), null);
    assert.equal(rec(''), null);
    assert.equal(rec('   '), null);
  });

  it('espaços estranhos e quebras não atrapalham', () => {
    assert.equal(rec('Súmula 479   do\nSTJ')?.tipo, 'sumula');
  });
});
