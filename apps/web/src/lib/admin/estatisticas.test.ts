import {describe,it} from 'node:test';
import assert from 'node:assert/strict';
import {createClient} from '@supabase/supabase-js';
import {servirEstatisticas} from './estatisticas';
const dados={inicio:'2026-10-01T03:00:00Z',fim:'2026-11-01T03:00:00Z',planos:['gratuito','essencial','profissional','sem_atribuicao'].map(plano=>({plano,custo_real_usd:0,reservado_usd:0,receita_centavos:0,reembolsado_centavos:0})),fundos:['gratuito','pagantes'].map(fundo=>({fundo,orcamento_usd:5,custo_real_usd:0,reservado_usd:0})),teste_aprovado_centavos:0,usuarios:{total:2,novos_no_mes:1,ativos_ia_no_mes:1},ia:{execucoes:0,geradas:0,cache:0,problemas:0,reservadas:0,tokens_entrada:0,tokens_saida:0,tokens_cache_leitura:0,tokens_cache_escrita:0}};
const cliente=(data:unknown)=>createClient('https://banco.exemplo.test','local',{auth:{persistSession:false},global:{fetch:async()=>Response.json(data)}});
describe('Estatísticas: somente agregados para administrador',()=>{
 it('nega sem autenticação e não permite cache de dados autorizados',async()=>{
  assert.equal((await servirEstatisticas(async()=>null)).status,404);
  const r=await servirEstatisticas(async()=>cliente(dados));assert.equal(r.status,200);assert.deepEqual(await r.json(),dados);assert.equal(r.headers.get('cache-control'),'private, no-store');
 });
 it('não transmite IDs ou campos extras mesmo se a RPC devolver formato inadequado',async()=>{
  for(const d of [{...dados,clientes:[{usuario_id:'identificador-nao-expor'}]},null]){const r=await servirEstatisticas(async()=>cliente(d));assert.equal(r.status,503);assert.doesNotMatch(await r.text(),/identificador-nao-expor/);}
 });
});
