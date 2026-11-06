import type { SupabaseClient } from '@supabase/supabase-js';

/** Um precedente do TeseMap como a tarefa de relação o recebe: só o que o tribunal registra, sem relações nem comentário. */
export interface NoParaRelacionar {
  id: string;
  rotulo: string;
  tribunal: string | null;
  tipo: string;
  /** A tese firmada ou o enunciado da súmula, como o tribunal a registra. */
  descricao: string;
  /** A questão submetida a julgamento, quando o tribunal a registra. */
  questao: string | null;
  /** Falso quando o tribunal não firmou tese (o texto é só a questão). */
  teseFirmada: boolean;
  /** Efeito vinculante, como o tribunal registra. */
  vinculante?: boolean;
  /** A situação que o tribunal registra (ex.: "Mérito julgado"), quando houver. */
  situacao?: string | null;
}

/** Id de nó do TeseMap (`STJ-TEMA-1076`): só o formato, nada de texto livre chega ao modelo. */
export const idDeNoValido = (id: unknown): id is string => typeof id === 'string' && /^[A-Za-z0-9._-]{1,80}$/.test(id);

const texto = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null);

/** Fonte de leitura (pública) do TeseMap. Nada vem do navegador além do id. */
export async function lerNoParaRelacionar(db: SupabaseClient, id: string): Promise<NoParaRelacionar | null> {
  const r = await db.from('tesemap_nos').select('id, tipo, rotulo, tribunal, descricao, detalhes').eq('id', id).maybeSingle();
  if (r.error) throw new Error(`ler precedente: ${r.error.message}`);
  if (!r.data) return null;
  const d = r.data as { id: string; tipo: string; rotulo: string; tribunal: string | null; descricao: string; detalhes: Record<string, unknown> | null };
  const detalhes = d.detalhes ?? {};
  return {
    id: d.id,
    rotulo: d.rotulo,
    tribunal: d.tribunal,
    tipo: d.tipo,
    descricao: d.descricao ?? '',
    questao: texto(detalhes.questao),
    teseFirmada: detalhes.teseFirmada !== false,
    vinculante: detalhes.vinculante === true,
    situacao: texto(detalhes.situacao)
  };
}
