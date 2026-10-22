/**
 * Importador das súmulas do STJ (F4-01). A partir de `packages/tesemap`:
 *
 *   pnpm importar:stj-sumulas <PDF da pesquisa de súmulas do SCON>
 *
 * O PDF é a página https://scon.stj.jus.br/SCON/sumstj/ (todas as súmulas) impressa pelo navegador: o SCON bloqueia o acesso automático (403) e o
 * PDF público `docs_internet/VerbetesSTJ.pdf` parou em 22/11/2024. O texto sai do `pdftotext -layout` (Poppler ou Xpdf; vem com o Git para Windows),
 * é validado ANTES de gravar (numeração de 1 até a maior, sem lacuna nem repetição; todo enunciado com órgão e publicação) e entra em `corpus/stj/`
 * com o PDF original, ambos em gzip e com SHA-256 no manifesto.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { basename, join } from 'node:path';
import { lerSumulasStj } from './sumulas';
import { PASTA_STJ, type ManifestoSumulasStj } from './sumulas-corpus';

const sha = (b: Buffer) => createHash('sha256').update(b).digest('hex');

function extrair(pdf: string): { texto: string; versao: string } {
  const r = spawnSync('pdftotext', ['-layout', '-enc', 'UTF-8', pdf, '-'], { encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024 });
  if (r.error && (r.error as NodeJS.ErrnoException).code === 'ENOENT') throw new Error('pdftotext não encontrado: rode no Git Bash (o Git para Windows traz o pdftotext) ou instale o Poppler');
  if (r.error || r.status !== 0) throw new Error(`pdftotext falhou: ${r.error?.message ?? r.stderr}`);
  // A versão sai no stdout ou no stderr, conforme a distribuição
  const v = spawnSync('pdftotext', ['-v'], { encoding: 'utf-8' });
  const versao = `${v.stdout}${v.stderr}`.trim().split(/\r?\n/)[0].trim();
  return { texto: r.stdout, versao: versao || 'pdftotext' };
}

function main() {
  const [pdf] = process.argv.slice(2);
  if (!pdf) throw new Error('Uso: pnpm importar:stj-sumulas <PDF da pesquisa de súmulas do SCON>');
  const bytesPdf = readFileSync(pdf);
  const { texto, versao } = extrair(pdf);
  const sumulas = lerSumulasStj(texto);
  const bytesTexto = Buffer.from(texto, 'utf-8');
  writeFileSync(join(PASTA_STJ, 'sumulas.pdf.gz'), gzipSync(bytesPdf, { level: 9 }));
  writeFileSync(join(PASTA_STJ, 'sumulas.txt.gz'), gzipSync(bytesTexto, { level: 9 }));
  const porSituacao: Record<string, number> = {};
  for (const s of sumulas) porSituacao[s.situacao] = (porSituacao[s.situacao] ?? 0) + 1;
  const manifesto: ManifestoSumulasStj = {
    fonte: 'STJ, pesquisa de súmulas (SCON): todos os enunciados, com órgão julgador, julgamento, publicação e notas de cancelamento ou alteração',
    paginaUrl: 'https://scon.stj.jus.br/SCON/sumstj/',
    obtidoPor: 'página impressa em PDF pelo responsável e enviada ao repositório (o SCON bloqueia o acesso automático)',
    lidoEm: new Date().toISOString().slice(0, 10),
    pdf: { nomeOriginal: basename(pdf), bytes: bytesPdf.length, sha256: sha(bytesPdf), arquivo: 'sumulas.pdf.gz' },
    texto: { arquivo: 'sumulas.txt.gz', bytes: bytesTexto.length, sha256: sha(bytesTexto), extraidoCom: `${versao}, opções -layout -enc UTF-8` },
    conferencia: { total: sumulas.length, maiorNumero: sumulas[sumulas.length - 1].numero, porSituacao }
  };
  writeFileSync(join(PASTA_STJ, 'sumulas-manifesto.json'), JSON.stringify(manifesto, null, 2) + '\n', 'utf-8');
  console.log(`ok   ${sumulas.length} súmulas do STJ (1 a ${manifesto.conferencia.maiorNumero}): ${Object.entries(porSituacao).map(([k, v]) => `${v} ${k}${v === 1 ? '' : 's'}`).join(', ')}; PDF sha256 ${manifesto.pdf.sha256.slice(0, 12)}`);
}

if (require.main === module) {
  try {
    main();
  } catch (e) {
    console.error(String(e instanceof Error ? e.message : e));
    process.exitCode = 1;
  }
}
