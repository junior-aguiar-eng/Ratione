/**
 * Vigência futura (F3-06). A partir de `packages/normaviva`:
 *
 *   pnpm vigencia     # procura leis já publicadas que alteram o corpus mas só valem depois; grava `vigencia-futura.json`
 *
 * Por que existe: o Planalto só consolida o texto na data de vigência, e o feed do Senado não alerta (o Senado já registra a alteração). Sem isto,
 * o dispositivo aparece com a redação de hoje sem dizer que muda. Para cada lei ou lei complementar do ano corrente e do anterior cuja ementa cita
 * uma norma do corpus, ainda não examinada: (1) o detalhe do ato no Senado dá os artigos que ele altera em cada norma (`edivs`); (2) o texto do ato
 * no Planalto dá a cláusula de vigência. Vigência já passada ou na publicação: examinada e esquecida. Vigência futura ou que a leitura não entende
 * (`complexa`): vira aviso, que a tela mostra no artigo. Aviso cuja data chegou, ou cujo ato o texto do corpus já anota como alteração, sai.
 * Revisor que leu um aviso `complexa` e concluiu que não há o que avisar: apague o aviso do JSON e ponha `"<chave>": "conferido_sem_aviso"` em `examinados`.
 * Código de saída: 0 sem mudança nos avisos, 2 com aviso novo ou removido (para o agendador alertar), 1 em erro de execução.
 * Falha de rede num ato não derruba os outros e não o marca como examinado: ele volta na próxima execução.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { join } from 'node:path';
import { API, USER_AGENT, atosAlteradoresDoPlanalto, chaveDoNomeSenado, dataIsoDoSenado, ehAlteracao, textoSemHtml } from '../coleta/conferir';
import { detectarCharset, type EntradaManifesto } from '../coleta/coletar';
import { chavesDasNormas, normasCitadas, type DocumentoDaLista } from '../atualizacao/feeds';
import { chaveDoArtigo, type AlteracaoNaNorma, type ArquivoVigenciaFutura, type AvisoVigenciaFutura } from './avisos';
import { clausulaDeVigencia, lerVigencia, vigenteEm } from './vigencia';

const PASTA = join(__dirname, '..', '..', 'corpus');
const ARQUIVO = join(__dirname, 'vigencia-futura.json');

/** Tipos da lista do Senado que o Planalto publica com texto próprio e que têm cláusula de vigência a ler. */
export const TIPOS_COM_VIGENCIA = new Set(['LEI-n', 'LCP']);

export interface DetalheDoAto {
  ementa: string;
  publicacao: string | null;
  /** Normas que o ato altera, segundo o Senado, com os dispositivos de cada uma. */
  altera: Array<{ nomeNorma: string; itens: Array<{ dispositivo: string; acao: string }> }>;
}

export interface DependenciasVigencia {
  hoje: () => string;
  normas: () => string[];
  arquivo: () => ArquivoVigenciaFutura;
  textoDaNorma: (normaId: string) => string;
  listaDoAno: (ano: number) => Promise<DocumentoDaLista[]>;
  detalheDoAto: (doc: DocumentoDaLista) => Promise<DetalheDoAto>;
  /** Texto simples do ato no Planalto, com a URL lida. */
  textoDoAto: (doc: DocumentoDaLista) => Promise<{ url: string; texto: string }>;
}

export interface ResultadoVigencia {
  arquivo: ArquivoVigenciaFutura;
  novos: string[];
  removidos: string[];
  erros: string[];
}

const iso = (br: string) => br.split('/').reverse().join('-');

/** `numero` e `ano` de "Lei nº 15.371 de 31/03/2026" vindos da lista (`LEI-15371-2026-03-31`). */
export function numeroEAno(doc: DocumentoDaLista): { numero: string; ano: string } | null {
  const m = doc.norma?.match(/^[A-Z]+-(\d+)-(\d{4})-/);
  if (m) return { numero: m[1], ano: m[2] };
  const n = doc.normaNome.match(/n[ºo°]\s*([\d.]+)\s+de\s+\d{2}\/\d{2}\/(\d{4})/);
  return n ? { numero: n[1].replace(/\./g, ''), ano: n[2] } : null;
}

const PERIODOS: Array<[number, number]> = [[2023, 2026], [2019, 2022], [2015, 2018], [2011, 2014], [2007, 2010], [2004, 2006]];

