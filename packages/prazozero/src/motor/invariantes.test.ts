import { describe, it } from 'node:test';
import assert from 'node:assert';
import { MotorPrazoZero, ParametrosCalculoPrazo, RegimeContagem, TipoEventoOrigem } from './calculadora';
import { suspensaoDePrazos } from '../calendario/feriados';

/**
 * Propriedades que nenhum cálculo pode violar, conferidas em milhares de entradas pseudoaleatórias
 * (semente fixa: o teste é reproduzível). Não substitui o gabarito do oráculo; procura defeitos que
 * os cenários escritos à mão não alcançam.
 */
function gerador(semente: number) {
  let s = semente >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const TRIBUNAIS = ['STF', 'STJ', 'TST', 'TRF1', 'TRF3', 'TJSP', 'TJMG', 'TJRJ', 'TJAL', 'TJPR', 'TJDF', 'TJPE', 'TJRS', 'TJGO', 'TJES', 'TJCE', undefined];
const REGIMES: RegimeContagem[] = ['cpc_dias_uteis', 'clt_dias_uteis', 'jef_dias_uteis', 'cpp_dias_corridos'];
const TIPOS: TipoEventoOrigem[] = ['disponibilizacao_dje', 'publicacao', 'intimacao_portal', 'carga_ou_audiencia'];
const PRAZOS = [1, 2, 5, 8, 10, 15, 30];

function dataAleatoria(r: () => number): string {
  const ano = 2024 + Math.floor(r() * 5); // 2024 a 2028
  const d = new Date(Date.UTC(ano, 0, 1 + Math.floor(r() * 365)));
  return d.toISOString().slice(0, 10);
}

const dia = (iso: string) => new Date(`${iso}T00:00:00Z`).getUTCDay();
const dias = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);

describe('PrazoZero: invariantes em entradas aleatórias', () => {
  const motor = new MotorPrazoZero();
  const r = gerador(20261007);
  const casos: ParametrosCalculoPrazo[] = Array.from({ length: 4000 }, () => ({
    dataEvento: dataAleatoria(r),
    tipoEvento: TIPOS[Math.floor(r() * TIPOS.length)],
    diasPrazo: PRAZOS[Math.floor(r() * PRAZOS.length)],
    regime: REGIMES[Math.floor(r() * REGIMES.length)],
    tribunalId: TRIBUNAIS[Math.floor(r() * TRIBUNAIS.length)],
    prazoEmDobro: r() < 0.2,
    excecaoSuspensaoCriminal: r() < 0.3
  }));

  it('a contagem registra exatamente N dias, em sequência, todos depois da publicação', () => {
    for (const p of casos) {
      const res = motor.calcularPrazo(p);
      const contados = res.memoriaCalculo.filter(i => i.diaContadoNumero !== null && i.status !== 'vencimento_prorrogado');
      const esperado = p.diasPrazo * (p.prazoEmDobro && p.regime !== 'jef_dias_uteis' ? 2 : 1);
      const ctx = JSON.stringify(p);
      assert.strictEqual(contados.length, esperado, ctx);
      contados.forEach((i, k) => {
        assert.strictEqual(i.diaContadoNumero, k + 1, ctx);
        assert.ok(i.data > res.dataPublicacao, ctx);
      });
      assert.strictEqual(res.diasTotaisComputados, esperado, ctx);
    }
  });

  it('o vencimento nunca antecede a publicação mais N dias e não cai em fim de semana nem em suspensão', () => {
    for (const p of casos) {
      const res = motor.calcularPrazo(p);
      const ctx = JSON.stringify(p) + ' => ' + res.dataVencimentoFinal;
      assert.ok(dias(res.dataPublicacao, res.dataVencimentoFinal) >= res.diasTotaisComputados, ctx);
      if (p.regime !== 'cpp_dias_corridos') {
        const dow = dia(res.dataVencimentoFinal);
        assert.ok(dow !== 0 && dow !== 6, ctx);
        assert.strictEqual(suspensaoDePrazos(res.dataVencimentoFinal, p.tribunalId, p.regime ?? 'cpc_dias_uteis').suspenso, false, ctx);
      }
    }
  });

  it('nenhum dia contado é fim de semana (dias úteis) ou está em suspensão de prazos', () => {
    for (const p of casos) {
      const res = motor.calcularPrazo(p);
      const regime = p.regime ?? 'cpc_dias_uteis';
      const suspende = regime !== 'cpp_dias_corridos' || !p.excecaoSuspensaoCriminal;
      for (const i of res.memoriaCalculo) {
        if (i.diaContadoNumero === null || i.status === 'vencimento_prorrogado') continue;
        const ctx = `${JSON.stringify(p)} dia ${i.data}`;
        if (regime !== 'cpp_dias_corridos') assert.ok(![0, 6].includes(dia(i.data)), ctx);
        if (suspende) assert.strictEqual(suspensaoDePrazos(i.data, p.tribunalId, regime).suspenso, false, ctx);
      }
    }
  });

  it('o modo conservador nunca devolve data posterior à do modo completo', () => {
    for (const p of casos) {
      const c = motor.calcularPrazo({ ...p, modo: 'conservador' });
      const f = motor.calcularPrazo({ ...p, modo: 'completo' });
      assert.ok(c.dataVencimentoFinal <= f.dataVencimentoFinal, JSON.stringify(p));
      if (c.alternativa) assert.strictEqual(c.alternativa.dataVencimentoFinal, f.dataVencimentoFinal, JSON.stringify(p));
      else assert.strictEqual(c.dataVencimentoFinal, f.dataVencimentoFinal, JSON.stringify(p));
    }
  });

  it('prazo maior nunca vence antes de prazo menor (pode empatar quando a prorrogação absorve o dia)', () => {
    for (const p of casos.slice(0, 1500)) {
      const a = motor.calcularPrazo({ ...p, diasPrazo: 5 });
      const b = motor.calcularPrazo({ ...p, diasPrazo: 6 });
      assert.ok(a.dataVencimentoFinal <= b.dataVencimentoFinal, JSON.stringify(p));
    }
  });

  it('o prazo em dobro equivale a dobrar os dias (fora do JEF) e não muda nada no JEF', () => {
    for (const p of casos.slice(0, 1500)) {
      const base = { ...p, prazoEmDobro: false };
      const dobro = motor.calcularPrazo({ ...base, prazoEmDobro: true });
      if (p.regime === 'jef_dias_uteis') {
        assert.strictEqual(dobro.dataVencimentoFinal, motor.calcularPrazo(base).dataVencimentoFinal, JSON.stringify(p));
      } else {
        assert.strictEqual(
          dobro.dataVencimentoFinal,
          motor.calcularPrazo({ ...base, diasPrazo: p.diasPrazo * 2 }).dataVencimentoFinal,
          JSON.stringify(p)
        );
      }
    }
  });
});
