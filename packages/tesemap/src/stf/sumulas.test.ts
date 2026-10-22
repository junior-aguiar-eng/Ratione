import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { nosDasSumulasStf, nosDosTemasStf, noVisivel } from '../banco';
import { carregarSumulasStf, carregarTemasRgStf, manifestoStf } from './index';
import { lerSumulasStf, separarRodape, sumulasCitadasNoTexto, temasCitadosNoTexto } from './sumulas';

const CAB = 'Título;Título URL;Enunciado;Órgão julgador;Data de aprovação;Fonte de Publicação;Situação;Ramo do direito;Observação';
const RODAPE = '\n\n\nCritérios de Busca: base: sumulas\nclasseNumeroIncidente: vinculante\nURL de Busca: https://jurisprudencia.stf.jus.br/pages/search?x=1\n';
const linha = (titulo: string, enunciado: string, obs = '') => `${titulo};https://jurisprudencia.stf.jus.br/pages/search/seq-sumula1/false;"${enunciado}";Tribunal Pleno;16/10/2014;DJe nº 210;Aprovada;Administrativo;${obs}`;

describe('Leitor das súmulas do STF (F4-02)', () => {
  it('lê súmula, junta o espaço duplo do enunciado, converte a data e guarda a consulta do rodapé', () => {
    const { sumulas, consulta } = lerSumulasStf(`${CAB}\n${linha('Súmula vinculante 37', 'Não cabe ao Poder  Judiciário aumentar\n vencimentos.', '- Veja Súmula 339. - Veja PSV 88.')}${RODAPE}`, true);
    assert.equal(sumulas.length, 1);
    assert.equal(sumulas[0].id, 'STF-SV-37');
    assert.equal(sumulas[0].enunciado, 'Não cabe ao Poder Judiciário aumentar vencimentos.');
    assert.equal(sumulas[0].dataAprovacao, '2014-10-16');
    assert.deepEqual(sumulas[0].sumulasCitadas, ['STF-SUMULA-339']);
    assert.equal(consulta, 'https://jurisprudencia.stf.jus.br/pages/search?x=1');
  });

  it('vinculante no arquivo errado, número repetido, título estranho ou coluna que sumiu: a leitura falha', () => {
    assert.throws(() => lerSumulasStf(`${CAB}\n${linha('Súmula 5', 'x')}\n`, true), /não vinculantes|vinculantes/);
    assert.throws(() => lerSumulasStf(`${CAB}\n${linha('Súmula vinculante 5', 'x')}\n`, false), /vinculantes/);
    assert.throws(() => lerSumulasStf(`${CAB}\n${linha('Súmula 5', 'x')}\n${linha('Súmula 5', 'y')}\n`, false), /repetido/);
    assert.throws(() => lerSumulasStf(`${CAB}\n${linha('Tema 5', 'x')}\n`, false), /título não reconhecido/);
    assert.throws(() => lerSumulasStf(`${CAB.replace('Enunciado;', '')}\nSúmula 5;u;Tribunal Pleno;16/10/2014;p;Aprovada;r;o\n`, false), /faltam colunas Enunciado/);
  });

  it('o rodapé "Critérios de Busca" não vira súmula; arquivo sem rodapé também lê', () => {
    assert.equal(separarRodape(`${CAB}\n${linha('Súmula 1', 'x')}${RODAPE}`).tabela.includes('Critérios'), false);
    assert.equal(lerSumulasStf(`${CAB}\n${linha('Súmula 1', 'x')}\n`, false).consulta, null);
  });

  it('referências do texto: "Veja Súmula 419 e Súmula 645", súmula vinculante e tema de repercussão geral com milhar', () => {
    assert.deepEqual(sumulasCitadasNoTexto('- Veja Súmula 419 e Súmula 645. - Veja PSV 89 que aprovou a Súmula Vinculante 38.'), ['STF-SUMULA-419', 'STF-SUMULA-645', 'STF-SV-38']);
    assert.deepEqual(temasCitadosNoTexto('teses do Tema 6 da Repercussão Geral (RE 566.471) e tema 1.234 da sistemática'), [6, 1234]);
    assert.deepEqual(temasCitadosNoTexto('RE 566471 sem tema'), []);
  });
});

describe('Corpus das súmulas do STF no repositório (F4-02)', () => {
  const sumulas = carregarSumulasStf();
  const m = manifestoStf();

  it('61 vinculantes (1 a 63; o arquivo não traz a 9 nem a 30) e 724 não vinculantes (1 a 736), com a consulta da exportação no manifesto', () => {
    const sv = sumulas.filter(s => s.vinculante);
    const comuns = sumulas.filter(s => !s.vinculante);
    assert.equal(sv.length, 61);
    assert.equal(comuns.length, 724);
    assert.deepEqual([9, 30].filter(n => sv.some(s => s.numero === n)), []);
    assert.equal(sv[sv.length - 1].numero, 63);
    assert.equal(comuns[comuns.length - 1].numero, 736);
    assert.ok(m.arquivos.filter(a => a.nome === 'sumulas' || a.nome === 'sumulas-vinculantes').every(a => /^https:\/\/jurisprudencia\.stf\.jus\.br\//.test(a.consulta ?? '')));
    assert.ok(sumulas.every(s => /^https:\/\/jurisprudencia\.stf\.jus\.br\/pages\/search\/seq-sumula\d+\/false$/.test(s.url) && s.enunciado.length > 10 && !/\s{2}/.test(s.enunciado)));
  });

  it('SV 63 (tráfico privilegiado), SV 61 liga ao Tema 6 de repercussão geral, SV 55 liga à Súmula 680', () => {
    const por = (id: string) => sumulas.find(s => s.id === id)!;
    assert.match(por('STF-SV-63').enunciado, /tráfico privilegiado/);
    assert.equal(por('STF-SV-63').dataAprovacao, '2025-09-26');
    assert.deepEqual(por('STF-SV-61').temasCitados, [6]);
    assert.deepEqual(por('STF-SV-60').temasCitados, [1234]);
    assert.ok(por('STF-SV-55').sumulasCitadas.includes('STF-SUMULA-680'));
  });

  it('nós: tipo súmula, fonte é a página da própria súmula, ligações só para nó que existe no grafo', () => {
    const rg = nosDosTemasStf(carregarTemasRgStf(), m);
    const existentes = new Set([...rg.map(n => n.id), ...sumulas.map(s => s.id)]);
    const nos = nosDasSumulasStf(sumulas, m, existentes);
    assert.equal(nos.length, 785);
    assert.equal(new Set(nos.map(n => n.id)).size, nos.length);
    assert.ok(nos.every(n => n.tipo === 'sumula' && n.tribunal === 'STF' && /^STF-(SV|SUMULA)-\d+$/.test(n.id) && n.fontes[0].url.startsWith('https://jurisprudencia.stf.jus.br/') && noVisivel(n)));
    const sv61 = nos.find(n => n.id === 'STF-SV-61')!;
    assert.equal(sv61.rotulo, 'Súmula Vinculante 61 do STF');
    assert.deepEqual(sv61.detalhes.temasRg, [{ numero: '6' }]);
    assert.equal(sv61.detalhes.vinculante, true);
    const sv55 = nos.find(n => n.id === 'STF-SV-55')!;
    assert.deepEqual(sv55.detalhes.sumulasCorrelatas, [{ id: 'STF-SUMULA-680' }]);
    // ligação para nó que não existe é descartada
    const semNada = nosDasSumulasStf(sumulas, m, new Set()).find(n => n.id === 'STF-SV-55')!;
    assert.deepEqual(semNada.detalhes.sumulasCorrelatas, []);
  });
});
