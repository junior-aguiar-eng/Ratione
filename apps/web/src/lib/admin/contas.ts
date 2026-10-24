import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import { origemPublica } from '../origem';

const conta=z.object({id:z.uuid(),email_mascarado:z.string().max(320),criada_em:z.string().datetime({offset:true}),ultimo_acesso:z.string().datetime({offset:true}).nullable(),email_confirmado:z.boolean(),suspensa_ate:z.string().datetime({offset:true}).nullable()}).strict();
const lista=z.object({total:z.number().int().nonnegative().safe(),contas:z.array(conta).max(20)}).strict();
export type ContaAdministrada=z.infer<typeof conta>&{protegida:boolean};
export type ListaContas={total:number;contas:ContaAdministrada[]};
type Contexto={servidor:SupabaseClient;usuarioId:string;protegidos:string[]};
type Abrir=()=>Promise<Contexto|null>;
const headers={'Content-Type':'application/json','Cache-Control':'private, no-store',Vary:'Cookie'};
const resposta=(dados:unknown,status=200)=>new Response(JSON.stringify(dados),{status,headers});

export async function servirContas(request:Request,abrir:Abrir):Promise<Response>{
 try{
  const ctx=await abrir();if(!ctx)return resposta({mensagem:'Página não encontrada.'},404);
  let busca='',pagina=0;
  if(request.method==='POST'){
    if(request.headers.get('origin')!==origemPublica(request))return resposta({mensagem:'Origem não permitida.'},403);
    const texto=await request.text();if(texto.length>1024)return resposta({mensagem:'Busca inválida.'},400);
    let bruto:unknown;try{bruto=JSON.parse(texto);}catch{return resposta({mensagem:'Busca inválida.'},400);}
    const p=z.object({busca:z.string().trim().max(120),pagina:z.number().int().min(0).max(1000000)}).strict().safeParse(bruto);
    if(!p.success)return resposta({mensagem:'Busca inválida.'},400);
    busca=p.data.busca;pagina=p.data.pagina;
  }else{
    const q=new URL(request.url).searchParams,p=q.get('pagina')??'0';
    if(!/^\d{1,7}$/.test(p)||Number(p)>1000000||[...q.keys()].some(k=>k!=='pagina'))return resposta({mensagem:'Busca inválida.'},400);
    pagina=Number(p);
  }
  const {data,error}=await ctx.servidor.rpc('admin_contas',{p_busca:busca,p_pagina:pagina});
  const r=lista.safeParse(data);if(error||!r.success)throw new Error();
  return resposta({...r.data,contas:r.data.contas.map(c=>({...c,protegida:ctx.protegidos.includes(c.id.toLowerCase())||c.id===ctx.usuarioId}))});
 }catch{return resposta({mensagem:'Não foi possível consultar as contas.'},503);}
}

/** Só altera ban_duration pelo Auth Admin. Não promove papéis nem muda credenciais ou confirmação de e-mail. */
export async function alterarAcessoConta(request:Request,abrir:Abrir):Promise<Response>{
 try{
  const ctx=await abrir();if(!ctx)return resposta({mensagem:'Página não encontrada.'},404);
  if(request.headers.get('origin')!==origemPublica(request))return resposta({mensagem:'Origem não permitida.'},403);
  if(!request.headers.get('content-type')?.startsWith('application/json'))return resposta({mensagem:'Pedido inválido.'},400);
  const texto=await request.text();if(texto.length>1024)return resposta({mensagem:'Pedido inválido.'},400);
  let bruto:unknown;try{bruto=JSON.parse(texto);}catch{return resposta({mensagem:'Pedido inválido.'},400);}
  const pedido=z.object({usuarioId:z.uuid(),acao:z.enum(['suspender','reativar'])}).strict().safeParse(bruto);
  if(!pedido.success)return resposta({mensagem:'Pedido inválido.'},400);
  const {acao}=pedido.data,usuarioId=pedido.data.usuarioId.toLowerCase();
  if(usuarioId===ctx.usuarioId.toLowerCase()||ctx.protegidos.includes(usuarioId))return resposta({mensagem:'Contas administradoras são protegidas. O papel é configurado somente no servidor.'},403);
  const usuario=await ctx.servidor.auth.admin.getUserById(usuarioId);
  if(usuario.error||!usuario.data.user||usuario.data.user.is_anonymous)return resposta({mensagem:'Conta não disponível.'},404);
  const evento=await ctx.servidor.from('admin_acesso_eventos').insert({ator_id:ctx.usuarioId,usuario_id:usuarioId,acao,situacao:'solicitada'}).select('id').single();
  if(evento.error||!evento.data?.id)throw new Error();
  const alteracao=await ctx.servidor.auth.admin.updateUserById(usuarioId,{ban_duration:acao==='suspender'?'876000h':'none'});
  const registro=await ctx.servidor.from('admin_acesso_eventos').update({situacao:alteracao.error?'falhou':'aplicada'}).eq('id',evento.data.id);
  if(alteracao.error||registro.error)return resposta({mensagem:'Não foi possível confirmar a operação. Atualize a lista antes de tentar novamente.'},503);
  return resposta({ok:true});
 }catch{return resposta({mensagem:'Não foi possível confirmar a operação. Atualize a lista antes de tentar novamente.'},503);}
}
