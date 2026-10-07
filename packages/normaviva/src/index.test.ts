import { describe, it } from 'node:test';
import assert from 'node:assert';
import { MotorNormaViva, HISTORICO_DISPOSITIVOS_EXEMPLO } from './index';

describe('NormaViva (prévia)', () => {
  const motor = new MotorNormaViva();

  it('art. 85, § 6º-A: não existia antes da Lei 14.365/2022 e vale a partir de 03/06/2022', () => {
    assert.strictEqual(motor.consultarDispositivoNaData('CPC-ART-85-P6A', '2022-06-02'), null);
    const v = motor.consultarDispositivoNaData('CPC-ART-85-P6A', '2022-06-03');
    assert.ok(v);
    assert.strictEqual(v!.tipoAlteracao, 'acrescentado');
  });

  it('art. 85, § 6º-A: o texto é o do Planalto (apreciação equitativa proibida se o valor é líquido ou liquidável)', () => {
    const v = motor.consultarDispositivoNaData('CPC-ART-85-P6A', '2026-10-07')!;
    assert.match(v.texto, /for líquido ou liquidável/);
    assert.match(v.texto, /é proibida a apreciação equitativa, salvo nas hipóteses expressamente previstas no § 8º/);
  });

  it('redação original do CPC vale desde 18/03/2016', () => {
    assert.strictEqual(motor.consultarDispositivoNaData('CPC-ART-219', '2016-03-17'), null);
    assert.ok(motor.consultarDispositivoNaData('CPC-ART-219', '2016-03-18'));
  });

  it('toda versão tem texto, ato modificador e vigência coerente', () => {
    for (const v of HISTORICO_DISPOSITIVOS_EXEMPLO) {
      assert.ok(v.texto.length > 20, v.id);
      assert.ok(v.dataFimVigencia === null || v.dataFimVigencia >= v.dataInicioVigencia, v.id);
      assert.ok(v.atoModificador.dataPublicacao <= v.dataInicioVigencia, v.id);
    }
  });
});
