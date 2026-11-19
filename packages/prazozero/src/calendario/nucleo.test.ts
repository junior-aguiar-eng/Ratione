import { describe, it } from 'node:test';
import assert from 'node:assert';
import { FONTES_CALENDARIO } from './eventos';
import { obterFeriadosAno, TRIBUNAIS_MULTIESTADUAIS } from './feriados';
import { fonteCalendarioParaNucleo, fontesDoCalendario } from './nucleo';

describe('PrazoZero: fontes do calendário no núcleo', () => {
  it('toda fonte do calendário passa no esquema de Fonte do núcleo (URL e data de leitura válidas)', () => {
    const fontes = fontesDoCalendario();
    assert.strictEqual(fontes.length, Object.keys(FONTES_CALENDARIO).length);
    assert.strictEqual(new Set(fontes.map(f => f.id)).size, fontes.length);
  });

  it('a chave do registro vira o id e o texto lido é preservado', () => {
    const f = fonteCalendarioParaNucleo('stj-gdg-1010', FONTES_CALENDARIO['stj-gdg-1010']);
    assert.strictEqual(f.id, 'stj-gdg-1010');
    assert.strictEqual(f.lido, 'inteiro teor (PDF)');
  });

  it('fonte com URL inválida é recusada, não repassada', () => {
    assert.throws(() => fonteCalendarioParaNucleo('x', { ato: 'a', url: 'sem-url', lido: 'l', lidoEm: '2026-10-07' }));
  });
});

describe('PrazoZero: feriados estaduais nos TRTs, precedência MT 11-20, TJPE e multiestaduais', () => {
  it('feriados estaduais conferidos de PE, RS e GO valem nos TRTs 6, 4 e 18 em qualquer ano', () => {
    const pe2028 = obterFeriadosAno(2028, 'PE', 'TRT6').get('2028-03-06');
    assert.strictEqual(pe2028?.verificacao, 'lei_estadual');
    assert.strictEqual(pe2028?.efeito, 'nao_util');

    const rs2027 = obterFeriadosAno(2027, 'RS', 'TRT4').get('2027-09-20');
    assert.strictEqual(rs2027?.verificacao, 'lei_estadual');
    assert.strictEqual(rs2027?.efeito, 'nao_util');

    const go2028 = obterFeriadosAno(2028, 'GO', 'TRT18').get('2028-10-24');
    assert.strictEqual(go2028?.verificacao, 'lei_estadual');
    assert.strictEqual(go2028?.efeito, 'nao_util');
  });

  it('MT 11-20: a partir de 2024 prevalece o feriado nacional; antes de 2024 vale o histórico estadual MT', () => {
    const mt2027 = obterFeriadosAno(2027, 'MT', 'TJMT').get('2027-11-20');
    assert.strictEqual(mt2027?.tipo, 'nacional');
    assert.strictEqual(mt2027?.verificacao, 'lei_federal');
    assert.match(mt2027?.fundamentoLegal ?? '', /14\.759\/2023/);

    const mt2023 = obterFeriadosAno(2023, 'MT', 'TJMT').get('2023-11-20');
    assert.strictEqual(mt2023?.tipo, 'estadual');
    assert.strictEqual(mt2023?.uf, 'MT');
    assert.strictEqual(mt2023?.verificacao, 'pendente');
    assert.match(mt2023?.fundamentoLegal ?? '', /7\.879\/2002/);
  });

  it('TJPE 2026-05-14 e 2026-05-15 apontam para a fonte verificada do Ato 977/2026 (e 11..13 para o Ato 966/2026)', () => {
    const tjpe = obterFeriadosAno(2026, 'PE', 'TJPE');
    assert.match(tjpe.get('2026-05-11')?.fonte?.ato ?? '', /966\/2026/);
    assert.match(tjpe.get('2026-05-14')?.fonte?.ato ?? '', /977\/2026/);
    assert.match(tjpe.get('2026-05-15')?.fonte?.ato ?? '', /977\/2026/);
  });

  it('TRTs e TRFs multiestaduais são documentados explicitamente e TRFs não herdam tabela estadual', () => {
    assert.deepStrictEqual(TRIBUNAIS_MULTIESTADUAIS.TRT8, ['PA', 'AP']);
    assert.deepStrictEqual(TRIBUNAIS_MULTIESTADUAIS.TRT10, ['DF', 'TO']);
    assert.deepStrictEqual(TRIBUNAIS_MULTIESTADUAIS.TRT11, ['AM', 'RR']);
    assert.deepStrictEqual(TRIBUNAIS_MULTIESTADUAIS.TRT14, ['RO', 'AC']);
    assert.ok(TRIBUNAIS_MULTIESTADUAIS.TRF1.includes('DF') && TRIBUNAIS_MULTIESTADUAIS.TRF5.includes('PE'));
    assert.strictEqual(obterFeriadosAno(2027, 'SP', 'TRF3').get('2027-07-09'), undefined);
  });
});
