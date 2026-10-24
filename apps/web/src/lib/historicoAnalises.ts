import type { SupabaseClient } from '@supabase/supabase-js';
import { inicioDoHistorico, type LinhaAnalise } from './uso';

export const LIMITE_ANALISES_HISTORICO = 500;
const CAMPOS = 'id, tipo, rotulo, situacao, consumiu, falhas, criada_em, concluida_em';

export async function lerHistoricoAnalises(cliente: SupabaseClient, plano: string, agora = new Date()): Promise<{ historico: LinhaAnalise[]; truncado: boolean }> {
  const consulta = (campos: string) => cliente.from('analises').select(campos).gte('criada_em',inicioDoHistorico(plano,agora)).order('criada_em',{ascending:false}).limit(LIMITE_ANALISES_HISTORICO+1);
  let r = await consulta(`${CAMPOS}, paragrafos`);
  // Durante a transição, um banco sem a coluna nova continua permitindo consultar o histórico antigo.
  if (r.error && ['42703','PGRST204'].includes(r.error.code) && /paragrafos/.test(r.error.message)) r = await consulta(CAMPOS);
  if (r.error) throw new Error('Não foi possível ler o seu histórico agora. Tente de novo em alguns minutos.');
  const linhas = (r.data ?? []) as unknown as LinhaAnalise[];
  return { historico: linhas.slice(0,LIMITE_ANALISES_HISTORICO), truncado: linhas.length > LIMITE_ANALISES_HISTORICO };
}
