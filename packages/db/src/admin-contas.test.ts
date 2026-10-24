import { before,after,describe,it } from 'node:test';
import assert from 'node:assert/strict';
import type { PGlite } from '@electric-sql/pglite';
import { como,criarBanco,criarUsuario } from './harness';
describe('Contas: busca administrativa e suspensão com JWT anterior',()=>{
  let db:PGlite,u:string;
  before(async()=>{db=await criarBanco();u=await criarUsuario(db,'suporte@exemplo.com',{segredo:'nunca-exibir'});});
  after(async()=>{await db?.close();});
  it('somente serviço pesquisa, com e-mail mascarado e sem segredos de autenticação',async()=>{
    for(const id of [null,u])await assert.rejects(como(db,id,tx=>tx.query('select public.admin_contas()')),/permission denied/);
    const r=await db.transaction(async tx=>{await tx.exec('set local role service_role');return tx.query<{r:{total:number;contas:Array<{id:string;email_mascarado:string}>}}>("select public.admin_contas('suporte',0) as r");});
    assert.equal(r.rows[0].r.total,1);assert.equal(r.rows[0].r.contas[0].id,u);assert.equal(r.rows[0].r.contas[0].email_mascarado,'su***@exemplo.com');
    assert.doesNotMatch(JSON.stringify(r.rows[0].r),/suporte@|nunca-exibir|metadata|token|password/);
  });
  it('suspensão bloqueia RLS mesmo com o mesmo sub do JWT, e reativação restaura sem perder dados',async()=>{
    const antes=await como(db,u,tx=>tx.query('select * from public.perfis'));assert.equal(antes.rows.length,1);
    await db.query("update auth.users set banned_until=now()+interval '1 day' where id=$1",[u]);
    assert.equal((await como(db,u,tx=>tx.query('select * from public.perfis'))).rows.length,0);
    assert.equal((await como(db,u,tx=>tx.query('select * from public.uso_resumo()'))).rows.length,0);
    const alteracao=await como(db,u,tx=>tx.query("update public.perfis set nome='invasao' returning id"));assert.equal(alteracao.rows.length,0);
    await db.query('update auth.users set banned_until=null where id=$1',[u]);
    assert.equal((await como(db,u,tx=>tx.query('select * from public.perfis'))).rows.length,1);
    assert((await como(db,u,tx=>tx.query('select * from public.uso_resumo()'))).rows.length>0);
  });
  it('a trilha é exclusiva do serviço e não permite autoação',async()=>{
    for(const id of [null,u])await assert.rejects(como(db,id,tx=>tx.query('select * from public.admin_acesso_eventos')),/permission denied/);
    await assert.rejects(db.query("insert into public.admin_acesso_eventos(ator_id,usuario_id,acao) values($1,$1,'suspender')",[u]),/check constraint/);
  });
});
