import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { decisaoColegiada, decisaoDeMerito, lerDecisoesControle, processosComMerito, type DecisaoControle } from './controle';
import { carregarControleStf, manifestoStf } from './corpus';
import { nosDoControleConcentrado } from '../banco/nos-stf';

const CABECALHO = 'Processo,Data,Descrição,Andamento agrupado,Subgrupo,Observação';
const linha = (processo: string, data: string, andamento: string, texto: string, subgrupo = 'Decisão Final') => `${processo},${data},${andamento},${andamento},${subgrupo},"${texto.replace(/"/g, '""')}"`;
const decisao = (sobre: Partial<DecisaoControle>): DecisaoControle => ({ classe: 'ADI', numero: 1, data: '2020-01-01', descricao: '', andamento: 'Procedente', subgrupo: 'Decisão Final', texto: 'Decisão: O Tribunal julgou procedente.', ...sobre });

describe('Controle concentrado do STF: leitura (F4-02)', () => {
  it('lê processo, data, andamento, subgrupo e texto; "-" vira data nula e texto de preenchimento vira nulo', () => {
    const [a, b] = lerDecisoesControle([CABECALHO, linha('ADPF 54', '12/04/2012', 'Procedente', 'Decisão: O Tribunal, por maioria, julgou procedente a ação.'), linha('ADC 39', '-', 'Deferido', '*NI*', 'Decisão Interlocutória')].join('\n'));
    assert.deepEqual([a.classe, a.numero, a.data, a.andamento, a.subgrupo], ['ADPF', 54, '2012-04-12', 'Procedente', 'Decisão Final']);
    assert.equal(b.data, null);
    assert.equal(b.texto, null);
  });

  it('recusa coluna faltando e processo de outra classe', () => {
    assert.throws(() => lerDecisoesControle('Processo,Data\nADI 1,01/01/2020'), /faltam colunas/);
    assert.throws(() => lerDecisoesControle([CABECALHO, linha('RE 1', '01/01/2020', 'Procedente', 'x')].join('\n')), /não reconhecido/);
  });

  it('colegiada pela fórmula do Plenário, mesmo com "julgo" digitado por engano; monocrática em primeira pessoa ou pelo art. 21 do RISTF', () => {
    assert.equal(decisaoColegiada(decisao({ texto: 'Decisão: O Tribunal, por maioria, julgo improcedente a ação direta.' })), true);
    assert.equal(decisaoColegiada(decisao({ texto: 'Decisão: Julgou-se procedente a ação direta. Presidiu o julgamento o Ministro X (art. 37, I, do RISTF).' })), true);
    assert.equal(decisaoColegiada(decisao({ texto: 'Declarou a inconstitucionalidade do art. 5º do Regimento Interno da Assembleia Legislativa.' })), true);
    assert.equal(decisaoColegiada(decisao({ texto: 'Diante do exposto, homologo os planos. Submeta-se a presente decisão a referendo do Plenário.' })), false);
    assert.equal(decisaoColegiada(decisao({ texto: 'Ex positis, com esteio no art. 21, §1º, do RISTF, julgo procedente.' })), false);
  });

  it('decisão de mérito: a colegiada antes da monocrática, a mais recente antes da antiga, texto real antes do preenchimento', () => {
    // ADPF 347: a homologação monocrática de 2025 não toma o lugar do mérito do Plenário de 2023
    const plenario = decisao({ data: '2023-10-04', andamento: 'Procedente em parte', texto: 'Decisão: O Tribunal, por maioria, julgou parcialmente procedente.' });
    const homologacao = decisao({ data: '2025-10-17', texto: 'Diante do exposto, homologo integralmente os planos.' });
    assert.equal(decisaoDeMerito([homologacao, plenario]), plenario);
    // ADI 6720: o pedido de amicus curiae rotulado "Procedente" (antes) perde para o mérito (depois)
    const amicus = decisao({ data: '2021-04-13', texto: 'O pedido do PDT de ingresso no feito na condição de amicus curiae foi admitido.' });
    const merito = decisao({ data: '2021-09-27', andamento: 'Procedente em parte', texto: 'Decisão: O Tribunal, por maioria, converteu o referendo em julgamento de mérito.' });
    assert.equal(decisaoDeMerito([amicus, merito]), merito);
    assert.equal(decisaoDeMerito([decisao({ texto: null, data: '2026-10-21' }), decisao({ data: '2026-10-21' })])!.texto, 'Decisão: O Tribunal julgou procedente.');
    assert.equal(decisaoDeMerito([decisao({ andamento: 'Liminar deferida', subgrupo: 'Decisão Liminar' })]), null);
  });
});

describe('Controle concentrado no corpus (Transparência do STF, 22/10/2026)', () => {
  const processos = carregarControleStf();
  const porId = new Map(processos.map(p => [p.id, p]));

  it('4.008 processos com mérito: ADI, ADPF, ADC e ADO; quase todos colegiados', () => {
    assert.equal(processos.length, 4008);
    const conta = (c: string) => processos.filter(p => p.classe === c).length;
    assert.deepEqual([conta('ADI'), conta('ADPF'), conta('ADC'), conta('ADO')], [3611, 331, 38, 28]);
    assert.ok(processos.filter(p => p.colegiada).length > 3950);
  });

  it('casos conhecidos: ADPF 54 (2012), ADC 43 (2019), ADPF 347 com o mérito de 2023, ADI 5707 colegiada apesar do "julgo"', () => {
    assert.equal(porId.get('STF-ADPF-54')!.merito.data, '2012-04-12');
    assert.equal(porId.get('STF-ADC-43')!.merito.data, '2019-11-07');
    assert.equal(porId.get('STF-ADPF-347')!.merito.data, '2023-10-04');
    assert.equal(porId.get('STF-ADI-5707')!.colegiada, true);
    assert.equal(porId.get('STF-ADI-4675')!.colegiada, false);
  });

  it('nós: texto oficial da decisão, Plenário ou decisão monocrática, aviso quando o STF não traz o texto', () => {
    const nos = nosDoControleConcentrado(processos, manifestoStf());
    const n = new Map(nos.map(x => [x.id, x]));
    assert.equal(nos.length, 4008);
    const adpf54 = n.get('STF-ADPF-54')!;
    assert.equal(adpf54.rotulo, 'ADPF 54 do STF');
    assert.match(adpf54.descricao, /^Decisão: O Tribunal, por maioria/);
    assert.equal(adpf54.detalhes.orgaoJulgador, 'Plenário');
    assert.equal(adpf54.detalhes.dataJulgamento, '2012-04-12');
    assert.equal(adpf54.detalhes.linkOficial, 'https://portal.stf.jus.br/processos/listarProcessos.asp?classe=ADPF&numeroProcesso=54');
    assert.equal(n.get('STF-ADI-4675')!.detalhes.orgaoJulgador, 'Decisão monocrática');
    assert.match(n.get('STF-ADI-7812')!.descricao, /não traz o texto/);
    assert.equal(n.get('STF-ADI-7812')!.detalhes.textoDaDecisaoDisponivel, false);
  });
});
