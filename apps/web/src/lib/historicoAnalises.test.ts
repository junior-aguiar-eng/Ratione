import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { lerHistoricoAnalises } from './historicoAnalises';
import { iniciarAnaliseNoBanco } from './ia/banco';

const AGORA=new Date('2026-10-24T12:00:00Z');
const cliente=(f:(url:URL,body:unknown)=>Response)=>createClient('https://banco.exemplo.test','chave-teste',{
  auth:{persistSession:false,autoRefreshToken:false},global:{fetch:async(input,init)=>f(new URL(String(input)),init?.body?JSON.parse(String(init.body)):null)}
});

describe('Histórico de análises com tamanho',()=>{
  it('lê a quantidade junto do histórico respeitando o período e o limite existentes',async()=>{
    const sb=cliente(url=>{
      assert.equal(url.searchParams.get('criada_em'),'gte.2026-09-24T12:00:00.000Z');
      assert.equal(url.searchParams.get('limit'),'501');
      assert.equal(url.searchParams.get('order'),'criada_em.desc');
      assert.ok(url.searchParams.get('select')?.includes('paragrafos'));
      return Response.json(Array.from({length:501},(_,id)=>({id:String(id),paragrafos:17})));
    });
    const r=await lerHistoricoAnalises(sb,'gratuito',AGORA);
    assert.equal(r.historico.length,500);
    assert.equal(r.historico[0].paragrafos,17);
    assert.equal(r.truncado,true);
  });
  it('banco sem a coluna volta à seleção antiga; não converte tamanho ausente em zero',async()=>{
    for(const code of ['42703','PGRST204']){
      let chamadas=0;
      const sb=cliente(url=>{
        chamadas++;
        if(chamadas===1) return Response.json({code,message:'column analises.paragrafos does not exist'},{status:400});
        assert.ok(!url.searchParams.get('select')?.includes('paragrafos'));
        return Response.json([{id:'antiga'}]);
      });
      const r=await lerHistoricoAnalises(sb,'essencial',AGORA);
      assert.equal(chamadas,2);
      assert.equal(r.historico[0].paragrafos,undefined);
    }
  });
  it('outros erros não viram histórico vazio nem disparam uma consulta de reserva',async()=>{
    for(const erro of [{code:'42501',message:'permission denied'},{code:'42703',message:'column analises.outra does not exist'}]){
      let chamadas=0;
      const sb=cliente(()=>{chamadas++;return Response.json(erro,{status:403});});
      await assert.rejects(lerHistoricoAnalises(sb,'gratuito',AGORA),/Não foi possível ler/);
      assert.equal(chamadas,1);
    }
  });
});

describe('Início de análise com metadado de tamanho',()=>{
  it('envia só o número à função atômica, sem texto da decisão',async()=>{
    const sb=cliente((url,body)=>{
      assert.equal(url.pathname,'/rest/v1/rpc/analise_iniciar_com_tamanho');
      assert.deepEqual(body,{p_usuario:'u',p_tipo:'rapida',p_rotulo:'Estudo',p_paragrafos:17});
      return Response.json([{ok:true,analise_id:'a',restantes:2,plano:'gratuito',renova_em:'2026-10-26T03:00:00Z'}]);
    });
    const r=await iniciarAnaliseNoBanco(sb,'u','rapida','Estudo',17);
    assert.equal(r.ok,true);
  });
  it('sem tamanho continua usando a função anterior, inclusive para explicação',async()=>{
    const sb=cliente((url,body)=>{
      assert.equal(url.pathname,'/rest/v1/rpc/analise_iniciar');
      assert.deepEqual(body,{p_usuario:'u',p_tipo:'explicacao',p_rotulo:null});
      return Response.json([{ok:false,motivo:'limite_periodo',analise_id:null,restantes:0,plano:'gratuito',renova_em:'2026-10-26T03:00:00Z'}]);
    });
    const r=await iniciarAnaliseNoBanco(sb,'u','explicacao');
    assert.ok(!r.ok && r.motivo==='limite_periodo');
  });
});
