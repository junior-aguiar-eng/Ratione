/**
 * Folha de revisão do grafo mínimo (F4-05): `pnpm grafo-minimo` monta o grafo (o que já recusa trecho que não esteja no texto oficial) e
 * grava `corpus/grafo-minimo.md`, com cada aresta, o trecho, a fonte e a situação da validação, para o responsável conferir.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { linhasDoCorpus } from '@ratione/normaviva/corpus';
import { carregarPrecedentesStj, manifestoStj } from '../stj';
import { carregarAplicacaoStf, carregarTemasRgStf, manifestoStf } from '../stf';
import { nosDosPrecedentesStj, temasStfCitadosPeloStj } from './nos-stj';
import { nosDosTemasStf } from './nos-stf';
import { arestasDoGrafoMinimo, carregarGrafoMinimo, nosDosDispositivos } from './grafo-minimo';

const br = (iso: string) => iso.split('-').reverse().join('/');

function main() {
  const grafo = carregarGrafoMinimo();
  const corpus = linhasDoCorpus(join(__dirname, '..', '..', '..', 'normaviva', 'corpus'));
  const stj = nosDosPrecedentesStj(carregarPrecedentesStj(), manifestoStj(), () => []);
  const stf = nosDosTemasStf(carregarTemasRgStf(), manifestoStf(), () => [], temasStfCitadosPeloStj(stj), carregarAplicacaoStf());
  const nos = [...stj, ...stf, ...nosDosDispositivos(grafo, corpus)];
  const arestas = arestasDoGrafoMinimo(grafo, nos);
  const rotulo = new Map(nos.map(n => [n.id, n.rotulo]));
  const validadas = grafo.arestas.filter(a => a.validacao.status === 'validado').length;

  const L: string[] = [];
  L.push('# Grafo mínimo do TeseMap: revisão das relações (F4-05)', '');
  L.push(`Gerado por \`pnpm grafo-minimo\` a partir de \`corpus/grafo-minimo.json\`. **${arestas.length} relações** · validadas: **${validadas}** · pendentes: **${arestas.length - validadas}**`, '');
  L.push('Cada relação foi sugerida pela IA e cita um trecho que o programa conferiu, palavra por palavra, no texto oficial guardado no repositório. O que falta conferir é a **leitura**: se o tipo e o rótulo descrevem bem o que o trecho diz. Só as relações validadas aparecem no site.', '');
  L.push('Para validar, em `corpus/grafo-minimo.json`, troque na relação `"validacao": {"status": "pendente", "por": null, "em": null}` por `{"status": "validado", "por": "<nome>", "em": "AAAA-MM-DD"}`, rode `pnpm grafo-minimo` e depois `pnpm carregar:tesemap`. Para corrigir, edite o tipo ou o rótulo; para descartar, apague a relação.', '');
  grafo.arestas.forEach((a, i) => {
    const f = arestas[i].fontes[0];
    L.push(`## ${i + 1}. ${rotulo.get(a.origem)} → **${a.tipo}** → ${rotulo.get(a.destino)}`, '');
    L.push(`- **Rótulo na tela:** ${a.rotulo}`);
    L.push(`- **Trecho (de ${rotulo.get(a.trechoDe)}):** "${a.trecho}"`);
    L.push(`- **Fonte:** ${f.ato}, ${f.url} (lido em ${br(f.lidoEm)})`);
    L.push(`- **Validação:** ${a.validacao.status === 'validado' ? `validado por ${a.validacao.por} em ${br(a.validacao.em!)}` : 'pendente'}`, '');
  });
  writeFileSync(join(__dirname, '..', '..', 'corpus', 'grafo-minimo.md'), L.join('\n'));
  console.log(`Grafo mínimo: ${arestas.length} relações, ${validadas} validadas. Folha de revisão em corpus/grafo-minimo.md`);
}

main();
