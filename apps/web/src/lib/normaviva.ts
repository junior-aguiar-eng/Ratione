/**
 * Dados do NormaViva (F3-05, interface): leitura das tabelas públicas `normas`, `dispositivos`, `versoes_dispositivo` e `relacoes`
 * com a chave publicável do Supabase. A leitura é pública por RLS; nada aqui escreve.
 * O texto vem do Planalto e vale só como apoio: cada tela mostra a fonte e a data de leitura (o hash fica no banco, sem aparecer ao usuário).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { interpretarConsulta } from '@ratione/normaviva/consulta';

export interface Norma {
  id: string;
  nome: string;
  fonte_url: string;
  fonte_tipo_pagina: 'compilada' | 'anotada';
  fonte_sha256: string;
  lido_em: string;
  publicacao: string | null;
}

export interface Dispositivo {
  id: string;
  norma_id: string;
  escopo: string;
  rotulo: string;
  tipo: string;
  numero: string;
  ordem: number;
  texto: string;
  continuacao: string;
  revogado: boolean;
  estrutura: string[];
}

export interface Versao {
  texto: string;
  origem: 'redacao_original' | 'redacao_dada' | 'incluido' | 'revogado' | 'vetado';
  ato_chave: string | null;
  ato_rotulo: string | null;
  ato_publicacao: string | null;
  ano_do_ato: number | null;
  fonte_da_data: string | null;
  vigente_de: string | null;
  vigencia_confirmada: boolean;
  texto_anterior_disponivel: boolean;
  hash: string;
  /** Fim da redação (véspera da publicação do ato seguinte); nulo na redação vigente. Ausente antes da migração das redações anteriores. */
  vigente_ate?: string | null;
  /** `compilado`: texto vigente da página compilada; `tachado_planalto`: redação anterior lida do tachado da página anotada. */
  fonte_do_texto?: 'compilado' | 'tachado_planalto';
  /** Quem conferiu a redação anterior no Diário Oficial e quando; nulos enquanto não conferida. */
  conferida_por?: string | null;
  conferida_em?: string | null;
}

export interface Relacao {
  id: number;
  origem_id: string;
  tipo: 'remete' | 'alterado_por' | 'incluido_por' | 'revogado_por';
  destino_id: string | null;
  destino_norma_id: string | null;
  destino_rotulo: string | null;
  destino_ato: string | null;
  destino_texto: string | null;
  trecho: string | null;
  escopo: 'mesma' | 'explicito' | 'presumido' | 'externo' | null;
}

export interface Resultado {
  id: string;
  norma_id: string;
  rotulo: string;
  /** Trecho com os termos achados entre `<b>` e `</b>` (só estas tags; ver `segmentosDoTrecho`). */
  trecho: string;
}

export type ResultadoDaBusca =
  | { tipo: 'vazio' }
  | { tipo: 'resultados'; origem: 'citacao' | 'norma' | 'assunto'; itens: Resultado[]; aviso?: string };

const COLUNAS_DISPOSITIVO = 'id, norma_id, escopo, rotulo, tipo, numero, ordem, texto, continuacao, revogado, estrutura';
const resumo = (t: string) => (t.length > 160 ? `${t.slice(0, 157)}…` : t);

function falhou(erro: { message: string } | null, quando: string): never {
  throw new Error(`${quando}: ${erro?.message ?? 'erro desconhecido'}`);
}

export async function listarNormas(db: SupabaseClient): Promise<Norma[]> {
  const r = await db.from('normas').select('id, nome, fonte_url, fonte_tipo_pagina, fonte_sha256, lido_em, publicacao').order('nome');
  if (r.error) falhou(r.error, 'listar normas');
  return r.data as Norma[];
}

