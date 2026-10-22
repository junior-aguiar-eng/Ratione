/**
 * Importador do CSV de repercussão geral do STF (F4-02). A partir de `packages/tesemap`:
 *
 *   pnpm importar:stf <caminho do CSV baixado no portal da Transparência do STF>
 *
 * O STF bloqueia o acesso automático ao portal (403), então o arquivo é baixado por uma pessoa em
 * https://transparencia.stf.jus.br/extensions/dados_abertos/dados_abertos.html e entra aqui. O script valida o layout e o conteúdo (leitor
 * `repercussao.ts`) ANTES de gravar, guarda os bytes originais (gzip) em `corpus/stf/` e escreve o `manifesto.json` com SHA-256 e data de entrada.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { basename, join } from 'node:path';
import type { ManifestoStf } from './corpus';
import { lerTemasRg } from './repercussao';

const PASTA = join(__dirname, '..', '..', 'corpus', 'stf');

function main() {
  const caminho = process.argv[2];
  if (!caminho) throw new Error('Informe o caminho do CSV: pnpm importar:stf <arquivo.csv>');
  const bytes = readFileSync(caminho);
  const temas = lerTemasRg(bytes.toString('utf-8'));
  mkdirSync(PASTA, { recursive: true });
  writeFileSync(join(PASTA, 'repercussao-geral.csv.gz'), gzipSync(bytes, { level: 9 }));
  const manifesto: ManifestoStf = {
    fonte: 'Portal da Transparência do STF, dados abertos: temas de repercussão geral',
    paginaUrl: 'https://transparencia.stf.jus.br/extensions/dados_abertos/dados_abertos.html',
    lidoEm: new Date().toISOString().slice(0, 10),
    obtidoPor: 'baixado pelo responsável e enviado ao repositório (o portal do STF bloqueia o acesso automático)',
    arquivos: [
      {
        nome: 'repercussao-geral',
        nomeOriginal: basename(caminho),
        descricao: 'Um tema de repercussão geral por linha: título, tese, processo paradigma, situação, datas, ramos do direito',
        bytes: bytes.length,
        sha256: createHash('sha256').update(bytes).digest('hex'),
        arquivo: 'repercussao-geral.csv.gz'
      }
    ]
  };
  writeFileSync(join(PASTA, 'manifesto.json'), JSON.stringify(manifesto, null, 2) + '\n', 'utf-8');
  console.log(`ok   ${temas.length} temas lidos de ${basename(caminho)} (${(bytes.length / 1024 / 1024).toFixed(1)} MB), sha256 ${manifesto.arquivos[0].sha256.slice(0, 12)}`);
}

if (require.main === module) {
  try {
    main();
  } catch (e) {
    console.error(String(e instanceof Error ? e.message : e));
    process.exitCode = 1;
  }
}
