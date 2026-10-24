import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { servirFinanceiro } from './financeiro';
import { lerCotacao, margemAposIa, situacaoFundo } from './apresentacao';

const DADOS = {
  inicio:'2026-10-01T03:00:00+00:00',fim:'2026-11-01T03:00:00+00:00',
  planos:['gratuito','essencial','profissional','sem_atribuicao'].map(plano=>({plano,custo_real_usd:0.002,reservado_usd:0,receita_centavos:0,reembolsado_centavos:0})),
  fundos:['gratuito','pagantes'].map(fundo=>({fundo,orcamento_usd:5,custo_real_usd:0.002,reservado_usd:0})),
  clientes:[],total_clientes:0,teste_aprovado_centavos:2900
};
const request = (query='') => new Request(`http://localhost/api/admin/financeiro${query}`);
const cliente = (responder: (url: URL, body: unknown) => Response) => createClient('https://banco.exemplo.test','chave-teste',{
  auth:{persistSession:false,autoRefreshToken:false},global:{fetch:async(input,init)=>responder(new URL(String(input)),JSON.parse(String(init?.body)))}
});

describe('Painel: fronteira administrativa e cálculos',()=>{
  it('não autorizado recebe 404 sem leitura e sem cache, mesmo com parâmetros forjados',async()=>{
    const r=await servirFinanceiro(request('?usuario=admin&role=admin'),async()=>null);
    assert.equal(r.status,404);
    assert.equal(r.headers.get('cache-control'),'private, no-store');
    assert.equal(r.headers.get('vary'),'Cookie');
    assert.deepEqual(await r.json(),{mensagem:'Página não encontrada.'});
  });
  it('somente após autorização chama a RPC de leitura, com paginação validada e sem expor dados extras',async()=>{
    const sb=cliente((url,body)=>{
      assert.equal(url.pathname,'/rest/v1/rpc/admin_financeiro');
      assert.deepEqual(body,{p_pagina:1});
      return Response.json(DADOS);
    });
    const r=await servirFinanceiro(request('?pagina=1'),async()=>sb);
    assert.equal(r.status,200);
    assert.deepEqual(await r.json(),DADOS);
    const naoLer=cliente(()=>assert.fail('não deve consultar'));
    for(const query of ['?pagina=-1','?pagina=1.2','?pagina=1000001','?usuario=x','?pagina=NaN']) {
      assert.equal((await servirFinanceiro(request(query),async()=>naoLer)).status,400);
    }
  });
  it('falha no banco ou resultado incompleto não é exibido como saldo zero nem vaza detalhes',async()=>{
    for(const body of [{secret:'nao-mostrar'},null]) {
      const r=await servirFinanceiro(request(),async()=>cliente(()=>Response.json(body)));
      assert.equal(r.status,503);
      assert.doesNotMatch(await r.text(),/nao-mostrar/);
    }
    assert.equal((await servirFinanceiro(request(),async()=>{throw new Error('credencial-nao-expor');})).status,503);
  });
  it('não mistura reais e dólares sem cotação explícita; margem após IA pode ser negativa',()=>{
    assert.equal(lerCotacao('5,25'),5.25);
    for(const valor of ['', '0', '-1', '1e2', 'Infinity','1.234,56','1001']) assert.equal(lerCotacao(valor),null);
    assert.equal(margemAposIa(10000,2,null),null);
    assert.equal(margemAposIa(0,2,5),null);
    assert.deepEqual(margemAposIa(10000,2,5),{saldoReais:90,percentual:90});
    assert.deepEqual(margemAposIa(1000,3,5),{saldoReais:-5,percentual:-50});
  });
  it('alertas consideram gasto e reservas, com limites exatos de 80% e 100%',()=>{
    assert.deepEqual(situacaoFundo(5,3,1),{percentual:80,situacao:'alerta'});
    assert.deepEqual(situacaoFundo(5,4,1),{percentual:100,situacao:'esgotado'});
    assert.equal(situacaoFundo(0,0,0).situacao,'esgotado');
    assert.equal(situacaoFundo(5,1,0).situacao,'normal');
  });
});
