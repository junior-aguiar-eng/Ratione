import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { lerHistoricoCobrancas, type LinhaCobranca } from './historico';

const linha = (id: string): LinhaCobranca => ({
  id,
  valor_centavos: 2900,
  situacao: 'aprovada',
  meio: 'visa',
  criada_em: '2026-10-23T15:00:00Z',
  paga_em: '2026-10-23T15:00:01Z'
});

/** SDK real, só a fronteira HTTP substituída: confere a consulta que chegará ao PostgREST. */
function cliente(responder: (url: URL) => Response) {
  return createClient('https://banco.exemplo.test', 'chave-publica-de-teste', {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: async input => responder(new URL(String(input))) }
  });
}

describe('Histórico de cobranças (F8-04)', () => {
  it('lê só o usuário e o ambiente informados, com ordem estável e uma linha extra para paginar', async () => {
    const sb = cliente(url => {
      assert.equal(url.pathname, '/rest/v1/cobrancas');
      assert.equal(url.searchParams.get('usuario_id'), 'eq.usuario-ana');
      assert.equal(url.searchParams.get('ambiente'), 'eq.teste');
      assert.equal(url.searchParams.get('order'), 'criada_em.desc,id.desc');
      assert.equal(url.searchParams.get('offset'), '0');
      assert.equal(url.searchParams.get('limit'), '21');
      assert.equal(url.searchParams.get('select'), 'id,valor_centavos,situacao,meio,criada_em,paga_em');
      return Response.json(Array.from({ length: 21 }, (_, i) => linha(String(i))));
    });
    const pagina = await lerHistoricoCobrancas(sb, 'usuario-ana', 'teste');
    assert.equal(pagina.linhas.length, 20);
    assert.equal(pagina.linhas[0].id, '0');
    assert.equal(pagina.linhas[19].id, '19');
    assert.equal(pagina.temMais, true);
  });

  it('a próxima página começa depois das 20 linhas já exibidas, sem perder a linha extra', async () => {
    const sb = cliente(url => {
      assert.equal(url.searchParams.get('ambiente'), 'eq.producao');
      assert.equal(url.searchParams.get('offset'), '20');
      assert.equal(url.searchParams.get('limit'), '21');
      return Response.json([linha('20')]);
    });
    assert.deepEqual(await lerHistoricoCobrancas(sb, 'usuario-ana', 'producao', 1), { linhas: [linha('20')], temMais: false });
  });

  it('uma página com exatamente 20 cobranças não anuncia outra página', async () => {
    const sb = cliente(() => Response.json(Array.from({ length: 20 }, (_, i) => linha(String(i)))));
    const pagina = await lerHistoricoCobrancas(sb, 'usuario-ana', 'producao');
    assert.equal(pagina.linhas.length, 20);
    assert.equal(pagina.temMais, false);
  });

  it('resultado vazio é uma página vazia; erro do banco não vira ausência de cobranças', async () => {
    assert.deepEqual(await lerHistoricoCobrancas(cliente(() => Response.json([])), 'usuario-ana', 'teste'), { linhas: [], temMais: false });
    const sb = cliente(() => Response.json({ message: 'permission denied', code: '42501' }, { status: 403 }));
    await assert.rejects(lerHistoricoCobrancas(sb, 'usuario-ana', 'teste'), /Não foi possível ler as cobranças/);
  });

  it('não consulta sem usuário, com ambiente desconhecido ou paginação inválida', async () => {
    const sb = cliente(() => { assert.fail('não deve fazer requisição'); });
    for (const pagina of [-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER]) {
      await assert.rejects(lerHistoricoCobrancas(sb, 'usuario-ana', 'teste', pagina));
    }
    await assert.rejects(lerHistoricoCobrancas(sb, '', 'teste'));
    await assert.rejects(lerHistoricoCobrancas(sb, 'usuario-ana', 'outro' as 'teste'));
  });
});
