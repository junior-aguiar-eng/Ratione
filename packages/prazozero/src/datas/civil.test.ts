import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  anoDe,
  deDias,
  diaDaSemanaIso,
  diasNoMes,
  diferencaDiasIso,
  ehBissexto,
  ehDataIsoValida,
  formatarCivil,
  paraDias,
  pascoaIso,
  somarDiasIso
} from './civil';

/** O `Date` do JavaScript entra aqui só como referência independente: o código de produção não o usa. */
describe('Datas civis puras (F0-10)', () => {
  it('ida e volta, dia da semana e soma conferem com o Date em todos os dias de 1600 a 2600', () => {
    const inicio = Date.UTC(1600, 0, 1) / 86400000;
    const fim = Date.UTC(2600, 11, 31) / 86400000;
    for (let n = inicio; n <= fim; n++) {
      const ref = new Date(n * 86400000);
      const c = deDias(n);
      assert.strictEqual(c.ano, ref.getUTCFullYear());
      assert.strictEqual(c.mes, ref.getUTCMonth() + 1);
      assert.strictEqual(c.dia, ref.getUTCDate());
      assert.strictEqual(paraDias(c.ano, c.mes, c.dia), n);
      const iso = formatarCivil(c);
      assert.strictEqual(diaDaSemanaIso(iso), ref.getUTCDay(), iso);
    }
  });

  it('somar e diferença são inversas, inclusive atravessando mês, ano e 29/02', () => {
    assert.strictEqual(somarDiasIso('2024-02-28', 1), '2024-02-29');
    assert.strictEqual(somarDiasIso('2024-02-29', 1), '2024-03-01');
    assert.strictEqual(somarDiasIso('2025-02-28', 1), '2025-03-01');
    assert.strictEqual(somarDiasIso('2026-12-31', 1), '2027-01-01');
    assert.strictEqual(somarDiasIso('2027-01-01', -1), '2026-12-31');
    assert.strictEqual(somarDiasIso('2026-03-10', 120), '2026-07-08');
    for (const [a, n] of [['2024-01-01', 366], ['2026-10-07', -1000], ['1999-12-31', 1], ['2100-02-28', 1]] as const) {
      assert.strictEqual(diferencaDiasIso(a, somarDiasIso(a, n)), n);
    }
  });

  it('valida datas reais e rejeita as inexistentes e os formatos errados', () => {
    for (const ok of ['2024-02-29', '2000-02-29', '2026-12-31', '0001-01-01']) assert.ok(ehDataIsoValida(ok), ok);
    for (const ruim of ['2026-02-29', '1900-02-29', '2026-13-01', '2026-00-10', '2026-04-31', '2026-4-1', '26-04-01', '', '2026-04-01T00:00']) {
      assert.ok(!ehDataIsoValida(ruim), ruim);
    }
  });

  it('anos bissextos e dias do mês', () => {
    assert.deepStrictEqual([1900, 2000, 2023, 2024, 2100].map(ehBissexto), [false, true, false, true, false]);
    assert.deepStrictEqual([1, 2, 4, 12].map(m => diasNoMes(2024, m)), [31, 29, 30, 31]);
    assert.strictEqual(diasNoMes(2026, 2), 28);
    assert.strictEqual(anoDe('2026-10-07'), 2026);
  });

  it('Páscoa: datas conhecidas de 2000 a 2030', () => {
    const conhecidas: Record<number, string> = {
      2000: '04-23', 2001: '04-15', 2002: '03-31', 2003: '04-20', 2004: '04-11', 2005: '03-27', 2006: '04-16', 2007: '04-08',
      2008: '03-23', 2009: '04-12', 2010: '04-04', 2011: '04-24', 2012: '04-08', 2013: '03-31', 2014: '04-20', 2015: '04-05',
      2016: '03-27', 2017: '04-16', 2018: '04-01', 2019: '04-21', 2020: '04-12', 2021: '04-04', 2022: '04-17', 2023: '04-09',
      2024: '03-31', 2025: '04-20', 2026: '04-05', 2027: '03-28', 2028: '04-16', 2029: '04-01', 2030: '04-21'
    };
    for (const [ano, md] of Object.entries(conhecidas)) assert.strictEqual(pascoaIso(Number(ano)), `${ano}-${md}`);
  });

  it('a Páscoa cai sempre num domingo, entre 22/03 e 25/04, de 1900 a 2200', () => {
    for (let ano = 1900; ano <= 2200; ano++) {
      const p = pascoaIso(ano);
      assert.strictEqual(diaDaSemanaIso(p), 0, p);
      assert.ok(p.slice(5) >= '03-22' && p.slice(5) <= '04-25', p);
    }
  });
});
