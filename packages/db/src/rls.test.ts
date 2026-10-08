import { before, describe, it } from 'node:test';
import assert from 'node:assert';
import type { PGlite } from '@electric-sql/pglite';
import { como, criarBanco, criarUsuario } from './harness';

const INSERIR_ITEM = "insert into public.itens_salvos (usuario_id, modulo, tipo, titulo) values ($1, 'PrazoZero', 'prazo', $2)";

describe('RLS: um usuário nunca acessa dado de outro (F0-06)', () => {
  let db: PGlite;
  let ana: string;
  let beto: string;
  let itemDaAna: string;

  before(async () => {
    db = await criarBanco();
    ana = await criarUsuario(db, 'ana@exemplo.com');
    beto = await criarUsuario(db, 'beto@exemplo.com');
    itemDaAna = await como(db, ana, async tx => {
      const r = await tx.query<{ id: string }>(
        "insert into public.itens_salvos (usuario_id, modulo, tipo, titulo, detalhe, url, dados) values ($1, 'PrazoZero', 'prazo', 'Apelação · TJSP', 'prazo final em 03/11/2026', '/prazozero', '{\"dias\": 15}') returning id",
        [ana]
      );
      return r.rows[0].id;
    });
  });

  it('cada cadastro cria o perfil vazio', async () => {
    const r = await db.query<{ n: number }>('select count(*)::int as n from public.perfis');
    assert.strictEqual(r.rows[0].n, 2);
  });

  it('o dono lê o próprio item; o outro usuário não vê nada', async () => {
    assert.strictEqual((await como(db, ana, tx => tx.query('select id from public.itens_salvos'))).rows.length, 1);
    assert.strictEqual((await como(db, beto, tx => tx.query('select id from public.itens_salvos'))).rows.length, 0);
    assert.strictEqual((await como(db, beto, tx => tx.query('select id from public.itens_salvos where id = $1', [itemDaAna]))).rows.length, 0);
  });

  it('o outro usuário não consegue alterar nem apagar o item (0 linhas afetadas)', async () => {
    const up = await como(db, beto, tx => tx.query("update public.itens_salvos set titulo = 'invadido' where id = $1", [itemDaAna]));
    assert.strictEqual(up.affectedRows, 0);
    const del = await como(db, beto, tx => tx.query('delete from public.itens_salvos where id = $1', [itemDaAna]));
    assert.strictEqual(del.affectedRows, 0);
    const r = await como(db, ana, tx => tx.query<{ titulo: string }>('select titulo from public.itens_salvos where id = $1', [itemDaAna]));
    assert.strictEqual(r.rows[0].titulo, 'Apelação · TJSP');
  });

  it('não é possível gravar item em nome de outro usuário', async () => {
    await assert.rejects(como(db, beto, tx => tx.query(INSERIR_ITEM, [ana, 'forjado'])), /row-level security/);
  });

  it('não é possível passar o item para outro usuário alterando o dono', async () => {
    await assert.rejects(
      como(db, ana, tx => tx.query('update public.itens_salvos set usuario_id = $1 where id = $2', [beto, itemDaAna])),
      /row-level security/
    );
  });

  it('visitante sem login não lê, não grava e não apaga', async () => {
    await assert.rejects(como(db, null, tx => tx.query('select * from public.itens_salvos')), /permission denied/);
    await assert.rejects(como(db, null, tx => tx.query('select * from public.perfis')), /permission denied/);
    await assert.rejects(como(db, null, tx => tx.query(INSERIR_ITEM, [ana, 'x'])), /permission denied/);
    await assert.rejects(como(db, null, tx => tx.query('delete from public.itens_salvos')), /permission denied/);
  });

  it('perfil: cada um lê e altera só o seu, e não troca o id', async () => {
    assert.strictEqual((await como(db, ana, tx => tx.query('select id from public.perfis'))).rows.length, 1);
    const up = await como(db, ana, tx =>
      tx.query("update public.perfis set nome = 'Ana', uf_padrao = 'SP', profissao = 'advogado' where id = $1", [ana])
    );
    assert.strictEqual(up.affectedRows, 1);
    const alheio = await como(db, beto, tx => tx.query("update public.perfis set nome = 'invadido' where id = $1", [ana]));
    assert.strictEqual(alheio.affectedRows, 0);
    await assert.rejects(
      como(db, ana, tx => tx.query('update public.perfis set id = $1 where id = $2', [beto, ana])),
      /row-level security|duplicate key/
    );
    const lido = await como(db, beto, tx => tx.query<{ nome: string | null }>('select nome from public.perfis'));
    assert.strictEqual(lido.rows.length, 1);
    assert.strictEqual(lido.rows[0].nome, null);
  });

  it('perfil não pode ser criado nem apagado pelo usuário (nasce no cadastro e some com a conta)', async () => {
    await assert.rejects(
      como(db, ana, tx => tx.query('insert into public.perfis (id) values (gen_random_uuid())')),
      /row-level security|foreign key/
    );
    const del = await como(db, ana, tx => tx.query('delete from public.perfis where id = $1', [ana]));
    assert.strictEqual(del.affectedRows, 0);
  });

  it('restrições de dados: módulo, URL interna, tamanhos, UF e profissão', async () => {
    const ruim = (sql: string, params: unknown[]) => assert.rejects(como(db, ana, tx => tx.query(sql, params)), /check constraint/);
    await ruim("insert into public.itens_salvos (usuario_id, modulo, tipo, titulo) values ($1, 'Outro', 'prazo', 'x')", [ana]);
    await ruim("insert into public.itens_salvos (usuario_id, modulo, tipo, titulo, url) values ($1, 'PrazoZero', 'prazo', 'x', 'https://externo.com')", [ana]);
    await ruim(INSERIR_ITEM, [ana, '']);
    await ruim(INSERIR_ITEM, [ana, 'a'.repeat(301)]);
    await ruim("update public.perfis set uf_padrao = 'sp' where id = $1", [ana]);
    await ruim("update public.perfis set profissao = 'hacker' where id = $1", [ana]);
  });

  it('atualizar o perfil renova atualizado_em', async () => {
    const antes = await db.query<{ t: string }>('select atualizado_em as t from public.perfis where id = $1', [ana]);
    await new Promise(r => setTimeout(r, 15));
    await como(db, ana, tx => tx.query("update public.perfis set oab = 'SP 000000' where id = $1", [ana]));
    const depois = await db.query<{ t: string }>('select atualizado_em as t from public.perfis where id = $1', [ana]);
    assert.ok(new Date(depois.rows[0].t).getTime() > new Date(antes.rows[0].t).getTime());
  });

  it('excluir a conta apaga o perfil e os itens (LGPD, art. 18)', async () => {
    const carla = await criarUsuario(db, 'carla@exemplo.com');
    await como(db, carla, tx => tx.query(INSERIR_ITEM, [carla, 'Tema 1.076']));
    await db.query('delete from auth.users where id = $1', [carla]);
    assert.strictEqual((await db.query('select 1 from public.perfis where id = $1', [carla])).rows.length, 0);
    assert.strictEqual((await db.query('select 1 from public.itens_salvos where usuario_id = $1', [carla])).rows.length, 0);
  });

  it('todas as tabelas do schema public têm RLS ligada', async () => {
    const r = await db.query<{ tabela: string }>(
      "select c.relname as tabela from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity"
    );
    assert.deepStrictEqual(r.rows.map(x => x.tabela), []);
  });
});
