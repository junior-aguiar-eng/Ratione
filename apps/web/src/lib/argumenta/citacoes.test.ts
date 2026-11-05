import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { reconhecerCitacao } from './citacoes';

const NORMAS = ['CF-1988', 'LEI-10406-2002', 'LEI-13105-2015', 'DL-2848-1940', 'LEI-8078-1990', 'LEI-14133-2021', 'LEI-9099-1995', 'LEI-11340-2006', 'LEI-6830-1980', 'DL-5452-1943'];
const rec = (t: string) => reconhecerCitacao(t, NORMAS);

describe('Argumenta F5-04: reconhecimento de citações', () => {
  it('dispositivo de lei, com a norma antes ou depois do artigo', () => {
    assert.deepEqual(rec('CDC, art. 14'), { tipo: 'dispositivo', normaId: 'LEI-8078-1990', artigo: '14', detalhe: null });
    assert.deepEqual(rec('art. 14 do CDC'), { tipo: 'dispositivo', normaId: 'LEI-8078-1990', artigo: '14', detalhe: null });
    assert.deepEqual(rec('Código de Processo Civil, art. 489'), { tipo: 'dispositivo', normaId: 'LEI-13105-2015', artigo: '489', detalhe: null });
    assert.equal(rec('art. 85, § 2º, do CPC')?.tipo, 'dispositivo');
  });

  it('CPC de 1973 não é conferido no CPC de 2015', () => {
    for (const t of ['art. 535 do CPC/73', 'CPC/1973, art. 538', 'art. 557 do CPC de 1973', 'Código de Processo Civil de 1973, art. 20', 'art. 515 do CPC antigo', 'Lei 5.869/1973, art. 333']) {
      assert.equal(rec(t)?.tipo, 'fora', t);
    }
    assert.equal(rec('art. 85 do CPC/2015')?.tipo, 'dispositivo');
    assert.equal(rec('art. 85 do CPC/15')?.tipo, 'dispositivo');
  });

  it('escritas correntes da mesma norma: CF/88, Constituição sem "Federal", CC/2002, alínea', () => {
    assert.deepEqual(rec('CF/1988, art. 7º, XXII'), { tipo: 'dispositivo', normaId: 'CF-1988', artigo: '7º', detalhe: 'XXII' });
    assert.equal(rec('art. 5º, X, da Constituição')?.tipo, 'dispositivo');
    assert.equal(rec('CC/2002, art. 206, § 3º, V')?.tipo, 'dispositivo');
    // a alínea vai no detalhe para o selo avisar que não foi conferida
    assert.deepEqual(rec('CP, art. 61, II, e'), { tipo: 'dispositivo', normaId: 'DL-2848-1940', artigo: '61', detalhe: 'II, alínea e' });
    assert.deepEqual(rec('CLT, art. 482, i'), { tipo: 'dispositivo', normaId: 'DL-5452-1943', artigo: '482', detalhe: 'alínea i' });
    assert.equal(rec('CF, art. 105, III, "a"')?.tipo, 'dispositivo');
    assert.equal(rec('CF, art. 105, III, alíneas a e c')?.tipo, 'dispositivo');
  });

  it('"inciso I" e nome da lei seguido do número entre parênteses', () => {
    assert.equal(rec('Lei 11.340/2006, art. 5º, inciso I')?.tipo, 'dispositivo');
    assert.equal(rec('art. 39 da Lei de Execução Fiscal (Lei nº 6.830/80)')?.tipo, 'dispositivo');
  });

  it('norma da base com mais de um artigo, parágrafo ou inciso fica sem selo, e não "fora da base"', () => {
    for (const t of ['CP, art. 59 e 68', 'CLT, art. 477, § 6º e § 8º', 'CPC, art. 301, §§ 1º, 2º e 3º', 'CTN, arts. 205 e 206', 'CF, art. 129; CPP, art. 24', 'arts. 196 e 23, II, da Constituição Federal']) {
      assert.equal(rec(t), null, t);
    }
  });

  it('CPC, art. 543-C é do CPC de 1973 (o de 2015 não tem artigo com letra)', () => {
    assert.equal(rec('CPC, art. 543-C')?.tipo, 'fora');
    assert.equal(rec('CPC, art. 543-C, § 7º')?.tipo, 'fora');
    assert.equal(rec('CPC/2015, art. 1.040')?.tipo, 'dispositivo');
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

  it('tema com a natureza escrita antes do número: "Tema Repetitivo nº 1150" e "Tema de Repercussão Geral nº 793"', () => {
    // como o modelo escreveu numa análise real, com os recursos entre parênteses
    assert.deepEqual(rec('Tema Repetitivo nº 1150 (REsp nº 1.981.439/PR e REsp nº 1.939.993/BA, Rel. Min. Herman Benjamin, Primeira Seção, j. 13.09.2023)'), { tipo: 'tema', tribunais: ['STJ'], numero: '1150' });
    assert.deepEqual(rec('Tema Repetitivo nº 1.387 (REsp nº 2.214.879/PE, DJEN 17.12.2025)'), { tipo: 'tema', tribunais: ['STJ'], numero: '1387' });
    assert.deepEqual(rec('Tema de Repercussão Geral nº 793'), { tipo: 'tema', tribunais: ['STF'], numero: '793' });
    assert.deepEqual(rec('Tema RG 660 do STF'), { tipo: 'tema', tribunais: ['STF'], numero: '660' });
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
