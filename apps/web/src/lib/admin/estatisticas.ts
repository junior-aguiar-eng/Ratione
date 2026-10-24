import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import { esquemaFinanceiro } from './financeiro';

const contagem = z.number().int().nonnegative().safe();
export const esquemaEstatisticas = esquemaFinanceiro.omit({clientes:true,total_clientes:true}).extend({
  usuarios: z.object({total:contagem,novos_no_mes:contagem,ativos_ia_no_mes:contagem}).strict(),
  ia:z.object({execucoes:contagem,geradas:contagem,cache:contagem,problemas:contagem,reservadas:contagem,tokens_entrada:contagem,tokens_saida:contagem,tokens_cache_leitura:contagem,tokens_cache_escrita:contagem}).strict()
}).strict();
export type Estatisticas = z.infer<typeof esquemaEstatisticas>;

export async function servirEstatisticas(abrir:()=>Promise<Pick<SupabaseClient,'rpc'>|null>):Promise<Response>{
  const headers={'Content-Type':'application/json','Cache-Control':'private, no-store',Vary:'Cookie'};
  const resposta=(dados:unknown,status=200)=>new Response(JSON.stringify(dados),{status,headers});
  try{
    const servidor=await abrir();if(!servidor)return resposta({mensagem:'Página não encontrada.'},404);
    const {data,error}=await servidor.rpc('admin_estatisticas');
    const valido=esquemaEstatisticas.safeParse(data);
    if(error||!valido.success)return resposta({mensagem:'Estatísticas indisponíveis. Confira a migração e tente novamente.'},503);
    return resposta(valido.data);
  }catch{return resposta({mensagem:'Estatísticas indisponíveis.'},503);}
}
