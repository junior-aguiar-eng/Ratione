/**
 * Feeds de legislação (F3-06): avisam antes do Planalto atualizar a página. A partir de `packages/normaviva`:
 *
 *   pnpm feeds       # confere o Senado e imprime/grava os alertas; código de saída 2 se houver algum
 *
 * Duas fontes, as duas da API de Dados Abertos do Senado (a mesma de `pnpm conferir`):
 * 1. **Alterações novas**: relê o detalhe de cada uma das 28 normas e compara os atos alteradores (`vides`) com os que o corpus já conhece
 *    (`corpus/atos-senado.json`). Ato que o Senado já lista e o corpus não: alerta. É a mesma lista da conferência cruzada, vista todo dia.
 * 2. **Atos recentes que citam uma norma monitorada**: lê a lista de atos do ano (leis, leis complementares, emendas, medidas provisórias e
 *    acórdãos de ADI, ADC e ADPF) e alerta sobre os dos últimos dias cuja ementa cita uma das normas (pelo número do ato, pelo nome ou pela sigla).
 *    Pega o ato no dia em que sai, antes de o Senado registrar a alteração na norma.
 *
 * Fontes que o plano previa e não servem como feed (verificado em 21/10/2026): o **LexML** responde com uma página de "Verificação de segurança"
 * a qualquer script (não há como consultar sem navegador), e a **API da Câmara** só traz proposições (projetos em tramitação), não as normas já
 * publicadas; os atos publicados já chegam pelo Senado. O alerta não altera o corpus: quem decide é o revisor (`pnpm conferir`, `pnpm atualizar`).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { NORMAS_CONHECIDAS } from '../busca/apelidos';
import { API, USER_AGENT, atoCitadoNoTexto, atosAlteradoresDoSenado, atosDoTexto, buscarSenado, chaveDoNomeSenado, textoSemHtml, type AtoSenado, type VideSenado } from '../coleta/conferir';
import { detectarCharset, type EntradaManifesto } from '../coleta/coletar';
import { gunzipSync } from 'node:zlib';

const PASTA = join(__dirname, '..', '..', 'corpus');

/** Tipos da lista do Senado que podem mudar o texto de uma norma (decretos, resoluções e atos do Congresso não mudam). */
export const TIPOS_RELEVANTES = new Set(['LEI-n', 'LCP', 'EMC-n', 'MPV-ss', 'ADI', 'ADCon', 'ADPF']);
/** Quantos dias para trás a lista é examinada a cada execução. */
export const DIAS_DE_JANELA = 15;

export interface DocumentoDaLista {
  tipo: string;
  normaNome: string;
  ementa: string;
  /** DD/MM/AAAA */
  dataassinatura: string;
  /** `LEI-15371-2026-03-31`: tipo, número, ano e data de assinatura. */
  norma?: string;
}

export interface Alerta {
  fonte: 'alteracao_no_senado' | 'ato_recente';
  normaId: string;
  ato: string;
  /** AAAA-MM-DD (publicação ou assinatura), quando conhecida. */
  data: string | null;
  motivo: string;
}

/** Chave canônica do ato de cada norma monitorada (`LEI-13105-2015` → `lei:13105:2015`); a CF não tem número de lei. */
export function chavesDasNormas(ids: string[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const id of ids) {
    const r = id.match(/^(LEI|DL|LC)-(\d+)-(\d{4})$/);
    if (r) m.set(`${r[1] === 'LEI' ? 'lei' : r[1] === 'DL' ? 'decreto-lei' : 'lei-complementar'}:${r[2]}:${r[3]}`, id);
  }
  return m;
}

