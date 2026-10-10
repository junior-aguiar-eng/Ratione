import { describe, it } from 'node:test';
import assert from 'node:assert';
import { MotorNormaViva, HISTORICO_DISPOSITIVOS_EXEMPLO, VersaoDispositivoSchema, PROCEDENCIA_HISTORICO_EXEMPLO, classificarRotulo, versaoParaDispositivo } from './index';

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
      assert.ok(VersaoDispositivoSchema.safeParse(v).success, v.id);
      assert.ok(v.texto.length > 20, v.id);
      assert.ok(v.dataFimVigencia === null || v.dataFimVigencia >= v.dataInicioVigencia, v.id);
      assert.ok(v.atoModificador.dataPublicacao <= v.dataInicioVigencia, v.id);
    }
  });
});

describe('NormaViva: adaptador para o núcleo', () => {
  it('toda versão de exemplo vira um dispositivo válido do núcleo, com procedência', () => {
    for (const v of HISTORICO_DISPOSITIVOS_EXEMPLO) {
      const d = versaoParaDispositivo(v, PROCEDENCIA_HISTORICO_EXEMPLO);
      assert.strictEqual(d.normaId, 'LEI-13105-2015', v.id);
      assert.strictEqual(d.vigenteEm, v.dataInicioVigencia, v.id);
      assert.strictEqual(d.revogado, false, v.id);
      assert.strictEqual(d.procedencia.origem, 'curado', v.id);
    }
  });

  it('o § 6º-A fica como parágrafo "6º-A" e aponta a lei que o acrescentou; a redação original não aponta ato', () => {
    const p6a = HISTORICO_DISPOSITIVOS_EXEMPLO.find(v => v.dispositivoId === 'CPC-ART-85-P6A')!;
    const d = versaoParaDispositivo(p6a, PROCEDENCIA_HISTORICO_EXEMPLO);
    assert.strictEqual(d.tipo, 'paragrafo');
    assert.strictEqual(d.numero, '6º-A');
    assert.strictEqual(d.alteradoPor, 'Lei Federal nº 14.365/2022');
    const art219 = HISTORICO_DISPOSITIVOS_EXEMPLO.find(v => v.dispositivoId === 'CPC-ART-219')!;
    const original = versaoParaDispositivo(art219, PROCEDENCIA_HISTORICO_EXEMPLO);
    assert.strictEqual(original.tipo, 'artigo');
    assert.strictEqual(original.alteradoPor, undefined);
  });

  it('classifica pelo nível mais fundo e recusa rótulo fora do padrão', () => {
    assert.deepStrictEqual(classificarRotulo('art. 85'), { tipo: 'artigo', numero: '85' });
    assert.deepStrictEqual(classificarRotulo('art. 489, § 1º, IV'), { tipo: 'inciso', numero: 'IV' });
    assert.deepStrictEqual(classificarRotulo('art. 219, parágrafo único'), { tipo: 'paragrafo_unico', numero: 'único' });
    assert.throws(() => classificarRotulo('artigo oitenta e cinco'));
  });

  it('revogação e declaração de inconstitucionalidade marcam o dispositivo como revogado', () => {
    const base = HISTORICO_DISPOSITIVOS_EXEMPLO[0];
    for (const tipoAlteracao of ['revogado_expressamente', 'declarado_inconstitucional'] as const) {
      assert.strictEqual(versaoParaDispositivo({ ...base, tipoAlteracao }, PROCEDENCIA_HISTORICO_EXEMPLO).revogado, true);
    }
  });
});
