import { before, describe, it } from 'node:test';
import assert from 'node:assert';
import type { PGlite } from '@electric-sql/pglite';
import { como, criarBanco, criarUsuario } from './harness';

const INSERIR = "insert into public.lembretes_prazo (usuario_id, titulo, tribunal, vencimento) values ($1, $2, 'TJSP', '2027-03-10') returning id";

describe('RLS dos lembretes de prazo por e-mail (F2-10)', () => {
  let db: PGlite;
  let ana: string;
  let beto: string;
  let lembreteDaAna: string;

  before(async () => {
    db = await criarBanco();
    ana = await criarUsuario(db, 'ana@exemplo.com');
    beto = await criarUsuario(db, 'beto@exemplo.com');
    lembreteDaAna = await como(db, ana, async tx => (await tx.query<{ id: string }>(INSERIR, [ana, 'Apelação · TJSP'])).rows[0].id);
  });

  it('o dono lê o próprio lembrete; o outro usuário não vê nada', async () => {
    assert.strictEqual((await como(db, ana, tx => tx.query('select id from public.lembretes_prazo'))).rows.length, 1);
    assert.strictEqual((await como(db, beto, tx => tx.query('select id from public.lembretes_prazo'))).rows.length, 0);
  });

  it('não é possível criar lembrete em nome de outro usuário', async () => {
    await assert.rejects(como(db, beto, tx => tx.query(INSERIR, [ana, 'forjado'])), /row-level security/);
  });

  it('quem cria não pode nascer com o envio já marcado (não dá para silenciar nem forçar o aviso)', async () => {
    await assert.rejects(
      como(db, ana, tx =>
        tx.query("insert into public.lembretes_prazo (usuario_id, titulo, vencimento, enviado_3_dias_em) values ($1, 'x', '2027-03-10', now())", [ana])
      ),
      /row-level security/
    );
  });

  it('o usuário não altera lembrete algum (não há permissão de update): nem para apagar a marca de envio', async () => {
    await assert.rejects(
      como(db, ana, tx => tx.query('update public.lembretes_prazo set enviado_3_dias_em = null where id = $1', [lembreteDaAna])),
      /permission denied/
    );
  });

  it('o outro usuário não apaga o lembrete (0 linhas); o dono apaga o seu', async () => {
    const outro = await como(db, beto, tx => tx.query('delete from public.lembretes_prazo where id = $1', [lembreteDaAna]));
    assert.strictEqual(outro.affectedRows, 0);
    const proprio = await como(db, ana, async tx => {
      const id = (await tx.query<{ id: string }>(INSERIR, [ana, 'a apagar'])).rows[0].id;
      return tx.query('delete from public.lembretes_prazo where id = $1', [id]);
    });
    assert.strictEqual(proprio.affectedRows, 1);
  });

  it('visitante sem login não lê nem grava', async () => {
    await assert.rejects(como(db, null, tx => tx.query('select * from public.lembretes_prazo')), /permission denied/);
    await assert.rejects(como(db, null, tx => tx.query(INSERIR, [ana, 'anon'])), /permission denied/);
  });

  it('o lembrete precisa avisar em pelo menos um dos dois momentos; o título não pode ser vazio nem passar de 200', async () => {
    await assert.rejects(
      como(db, ana, tx =>
        tx.query("insert into public.lembretes_prazo (usuario_id, titulo, vencimento, avisar_3_dias, avisar_1_dia) values ($1, 'x', '2027-03-10', false, false)", [ana])
      ),
      /check/
    );
    await assert.rejects(como(db, ana, tx => tx.query(INSERIR, [ana, ''])), /check/);
    await assert.rejects(como(db, ana, tx => tx.query(INSERIR, [ana, 'x'.repeat(201)])), /check/);
  });

  it('a chave de serviço (o envio diário) marca o aviso como enviado, e o usuário vê a marca', async () => {
    await db.transaction(async tx => {
      await tx.exec('set local role service_role');
      const r = await tx.query('update public.lembretes_prazo set enviado_3_dias_em = now() where id = $1', [lembreteDaAna]);
      assert.strictEqual(r.affectedRows, 1);
    });
    const visto = await como(db, ana, tx => tx.query<{ enviado: boolean }>('select enviado_3_dias_em is not null as enviado from public.lembretes_prazo where id = $1', [lembreteDaAna]));
    assert.strictEqual(visto.rows[0].enviado, true);
  });

  it('há um teto de 200 lembretes ativos por conta', async () => {
    const carlos = await criarUsuario(db, 'carlos@exemplo.com');
    await db.query(
      "insert into public.lembretes_prazo (usuario_id, titulo, vencimento) select $1, 'l' || g, current_date + 30 from generate_series(1, 200) g",
      [carlos]
    );
    await assert.rejects(
      como(db, carlos, tx => tx.query("insert into public.lembretes_prazo (usuario_id, titulo, vencimento) values ($1, 'a mais', current_date + 30)", [carlos])),
      /limite de 200/
    );
  });

  it('excluir a conta apaga os lembretes junto', async () => {
    const dora = await criarUsuario(db, 'dora@exemplo.com');
    await db.query(INSERIR, [dora, 'da Dora']);
    await db.query('delete from auth.users where id = $1', [dora]);
    const r = await db.query<{ n: number }>('select count(*)::int as n from public.lembretes_prazo where usuario_id = $1', [dora]);
    assert.strictEqual(r.rows[0].n, 0);
  });
});
