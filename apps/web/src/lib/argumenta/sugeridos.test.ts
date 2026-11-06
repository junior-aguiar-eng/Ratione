import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { LIMITE_DE_SUGERIDOS, sugeridosDaQuestao, type LeitorDeSugeridos } from './sugeridos';
import type { PrecedenteQueCita } from '../ligacoes';

const prec = (id: string, extra: Partial<PrecedenteQueCita> = {}): PrecedenteQueCita => ({
  rotulo: `Precedente ${id}`,
  href: `/tesemap?n=${id}`,
  tribunal: 'STJ',
  tese: '',
  vinculante: false,
  ...extra
});

const leitor = (parcial: Partial<LeitorDeSugeridos>): LeitorDeSugeridos => ({
  citamODispositivo: async () => ({ itens: [], temMais: false }),
  ligadosAoNo: async () => [],
  ...parcial
});

const ARTIGO = { rotulo: 'CPC, art. 85', href: '/normaviva?d=LEI-13105-2015%7Ccorpo%7Cart.+85' };
const TEMA = { rotulo: 'Tema 1076 do STJ', href: '/tesemap?n=STJ-TEMA-1076' };

describe('Sugeridos sob a questão (F5-08, fase 3)', () => {
  it('do artigo da decisão, os precedentes que o citam; do precedente, os que a fonte liga a ele', async () => {
    const r = await sugeridosDaQuestao(
      leitor({
        citamODispositivo: async id => {
          assert.strictEqual(id, 'LEI-13105-2015|corpo|art. 85');
          return { itens: [prec('STJ-TEMA-9')], temMais: false };
        },
        ligadosAoNo: async id => {
          assert.strictEqual(id, 'STJ-TEMA-1076');
          return [{ id: 'STF-RG-1255', rotulo: 'Tema 1255 do STF', tribunal: 'STF' }];
        }
      }),
      [ARTIGO, TEMA]
    );
    assert.deepStrictEqual(r.itens.map(i => [i.rotulo, i.motivo, i.origem]), [
      ['Precedente STJ-TEMA-9', 'cita', 'CPC, art. 85'],
      ['Tema 1255 do STF', 'ligado', 'Tema 1076 do STJ']
    ]);
    assert.strictEqual(r.itens[1].href, '/tesemap?n=STF-RG-1255');
  });

  it('não sugere de volta o que a decisão já citou na questão, nem repete o mesmo precedente', async () => {
    const r = await sugeridosDaQuestao(
      leitor({
        citamODispositivo: async () => ({ itens: [prec('STJ-TEMA-1076'), prec('STJ-TEMA-9')], temMais: false }),
        ligadosAoNo: async () => [{ id: 'STJ-TEMA-9', rotulo: 'Precedente STJ-TEMA-9', tribunal: 'STJ' }]
      }),
      [ARTIGO, TEMA]
    );
    assert.deepStrictEqual(r.itens.map(i => i.href), ['/tesemap?n=STJ-TEMA-9']);
    assert.strictEqual(r.itens[0].motivo, 'cita');
  });

  it('vinculantes vêm na frente e o excedente do limite é avisado', async () => {
    const muitos = Array.from({ length: LIMITE_DE_SUGERIDOS + 2 }, (_, i) => prec(`STJ-TEMA-${100 + i}`, { vinculante: i === LIMITE_DE_SUGERIDOS + 1 }));
    const r = await sugeridosDaQuestao(leitor({ citamODispositivo: async () => ({ itens: muitos, temMais: false }) }), [ARTIGO]);
    assert.strictEqual(r.itens.length, LIMITE_DE_SUGERIDOS);
    assert.strictEqual(r.itens[0].vinculante, true);
    assert.strictEqual(r.temMais, true);
  });

  it('uma consulta que falha não derruba as outras, e sem citação conferida não há sugestão', async () => {
    const r = await sugeridosDaQuestao(
      leitor({
        citamODispositivo: async () => {
          throw new Error('fora do ar');
        },
        ligadosAoNo: async () => [{ id: 'STF-RG-1255', rotulo: 'Tema 1255 do STF', tribunal: 'STF' }]
      }),
      [ARTIGO, TEMA]
    );
    assert.deepStrictEqual(r.itens.map(i => i.rotulo), ['Tema 1255 do STF']);
    assert.deepStrictEqual(await sugeridosDaQuestao(leitor({}), []), { itens: [], temMais: false });
    assert.deepStrictEqual(await sugeridosDaQuestao(leitor({}), [{ rotulo: 'x', href: '/normaviva' }]), { itens: [], temMais: false });
  });

  it('consulta só as primeiras citações e uma vez cada', async () => {
    let chamadas = 0;
    const links = Array.from({ length: 8 }, (_, i) => ({ rotulo: `Art. ${i}`, href: `/normaviva?d=N%7Ccorpo%7Cart.+${i}` }));
    await sugeridosDaQuestao(leitor({ citamODispositivo: async () => { chamadas++; return { itens: [], temMais: false }; } }), [...links, links[0]]);
    assert.strictEqual(chamadas, 4);
  });
});
