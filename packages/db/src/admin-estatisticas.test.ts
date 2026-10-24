import { before, after, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { PGlite } from '@electric-sql/pglite';
import { como, criarBanco, criarUsuario } from './harness';

describe('Administração: estatísticas sem identificação individual', () => {
  let db: PGlite;
  before(async () => { db = await criarBanco(); });
  after(async () => { await db?.close(); });
  const resumo = () => db.transaction(async tx => {
    await tx.exec('set local role service_role');
    return (await tx.query<{r: {usuarios: {total:number;novos_no_mes:number;ativos_ia_no_mes:number};ia: {execucoes:number;geradas:number;cache:number;problemas:number;reservadas:number;tokens_entrada:number;tokens_saida:number;tokens_cache_leitura:number;tokens_cache_escrita:number}}}>('select public.admin_estatisticas() as r')).rows[0].r;
  });
  it('conta contas cadastradas, novas e ativas separadamente, sem nomes ou IDs', async () => {
    const antigo = await criarUsuario(db, 'antigo@exemplo.com');
    const novo = await criarUsuario(db, 'novo@exemplo.com');
    await db.query("update auth.users set created_at=(date_trunc('month',now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo')-interval '1 second' where id=$1",[antigo]);
    await db.query("insert into auth.users(email,is_anonymous) values ('anonimo@exemplo.com',true)");
    await db.query("insert into auth.users(email,deleted_at) values ('excluido@exemplo.com',now())");
    await db.query("insert into public.ia_uso(usuario_id,tarefa,referencia,chave,situacao,custo_usd,tokens_entrada,tokens_saida,tokens_cache_leitura,tokens_cache_escrita) values ($1,'teste','x','1','gerada',0.01,10,20,30,40),($1,'teste','x','2','cache',0,null,null,null,null),($1,'teste','x','3','falhou',0.001,2,3,0,0),($1,'teste','x','4','reservada',0.1,null,null,null,null)",[novo]);
    const r=await resumo();
    assert.deepEqual(r.usuarios,{total:2,novos_no_mes:1,ativos_ia_no_mes:1});
    assert.deepEqual(r.ia,{execucoes:4,geradas:1,cache:1,problemas:1,reservadas:1,tokens_entrada:12,tokens_saida:23,tokens_cache_leitura:30,tokens_cache_escrita:40});
    assert.doesNotMatch(JSON.stringify(r),new RegExp(`${antigo}|${novo}|@exemplo|usuario_id|clientes|total_clientes`));
  });
  it('agrega mais de mil execuções e exclui meses anteriores',async()=>{
    const u=await criarUsuario(db,'volume@exemplo.com');
    await db.query("insert into public.ia_uso(usuario_id,tarefa,referencia,chave,situacao,custo_usd) select $1,'teste','x','v','gerada',0 from generate_series(1,1001)",[u]);
    await db.query("insert into public.ia_uso(usuario_id,tarefa,referencia,chave,situacao,custo_usd,criado_em) values ($1,'teste','x','antiga','gerada',999,(date_trunc('month',now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo')-interval '1 second')",[u]);
    const r=await resumo();assert.equal(r.ia.execucoes,1005);assert.equal(r.usuarios.ativos_ia_no_mes,2);
  });
  it('visitantes e usuários comuns não executam nem leem a base de contas',async()=>{
    const u=await criarUsuario(db,'comum@exemplo.com');
    for(const id of [null,u])await assert.rejects(como(db,id,tx=>tx.query('select public.admin_estatisticas()')),/permission denied/);
  });
});
