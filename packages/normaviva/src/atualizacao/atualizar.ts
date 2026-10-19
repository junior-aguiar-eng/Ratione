/**
 * Atualização do corpus e fila de revisão (F3-06). A partir de `packages/normaviva`:
 *
 *   pnpm atualizar              # relê as 28 normas no Planalto e compara com o corpus; mudança vai para a fila de revisão
 *   pnpm atualizar aprovar ID   # o revisor aceita a nova leitura: ela substitui a do corpus e o manifesto é atualizado
 *   pnpm atualizar rejeitar ID  # o revisor descarta a nova leitura (a anterior continua valendo)
 *
 * O SHA-256 dos bytes NÃO decide sozinho: em 19/10/2026, 27 das 28 páginas já diferiam em bytes poucas horas depois da coleta, sem
 * nenhuma mudança no texto (parte volátil da página do Planalto). Só entra na fila a mudança de TEXTO DE LEI, medida pelo diff dos
 * dispositivos (`comparar.ts`); mudança só de página é registrada no relatório como `so_pagina` e o corpus não é tocado.
 * Nada muda no corpus sem aprovação: a nova leitura fica em `corpus/pendentes/` e a fila em `corpus/fila-revisao.json`.
 * Código de saída: 0 sem mudança de texto de lei; 2 quando há item novo na fila (para o agendador alertar); 1 em erro de execução.
 * Falha de rede numa norma não derruba as outras e não apaga nada: aparece como `erro` no relatório.
 */
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { gunzipSync, gzipSync } from 'node:zlib';
import { join } from 'node:path';
import { baixarNorma, detectarCharset, type EntradaManifesto } from '../coleta/coletar';
import { NORMAS_PLANALTO } from '../coleta/normas';
import { compararHtml, type ResumoDaMudanca } from './comparar';

const PASTA = join(__dirname, '..', '..', 'corpus');
const MANIFESTO = join(PASTA, 'planalto', 'manifesto.json');
const FILA = join(PASTA, 'fila-revisao.json');
const PENDENTES = join(PASTA, 'pendentes');

export type StatusFila = 'pendente' | 'aprovada' | 'rejeitada';

export interface ItemDaFila {
  normaId: string;
  detectadoEm: string;
  shaAntigo: string;
  shaNovo: string;
  bytesAntigo: number;
  bytesNovo: number;
  /** Nova entrada do manifesto, aplicada só na aprovação. */
  entradaNova: EntradaManifesto;
  resumo: ResumoDaMudanca;
  status: StatusFila;
  revisadoEm: string | null;
  revisadoPor: string | null;
}

export type ResultadoDaNorma =
  | { normaId: string; resultado: 'sem_mudanca' }
  | { normaId: string; resultado: 'so_pagina'; shaNovo: string }
  | { normaId: string; resultado: 'mudou'; item: ItemDaFila }
  | { normaId: string; resultado: 'erro'; mensagem: string };

/** Decide, para uma norma já relida, se mudou e o que mudou. Pura: não grava nada. */
export function avaliarNorma(anterior: EntradaManifesto, htmlAnterior: string, nova: EntradaManifesto, bytesNovos: Buffer, hoje: string): ResultadoDaNorma {
  if (anterior.sha256 === nova.sha256) return { normaId: anterior.id, resultado: 'sem_mudanca' };
  const htmlNovo = detectarCharset(bytesNovos, null).texto;
  const resumo = compararHtml(htmlAnterior, htmlNovo);
  if (resumo.natureza === 'so_pagina') return { normaId: anterior.id, resultado: 'so_pagina', shaNovo: nova.sha256 };
  return {
    normaId: anterior.id,
    resultado: 'mudou',
    item: {
      normaId: anterior.id,
      detectadoEm: hoje,
      shaAntigo: anterior.sha256,
      shaNovo: nova.sha256,
      bytesAntigo: anterior.bytes,
      bytesNovo: nova.bytes,
      entradaNova: nova,
      resumo,
      status: 'pendente',
      revisadoEm: null,
      revisadoPor: null
    }
  };
}

function lerJson<T>(arquivo: string, padrao: T): T {
  return existsSync(arquivo) ? (JSON.parse(readFileSync(arquivo, 'utf-8')) as T) : padrao;
}

function gravarJson(arquivo: string, valor: unknown) {
  writeFileSync(arquivo, JSON.stringify(valor, null, 2) + '\n', 'utf-8');
}

