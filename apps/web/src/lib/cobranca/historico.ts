import type { SupabaseClient } from '@supabase/supabase-js';
import type { Ambiente } from './config';

export interface LinhaCobranca {
  id: string;
  valor_centavos: number;
  situacao: 'aprovada' | 'pendente' | 'rejeitada' | 'reembolsada' | 'cancelada';
  meio: string | null;
  criada_em: string;
  paga_em: string | null;
}

export interface PaginaCobrancas {
  linhas: LinhaCobranca[];
  temMais: boolean;
}

export async function lerHistoricoCobrancas(
  cliente: SupabaseClient,
  usuarioId: string,
  ambiente: Ambiente,
  pagina = 0
): Promise<PaginaCobrancas> {
  const inicio = pagina * 20;
  if (!usuarioId.trim() || (ambiente !== 'teste' && ambiente !== 'producao') || !Number.isSafeInteger(pagina) || pagina < 0 || !Number.isSafeInteger(inicio + 20)) {
    throw new Error('Consulta de cobranças inválida.');
  }
  // Usa o cliente da sessão, sujeito à RLS. O filtro explícito reforça o escopo; nunca usa service_role.
  const { data, error } = await cliente
    .from('cobrancas')
    .select('id,valor_centavos,situacao,meio,criada_em,paga_em')
    .eq('usuario_id', usuarioId)
    .eq('ambiente', ambiente)
    .order('criada_em', { ascending: false })
    .order('id', { ascending: false })
    .range(inicio, inicio + 20);
  if (error) throw new Error('Não foi possível ler as cobranças. Tente de novo em alguns minutos.');
  const linhas = (data ?? []) as LinhaCobranca[];
  return { linhas: linhas.slice(0, 20), temMais: linhas.length > 20 };
}
