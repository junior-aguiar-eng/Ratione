/**
 * Monta as versões das 28 normas e mede (F3-03):  pnpm versoes
 * Grava `corpus/versoes-resumo.json`. As versões completas não são versionadas: saem do corpus por este código.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { join } from 'node:path';
import { detectarCharset, type EntradaManifesto } from '../coleta/coletar';
import { paragrafosDoHtml, parsearDispositivos } from '../parser';
import { versoesDaNorma, type DatasDaNorma } from './versoes';

const PASTA = join(__dirname, '..', '..', 'corpus');

function main() {
  const manifesto: EntradaManifesto[] = JSON.parse(readFileSync(join(PASTA, 'planalto', 'manifesto.json'), 'utf-8'));
  const datas: { normas: Record<string, DatasDaNorma> } = JSON.parse(readFileSync(join(PASTA, 'atos-senado.json'), 'utf-8'));
  const resumo: Array<Record<string, number | string>> = [];
  const semData: Record<string, string[]> = {};
  for (const m of manifesto) {
    const html = detectarCharset(gunzipSync(readFileSync(join(PASTA, 'planalto', m.arquivo))), null).texto;
    const { dispositivos } = parsearDispositivos(paragrafosDoHtml(html));
    const versoes = versoesDaNorma(m.id, dispositivos, datas.normas[m.id]);
    const conta = (f: (v: (typeof versoes)[number]) => boolean) => versoes.filter(f).length;
    const r = {
      id: m.id,
      versoes: versoes.length,
      original: conta(v => v.origem === 'redacao_original'),
      redacaoDada: conta(v => v.origem === 'redacao_dada'),
      incluido: conta(v => v.origem === 'incluido'),
      revogado: conta(v => v.origem === 'revogado'),
      vetado: conta(v => v.origem === 'vetado'),
      dataPublicacaoSenado: conta(v => v.ato?.fonteDaData === 'publicacao_senado'),
      dataAssinaturaSenado: conta(v => v.ato?.fonteDaData === 'assinatura_senado'),
      dataDaAnotacao: conta(v => v.ato?.fonteDaData === 'anotacao'),
      soAno: conta(v => v.ato?.fonteDaData === 'ano'),
      semDataDeVigencia: conta(v => v.vigenteDe === null),
      anotadosSemAto: conta(v => v.origem === 'redacao_original' && v.anotacoes.some(a => a.tipo !== 'vide' && a.tipo !== 'regulamento' && a.tipo !== 'vigencia'))
    };
    resumo.push(r);
    semData[m.id] = [...new Set(versoes.filter(v => v.ato?.fonteDaData === 'ano').map(v => v.ato!.chave))].sort();
    console.log(
      `${m.id.padEnd(15)} ${String(r.versoes).padStart(5)}  orig ${String(r.original).padStart(5)}  red ${String(r.redacaoDada).padStart(4)}  incl ${String(r.incluido).padStart(4)}  rev ${String(r.revogado).padStart(3)}  | data: senado ${String(r.dataPublicacaoSenado).padStart(4)}  anot ${String(r.dataDaAnotacao).padStart(3)}  só-ano ${String(r.soAno).padStart(3)}  | anotado-sem-ato ${r.anotadosSemAto}`
    );
  }
  writeFileSync(join(PASTA, 'versoes-resumo.json'), JSON.stringify({ normas: resumo, atosSoComAno: semData }, null, 2) + '\n', 'utf-8');
}

if (require.main === module) main();