const htmlDoCorpus = (arquivo: string) => detectarCharset(gunzipSync(readFileSync(join(PASTA, 'planalto', arquivo))), null).texto;

async function atualizar(): Promise<number> {
  const hoje = new Date().toISOString().slice(0, 10);
  const manifesto: EntradaManifesto[] = JSON.parse(readFileSync(MANIFESTO, 'utf-8'));
  const fila = lerJson<ItemDaFila[]>(FILA, []);
  mkdirSync(PENDENTES, { recursive: true });
  let novosNaFila = 0;
  let soPagina = 0;
  let erros = 0;
  for (const anterior of manifesto) {
    const norma = NORMAS_PLANALTO.find(n => n.id === anterior.id);
    if (!norma) continue;
    let r: ResultadoDaNorma;
    try {
      const { entrada, bytes } = await baixarNorma(norma);
      r = avaliarNorma(anterior, htmlDoCorpus(anterior.arquivo), entrada, bytes, hoje);
      if (r.resultado === 'so_pagina') soPagina++;
      if (r.resultado === 'mudou') {
        writeFileSync(join(PENDENTES, anterior.arquivo), gzipSync(bytes, { level: 9 }));
        // uma só pendência por norma: a leitura mais recente substitui a anterior ainda não revisada
        const resto = fila.filter(f => !(f.normaId === anterior.id && f.status === 'pendente'));
        fila.length = 0;
        fila.push(...resto, r.item);
        novosNaFila++;
      }
    } catch (e) {
      r = { normaId: anterior.id, resultado: 'erro', mensagem: (e as Error).message };
      erros++;
    }
    const detalhe =
      r.resultado === 'mudou'
        ? `${r.item.resumo.natureza} (novos ${r.item.resumo.novos}, removidos ${r.item.resumo.removidos}, texto ${r.item.resumo.textoAlterado}, anotação ${r.item.resumo.anotacaoAlterada}, revogados ${r.item.resumo.revogados})`
        : r.resultado === 'erro'
          ? r.mensagem
          : '';
    console.log(`${r.resultado.padEnd(11)} ${anterior.id.padEnd(15)} ${detalhe}`);
    await new Promise(res => setTimeout(res, 1000));
  }
  gravarJson(FILA, fila);
  console.log(`\n${novosNaFila} mudança(s) de texto de lei na fila de revisão; ${soPagina} página(s) com bytes diferentes e texto igual (ignoradas); ${erros} erro(s) de leitura.`);
  return novosNaFila > 0 ? 2 : 0;
}

function revisar(id: string, decisao: 'aprovada' | 'rejeitada'): number {
  const fila = lerJson<ItemDaFila[]>(FILA, []);
  const item = fila.find(f => f.normaId === id && f.status === 'pendente');
  if (!item) {
    console.error(`Sem pendência na fila para ${id}.`);
    return 1;
  }
  const pendente = join(PENDENTES, item.entradaNova.arquivo);
  if (decisao === 'aprovada') {
    const manifesto: EntradaManifesto[] = JSON.parse(readFileSync(MANIFESTO, 'utf-8'));
    const i = manifesto.findIndex(m => m.id === id);
    renameSync(pendente, join(PASTA, 'planalto', item.entradaNova.arquivo));
    manifesto[i] = item.entradaNova;
    gravarJson(MANIFESTO, manifesto);
    console.log(`Aprovada: ${id} atualizado no corpus. Rode agora: pnpm conferir && pnpm parsear && pnpm versoes && pnpm relacoes`);
  } else {
    rmSync(pendente, { force: true });
    console.log(`Rejeitada: a leitura anterior de ${id} continua valendo.`);
  }
  item.status = decisao;
  item.revisadoEm = new Date().toISOString().slice(0, 10);
  item.revisadoPor = process.env.REVISOR ?? null;
  gravarJson(FILA, fila);
  return 0;
}

async function main() {
  const [cmd, id] = process.argv.slice(2);
  if (cmd === 'aprovar' || cmd === 'rejeitar') {
    if (!id) throw new Error(`Uso: pnpm atualizar ${cmd} <ID da norma>`);
    process.exitCode = revisar(id, cmd === 'aprovar' ? 'aprovada' : 'rejeitada');
    return;
  }
  process.exitCode = await atualizar();
}

if (require.main === module) main().catch(e => {
  console.error(e);
  process.exitCode = 1;
});