/** URL do ato no Planalto (lei e lei complementar), ou nulo para ano anterior a 2004, que o corpus de vigência não cobre. */
export function urlPlanaltoDoAto(tipo: string, numero: string, ano: string): string | null {
  if (tipo === 'LCP') return `https://www.planalto.gov.br/ccivil_03/leis/lcp/Lcp${numero}.htm`;
  const p = PERIODOS.find(([a, b]) => Number(ano) >= a && Number(ano) <= b);
  return p ? `https://www.planalto.gov.br/ccivil_03/_ato${p[0]}-${p[1]}/${ano}/lei/L${numero}.htm` : null;
}

function alteracoesDoAto(detalhe: DetalheDoAto, chaves: Map<string, string>): AlteracaoNaNorma[] {
  const saida: AlteracaoNaNorma[] = [];
  for (const a of detalhe.altera) {
    const chave = chaveDoNomeSenado(a.nomeNorma);
    const normaId = chave && chaves.get(chave);
    if (!normaId) continue;
    const artigos: string[] = [];
    for (const it of a.itens) {
      const k = chaveDoArtigo(it.dispositivo);
      if (k && !artigos.includes(k)) artigos.push(k);
    }
    saida.push({ normaId, artigos, dispositivos: a.itens.map(i => ({ dispositivo: i.dispositivo.trim(), acao: i.acao })) });
  }
  return saida;
}

export async function executarVigencia(dep: DependenciasVigencia): Promise<ResultadoVigencia> {
  const hoje = dep.hoje();
  const antes = dep.arquivo();
  const ids = dep.normas();
  const chaves = chavesDasNormas(ids);
  const examinados = { ...antes.examinados };
  const avisos = new Map(antes.avisos.map(a => [a.chave, a]));
  const erros: string[] = [];
  // "Consolidado" é a anotação de alteração ("Redação dada pela Lei...") no texto da norma; citar o ato num "Vide" não conta (o corpus cita a Lei 15.371 assim)
  const anotados = new Map<string, Set<string>>();
  const consolidadoEm = (normaId: string, chave: string) => {
    if (!anotados.has(normaId)) anotados.set(normaId, atosAlteradoresDoPlanalto(dep.textoDaNorma(normaId)));
    return anotados.get(normaId)!.has(chave);
  };

  // 1) Quem já é aviso sai quando a data chegou ou quando o texto do corpus já cita o ato (o Planalto consolidou)
  for (const a of [...avisos.values()]) {
    const consolidado = a.alteracoes.every(x => consolidadoEm(x.normaId, a.chave));
    if ((a.vigenteEm !== null && a.vigenteEm <= hoje) || consolidado) {
      avisos.delete(a.chave);
      examinados[a.chave] = 'em_vigor';
    }
  }

  // 2) Atos do ano corrente e do anterior que o corpus ainda não examinou
  const ano = Number(hoje.slice(0, 4));
  for (const a of [ano - 1, ano]) {
    let lista: DocumentoDaLista[];
    try {
      lista = await dep.listaDoAno(a);
    } catch (e) {
      erros.push(`lista de ${a}: ${(e as Error).message}`);
      continue;
    }
    for (const doc of lista) {
      if (!TIPOS_COM_VIGENCIA.has(doc.tipo)) continue;
      const chave = chaveDoNomeSenado(doc.normaNome);
      if (!chave || chave in examinados || avisos.has(chave)) continue;
      if (normasCitadas(doc.ementa, chaves).length === 0) {
        examinados[chave] = 'nao_cita_o_corpus';
        continue;
      }
      const id = numeroEAno(doc);
      const url = id && urlPlanaltoDoAto(doc.tipo, id.numero, id.ano);
      if (!id || !url) {
        examinados[chave] = 'fora_do_alcance';
        continue;
      }
      try {
        const detalhe = await dep.detalheDoAto(doc);
        const alteracoes = alteracoesDoAto(detalhe, chaves);
        if (alteracoes.length === 0) {
          examinados[chave] = 'nao_altera_o_corpus';
          continue;
        }
        const { url: lida, texto } = await dep.textoDoAto(doc);
        const clausula = clausulaDeVigencia(texto);
        const vigencia = lerVigencia(clausula, texto);
        const publicacao = detalhe.publicacao ?? iso(doc.dataassinatura);
        const em = vigenteEm(vigencia, publicacao);
        if (vigencia.tipo !== 'complexa' && em !== null && em <= hoje) {
          examinados[chave] = 'em_vigor';
          continue;
        }
        avisos.set(chave, { ato: doc.normaNome, chave, publicacao, vigencia, vigenteEm: em, clausula, ementa: doc.ementa, fonte: { url: lida, lidoEm: hoje }, alteracoes });
      } catch (e) {
        erros.push(`${doc.normaNome}: ${(e as Error).message}`);
      }
    }
  }

  const lista = [...avisos.values()].sort((a, b) => (a.vigenteEm ?? '9999').localeCompare(b.vigenteEm ?? '9999') || a.chave.localeCompare(b.chave));
  const novos = lista.filter(a => !antes.avisos.some(b => b.chave === a.chave)).map(a => a.ato);
  const removidos = antes.avisos.filter(a => !avisos.has(a.chave)).map(a => a.ato);
  return { arquivo: { geradoEm: hoje, avisos: lista, examinados }, novos, removidos, erros };
}

