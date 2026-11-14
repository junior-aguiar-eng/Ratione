import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { argumentaIaLigada } from './politica';

describe('argumentaIaLigada', () => {
  it('usa NEXT_PUBLIC_ARGUMENTA_IA_LIGADA quando definida como sim', () => {
    assert.strictEqual(argumentaIaLigada({ NEXT_PUBLIC_ARGUMENTA_IA_LIGADA: 'sim' }), true);
    assert.strictEqual(
      argumentaIaLigada({ NEXT_PUBLIC_ARGUMENTA_IA_LIGADA: 'sim', NEXT_PUBLIC_IA_EXPLICACAO: 'nao' }),
      true
    );
  });

  it('respeita NEXT_PUBLIC_ARGUMENTA_IA_LIGADA diferente de sim sem cair no legado', () => {
    assert.strictEqual(
      argumentaIaLigada({ NEXT_PUBLIC_ARGUMENTA_IA_LIGADA: 'nao', NEXT_PUBLIC_IA_EXPLICACAO: 'sim' }),
      false
    );
  });

  it('usa fallback legado NEXT_PUBLIC_IA_EXPLICACAO quando NEXT_PUBLIC_ARGUMENTA_IA_LIGADA esta ausente ou vazia', () => {
    assert.strictEqual(argumentaIaLigada({ NEXT_PUBLIC_IA_EXPLICACAO: 'sim' }), true);
    assert.strictEqual(argumentaIaLigada({ NEXT_PUBLIC_ARGUMENTA_IA_LIGADA: '', NEXT_PUBLIC_IA_EXPLICACAO: 'sim' }), true);
    assert.strictEqual(argumentaIaLigada({ NEXT_PUBLIC_IA_EXPLICACAO: 'nao' }), false);
    assert.strictEqual(argumentaIaLigada({}), false);
  });
});
