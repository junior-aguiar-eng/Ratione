/** O cache local só fornece dados de apresentação depois que o servidor valida a mesma conta. */
export async function lerSessaoValidada<T extends {id:string}>(
  lerLocal:()=>Promise<{data:{session:{user:T}|null}}>,consultar:typeof fetch=fetch
):Promise<T|null>{
  try{
    const {data}=await lerLocal();const usuario=data.session?.user;if(!usuario)return null;
    const r=await consultar('/api/conta/sessao',{cache:'no-store'});if(!r.ok)return null;
    const verificado=await r.json();return verificado?.usuarioId===usuario.id?usuario:null;
  }catch{return null;}
}

export async function servirSessaoValidada(verificar:()=>Promise<{data:{user:{id:string;is_anonymous?:boolean}|null};error:unknown}>):Promise<Response>{
  const headers={'Content-Type':'application/json','Cache-Control':'private, no-store',Vary:'Cookie'};
  try{
    const {data,error}=await verificar();
    return Response.json({usuarioId:!error&&data.user&&!data.user.is_anonymous?data.user.id:null},{headers});
  }catch{return Response.json({usuarioId:null},{status:503,headers});}
}
