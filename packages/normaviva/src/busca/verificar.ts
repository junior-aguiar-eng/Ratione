/**
 * Mede as relações extraídas do corpus (F3-05):  pnpm relacoes
 * Grava `corpus/relacoes-resumo.json`: remissões por escopo e quantas encontram o artigo de destino no corpus.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { linhasDoCorpus } from './carga';

const PASTA = join(__dirname, '..', '..', 'corpus');

function main() {
  const todas = linhasDoCorpus(PASTA);
  const rotulos = new Set(todas.flatMap(l => l.dispositivos.filter(d => d.escopo === 'corpo').map(d => `${d.norma_id}|${d.rotulo}`)));
  const porNorma: Array<Record<string, number | string>> = [];
  const total: Record<string, number> = { alteracoes: 0, remissoes: 0, mesma: 0, presumido: 0, explicito: 0, externo: 0, comDestinoNoCorpus: 0, semDestinoNoCorpus: 0 };
  for (const l of todas) {
    const linha: Record<string, number | string> = { id: l.norma.id, dispositivos: l.dispositivos.length, alteracoes: 0, remissoes: 0, mesma: 0, presumido: 0, explicito: 0, externo: 0, comDestinoNoCorpus: 0, semDestinoNoCorpus: 0 };
    for (const r of l.relacoes) {
      if (r.tipo !== 'remete') {
        (linha.alteracoes as number)++;
        total.alteracoes++;
        continue;
      }
      (linha.remissoes as number)++;
      total.remissoes++;
      (linha[r.escopo!] as number)++;
      total[r.escopo!]++;
      const achou = !!r.destino_norma_id && rotulos.has(`${r.destino_norma_id}|${r.destino_rotulo}`);
      const k = achou ? 'comDestinoNoCorpus' : 'semDestinoNoCorpus';
      (linha[k] as number)++;
      total[k]++;
    }
    porNorma.push(linha);
    console.log(`${l.norma.id.padEnd(15)} disp ${String(linha.dispositivos).padStart(5)}  alter ${String(linha.alteracoes).padStart(4)}  remete ${String(linha.remissoes).padStart(4)} (mesma ${linha.mesma}, presumido ${linha.presumido}, explícito ${linha.explicito}, externo ${linha.externo})  com destino ${linha.comDestinoNoCorpus}  sem ${linha.semDestinoNoCorpus}`);
  }
  console.log('TOTAL', JSON.stringify(total));
  writeFileSync(join(PASTA, 'relacoes-resumo.json'), JSON.stringify({ total, normas: porNorma }, null, 2) + '\n', 'utf-8');
}

if (require.main === module) main();
