import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { lerCsv } from './csv';
import { lerPrecedentes } from './precedentes';
import { carregarPrecedentesStj, manifestoStj, paraPrecedenteDoNucleo } from './corpus';

const TEMAS_CAB =
  'sequencialPrecedente,tipoPrecedente,numeroPrecedente,dataPrimeiraAfetacao,dataJulgamento,dataPublicacaoAcordao,situacao,informacoesComplementares,questaoSubmetidaAJulgamento,teseFirmada,anotacoesNUGEPNAC,delimitacaoJulgado,entendimentoAnterior,referenciaLegislativa,referenciaSumular,sumulaOriginada,audienciaPublica,dataAudienciaPublica,orgaoJulgador,Assuntos,numeroRepercussaoGeralSTF,descricaoRepercussaoGeral';
const PROC_CAB =
  'sequencialPrecedente,tipoPrecedente,numeroPrecedente,Processo,numeroRegistro,ministroRelator,leadingCase,dataAfetacao,dataPublicacaoAfetacao,observacaoAfetacao,NOME_MINISTRO_AFETACAO,dataVistaMPF,dataJulgamento,dataPbulicacaoAcordao,processoSTF,dataRemessaSTF,situacaoProcessoSTF,tribunalOrigem,siglaTribunalOrigem,siglaRegiaoOrigem,origemUF,tipoJusticaOrigem,quantidadeProcessosSuspensoNaOrigem,dataPublicacaoEmbargosDeDeclaração,Desafetação,Embargos de Divergência';

const tema = (c: Record<string, string>) =>
  TEMAS_CAB.split(',').map(k => (k in c ? `"${c[k].replace(/"/g, '""')}"` : '')).join(',');

describe('Leitor de CSV (F4-01)', () => {
  it('campo entre aspas com vírgula, quebra de linha e aspas duplicadas; BOM e CRLF', () => {
    const r = lerCsv('﻿a,b,c\r\n1,"x, y","linha 1\nlinha 2 ""citada"""\r\n2,,\r\n');
    assert.deepEqual(r, [
      { a: '1', b: 'x, y', c: 'linha 1\nlinha 2 "citada"' },
      { a: '2', b: '', c: '' }
    ]);
  });

  it('linha com número de campos errado ou aspas sem fechamento: erro, não dado torto', () => {
    assert.throws(() => lerCsv('a,b\n1,2,3\n'), /linha 2 tem 3 campos/);
    assert.throws(() => lerCsv('a,b\n1,"2\n'), /aspas sem fechamento/);
  });
});

