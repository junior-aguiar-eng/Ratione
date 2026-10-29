/**
 * Ligações entre as ferramentas: o PrazoZero aponta o artigo exato no NormaViva (na redação vigente na data do cálculo) e o NormaViva
 * aponta de volta para os prazos que o artigo fundamenta e para os precedentes e súmulas do TeseMap que o citam.
 * Tudo é endereço montado a partir de dados já conferidos (catálogo de prazos e corpus); nada é inferido por IA.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { buscarPrazo, ehDataIsoValida, FUNDAMENTOS_DOS_PRAZOS, idDoDispositivo, prazosFundamentadosPor } from '@ratione/prazozero';
import { urlDoNormaViva, urlDoTeseMap } from './parametrosSalvos';

const SIGLA_DA_NORMA: Record<string, string> = {
  'LEI-13105-2015': 'CPC',
  'DL-5452-1943': 'CLT',
  'DL-3689-1941': 'CPP',
  'LEI-9099-1995': 'Lei 9.099/1995',
  'LEI-12016-2009': 'Lei 12.016/2009'
};

export interface Ligacao {
  rotulo: string;
  href: string;
}

/** "art. 897, a)" → "CLT, art. 897, a)": o rótulo do corpus com a sigla da norma. */
function rotuloComSigla(normaId: string, rotulo: string): string {
  return `${SIGLA_DA_NORMA[normaId] ?? normaId}, ${rotulo}`;
}

/** Os artigos que fundamentam o prazo, cada um abrindo no NormaViva na redação vigente em `em` (data do cálculo, se válida). */
export function ligacoesDoPrazo(prazoId: string, em?: string): Ligacao[] {
  const data = em && ehDataIsoValida(em) ? em : undefined;
  return (FUNDAMENTOS_DOS_PRAZOS[prazoId] ?? []).map(f => ({
    rotulo: rotuloComSigla(f.normaId, f.rotulo),
    href: urlDoNormaViva({ dispositivoId: idDoDispositivo(f), ...(data ? { em: data } : {}) })
  }));
}

/** Os prazos do PrazoZero que o dispositivo fundamenta, cada um abrindo o cálculo já com o ato escolhido. */
export function prazosDoDispositivo(dispositivoId: string): Ligacao[] {
  return prazosFundamentadosPor(dispositivoId).flatMap(id => {
    const p = buscarPrazo(id);
    return p ? [{ rotulo: p.grupo.startsWith('Cível') || p.natureza === 'material' ? p.ato : `${p.ato} (${p.grupo})`, href: `/prazozero?${new URLSearchParams({ ato: id }).toString()}` }] : [];
  });
}

/** O dispositivo citado e, se for parágrafo, inciso ou alínea, o artigo que o contém (`...|corpo|art. 85, § 2º` → `...|corpo|art. 85`). */
export function idsParaBuscarCitacoes(dispositivoId: string): string[] {
  const [norma, escopo, rotulo] = dispositivoId.split('|');
  if (!norma || escopo !== 'corpo' || !rotulo) return [dispositivoId];
  const artigo = `${norma}|${escopo}|${rotulo.split(', ')[0]}`;
  return artigo === dispositivoId ? [dispositivoId] : [dispositivoId, artigo];
}

export const LIMITE_DE_PRECEDENTES = 8;

interface NoQueCita {
  id: string;
  rotulo: string;
  tipo: string;
}

export interface PrecedentesQueCitam {
  itens: Ligacao[];
  /** Há mais precedentes do que os mostrados: a tela avisa, em vez de sugerir que a lista é completa. */
  temMais: boolean;
}

/**
 * Precedentes, temas e súmulas do TeseMap cuja lista de citações (`detalhes.citacoes`) inclui o dispositivo. Falha de leitura devolve lista vazia:
 * a seção só aparece quando há o que mostrar, e nunca afirma que "não há" precedente.
 */
export async function precedentesQueCitam(db: SupabaseClient, dispositivoId: string): Promise<PrecedentesQueCitam> {
  const vistos = new Map<string, NoQueCita>();
  for (const id of idsParaBuscarCitacoes(dispositivoId)) {
    const r = await db
      .from('tesemap_nos')
      .select('id, rotulo, tipo')
      .contains('detalhes', { citacoes: [{ dispositivoId: id }] })
      .order('id')
      .limit(LIMITE_DE_PRECEDENTES + 1);
    if (r.error) return { itens: [], temMais: false };
    for (const n of (r.data ?? []) as NoQueCita[]) vistos.set(n.id, n);
  }
  const todos = [...vistos.values()].sort((a, b) => a.id.localeCompare(b.id));
  return {
    itens: todos.slice(0, LIMITE_DE_PRECEDENTES).map(n => ({ rotulo: n.rotulo, href: urlDoTeseMap({ noId: n.id }) })),
    temMais: todos.length > LIMITE_DE_PRECEDENTES
  };
}