async function pedir(url: string, json: boolean): Promise<Response> {
  let ultimo = 'erro desconhecido';
  for (let tentativa = 1; tentativa <= 3; tentativa++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: json ? 'application/json' : 'text/html' }, signal: AbortSignal.timeout(45_000) });
      if (r.ok) return r;
      ultimo = `HTTP ${r.status}`;
    } catch (e) {
      ultimo = (e as Error).message;
    }
    await new Promise(res => setTimeout(res, 3000));
  }
  throw new Error(`${url}: ${ultimo} (3 tentativas)`);
}

const comoLista = <T>(x: T | T[] | undefined | ''): T[] => (x === undefined || x === '' ? [] : Array.isArray(x) ? x : [x]);

async function main() {
  const manifesto: EntradaManifesto[] = JSON.parse(readFileSync(join(PASTA, 'planalto', 'manifesto.json'), 'utf-8'));
  const r = await executarVigencia({
    hoje: () => new Date().toISOString().slice(0, 10),
    normas: () => manifesto.map(m => m.id),
    arquivo: () => JSON.parse(readFileSync(ARQUIVO, 'utf-8')),
    textoDaNorma: id => textoSemHtml(detectarCharset(gunzipSync(readFileSync(join(PASTA, 'planalto', manifesto.find(m => m.id === id)!.arquivo))), null).texto),
    listaDoAno: async ano => {
      const json = (await (await pedir(`${API}lista?ano=${ano}&v=3`, true)).json()) as { ListaDocumento: { documentos: { documento: DocumentoDaLista[] } } };
      return json.ListaDocumento.documentos.documento ?? [];
    },
    detalheDoAto: async doc => {
      const id = numeroEAno(doc)!;
      const tipo = doc.tipo === 'LCP' ? 'lcp' : 'lei';
      const bruto = (await (await pedir(`${API}${tipo}/${id.numero}/${id.ano}`, true)).json()).DetalheDocumento.documentos.documento;
      const d = Array.isArray(bruto) ? bruto[0] : bruto;
      const pubs = comoLista<{ dispositivo?: string; data?: string }>(d.publicacoes?.publicacao);
      const original = pubs.find(p => /Publica[çc][ãa]o Original/i.test(p.dispositivo ?? '')) ?? pubs[0];
      return {
        ementa: d.ementa ?? doc.ementa,
        publicacao: dataIsoDoSenado(original?.data),
        altera: comoLista<{ nomeNormaAnterior: string; comentario: string; itens?: { item?: Array<{ dispositivo: string; comentario: string }> } }>(d.edivs?.ediv)
          .filter(e => ehAlteracao(e.comentario))
          .map(e => ({ nomeNorma: e.nomeNormaAnterior, itens: comoLista(e.itens?.item).map(i => ({ dispositivo: i.dispositivo, acao: i.comentario })) }))
      };
    },
    textoDoAto: async doc => {
      const id = numeroEAno(doc)!;
      const resp = await pedir(urlPlanaltoDoAto(doc.tipo, id.numero, id.ano)!, false);
      if (!new URL(resp.url).hostname.endsWith('planalto.gov.br')) throw new Error(`redirecionou para fora do Planalto (${resp.url})`);
      return { url: resp.url, texto: textoSemHtml(detectarCharset(Buffer.from(await resp.arrayBuffer()), resp.headers.get('content-type')).texto) };
    }
  });
  writeFileSync(ARQUIVO, JSON.stringify(r.arquivo, null, 2) + '\n', 'utf-8');
  for (const a of r.arquivo.avisos) console.log(`${a.vigenteEm ?? 'a conferir'}  ${a.ato}  → ${a.alteracoes.map(x => `${x.normaId} (${x.artigos.length} art.)`).join(', ')}`);
  for (const e of r.erros) console.log(`ERRO ${e}`);
  console.log(`${r.arquivo.avisos.length} aviso(s) (${r.novos.length} novo(s), ${r.removidos.length} removido(s)), ${r.erros.length} erro(s).`);
  if (r.erros.length > 0 && r.arquivo.avisos.length === 0 && Object.keys(r.arquivo.examinados).length === 0) process.exitCode = 1;
  else if (r.novos.length > 0 || r.removidos.length > 0) process.exitCode = 2;
}

if (require.main === module) void main();
