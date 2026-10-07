import { describe, it } from 'node:test';
import assert from 'node:assert';
import { MotorPrazoZero } from './calculadora';
import { calcularPascoa } from '../calendario/feriados';

describe('MotorPrazoZero - Testes Processuais Reais (Sem Mocks)', () => {
  const motor = new MotorPrazoZero();

  it('deve calcular a Páscoa astronomicamente com exatidão para múltiplos anos', () => {
    // 2024: 31 de Março
    const p2024 = calcularPascoa(2024);
    assert.strictEqual(p2024.toISOString().slice(0, 10), '2024-03-31');

    // 2025: 20 de Abril
    const p2025 = calcularPascoa(2025);
    assert.strictEqual(p2025.toISOString().slice(0, 10), '2025-04-20');

    // 2026: 05 de Abril
    const p2026 = calcularPascoa(2026);
    assert.strictEqual(p2026.toISOString().slice(0, 10), '2026-04-05');
  });

  it('deve aplicar a regra Canônica DJe: disponibilização na quarta-feira (10/03/2026)', () => {
    // 10/03/2026 é Terça-feira.
    // Disponibilização: 10/03/2026
    // Publicação: 11/03/2026 (Quarta)
    // Início da contagem: 12/03/2026 (Quinta)
    // Prazo: 15 dias úteis (Apelação Cível no TJSP)
    const resultado = motor.calcularPrazo({
      dataEvento: '2026-03-10',
      tipoEvento: 'disponibilizacao_dje',
      diasPrazo: 15,
      tribunalId: 'TJSP',
      uf: 'SP',
      nomeAto: 'Apelação'
    });

    assert.strictEqual(resultado.dataDisponibilizacao, '2026-03-10');
    assert.strictEqual(resultado.dataPublicacao, '2026-03-11');
    assert.strictEqual(resultado.dataTermoInicial, '2026-03-12');
    assert.strictEqual(resultado.diasTotaisComputados, 15);
    // Vencimento final: 01/04/2026 (15º dia útil contado a partir de 12/03)
    assert.strictEqual(resultado.dataVencimentoFinal, '2026-04-01');
  });

  it('deve respeitar rigorosamente o Recesso Forense do Art. 220 do CPC (20/dez a 20/jan)', () => {
    // Publicação em 15/12/2025 (Segunda-feira)
    // 15 dias úteis
    // Dias contados em 2025:
    // 16/12 (1º), 17/12 (2º), 18/12 (3º), 19/12 (4º)
    // 20/12/2025 a 20/01/2026: SUSPENSÃO TOTAL
    // Retomada: 21/01/2026 (Quarta-feira) -> 5º dia útil!
    const resultado = motor.calcularPrazo({
      dataEvento: '2025-12-15',
      tipoEvento: 'publicacao',
      diasPrazo: 15,
      tribunalId: 'TJSP',
      uf: 'SP'
    });

    assert.strictEqual(resultado.dataPublicacao, '2025-12-15');
    assert.strictEqual(resultado.dataTermoInicial, '2025-12-16');

    // Verificar se no dia 21/01/2026 temos o 5º dia útil
    const item21Jan = resultado.memoriaCalculo.find(m => m.data === '2026-01-21');
    assert.ok(item21Jan, 'Deveria conter 21/01/2026 na memória');
    assert.strictEqual(item21Jan.diaContadoNumero, 5);

    // O vencimento deve acontecer em Fevereiro de 2026
    const dataFim = resultado.dataVencimentoFinal;
    assert.ok(dataFim.startsWith('2026-02-'), `Vencimento deveria ser em fevereiro de 2026, foi ${dataFim}`);
  });

  it('deve considerar feriado estadual específico de SP (09 de Julho - Revolução Constitucionalista)', () => {
    // 08/07/2026 é Quarta-feira
    // Publicação em 08/07/2026
    // 09/07/2026 é Feriado Estadual em SP -> NÃO computado!
    // Início da contagem efetiva em 10/07/2026 (Sexta)
    const resultado = motor.calcularPrazo({
      dataEvento: '2026-07-08',
      tipoEvento: 'publicacao',
      diasPrazo: 5, // Embargos de Declaração
      tribunalId: 'TJSP',
      uf: 'SP',
      modo: 'completo' // o feriado estadual ainda está pendente de conferência; só entra no modo completo
    });

    const item09Jul = resultado.memoriaCalculo.find(m => m.data === '2026-07-09');
    assert.ok(item09Jul, 'Deveria registrar 09 de Julho');
    assert.strictEqual(item09Jul.diaUtil, false);
    assert.strictEqual(item09Jul.status, 'feriado');
    assert.strictEqual(item09Jul.verificacao, 'pendente');
    assert.ok(item09Jul.descricao.includes('Revolução Constitucionalista'));
  });

  it('modo conservador (padrão) mostra a data mais cedo e descreve a alternativa com o dia pendente', () => {
    const r = motor.calcularPrazo({
      dataEvento: '2026-07-08',
      tipoEvento: 'publicacao',
      diasPrazo: 5,
      tribunalId: 'TJSP'
    });

    assert.strictEqual(r.modo, 'conservador');
    assert.strictEqual(r.dataVencimentoFinal, '2026-07-15');
    assert.strictEqual(r.alternativa?.dataVencimentoFinal, '2026-07-16');
    assert.deepStrictEqual(r.alternativa?.eventosPendentes.map(e => e.data), ['2026-07-09']);
    assert.ok(r.avisos.some(a => a.includes('data mais cedo')));
    assert.ok(r.certidaoAuditavel.includes('Atenção'));
    assert.strictEqual(r.calendarioVerificado, false);
  });

  it('sem dia pendente no intervalo não há alternativa', () => {
    const r = motor.calcularPrazo({ dataEvento: '2026-03-10', tipoEvento: 'publicacao', diasPrazo: 5, tribunalId: 'TJSP' });
    assert.strictEqual(r.alternativa, undefined);
  });

  it('Quarta-feira de Cinzas só protrai o dia do vencimento, não os dias do meio (CPC, art. 224, § 1º)', () => {
    const r = motor.calcularPrazo({
      dataEvento: '2026-02-10',
      tipoEvento: 'publicacao',
      diasPrazo: 4,
      tribunalId: 'TJSP',
      modo: 'completo'
    });
    assert.strictEqual(r.dataVencimentoFinal, '2026-02-19');
    assert.strictEqual(r.foiProrrogadoTermoFinal, true);
    assert.strictEqual(r.memoriaCalculo.find(m => m.data === '2026-02-18')?.status, 'expediente_parcial');
  });

  it('rejeita entrada inválida em vez de calcular em silêncio', () => {
    const base = { dataEvento: '2026-03-10', tipoEvento: 'publicacao' as const, diasPrazo: 5 };
    assert.throws(() => motor.calcularPrazo({ ...base, dataEvento: '2026-02-30' }), /dataEvento inválida/);
    assert.throws(() => motor.calcularPrazo({ ...base, dataEvento: '10/03/2026' }), /dataEvento inválida/);
    assert.throws(() => motor.calcularPrazo({ ...base, diasPrazo: 0 }), /diasPrazo inválido/);
    assert.throws(() => motor.calcularPrazo({ ...base, diasPrazo: 2.5 }), /diasPrazo inválido/);
    assert.throws(() => motor.calcularPrazo({ ...base, diasPrazo: 100000 }), /diasPrazo inválido/);
  });

  it('deve prorrogar termo final do CPP se cair em domingo (Art. 798, § 3º)', () => {
    // 5 dias corridos no CPP
    // Publicação em 10/03/2026 (Terça)
    // Dias: 11 (qua, 1º), 12 (qui, 2º), 13 (sex, 3º), 14 (sab, 4º), 15 (dom, 5º)
    // 15/03/2026 é Domingo -> prorrogado para Segunda-feira 16/03/2026!
    const resultado = motor.calcularPrazo({
      dataEvento: '2026-03-10',
      tipoEvento: 'publicacao',
      diasPrazo: 5,
      regime: 'cpp_dias_corridos',
      tribunalId: 'TJSP'
    });

    assert.strictEqual(resultado.foiProrrogadoTermoFinal, true);
    assert.strictEqual(resultado.dataVencimentoFinal, '2026-03-16');
  });
});
