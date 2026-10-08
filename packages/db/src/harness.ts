import { PGlite } from '@electric-sql/pglite';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Banco de teste em memória (PGlite = Postgres real, em WASM), imitando o que o Supabase fornece:
 * os papéis `anon`, `authenticated` e `service_role`, a tabela `auth.users` e a função `auth.uid()`,
 * que lê o `sub` do JWT de `request.jwt.claim.sub`. As migrações de `supabase/migrations` são aplicadas em ordem.
 */
const BASE_SUPABASE = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  create schema auth;
  create table auth.users (id uuid primary key default gen_random_uuid(), email text unique, criado_em timestamptz default now());
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema public to anon, authenticated, service_role;
  grant usage on schema auth to anon, authenticated, service_role;
  grant execute on function auth.uid() to anon, authenticated, service_role;
  -- Como no Supabase real, tabelas novas nascem com TODOS os privilégios para anon e authenticated (inclusive TRUNCATE);
  -- as migrações é que precisam reduzir isso ao mínimo. A service_role ignora a RLS (bypassrls).
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
`;

export const PASTA_MIGRACOES = join(__dirname, '../../../supabase/migrations');

export async function criarBanco(): Promise<PGlite> {
  const db = new PGlite();
  await db.exec(BASE_SUPABASE);
  const arquivos = readdirSync(PASTA_MIGRACOES)
    .filter(f => f.endsWith('.sql'))
    .sort();
  for (const f of arquivos) await db.exec(readFileSync(join(PASTA_MIGRACOES, f), 'utf-8'));
  return db;
}

export async function criarUsuario(db: PGlite, email: string): Promise<string> {
  const r = await db.query<{ id: string }>('insert into auth.users (email) values ($1) returning id', [email]);
  return r.rows[0].id;
}

type Tx = Parameters<Parameters<PGlite['transaction']>[0]>[0];

/** Executa `fn` como o usuário logado `usuarioId` (papel `authenticated`) ou, se `null`, como visitante (`anon`). */
export async function como<T>(db: PGlite, usuarioId: string | null, fn: (tx: Tx) => Promise<T>): Promise<T> {
  return db.transaction(async tx => {
    await tx.exec(`set local role ${usuarioId ? 'authenticated' : 'anon'}`);
    if (usuarioId) await tx.query("select set_config('request.jwt.claim.sub', $1, true)", [usuarioId]);
    return fn(tx);
  });
}
