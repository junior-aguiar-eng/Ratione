import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { prepararDecisao } from '@ratione/argumenta';
import { citacaoNosParagrafos, medir, montarPares, relatorioDaRelacao, type FonteResolvida, type ResultadoDoPar } from './relacao';
import type { CasoValidado } from './caso';
import type { Etapa } from './executarCaso';
import type { SaidaRelacao } from '../ia/tarefas/relacionarComOCaso';

const texto = (...p: string[]) => p.join('\n\n');

function caso(id: string, paragrafos: string[], questoes: Array<{ paragrafos: number[] }>, citacoes: string[]): CasoValidado {
  return {
    id,
    fonte: { descricao: 'x', url: 'https://exemplo.gov.br', acessadoEm: '2026-11-01' },
    tipo: 'sentenca',
    texto: texto(...paragrafos),
    gabarito: {
      dispositivo: { inicio: 1, fim: 1 },
      questoes: questoes.map((q, i) => ({ enunciado: `Pergunta ${i + 1} de ${id}?`, conclusao: 'Sim.', paragrafos: q.paragrafos })),
      citacoes
    },
    validacao: { por: 'Revisor Teste', em: '2026-11-01' }
  } as CasoValidado;
}

const FONTE = (citacao: string, ferramenta: FonteResolvida['ferramenta'], destinoId: string): FonteResolvida => ({ citacao, ferramenta, destinoId });

describe('Medição da relação: pares do corpus', () => {
  const longo = 'a'.repeat(120);
  const A = caso('caso-a', [`Primeiro. ${longo}`, `O réu foi revel, art. 344 do CPC. ${longo}`, `Honorários pelo Tema 1076 do STJ. ${longo}`], [{ paragrafos: [2] }, { paragrafos: [3] }], ['art. 344 do CPC', 'Tema 1076 do STJ']);
  const B = caso('caso-b', [`Dano moral. ${longo}`, `Aplica-se a Súmula 479 do STJ ao banco. ${longo}`], [{ paragrafos: [2] }], ['Súmula 479 do STJ']);
  const fontes = new Map([
    ['art. 344 do CPC', FONTE('art. 344 do CPC', 'normaviva', 'CPC|corpo|art. 344')],
    ['Tema 1076 do STJ', FONTE('Tema 1076 do STJ', 'tesemap', 'STJ-TEMA-1076')],
    ['Súmula 479 do STJ', FONTE('Súmula 479 do STJ', 'tesemap', 'STJ-SUMULA-479')]
  ]);

  it('a citação conta só se está escrita nos parágrafos da questão', () => {
    assert.equal(citacaoNosParagrafos('Tema 1076 do STJ', ['Honorários pelo TEMA 1076 do STJ.']), true);
    assert.equal(citacaoNosParagrafos('Tema 1076 do STJ', ['Outro assunto.']), false);
    assert.equal(citacaoNosParagrafos('CF', ['CF/88']), false, 'citação curta demais não vale');
  });

  it('positivos: cada questão com as fontes que a decisão escreveu nos parágrafos dela', () => {
    const pares = montarPares([A, B], fontes, { porQuestao: 3, maximo: 100 }).filter(p => p.esperado === 'aplica');
    assert.deepEqual(
      pares.map(p => `${p.casoId} ${p.questaoId} ${p.fonte.citacao}`),
      ['caso-a Q1 art. 344 do CPC', 'caso-a Q2 Tema 1076 do STJ', 'caso-b Q1 Súmula 479 do STJ']
    );
  });

  it('negativos: um por positivo, com fonte de outro caso que não aparece na questão nem no caso', () => {
    const pares = montarPares([A, B], fontes, { porQuestao: 3, maximo: 100 });
    const negativos = pares.filter(p => p.esperado === 'nao_aplica');
    assert.equal(negativos.length, 3);
    for (const n of negativos) {
      const doCaso = n.casoId === 'caso-a' ? ['art. 344 do CPC', 'Tema 1076 do STJ'] : ['Súmula 479 do STJ'];
      assert.ok(!doCaso.includes(n.fonte.citacao), `${n.casoId} ${n.questaoId}: ${n.fonte.citacao}`);
    }
  });

  it('é repetível e respeita o máximo, mantendo metade de cada lado', () => {
    const a = montarPares([A, B], fontes, { porQuestao: 3, maximo: 4 });
    assert.deepEqual(a, montarPares([A, B], fontes, { porQuestao: 3, maximo: 4 }));
    assert.equal(a.length, 4);
    assert.equal(a.filter(p => p.esperado === 'aplica').length, 2);
  });

  it('usa os parágrafos como o sistema os segmenta', () => {
    assert.ok(prepararDecisao(A.texto).paragrafos.length >= 3);
  });
});

describe('Medição da relação: taxas e relatório', () => {
  const par = (esperado: 'aplica' | 'nao_aplica') => ({ casoId: 'c', questaoId: 'Q1', enunciado: 'P?', conclusao: 'S.', fonte: FONTE('art. 1', 'normaviva', 'X'), esperado });
  const ok = (relacao: SaidaRelacao['relacao']): Etapa<SaidaRelacao> => ({ estado: 'ok', saida: { relacao, resumo: 'r', trecho: 't', limite: 'l' }, custoUsd: 0.004 });
  const descartada: Etapa<SaidaRelacao> = { estado: 'descartada', saida: null, motivo: 'trecho não está na fonte', custoUsd: 0.004 };
  const resultados: ResultadoDoPar[] = [
    { par: par('aplica'), etapa: ok('aplica') },
    { par: par('aplica'), etapa: ok('aplica') },
    { par: par('aplica'), etapa: ok('distingue') },
    { par: par('aplica'), etapa: descartada },
    { par: par('nao_aplica'), etapa: ok('outro_ponto') },
    { par: par('nao_aplica'), etapa: ok('aplica') },
    { par: par('nao_aplica'), etapa: { estado: 'nao_rodou', saida: null, custoUsd: 0 } }
  ];

  it('conta cada lado, os descartados e o custo; o que não rodou fica de fora', () => {
    const m = medir(resultados);
    assert.deepEqual(m.positivos, { total: 4, aplica: 2, distingue: 1, outroPonto: 0 });
    assert.deepEqual(m.negativos, { total: 2, aplica: 1, distingue: 0, outroPonto: 1 });
    assert.equal(m.descartados, 1);
    assert.equal(m.chamadas, 6);
    assert.equal(m.custoUsd, 0.024);
  });

  it('o relatório traz as taxas e cada par', () => {
    const r = relatorioDaRelacao(resultados, 'claude-haiku-5-5', '2026-11-05');
    assert.match(r, /Acerto nos positivos:\*\* 67%/);
    assert.match(r, /Falso "aplica" nos negativos:\*\* 50%/);
    assert.match(r, /Descartados.*1 de 6/);
    assert.match(r, /\(descartada: trecho não está na fonte\)/);
  });
});
