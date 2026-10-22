/**
 * Corpus do STF no repositório (F4-02): `corpus/stf/` guarda os bytes originais em gzip e o manifesto. Os arquivos vêm do portal da Transparência e da
 * base de jurisprudência do STF, baixados pelo responsável (o STF bloqueia o acesso automático), e entram por `pnpm importar:stf`.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { join } from 'node:path';
import { lerTemasRg, type TemaRgStf } from './repercussao';
import { lerSumulasStf, type SumulaStf } from './sumulas';
import type { AplicacaoDosTemas } from './aplicacao';

export const PASTA_STF = join(__dirname, '..', '..', 'corpus', 'stf');

export type NomeDoArquivoStf = 'repercussao-geral' | 'sumulas-vinculantes' | 'sumulas';

export interface ArquivoStf {
  nome: NomeDoArquivoStf;
  /** Como o arquivo se chamava no computador de quem o baixou. */
  nomeOriginal: string;
  descricao: string;
  bytes: number;
  sha256: string;
  arquivo: string;
  /** Data em que o arquivo entrou no repositório; os CSV não trazem a data de atualização do STF. */
  lidoEm: string;
  /** Consulta usada na exportação (rodapé "URL de Busca" das súmulas), quando o arquivo a traz. */
  consulta?: string | null;
}

export interface ManifestoStf {
  fonte: string;
  paginaUrl: string;
  /** Data da última entrada de arquivo; cada arquivo traz a sua. */
  lidoEm: string;
  obtidoPor: string;
  arquivos: ArquivoStf[];
}

export function manifestoStf(): ManifestoStf {
  return JSON.parse(readFileSync(join(PASTA_STF, 'manifesto.json'), 'utf-8'));
}

export function arquivoDoManifesto(m: ManifestoStf, nome: NomeDoArquivoStf): ArquivoStf {
  const a = m.arquivos.find(x => x.nome === nome);
  if (!a) throw new Error(`manifesto do STF sem o arquivo ${nome}`);
  return a;
}

/** Lê o arquivo do disco e confere o SHA-256 contra o manifesto. */
function textoDoArquivo(m: ManifestoStf, nome: NomeDoArquivoStf): string {
  const a = arquivoDoManifesto(m, nome);
  const bytes = gunzipSync(readFileSync(join(PASTA_STF, a.arquivo)));
  if (createHash('sha256').update(bytes).digest('hex') !== a.sha256) throw new Error(`${nome}: SHA-256 não confere com o manifesto (arquivo alterado à mão?)`);
  return bytes.toString('utf-8');
}

export function carregarTemasRgStf(): TemaRgStf[] {
  return lerTemasRg(textoDoArquivo(manifestoStf(), 'repercussao-geral'));
}

/** Súmulas vinculantes e não vinculantes, as vinculantes primeiro. */
export function carregarSumulasStf(): SumulaStf[] {
  const m = manifestoStf();
  return [...lerSumulasStf(textoDoArquivo(m, 'sumulas-vinculantes'), true).sumulas, ...lerSumulasStf(textoDoArquivo(m, 'sumulas'), false).sumulas];
}

/** Aplicação dos temas de repercussão geral (contagem agregada de `pnpm agregar:stf`), ou nulo se ainda não foi gerada. */
export function carregarAplicacaoStf(): AplicacaoDosTemas | null {
  try {
    return JSON.parse(readFileSync(join(PASTA_STF, 'aplicacao-temas.json'), 'utf-8'));
  } catch {
    return null;
  }
}
