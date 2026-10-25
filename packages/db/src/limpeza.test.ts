import { before, after, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { PGlite } from '@electric-sql/pglite';
import { PASTA_MIGRACOES, como, criarBanco, criarUsuario } from './harness';

type Tx = Parameters<Parameters<PGlite['transaction']>[0]>[0];
const servidor = <T>(db: PGlite, fn: (tx: Tx) => Promise<T>) => db.transaction(async tx => { await tx.exec('set local role service_role'); return fn(tx); });
const limpar = (db: PGlite) => servidor(db, tx => tx.query<{ r: Record<string, number> }>('select public.limpar_dados_vencidos() as r')).then(r => r.rows[0].r);
const contar = async (db: PGlite, tabela: string) => Number((await db.query<{ n: string }>(`select count(*) as n from public.${tabela}`)).rows[0].n);

describe('Limpeza por prazo', () => {
  let db: PGlite;
  let u: string;
  before(async () => {
    db = await criarBanco();
    u = await criarUsuario(db, 'limpeza@exemplo.com', { termos_versao: '1.0' });
    // ia_uso: uma de 14 meses (vence) e uma de 12 meses (fica)
    await db.query("insert into public.ia_uso (usuario_id,tarefa,referencia,chave,situacao,criado_em) values ($1,'teste','antiga','a','gerada', now() - interval '14 months'), ($1,'teste','recente','b','gerada', now() - interval '12 months')", [u]);
    // analises: a antiga é referenciada por um uso recente (o vínculo deve virar nulo, sem apagar o uso)
    await db.query("insert into public.analises (id,usuario_id,tipo,criada_em) values ('00000000-0000-4000-8000-0000000000a1',$1,'rapida', now() - interval '14 months'), ('00000000-0000-4000-8000-0000000000a2',$1,'rapida', now() - interval '12 months')", [u]);
    await db.query("insert into public.ia_uso (usuario_id,tarefa,referencia,chave,situacao,analise_id,criado_em) values ($1,'teste','ligado','c','gerada','00000000-0000-4000-8000-0000000000a1', now() - interval '1 day')", [u]);
    // lembretes: vencido há 40 dias (vence), há 20 dias e no futuro (ficam)
    await db.query("insert into public.lembretes_prazo (usuario_id,titulo,vencimento) values ($1,'velho', current_date - 40), ($1,'vencido recente', current_date - 20), ($1,'futuro', current_date + 5)", [u]);
    // avisos do Mercado Pago: 91 dias (vence) e 89 dias (fica)
    await db.query("insert into public.mp_eventos (ambiente,topico,recurso_id,recebido_em) values ('teste','payment','1', now() - interval '91 days'), ('teste','payment','2', now() - interval '89 days')");
    // ações administrativas: 13 meses (vence) e 11 meses (fica)
    await db.query("insert into public.admin_acesso_eventos (acao,criada_em) values ('suspender', now() - interval '13 months'), ('reativar', now() - interval '11 months')");
  });
  after(async () => { await db?.close(); });

  it('apaga só o que passou do prazo e informa quanto apagou de cada tabela', async () => {
    const r = await limpar(db);
    assert.deepEqual(r, { ia_uso: 1, analises: 1, lembretes_prazo: 1, mp_eventos: 1, admin_acesso_eventos: 1 });
    assert.deepEqual((await db.query<{ referencia: string }>('select referencia from public.ia_uso order by referencia')).rows.map(x => x.referencia), ['ligado', 'recente']);
    assert.deepEqual((await db.query<{ titulo: string }>('select titulo from public.lembretes_prazo order by titulo')).rows.map(x => x.titulo), ['futuro', 'vencido recente']);
    assert.equal(await contar(db, 'mp_eventos'), 1);
    assert.equal(await contar(db, 'admin_acesso_eventos'), 1);
    assert.deepEqual((await db.query<{ id: string }>('select id from public.analises')).rows.map(x => x.id), ['00000000-0000-4000-8000-0000000000a2']);
  });

  it('apagar a análise antiga não apaga o uso recente que apontava para ela', async () => {
    const r = await db.query<{ analise_id: string | null }>("select analise_id from public.ia_uso where referencia = 'ligado'");
    assert.equal(r.rows[0].analise_id, null);
  });

  it('não toca na conta, no perfil nem no aceite dos Termos', async () => {
    assert.equal(await contar(db, 'perfis'), 1);
    assert.equal(await contar(db, 'aceites_termos'), 1);
    assert.equal(Number((await db.query<{ n: string }>('select count(*) as n from auth.users')).rows[0].n), 1);
  });

  it('é idempotente: uma segunda execução não apaga mais nada', async () => {
    assert.deepEqual(await limpar(db), { ia_uso: 0, analises: 0, lembretes_prazo: 0, mp_eventos: 0, admin_acesso_eventos: 0 });
  });

  it('só o servidor executa: visitante e usuário logado são recusados', async () => {
    for (const id of [null, u]) await assert.rejects(como(db, id, tx => tx.query('select public.limpar_dados_vencidos()')), /permission denied/);
  });

  it('um usuário não consegue apagar o próprio histórico de uso (a cota depende dele)', async () => {
    await assert.rejects(como(db, u, tx => tx.query('delete from public.ia_uso')), /permission denied/);
    await assert.rejects(como(db, u, tx => tx.query('delete from public.analises')), /permission denied/);
  });

  it('a migração agenda a limpeza diária no pg_cron quando ele existe', () => {
    const sql = readFileSync(join(PASTA_MIGRACOES, '20261025000001_limpeza_por_prazo.sql'), 'utf-8');
    assert.match(sql, /pg_available_extensions where name = 'pg_cron'/);
    assert.match(sql, /cron\.schedule\('limpeza-por-prazo', '17 6 \* \* \*', 'select public\.limpar_dados_vencidos\(\)'\)/);
  });
});
