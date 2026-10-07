import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { MotorPrazoZero, ParametrosCalculoPrazo } from './calculadora';

/**
 * Confronto diferencial: o oráculo Python (`cenarios/oraculo.py`, sem código em comum com o motor) calculou
 * 600 entradas pseudoaleatórias; o motor tem de chegar às mesmas datas, ao mesmo selo e à mesma alternativa.
 */
interface Aleatorio {
  id: string;
  entrada: ParametrosCalculoPrazo;
  esperado: {
    dataPublicacao: string;
    dataTermoInicial: string;
    dataVencimentoFinal: string;
    foiProrrogadoTermoFinal: boolean;
    calendarioVerificado: boolean;
  };
  alternativaEsperada: string | null;
}

const casos: Aleatorio[] = JSON.parse(readFileSync(join(__dirname, '../../cenarios/cenarios_aleatorios.json'), 'utf-8'));

describe('PrazoZero: motor contra o oráculo em entradas aleatórias', () => {
  const motor = new MotorPrazoZero();

  it('há centenas de casos', () => {
    assert.ok(casos.length >= 500);
  });

  it('todas as datas, o selo e a alternativa coincidem', () => {
    const divergencias: string[] = [];
    for (const c of casos) {
      const r = motor.calcularPrazo(c.entrada);
      const obtido = {
        dataPublicacao: r.dataPublicacao,
        dataTermoInicial: r.dataTermoInicial,
        dataVencimentoFinal: r.dataVencimentoFinal,
        foiProrrogadoTermoFinal: r.foiProrrogadoTermoFinal,
        calendarioVerificado: r.calendarioVerificado
      };
      try {
        assert.deepStrictEqual(obtido, c.esperado);
        assert.strictEqual(r.alternativa?.dataVencimentoFinal ?? null, c.alternativaEsperada);
      } catch {
        divergencias.push(`${c.id} ${JSON.stringify(c.entrada)}\n  motor:   ${JSON.stringify(obtido)} alt=${r.alternativa?.dataVencimentoFinal ?? null}\n  oráculo: ${JSON.stringify(c.esperado)} alt=${c.alternativaEsperada}`);
      }
    }
    assert.strictEqual(divergencias.length, 0, `${divergencias.length} divergências:\n${divergencias.slice(0, 5).join('\n')}`);
  });
});
