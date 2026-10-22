/**
 * Súmulas do STJ no repositório (F4-01): `corpus/stj/sumulas.pdf.gz` (o PDF que o responsável imprimiu da pesquisa de súmulas do SCON),
 * `corpus/stj/sumulas.txt.gz` (o texto extraído dele por `pdftotext -layout`, que é o que se lê) e `corpus/stj/sumulas-manifesto.json`, com o
 * SHA-256 dos dois. Os arquivos só mudam por `pnpm importar:stj-sumulas`.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { join } from 'node:path';
import { lerSumulasStj, type SumulaStj } from './sumulas';

export const PASTA_STJ = join(__dirname, '..', '..', 'corpus', 'stj');

export interface ManifestoSumulasStj {
  fonte: string;
  /** Página do STJ de onde a lista foi impressa. */
  paginaUrl: string;
  obtidoPor: string;
  /** Data em que o arquivo entrou no repositório (a impressão do SCON não traz data de atualização). */
  lidoEm: string;
  pdf: { nomeOriginal: string; bytes: number; sha256: string; arquivo: string };
  texto: { arquivo: string; bytes: number; sha256: string; extraidoCom: string };
  /** Conferência do que foi lido: total, maior número e contagem por situação. */
  conferencia: { total: number; maiorNumero: number; porSituacao: Record<string, number> };
}

export function manifestoSumulasStj(): ManifestoSumulasStj {
  return JSON.parse(readFileSync(join(PASTA_STJ, 'sumulas-manifesto.json'), 'utf-8'));
}

/** Lê o texto do disco, confere o SHA-256 contra o manifesto e devolve as súmulas. */
export function carregarSumulasStj(m: ManifestoSumulasStj = manifestoSumulasStj()): SumulaStj[] {
  const bytes = gunzipSync(readFileSync(join(PASTA_STJ, m.texto.arquivo)));
  if (createHash('sha256').update(bytes).digest('hex') !== m.texto.sha256) throw new Error('súmulas do STJ: SHA-256 do texto não confere com o manifesto (arquivo alterado à mão?)');
  return lerSumulasStj(bytes.toString('utf-8'));
}
