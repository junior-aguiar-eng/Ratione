import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { argumentaIaLigada, tarefaIaLigada } from './politica';

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

describe('tarefaIaLigada', () => {
  it('exige ANTHROPIC_API_KEY e a flag própria de cada tarefa', () => {
    assert.strictEqual(tarefaIaLigada('explicar-dispositivo', { IA_EXPLICACAO_LIGADA: 'sim' }), false);
    assert.strictEqual(
      tarefaIaLigada('explicar-dispositivo', { ANTHROPIC_API_KEY: 'k', IA_EXPLICACAO_LIGADA: 'sim' }),
      true
    );
    assert.strictEqual(
      tarefaIaLigada('relacionar-com-o-caso', { ANTHROPIC_API_KEY: 'k', IA_RELACAO_LIGADA: 'sim' }),
      true
    );
    assert.strictEqual(
      tarefaIaLigada('explicar-dispositivo', { ANTHROPIC_API_KEY: 'k', IA_RELACAO_LIGADA: 'sim' }),
      false
    );
    assert.strictEqual(
      tarefaIaLigada('argumenta-estrutura', { ANTHROPIC_API_KEY: 'k', IA_RELACAO_LIGADA: 'sim' }),
      false
    );
    assert.strictEqual(tarefaIaLigada('ler-intimacao', { ANTHROPIC_API_KEY: 'k', IA_INTIMACAO_LIGADA: 'sim' }), true);
    assert.strictEqual(
      tarefaIaLigada('explicar-precedente', { ANTHROPIC_API_KEY: 'k', IA_PRECEDENTE_LIGADA: 'sim' }),
      true
    );
  });

  it('respeita IA_ARGUMENTA_LIGADA para as 3 etapas do Argumenta e cai para IA_EXPLICACAO_LIGADA se vazia ou ausente', () => {
    for (const etapa of ['argumenta-estrutura', 'argumenta-questoes', 'argumenta-fundamentos'] as const) {
      assert.strictEqual(
        tarefaIaLigada(etapa, { ANTHROPIC_API_KEY: 'k', IA_ARGUMENTA_LIGADA: 'sim', IA_EXPLICACAO_LIGADA: 'nao' }),
        true
      );
      assert.strictEqual(
        tarefaIaLigada(etapa, { ANTHROPIC_API_KEY: 'k', IA_ARGUMENTA_LIGADA: 'nao', IA_EXPLICACAO_LIGADA: 'sim' }),
        false
      );
      assert.strictEqual(
        tarefaIaLigada(etapa, { ANTHROPIC_API_KEY: 'k', IA_EXPLICACAO_LIGADA: 'sim' }),
        true
      );
      assert.strictEqual(
        tarefaIaLigada(etapa, { ANTHROPIC_API_KEY: 'k', IA_ARGUMENTA_LIGADA: '', IA_EXPLICACAO_LIGADA: 'sim' }),
        true
      );
    }
  });

  it('retorna false para tarefa desconhecida', () => {
    assert.strictEqual(
      tarefaIaLigada('outra-tarefa', { ANTHROPIC_API_KEY: 'k', IA_EXPLICACAO_LIGADA: 'sim' }),
      false
    );
  });
});
