import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CAMADAS, montarMapa } from './mapa';
import type { SaidaFundamentos, SaidaQuestoes } from '../ia/tarefas/argumenta';

type Questao = SaidaQuestoes['questoes'][number];
type Fundamento = SaidaFundamentos['fundamentos'][number];

const questao = (id: string, sobre: Partial<Questao> = {}): Questao => ({
  id,
  categoria: 'merito',
  enunciado: `Enunciado de ${id}?`,
  resultado: 'acolhida',
  conclusao: `Conclusão de ${id}.`,
  paragrafos: [1, 2],
  paragrafosConclusao: [3],
  ...sobre
});

const fundamento = (q: string, tipo: Fundamento['tipo'], descricao: string, citacao = '', paragrafos = [1]): Fundamento => ({
  questao: q,
  tipo,
  descricao,
  citacao,
  paragrafos
});

const QUESTOES = (...qs: Questao[]): SaidaQuestoes => ({ questoes: qs }) as SaidaQuestoes;
const FUNDAMENTOS = (...fs: Fundamento[]): SaidaFundamentos => ({ fundamentos: fs }) as SaidaFundamentos;

describe('F5-03: mapa de argumentos por código', () => {
  it('as camadas seguem a ordem do raciocínio e só aparecem as que têm passo', () => {
    const m = montarMapa(
      QUESTOES(questao('Q1')),
      FUNDAMENTOS(
        fundamento('Q1', 'argumento', 'A inércia corrobora a alegação.'),
        fundamento('Q1', 'precedente', 'Tema 793', 'Tema 793 do STF'),
        fundamento('Q1', 'fato', 'Réu não contestou.'),
        fundamento('Q1', 'norma', 'Revelia', 'CPC, art. 344'),
        fundamento('Q1', 'prova', 'Laudos médicos.')
      )
    );
    const q = m.questoes[0];
    assert.deepEqual(q.camadas.map(c => c.id), ['fatos', 'normas', 'precedentes', 'raciocinio']);
    assert.deepEqual(q.camadas[0].passos.map(p => p.tipo), ['fato', 'prova']); // fato e prova na mesma camada, na ordem em que vieram
    assert.equal(q.totalDePassos, 5);
    assert.equal(q.conclusao, 'Conclusão de Q1.');
    assert.deepEqual(q.paragrafosConclusao, [3]);
  });

  it('cada passo guarda a descrição, a citação e os parágrafos de origem como vieram', () => {
    const m = montarMapa(QUESTOES(questao('Q1')), FUNDAMENTOS(fundamento('Q1', 'norma', 'Revelia', 'CPC, art. 344', [7, 8])));
    assert.deepEqual(m.questoes[0].camadas[0].passos[0], { tipo: 'norma', descricao: 'Revelia', citacao: 'CPC, art. 344', paragrafos: [7, 8] });
  });

  it('fundamentos de uma questão não vão para outra', () => {
    const m = montarMapa(QUESTOES(questao('Q1'), questao('Q2')), FUNDAMENTOS(fundamento('Q1', 'fato', 'a'), fundamento('Q2', 'norma', 'b', 'CF, art. 5º')));
    assert.deepEqual(m.questoes.map(q => q.totalDePassos), [1, 1]);
    assert.deepEqual(m.questoes[0].camadas.map(c => c.id), ['fatos']);
    assert.deepEqual(m.questoes[1].camadas.map(c => c.id), ['normas']);
  });

  it('questão sem fundamento aparece sem camadas, e sem a etapa de fundamentos o mapa já mostra as teses', () => {
    const com = montarMapa(QUESTOES(questao('Q1')), FUNDAMENTOS());
    assert.equal(com.questoes[0].totalDePassos, 0);
    assert.deepEqual(com.questoes[0].camadas, []);
    const sem = montarMapa(QUESTOES(questao('Q1'), questao('Q2')), undefined);
    assert.equal(sem.questoes.length, 2);
    assert.deepEqual(sem.autoridades, []);
  });

  it('autoridades citadas: junta a mesma citação escrita igual, conta as questões e põe a mais usada primeiro', () => {
    const m = montarMapa(
      QUESTOES(questao('Q1'), questao('Q2'), questao('Q3')),
      FUNDAMENTOS(
        fundamento('Q1', 'norma', 'x', 'CF, art. 196'),
        fundamento('Q1', 'norma', 'y', 'CF,  art. 196'), // espaço a mais: é a mesma
        fundamento('Q2', 'precedente', 'z', 'Tema 793 do STF'),
        fundamento('Q3', 'norma', 'w', 'cf, art. 196'),
        fundamento('Q3', 'doutrina', 'd', 'Nery Jr.'),
        fundamento('Q3', 'fato', 'sem citação')
      )
    );
    assert.deepEqual(m.autoridades, [
      { citacao: 'CF, art. 196', tipo: 'norma', questoes: [1, 3] },
      { citacao: 'Tema 793 do STF', tipo: 'precedente', questoes: [2] },
      { citacao: 'Nery Jr.', tipo: 'doutrina', questoes: [3] }
    ]);
  });

  it('fato, prova e argumento não entram nas autoridades, mesmo com citação preenchida; sem citação, nada entra', () => {
    const m = montarMapa(
      QUESTOES(questao('Q1')),
      FUNDAMENTOS(fundamento('Q1', 'fato', 'a', 'Doc. 3'), fundamento('Q1', 'norma', 'b', ''), fundamento('Q1', 'argumento', 'c', 'algo'))
    );
    assert.deepEqual(m.autoridades, []);
  });

  it('totais por tipo de fundamento', () => {
    const m = montarMapa(QUESTOES(questao('Q1')), FUNDAMENTOS(fundamento('Q1', 'fato', 'a'), fundamento('Q1', 'fato', 'b'), fundamento('Q1', 'norma', 'c', 'CF, art. 1º')));
    assert.deepEqual(m.totais, { fato: 2, prova: 0, norma: 1, precedente: 0, doutrina: 0, argumento: 0 });
  });

  it('todo tipo de fundamento tem uma camada (nada some do mapa)', () => {
    const tipos = ['fato', 'prova', 'norma', 'precedente', 'doutrina', 'argumento'] as const;
    const cobertos = CAMADAS.flatMap(c => [...c.tipos]);
    for (const t of tipos) assert.ok(cobertos.includes(t), t);
    assert.equal(new Set(cobertos).size, cobertos.length, 'um tipo só em uma camada');
  });
});
