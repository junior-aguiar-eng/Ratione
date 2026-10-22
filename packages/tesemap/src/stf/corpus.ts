/**
 * Corpus do STF no repositório (F4-02): `corpus/stf/` guarda os bytes originais em gzip e o manifesto. O arquivo vem do portal da Transparência do
 * STF, baixado pelo responsável (o portal bloqueia o acesso automático), e entra por `pnpm importar:stf`.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { join } from 'node:path';
import { lerTemasRg, type TemaRgStf } from './repercussao';

const PASTA = join(__dirname, '..', '..', 'corpus', 'stf');

export interface ArquivoStf {
  nome: 'repercussao-geral';
  /** Como o arquivo se chamava no computador de quem o baixou. */
  nomeOriginal: string;
  descricao: string;
  bytes: number;
  sha256: string;
  arquivo: string;
}

export interface ManifestoStf {
  fonte: string;
  paginaUrl: string;
  /** Data em que o arquivo entrou no repositório; o CSV não traz a data de atualização do STF. */
  lidoEm: string;
  obtidoPor: string;
  arquivos: ArquivoStf[];
}

export function manifestoStf(): ManifestoStf {
  return JSON.parse(readFileSync(join(PASTA, 'manifesto.json'), 'utf-8'));
}

export function carregarTemasRgStf(): TemaRgStf[] {
  const m = manifestoStf();
  const a = m.arquivos.find(x => x.nome === 'repercussao-geral');
  if (!a) throw new Error('manifesto do STF sem o arquivo de repercussão geral');
  const bytes = gunzipSync(readFileSync(join(PASTA, a.arquivo)));
  if (createHash('sha256').update(bytes).digest('hex') !== a.sha256) throw new Error('repercussao-geral: SHA-256 não confere com o manifesto (arquivo alterado à mão?)');
  return lerTemasRg(bytes.toString('utf-8'));
}
