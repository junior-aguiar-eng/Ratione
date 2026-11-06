/**
 * Busca única: uma pergunta ("art. 85 CPC", "Tema 1076", "apelação") consulta as três bases do Ratione de uma vez e devolve os resultados
 * agrupados por ferramenta, cada um com o endereço que o abre. É só leitura das bases públicas: nada é inferido por IA e nada é guardado.
 * Cada ferramenta continua com a sua pesquisa própria (`pesquisar` do NormaViva, `buscarNos` do TeseMap, o catálogo do PrazoZero); aqui só se junta.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { CATALOGO_PRAZOS } from '@ratione/prazozero';
import { listarNormas, pesquisar, type Norma } from './normaviva';
import { buscarNos, textoDaPesquisa } from './tesemap';
import { urlDoNormaViva, urlDoTeseMap } from './parametrosSalvos';

export type FerramentaDaBusca = 'normaviva' | 'tesemap' | 'prazozero';

export interface ItemDaBusca {
  rotulo: string;
  detalhe: string;
  href: string;
}

export interface GrupoDaBusca {
  ferramenta: FerramentaDaBusca;
  titulo: string;
  itens: ItemDaBusca[];
  /** Há mais resultados do que os mostrados: a tela oferece abrir a ferramenta com a mesma pesquisa. */
  temMais: boolean;
  /** Endereço da ferramenta com a mesma pesquisa. */
  verTodos: string;
  /** A base não respondeu agora: a tela diz isso em vez de mostrar o grupo como se estivesse sem resultado. */
  indisponivel: boolean;
}

export const LIMITE_POR_FERRAMENTA = 5;
export const TAMANHO_MAXIMO_DA_BUSCA = 80;
const TAMANHO_MINIMO = 2;

const TITULO: Record<FerramentaDaBusca, string> = { normaviva: 'NormaViva', tesemap: 'TeseMap', prazozero: 'PrazoZero' };

/** Texto da pesquisa como a busca o usa: sem espaços nas pontas, em um tamanho limitado. */
export function limparBusca(entrada: string): string {
  return entrada.replace(/\s+/g, ' ').trim().slice(0, TAMANHO_MAXIMO_DA_BUSCA);
}

export const buscaValida = (q: string): boolean => limparBusca(q).length >= TAMANHO_MINIMO;

/** Minúsculas e sem acento, para comparar "apelacao" com "Apelação". */
const semAcento = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/** Endereço da ferramenta com a pesquisa já preenchida (a ferramenta lê `?q=`). */
export function urlComBusca(ferramenta: FerramentaDaBusca, q: string): string {
  return `/${ferramenta}?${new URLSearchParams({ q: limparBusca(q) }).toString()}`;
}

function grupo(ferramenta: FerramentaDaBusca, q: string, todos: ItemDaBusca[], indisponivel = false): GrupoDaBusca {
  return {
    ferramenta,
    titulo: TITULO[ferramenta],
    itens: todos.slice(0, LIMITE_POR_FERRAMENTA),
    temMais: todos.length > LIMITE_POR_FERRAMENTA,
    // O PrazoZero escolhe o ato num formulário: não lê a pesquisa, e o endereço dele não a leva
    verTodos: ferramenta === 'prazozero' ? '/prazozero' : urlComBusca(ferramenta, q),
    indisponivel
  };
}

/** Os atos do PrazoZero cujo nome, grupo ou base legal têm todas as palavras da pesquisa. Catálogo fixo: não depende de rede. */
export function atosDoPrazoZero(q: string): ItemDaBusca[] {
  const palavras = semAcento(limparBusca(q)).split(' ').filter(p => p.length >= 2);
  if (palavras.length === 0) return [];
  return CATALOGO_PRAZOS.filter(p => {
    const texto = semAcento(`${p.ato} ${p.grupo} ${p.baseLegal}`);
    return palavras.every(w => texto.includes(w));
  }).map(p => ({
    rotulo: p.ato,
    detalhe: `${p.natureza === 'material' ? 'Prazo material' : p.grupo} · ${p.dias} dias · ${p.baseLegal}`,
    href: `/prazozero?${new URLSearchParams({ ato: p.id }).toString()}`
  }));
}

