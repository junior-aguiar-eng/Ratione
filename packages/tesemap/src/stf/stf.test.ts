import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { carregarPrecedentesStj, manifestoStj } from '../stj';
import { nosDosPrecedentesStj, nosDosTemasStf, temasStfCitadosPeloStj, noVisivel } from '../banco';
import { carregarAplicacaoStf, carregarTemasRgStf, manifestoStf } from './index';
import { LIMIAR_DE_APLICACAO, classificarTemaRg, dataBr, lerTemasRg, type TemaRgStf } from './repercussao';
import { agregarAplicacao } from './aplicacao';

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

describe('Aplicação dos temas de repercussão geral (F4-02)', () => {
  const CAB = 'idFatoDecisao,Processo,Andamento decisão,Observação do andamento,Ano da decisão,Data da decisão';
  const csv = (...l: string[]) => Buffer.from(`${CAB}\n${l.join('\n')}\n`, 'utf-8');
  const l = (id: string, andamento: string, obs: string, ano = '2025', data = '05/11/2025 00:00:00') => `${id},RE 1,"${andamento}","${obs}",${ano},${data}`;

  it('conta 1 por tema distinto citado em decisão de devolução; ignora outros andamentos, "*NI*" e tema inexistente; dedup por id', () => {
    const r = agregarAplicacao(
      [
        {
          nomeOriginal: 'a.csv',
          bytes: csv(
            l('1', 'Determinada a devolução pelo regime da repercussão geral', 'Tema nº 100 - RE 586068, Tema nº 360 - RE 611503'),
            l('2', 'Determinada a devolução pelo regime da repercussão geral', 'Tema nº 100 - RE 1, Tema nº 100 - RE 2', '2026', '01/02/2026 00:00:00'),
            l('3', 'Determinada a devolução', '*NI*'),
            l('4', 'Determinada a devolução', 'Tema nº 1500 - RE 3'),
            l('5', 'Negado seguimento', 'Tema nº 100 - citado fora de devolução'),
            l('1', 'Determinada a devolução', 'Tema nº 100 - mesma decisão repetida em outro arquivo')
          )
        }
      ],
      1494,
      '2026-10-22'
    );
    assert.equal(r.decisoesLidas, 5, 'o id repetido não conta duas vezes');
    assert.equal(r.devolucoes, 4);
    assert.equal(r.devolucoesComTema, 3);
    assert.equal(r.citacoesDescartadas, 1);
    assert.deepEqual(r.porTema['100'], { total: 2, porAno: { '2025': 1, '2026': 1 } });
    assert.deepEqual(r.porTema['360'], { total: 1, porAno: { '2025': 1 } });
    assert.equal(r.porTema['1500'], undefined, 'tema acima do maior que o arquivo de repercussão geral conhece');
    assert.equal(r.arquivos[0].decisoes, 5);
    assert.match(r.arquivos[0].sha256, /^[0-9a-f]{64}$/);
    assert.deepEqual(r.periodo, { de: '2025-11-05', ate: '2026-02-01' });
  });

  it('ano com bem menos decisões que a mediana é apontado como possivelmente incompleto; coluna que sumiu derruba a leitura', () => {
    const muitas = (ano: string, n: number) => Array.from({ length: n }, (_, i) => l(`${ano}-${i}`, 'Negado seguimento', '-', ano, `01/01/${ano} 00:00:00`));
    const r = agregarAplicacao([{ nomeOriginal: 'a.csv', bytes: csv(...muitas('2022', 10), ...muitas('2023', 10), ...muitas('2024', 2), ...muitas('2025', 10)) }], 1494, '2026-10-22');
    assert.deepEqual(r.anosPossivelmenteIncompletos, ['2024']);
    assert.throws(() => agregarAplicacao([{ nomeOriginal: 'b.csv', bytes: Buffer.from('idFatoDecisao,Processo\n1,RE 1\n') }], 1494, '2026-10-22'), /faltam colunas/);
  });

  it('corpus agregado: 443.884 decisões de 2020 a 2026, 2024 incompleto, Tema 660 o mais aplicado; sem arquivos brutos no repositório', () => {
    const a = carregarAplicacaoStf()!;
    assert.equal(a.arquivos.length, 3);
    assert.ok(a.arquivos.every(x => /^[0-9a-f]{64}$/.test(x.sha256)));
    assert.equal(a.decisoesLidas, a.arquivos.reduce((s, x) => s + x.decisoes, 0));
    assert.equal(a.decisoesLidas, 443884);
    assert.deepEqual(a.anosPossivelmenteIncompletos, ['2024']);
    assert.ok(a.periodo.de.startsWith('2020') && a.periodo.ate.startsWith('2026'));
    const top = Object.entries(a.porTema).sort((x, y) => y[1].total - x[1].total)[0];
    assert.equal(top[0], '660');
    assert.equal(top[1].total, Object.values(top[1].porAno).reduce((s, n) => s + n, 0));
    assert.ok(Object.keys(a.porTema).every(t => Number(t) >= 1 && Number(t) <= 1494));
  });

  it('todo tema não cancelado aplicado ao menos 50 vezes está no grafo, com a repercussão negada que tiver', () => {
    const a = carregarAplicacaoStf()!;
    const temas = new Map(carregarTemasRgStf().map(t => [t.numero, t]));
    const ids = new Set(nosDosTemasStf([...temas.values()], manifestoStf(), undefined, new Set(), a).map(n => n.id));
    const devidos = Object.entries(a.porTema).filter(([n, v]) => v.total >= LIMIAR_DE_APLICACAO && classificarTemaRg(temas.get(Number(n))!, true));
    assert.ok(devidos.length > 80);
    assert.deepEqual(devidos.filter(([n]) => !ids.has(`STF-RG-${n}`)), []);
    const cancelados = Object.keys(a.porTema).filter(n => /cancelad/i.test(temas.get(Number(n))!.situacaoRg + temas.get(Number(n))!.status));
    assert.deepEqual(cancelados.filter(n => ids.has(`STF-RG-${n}`)), [], 'cancelado nunca entra, mesmo aplicado');
  });

  it('o nó do tema leva a contagem (total, por ano, período e anos incompletos); sem contagem gerada, o nó não tem o campo', () => {
    const a = carregarAplicacaoStf()!;
    const temas = carregarTemasRgStf();
    const com = nosDosTemasStf(temas, manifestoStf(), undefined, new Set(), a);
    const t660 = com.find(n => n.id === 'STF-RG-660')!;
    assert.equal((t660.detalhes.aplicacao as { total: number }).total, a.porTema['660'].total);
    assert.deepEqual((t660.detalhes.aplicacao as { anosPossivelmenteIncompletos: string[] }).anosPossivelmenteIncompletos, ['2024']);
    const t660sem = nosDosTemasStf(temas, manifestoStf(), undefined, new Set()).find(n => n.id === 'STF-RG-660');
    assert.equal(t660sem, undefined, 'sem a contagem, o Tema 660 (repercussão negada) não entra');
    assert.equal(t660.tipo, 'tema');
    assert.match(String(t660.detalhes.situacao), /RG negada/);
    const sem = nosDosTemasStf(temas, manifestoStf(), undefined, new Set(), null);
    assert.equal(sem.find(n => n.id === 'STF-RG-339')!.detalhes.aplicacao, undefined, 'sem contagem gerada, o nó não tem o campo');
    assert.equal(com.find(n => n.id === 'STF-RG-1255')!.detalhes.aplicacao !== undefined, true, 'tema sem devolução registrada leva total 0, não some');
  });
});
