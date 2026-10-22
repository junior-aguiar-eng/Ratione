/**
 * Agregador da aplicação dos temas de repercussão geral (F4-02). A partir de `packages/tesemap`:
 *
 *   pnpm agregar:stf <csv de decisões> [<csv de decisões> ...]
 *
 * Os CSV de decisões (portal da Transparência do STF) têm centenas de MB e não ficam no repositório: só o resultado agregado, com o SHA-256 de cada
 * arquivo lido. Quem tem os arquivos refaz a agregação com este comando e confere o resultado. A regra de contagem está em `aplicacao.ts`.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { agregarAplicacao } from './aplicacao';
import { PASTA_STF, carregarTemasRgStf } from './corpus';

function main() {
  const caminhos = process.argv.slice(2);
  if (caminhos.length === 0) throw new Error('Uso: pnpm agregar:stf <csv de decisões> [<csv de decisões> ...]');
  const maiorTema = Math.max(...carregarTemasRgStf().map(t => t.numero));
  const r = agregarAplicacao(
    caminhos.map(c => ({ nomeOriginal: basename(c), bytes: readFileSync(c) })),
    maiorTema,
    new Date().toISOString().slice(0, 10)
  );
  writeFileSync(join(PASTA_STF, 'aplicacao-temas.json'), JSON.stringify(r, null, 2) + '\n', 'utf-8');
  console.log(`ok   ${r.decisoesLidas} decisões (${r.periodo.de} a ${r.periodo.ate}); ${r.devolucoes} devoluções, ${r.devolucoesComTema} com tema citado; ${r.temasDistintos} temas distintos`);
  if (r.anosPossivelmenteIncompletos.length > 0) console.log(`aviso: ano(s) possivelmente incompleto(s): ${r.anosPossivelmenteIncompletos.join(', ')}`);
}

if (require.main === module) {
  try {
    main();
  } catch (e) {
    console.error(String(e instanceof Error ? e.message : e));
    process.exitCode = 1;
  }
}
