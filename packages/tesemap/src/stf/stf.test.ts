import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { carregarPrecedentesStj, manifestoStj } from '../stj';
import { nosDosPrecedentesStj, nosDosTemasStf, temasStfCitadosPeloStj, noVisivel } from '../banco';
import { carregarTemasRgStf, manifestoStf } from './index';
import { classificarTemaRg, dataBr, lerTemasRg, type TemaRgStf } from './repercussao';

const CABECALHO =
  'Status Tema,Número tema,Título tema,Descrição tema,Tese,Processo paradigma,Relator atual,Relator admissibilidade,Relator presidente,Situação repercussão geral,Situação admissibilidade tema,Situação julgamento tema,Situação Processo Paradigma,Link Processo,Data autuação,Data admissibilidade RG,Data julgamento tema,Ramos do Direito,Assunto,Situação Suspensão Nacional';
const linha = (c: Record<string, string>) =>
  CABECALHO.split(',').map(k => `"${(c[k] ?? '-').replace(/"/g, '""')}"`).join(',');
const base = { 'Status Tema': 'Ativo', 'Número tema': '10', 'Título tema': 'Questão do tema 10', 'Processo paradigma': 'RE 1', 'Situação repercussão geral': 'RG reconhecida - mérito julgado', 'Data julgamento tema': '21/03/2013', Tese: 'É inconstitucional a norma X.' };

describe('Leitor dos temas de repercussão geral do STF (F4-02)', () => {
  it('lê tema, converte data, trata "-" como vazio e preserva o texto', () => {
    const [t] = lerTemasRg(`${CABECALHO}\n${linha(base)}\n`);
    assert.equal(t.id, 'STF-RG-10');
    assert.equal(t.dataJulgamento, '2013-03-21');
    assert.equal(t.dataAutuacao, null);
    assert.equal(t.tese, 'É inconstitucional a norma X.');
    assert.equal(dataBr('-'), null);
  });

  it('data fora do formato, data inexistente, número repetido ou coluna que sumiu: a leitura falha', () => {
    assert.throws(() => dataBr('2013-03-21'), /fora do formato/);
    assert.throws(() => dataBr('31/02/2013'), /data inexistente/);
    assert.throws(() => lerTemasRg(`${CABECALHO}\n${linha(base)}\n${linha(base)}\n`), /repetido/);
    assert.throws(() => lerTemasRg(`${CABECALHO}\n${linha({ ...base, 'Número tema': 'x' })}\n`), /número de tema inválido/);
    const semTese = CABECALHO.split(',').filter(c => c !== 'Tese');
    assert.throws(() => lerTemasRg(`${semTese.join(',')}\n${semTese.map(() => '"1"').join(',')}\n`), /faltam colunas Tese/);
  });

  it('o que entra no grafo: repercussão reconhecida com tese (precedente) ou mérito pendente (tema); negada, cancelada e em análise só se o STJ cita', () => {
    const t = (sobre: Record<string, string>): TemaRgStf => lerTemasRg(`${CABECALHO}\n${linha({ ...base, ...sobre })}\n`)[0];
    assert.equal(classificarTemaRg(t({})), 'precedente');
    assert.equal(classificarTemaRg(t({ 'Situação repercussão geral': 'RG reconhecida - mérito pendente', Tese: '-' })), 'tema');
    assert.equal(classificarTemaRg(t({ 'Situação repercussão geral': 'RG reconhecida - mérito julgado', Tese: '-' })), null, 'julgado sem tese no arquivo');
    assert.equal(classificarTemaRg(t({ 'Situação repercussão geral': 'RG reconhecida - mérito julgado', Tese: '-' }), true), 'tema', '...mas entra se o STJ o cita');
    assert.equal(classificarTemaRg(t({ 'Situação repercussão geral': 'RG negada - matéria infraconstitucional' })), null);
    assert.equal(classificarTemaRg(t({ 'Situação repercussão geral': 'RG negada - matéria infraconstitucional' }), true), 'tema');
    assert.equal(classificarTemaRg(t({ 'Status Tema': 'Cancelado', 'Situação repercussão geral': '**Cancelado**' }), true), null, 'cancelado nunca entra');
    assert.equal(classificarTemaRg(t({ 'Situação repercussão geral': 'Em análise de RG' }), true), null);
  });
});

describe('Corpus do STF no repositório (F4-02)', () => {
  const temas = carregarTemasRgStf();
  const m = manifestoStf();

  it('os bytes conferem com o manifesto (SHA-256); um tema por número, de 1 em diante', () => {
    assert.match(m.arquivos[0].sha256, /^[0-9a-f]{64}$/);
    assert.equal(m.paginaUrl, 'https://transparencia.stf.jus.br/extensions/dados_abertos/dados_abertos.html');
    assert.ok(temas.length > 1400);
    assert.equal(temas[0].numero, 1);
    assert.equal(new Set(temas.map(t => t.id)).size, temas.length);
  });

  it('Tema 1255 (honorários por equidade): repercussão reconhecida, mérito pendente, sem tese; o STJ o liga ao seu Tema 1076', () => {
    const t = temas.find(x => x.numero === 1255)!;
    assert.equal(t.situacaoRg, 'RG reconhecida - mérito pendente');
    assert.equal(t.tese, null);
    assert.match(t.titulo, /apreciação equitativa/);
    assert.equal(t.processoParadigma, 'RE 1412069');
    const stj = nosDosPrecedentesStj(carregarPrecedentesStj(), manifestoStj());
    const nosStf = nosDosTemasStf(temas, m, undefined, temasStfCitadosPeloStj(stj));
    const no = nosStf.find(n => n.id === 'STF-RG-1255')!;
    assert.equal(no.tipo, 'tema');
    assert.equal(no.tribunal, 'STF');
    assert.match(no.descricao, /apreciação equitativa/);
    assert.ok((stj.find(n => n.id === 'STJ-TEMA-1076')!.detalhes.repercussaoGeral as Array<{ numero: string }>).some(r => r.numero === '1255'));
  });

  it('nós: id único, fonte com a página do STF e a data de entrada, visíveis; tese só em precedente; toda ligação do STJ tem a ponta no STF', () => {
    const stj = nosDosPrecedentesStj(carregarPrecedentesStj(), manifestoStj());
    const citados = temasStfCitadosPeloStj(stj);
    const nos = nosDosTemasStf(temas, m, undefined, citados);
    assert.equal(new Set(nos.map(n => n.id)).size, nos.length);
    assert.ok(nos.every(n => /^STF-RG-\d+$/.test(n.id) && n.tribunal === 'STF' && n.fontes[0].url === m.paginaUrl && n.fontes[0].lidoEm === m.lidoEm && noVisivel(n)));
    assert.ok(nos.filter(n => n.tipo === 'precedente').every(n => (n.detalhes as { teseFirmada: boolean }).teseFirmada));
    const ids = new Set(nos.map(n => n.id));
    const faltando = [...citados].filter(n => !ids.has(`STF-RG-${n}`));
    assert.deepEqual(faltando, [], 'todo tema do STF citado pelo STJ existe no arquivo e entra no grafo');
    assert.ok(nos.length > 900);
  });
});
