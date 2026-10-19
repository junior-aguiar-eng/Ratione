import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { carregar, contar, type ClienteCarga } from './carregar-supabase';
import { linhasDoCorpus } from './carga';

/** Cliente falso que registra as chamadas, na ordem. */
function clienteFalso(falhaEm?: string) {
  const chamadas: string[] = [];
  const contagem: Record<string, number> = {};
  const cliente: ClienteCarga = {
    from: tabela => ({
      insert: async linhas => {
        chamadas.push(`insert ${tabela} ${linhas.length}`);
        contagem[tabela] = (contagem[tabela] ?? 0) + linhas.length;
        return { error: falhaEm === tabela ? { message: 'violação simulada' } : null };
      },
      delete: () => ({
        neq: async () => {
          chamadas.push(`delete ${tabela}`);
          return { error: null };
        }
      }),
      select: async () => ({ count: contagem[tabela] ?? 0, error: null })
    }),
    rpc: async funcao => {
      chamadas.push(`rpc ${funcao}`);
      return { data: 7, error: null };
    }
  };
  return { cliente, chamadas };
}

describe('Carga no Supabase (F3-05)', () => {
  const linhas = linhasDoCorpus(join(__dirname, '..', '..', 'corpus'), ['LEI-12016-2009', 'LEI-9307-1996']);

  it('apaga primeiro, insere na ordem das chaves estrangeiras, em lotes de até 1.000, e resolve os destinos no fim', async () => {
    const { cliente, chamadas } = clienteFalso();
    const confirmado = await carregar(cliente, linhas);
    assert.strictEqual(chamadas[0], 'delete normas');
    assert.strictEqual(chamadas[1], 'insert normas 2');
    const primeiraTabela = (t: string) => chamadas.findIndex(c => c.startsWith(`insert ${t}`));
    assert.ok(primeiraTabela('normas') < primeiraTabela('dispositivos') && primeiraTabela('dispositivos') < primeiraTabela('versoes_dispositivo') && primeiraTabela('versoes_dispositivo') < primeiraTabela('relacoes'));
    assert.strictEqual(chamadas[chamadas.length - 1], 'rpc resolver_destinos_relacoes');
    assert.ok(chamadas.filter(c => c.startsWith('insert')).every(c => Number(c.split(' ')[2]) <= 1000));
    assert.deepStrictEqual(confirmado, contar(linhas), 'a contagem devolvida é a do que foi inserido');
  });

  it('erro numa tabela interrompe a carga com a etapa no aviso', async () => {
    const { cliente, chamadas } = clienteFalso('dispositivos');
    await assert.rejects(carregar(cliente, linhas), /inserir dispositivos \(lote 1\): violação simulada/);
    assert.ok(!chamadas.some(c => c.startsWith('insert versoes_dispositivo')), 'não segue para as versões depois do erro');
  });
});
