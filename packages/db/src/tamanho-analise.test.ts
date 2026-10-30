import { before, after, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { PGlite } from '@electric-sql/pglite';
import { aplicarMigracao, como, criarBanco, criarUsuario } from './harness';

type Tx = Parameters<Parameters<PGlite['transaction']>[0]>[0];
const servidor=<T>(db:PGlite,fn:(tx:Tx)=>Promise<T>)=>db.transaction(async tx=>{await tx.exec('set local role service_role');return fn(tx);});
type Inicio={ok:boolean;motivo:string|null;analise_id:string|null};
const iniciar=(db:PGlite,u:string,n:number|null,tipo='rapida')=>servidor(db,tx=>tx.query<Inicio>('select * from public.analise_iniciar_com_tamanho($1,$2,$3,$4)',[u,tipo,null,n])).then(r=>r.rows[0]);

describe('Tamanho da análise: persistência e acesso',()=>{
  let db:PGlite;
  before(async()=>{db=await criarBanco();});
  after(async()=>{await db?.close();});

  it('salva o tamanho junto da reserva, preservando cota e sem consumir antes da entrega',async()=>{
    const u=await criarUsuario(db,'tamanho@exemplo.com');
    const primeira=await iniciar(db,u,17);
    assert.equal(primeira.ok,true);
    const r=await db.query<{paragrafos:number;consumiu:boolean}>('select paragrafos,consumiu from public.analises where id=$1',[primeira.analise_id]);
    assert.deepEqual(r.rows,[{paragrafos:17,consumiu:false}]);
    assert.equal((await iniciar(db,u,1)).ok,true);
    assert.equal((await iniciar(db,u,1500)).ok,true);
    const negada=await iniciar(db,u,18);
    assert.equal(negada.motivo,'limite_periodo');
    assert.equal((await db.query<{n:number}>('select count(*)::int as n from public.analises where usuario_id=$1',[u])).rows[0].n,3);
  });

  it('recusa tamanho inválido ou tamanho em explicação sem criar uma análise',async()=>{
    const u=await criarUsuario(db,'invalido@exemplo.com');
    for(const n of [0,-1,1501]) await assert.rejects(iniciar(db,u,n),/tamanho inválido/);
    await assert.rejects(iniciar(db,u,1,'explicacao'),/tamanho inválido/);
    assert.equal((await db.query<{n:number}>('select count(*)::int as n from public.analises where usuario_id=$1',[u])).rows[0].n,0);
  });

  it('só o servidor inicia com tamanho; a RLS permite ler apenas o próprio e impede edição direta',async()=>{
    const u=await criarUsuario(db,'dono@exemplo.com'),outro=await criarUsuario(db,'outro-tamanho@exemplo.com');
    const r=await iniciar(db,u,42);
    assert.deepEqual((await como(db,u,tx=>tx.query('select paragrafos from public.analises'))).rows,[{paragrafos:42}]);
    assert.deepEqual((await como(db,outro,tx=>tx.query('select paragrafos from public.analises'))).rows,[]);
    for(const id of [null,u]) await assert.rejects(como(db,id,tx=>tx.query("select * from public.analise_iniciar_com_tamanho($1,'rapida',null,1)",[u])),/permission denied/);
    await assert.rejects(como(db,u,tx=>tx.query('update public.analises set paragrafos=2 where id=$1',[r.analise_id])),/permission denied/);
  });
});

describe('Migração do limite de parágrafos (800 para 1.500)',()=>{
  it('antes recusa 801; depois aceita até 1.500 e recusa 1.501, mantendo registros antigos e privilégios',async()=>{
    const db=await criarBanco('20261024000002_tamanho_analise');
    try{
      const u=await criarUsuario(db,'limite-1500@exemplo.com');
      await assert.rejects(iniciar(db,u,801),/tamanho inválido/); // limite antigo
      const antiga=await iniciar(db,u,800);
      assert.equal(antiga.ok,true);
      await aplicarMigracao(db,'20261030000001_paragrafos_ate_1500');
      assert.deepEqual((await db.query('select paragrafos from public.analises where id=$1',[antiga.analise_id])).rows,[{paragrafos:800}]);
      assert.equal((await iniciar(db,u,801)).ok,true);
      assert.equal((await iniciar(db,u,1500)).ok,true);
      await assert.rejects(iniciar(db,u,1501),/tamanho inválido/);
      await assert.rejects(db.query("update public.analises set paragrafos=1501 where id=$1",[antiga.analise_id]),/analises_paragrafos_validos/); // a restrição também sobe
      for(const id of [null,u]) await assert.rejects(como(db,id,tx=>tx.query("select * from public.analise_iniciar_com_tamanho($1,'rapida',null,1)",[u])),/permission denied/);
    }finally{await db.close();}
  });
});

describe('Migração do tamanho sobre análises existentes',()=>{
  it('mantém registros antigos e a função anterior; tamanho antigo continua desconhecido',async()=>{
    const db=await criarBanco('20261024000001_painel_administrativo');
    try{
      const u=await criarUsuario(db,'legado-tamanho@exemplo.com');
      const anterior=await servidor(db,tx=>tx.query<Inicio>("select * from public.analise_iniciar($1,'rapida','Estudo')",[u]));
      const antes=(await db.query<Record<string,unknown>>('select * from public.analises where id=$1',[anterior.rows[0].analise_id])).rows[0];
      await aplicarMigracao(db,'20261024000002_tamanho_analise');
      const depois=(await db.query('select * from public.analises where id=$1',[anterior.rows[0].analise_id])).rows[0];
      assert.deepEqual(depois,{...antes,paragrafos:null});
      const nova=await servidor(db,tx=>tx.query<Inicio>("select * from public.analise_iniciar($1,'explicacao')",[u]));
      assert.equal(nova.rows[0].ok,true);
      assert.deepEqual((await db.query('select paragrafos from public.analises where id=$1',[nova.rows[0].analise_id])).rows,[{paragrafos:null}]);
    }finally{await db.close();}
  });
});
