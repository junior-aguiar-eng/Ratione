import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { CasoSchema, type Caso } from './caso';
import type { ResultadoDoCaso } from './executarCaso';

/** Leitura e escrita do corpus em disco: `casos/<id>.json`, `folhas/<id>.md` e `resultados/<rodada>/…`. */
export interface Pastas {
  raiz: string;
}

const dirCasos = (p: Pastas) => path.join(p.raiz, 'casos');
const dirRodada = (p: Pastas, rodada: string) => path.join(p.raiz, 'resultados', rodada);

export async function lerCaso(p: Pastas, id: string): Promise<Caso> {
  const arquivo = path.join(dirCasos(p), `${id}.json`);
  let bruto: unknown;
  try {
    bruto = JSON.parse(await readFile(arquivo, 'utf8'));
  } catch (e) {
    throw new Error(`${arquivo}: ${(e as Error).message}`);
  }
  const r = CasoSchema.safeParse(bruto);
  if (!r.success) throw new Error(`${arquivo}: ${r.error.issues.map(i => `${i.path.join('.') || 'caso'} ${i.message}`).join('; ')}`);
  if (r.data.id !== id) throw new Error(`${arquivo}: o id do arquivo ("${r.data.id}") difere do nome`);
  return r.data;
}

export async function lerCasos(p: Pastas): Promise<Caso[]> {
  let nomes: string[];
  try {
    nomes = (await readdir(dirCasos(p))).filter(n => n.endsWith('.json')).sort();
  } catch {
    return [];
  }
  return Promise.all(nomes.map(n => lerCaso(p, n.replace(/\.json$/, ''))));
}

export async function gravarCaso(p: Pastas, caso: Caso): Promise<void> {
  await mkdir(dirCasos(p), { recursive: true });
  await writeFile(path.join(dirCasos(p), `${caso.id}.json`), `${JSON.stringify(caso, null, 2)}\n`, 'utf8');
}

export async function gravarFolha(p: Pastas, id: string, markdown: string): Promise<string> {
  const pasta = path.join(p.raiz, 'folhas');
  await mkdir(pasta, { recursive: true });
  const arquivo = path.join(pasta, `${id}.md`);
  await writeFile(arquivo, markdown, 'utf8');
  return arquivo;
}

export async function gravarResultado(p: Pastas, rodada: string, r: ResultadoDoCaso): Promise<void> {
  await mkdir(dirRodada(p, rodada), { recursive: true });
  await writeFile(path.join(dirRodada(p, rodada), `${r.casoId}.json`), `${JSON.stringify(r, null, 2)}\n`, 'utf8');
}

export async function lerResultados(p: Pastas, rodada: string): Promise<ResultadoDoCaso[]> {
  const pasta = dirRodada(p, rodada);
  const nomes = (await readdir(pasta)).filter(n => n.endsWith('.json') && n !== 'rodada.json').sort();
  return Promise.all(nomes.map(async n => JSON.parse(await readFile(path.join(pasta, n), 'utf8')) as ResultadoDoCaso));
}

export async function gravarRodada(p: Pastas, rodada: string, meta: { modelo: string; em: string }): Promise<void> {
  await mkdir(dirRodada(p, rodada), { recursive: true });
  await writeFile(path.join(dirRodada(p, rodada), 'rodada.json'), `${JSON.stringify(meta, null, 2)}\n`, 'utf8');
}

export async function lerRodada(p: Pastas, rodada: string): Promise<{ modelo: string; em: string }> {
  return JSON.parse(await readFile(path.join(dirRodada(p, rodada), 'rodada.json'), 'utf8'));
}

export async function gravarRelatorio(p: Pastas, rodada: string, markdown: string): Promise<string> {
  const arquivo = path.join(dirRodada(p, rodada), 'relatorio.md');
  await writeFile(arquivo, markdown, 'utf8');
  return arquivo;
}

/** A rodada mais recente (os nomes são datas, e a ordem alfabética é a cronológica). */
export async function ultimaRodada(p: Pastas): Promise<string | null> {
  try {
    const nomes = (await readdir(path.join(p.raiz, 'resultados'))).filter(n => /^\d{4}-\d{2}-\d{2}T\d{4}$/.test(n)).sort();
    return nomes.at(-1) ?? null;
  } catch {
    return null;
  }
}
