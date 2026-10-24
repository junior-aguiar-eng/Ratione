'use client';
import { useEffect,useState } from 'react';
import type { Estatisticas } from '../../../lib/admin/estatisticas';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Notice from '../../../components/Notice';

export default function EstatisticasUso(){
  const [dados,setDados]=useState<Estatisticas|null>(null),[erro,setErro]=useState(false),[versao,setVersao]=useState(0);
  useEffect(()=>{const c=new AbortController();setDados(null);setErro(false);
    void fetch('/api/admin/estatisticas',{cache:'no-store',signal:c.signal}).then(async r=>{if(!r.ok)throw new Error();const d=await r.json();if(!c.signal.aborted)setDados(d);}).catch(()=>{if(!c.signal.aborted)setErro(true);});return()=>c.abort();
  },[versao]);
  return <section aria-labelledby="estatisticas-contas" className="flex flex-col gap-4">
    <div className="flex flex-wrap justify-between gap-3"><h2 id="estatisticas-contas" className="font-serif text-2xl font-semibold">Contas e uso de IA</h2><Button variant="secondary" onClick={()=>setVersao(v=>v+1)}>Atualizar estatísticas</Button></div>
    <p className="text-sm text-ink-soft">Dados agregados, sem identificação individual. Contas cadastradas são o total atual, excluídas contas anônimas e excluídas. Novas contas e uso de IA consideram o mês corrente de Brasília. Contas ativas aqui são contas com execução de IA registrada, incluindo cache; não representam todos os acessos ao site.</p>
    {erro?<Notice tom="warn">Não foi possível carregar as estatísticas. Tente novamente.</Notice>:!dados?<p role="status">Carregando estatísticas…</p>:<>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[
      ['Contas cadastradas',dados.usuarios.total],['Novas contas no mês',dados.usuarios.novos_no_mes],['Contas com uso de IA no mês',dados.usuarios.ativos_ia_no_mes],
      ['Execuções registradas',dados.ia.execucoes],['Respostas geradas',dados.ia.geradas],['Reutilizações do cache',dados.ia.cache],['Falhas, recusas ou resultados inválidos',dados.ia.problemas],['Reservas em andamento',dados.ia.reservadas],
      ['Tokens de entrada',dados.ia.tokens_entrada],['Tokens de saída',dados.ia.tokens_saida],['Tokens de leitura de cache do modelo',dados.ia.tokens_cache_leitura],['Tokens de escrita de cache do modelo',dados.ia.tokens_cache_escrita]
    ].map(([titulo,valor])=><Card key={titulo} className="p-5 flex flex-col gap-2"><h3 className="text-sm text-ink-soft">{titulo}</h3><p className="text-2xl font-semibold">{Number(valor).toLocaleString('pt-BR')}</p></Card>)}</div>
    <p className="text-sm text-ink-soft">Tokens são os valores informados pelo modelo e registrados nas execuções finalizadas. Ausência de medição não é estimada. Reutilização de resposta no cache do Ratione não representa nova chamada ao modelo. Custos e limites dos fundos aparecem abaixo.</p>
    </>}
  </section>;
}
