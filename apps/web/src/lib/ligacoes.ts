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
/** Quantos o banco devolve por busca: a tela mostra os `LIMITE_DE_PRECEDENTES` primeiros depois da ordenação (vinculantes e súmulas na frente). */
const LIMITE_DA_BUSCA = 40;

interface NoQueCita {
  id: string;
  rotulo: string;
  tipo: string;
  tribunal: string | null;
  descricao: string | null;
  vinculante: boolean | null;
  teseFirmada: boolean | null;
}

/** Um precedente, tema ou súmula do TeseMap que cita o dispositivo, com o que a lista precisa para ser lida sem abrir cada um. */
export interface PrecedenteQueCita extends Ligacao {
  tribunal: string | null;
  /** A tese ou o enunciado, resumido ao tamanho de uma prévia. Vazio quando o tribunal não firmou tese. */
  tese: string;
  vinculante: boolean;
}

export interface PrecedentesQueCitam {
  itens: PrecedenteQueCita[];
  /** Há mais precedentes do que os mostrados: a tela avisa, em vez de sugerir que a lista é completa. */
  temMais: boolean;
}

/** A prévia da tese: espaços colapsados e corte numa palavra inteira. */
export function previaDaTese(texto: string | null | undefined, max = 200): string {
  const t = (texto ?? '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const corte = t.slice(0, max);
  return `${corte.slice(0, Math.max(corte.lastIndexOf(' '), max / 2)).replace(/[\s,;:.]+$/, '')}…`;
}

/** Vinculantes primeiro, depois súmulas, depois os temas com tese firmada e, por fim, o resto (ações de controle, temas sem tese); dentro de cada grupo, pela ordem do id. */
function posicao(n: NoQueCita): number {
  if (n.vinculante === true) return 0;
  if (n.tipo === 'sumula') return 1;
  return n.tipo === 'tema' && n.teseFirmada !== false ? 2 : 3;
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
      .select('id, rotulo, tipo, tribunal, descricao, vinculante:detalhes->vinculante, teseFirmada:detalhes->teseFirmada')
      .contains('detalhes', { citacoes: [{ dispositivoId: id }] })
      .order('id')
      .limit(LIMITE_DA_BUSCA + 1);
    if (r.error) return { itens: [], temMais: false };
    for (const n of (r.data ?? []) as NoQueCita[]) vistos.set(n.id, n);
  }
  const todos = [...vistos.values()].sort((a, b) => posicao(a) - posicao(b) || a.id.localeCompare(b.id));
  return {
    itens: todos.slice(0, LIMITE_DE_PRECEDENTES).map(n => ({
      rotulo: n.rotulo,
      href: urlDoTeseMap({ noId: n.id }),
      tribunal: n.tribunal,
      tese: n.teseFirmada === false ? '' : previaDaTese(n.descricao),
      vinculante: n.vinculante === true
    })),
    temMais: todos.length > LIMITE_DE_PRECEDENTES
  };
}
