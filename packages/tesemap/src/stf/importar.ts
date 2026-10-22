/**
 * Importador dos CSV do STF (F4-02). A partir de `packages/tesemap`:
 *
 *   pnpm importar:stf repercussao-geral <csv do portal da Transparência do STF>
 *   pnpm importar:stf sumulas <csv das súmulas vinculantes> <csv das súmulas não vinculantes>
 *
 * O STF bloqueia o acesso automático (403), então os arquivos são baixados por uma pessoa: os temas de repercussão geral em
 * https://transparencia.stf.jus.br/extensions/dados_abertos/dados_abertos.html e as súmulas em https://jurisprudencia.stf.jus.br (exportar CSV, uma
 * busca com "vinculante: sim" e outra com "não vinculante" e situação "Aprovada"). O script valida o layout e o conteúdo ANTES de gravar, guarda os
 * bytes originais (gzip) em `corpus/stf/` e atualiza só as entradas do `manifesto.json` que recebeu (SHA-256, data de entrada, consulta da exportação).
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { basename, join } from 'node:path';
import { PASTA_STF, type ArquivoStf, type ManifestoStf, type NomeDoArquivoStf } from './corpus';
import { lerTemasRg } from './repercussao';
import { lerSumulasStf } from './sumulas';

const MANIFESTO = join(PASTA_STF, 'manifesto.json');

const BASE: ManifestoStf = {
  fonte: 'Portal do STF: dados abertos da Transparência (repercussão geral) e base de jurisprudência (súmulas)',
  paginaUrl: 'https://transparencia.stf.jus.br/extensions/dados_abertos/dados_abertos.html',
  lidoEm: '',
  obtidoPor: 'baixados pelo responsável e enviados ao repositório (o portal do STF bloqueia o acesso automático)',
  arquivos: []
};

function guardar(manifesto: ManifestoStf, nome: NomeDoArquivoStf, caminho: string, descricao: string, consulta: string | null | undefined): string {
  const bytes = readFileSync(caminho);
  const hoje = new Date().toISOString().slice(0, 10);
  writeFileSync(join(PASTA_STF, `${nome}.csv.gz`), gzipSync(bytes, { level: 9 }));
  const entrada: ArquivoStf = {
    nome,
    nomeOriginal: basename(caminho),
    descricao,
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    arquivo: `${nome}.csv.gz`,
    lidoEm: hoje,
    ...(consulta ? { consulta } : {})
  };
  manifesto.arquivos = [...manifesto.arquivos.filter(a => a.nome !== nome), entrada].sort((a, b) => a.nome.localeCompare(b.nome));
  manifesto.lidoEm = hoje;
  return entrada.sha256.slice(0, 12);
}

function main() {
  const [tipo, ...arquivos] = process.argv.slice(2);
  const manifesto: ManifestoStf = existsSync(MANIFESTO) ? JSON.parse(readFileSync(MANIFESTO, 'utf-8')) : { ...BASE };
  mkdirSync(PASTA_STF, { recursive: true });
  if (tipo === 'repercussao-geral' && arquivos.length === 1) {
    const temas = lerTemasRg(readFileSync(arquivos[0], 'utf-8'));
    const sha = guardar(manifesto, 'repercussao-geral', arquivos[0], 'Um tema de repercussão geral por linha: título, tese, processo paradigma, situação, datas, ramos do direito', null);
    console.log(`ok   ${temas.length} temas de repercussão geral (sha256 ${sha})`);
  } else if (tipo === 'sumulas' && arquivos.length === 2) {
    const sv = lerSumulasStf(readFileSync(arquivos[0], 'utf-8'), true);
    const comuns = lerSumulasStf(readFileSync(arquivos[1], 'utf-8'), false);
    const a = guardar(manifesto, 'sumulas-vinculantes', arquivos[0], 'Súmulas vinculantes aprovadas: enunciado, órgão, data de aprovação, publicação, ramo do direito, observação', sv.consulta);
    const b = guardar(manifesto, 'sumulas', arquivos[1], 'Súmulas não vinculantes aprovadas: enunciado, órgão, data de aprovação, publicação, ramo do direito, observação', comuns.consulta);
    console.log(`ok   ${sv.sumulas.length} súmulas vinculantes (sha256 ${a}) e ${comuns.sumulas.length} não vinculantes (sha256 ${b})`);
  } else {
    throw new Error('Uso: pnpm importar:stf repercussao-geral <csv>  |  pnpm importar:stf sumulas <csv vinculantes> <csv não vinculantes>');
  }
  writeFileSync(MANIFESTO, JSON.stringify(manifesto, null, 2) + '\n', 'utf-8');
}

if (require.main === module) {
  try {
    main();
  } catch (e) {
    console.error(String(e instanceof Error ? e.message : e));
    process.exitCode = 1;
  }
}
