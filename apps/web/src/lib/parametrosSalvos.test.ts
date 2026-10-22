import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { lerNormaViva, lerPrazoZero, lerTeseMap, urlDoNormaViva, urlDoPrazoZero, urlDoTeseMap } from './parametrosSalvos';

describe('Parâmetros salvos na URL', () => {
  it('TeseMap: o nó faz a viagem de ida e volta; id com caracteres estranhos é ignorado', () => {
    assert.deepStrictEqual(lerTeseMap(urlDoTeseMap({ noId: 'STJ-TEMA-1076' }).split('?')[1]), { noId: 'STJ-TEMA-1076' });
    assert.deepStrictEqual(lerTeseMap('n=a%20b'), {});
    assert.deepStrictEqual(lerTeseMap('n=' + 'x'.repeat(100)), {});
    assert.deepStrictEqual(lerTeseMap(''), {});
  });

  it('PrazoZero: o que se salva é o que se lê', () => {
    const url = urlDoPrazoZero({ atoId: 'apelacao', tipoEvento: 'disponibilizacao_dje', data: '2026-11-03', tribunalId: 'TJSP', regime: 'cpc_dias_uteis', dobro: true });
    assert.ok(url.startsWith('/prazozero?'));
    assert.deepStrictEqual(lerPrazoZero(url.split('?')[1]), {
      atoId: 'apelacao', tipoEvento: 'disponibilizacao_dje', data: '2026-11-03', tribunalId: 'TJSP', regime: 'cpc_dias_uteis', dobro: true
    });
  });

  it('PrazoZero: prazo personalizado leva dias e nome', () => {
    const url = urlDoPrazoZero({ atoId: 'outro', dias: 12, nome: 'Agravo interno · TJSP', data: '2026-05-04', tribunalId: 'TJSP' });
    const lido = lerPrazoZero(url.split('?')[1]);
    assert.equal(lido.dias, 12);
    assert.equal(lido.nome, 'Agravo interno · TJSP');
  });

  it('PrazoZero: valor inválido ou desconhecido é ignorado', () => {
    assert.deepStrictEqual(lerPrazoZero('ato=inexistente&data=2026-02-30&tribunal=XYZ&regime=x&evento=y&dias=9999'), {});
    assert.deepStrictEqual(lerPrazoZero('ato=outro&dias=0&nome='), { atoId: 'outro' });
  });

  it('NormaViva: dispositivo com acentos, espaços e símbolos faz a viagem de ida e volta', () => {
    const id = 'LEI-13105-2015|corpo|art. 85, § 2º, I';
    const url = urlDoNormaViva({ dispositivoId: id, em: '2024-01-10' });
    assert.deepStrictEqual(lerNormaViva(url.split('?')[1]), { dispositivoId: id, em: '2024-01-10' });
    assert.deepStrictEqual(lerNormaViva('d=x&em=hoje'), { dispositivoId: 'x' });
  });
});
