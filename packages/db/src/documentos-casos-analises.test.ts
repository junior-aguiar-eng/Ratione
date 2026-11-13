import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { PGlite } from '@electric-sql/pglite';
import { aplicarMigracao, como, criarBanco, criarUsuario } from './harness';

const INSERIR_DOC = `insert into public.documentos (usuario_id, tipo, tamanho_bytes, caminho, expira_em)
  values ($1, 'pdf', 1024, $2, now() + interval '7 days') returning id`;

const INSERIR_ANALISE_SALVA = `insert into public.analises_salvas (usuario_id, caminho, rotulo, tamanho_bytes, citacoes, expira_em)
  values ($1, $2, 'Caso teste', 1000, array['tesemap:STJ-TEMA-1076'], now() + interval '30 days') returning id`;

describe('RLS de suspensão, limite de documentos e search_path vazio', () => {
  let db: PGlite;
  let u1: string;
  let u2: string;

  before(async () => {
    db = await criarBanco();
    u1 = await criarUsuario(db, 'suspenso@exemplo.com');
    u2 = await criarUsuario(db, 'ativo@exemplo.com');

    await db.query(INSERIR_DOC, [u1, `${u1}/d0`]);
    await db.query(INSERIR_ANALISE_SALVA, [u1, `${u1}/a0`]);
    await como(db, u1, tx => tx.query("insert into public.casos (usuario_id, nome) values ($1, 'Caso 1')", [u1]));
  });

  after(async () => {
    await db?.close();
  });

  it('usuário suspenso perde acesso a casos, documentos e análises_salvas e trigger de documentos barra 11º arquivo', async () => {
    // Antes da suspensão, vê 1 registro em cada tabela
    assert.equal((await como(db, u1, tx => tx.query('select id from public.casos'))).rows.length, 1);
    assert.equal((await como(db, u1, tx => tx.query('select id from public.documentos'))).rows.length, 1);
    assert.equal((await como(db, u1, tx => tx.query('select id from public.analises_salvas'))).rows.length, 1);

    // Suspende em auth.users
    await db.query("update auth.users set banned_until = now() + interval '1 day' where id = $1", [u1]);

    // SELECT bloqueado pela política restritiva conta_ativa_restritiva
    assert.equal((await como(db, u1, tx => tx.query('select id from public.casos'))).rows.length, 0);
    assert.equal((await como(db, u1, tx => tx.query('select id from public.documentos'))).rows.length, 0);
    assert.equal((await como(db, u1, tx => tx.query('select id from public.analises_salvas'))).rows.length, 0);

    // INSERT/UPDATE/DELETE em casos também bloqueados mesmo com JWT válido
    await assert.rejects(
      como(db, u1, tx => tx.query("insert into public.casos (usuario_id, nome) values ($1, 'Caso bloqueado')", [u1])),
      /row-level security/
    );
    assert.equal((await como(db, u1, tx => tx.query("update public.casos set nome = 'Alterado' returning id"))).rows.length, 0);
    assert.equal((await como(db, u1, tx => tx.query('delete from public.casos returning id'))).rows.length, 0);

    // Reativa e confirma restauração do acesso
    await db.query('update auth.users set banned_until = null where id = $1', [u1]);
    assert.equal((await como(db, u1, tx => tx.query('select id from public.casos'))).rows.length, 1);
    assert.equal((await como(db, u1, tx => tx.query('select id from public.documentos'))).rows.length, 1);
    assert.equal((await como(db, u1, tx => tx.query('select id from public.analises_salvas'))).rows.length, 1);
    await como(db, u1, tx => tx.query("insert into public.casos (usuario_id, nome) values ($1, 'Caso 2')", [u1]));

    // Preenche até 10 documentos (já tinha 1) e barra o 11º via trigger documentos_limite
    for (let i = 1; i < 10; i++) {
      await db.query(INSERIR_DOC, [u1, `${u1}/d${i}`]);
    }
    await assert.rejects(db.query(INSERIR_DOC, [u1, `${u1}/d10`]), /limite de 10 documentos/);

    // Outro usuário não é afetado
    await db.query(INSERIR_DOC, [u2, `${u2}/d0`]);

    // Apagar 1 documento do usuário libera vaga para outro
    await db.query('delete from public.documentos where caminho = $1', [`${u1}/d0`]);
    await db.query(INSERIR_DOC, [u1, `${u1}/d11`]);
  });

  it('funções de gatilho e limpeza têm search_path vazio, security definer e privilégios restritos', async () => {
    const funcs = await db.query<{ proname: string; prosecdef: boolean; proconfig: string[] | null }>(
      `select p.proname, p.prosecdef, p.proconfig
         from pg_proc p
         join pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'public'
          and p.proname in ('analises_salvas_limite', 'documentos_limite', 'limpar_dados_vencidos')
        order by p.proname`
    );

    assert.equal(funcs.rows.length, 3);
    for (const f of funcs.rows) {
      assert.equal(f.prosecdef, true, `${f.proname} deve ser security definer`);
      assert.ok(
        f.proconfig?.some(c => c === 'search_path=""' || c === 'search_path='),
        `${f.proname} deve ter search_path='', recebido: ${JSON.stringify(f.proconfig)}`
      );
      const priv = await db.query<{ pub: boolean; anon: boolean; auth: boolean }>(
        `select has_function_privilege('public', $1::regprocedure, 'execute') as pub,
                has_function_privilege('anon', $1::regprocedure, 'execute') as anon,
                has_function_privilege('authenticated', $1::regprocedure, 'execute') as auth`,
        [`public.${f.proname}()`]
      );
      assert.deepEqual(priv.rows[0], { pub: false, anon: false, auth: false }, `${f.proname} não pode ser executável por public/anon/authenticated`);
    }

    const serv = await db.query<{ ok: boolean }>(
      "select has_function_privilege('service_role', 'public.limpar_dados_vencidos()', 'execute') as ok"
    );
    assert.equal(serv.rows[0].ok, true);

    const limpeza = await db.transaction(async tx => {
      await tx.exec('set local role service_role');
      return tx.query<{ r: Record<string, number> }>('select public.limpar_dados_vencidos() as r');
    });
    assert.equal(typeof limpeza.rows[0].r.ia_uso, 'number');
  });

  it('migração 20261113000002 é idempotente e segura mesmo se 20261104..20261106 ainda não tiverem sido aplicadas (ou forem aplicadas depois)', async () => {
    const dbSemRecentes = await criarBanco('20261030000001');
    try {
      await aplicarMigracao(dbSemRecentes, '20261113000001_seguranca_ia_cotas_e_reservas');
      await aplicarMigracao(dbSemRecentes, '20261113000002_rls_suspensao_e_triggers_tabelas_recentes');

      const docFn = await dbSemRecentes.query<{ n: number }>(
        "select count(*)::int as n from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'documentos_limite'"
      );
      assert.equal(docFn.rows[0].n, 1);

      // Se as pendentes forem aplicadas depois da 20261113000002, políticas e gatilhos seguem ativos
      await aplicarMigracao(dbSemRecentes, '20261104000001_documentos');
      await aplicarMigracao(dbSemRecentes, '20261105000001_casos');
      await aplicarMigracao(dbSemRecentes, '20261106000001_analises_salvas');

      const u = await criarUsuario(dbSemRecentes, 'tardio@exemplo.com');
      await dbSemRecentes.query(INSERIR_DOC, [u, `${u}/d0`]);
      await dbSemRecentes.query("update auth.users set banned_until = now() + interval '1 day' where id = $1", [u]);
      assert.equal((await como(dbSemRecentes, u, tx => tx.query('select id from public.documentos'))).rows.length, 0);
      await assert.rejects(
        como(dbSemRecentes, u, tx => tx.query("insert into public.casos (usuario_id, nome) values ($1, 'Bloqueado')", [u])),
        /row-level security/
      );
    } finally {
      await dbSemRecentes.close();
    }
  });
});
