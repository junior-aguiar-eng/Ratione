import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { situacaoNaData, segmentosDoTrecho, textoDoAvisoFuturo } from './normavivaApresentacao';
import { avisosDoArtigo, type AvisoVigenciaFutura } from '@ratione/normaviva/vigencia-futura';
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

describe('Aviso de vigência futura na tela', () => {
  const aviso: AvisoVigenciaFutura = {
    ato: 'Lei nº 15.371 de 31/03/2026',
    chave: 'lei:15371:2026',
    publicacao: '2026-04-01',
    vigencia: { tipo: 'data', em: '2027-01-01' },
    vigenteEm: '2027-01-01',
    clausula: 'Art. 14. Esta Lei entra em vigor no dia 1º de janeiro de 2027',
    ementa: '',
    fonte: { url: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/lei/l15371.htm', lidoEm: '2026-10-22' },
    alteracoes: [
      {
        normaId: 'DL-5452-1943',
        artigos: ['392', '392-a'],
        dispositivos: [
          { dispositivo: 'Art. 392, caput', acao: 'Alteração' },
          { dispositivo: 'Art. 392, § 8', acao: 'Acréscimo' },
          { dispositivo: 'Art. 392-A, caput', acao: 'Alteração' }
        ]
      }
    ]
  };

  it('diz que o texto é o de hoje, quando a nova redação vale e quais dispositivos do artigo mudam (só os do artigo mostrado)', () => {
    const t = textoDoAvisoFuturo(aviso, 'DL-5452-1943', 'art. 392', dc);
    assert.match(t.linhas[0], /O texto acima é o que vale hoje/);
    assert.match(t.linhas[0], /passa a valer em 01\/01\/2027/);
    assert.deepStrictEqual(t.dispositivos, ['Art. 392, caput (alteração)', 'Art. 392, § 8 (acréscimo)']);
    assert.match(t.linhas[1], /entra em vigor no dia 1º de janeiro de 2027/);
  });

  it('vigência sem data: não inventa data e manda ler o ato', () => {
    const t = textoDoAvisoFuturo({ ...aviso, vigenteEm: null, vigencia: { tipo: 'complexa' } }, 'DL-5452-1943', 'art. 392', dc);
    assert.match(t.linhas[0], /escalonada ou condicionada/);
    assert.doesNotMatch(t.linhas[0], /passa a valer em/);
  });

  it('só aparece no artigo certo e some quando a data chega', () => {
    assert.strictEqual(avisosDoArtigo('DL-5452-1943', 'art. 392, § 8º', '2026-10-22', [aviso]).length, 1);
    assert.strictEqual(avisosDoArtigo('DL-5452-1943', 'art. 393', '2026-10-22', [aviso]).length, 0);
    assert.strictEqual(avisosDoArtigo('DL-5452-1943', 'art. 392', '2027-01-01', [aviso]).length, 0);
  });
});