const resumo = (t: string, max = 150): string => {
  const limpo = t.replace(/<\/?b>/g, '').replace(/\s+/g, ' ').trim();
  return limpo.length > max ? `${limpo.slice(0, max - 1).trimEnd()}…` : limpo;
};

/** O nome curto da norma para o resultado ("Código de Processo Civil"), ou o próprio id se a base não a listar. */
function nomeDaNorma(normas: Norma[], id: string): string {
  return normas.find(n => n.id === id)?.nome ?? id;
}

/**
 * Pesquisa nas três ferramentas ao mesmo tempo. Uma base que falha não derruba as outras: o grupo dela volta marcado como indisponível.
 * Ordem dos grupos: o que a pesquisa parece ser (citação de artigo → NormaViva; tema ou súmula → TeseMap; ato → PrazoZero) vem primeiro.
 */
export async function buscarEmTudo(db: SupabaseClient | null, consulta: string): Promise<GrupoDaBusca[]> {
  const q = limparBusca(consulta);
  if (!buscaValida(q)) return [];

  const prazos = grupo('prazozero', q, atosDoPrazoZero(q));
  if (!db) return ordenar(q, [grupo('normaviva', q, [], true), grupo('tesemap', q, [], true), prazos]);

  const [lei, tese] = await Promise.allSettled([
    listarNormas(db).then(async normas => {
      const r = await pesquisar(db, q, normas);
      return r.tipo === 'vazio' ? [] : r.itens.map(i => ({ rotulo: `${i.rotulo}, ${nomeDaNorma(normas, i.norma_id)}`, detalhe: resumo(i.trecho), href: urlDoNormaViva({ dispositivoId: i.id }) }));
    }),
    buscarNos(db, { texto: textoDaPesquisa(q), tribunal: '', tipo: '' }).then(nos =>
      nos.map(n => ({ rotulo: n.rotulo, detalhe: resumo([n.tribunal, n.descricao].filter(Boolean).join(' · ')), href: urlDoTeseMap({ noId: n.id }) }))
    )
  ]);

  return ordenar(q, [
    lei.status === 'fulfilled' ? grupo('normaviva', q, lei.value) : grupo('normaviva', q, [], true),
    tese.status === 'fulfilled' ? grupo('tesemap', q, tese.value) : grupo('tesemap', q, [], true),
    prazos
  ]);
}

/** Pela forma da pesquisa: "art. 85"/"CPC" é lei; "tema 1076", "súmula 7", "RE", "STJ" é precedente; o resto fica na ordem fixa. */
export function ferramentaMaisProvavel(q: string): FerramentaDaBusca | null {
  const t = semAcento(q);
  if (/\b(tema|sumula|stj|stf|iac|repercussao|repetitivo)\b/.test(t)) return 'tesemap';
  if (/\b(art|arts|artigo|lei|decreto|cpc|clt|cpp|cc|cf)\b/.test(t)) return 'normaviva';
  if (/\b(prazo|recurso|apelacao|agravo|embargos|contestacao|replica|contrarrazoes)\b/.test(t)) return 'prazozero';
  return null;
}

/** Os grupos com resultado antes dos vazios; entre eles, a ferramenta mais provável primeiro e, no mais, a ordem NormaViva, TeseMap, PrazoZero. */
export function ordenar(q: string, grupos: GrupoDaBusca[]): GrupoDaBusca[] {
  const provavel = ferramentaMaisProvavel(q);
  const peso = (g: GrupoDaBusca) => (g.itens.length > 0 ? 0 : g.indisponivel ? 2 : 1) * 10 + (g.ferramenta === provavel ? 0 : 1);
  return grupos.map((g, i) => ({ g, i })).sort((a, b) => peso(a.g) - peso(b.g) || a.i - b.i).map(x => x.g);
}
