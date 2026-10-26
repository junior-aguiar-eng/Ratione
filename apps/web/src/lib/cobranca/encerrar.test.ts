import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { SupabaseClient } from '@supabase/supabase-js';
import { encerrarAssinaturasDoUsuario } from './encerrar';
import { lerConfigCobranca } from './config';

const PRONTA = lerConfigCobranca({ COBRANCA_LIGADA: 'sim', MERCADOPAGO_ACCESS_TOKEN: 'tok', MERCADOPAGO_WEBHOOK_SECRET: 'seg' });
const DESLIGADA = lerConfigCobranca({});

/** Só o que a função usa: from('assinaturas').select().eq().neq(). */
function banco(linhas: Array<{ id: string; mp_assinatura_id: string | null }>, erro: { message: string } | null = null) {
  const filtros: string[] = [];
  const consulta = {
    select: () => consulta,
    eq: (c: string, v: string) => (filtros.push(`${c}=${v}`), consulta),
    neq: (c: string, v: string) => (filtros.push(`${c}!=${v}`), consulta),
    then: (ok: (r: unknown) => void) => ok({ data: erro ? null : linhas, error: erro })
  };
  return { servidor: { from: () => consulta } as unknown as SupabaseClient, filtros };
}

describe('Exclusão da conta: assinatura viva no Mercado Pago', () => {
  it('sem assinatura viva não chama o Mercado Pago, mesmo com a cobrança desligada', async () => {
    const { servidor, filtros } = banco([{ id: 'a1', mp_assinatura_id: null }]);
    const ok = await encerrarAssinaturasDoUsuario(servidor, 'u1', DESLIGADA, () => assert.fail('não deve chamar o Mercado Pago'));
    assert.equal(ok, true, 'a pendente que nunca chegou ao Mercado Pago não cobra nada');
    assert.deepEqual(filtros, ['usuario_id=u1', 'situacao!=cancelada'], 'olha só as assinaturas do usuário que não estão canceladas');
  });

  it('cancela cada assinatura viva no Mercado Pago, com o token da instalação', async () => {
    const cancelados: string[] = [];
    let token = '';
    const { servidor } = banco([{ id: 'a1', mp_assinatura_id: 'mp-1' }, { id: 'a2', mp_assinatura_id: 'mp-2' }, { id: 'a3', mp_assinatura_id: null }]);
    const ok = await encerrarAssinaturasDoUsuario(servidor, 'u1', PRONTA, t => ({ cancelarAssinatura: async id => void (token = t, cancelados.push(id)) }));
    assert.equal(ok, true);
    assert.deepEqual(cancelados, ['mp-1', 'mp-2']);
    assert.equal(token, 'tok');
  });

  it('uma que não cancela: devolve false (a conta não pode ser apagada) e para na primeira falha', async () => {
    const cancelados: string[] = [];
    const { servidor } = banco([{ id: 'a1', mp_assinatura_id: 'mp-1' }, { id: 'a2', mp_assinatura_id: 'mp-2' }]);
    const ok = await encerrarAssinaturasDoUsuario(servidor, 'u1', PRONTA, () => ({
      cancelarAssinatura: async id => {
        cancelados.push(id);
        throw new Error('Mercado Pago respondeu 500');
      }
    }));
    assert.equal(ok, false);
    assert.deepEqual(cancelados, ['mp-1']);
  });

  it('assinatura viva com a cobrança desligada ou sem token: não dá para cancelar, então recusa', async () => {
    const { servidor } = banco([{ id: 'a1', mp_assinatura_id: 'mp-1' }]);
    for (const cfg of [DESLIGADA, lerConfigCobranca({ COBRANCA_LIGADA: 'sim' })]) {
      assert.equal(await encerrarAssinaturasDoUsuario(servidor, 'u1', cfg, () => assert.fail('sem token não chama')), false);
    }
  });

  it('erro ao ler as assinaturas: recusa em vez de apagar às cegas', async () => {
    const { servidor } = banco([], { message: 'banco fora do ar' });
    assert.equal(await encerrarAssinaturasDoUsuario(servidor, 'u1', PRONTA, () => assert.fail('não chega ao Mercado Pago')), false);
  });
});
