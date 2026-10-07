import { describe, it } from 'node:test';
import assert from 'node:assert';
import { MotorPrazoZero, ParametrosCalculoPrazo } from './calculadora';
import { relatorioAlteracoes } from './relatorio';

const motor = new MotorPrazoZero();
const rel = (p: ParametrosCalculoPrazo) => relatorioAlteracoes(p, motor.calcularPrazo(p));
const item = (r: ReturnType<typeof rel>, id: string) => r.itens.find(i => i.id === id);

describe('Relatório "o que pode alterar este prazo" (F2-12)', () => {
  const base: ParametrosCalculoPrazo = { dataEvento: '2026-10-07', tipoEvento: 'disponibilizacao_dje', diasPrazo: 15, tribunalId: 'TJSP' };

  it('apelação no TJSP: vencimento 03/11/2026; indisponibilidade no último dia leva a 04/11', () => {
    const r = rel(base);
    assert.strictEqual(r.dataVencimentoFinal, '2026-11-03');
    assert.strictEqual(item(r, 'indisponibilidade')!.dataSeAplicar, '2026-11-04');
  });

  it('prazo em dobro: oferece a data com o dobro, igual ao cálculo de 30 dias úteis', () => {
    const r = rel(base);
    const dobro = item(r, 'prazo-em-dobro')!;
    assert.strictEqual(dobro.dataSeAplicar, motor.calcularPrazo({ ...base, diasPrazo: 30 }).dataVencimentoFinal);
    assert.match(dobro.fundamentoLegal, /arts\. 180, 183 e 186/);
  });

  it('com o dobro já marcado, o item de dobro não aparece', () => {
    assert.strictEqual(item(rel({ ...base, prazoEmDobro: true }), 'prazo-em-dobro'), undefined);
  });

  it('no CLT o dobro cita o Decreto-Lei 779/1969; no JEF e no CPP não é oferecido', () => {
    assert.match(item(rel({ ...base, regime: 'clt_dias_uteis' }), 'prazo-em-dobro')!.fundamentoLegal, /779\/1969/);
    assert.strictEqual(item(rel({ ...base, regime: 'jef_dias_uteis' }), 'prazo-em-dobro'), undefined);
    assert.strictEqual(item(rel({ ...base, regime: 'cpp_dias_corridos', diasPrazo: 5 }), 'prazo-em-dobro'), undefined);
  });

  it('dia pendente: aparece com a mesma data alternativa do cálculo (Carnaval no TJPR, sem ato)', () => {
    const p: ParametrosCalculoPrazo = { dataEvento: '2026-02-12', tipoEvento: 'disponibilizacao_dje', diasPrazo: 5, tribunalId: 'TJPR' };
    const res = motor.calcularPrazo(p);
    assert.ok(res.alternativa);
    const i = item(relatorioAlteracoes(p, res), 'dias-pendentes')!;
    assert.strictEqual(i.dataSeAplicar, res.alternativa!.dataVencimentoFinal);
    assert.ok(i.dataSeAplicar! > res.dataVencimentoFinal);
  });

  it('sem dia pendente, não há item de dias pendentes', () => {
    assert.strictEqual(item(rel(base), 'dias-pendentes'), undefined);
  });

  it('calendário conferido (TJSP 2026) não gera o item de calendário não conferido; outro tribunal gera', () => {
    assert.strictEqual(item(rel(base), 'calendario-nao-conferido'), undefined);
    assert.ok(item(rel({ ...base, tribunalId: 'TJPR' }), 'calendario-nao-conferido'));
    assert.ok(item(rel({ ...base, dataEvento: '2027-03-10' }), 'calendario-nao-conferido'));
  });

  it('CPP atravessando 20/12 a 20/01: mostra a exceção e a data que ela produziria', () => {
    const p: ParametrosCalculoPrazo = { dataEvento: '2026-12-14', tipoEvento: 'publicacao', diasPrazo: 8, regime: 'cpp_dias_corridos', tribunalId: 'TJSP' };
    const r = rel(p);
    const e = item(r, 'excecao-criminal')!;
    assert.strictEqual(e.dataSeAplicar, motor.calcularPrazo({ ...p, excecaoSuspensaoCriminal: true }).dataVencimentoFinal);
    assert.notStrictEqual(e.dataSeAplicar, r.dataVencimentoFinal);
  });

  it('CPP fora da janela de recesso: sem item de exceção', () => {
    const p: ParametrosCalculoPrazo = { dataEvento: '2026-03-10', tipoEvento: 'publicacao', diasPrazo: 5, regime: 'cpp_dias_corridos', tribunalId: 'TJSP' };
    assert.strictEqual(item(rel(p), 'excecao-criminal'), undefined);
  });

  it('intimação pelo portal traz o aviso da consulta; DJe não', () => {
    assert.ok(item(rel({ ...base, tipoEvento: 'intimacao_portal' }), 'consulta-portal'));
    assert.strictEqual(item(rel(base), 'consulta-portal'), undefined);
  });

  it('sempre traz os itens jurídicos fixos, cada um com fundamento', () => {
    const r = rel(base);
    for (const id of ['indisponibilidade', 'suspensao-processo', 'justa-causa', 'prorrogacao-juiz', 'feriado-local']) {
      assert.ok(item(r, id)?.fundamentoLegal, id);
    }
    for (const i of r.itens) assert.ok(i.titulo && i.descricao && i.fundamentoLegal, i.id);
  });
});