/** Barra de pesquisa: citação (`art. 489 CPC`), norma (`CPC`, `Lei 14.133`) ou assunto (busca textual em português). */
export async function pesquisar(db: SupabaseClient, consulta: string, normas: Norma[]): Promise<ResultadoDaBusca> {
  const q = consulta.trim();
  if (q.length < 2) return { tipo: 'vazio' };
  const interpretada = interpretarConsulta(q, normas.map(n => n.id));

  if (interpretada.tipo === 'dispositivo') {
    let req = db.from('dispositivos').select('id, norma_id, rotulo, texto').eq('escopo', 'corpo').eq('rotulo', `art. ${interpretada.artigo}`);
    if (interpretada.normaId) req = req.eq('norma_id', interpretada.normaId);
    const r = await req.limit(30);
    if (r.error) falhou(r.error, 'buscar artigo');
    const itens = (r.data ?? []).map(d => ({ id: d.id, norma_id: d.norma_id, rotulo: d.rotulo, trecho: resumo(d.texto) }));
    if (itens.length > 0) {
      // "art. 85, § 2º do CPC": abre direto o dispositivo detalhado, se ele existir
      if (interpretada.detalhe && interpretada.normaId) {
        const rotuloFundo = `art. ${interpretada.artigo}, ${interpretada.detalhe.replace(/\s+/g, ' ')}`;
        const fundo = await db.from('dispositivos').select('id, norma_id, rotulo, texto').eq('norma_id', interpretada.normaId).eq('escopo', 'corpo').eq('rotulo', rotuloFundo).limit(1);
        if (!fundo.error && fundo.data?.length) {
          const d = fundo.data[0];
          return { tipo: 'resultados', origem: 'citacao', itens: [{ id: d.id, norma_id: d.norma_id, rotulo: d.rotulo, trecho: resumo(d.texto) }, ...itens] };
        }
        return { tipo: 'resultados', origem: 'citacao', itens, aviso: `Não achei "${rotuloFundo}"; mostrando o artigo inteiro.` };
      }
      return { tipo: 'resultados', origem: 'citacao', itens };
    }
    return { tipo: 'resultados', origem: 'citacao', itens: [], aviso: `Não achei o art. ${interpretada.artigo}${interpretada.normaId ? ' nessa norma' : ' nas normas da base'}.` };
  }

  if (interpretada.tipo === 'norma') {
    const r = await db.from('dispositivos').select('id, norma_id, rotulo, texto').eq('norma_id', interpretada.normaId).eq('escopo', 'corpo').eq('tipo', 'artigo').order('ordem').limit(40);
    if (r.error) falhou(r.error, 'listar artigos da norma');
    return {
      tipo: 'resultados',
      origem: 'norma',
      itens: (r.data ?? []).map(d => ({ id: d.id, norma_id: d.norma_id, rotulo: d.rotulo, trecho: resumo(d.texto) })),
      aviso: 'Mostrando os primeiros artigos. Digite o artigo (ex.: art. 85) ou um assunto para chegar ao que procura.'
    };
  }

  const r = await db.rpc('buscar_dispositivos', { consulta: q, norma: null, limite: 30 });
  if (r.error) falhou(r.error, 'buscar por assunto');
  return { tipo: 'resultados', origem: 'assunto', itens: (r.data ?? []) as Resultado[] };
}

export interface Detalhe {
  dispositivo: Dispositivo;
  /** O próprio dispositivo e tudo o que está abaixo dele (parágrafos, incisos, alíneas), na ordem do texto. */
  texto: Dispositivo[];
  norma: Norma;
  /** A redação vigente (a que não tem fim). */
  versao: Versao | null;
  /** Todas as redações conhecidas do dispositivo, da mais recente para a mais antiga (a vigente primeiro). */
  versoes: Versao[];
  /** Alterações e remissões que partem deste dispositivo e dos que estão abaixo dele. */
  relacoes: Relacao[];
  /** Dispositivos que citam este artigo. */
  citadoPor: Array<{ origem_id: string; rotulo: string; norma_id: string }>;
  /** Rótulos dos destinos já resolvidos (para mostrar "art. 311" em vez do id). */
  rotulosDestino: Record<string, { rotulo: string; norma_id: string }>;
}

const COLUNAS_VERSAO_BASE =
  'texto, origem, ato_chave, ato_rotulo, ato_publicacao, ano_do_ato, fonte_da_data, vigente_de, vigencia_confirmada, texto_anterior_disponivel, hash';
const COLUNAS_VERSAO = `${COLUNAS_VERSAO_BASE}, vigente_ate, fonte_do_texto, conferida_por, conferida_em`;

/** A vigente (sem fim) primeiro; as anteriores da mais recente para a mais antiga. */
export function ordenarVersoes(versoes: Versao[]): Versao[] {
  return [...versoes].sort((a, b) => {
    if (!a.vigente_ate !== !b.vigente_ate) return a.vigente_ate ? 1 : -1;
    return (b.vigente_ate ?? '').localeCompare(a.vigente_ate ?? '');
  });
}