const semAcento = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Normas monitoradas que a ementa cita: pelo número do ato, pelo nome por extenso ou pela sigla ("CLT", "CPC"). */
export function normasCitadas(ementa: string, chaves: Map<string, string>): string[] {
  const achadas = new Set<string>();
  for (const { chave } of atosDoTexto(ementa)) {
    const id = chaves.get(chave);
    if (id) achadas.add(id);
  }
  const plano = semAcento(ementa);
  for (const n of NORMAS_CONHECIDAS) {
    if (!chaves.has(chaveDe(n.id)) && n.id !== 'CF-1988') continue;
    if (n.nomes.some(nome => plano.includes(semAcento(nome)))) achadas.add(n.id);
    if (n.siglas.some(sigla => new RegExp(String.raw`(^|[^\p{L}\p{N}])${sigla}([^\p{L}\p{N}]|$)`, 'u').test(ementa))) achadas.add(n.id);
  }
  return [...achadas];
}

function chaveDe(id: string): string {
  const r = id.match(/^(LEI|DL|LC)-(\d+)-(\d{4})$/);
  return r ? `${r[1] === 'LEI' ? 'lei' : r[1] === 'DL' ? 'decreto-lei' : 'lei-complementar'}:${r[2]}:${r[3]}` : id;
}

/** O texto da norma no corpus (lido do Planalto) já cita o ato? */
export type JaNoCorpus = (normaId: string, chaveDoAto: string) => boolean;

const iso = (br: string) => br.split('/').reverse().join('-');

/** Alertas da lista de atos: tipo relevante, assinado dentro da janela, com ementa que cita norma monitorada (emenda constitucional sempre vale para a CF). */
export function alertasDaLista(docs: DocumentoDaLista[], chaves: Map<string, string>, desde: string, jaNoCorpus: JaNoCorpus = () => false): Alerta[] {
  const alertas: Alerta[] = [];
  for (const d of docs) {
    if (!TIPOS_RELEVANTES.has(d.tipo) || iso(d.dataassinatura) < desde) continue;
    const ids = new Set(normasCitadas(d.ementa, chaves));
    if (d.tipo === 'EMC-n') ids.add('CF-1988');
    const chave = chaveDoNomeSenado(d.normaNome);
    for (const normaId of ids) {
      // O texto da norma no corpus já cita o ato: o Planalto já o consolidou, não há o que avisar (acórdãos não têm chave e seguem na janela)
      if (chave && jaNoCorpus(normaId, chave)) continue;
      alertas.push({
        fonte: 'ato_recente',
        normaId,
        ato: d.normaNome,
        data: iso(d.dataassinatura),
        motivo: d.tipo === 'EMC-n' ? 'Emenda constitucional' : `Ementa cita ${normaId}: ${d.ementa.replace(/\s+/g, ' ').slice(0, 160)}`
      });
    }
  }
  return alertas.sort((a, b) => a.normaId.localeCompare(b.normaId) || (a.data ?? '').localeCompare(b.data ?? ''));
}

/** Alertas das alterações: atos que o Senado lista para a norma e o corpus ainda não conhece. */
export function alertasDeAlteracoes(normaId: string, doSenado: Record<string, AtoSenado>, conhecidos: Record<string, AtoSenado>, jaNoCorpus: JaNoCorpus = () => false): Alerta[] {
  return Object.entries(doSenado)
    .filter(([chave]) => !(chave in conhecidos) && !jaNoCorpus(normaId, chave))
    .map(([chave, ato]) => ({
      fonte: 'alteracao_no_senado' as const,
      normaId,
      ato: ato.nome,
      data: ato.publicacao ?? ato.assinatura,
      motivo: `O Senado registra ${ato.nome} (${chave}) como alteração de ${normaId} e o corpus não a conhece.`
    }));
}

export interface DependenciasFeeds {
  hoje: () => string;
  normas: () => string[];
  conhecidos: () => Record<string, Record<string, AtoSenado>>;
  /** Texto simples da norma no corpus, para saber se o Planalto já consolidou o ato. */
  textoDaNorma: (normaId: string) => string;
  videsDaNorma: (normaId: string) => Promise<VideSenado[]>;
  listaDoAno: (ano: number) => Promise<DocumentoDaLista[]>;
}

export interface ResultadoFeeds {
  geradoEm: string;
  alertas: Alerta[];
  /** Fontes que falharam (a execução segue com as demais). */
  erros: string[];
}

function somarDias(isoData: string, n: number): string {
  const [a, m, d] = isoData.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10);
}

