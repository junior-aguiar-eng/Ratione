import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { idsParaBuscarCitacoes, ligacoesDoPrazo, precedentesQueCitam, prazosDoDispositivo } from './ligacoes';
import { lerNormaViva } from './parametrosSalvos';

describe('Ligações entre as ferramentas', () => {
  it('o prazo abre cada artigo do fundamento no NormaViva, na redação da data do cálculo', () => {
    const l = ligacoesDoPrazo('embargos-declaracao', '2026-03-10');
    assert.deepStrictEqual(l.map(x => x.rotulo), ['CPC, art. 1.023']);
    const volta = lerNormaViva(l[0].href.split('?')[1]);
    assert.deepStrictEqual(volta, { dispositivoId: 'LEI-13105-2015|corpo|art. 1.023', em: '2026-03-10' });
  });

  it('data ausente ou inválida não vai para a URL, e prazo sem fundamento (personalizado) não tem ligação', () => {
    assert.ok(!ligacoesDoPrazo('apelacao', '').some(x => x.href.includes('em=')));
    assert.ok(!ligacoesDoPrazo('apelacao', '2026-02-30').some(x => x.href.includes('em=')));
    assert.deepStrictEqual(ligacoesDoPrazo('outro', '2026-03-10'), []);
  });

  it('a norma trabalhista e a criminal mostram a sigla certa', () => {
    assert.deepStrictEqual(ligacoesDoPrazo('agravo-peticao').map(x => x.rotulo), ['CLT, art. 897, a)']);
    assert.deepStrictEqual(ligacoesDoPrazo('apelacao-criminal').map(x => x.rotulo), ['CPP, art. 593']);
  });

  it('o artigo aponta para os prazos que fundamenta, e o dispositivo sem prazo não tem ligação', () => {
    const l = prazosDoDispositivo('LEI-13105-2015|corpo|art. 1.023');
    assert.deepStrictEqual(l.map(x => x.rotulo), ['Embargos de declaração']);
    assert.strictEqual(l[0].href, '/prazozero?ato=embargos-declaracao');
    assert.deepStrictEqual(prazosDoDispositivo('LEI-13105-2015|corpo|art. 85'), []);
  });

  it('a busca de citações inclui o artigo quando o dispositivo é um parágrafo', () => {
    assert.deepStrictEqual(idsParaBuscarCitacoes('LEI-13105-2015|corpo|art. 85'), ['LEI-13105-2015|corpo|art. 85']);
    assert.deepStrictEqual(idsParaBuscarCitacoes('LEI-13105-2015|corpo|art. 85, § 2º, I'), ['LEI-13105-2015|corpo|art. 85, § 2º, I', 'LEI-13105-2015|corpo|art. 85']);
    assert.deepStrictEqual(idsParaBuscarCitacoes('estranho'), ['estranho']);
  });

  it('precedentes que citam: junta as buscas sem repetir, e falha de leitura vira lista vazia', async () => {
    const chamadas: unknown[] = [];
    const banco = (resp: (alvo: unknown) => { data: unknown; error: unknown }) =>
      ({
        from: () => ({
          select: () => ({
            contains: (_c: string, alvo: unknown) => ({
              order: () => ({
                limit: async () => {
                  chamadas.push(alvo);
                  return resp(alvo);
                }
              })
            })
          })
        })
      }) as never;

    const unico = await precedentesQueCitam(
      banco(() => ({ data: [{ id: 'STJ-TEMA-1076', rotulo: 'Tema 1.076/STJ', tipo: 'tema' }], error: null })),
      'LEI-13105-2015|corpo|art. 85, § 2º'
    );
    assert.strictEqual(chamadas.length, 2, 'busca o parágrafo e o artigo');
    assert.deepStrictEqual(unico, { itens: [{ rotulo: 'Tema 1.076/STJ', href: '/tesemap?n=STJ-TEMA-1076' }], temMais: false });

    assert.deepStrictEqual(await precedentesQueCitam(banco(() => ({ data: null, error: { message: 'x' } })), 'LEI-13105-2015|corpo|art. 85'), { itens: [], temMais: false });
  });

  it('precedentes que citam: com mais do que o limite, mostra os primeiros em ordem e avisa que há mais', async () => {
    const nos = Array.from({ length: 9 }, (_, i) => ({ id: `STJ-TEMA-${100 + i}`, rotulo: `Tema ${100 + i}`, tipo: 'tema' }));
    const banco = {
      from: () => ({ select: () => ({ contains: () => ({ order: () => ({ limit: async () => ({ data: [...nos].reverse(), error: null }) }) }) }) })
    } as never;
    const r = await precedentesQueCitam(banco, 'LEI-13105-2015|corpo|art. 85');
    assert.strictEqual(r.itens.length, 8);
    assert.strictEqual(r.itens[0].rotulo, 'Tema 100');
    assert.strictEqual(r.temMais, true);
  });
});
