import { before, after, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { PGlite } from '@electric-sql/pglite';
import { como, criarBanco, criarUsuario } from './harness';

type Tx = Parameters<Parameters<PGlite['transaction']>[0]>[0];
const servidor = <T>(db: PGlite, fn: (tx: Tx) => Promise<T>) => db.transaction(async tx => { await tx.exec('set local role service_role'); return fn(tx); });
const limpar = (db: PGlite) => servidor(db, tx => tx.query<{ r: Record<string, number> }>('select public.limpar_dados_vencidos() as r')).then(r => r.rows[0].r);
const ids = async (db: PGlite, tabela: string, coluna: string) => (await db.query<Record<string, string>>(`select ${coluna} from public.${tabela} order by ${coluna}`)).rows.map(x => x[coluna]);

/** Cria um usuário com uma assinatura e uma cobrança (a cobrança tem a data e o ambiente pedidos). */
async function comCobranca(db: PGlite, email: string, ambiente: 'teste' | 'producao', pagamento: string, idade: string) {
  const u = await criarUsuario(db, email, { termos_versao: '1.0' });
  const a = await db.query<{ id: string }>(
    "insert into public.assinaturas (usuario_id, plano_id, situacao, ambiente, mp_assinatura_id, valor_centavos, atualizada_em) values ($1, 'essencial', 'cancelada', $2, $3, 2900, now() - $4::interval) returning id",
    [u, ambiente, `mp-${pagamento}`, idade]
  );
  await db.query(
    "insert into public.cobrancas (usuario_id, assinatura_id, mp_pagamento_id, ambiente, valor_centavos, situacao, meio, criada_em) values ($1, $2, $3, $4, 2900, 'aprovada', 'visa', now() - $5::interval)",
    [u, a.rows[0].id, pagamento, ambiente, idade]
  );
  return { u, assinaturaId: a.rows[0].id };
}

describe('Retenção fiscal: o registro financeiro sobrevive à conta, sem identificar a pessoa', () => {
  let db: PGlite;
  before(async () => { db = await criarBanco(); });
  after(async () => { await db?.close(); });

  it('excluir a conta apaga o resto, mas mantém a cobrança e a assinatura com o dono nulo e só os dados mínimos', async () => {
    const { u } = await comCobranca(db, 'excluida@exemplo.com', 'producao', 'pg-excluida', '10 days');
    await db.query("insert into public.itens_salvos (usuario_id, modulo, tipo, titulo, url) values ($1, 'PrazoZero', 'prazo', 'x', '/prazozero')", [u]);
    await db.query('delete from auth.users where id = $1', [u]);

    assert.equal(Number((await db.query<{ n: string }>('select count(*) as n from public.perfis')).rows[0].n), 0);
    assert.equal(Number((await db.query<{ n: string }>('select count(*) as n from public.itens_salvos')).rows[0].n), 0);
    const c = await db.query<Record<string, unknown>>("select * from public.cobrancas where mp_pagamento_id = 'pg-excluida'");
    assert.equal(c.rows.length, 1);
    assert.equal(c.rows[0].usuario_id, null, 'sem vínculo com a pessoa');
    assert.deepEqual(
      { valor: c.rows[0].valor_centavos, situacao: c.rows[0].situacao, meio: c.rows[0].meio, ambiente: c.rows[0].ambiente, plano: c.rows[0].plano_id },
      { valor: 2900, situacao: 'aprovada', meio: 'visa', ambiente: 'producao', plano: 'essencial' }
    );
    const a = await db.query<{ usuario_id: string | null; mp_assinatura_id: string }>("select usuario_id, mp_assinatura_id from public.assinaturas where mp_assinatura_id = 'mp-pg-excluida'");
    assert.deepEqual(a.rows, [{ usuario_id: null, mp_assinatura_id: 'mp-pg-excluida' }]);
  });

  it('a linha sem dono é invisível para visitante e para outros usuários; só o servidor lê', async () => {
    const outro = await criarUsuario(db, 'outro@exemplo.com', { termos_versao: '1.0' });
    for (const quem of [null, outro]) {
      assert.equal((await como(db, quem, tx => tx.query("select 1 from public.cobrancas where mp_pagamento_id = 'pg-excluida'").catch(() => ({ rows: [] })))).rows.length, 0);
      assert.equal((await como(db, quem, tx => tx.query("select 1 from public.assinaturas where mp_assinatura_id = 'mp-pg-excluida'").catch(() => ({ rows: [] })))).rows.length, 0);
    }
    assert.equal((await servidor(db, tx => tx.query("select 1 from public.cobrancas where mp_pagamento_id = 'pg-excluida'"))).rows.length, 1);
  });

  it('cobrança que chega depois da exclusão da conta é registrada sem dono (o Mercado Pago não reenvia para sempre)', async () => {
    const a = await db.query<{ id: string }>("select id from public.assinaturas where mp_assinatura_id = 'mp-pg-excluida'");
    await servidor(db, tx => tx.query("select public.cobranca_registrar($1, 'pg-tardia', 2900, 'aprovada', 'visa', now())", [a.rows[0].id]));
    const c = await db.query<{ usuario_id: string | null; ambiente: string }>("select usuario_id, ambiente from public.cobrancas where mp_pagamento_id = 'pg-tardia'");
    assert.deepEqual(c.rows, [{ usuario_id: null, ambiente: 'producao' }]);
    await assert.rejects(servidor(db, tx => tx.query("select public.cobranca_registrar('00000000-0000-4000-8000-00000000ffff', 'pg-x', 1, 'aprovada', null, null)")), /assinatura_inexistente/);
  });

  it('a limpeza: teste sem dono sai na hora; produção sem dono fica 5 anos; quem ainda tem conta não expira', async () => {
    const teste = await comCobranca(db, 'teste-excluido@exemplo.com', 'teste', 'pg-teste', '1 day');
    const velha = await comCobranca(db, 'velha@exemplo.com', 'producao', 'pg-velha', '5 years 10 days');
    const quase = await comCobranca(db, 'quase@exemplo.com', 'producao', 'pg-quase', '4 years 11 months');
    const viva = await comCobranca(db, 'viva@exemplo.com', 'producao', 'pg-viva', '6 years');
    for (const x of [teste, velha, quase]) await db.query('delete from auth.users where id = $1', [x.u]);

    const r = await limpar(db);
    assert.equal(r.cobrancas_sem_dono, 2, 'a de teste e a de produção com mais de 5 anos');
    assert.equal(r.assinaturas_sem_dono, 2);
    assert.deepEqual(await ids(db, 'cobrancas', 'mp_pagamento_id'), ['pg-excluida', 'pg-quase', 'pg-tardia', 'pg-viva']);
    assert.ok((await ids(db, 'assinaturas', 'mp_assinatura_id')).includes('mp-pg-quase'));
    assert.ok(!(await ids(db, 'assinaturas', 'mp_assinatura_id')).includes('mp-pg-velha'));
    assert.equal((await db.query('select 1 from auth.users where id = $1', [viva.u])).rows.length, 1, 'a conta viva e a cobrança dela continuam');
  });

  it('é idempotente: rodar de novo não apaga mais nada', async () => {
    const r = await limpar(db);
    assert.equal(r.cobrancas_sem_dono, 0);
    assert.equal(r.assinaturas_sem_dono, 0);
  });
});
