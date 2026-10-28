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
  /** Começo do id do nó (`STJ-TEMA-`): separa as espécies que o banco guarda todas como `precedente`. */
  prefixo?: string;
}

/**
 * Espécies que a pessoa reconhece ("Tema repetitivo do STJ", "IAC", "Repercussão geral"). O banco guarda o STJ inteiro como `precedente`
 * (e o STF decidido também); a espécie sai do começo do id, que é estável (`STJ-TEMA-1076`, `STF-RG-1255`, `STF-ADI-5766`).
 */
export interface Especie {
  id: string;
  /** Texto do filtro, com o tribunal. */
  rotulo: string;
  /** Texto da etiqueta do nó, onde o tribunal já aparece. */
  curto: string;
  tribunal?: 'STF' | 'STJ';
  tipo?: string;
  prefixo?: string;
}

// Só o que o banco tem: Controvérsia, SIRDR e PUIL entram quando houver nó com tese firmada (ids `STJ-CONTROVERSIA-`, `STJ-SIRDR-`, `STJ-PUIL-`).
export const ESPECIES: readonly Especie[] = [
  { id: 'tema-stj', rotulo: 'Tema repetitivo (STJ)', curto: 'Tema repetitivo', tribunal: 'STJ', prefixo: 'STJ-TEMA-' },
  { id: 'iac-stj', rotulo: 'IAC (STJ)', curto: 'IAC', tribunal: 'STJ', prefixo: 'STJ-IAC-' },
  { id: 'rg-stf', rotulo: 'Repercussão geral (STF)', curto: 'Repercussão geral', tribunal: 'STF', prefixo: 'STF-RG-' },
  { id: 'controle-stf', rotulo: 'Controle concentrado (STF)', curto: 'Controle concentrado', tribunal: 'STF', prefixo: 'STF-AD' },
  { id: 'sumula', rotulo: 'Súmula', curto: 'Súmula', tipo: 'sumula' },
  { id: 'dispositivo', rotulo: 'Dispositivo de lei', curto: 'Dispositivo', tipo: 'dispositivo' }
];

/** As espécies que cabem no tribunal escolhido (sem tribunal, todas; o dispositivo de lei não tem tribunal). */
export function especiesDoTribunal(tribunal: string): readonly Especie[] {
  if (!tribunal) return ESPECIES;
  return ESPECIES.filter(e => (e.tribunal ? e.tribunal === tribunal : e.id !== 'dispositivo'));
}

/** A espécie do nó, pelo começo do id ou, na falta, pelo tipo; `null` quando nenhuma conhece o nó. */
export function especieDoNo(n: Pick<NoTese, 'id' | 'tipo'>): Especie | null {
  return ESPECIES.find(e => (e.prefixo ? n.id.startsWith(e.prefixo) : e.tipo === n.tipo)) ?? null;
}

/**
 * Pesquisa no banco (`tesemap_buscar`, migração 20261022000005): todas as palavras, em qualquer ordem, sem acento nem maiúscula; sem texto,
 * lista tudo. Os mais recentemente julgados primeiro quando a relevância empata.
 */
export async function buscarNos(db: SupabaseClient, f: FiltroDeNos): Promise<NoTese[]> {
  // `prefixo` só vai quando há filtro por espécie: sem ele a chamada é a de sempre e não depende da migração 20261026000001
  const r = await db.rpc('tesemap_buscar', {
    consulta: textoDaPesquisa(f.texto),
    tribunal: f.tribunal || null,
    tipo: f.tipo || null,
    limite: LIMITE_DA_LISTA,
    ...(f.prefixo ? { prefixo: f.prefixo } : {})
  });
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
  return [julgado ? `${n.tipo === 'sumula' ? 'aprovada' : 'julgado'} em ${dataCurta(julgado)}` : null, orgao].filter(Boolean).join(' · ');
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
    // Dispositivo de lei (grafo mínimo, F4-05) não tem tribunal: diz de onde vem em vez de "sem tribunal informado"
    .map(c => `${c.total.toLocaleString('pt-BR')} ${(PLURAL[c.tipo] ?? [c.tipo, c.tipo])[c.total === 1 ? 0 : 1]} ${c.tribunal ? `do ${c.tribunal}` : c.tipo === 'dispositivo' ? 'de lei' : 'sem tribunal informado'}`)
    .join(', ');
}

export interface NoLigado {
  id: string;
  rotulo: string;
  tribunal: string | null;
}

const soNumeros = (bruto: unknown): string[] =>
  Array.isArray(bruto) ? [...new Set(bruto.map(r => (r && typeof r === 'object' ? (r as { numero?: unknown }).numero : null)).filter((x): x is string => typeof x === 'string' && /^\d+$/.test(x)))] : [];

/** Números dos temas de repercussão geral do STF que um nó do STJ liga (`detalhes.repercussaoGeral`), ignorando o que não for número. */
export function numerosDeRepercussaoGeral(n: NoTese): string[] {
  return soNumeros(n.detalhes.repercussaoGeral);
}

