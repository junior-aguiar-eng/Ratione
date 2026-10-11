import { before, describe, it } from 'node:test';
import assert from 'node:assert';
import type { PGlite } from '@electric-sql/pglite';
import { aplicarMigracao, como, criarBanco, criarUsuario } from './harness';

interface Aceite {
  versao: string | null;
  origem: string;
  aceito_em: Date | string;
}

const LER = 'select versao, origem, aceito_em from public.aceites_termos where usuario_id = $1';

describe('Aceite dos Termos gravado pelo servidor (F1-02)', () => {
  let db: PGlite;
  let ana: string;
  let beto: string;

  before(async () => {
    db = await criarBanco();
    ana = await criarUsuario(db, 'ana@exemplo.com', { termos_versao: '1.0' });
    beto = await criarUsuario(db, 'beto@exemplo.com', { termos_versao: '1.0' });
  });

  it('o cadastro grava a versão declarada e o horário do banco', async () => {
    const r = await db.query<Aceite>(LER, [ana]);
    assert.strictEqual(r.rows.length, 1);
    assert.strictEqual(r.rows[0].versao, '1.0');
    assert.strictEqual(r.rows[0].origem, 'cadastro');
    const idade = Date.now() - new Date(r.rows[0].aceito_em).getTime();
    assert.ok(Math.abs(idade) < 60_000, 'aceito_em deve ser o agora do banco');
  });

  it('um horário enviado pelo navegador no cadastro é ignorado', async () => {
    const id = await criarUsuario(db, 'forjado@exemplo.com', { termos_versao: '1.0', termos_aceitos_em: '2020-01-01T00:00:00Z' });
    const r = await db.query<Aceite>(LER, [id]);
    assert.ok(new Date(r.rows[0].aceito_em).getUTCFullYear() >= 2026);
  });

  it('cadastro sem versão ou com valor fora do formato fica com versão nula (e a linha existe)', async () => {
    for (const [i, metadados] of [{}, { termos_versao: '1.0; drop table x' }, { termos_versao: ['1.0'] }, { termos_versao: '' }].entries()) {
      const id = await criarUsuario(db, `sem${i}@exemplo.com`, metadados);
      const r = await db.query<Aceite>(LER, [id]);
      assert.strictEqual(r.rows.length, 1, JSON.stringify(metadados));
      assert.strictEqual(r.rows[0].versao, null, JSON.stringify(metadados));
    }
  });

  it('o usuário lê o próprio aceite e não vê o de outro', async () => {
    assert.strictEqual((await como(db, ana, tx => tx.query<Aceite>('select * from public.aceites_termos'))).rows.length, 1);
    assert.strictEqual((await como(db, beto, tx => tx.query<Aceite>('select usuario_id from public.aceites_termos where usuario_id = $1', [ana]))).rows.length, 0);
  });

  it('o usuário não cria, altera nem apaga aceite (nem o próprio); visitante não lê nada', async () => {
    await assert.rejects(como(db, ana, tx => tx.query("insert into public.aceites_termos (usuario_id, versao) values ($1, '9.9')", [ana])), /permission denied/);
    await assert.rejects(como(db, ana, tx => tx.query("update public.aceites_termos set versao = '9.9'")), /permission denied/);
    await assert.rejects(como(db, ana, tx => tx.query('delete from public.aceites_termos')), /permission denied/);
    await assert.rejects(como(db, null, tx => tx.query('select * from public.aceites_termos')), /permission denied/);
  });

  it('o gatilho só roda no banco: o usuário não executa a função direto', async () => {
    await assert.rejects(como(db, ana, tx => tx.query('select public.registrar_aceite()')), /permission denied/);
  });

  it('excluir a conta apaga o aceite junto (em cascata)', async () => {
    const id = await criarUsuario(db, 'saindo@exemplo.com', { termos_versao: '1.0' });
    await db.query('delete from auth.users where id = $1', [id]);
    assert.strictEqual((await db.query(LER, [id])).rows.length, 0);
  });

  it('contas que já existiam ganham o registro com a data do cadastro, sem versão e marcado como anterior', async () => {
    const antigo = await criarBanco('20261011000002');
    const id = await criarUsuario(antigo, 'antiga@exemplo.com');
    await antigo.query("update auth.users set created_at = '2026-10-08T12:00:00Z' where id = $1", [id]);
    await aplicarMigracao(antigo, '20261011000003_aceites_termos');
    const r = await antigo.query<Aceite>(LER, [id]);
    assert.strictEqual(r.rows.length, 1);
    assert.strictEqual(r.rows[0].versao, null);
    assert.strictEqual(r.rows[0].origem, 'anterior_ao_registro');
    assert.strictEqual(new Date(r.rows[0].aceito_em).toISOString(), '2026-10-08T12:00:00.000Z');
  });
});
