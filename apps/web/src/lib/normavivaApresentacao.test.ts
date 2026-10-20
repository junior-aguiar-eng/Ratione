import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { situacaoNaData, segmentosDoTrecho } from './normavivaApresentacao';
import type { Versao } from './normaviva';

const dc = (iso: string) => iso.split('-').reverse().join('/');
const versao = (parcial: Partial<Versao>): Versao => ({
  texto: 't',
  origem: 'incluido',
  ato_chave: 'lei:14365:2022',
  ato_rotulo: 'Lei nº 14.365 de 02/06/2022',
  ato_publicacao: '2022-06-03',
  ano_do_ato: 2022,
  fonte_da_data: 'publicacao_senado',
  vigente_de: '2022-06-03',
  vigencia_confirmada: false,
  texto_anterior_disponivel: false,
  hash: 'a'.repeat(64),
  ...parcial
});

describe('Apresentação do NormaViva', () => {
  it('trecho da busca: só <b> vira destaque e outras tags somem (nada de HTML da base chega à tela)', () => {
    assert.deepStrictEqual(segmentosDoTrecho('a <b>honorários</b> de <i>x</i><script>y</script> fim'), [
      { texto: 'a ', destaque: false },
      { texto: 'honorários', destaque: true },
      { texto: ' de xy fim', destaque: false }
    ]);
  });

  it('data a partir da vigência provisória: texto da base com aviso de que a vigência não está confirmada', () => {
    const s = situacaoNaData(versao({}), '2026-10-19', dc);
    assert.strictEqual(s.tipo, 'redacao_atual');
    assert.ok(s.tipo === 'redacao_atual' && s.provisoria);
    assert.match(s.aviso, /03\/06\/2022/);
    assert.match(s.aviso, /vacatio legis/);
  });

  it('data ANTES da redação atual: nunca mostra a redação atual como se fosse a da época', () => {
    const s = situacaoNaData(versao({}), '2019-05-10', dc);
    assert.strictEqual(s.tipo, 'texto_da_epoca_indisponivel');
    assert.match(s.aviso, /não está na base/);
  });

  it('redação original antes da publicação da norma: não havia texto', () => {
    const s = situacaoNaData(versao({ origem: 'redacao_original', ato_rotulo: null, vigente_de: '2015-03-17' }), '2015-01-01', dc);
    assert.strictEqual(s.tipo, 'texto_da_epoca_indisponivel');
    assert.match(s.aviso, /17\/03\/2015/);
  });

  it('vigência confirmada não leva o aviso de provisória', () => {
    const s = situacaoNaData(versao({ vigencia_confirmada: true }), '2026-10-19', dc);
    assert.ok(s.tipo === 'redacao_atual' && !s.provisoria);
  });

  it('vetado e sem data de vigência não afirmam nada', () => {
    assert.strictEqual(situacaoNaData(versao({ origem: 'vetado', vigente_de: null }), '2026-10-19', dc).tipo, 'sem_data');
    const s = situacaoNaData(versao({ vigente_de: null, ano_do_ato: 1999 }), '2026-10-19', dc);
    assert.strictEqual(s.tipo, 'sem_data');
    assert.match(s.aviso, /1999/);
  });
});
