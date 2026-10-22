/**
 * Dados do TeseMap (F4-04): leitura de `tesemap_nos` e `tesemap_arestas` com a chave publicável do Supabase. A leitura é pública e a RLS já
 * esconde o que não passou pela regra de procedência (nó de IA sem validação; aresta sem validação humana). Nada aqui escreve.
 * Cada tela mostra a fonte, a atribuição (licença CC BY do STJ) e a data de leitura.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export interface FonteDoNo {
  id: string;
  ato: string;
  url: string;
  lido: string;
  lidoEm: string;
}

export interface CitacaoDoNo {
  normaId: string;
  artigo: string;
  detalhe: string | null;
  dispositivoId: string;
}

export interface NoTese {
  id: string;
  tipo: string;
  rotulo: string;
  tribunal: string | null;
  numero_referencia: string | null;
  descricao: string;
  dispositivo_id: string | null;
  detalhes: Record<string, unknown>;
  origem_dado: 'curado' | 'sugerido_ia';
  fontes: FonteDoNo[];
  validado_por: string | null;
  validado_em: string | null;
  atualizado_em: string;
}

export interface ArestaTese {
  id: number;
  origem_id: string;
  destino_id: string;
  tipo: string;
  rotulo: string;
  origem_dado: 'curado' | 'sugerido_ia';
  fontes: FonteDoNo[];
  validado_por: string | null;
  validado_em: string | null;
}

export interface Cobertura {
  tribunal: string;
  tipo: string;
  total: number;
  atualizado_em: string;
}

const COLUNAS_NO = 'id, tipo, rotulo, tribunal, numero_referencia, descricao, dispositivo_id, detalhes, origem_dado, fontes, validado_por, validado_em, atualizado_em';
const COLUNAS_ARESTA = 'id, origem_id, destino_id, tipo, rotulo, origem_dado, fontes, validado_por, validado_em';
const LIMITE_DA_LISTA = 40;

function falhou(erro: { message: string } | null, quando: string): never {
  throw new Error(`${quando}: ${erro?.message ?? 'erro desconhecido'}`);
}

/**
 * Limpa o texto da pesquisa: "Tema 1.076" vira "Tema 1076" (o rótulo é "Tema 1076 do STJ"), pontuação solta sai, espaços se juntam e o
 * tamanho é limitado. O banco ainda trata o texto como pesquisa (nunca como comando), mas uma consulta limpa também evita chamada à toa.
 */
