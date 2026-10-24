import {cookies} from 'next/headers';
import {createServerClient} from '@supabase/ssr';
import {servirSessaoValidada} from '../../../../lib/sessaoValidada';
export const dynamic='force-dynamic';
export const GET=()=>servirSessaoValidada(async()=>{
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,chave=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if(!url||!chave)throw new Error('Conta indisponível');
  const armazem=await cookies();
  const sessao=createServerClient(url,chave,{cookies:{getAll:()=>armazem.getAll(),setAll:lista=>{lista.forEach(({name,value,options})=>armazem.set(name,value,options));}}});
  return sessao.auth.getUser();
});
