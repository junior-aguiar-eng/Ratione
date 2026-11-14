import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { SupabaseClient } from '@supabase/supabase-js';
import { apagarAnalisesSalvas, apagarDocumentos } from '../../../../lib/conta/excluirDependencias';

type ResultadoConsulta = { data?: unknown; error?: { message: string; code?: string } | null };

function clienteFalso(opcoes: {
  tabela?: (nome: string, acao: 'select' | 'delete') => ResultadoConsulta;
  storage?: (bucket: string) => ResultadoConsulta;
}): SupabaseClient {
  return {
    from(tabela: string) {
      return {
        select() {
          return {
            eq() {
              return {
                order() {
                  return {
                    limit: async () => opcoes.tabela?.(tabela, 'select') ?? { data: [], error: null }
                  };
                }
              };
            }
          };
        },
        delete() {
          return {
            in: async () => opcoes.tabela?.(tabela, 'delete') ?? { data: null, error: null }
          };
        }
      };
    },
    storage: {
      from(bucket: string) {
        return {
          remove: async () => opcoes.storage?.(bucket) ?? { data: null, error: null }
        };
      }
    }
  } as unknown as SupabaseClient;
}

describe('Exclusão de conta: remoção tolerante de documentos e análises salvas', () => {
  it('apagarDocumentos conclui sem erro quando a tabela ou o bucket ainda não existem', async () => {
    const semTabela = clienteFalso({
      tabela: () => ({ data: null, error: { message: 'relation "public.documentos" does not exist', code: '42P01' } })
    });
    assert.equal(await apagarDocumentos(semTabela, 'u1'), true);

    const semBucket = clienteFalso({
      tabela: (_t, acao) =>
        acao === 'select'
          ? {
              data: [
                {
                  id: 'd1',
                  usuario_id: 'u1',
                  tipo: 'pdf',
                  tamanho_bytes: 10,
                  caminho: 'u1/d1',
                  criado_em: '2026-10-01T00:00:00Z',
                  expira_em: '2026-10-08T00:00:00Z'
                }
              ],
              error: null
            }
          : { data: null, error: null },
      storage: () => ({ data: null, error: { message: 'Bucket not found' } })
    });
    assert.equal(await apagarDocumentos(semBucket, 'u1'), true);

    const notFound = clienteFalso({
      tabela: () => ({ data: null, error: { message: 'not found' } })
    });
    assert.equal(await apagarDocumentos(notFound, 'u1'), true);
  });

  it('apagarAnalisesSalvas conclui sem erro quando a tabela ou o bucket ainda não existem', async () => {
    const semTabela = clienteFalso({
      tabela: () => ({ data: null, error: { message: 'relation "public.analises_salvas" does not exist', code: '42P01' } })
    });
    assert.equal(await apagarAnalisesSalvas(semTabela, 'u1'), true);

    const semBucket = clienteFalso({
      tabela: (_t, acao) =>
        acao === 'select'
          ? {
              data: [
                {
                  id: 'a1',
                  usuario_id: 'u1',
                  caminho: 'u1/a1',
                  rotulo: null,
                  tamanho_bytes: 10,
                  citacoes: [],
                  criado_em: '2026-10-01T00:00:00Z',
                  expira_em: null
                }
              ],
              error: null
            }
          : { data: null, error: null },
      storage: () => ({ data: null, error: { message: 'Bucket not found' } })
    });
    assert.equal(await apagarAnalisesSalvas(semBucket, 'u1'), true);
  });

  it('erros inesperados em apagarDocumentos e apagarAnalisesSalvas continuam propagando', async () => {
    const erroReal = clienteFalso({
      tabela: () => ({ data: null, error: { message: 'permission denied for table documentos' } })
    });
    await assert.rejects(() => apagarDocumentos(erroReal, 'u1'), /permission denied/);
    await assert.rejects(() => apagarAnalisesSalvas(erroReal, 'u1'), /permission denied/);
  });
});
