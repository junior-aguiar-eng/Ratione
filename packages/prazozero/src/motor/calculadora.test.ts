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

  it('9 de julho no TJSP: em 2026 é feriado conferido no Provimento CSM 2.813/2025 (Lei Estadual 9.497/1997)', () => {
    const resultado = motor.calcularPrazo({
      dataEvento: '2026-07-08',
      tipoEvento: 'publicacao',
      diasPrazo: 5, // Embargos de Declaração
      tribunalId: 'TJSP',
      uf: 'SP'
    });

    const item09Jul = resultado.memoriaCalculo.find(m => m.data === '2026-07-09');
    assert.ok(item09Jul, 'Deveria registrar 09 de Julho');
    assert.strictEqual(item09Jul.diaUtil, false);
    assert.strictEqual(item09Jul.status, 'feriado');
    assert.strictEqual(item09Jul.verificacao, 'ato_do_tribunal');
    assert.ok(item09Jul.descricao.includes('Data Magna'));
    assert.strictEqual(resultado.alternativa, undefined, 'nada pendente: sem data alternativa');
    assert.strictEqual(resultado.calendarioVerificado, true);
  });

  it('9 de julho no TJSP em 2027: sem provimento publicado, o dia segue pendente (tabela estadual)', () => {
    const r = motor.calcularPrazo({ dataEvento: '2027-07-08', tipoEvento: 'publicacao', diasPrazo: 5, tribunalId: 'TJSP', modo: 'completo' });
    const item = r.memoriaCalculo.find(m => m.data === '2027-07-09');
    assert.strictEqual(item?.status, 'feriado');
    assert.strictEqual(item?.verificacao, 'pendente');
    assert.strictEqual(r.calendarioVerificado, false);
  });

  it('modo conservador (padrão) mostra a data mais cedo e descreve a alternativa com o dia pendente', () => {
    const r = motor.calcularPrazo({
      dataEvento: '2027-07-08',
      tipoEvento: 'publicacao',
      diasPrazo: 5,
      tribunalId: 'TJSP'
    });

    assert.strictEqual(r.modo, 'conservador');
    assert.strictEqual(r.dataVencimentoFinal, '2027-07-15');
    assert.strictEqual(r.alternativa?.dataVencimentoFinal, '2027-07-16');
    assert.deepStrictEqual(r.alternativa?.eventosPendentes.map(e => e.data), ['2027-07-09']);
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

  it('prazo em dobro avisa que não vale quando a lei fixa prazo próprio (CPC 180 §2º, 183 §2º, 186 §4º)', () => {
    const base = { dataEvento: '2026-03-10', diasPrazo: 15, tribunalId: 'TJSP' };
    const comDobro = motor.calcularPrazo({ ...base, tipoEvento: 'carga_ou_audiencia', prazoEmDobro: true });
    const aviso = comDobro.avisos.find(a => a.startsWith('Prazo em dobro'));
    assert.ok(aviso, 'deveria avisar sobre o prazo em dobro');
    assert.ok(aviso.includes('prazo próprio') && aviso.includes('183, § 2º') && aviso.includes('186, § 4º'));
    assert.ok(!aviso.includes('intimação pessoal'), 'carga/ciência pessoal já é intimação pessoal: sem esse alerta');
    assert.strictEqual(comDobro.diasTotaisComputados, 30);

    const semDobro = motor.calcularPrazo({ ...base, tipoEvento: 'carga_ou_audiencia' });
    assert.ok(!semDobro.avisos.some(a => a.startsWith('Prazo em dobro')), 'sem dobro, sem esse aviso');
  });

  it('prazo em dobro com origem no Diário avisa que só começa com a intimação pessoal (CPC 183 §1º)', () => {
    for (const tipoEvento of ['disponibilizacao_dje', 'publicacao'] as const) {
      const r = motor.calcularPrazo({ dataEvento: '2026-03-10', tipoEvento, diasPrazo: 15, tribunalId: 'TJSP', prazoEmDobro: true });
      const aviso = r.avisos.find(a => a.startsWith('Prazo em dobro'));
      assert.ok(aviso?.includes('intimação pessoal') && aviso.includes('183, § 1º'), tipoEvento);
    }
  });

  it('art. 229 do CPC só gera aviso: não duplica o prazo e lembra que não vale em autos eletrônicos', () => {
    const base = { dataEvento: '2026-03-10', tipoEvento: 'publicacao' as const, diasPrazo: 15, tribunalId: 'TJSP' };
    const sem = motor.calcularPrazo(base);
    const com = motor.calcularPrazo({ ...base, litisconsortesComAdvogadosDistintos: true });
    assert.strictEqual(com.dataVencimentoFinal, sem.dataVencimentoFinal);
    assert.strictEqual(com.diasTotaisComputados, 15);
    const aviso = com.avisos.find(a => a.startsWith('Litisconsortes'));
    assert.ok(aviso?.includes('autos eletrônicos') && aviso.includes('§ 2º') && aviso.includes('§ 1º'));
    assert.ok(!sem.avisos.some(a => a.startsWith('Litisconsortes')));
  });

  it('JEF: dias úteis, sem prazo em dobro para ente público e aviso com as duas leis', () => {
    const r = motor.calcularPrazo({
      dataEvento: '2026-03-10', tipoEvento: 'publicacao', diasPrazo: 10, tribunalId: 'TJSP',
      regime: 'jef_dias_uteis', prazoEmDobro: true
    });
    assert.strictEqual(r.diasTotaisComputados, 10, 'o dobro não se aplica no JEF');
    assert.strictEqual(r.dataVencimentoFinal, '2026-03-24');
    const aviso = r.avisos.find(a => a.startsWith('Prazo em dobro'));
    assert.ok(aviso?.includes('não aplicado') && aviso.includes('10.259') && aviso.includes('12.153'));
    assert.ok(!r.avisos.some(a => a.includes('Prazo em dobro aplicado')));
    assert.ok(r.certidaoAuditavel.includes('Lei 9.099/1995, art. 12-A'));
    assert.ok(!r.certidaoAuditavel.includes('Prazo em Dobro'));
  });

  it('JEF: a suspensão de 20/12 a 20/01 vale nos Juizados (Res. CNJ 244/2016, art. 3º)', () => {
    const r = motor.calcularPrazo({
      dataEvento: '2025-12-15', tipoEvento: 'publicacao', diasPrazo: 10, tribunalId: 'TJSP', regime: 'jef_dias_uteis'
    });
    assert.strictEqual(r.dataVencimentoFinal, '2026-01-28');
    assert.strictEqual(r.alternativa, undefined, 'não há mais dia pendente: nenhuma data alternativa');
    assert.ok(r.memoriaCalculo.some(m => m.status === 'recesso_forense' && m.fundamentoLegal.includes('244/2016')));
  });

  it('CPP no STF e no STJ: as férias não suspendem prazo criminal, e o aviso diz isso', () => {
    const jan = motor.calcularPrazo({ dataEvento: '2026-01-22', tipoEvento: 'publicacao', diasPrazo: 5, tribunalId: 'STF', regime: 'cpp_dias_corridos' });
    assert.strictEqual(jan.dataVencimentoFinal, '2026-01-27', 'depois de 20/01 o prazo criminal corre');
    assert.ok(jan.avisos.some(a => a.startsWith('No STF, as férias coletivas') && a.includes('798')));
    const jul = motor.calcularPrazo({ dataEvento: '2026-06-30', tipoEvento: 'publicacao', diasPrazo: 5, tribunalId: 'STJ', regime: 'cpp_dias_corridos' });
    assert.strictEqual(jul.dataVencimentoFinal, '2026-07-06', 'julho não suspende; vencimento de domingo vai à segunda');
    assert.ok(jul.avisos.some(a => a.startsWith('No STJ, as férias coletivas')));
  });

  it('CPP: o prazo criminal é suspenso de 20/12 a 20/01 (art. 798-A), salvo réu preso, Maria da Penha ou urgência', () => {
    const base = { dataEvento: '2026-12-15', tipoEvento: 'publicacao' as const, diasPrazo: 5, tribunalId: 'TJSP', regime: 'cpp_dias_corridos' as const };
    const suspenso = motor.calcularPrazo(base);
    assert.strictEqual(suspenso.dataVencimentoFinal, '2027-01-21', '4 dias antes de 20/12; o 5º é 21/01');
    assert.ok(suspenso.memoriaCalculo.some(m => m.status === 'recesso_forense' && m.fundamentoLegal.includes('798-A')));
    assert.ok(suspenso.avisos.some(a => a.startsWith('Prazo criminal suspenso de 20/12 a 20/01 (CPP, art. 798-A)') && a.includes('Não se suspende em processo com réu preso')));

    const preso = motor.calcularPrazo({ ...base, excecaoSuspensaoCriminal: true });
    assert.strictEqual(preso.dataVencimentoFinal, '2027-01-04', 'sem suspensão: vence no domingo 20/12; 21 a 31/12 são recesso sem expediente no TJSP');
    assert.ok(preso.avisos.some(a => a.startsWith('Exceção do CPP, art. 798-A')));
    assert.ok(!preso.memoriaCalculo.some(m => m.status === 'recesso_forense'));
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