export async function executarFeeds(dep: DependenciasFeeds): Promise<ResultadoFeeds> {
  const hoje = dep.hoje();
  const ids = dep.normas();
  const conhecidos = dep.conhecidos();
  const alertas: Alerta[] = [];
  const erros: string[] = [];
  const textos = new Map<string, string>();
  const jaNoCorpus: JaNoCorpus = (id, chave) => {
    if (!textos.has(id)) textos.set(id, dep.textoDaNorma(id));
    return atoCitadoNoTexto(chave, textos.get(id)!);
  };

  for (const id of ids) {
    try {
      alertas.push(...alertasDeAlteracoes(id, atosAlteradoresDoSenado(await dep.videsDaNorma(id)), conhecidos[id] ?? {}, jaNoCorpus));
    } catch (e) {
      erros.push(`${id}: ${(e as Error).message}`);
    }
  }

  const desde = somarDias(hoje, -DIAS_DE_JANELA);
  const anos = new Set([Number(desde.slice(0, 4)), Number(hoje.slice(0, 4))]); // virada de ano: olha o ano anterior também
  const chaves = chavesDasNormas(ids);
  for (const ano of anos) {
    try {
      alertas.push(...alertasDaLista(await dep.listaDoAno(ano), chaves, desde, jaNoCorpus));
    } catch (e) {
      erros.push(`lista de ${ano}: ${(e as Error).message}`);
    }
  }
  return { geradoEm: hoje, alertas, erros };
}

async function pedir(url: string): Promise<unknown> {
  let ultimo = 'erro desconhecido';
  for (let tentativa = 1; tentativa <= 3; tentativa++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' }, signal: AbortSignal.timeout(45_000) });
      if (r.ok) return await r.json();
      ultimo = `HTTP ${r.status}`;
    } catch (e) {
      ultimo = (e as Error).message;
    }
    await new Promise(res => setTimeout(res, 3000));
  }
  throw new Error(`${url}: ${ultimo} (3 tentativas)`);
}

async function main() {
  const manifesto: EntradaManifesto[] = JSON.parse(readFileSync(join(PASTA, 'planalto', 'manifesto.json'), 'utf-8'));
  const atos: { normas: Record<string, { atos: Record<string, AtoSenado> }> } = JSON.parse(readFileSync(join(PASTA, 'atos-senado.json'), 'utf-8'));
  const resultado = await executarFeeds({
    hoje: () => new Date().toISOString().slice(0, 10),
    normas: () => manifesto.map(m => m.id),
    conhecidos: () => Object.fromEntries(Object.entries(atos.normas).map(([id, n]) => [id, n.atos])),
    textoDaNorma: id => textoSemHtml(detectarCharset(gunzipSync(readFileSync(join(PASTA, 'planalto', manifesto.find(m => m.id === id)!.arquivo))), null).texto),
    videsDaNorma: async id => (await buscarSenado(id)).vides,
    listaDoAno: async ano => {
      const json = (await pedir(`${API}lista?ano=${ano}&v=3`)) as { ListaDocumento: { documentos: { documento: DocumentoDaLista[] } } };
      return json.ListaDocumento.documentos.documento ?? [];
    }
  });
  writeFileSync(join(PASTA, 'feeds-alertas.json'), JSON.stringify(resultado, null, 2) + '\n', 'utf-8');
  for (const a of resultado.alertas) console.log(`${a.data ?? '?'}  ${a.normaId.padEnd(15)} ${a.fonte === 'ato_recente' ? 'ato recente      ' : 'alteração nova    '} ${a.ato}  ${a.fonte === 'ato_recente' ? '— ' + a.motivo.slice(0, 100) : ''}`);
  for (const e of resultado.erros) console.log(`ERRO ${e}`);
  console.log(`${resultado.alertas.length} alerta(s), ${resultado.erros.length} erro(s).`);
  if (resultado.erros.length > 0 && resultado.alertas.length === 0 && resultado.erros.length >= 10) process.exitCode = 1;
  else if (resultado.alertas.length > 0) process.exitCode = 2;
}

if (require.main === module) void main();
