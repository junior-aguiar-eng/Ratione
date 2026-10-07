import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { MotorPrazoZero, ParametrosCalculoPrazo } from './calculadora';

/**
 * Suíte de cenários: o motor é confrontado com o gabarito gerado por `cenarios/oraculo.py`
 * (implementação independente). O gabarito só vale juridicamente depois que `validacao.status`
 * passar de "pendente" para "validado" por um revisor (ver METODO_CALENDARIO_FORENSE.md, § 5).
 */
interface Cenario {
  id: string;
  categoria: string;
  descricao: string;
  fundamento: string;
  entrada: ParametrosCalculoPrazo;
  esperado: {
    dataPublicacao: string;
    dataTermoInicial: string;
    dataVencimentoFinal: string;
    foiProrrogadoTermoFinal: boolean;
    calendarioVerificado: boolean;
  };
  alternativaEsperada?: string | null;
  validacao: { status: 'pendente' | 'validado'; por: string | null; em: string | null };
}

const cenarios: Cenario[] = JSON.parse(readFileSync(join(__dirname, '../../cenarios/cenarios.json'), 'utf-8'));

describe('PrazoZero: suíte de cenários contra o oráculo independente', () => {
  const motor = new MotorPrazoZero();

  it('tem ao menos um cenário, ids únicos e campos de validação', () => {
    assert.ok(cenarios.length > 0);
    assert.strictEqual(new Set(cenarios.map(c => c.id)).size, cenarios.length, 'ids duplicados');
    for (const c of cenarios) {
      assert.ok(c.fundamento, `${c.id}: sem fundamento`);
      assert.ok(['pendente', 'validado'].includes(c.validacao.status), `${c.id}: validação inválida`);
    }
  });

  for (const c of cenarios) {
    it(`${c.id}: ${c.descricao}`, () => {
      const r = motor.calcularPrazo(c.entrada);
      assert.strictEqual(r.dataPublicacao, c.esperado.dataPublicacao, 'dataPublicacao');
      assert.strictEqual(r.dataTermoInicial, c.esperado.dataTermoInicial, 'dataTermoInicial');
      assert.strictEqual(r.dataVencimentoFinal, c.esperado.dataVencimentoFinal, 'dataVencimentoFinal');
      assert.strictEqual(r.foiProrrogadoTermoFinal, c.esperado.foiProrrogadoTermoFinal, 'foiProrrogadoTermoFinal');
      assert.strictEqual(r.calendarioVerificado, c.esperado.calendarioVerificado, 'calendarioVerificado');
      assert.strictEqual(!!r.fontesCalendario, r.calendarioVerificado, 'fontes presentes só com calendário verificado');

      if (c.alternativaEsperada !== undefined) {
        assert.strictEqual(r.alternativa?.dataVencimentoFinal ?? null, c.alternativaEsperada, 'alternativa');
      }

      // Propriedades que valem para qualquer cenário
      const ultimo = r.memoriaCalculo[r.memoriaCalculo.length - 1];
      assert.strictEqual(ultimo.data, r.dataVencimentoFinal, 'a memória termina no vencimento');
      const dow = new Date(`${r.dataVencimentoFinal}T12:00:00Z`).getUTCDay();
      assert.ok(dow !== 0 && dow !== 6, 'o vencimento nunca cai em sábado ou domingo');
      assert.ok(r.dataVencimentoFinal > r.dataPublicacao, 'o vencimento é posterior à publicação');
    });
  }
});
