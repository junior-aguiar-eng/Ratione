/**
 * Coletor do Planalto (F3-01). Uso, a partir de `packages/normaviva`:
 *
 *   pnpm coletar                 # coleta todas as normas de `normas.ts`
 *   pnpm coletar LEI-12016-2009  # coleta só as normas indicadas
 *
 * Grava o HTML original (bytes intactos, gzip) em `corpus/planalto/<id>.html.gz` e o `corpus/planalto/manifesto.json`
 * com URL, data de leitura, charset, tamanho e SHA-256 dos bytes originais. Não interpreta o texto: o parser é a F3-02.
 * Resposta que não é HTML de lei (erro, redirecionamento para fora do Planalto, página vazia) é recusada, não gravada.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';
import { BASE_PLANALTO, NORMAS_PLANALTO, type NormaPlanalto } from './normas';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const PASTA = join(__dirname, '..', '..', 'corpus', 'planalto');
const MANIFESTO = join(PASTA, 'manifesto.json');

export interface EntradaManifesto {
  id: string;
  nome: string;
  url: string;
  /** `compilada` quando a URL é do texto compilado/consolidado; `anotada` quando é a página com texto tachado (vale o não tachado). */
  tipoPagina: 'compilada' | 'anotada';
  titulo: string;
  charset: string;
  bytes: number;
  sha256: string;
  lidoEm: string;
  arquivo: string;
}

export function tipoDaPagina(caminho: string): EntradaManifesto['tipoPagina'] {
  return /compilad[ao]|cons\.htm|constituicao\.htm$/i.test(caminho) ? 'compilada' : 'anotada';
}

/** Charset do cabeçalho, depois da tag meta; sem declaração, UTF-8 estrito e, se falhar, windows-1252 (padrão do Planalto). */
export function detectarCharset(bytes: Buffer, contentType: string | null): { charset: string; texto: string } {
  // BOM primeiro: o Planalto serve algumas páginas (ex.: Lei 11.340/2006) em UTF-16 com BOM, sem declarar charset útil
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return { charset: 'utf-16le', texto: new TextDecoder('utf-16le').decode(bytes.subarray(2)) };
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return { charset: 'utf-16be', texto: new TextDecoder('utf-16be').decode(bytes.subarray(2)) };
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) return { charset: 'utf-8', texto: new TextDecoder('utf-8').decode(bytes.subarray(3)) };
  const doCabecalho = contentType?.match(/charset=([\w-]+)/i)?.[1];
  const doMeta = bytes.subarray(0, 4096).toString('latin1').match(/<meta[^>]+charset=["']?([\w-]+)/i)?.[1];
  const declarado = (doCabecalho ?? doMeta)?.toLowerCase();
  if (declarado) {
    const nome = declarado === 'iso-8859-1' || declarado === 'latin1' ? 'windows-1252' : declarado;
    return { charset: nome, texto: new TextDecoder(nome).decode(bytes) };
  }
  try {
    return { charset: 'utf-8', texto: new TextDecoder('utf-8', { fatal: true }).decode(bytes) };
  } catch {
    return { charset: 'windows-1252', texto: new TextDecoder('windows-1252').decode(bytes) };
  }
}

async function baixar(url: string): Promise<{ bytes: Buffer; contentType: string | null; urlFinal: string }> {
  let ultimo = 'erro desconhecido';
  for (let tentativa = 1; tentativa <= 2; tentativa++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(30_000) });
      if (!r.ok) {
        ultimo = `HTTP ${r.status}`;
        continue;
      }
      return { bytes: Buffer.from(await r.arrayBuffer()), contentType: r.headers.get('content-type'), urlFinal: r.url };
    } catch (e) {
      const err = e as Error & { cause?: { code?: string } };
      ultimo = err.cause?.code ?? err.message;
    }
  }
  throw new Error(`${url}: ${ultimo} (2 tentativas)`);
}

export async function coletarNorma(n: NormaPlanalto): Promise<EntradaManifesto> {
  const url = BASE_PLANALTO + n.caminho;
  const { bytes, contentType, urlFinal } = await baixar(url);
  if (!new URL(urlFinal).hostname.endsWith('planalto.gov.br')) throw new Error(`${n.id}: redirecionou para fora do Planalto (${urlFinal})`);
  const { charset, texto } = detectarCharset(bytes, contentType);
  const titulo = (texto.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').replace(/\s+/g, ' ').trim();
  if (bytes.length < 5_000 || !/art\.?\s*1/i.test(texto)) throw new Error(`${n.id}: resposta não parece o texto de uma lei (${bytes.length} bytes)`);
  const arquivo = `${n.id}.html.gz`;
  writeFileSync(join(PASTA, arquivo), gzipSync(bytes, { level: 9 }));
  return {
    id: n.id,
    nome: n.nome,
    url: urlFinal,
    tipoPagina: tipoDaPagina(n.caminho),
    titulo,
    charset,
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    lidoEm: new Date().toISOString().slice(0, 10),
    arquivo
  };
}

async function main() {
  mkdirSync(PASTA, { recursive: true });
  const pedidos = process.argv.slice(2);
  const alvo = pedidos.length ? NORMAS_PLANALTO.filter(n => pedidos.includes(n.id)) : NORMAS_PLANALTO;
  if (pedidos.length && alvo.length !== pedidos.length) throw new Error(`Norma fora da lista: ${pedidos.filter(p => !alvo.some(n => n.id === p)).join(', ')}`);
  const manifesto: EntradaManifesto[] = existsSync(MANIFESTO) ? JSON.parse(readFileSync(MANIFESTO, 'utf-8')) : [];
  const falhas: string[] = [];
  for (const n of alvo) {
    try {
      const e = await coletarNorma(n);
      const i = manifesto.findIndex(m => m.id === e.id);
      if (i >= 0) manifesto[i] = e;
      else manifesto.push(e);
      console.log(`ok   ${e.id}  ${e.tipoPagina}  ${e.charset}  ${(e.bytes / 1024).toFixed(0)} KB  ${e.titulo.slice(0, 70)}`);
    } catch (err) {
      falhas.push((err as Error).message);
      console.log(`ERRO ${n.id}: ${(err as Error).message}`);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  manifesto.sort((a, b) => a.id.localeCompare(b.id));
  writeFileSync(MANIFESTO, JSON.stringify(manifesto, null, 2) + '\n', 'utf-8');
  if (falhas.length) process.exitCode = 1;
}

if (require.main === module) void main();