describe('Precedentes qualificados do STJ (F4-01)', () => {
  const base = { sequencialPrecedente: '3020', tipoPrecedente: 'Tema', numeroPrecedente: '1076', dataJulgamento: '2022-03-16', situacao: 'Acórdão Publicado - RE Pendente', teseFirmada: 'i) A fixação...' };
  const procs = `${PROC_CAB}\n3020,,1076,REsp 1906623,202003012345,"MIN. TESTE",S,2020-12-04,,,,,2022-03-16,2022-05-31,RE 1,,,Tribunal Regional Federal da 3ª Região,TRF3,SE,SP,Justiça Federal,0,,N,\n`;

  it('junta as linhas repetidas, somando os Temas de Repercussão Geral do STF, e liga os processos', () => {
    const csv = `${TEMAS_CAB}\n${tema({ ...base, numeroRepercussaoGeralSTF: '1255', descricaoRepercussaoGeral: 'Honorários' })}\n${tema({ ...base, numeroRepercussaoGeralSTF: '1256', descricaoRepercussaoGeral: 'Outro' })}\n${tema({ ...base, numeroRepercussaoGeralSTF: '1255', descricaoRepercussaoGeral: 'Honorários' })}\n`;
    const [p] = lerPrecedentes(csv, procs);
    assert.equal(p.id, 'STJ-TEMA-1076');
    assert.deepEqual(p.repercussaoGeral.map(x => x.numero), ['1255', '1256']);
    assert.equal(p.processos.length, 1);
    assert.equal(p.processos[0].leadingCase, true);
    assert.equal(p.processos[0].siglaTribunalOrigem, 'TRF3');
    assert.equal(p.cancelado, false);
    assert.equal(p.dataPrimeiraAfetacao, null);
  });

  it('tipo desconhecido, número inválido, data inexistente ou coluna que sumiu: a leitura falha', () => {
    assert.throws(() => lerPrecedentes(`${TEMAS_CAB}\n${tema({ ...base, tipoPrecedente: 'Súmula' })}\n`, procs), /Invalid option|Invalid/i);
    assert.throws(() => lerPrecedentes(`${TEMAS_CAB}\n${tema({ ...base, numeroPrecedente: 'x' })}\n`, procs), /número inválido/);
    assert.throws(() => lerPrecedentes(`${TEMAS_CAB}\n${tema({ ...base, dataJulgamento: '2022-02-30' })}\n`, procs), /data inexistente/);
    const semTese = TEMAS_CAB.split(',').filter(c => c !== 'teseFirmada');
    const linha = semTese.map(() => '"1"').join(',');
    assert.throws(() => lerPrecedentes(`${semTese.join(',')}\n${linha}\n`, procs), /faltam colunas teseFirmada/);
  });

  it('adaptador para o núcleo: só tema ou IAC com tese e não cancelado', () => {
    const csv = `${TEMAS_CAB}\n${tema(base)}\n${tema({ ...base, sequencialPrecedente: '1', numeroPrecedente: '5', teseFirmada: '' })}\n${tema({ ...base, sequencialPrecedente: '2', numeroPrecedente: '6', situacao: 'Cancelada' })}\n${tema({ ...base, sequencialPrecedente: '3', tipoPrecedente: 'Controvérsia', numeroPrecedente: '7' })}\n`;
    const ps = lerPrecedentes(csv, procs);
    const m = manifestoStj();
    assert.deepEqual(ps.map(p => [p.id, paraPrecedenteDoNucleo(p, m)?.id ?? null]), [
      ['STJ-CONTROVERSIA-7', null],
      ['STJ-TEMA-5', null],
      ['STJ-TEMA-6', null],
      ['STJ-TEMA-1076', 'STJ-TEMA-1076']
    ]);
  });
});

describe('Corpus do STJ no repositório (F4-01)', () => {
  const todos = carregarPrecedentesStj();
  const m = manifestoStj();

  it('os bytes conferem com o manifesto (SHA-256), que registra conjunto, licença, URLs e datas', () => {
    assert.match(m.licenca, /Creative Commons/);
    assert.equal(m.arquivos.length, 2);
    assert.ok(m.arquivos.every(a => /^[0-9a-f]{64}$/.test(a.sha256) && a.url.startsWith('https://dadosabertos.web.stj.jus.br/')));
    assert.match(m.lidoEm, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(todos.length > 2000);
  });

  it('invariantes: id único, tipo conhecido, tese só quando há texto, cancelado coerente com a situação', () => {
    assert.equal(new Set(todos.map(p => p.id)).size, todos.length);
    assert.ok(todos.every(p => /^STJ-(TEMA|CONTROVERSIA|IAC|SIRDR|PUIL)-\d+$/.test(p.id)));
    assert.ok(todos.every(p => p.tese === null || p.tese.length > 0));
    assert.ok(todos.every(p => p.cancelado === /^cancelad[oa]$/i.test(p.situacao)));
  });

  it('Tema 1076 (honorários por equidade): tese, órgão, repercussão geral 1255 e processos, como no grafo curado do TeseMap', () => {
    const p = todos.find(x => x.id === 'STJ-TEMA-1076')!;
    assert.match(p.tese!, /apreciação equitativa/);
    assert.equal(p.orgaoJulgador, 'CE');
    assert.equal(p.dataJulgamento, '2022-03-16');
    assert.ok(p.repercussaoGeral.some(r => r.numero === '1255'));
    assert.ok(p.processos.length >= 2);
    const nucleo = paraPrecedenteDoNucleo(p, m)!;
    assert.equal(nucleo.tipo, 'stj_repetitivo');
    assert.equal(nucleo.numeroOuTema, 'Tema 1076');
    assert.equal(nucleo.procedencia.fontes[0].lidoEm, m.lidoEm);
  });
});
