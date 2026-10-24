import { describe,it } from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { servirContas,alterarAcessoConta } from './contas';
const ADMIN='aaaaaaaa-1111-4111-8111-111111111111',OUTRO='bbbbbbbb-2222-4222-8222-222222222222';
const req=(corpo:unknown,origin='https://ratione.exemplo.test')=>new Request('https://ratione.exemplo.test/api/admin/contas',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(corpo)});
const contexto=(falha=false)=>{
 const chamadas:Array<{path:string;method:string;body:unknown}>=[];
 const servidor=createClient('https://banco.exemplo.test','chave-local',{auth:{persistSession:false},global:{fetch:async(input,init)=>{
  const path=new URL(String(input)).pathname,method=init?.method??'GET',body=init?.body?JSON.parse(String(init.body)):null;chamadas.push({path,method,body});
  if(path.includes('/admin/users/'))return method==='PUT'&&falha?Response.json({message:'segredo interno'},{status:503}):Response.json({user:{id:OUTRO,is_anonymous:false}});
  if(path.includes('admin_acesso_eventos'))return Response.json(method==='POST'?{id:'cccccccc-3333-4333-8333-333333333333'}:null);
  return Response.json({total:1,contas:[{id:OUTRO,email_mascarado:'co***@exemplo.test',criada_em:'2026-10-01T00:00:00Z',ultimo_acesso:null,email_confirmado:false,suspensa_ate:null}]});
 }}});
 return {chamadas,ctx:{servidor,usuarioId:ADMIN,protegidos:[ADMIN]}};
};
describe('Suporte de contas: fronteira e mutações de acesso',()=>{
 it('não autorizado não pesquisa nem altera contas',async()=>{
  assert.equal((await servirContas(new Request('https://ratione.exemplo.test/api/admin/contas'),async()=>null)).status,404);
  assert.equal((await alterarAcessoConta(req({usuarioId:OUTRO,acao:'suspender'}),async()=>null)).status,404);
 });
 it('pesquisa paginada validada e saída restrita, privada e sem dados adicionais',async()=>{
  const {ctx,chamadas}=contexto();const r=await servirContas(req({busca:'comum',pagina:1}),async()=>ctx);
  assert.equal(r.status,200);assert.equal(r.headers.get('cache-control'),'private, no-store');
  assert.deepEqual(chamadas[0].body,{p_busca:'comum',p_pagina:1});assert.doesNotMatch(await r.text(),/password|metadata|access_token/);
  assert.equal((await servirContas(new Request('https://ratione.exemplo.test/api/admin/contas?pagina=-1'),async()=>ctx)).status,400);
 });
 it('rejeita origem externa, autoação, outro administrador e campos fora do contrato antes de mutar',async()=>{
  const {ctx,chamadas}=contexto();
  assert.equal((await alterarAcessoConta(req({usuarioId:OUTRO,acao:'suspender'},'https://externo.test'),async()=>ctx)).status,403);
  assert.equal((await alterarAcessoConta(req({usuarioId:ADMIN,acao:'suspender'}),async()=>ctx)).status,403);
  assert.equal((await alterarAcessoConta(req({usuarioId:OUTRO,acao:'suspender'}),async()=>({...ctx,protegidos:[ADMIN,OUTRO]}))).status,403);
  assert.equal((await alterarAcessoConta(req({usuarioId:OUTRO,acao:'suspender',admin:true}),async()=>ctx)).status,400);
  assert.equal(chamadas.length,0);
 });
 it('registra tentativa antes de banir e resultado depois, sem mudar papel, e-mail ou senha',async()=>{
  for(const acao of ['suspender','reativar']){
   const {ctx,chamadas}=contexto();const r=await alterarAcessoConta(req({usuarioId:OUTRO,acao}),async()=>ctx);assert.equal(r.status,200);
   const eventos=chamadas.filter(c=>c.path.includes('admin_acesso_eventos'));assert.equal(eventos.length,2);
   assert.deepEqual(eventos[0].body,{ator_id:ADMIN,usuario_id:OUTRO,acao,situacao:'solicitada'});
   assert.deepEqual(chamadas.find(c=>c.method==='PUT')?.body,{ban_duration:acao==='suspender'?'876000h':'none'});
   assert.deepEqual(eventos[1].body,{situacao:'aplicada'});
   assert(chamadas.indexOf(eventos[0])<chamadas.findIndex(c=>c.method==='PUT'));
  }
 });
 it('falha do Auth fica registrada e nunca é apresentada como sucesso ou expõe detalhes',async()=>{
  const {ctx,chamadas}=contexto(true);const r=await alterarAcessoConta(req({usuarioId:OUTRO,acao:'suspender'}),async()=>ctx);assert.equal(r.status,503);assert.doesNotMatch(await r.text(),/segredo interno/);assert.deepEqual(chamadas.at(-1)?.body,{situacao:'falhou'});
 });
});
