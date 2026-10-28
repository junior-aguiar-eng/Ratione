import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CasoSchema, ehValidado, problemasDoGabarito, type Gabarito } from './caso';
import { chaveDaCitacao, jaccard, medirCaso, medirCitacoes, medirDispositivo, medirQuestoes, taxa, totalizar, type SaidasDoCaso } from './metricas';

const GAB: Gabarito = {
  dispositivo: { inicio: 20, fim: 24 },
  questoes: [
    { enunciado: 'Há prescrição?', conclusao: 'Não houve.', paragrafos: [5, 6, 7] },
    { enunciado: 'O banco responde pela fraude?', conclusao: 'Responde.', paragrafos: [10, 11, 12, 13] }
  ],
  citacoes: ['CDC, art. 14', 'Súmula 479 do STJ']
};
const set = (...n: number[]) => new Set(n);

describe('F5-05: sobreposição', () => {
  it('jaccard de conjuntos', () => {
    assert.equal(jaccard(set(1, 2, 3), set(1, 2, 3)), 1);
    assert.equal(jaccard(set(1, 2), set(3, 4)), 0);
    assert.equal(jaccard(set(1, 2, 3, 4), set(3, 4, 5, 6)), 1 / 3);
    assert.equal(jaccard(set(), set()), 1);
  });
});

describe('F5-05: dispositivo', () => {
  const sec = (inicio: number, fim: number) => ({ secoes: [{ tipo: 'fundamentacao', inicio: 1, fim: 19 }, { tipo: 'dispositivo', inicio, fim }] });
  it('intervalo igual ou quase igual acerta', () => {
    assert.equal(medirDispositivo(sec(20, 24), GAB).acertou, true);
    assert.equal(medirDispositivo(sec(20, 25), GAB).acertou, true); // 5/6 ≥ 0,8
  });
  it('intervalo deslocado ou largo demais erra, mas conta como achado', () => {
    const m = medirDispositivo(sec(18, 30), GAB);
    assert.equal(m.achou, true);
    assert.equal(m.acertou, false);
  });
  it('sem seção de dispositivo, ou sem a etapa, não acerta', () => {
    assert.deepEqual(medirDispositivo({ secoes: [{ tipo: 'relatorio', inicio: 1, fim: 4 }] }, GAB), { achou: false, sobreposicao: 0, acertou: false });
    assert.equal(medirDispositivo(null, GAB).acertou, false);
  });
});

describe('F5-05: questões', () => {
  const q = (paragrafos: number[], conclusao: number[] = paragrafos.slice(-1)) => ({ paragrafos, paragrafosConclusao: conclusao });
  it('acha as esperadas por sobreposição, sem importar a ordem', () => {
    const r = medirQuestoes({ questoes: [q([10, 11, 12, 13]), q([5, 6, 7])] }, GAB);
    assert.deepEqual(r, { esperadas: 2, encontradas: 2, extras: 0 });
  });
  it('questão achada vale uma só esperada, e a que sobra é extra', () => {
    const r = medirQuestoes({ questoes: [q([5, 6, 7]), q([5, 6, 7]), q([40, 41])] }, GAB);
    assert.deepEqual(r, { esperadas: 2, encontradas: 1, extras: 2 });
  });
  it('sobreposição pequena não conta', () => {
    assert.equal(medirQuestoes({ questoes: [q([7, 30, 31, 32])] }, GAB).encontradas, 0);
  });
  it('sem a etapa, nenhuma é achada', () => {
    assert.deepEqual(medirQuestoes(null, GAB), { esperadas: 2, encontradas: 0, extras: 0 });
  });
});

describe('F5-05: citações', () => {
  it('iguala escritas diferentes da mesma citação', () => {
    assert.equal(chaveDaCitacao('CDC, art. 14'), chaveDaCitacao('art. 14 do CDC'));
    assert.equal(chaveDaCitacao('Súmula 479 do STJ'), chaveDaCitacao('Súmula nº 479/STJ'));
    assert.notEqual(chaveDaCitacao('CDC, art. 14'), chaveDaCitacao('CDC, art. 18'));
  });
  it('o que não se reconhece vale pelo texto, sem acento nem pontuação', () => {
    assert.equal(chaveDaCitacao('REsp 1.234.567/SP'), chaveDaCitacao('REsp 1234567 SP'));
    assert.equal(chaveDaCitacao('Doutrina: José   Silva'), chaveDaCitacao('doutrina jose silva'));
  });
  it('conta as esperadas achadas', () => {
    const saida = { fundamentos: [{ citacao: 'art. 14 do CDC' }, { citacao: '' }, { citacao: 'Súmula 7 do STJ' }] };
    assert.deepEqual(medirCitacoes(saida, GAB), { esperadas: 2, encontradas: 1 });
    assert.deepEqual(medirCitacoes(null, GAB), { esperadas: 2, encontradas: 0 });
  });
});

describe('F5-05: totais e taxas', () => {
  const completo: SaidasDoCaso = {
    estrutura: { secoes: [{ tipo: 'dispositivo', inicio: 20, fim: 24 }] },
    questoes: { questoes: [{ paragrafos: [5, 6, 7], paragrafosConclusao: [7] }] },
    fundamentos: { fundamentos: [{ citacao: 'CDC, art. 14' }] }
  };
  it('soma os casos', () => {
    const t = totalizar([medirCaso(completo, GAB), medirCaso({ estrutura: null, questoes: null, fundamentos: null }, GAB)]);
    assert.deepEqual(t, { casos: 2, dispositivoAcertos: 1, questoesEsperadas: 4, questoesEncontradas: 1, questoesExtras: 0, citacoesEsperadas: 4, citacoesEncontradas: 1 });
  });
  it('taxa sem denominador é nula, e não zero', () => {
    assert.equal(taxa(1, 4), 0.25);
    assert.equal(taxa(0, 0), null);
  });
});

describe('F5-05: formato do caso', () => {
  const base = { id: 'caso-001', fonte: { descricao: 'Acórdão do STJ', url: 'https://www.stj.jus.br/x', acessadoEm: '2026-10-25' }, tipo: 'acordao', texto: 'x'.repeat(300), gabarito: null, validacao: null };
  it('caso novo, sem gabarito, é válido e não é validado', () => {
    const c = CasoSchema.parse(base);
    assert.equal(ehValidado(c), false);
  });
  it('gabarito com validação é validado; validação sem gabarito é recusada', () => {
    const c = CasoSchema.parse({ ...base, gabarito: GAB, validacao: { por: 'Fulano de Tal', em: '2026-10-25' } });
    assert.equal(ehValidado(c), true);
    assert.equal(CasoSchema.safeParse({ ...base, validacao: { por: 'Fulano de Tal', em: '2026-10-25' } }).success, false);
  });
  it('recusa id mal formado, data fora do padrão e campo desconhecido', () => {
    assert.equal(CasoSchema.safeParse({ ...base, id: 'Caso 1' }).success, false);
    assert.equal(CasoSchema.safeParse({ ...base, fonte: { ...base.fonte, acessadoEm: '25/10/2026' } }).success, false);
    assert.equal(CasoSchema.safeParse({ ...base, extra: 1 }).success, false);
  });
  it('aponta parágrafo do gabarito que não existe na decisão', () => {
    assert.deepEqual(problemasDoGabarito(GAB, 30), []);
    assert.equal(problemasDoGabarito(GAB, 22).length, 1);
    assert.equal(problemasDoGabarito({ ...GAB, questoes: [{ ...GAB.questoes[0], paragrafos: [99] }] }, 30).length, 1);
  });
});
