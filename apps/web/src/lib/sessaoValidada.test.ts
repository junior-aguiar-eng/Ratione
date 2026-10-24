import {describe,it} from 'node:test';
import assert from 'node:assert/strict';
import {lerSessaoValidada,servirSessaoValidada} from './sessaoValidada';
const usuario={id:'aaaaaaaa-1111-4111-8111-111111111111',email:'local@exemplo.test'};
const local=async()=>({data:{session:{user:usuario}}});
describe('Sessão: cache local não determina autenticação no servidor',()=>{
 it('não redireciona com sessão local quando o servidor recusa a sessão',async()=>{
  assert.equal(await lerSessaoValidada(local,async()=>Response.json({usuarioId:null})),null);
  assert.equal(await lerSessaoValidada(local,async()=>Response.json({usuarioId:'outra-conta'})),null);
 });
 it('aceita somente a mesma conta verificada e não transmite o cache local',async()=>{
  const r=await lerSessaoValidada(local,async(url,opcoes)=>{assert.equal(url,'/api/conta/sessao');assert.equal(opcoes?.cache,'no-store');assert.equal(opcoes?.body,undefined);return Response.json({usuarioId:usuario.id});});assert.deepEqual(r,usuario);
 });
 it('ausência de sessão ou falha termina sem usuário, sem travar o carregamento',async()=>{
  assert.equal(await lerSessaoValidada(async()=>({data:{session:null}}),async()=>assert.fail('não deve consultar')),null);
  assert.equal(await lerSessaoValidada(local,async()=>{throw new Error('sem rede');}),null);
  assert.equal(await lerSessaoValidada(async()=>{throw new Error('cache inválido');},async()=>assert.fail()),null);
 });
 it('endpoint retorna só o ID verificado, sem metadados, e nunca permite cache',async()=>{
  const r=await servirSessaoValidada(async()=>({data:{user:{...usuario,user_metadata:{segredo:'não expor'}}},error:null}));assert.deepEqual(await r.json(),{usuarioId:usuario.id});assert.equal(r.headers.get('cache-control'),'private, no-store');assert.equal(r.headers.get('vary'),'Cookie');
  const negado=await servirSessaoValidada(async()=>({data:{user:usuario},error:new Error('recusado')}));assert.deepEqual(await negado.json(),{usuarioId:null});
 });
});