/**
 * Ids dos nós que o próprio nó diz estarem ligados a ele: o tema de repercussão geral que o STJ registra (`repercussaoGeral`), o tema e as súmulas que
 * a observação de uma súmula do STF cita (`temasRg`, `sumulasCorrelatas`), a súmula do STJ que um tema repetitivo originou ou cita (`sumulaOriginada`,
 * `referenciaSumular`, números) e o tema repetitivo ligado a uma súmula do STJ (`temasStj`). Ignora o que não tiver o formato esperado.
 */
export function idsLigadosPeloProprioNo(n: NoTese): string[] {
  const temas = [...soNumeros(n.detalhes.repercussaoGeral), ...soNumeros(n.detalhes.temasRg)].map(x => `STF-RG-${x}`);
  const sumulas = Array.isArray(n.detalhes.sumulasCorrelatas)
    ? n.detalhes.sumulasCorrelatas.map(r => (r && typeof r === 'object' ? (r as { id?: unknown }).id : null)).filter((x): x is string => typeof x === 'string' && /^STF-(SV|SUMULA)-\d+$/.test(x))
    : [];
  const sumulasStj = n.tribunal === 'STJ' && n.tipo === 'precedente'
    ? [n.detalhes.sumulaOriginada, n.detalhes.referenciaSumular].flatMap(r => (typeof r === 'string' ? (r.match(/\d+/g) ?? []) : [])).map(x => `STJ-SUMULA-${Number(x)}`)
    : [];
  const temasStj = soNumeros(n.detalhes.temasStj).map(x => `STJ-TEMA-${x}`);
  return [...new Set([...temas, ...sumulas, ...sumulasStj, ...temasStj])];
}

/**
 * Ligações que as próprias fontes registram: o STJ liga um precedente seu a um tema de repercussão geral do STF ou a uma súmula sua; a observação de uma
 * súmula do STF cita outra súmula ou um tema. Vale nos dois sentidos (quem é citado também mostra quem o cita). NÃO são relações validadas do mapa: a tela as mostra à
 * parte, dizendo de onde vêm. Só aparecem os nós que existem no grafo.
 */
export async function ligadosPelasFontes(db: SupabaseClient, n: NoTese): Promise<NoLigado[]> {
  const colunas = 'id, rotulo, tribunal';
  const consultas: Array<PromiseLike<{ data: unknown; error: { message: string } | null }>> = [];
  const ids = idsLigadosPeloProprioNo(n);
  if (ids.length > 0) consultas.push(db.from('tesemap_nos').select(colunas).in('id', ids));
  const tema = n.id.match(/^STF-RG-(\d+)$/);
  if (tema) {
    consultas.push(db.from('tesemap_nos').select(colunas).contains('detalhes', { repercussaoGeral: [{ numero: tema[1] }] }).limit(50));
    consultas.push(db.from('tesemap_nos').select(colunas).contains('detalhes', { temasRg: [{ numero: tema[1] }] }).limit(50));
  }
  if (n.tipo === 'sumula') consultas.push(db.from('tesemap_nos').select(colunas).contains('detalhes', { sumulasCorrelatas: [{ id: n.id }] }).limit(50));
  const respostas = await Promise.all(consultas);
  const erro = respostas.find(r => r.error)?.error;
  if (erro) falhou(erro, 'ler as ligações registradas pelas fontes');
  const porId = new Map<string, NoLigado>();
  for (const r of respostas) for (const l of (r.data ?? []) as NoLigado[]) if (l.id !== n.id) porId.set(l.id, l);
  return [...porId.values()].sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR', { numeric: true }));
}

export interface AplicacaoDoNo {
  total: number;
  /** [ano, decisões], do mais antigo ao mais recente. */
  porAno: Array<[string, number]>;
  de: string;
  ate: string;
  anosPossivelmenteIncompletos: string[];
}

/** Contagem de devoluções à origem que citam o tema (`detalhes.aplicacao`, de `pnpm agregar:stf`), ou nulo se o nó não a tem ou ela vier torta. */
export function aplicacaoDoNo(n: NoTese): AplicacaoDoNo | null {
  const a = n.detalhes.aplicacao as { total?: unknown; porAno?: unknown; de?: unknown; ate?: unknown; anosPossivelmenteIncompletos?: unknown } | undefined;
  if (!a || typeof a.total !== 'number' || typeof a.de !== 'string' || typeof a.ate !== 'string' || !a.porAno || typeof a.porAno !== 'object') return null;
  const porAno = Object.entries(a.porAno as Record<string, unknown>)
    .filter((e): e is [string, number] => typeof e[1] === 'number')
    .sort(([x], [y]) => x.localeCompare(y));
  const incompletos = Array.isArray(a.anosPossivelmenteIncompletos) ? a.anosPossivelmenteIncompletos.filter((x): x is string => typeof x === 'string') : [];
  return { total: a.total, porAno, de: a.de, ate: a.ate, anosPossivelmenteIncompletos: incompletos };
}

/** "8.890 decisões entre 2020 e 2026" / "nenhuma decisão registrada entre 2020 e 2026". */
export function textoDoTotalDeAplicacao(a: AplicacaoDoNo): string {
  const periodo = `entre ${a.de.slice(0, 4)} e ${a.ate.slice(0, 4)}`;
  if (a.total === 0) return `nenhuma decisão registrada ${periodo}`;
  return `${a.total.toLocaleString('pt-BR')} ${a.total === 1 ? 'decisão' : 'decisões'} ${periodo}`;
}