export function textoDaPesquisa(entrada: string): string {
  return entrada
    .normalize('NFC')
    .replace(/(\d)\.(?=\d)/g, '$1')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

/** Banco sem as tabelas (migração por aplicar) ou sem dados: a página cai para a prévia catalogada em vez de mostrar erro. */
export function tabelaAusente(erro: { code?: string; message?: string } | null): boolean {
  return !!erro && (erro.code === '42P01' || erro.code === 'PGRST205' || /schema cache|does not exist/i.test(erro.message ?? ''));
}

export async function lerCobertura(db: SupabaseClient): Promise<{ itens: Cobertura[]; indisponivel: boolean }> {
  const r = await db.rpc('tesemap_cobertura');
  if (r.error) {
    if (tabelaAusente(r.error) || r.error.code === '42883' || r.error.code === 'PGRST202') return { itens: [], indisponivel: true };
    falhou(r.error, 'ler a cobertura');
  }
  return { itens: (r.data ?? []) as Cobertura[], indisponivel: false };
}

export interface FiltroDeNos {
  texto: string;
  tribunal: string;
  tipo: string;
}

/**
 * Pesquisa no banco (`tesemap_buscar`, migração 20261022000005): todas as palavras, em qualquer ordem, sem acento nem maiúscula; sem texto,
 * lista tudo. Os mais recentemente julgados primeiro quando a relevância empata.
 */
export async function buscarNos(db: SupabaseClient, f: FiltroDeNos): Promise<NoTese[]> {
  const r = await db.rpc('tesemap_buscar', { consulta: textoDaPesquisa(f.texto), tribunal: f.tribunal || null, tipo: f.tipo || null, limite: LIMITE_DA_LISTA });
  if (r.error) falhou(r.error, 'buscar precedentes');
  return (r.data ?? []) as NoTese[];
}

export interface Vizinhanca {
  no: NoTese;
  arestas: ArestaTese[];
  vizinhos: NoTese[];
}

export async function abrirNo(db: SupabaseClient, id: string): Promise<Vizinhanca | null> {
  const n = await db.from('tesemap_nos').select(COLUNAS_NO).eq('id', id).maybeSingle();
  if (n.error) falhou(n.error, 'abrir o precedente');
  if (!n.data) return null;
  const [saindo, chegando] = await Promise.all([
    db.from('tesemap_arestas').select(COLUNAS_ARESTA).eq('origem_id', id).limit(100),
    db.from('tesemap_arestas').select(COLUNAS_ARESTA).eq('destino_id', id).limit(100)
  ]);
  if (saindo.error) falhou(saindo.error, 'ler as relações');
  if (chegando.error) falhou(chegando.error, 'ler as relações');
  const arestas = [...((saindo.data ?? []) as unknown as ArestaTese[]), ...((chegando.data ?? []) as unknown as ArestaTese[])];
  const outros = [...new Set(arestas.map(a => (a.origem_id === id ? a.destino_id : a.origem_id)))];
  let vizinhos: NoTese[] = [];
  if (outros.length > 0) {
    const v = await db.from('tesemap_nos').select(COLUNAS_NO).in('id', outros);
    if (v.error) falhou(v.error, 'ler os precedentes relacionados');
    vizinhos = (v.data ?? []) as unknown as NoTese[];
  }
  return { no: n.data as unknown as NoTese, arestas, vizinhos };
}

/** "Tema 1076 do STJ · julgado em 16/03/2022" para a lista; o que o nó não traz não aparece. */
export function resumoDoNo(n: NoTese, dataCurta: (iso: string) => string): string {
  const julgado = typeof n.detalhes.dataJulgamento === 'string' ? n.detalhes.dataJulgamento : null;
  const orgao = typeof n.detalhes.orgaoJulgador === 'string' ? n.detalhes.orgaoJulgador : null;
  return [julgado ? `julgado em ${dataCurta(julgado)}` : null, orgao].filter(Boolean).join(' · ');
}

/** Lista as citações guardadas em `detalhes.citacoes`, ignorando o que não tiver o formato esperado. */
export function citacoesDoNo(n: NoTese): CitacaoDoNo[] {
  const bruto = n.detalhes.citacoes;
  if (!Array.isArray(bruto)) return [];
  return bruto.filter(
    (c): c is CitacaoDoNo => !!c && typeof c.normaId === 'string' && typeof c.artigo === 'string' && typeof c.dispositivoId === 'string' && (c.detalhe === null || typeof c.detalhe === 'string')
  );
}

/** Posição de cada vizinho numa circunferência em torno do nó aberto, que fica no centro (0, 0). */
export function posicoesRadiais(n: number, raio = 300): Array<{ x: number; y: number }> {
  return Array.from({ length: n }, (_, i) => {
    const ang = (2 * Math.PI * i) / Math.max(n, 1) - Math.PI / 2;
    return { x: Math.round(raio * Math.cos(ang)), y: Math.round(raio * Math.sin(ang)) };
  });
}

const PLURAL: Record<string, [string, string]> = {
  tema: ['tema', 'temas'], questao: ['questão', 'questões'], tese: ['tese', 'teses'], precedente: ['precedente', 'precedentes'], sumula: ['súmula', 'súmulas'],
  dispositivo: ['dispositivo', 'dispositivos'], conceito: ['conceito', 'conceitos'], excecao: ['exceção', 'exceções'], distinguishing: ['distinguishing', 'distinguishings'],
  superacao: ['superação', 'superações']
};

/** "1.155 precedentes do STJ", "1 súmula do STF": a cobertura declarada em português. */
export function coberturaPorExtenso(itens: Cobertura[]): string {
  return itens
    .map(c => `${c.total.toLocaleString('pt-BR')} ${(PLURAL[c.tipo] ?? [c.tipo, c.tipo])[c.total === 1 ? 0 : 1]} ${c.tribunal ? `do ${c.tribunal}` : 'sem tribunal informado'}`)
    .join(', ');
}

export interface NoLigado {
  id: string;
  rotulo: string;
  tribunal: string | null;
}

/** Números dos temas de repercussão geral do STF que um nó do STJ liga (`detalhes.repercussaoGeral`), ignorando o que não for número. */
export function numerosDeRepercussaoGeral(n: NoTese): string[] {
  const bruto = n.detalhes.repercussaoGeral;
  if (!Array.isArray(bruto)) return [];
  return [...new Set(bruto.map(r => (r && typeof r === 'object' ? (r as { numero?: unknown }).numero : null)).filter((x): x is string => typeof x === 'string' && /^\d+$/.test(x)))];
}

/**
 * Ligações que o próprio STJ declara no arquivo oficial entre um precedente seu e um tema de repercussão geral do STF (e a volta). NÃO são relações
 * validadas do mapa: a tela as mostra à parte, dizendo de onde vêm. Só aparecem os nós que existem no grafo.
 */
export async function ligadosPelaRepercussaoGeral(db: SupabaseClient, n: NoTese): Promise<NoLigado[]> {
  if (n.tribunal === 'STJ') {
    const ids = numerosDeRepercussaoGeral(n).map(x => `STF-RG-${x}`);
    if (ids.length === 0) return [];
    const r = await db.from('tesemap_nos').select('id, rotulo, tribunal').in('id', ids);
    if (r.error) falhou(r.error, 'ler os temas do STF ligados');
    return (r.data ?? []) as NoLigado[];
  }
  const m = n.id.match(/^STF-RG-(\d+)$/);
  if (!m) return [];
  const r = await db.from('tesemap_nos').select('id, rotulo, tribunal').contains('detalhes', { repercussaoGeral: [{ numero: m[1] }] }).limit(50);
  if (r.error) falhou(r.error, 'ler os precedentes do STJ ligados');
  return (r.data ?? []) as NoLigado[];
}
