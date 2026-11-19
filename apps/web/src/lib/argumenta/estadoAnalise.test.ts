import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { estadoInicialAnalise } from './estadoAnalise';

describe('estadoInicialAnalise', () => {
  it('limpa rotulo, selos, voltouParaQuestao e resultados da analise anterior', () => {
    const inicial = estadoInicialAnalise();

    assert.strictEqual(inicial.enviada, null);
    assert.deepStrictEqual(inicial.resultados, {});
    assert.strictEqual(inicial.resultados.estrutura, undefined);
    assert.strictEqual(inicial.resultados.questoes, undefined);
    assert.strictEqual(inicial.resultados.fundamentos, undefined);
    assert.strictEqual(inicial.analiseId, null);
    assert.strictEqual(inicial.encerrada, false);
    assert.strictEqual(inicial.erro, null);
    assert.strictEqual(inicial.erroDoArquivo, null);
    assert.strictEqual(inicial.andamento, null);
    assert.strictEqual(inicial.aba, 'geral');
    assert.deepStrictEqual(inicial.ativos, []);
    assert.strictEqual(inicial.textoAberto, false);
    assert.strictEqual(inicial.rotulo, '');
    assert.ok(inicial.selos instanceof Map);
    assert.strictEqual(inicial.selos.size, 0);
    assert.strictEqual(inicial.voltouParaQuestao, false);
  });

  it('retorna novas colecoes mutaveis a cada chamada', () => {
    const a = estadoInicialAnalise();
    a.selos.set('CDC, art. 14', { estado: 'nao_localizada', links: [] });
    a.ativos.push(1);

    const b = estadoInicialAnalise();
    assert.strictEqual(b.selos.size, 0);
    assert.deepStrictEqual(b.ativos, []);
  });
});
