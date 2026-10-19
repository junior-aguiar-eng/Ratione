/**
 * Roda o parser nas 28 normas do corpus e mede (F3-02):  pnpm parsear
 *
 * Conferência de sequência dos artigos (lacunas e quebras).
 * Grava `corpus/parser-resumo.json` (contagens e divergências). A saída completa de dispositivos não é versionada: sai do
 * corpus por este mesmo código, de forma determinística.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { join } from 'node:path';
import { detectarCharset, type EntradaManifesto } from '../coleta/coletar';
import { paragrafosDoHtml } from './html';
import { parsearDispositivos } from './dispositivos';

const PASTA = join(__dirname, '..', '..', 'corpus');

/** "85" → "85"; "6º-A" → "6A"; "1.045-A" → "1045A". */
export function chaveDeArtigo(numero: string): string {
  const m = numero.match(/^(\d+(?:\.\d{3})*)º?(?:-([A-Z]{1,2}))?$/);
  return m ? m[1].replace(/\./g, '') + (m[2] ?? '') : numero;
}

/** Número base de um artigo ("1.045-A" → 1045), para conferir a sequência. */
export function numeroBase(numero: string): number {
  return Number(numero.replace(/[º-].*$/, '').replace(/\./g, ''));
}

/**
 * Conferência de sequência (as âncoras do HTML do Planalto não servem: variam de lei para lei, e a do CC é numerada errada).
 * Artigo revogado continua listado no texto compilado, então número que falta entre 1 e o maior é artigo que o parser perdeu
 * (ou que a lei não tem); número que volta atrás é reinício de numeração ou linha lida como artigo por engano.
 */
export function conferirSequencia(numeros: number[]): { maior: number; unicos: number; lacunas: number[]; quebras: string[] } {
  const unicos = new Set(numeros);
  const maior = numeros.length ? Math.max(...numeros) : 0;
  const lacunas: number[] = [];
  for (let n = 1; n <= maior; n++) if (!unicos.has(n)) lacunas.push(n);
  const quebras: string[] = [];
  for (let i = 1; i < numeros.length; i++) if (numeros[i] < numeros[i - 1]) quebras.push(`${numeros[i - 1]}→${numeros[i]}`);
  return { maior, unicos: unicos.size, lacunas, quebras };
}

export interface ResumoNorma {
  id: string;
  paragrafos: number;
  dispositivos: number;
  artigos: number;
  paragrafosLegais: number;
  incisos: number;
  alineas: number;
  itens: number;
  revogados: number;
  comAnotacao: number;
  continuacoes: number;
  preambulo: number;
  anomalias: number;
  maiorArtigo: number;
  artigosUnicos: number;
  lacunas: number[];
  quebrasDeSequencia: string[];
}

function main() {
  const manifesto: EntradaManifesto[] = JSON.parse(readFileSync(join(PASTA, 'planalto', 'manifesto.json'), 'utf-8'));
  const resumo: ResumoNorma[] = [];
  const anomaliasPorNorma: Record<string, string[]> = {};
  for (const m of manifesto) {
    const html = detectarCharset(gunzipSync(readFileSync(join(PASTA, 'planalto', m.arquivo))), null).texto;
    const paragrafos = paragrafosDoHtml(html);
    const r = parsearDispositivos(paragrafos);
    const seq = conferirSequencia(r.dispositivos.filter(d => d.tipo === 'artigo' && d.escopo === 'corpo').map(d => numeroBase(d.numero)));
    const conta = (t: string) => r.dispositivos.filter(d => d.tipo === t).length;
    resumo.push({
      id: m.id,
      paragrafos: paragrafos.length,
      dispositivos: r.dispositivos.length,
      artigos: r.dispositivos.filter(d => d.tipo === 'artigo').length,
      paragrafosLegais: conta('paragrafo') + conta('paragrafo_unico'),
      incisos: conta('inciso'),
      alineas: conta('alinea'),
      itens: conta('item'),
      revogados: r.dispositivos.filter(d => d.revogado).length,
      comAnotacao: r.dispositivos.filter(d => d.anotacoes.length > 0).length,
      continuacoes: r.dispositivos.reduce((s, d) => s + d.continuacao.length, 0),
      preambulo: r.preambulo.length,
      anomalias: r.anomalias.length,
      maiorArtigo: seq.maior,
      artigosUnicos: seq.unicos,
      lacunas: seq.lacunas.slice(0, 40),
      quebrasDeSequencia: seq.quebras.slice(0, 40)
    });
    anomaliasPorNorma[m.id] = r.anomalias.slice(0, 25);
    const x = resumo[resumo.length - 1];
    console.log(
      `${m.id.padEnd(15)} disp ${String(x.dispositivos).padStart(5)}  art ${String(x.artigos).padStart(4)} (únicos ${String(x.artigosUnicos).padStart(4)}, maior ${String(x.maiorArtigo).padStart(4)})  §${String(x.paragrafosLegais).padStart(4)}  inc ${String(x.incisos).padStart(4)}  al ${String(x.alineas).padStart(4)}  rev ${String(x.revogados).padStart(3)}  cont ${String(x.continuacoes).padStart(3)}  anom ${String(x.anomalias).padStart(3)}  lacunas ${seq.lacunas.length}  quebras ${seq.quebras.length}`
    );
  }
  writeFileSync(join(PASTA, 'parser-resumo.json'), JSON.stringify({ normas: resumo, anomalias: anomaliasPorNorma }, null, 2) + '\n', 'utf-8');
}

if (require.main === module) main();
