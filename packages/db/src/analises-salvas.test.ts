import { before, describe, it } from 'node:test';
import assert from 'node:assert';
import type { PGlite } from '@electric-sql/pglite';
import { como, criarBanco, criarUsuario } from './harness';

const INSERIR = `insert into public.analises_salvas (usuario_id, caminho, rotulo, tamanho_bytes, citacoes, expira_em)
  values ($1, $2, $3, 1000, $4, $5) returning id`;

let seq = 0;
/** Quem grava no Ratione é o servidor (papel de serviço, que ignora a RLS); aqui o superusuário do teste faz o mesmo papel. */
const gravar = (db: PGlite, usuario: string, citacoes: string[] = [], expira: string | null = null, rotulo: string | null = null) =>
  db.query<{ id: string }>(INSERIR, [usuario, `${usuario}/${++seq}`, rotulo, citacoes, expira]);

describe('Análises salvas (F5-10): banco, RLS e limite', () => {
  let db: PGlite;
  let ana: string;
  let beto: string;

  before(async () => {
    db = await criarBanco();
    ana = await criarUsuario(db, 'ana@exemplo.com');
    beto = await criarUsuario(db, 'beto@exemplo.com');
    await gravar(db, ana, ['normaviva:LEI-13105-2015|corpo|art. 85', 'tesemap:STJ-TEMA-1076'], null, 'Caso A');
    await gravar(db, beto, ['tesemap:STJ-TEMA-1076']);
  });

  it('cada pessoa lê só as próprias análises; visitante não lê nada', async () => {
    assert.strictEqual((await como(db, ana, tx => tx.query('select id from public.analises_salvas'))).rows.length, 1);
    assert.strictEqual((await como(db, beto, tx => tx.query('select id from public.analises_salvas'))).rows.length, 1);
    await assert.rejects(como(db, null, tx => tx.query('select id from public.analises_salvas')), /permission denied/);
  });

  it('a pessoa não grava, altera nem apaga: só o servidor faz isso (senão o arquivo cifrado ficaria órfão)', async () => {
    await assert.rejects(como(db, ana, tx => tx.query(INSERIR, [ana, 'ana/forjada', null, [], null])), /permission denied/);
    await assert.rejects(como(db, ana, tx => tx.query("update public.analises_salvas set rotulo = 'x'")), /permission denied/);
    await assert.rejects(como(db, ana, tx => tx.query('delete from public.analises_salvas')), /permission denied/);
  });

  it('a busca por citação encontra só as da própria pessoa', async () => {
    const q = "select rotulo from public.analises_salvas where citacoes @> array['tesemap:STJ-TEMA-1076']";
    assert.deepStrictEqual((await como(db, ana, tx => tx.query<{ rotulo: string }>(q))).rows.map(r => r.rotulo), ['Caso A']);
    assert.strictEqual((await como(db, beto, tx => tx.query(q))).rows.length, 1);
  });

  it('a 11ª análise da mesma pessoa é recusada pelo banco, e a de outra pessoa não é afetada', async () => {
    const carla = await criarUsuario(db, 'carla@exemplo.com');
    for (let i = 0; i < 10; i++) await gravar(db, carla);
    await assert.rejects(gravar(db, carla), /limite de 10 análises/);
    await gravar(db, ana);
    const nada = await db.query<{ n: string }>('select count(*)::text as n from public.analises_salvas where usuario_id = $1', [carla]);
    assert.strictEqual(nada.rows[0].n, '10');
  });

  it('regras da linha: vencimento depois da criação, rótulo até 80 caracteres, tamanho positivo, no máximo 200 citações', async () => {
    const dino = await criarUsuario(db, 'dino@exemplo.com');
    await assert.rejects(gravar(db, dino, [], '2000-01-01T00:00:00Z'), /check/);
    await assert.rejects(gravar(db, dino, [], null, 'x'.repeat(81)), /check/);
    await assert.rejects(gravar(db, dino, Array.from({ length: 201 }, (_, i) => `tesemap:${i}`)), /check/);
    await assert.rejects(db.query(`insert into public.analises_salvas (usuario_id, caminho, tamanho_bytes) values ($1, 'dino/zero', 0)`, [dino]), /check/);
    await assert.rejects(db.query(`insert into public.analises_salvas (usuario_id, caminho, tamanho_bytes) values ($1, 'dino/grande', 5242881)`, [dino]), /check/);
    await gravar(db, dino, [], '2999-01-01T00:00:00Z', 'x'.repeat(80));
  });

  it('o caminho é único e as linhas somem com a conta', async () => {
    const eva = await criarUsuario(db, 'eva@exemplo.com');
    await db.query(INSERIR, [eva, 'eva/a', null, [], null]);
    await assert.rejects(db.query(INSERIR, [eva, 'eva/a', null, [], null]), /unique|duplicate/);
    await db.query('delete from auth.users where id = $1', [eva]);
    const r = await db.query('select 1 from public.analises_salvas where usuario_id = $1', [eva]);
    assert.strictEqual(r.rows.length, 0);
  });
});
