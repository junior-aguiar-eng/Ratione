import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AVISOS_DO_DOCUMENTO, montarDocumento, nomeDoArquivo, type EntradaDoDocumento } from './documento';
import { montarDocx } from './baixarDocx';
import type { VerificacaoDaCitacao } from './verificarCitacoes';

const selos = new Map<string, VerificacaoDaCitacao>([['CPC, art. 85', { estado: 'encontrada', links: [] }], ['Lei X, art. 1', { estado: 'nao_localizada', links: [] }]]);

function entrada(sobre: Partial<EntradaDoDocumento> = {}): EntradaDoDocumento {
  return {
    estrutura: { tipo: 'sentenca', resultado: 'Pedido de [PESSOA_1] procedente', resumo: 'Resumo sobre [PESSOA_1].', pedidos: [{ descricao: 'Indenização a [PESSOA_1]', paragrafos: [1] }], secoes: [{ tipo: 'dispositivo', inicio: 1, fim: 1 }] },
    questoes: {
      questoes: [
        { id: 'Q1', categoria: 'merito', enunciado: 'Cabe indenização a [PESSOA_1]?', conclusao: 'Cabe.', resultado: 'acolhida', paragrafos: [1], paragrafosConclusao: [1] },
        { id: 'Q2', categoria: 'preliminar', enunciado: 'Há ilegitimidade?', conclusao: 'Não há.', resultado: 'rejeitada', paragrafos: [1], paragrafosConclusao: [1] }
      ]
    } as never,
    fundamentos: {
      fundamentos: [
        { questao: 'Q1', tipo: 'norma', descricao: 'Honorários de [PESSOA_1]', citacao: 'CPC, art. 85', paragrafos: [1] },
        { questao: 'Q1', tipo: 'norma', descricao: 'Outra lei', citacao: 'Lei X, art. 1', paragrafos: [1] },
        { questao: 'Q1', tipo: 'argumento', descricao: 'Sem citação', citacao: '', paragrafos: [1] }
      ]
    } as never,
    selos,
    restaurar: t => t.replaceAll('[PESSOA_1]', 'Maria Silva'),
    geradoEm: '06/11/2026',
    ...sobre
  };
}

describe('Documento da análise (F5-09)', () => {
  it('devolve os nomes reais, traz os avisos e a conferência de cada citação', () => {
    const d = montarDocumento(entrada());
    assert.strictEqual(d.resultado, 'Pedido de Maria Silva procedente');
    assert.strictEqual(d.tipo, 'Sentença');
    assert.deepStrictEqual(d.pedidos, ['Indenização a Maria Silva']);
    assert.deepStrictEqual(d.avisos, AVISOS_DO_DOCUMENTO);
    assert.ok(d.avisos[0].includes('nomes reais') && d.avisos[0].includes('não foi enviado'));
    const [q1, q2] = d.questoes;
    assert.strictEqual(q1.cabecalho, 'Questão 1 · Mérito');
    assert.strictEqual(q1.resultado, 'Acolhida');
    assert.strictEqual(q1.enunciado, 'Cabe indenização a Maria Silva?');
    assert.deepStrictEqual(q1.fundamentos?.map(f => [f.rotulo, f.descricao, f.conferencia.split(' (')[0]]), [
      ['Norma', 'Honorários de Maria Silva', 'Encontrada na base do Ratione'],
      ['Norma', 'Outra lei', 'Não localizada na base do Ratione'],
      ['Argumento', 'Sem citação', '']
    ]);
    assert.deepStrictEqual(q2.fundamentos, []);
  });

  it('sem a etapa dos fundamentos, não afirma que a questão não tem fundamento', () => {
    const d = montarDocumento(entrada({ fundamentos: undefined }));
    assert.strictEqual(d.questoes[0].fundamentos, null);
  });

  it('sem questões, o documento traz só a visão geral', () => {
    assert.deepStrictEqual(montarDocumento(entrada({ questoes: undefined, fundamentos: undefined })).questoes, []);
  });

  it('o nome do arquivo leva só a data, nunca o rótulo digitado pela pessoa', () => {
    assert.strictEqual(nomeDoArquivo('2026-11-06'), 'analise-da-decisao-2026-11-06');
  });

  it('o Word é um arquivo .docx válido (ZIP) com o conteúdo do documento', async () => {
    const blob = await montarDocx(montarDocumento(entrada()));
    assert.strictEqual(blob.type, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    const bytes = new Uint8Array(await blob.arrayBuffer());
    assert.deepStrictEqual([...bytes.slice(0, 2)], [0x50, 0x4b], 'começa com PK');
    const { default: JSZip } = await import('jszip');
    const xml = await (await JSZip.loadAsync(bytes)).file('word/document.xml')!.async('string');
    for (const trecho of ['Maria Silva', 'Questão 1', 'Encontrada na base do Ratione', 'nomes reais']) assert.ok(xml.includes(trecho), `falta "${trecho}" no Word`);
    assert.ok(!xml.includes('[PESSOA_1]'), 'sem marcadores');
  });
});