/**
 * Todas as redações do dispositivo. Se o banco ainda não tem as colunas das redações anteriores (migração 20261021000001 por aplicar), a leitura cai para
 * a consulta antiga, que traz só a vigente: a página nunca fica fora do ar por causa da ordem entre migração e publicação.
 */
export async function lerVersoes(db: SupabaseClient, id: string): Promise<Versao[]> {
  const nova = await db.from('versoes_dispositivo').select(COLUNAS_VERSAO).eq('dispositivo_id', id);
  if (!nova.error) return ordenarVersoes((nova.data ?? []) as unknown as Versao[]);
  if (nova.error.code !== '42703') falhou(nova.error, 'ler a versão');
  const antiga = await db.from('versoes_dispositivo').select(COLUNAS_VERSAO_BASE).eq('dispositivo_id', id).limit(1);
  if (antiga.error) falhou(antiga.error, 'ler a versão');
  return ordenarVersoes((antiga.data ?? []) as unknown as Versao[]);
}

export async function carregarDetalhe(db: SupabaseClient, id: string, normas: Norma[]): Promise<Detalhe> {
  const base = await db.from('dispositivos').select(COLUNAS_DISPOSITIVO).eq('id', id).single();
  if (base.error) falhou(base.error, 'abrir dispositivo');
  const dispositivo = base.data as Dispositivo;

  // O artigo e o que vem abaixo dele: do próprio até o próximo artigo (ou do próprio até o próximo do mesmo nível)
  const abaixo = await db.from('dispositivos').select(COLUNAS_DISPOSITIVO).eq('norma_id', dispositivo.norma_id).eq('escopo', dispositivo.escopo).gte('ordem', dispositivo.ordem).order('ordem').limit(400);
  if (abaixo.error) falhou(abaixo.error, 'ler o texto do dispositivo');
  const texto: Dispositivo[] = [];
  for (const d of abaixo.data as Dispositivo[]) {
    if (d.ordem > dispositivo.ordem && (d.tipo === 'artigo' || d.rotulo.split(', ').length <= dispositivo.rotulo.split(', ').length)) break;
    texto.push(d);
  }

  const norma = normas.find(n => n.id === dispositivo.norma_id);
  if (!norma) throw new Error(`norma ${dispositivo.norma_id} não encontrada`);

  const ids = texto.map(t => t.id);
  const [versoes, rel, citado] = await Promise.all([
    lerVersoes(db, id),
    db.from('relacoes').select('id, origem_id, tipo, destino_id, destino_norma_id, destino_rotulo, destino_ato, destino_texto, trecho, escopo').in('origem_id', ids).order('id').limit(300),
    db.from('relacoes').select('origem_id').eq('tipo', 'remete').eq('destino_id', id).limit(40)
  ]);
  if (rel.error) falhou(rel.error, 'ler as relações');
  if (citado.error) falhou(citado.error, 'ler quem cita');

  const origensCitantes = [...new Set((citado.data ?? []).map(c => c.origem_id as string))];
  const destinosIds = [...new Set(((rel.data ?? []) as Relacao[]).map(r => r.destino_id).filter((x): x is string => !!x))];
  const buscar = [...new Set([...origensCitantes, ...destinosIds])];
  const rotulos: Record<string, { rotulo: string; norma_id: string }> = {};
  if (buscar.length > 0) {
    const r = await db.from('dispositivos').select('id, rotulo, norma_id').in('id', buscar);
    if (r.error) falhou(r.error, 'ler rótulos');
    for (const d of r.data ?? []) rotulos[d.id as string] = { rotulo: d.rotulo as string, norma_id: d.norma_id as string };
  }

  return {
    dispositivo,
    texto,
    norma,
    versao: versoes.find(x => !x.vigente_ate) ?? versoes[0] ?? null,
    versoes,
    relacoes: (rel.data ?? []) as Relacao[],
    citadoPor: origensCitantes.map(o => ({ origem_id: o, rotulo: rotulos[o]?.rotulo ?? o, norma_id: rotulos[o]?.norma_id ?? '' })),
    rotulosDestino: rotulos
  };
}
