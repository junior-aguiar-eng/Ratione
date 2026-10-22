/**
 * Coletor dos Dados Abertos do STJ (F4-01). A partir de `packages/tesemap`:
 *
 *   pnpm coletar:stj
 *
 * Consulta o catálogo CKAN do portal (`package_show`), baixa `Temas.csv` e `Processos.csv` do conjunto "Precedentes qualificados" e grava os bytes
 * intactos (gzip) em `corpus/stj/` com o `manifesto.json` (conjunto, licença, URL de cada arquivo, data de modificação informada pelo STJ,
 * data de leitura, tamanho e SHA-256). Não interpreta o conteúdo: a leitura é `precedentes.ts`. Resposta que não parece o arquivo esperado
 * (outro host, layout mudado, vazia) é recusada, não gravada.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';
import { USER_AGENT_NAVEGADOR as USER_AGENT } from '@ratione/core';
import { lerPrecedentes } from './precedentes';

const PORTAL = 'https://dadosabertos.web.stj.jus.br';
const CONJUNTO = 'precedentes-qualificados';
const PASTA = join(__dirname, '..', '..', 'corpus', 'stj');

export interface ArquivoStj {
  nome: 'Temas.csv' | 'Processos.csv';
  url: string;
  /** Data de modificação do arquivo informada pelo portal. */
  modificadoEm: string | null;
  bytes: number;
  sha256: string;
  arquivo: string;
}

export interface ManifestoStj {
  conjunto: string;
  titulo: string;
  paginaUrl: string;
  licenca: string;
  conjuntoModificadoEm: string | null;
  lidoEm: string;
  arquivos: ArquivoStj[];
}

async function pedir(url: string): Promise<Response> {
  let ultimo = 'erro desconhecido';
  for (let tentativa = 1; tentativa <= 3; tentativa++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(90_000) });
      if (r.ok) return r;
      ultimo = `HTTP ${r.status}`;
    } catch (e) {
      ultimo = (e as Error).message;
    }
    await new Promise(res => setTimeout(res, 3000));
  }
  throw new Error(`${url}: ${ultimo} (3 tentativas)`);
}

interface RecursoCkan {
  name: string;
  url: string;
  last_modified: string | null;
}

export interface ConjuntoBaixado {
  manifesto: ManifestoStj;
  bytes: Record<ArquivoStj['nome'], Buffer>;
  precedentes: ReturnType<typeof lerPrecedentes>;
}

/** Baixa o conjunto do portal e valida o layout e o conteúdo, sem gravar nada (a verificação periódica usa só isto; `pnpm coletar:stj` grava). */
export async function baixarConjunto(): Promise<ConjuntoBaixado> {
  const meta = (await (await pedir(`${PORTAL}/api/3/action/package_show?id=${CONJUNTO}`)).json()) as {
    result: { title: string; license_title: string; metadata_modified: string; resources: RecursoCkan[] };
  };
  const recursos = meta.result.resources;
  const bytes: Record<string, Buffer> = {};
  const arquivos: ArquivoStj[] = [];
  for (const nome of ['Temas.csv', 'Processos.csv'] as const) {
    const rec = recursos.find(r => r.name.toLowerCase() === nome.toLowerCase());
    if (!rec) throw new Error(`o conjunto ${CONJUNTO} não tem mais o recurso ${nome}`);
    if (new URL(rec.url).hostname !== new URL(PORTAL).hostname) throw new Error(`${nome}: URL fora do portal do STJ (${rec.url})`);
    const b = Buffer.from(await (await pedir(rec.url)).arrayBuffer());
    if (b.length < 50_000) throw new Error(`${nome}: ${b.length} bytes, pequeno demais para o arquivo esperado`);
    bytes[nome] = b;
    arquivos.push({
      nome,
      url: rec.url,
      modificadoEm: rec.last_modified?.slice(0, 10) ?? null,
      bytes: b.length,
      sha256: createHash('sha256').update(b).digest('hex'),
      arquivo: `${nome.toLowerCase()}.gz`
    });
  }
  // Valida o layout e o conteúdo antes de qualquer gravação
  const precedentes = lerPrecedentes(bytes['Temas.csv'].toString('utf-8'), bytes['Processos.csv'].toString('utf-8'));
  const manifesto: ManifestoStj = {
    conjunto: CONJUNTO,
    titulo: meta.result.title,
    paginaUrl: `${PORTAL}/dataset/${CONJUNTO}`,
    licenca: meta.result.license_title,
    conjuntoModificadoEm: meta.result.metadata_modified?.slice(0, 10) ?? null,
    lidoEm: new Date().toISOString().slice(0, 10),
    arquivos
  };
  return { manifesto, bytes: bytes as ConjuntoBaixado['bytes'], precedentes };
}

async function main() {
  const { manifesto, bytes, precedentes } = await baixarConjunto();
  const arquivos = manifesto.arquivos;
  mkdirSync(PASTA, { recursive: true });
  for (const a of arquivos) writeFileSync(join(PASTA, a.arquivo), gzipSync(bytes[a.nome], { level: 9 }));
  writeFileSync(join(PASTA, 'manifesto.json'), JSON.stringify(manifesto, null, 2) + '\n', 'utf-8');
  for (const a of arquivos) console.log(`ok   ${a.nome}  ${(a.bytes / 1024).toFixed(0)} KB  modificado em ${a.modificadoEm}  ${a.sha256.slice(0, 12)}`);
  console.log(`${precedentes.length} precedentes lidos (${manifesto.licenca}).`);
}

if (require.main === module) void main();
