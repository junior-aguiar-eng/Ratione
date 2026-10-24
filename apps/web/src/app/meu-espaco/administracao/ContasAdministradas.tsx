'use client';
import { useEffect,useRef,useState } from 'react';
import type { ContaAdministrada,ListaContas } from '../../../lib/admin/contas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Notice from '../../../components/Notice';

const data=(valor:string|null)=>valor?new Date(valor).toLocaleString('pt-BR'):'Não registrado';
const suspensa=(c:ContaAdministrada)=>!!c.suspensa_ate&&new Date(c.suspensa_ate).getTime()>Date.now();
export default function ContasAdministradas(){
 const [busca,setBusca]=useState(''),[consulta,setConsulta]=useState(''),[pagina,setPagina]=useState(0),[versao,setVersao]=useState(0);
 const [lista,setLista]=useState<ListaContas|null>(null),[erro,setErro]=useState<string|null>(null),[aviso,setAviso]=useState<string|null>(null);
 const [confirmacao,setConfirmacao]=useState<{conta:ContaAdministrada;acao:'suspender'|'reativar'}|null>(null),[alterando,setAlterando]=useState(false);
 const dialogo=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(confirmacao)dialogo.current?.focus();},[confirmacao]);
 useEffect(()=>{const c=new AbortController();setLista(null);setErro(null);setConfirmacao(null);
  void fetch('/api/admin/contas/busca',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({busca:consulta,pagina}),cache:'no-store',signal:c.signal})
   .then(async r=>{if(!r.ok)throw new Error('Não foi possível consultar as contas.');const d=await r.json();if(!c.signal.aborted)setLista(d);})
   .catch(()=>{if(!c.signal.aborted)setErro('Não foi possível consultar as contas. Atualize a busca para tentar novamente.');});return()=>c.abort();
 },[consulta,pagina,versao]);
 const confirmar=async()=>{
  if(!confirmacao||alterando)return;setAlterando(true);setErro(null);setAviso(null);
  try{
   const r=await fetch('/api/admin/contas',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({usuarioId:confirmacao.conta.id,acao:confirmacao.acao}),cache:'no-store'});
   if(!r.ok)throw new Error('Não foi possível confirmar a operação. Atualize a busca antes de tentar novamente.');
   setAviso(confirmacao.acao==='suspender'?'Acesso suspenso. Os dados da conta foram preservados.':'Acesso reativado. Se o e-mail ainda não estiver confirmado, essa etapa continua necessária.');setConfirmacao(null);setVersao(v=>v+1);
  }catch(e){setErro((e as Error).message);setConfirmacao(null);}finally{setAlterando(false);}
 };
 return <section aria-labelledby="gestao-contas" className="flex flex-col gap-4">
  <h2 id="gestao-contas" className="font-serif text-2xl font-semibold">Contas e acesso ao Ratione</h2>
  <p className="text-sm text-ink-soft">Pesquise por e-mail ou ID. A lista mostra apenas identificação mínima e situação do cadastro. Senhas, tokens, dados profissionais e conteúdo salvo não são exibidos. Administradores são protegidos; o papel administrativo é definido no servidor.</p>
  <form className="flex flex-wrap gap-2 items-end" onSubmit={e=>{e.preventDefault();setConsulta(busca.trim());setPagina(0);setVersao(v=>v+1);setAviso(null);}}>
   <label htmlFor="busca-conta" className="flex flex-col gap-2 flex-1 min-w-0">E-mail ou ID da conta<Input id="busca-conta" value={busca} onChange={e=>setBusca(e.target.value)} maxLength={120} autoComplete="off" /></label>
   <Button type="submit" variant="secondary" disabled={alterando}>Buscar contas</Button>
  </form>
  {aviso&&<Notice tom="info">{aviso}</Notice>}{erro&&<Notice tom="warn">{erro}</Notice>}
  {!lista&&!erro&&<p role="status">Carregando contas…</p>}
  {lista&&<><p className="text-sm text-ink-soft">{lista.total} {lista.total===1?'conta encontrada':'contas encontradas'}.</p>
   {lista.contas.length===0?<p>Nenhuma conta encontrada nesta busca.</p>:<ul className="divide-y divide-line border-y border-line">{lista.contas.map(c=><li key={c.id} className="py-4 flex flex-col gap-3">
    <div className="flex flex-wrap justify-between gap-3"><div className="min-w-0"><h3 className="font-medium break-all">{c.email_mascarado}</h3><p className="text-sm text-ink-soft break-all">ID: {c.id}</p></div>
     <Button variant="secondary" disabled={c.protegida||alterando} onClick={()=>{setConfirmacao({conta:c,acao:suspensa(c)?'reativar':'suspender'});setAviso(null);}}>{c.protegida?'Administrador protegido':suspensa(c)?'Reativar acesso':'Suspender acesso'}</Button></div>
    <p className="text-sm text-ink-soft">{suspensa(c)?'Acesso suspenso':'Acesso não suspenso'} · {c.email_confirmado?'E-mail confirmado':'E-mail pendente de confirmação'}</p>
    <p className="text-sm text-ink-soft">Cadastro: {data(c.criada_em)} · Último login: {data(c.ultimo_acesso)}</p>
    {!c.email_confirmado&&<p className="text-sm text-ink-soft">O titular precisa confirmar o e-mail pelo fluxo de cadastro. Reativar acesso não confirma o e-mail nem redefine a senha.</p>}
   </li>)}</ul>}
   <nav aria-label="Páginas de cadastro" className="flex flex-wrap gap-3 items-center"><Button variant="secondary" disabled={pagina===0||alterando} onClick={()=>setPagina(p=>p-1)}>Cadastros anteriores</Button><span>Página {pagina+1}</span><Button variant="secondary" disabled={(pagina+1)*20>=lista.total||alterando} onClick={()=>setPagina(p=>p+1)}>Próximos cadastros</Button></nav>
  </>}
  {confirmacao&&<div ref={dialogo} tabIndex={-1} role="alertdialog" aria-modal="false" aria-labelledby="confirmar-acesso" onKeyDown={e=>{if(e.key==='Escape'&&!alterando)setConfirmacao(null);}} className="border border-line rounded-lg p-5 flex flex-col gap-3">
   <h3 id="confirmar-acesso" className="font-semibold">{confirmacao.acao==='suspender'?'Confirmar suspensão':'Confirmar reativação'}</h3>
   <p className="text-sm break-all">Conta {confirmacao.conta.email_mascarado} · {confirmacao.conta.id}</p>
   <p className="text-sm text-ink-soft">{confirmacao.acao==='suspender'?'O acesso ao Ratione será bloqueado e os dados serão preservados. A operação ficará registrada e pode ser revertida.':'A suspensão será removida. Isso não altera senha, confirmação de e-mail, plano, cota ou permissões administrativas.'}</p>
   <div className="flex flex-wrap gap-2"><Button disabled={alterando} onClick={()=>void confirmar()}>{alterando?'Aplicando…':'Confirmar alteração de acesso'}</Button><Button variant="secondary" disabled={alterando} onClick={()=>setConfirmacao(null)}>Cancelar alteração</Button></div>
  </div>}
 </section>;
}
