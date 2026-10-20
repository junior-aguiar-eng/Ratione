/**
 * Coleta as páginas anotadas complementares (`PAGINAS_ANOTADAS`) para as normas de teste do F3-07. Uso, a partir de `packages/normaviva`:
 *
 *   pnpm coletar:anotadas                 # todas
 *   pnpm coletar:anotadas LEI-13105-2015  # só as indicadas
 *
 * Grava o HTML original (gzip) em `corpus/planalto/anotadas/<id>.html.gz` e o `manifesto.json` ao lado, com URL, data de leitura, charset e SHA-256.
 * Não toca no corpus principal nem no manifesto dele.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';
import { baixarNorma, type EntradaManifesto } from './coletar';
import { PAGINAS_ANOTADAS } from './normas';

export const PASTA_ANOTADAS = join(__dirname, '..', '..', 'corpus', 'planalto', 'anotadas');

async function main() {
  mkdirSync(PASTA_ANOTADAS, { recursive: true });
  const manifestoPath = join(PASTA_ANOTADAS, 'manifesto.json');
  const pedidos = process.argv.slice(2);
  const alvo = pedidos.length ? PAGINAS_ANOTADAS.filter(n => pedidos.includes(n.id)) : PAGINAS_ANOTADAS;
  if (pedidos.length && alvo.length !== pedidos.length) throw new Error(`Norma fora da lista: ${pedidos.filter(p => !alvo.some(n => n.id === p)).join(', ')}`);
  const manifesto: EntradaManifesto[] = existsSync(manifestoPath) ? JSON.parse(readFileSync(manifestoPath, 'utf-8')) : [];
  const falhas: string[] = [];
  for (const n of alvo) {
    try {
      const { entrada, bytes } = await baixarNorma(n);
      writeFileSync(join(PASTA_ANOTADAS, entrada.arquivo), gzipSync(bytes, { level: 9 }));
      const i = manifesto.findIndex(m => m.id === entrada.id);
      if (i >= 0) manifesto[i] = entrada;
      else manifesto.push(entrada);
      console.log(`ok   ${entrada.id}  ${entrada.charset}  ${(entrada.bytes / 1024).toFixed(0)} KB  ${entrada.url}`);
    } catch (e) {
      falhas.push(`${n.id}: ${(e as Error).message}`);
      console.log(`ERRO ${n.id}: ${(e as Error).message}`);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  manifesto.sort((a, b) => a.id.localeCompare(b.id));
  writeFileSync(manifestoPath, JSON.stringify(manifesto, null, 2) + '\n', 'utf-8');
  if (falhas.length) process.exitCode = 1;
}

if (require.main === module) void main();
