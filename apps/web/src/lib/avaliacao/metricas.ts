/**
 * F5-05: métricas do Argumenta contra o gabarito do revisor. Avaliam a **extração estrutural**, não a concordância com o texto da IA:
 * - dispositivo: o intervalo achado coincide com o do gabarito (sobreposição de parágrafos ≥ LIMIAR_DISPOSITIVO);
 * - questões: cada questão esperada é achada quando a achada **cobre** os parágrafos dela (≥ LIMIAR_QUESTAO) e ao menos um parágrafo
 *   da **conclusão** da achada cai dentro dela; cada achada vale uma só esperada;
 * - citações: a citação esperada aparece entre os fundamentos, mesmo escrita de outro jeito ("CDC, art. 14" = "art. 14 do CDC";
 *   "REsp 927.216/RS" = "REsp 927.216/RS, 2ª Turma, Rel. …");
 * - descartadas: saídas que o modelo gerou e o código recusou (formato ou conferência), sobre as chamadas feitas.
 */
import { NORMAS_CONHECIDAS } from '@ratione/normaviva/apelidos';
import { reconhecerCitacao } from '../argumenta/citacoes';
import type { Gabarito } from './caso';

export const LIMIAR_DISPOSITIVO = 0.8;
export const LIMIAR_QUESTAO = 0.5;

/** O que as métricas leem das três etapas (um subconjunto estrutural das saídas reais). */
export interface SaidasDoCaso {
  estrutura: { secoes: Array<{ tipo: string; inicio: number; fim: number }> } | null;
  questoes: { questoes: Array<{ paragrafos: number[]; paragrafosConclusao: number[] }> } | null;
  fundamentos: { fundamentos: Array<{ citacao: string }> } | null;
}

const NORMAS = NORMAS_CONHECIDAS.map(n => n.id);

export function jaccard(a: ReadonlySet<number>, b: ReadonlySet<number>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let comuns = 0;
  for (const x of a) if (b.has(x)) comuns++;
  return comuns / (a.size + b.size - comuns);
}

const intervalo = (inicio: number, fim: number): Set<number> => {
  const s = new Set<number>();
  for (let n = inicio; n <= fim && n - inicio < 2_000; n++) s.add(n);
  return s;
};

export interface ResultadoDispositivo {
  achou: boolean;
  sobreposicao: number;
  acertou: boolean;
}

export function medirDispositivo(estrutura: SaidasDoCaso['estrutura'], g: Gabarito): ResultadoDispositivo {
  // Vale o intervalo principal ou qualquer alternativo (o acórdão tem dois blocos que decidem); conta o que mais se sobrepõe.
  const esperados = [g.dispositivo, ...(g.dispositivoAlternativo ?? [])].map(d => intervalo(d.inicio, d.fim));
  const candidatas = (estrutura?.secoes ?? []).filter(s => s.tipo === 'dispositivo');
  if (candidatas.length === 0) return { achou: false, sobreposicao: 0, acertou: false };
  const sobreposicao = Math.max(...candidatas.flatMap(s => esperados.map(e => jaccard(e, intervalo(s.inicio, s.fim)))));
  return { achou: true, sobreposicao, acertou: sobreposicao >= LIMIAR_DISPOSITIVO };
}

export interface ResultadoQuestoes {
  esperadas: number;
  encontradas: number;
  /** Questões achadas sem correspondente no gabarito: não entram na taxa, mas aparecem no relatório. */
  extras: number;
}

/**
 * Uma questão achada corresponde a uma esperada quando (1) cobre pelo menos LIMIAR_QUESTAO dos parágrafos dela e (2) ao menos um
 * parágrafo da própria conclusão cai dentro dela. A cobertura não pune o modelo por incluir precedentes transcritos no meio; a
 * âncora da conclusão impede que uma questão larga demais valha por várias (e cada achada vale uma só esperada). Basta um
 * parágrafo na âncora porque a conclusão costuma aparecer também na ementa e no bloco "Acórdão", fora da questão esperada. Vale a
 * cobertura se a âncora existe; sem parágrafos de conclusão, vale o menor entre a cobertura e a fração dos parágrafos achados.
 */
export function correspondencia(esperados: ReadonlySet<number>, achados: ReadonlySet<number>, conclusao: ReadonlySet<number>): number {
  if (esperados.size === 0) return 0;
  let cobertos = 0;
  for (const n of esperados) if (achados.has(n)) cobertos++;
  const cobertura = cobertos / esperados.size;
  if (conclusao.size > 0) return [...conclusao].some(n => esperados.has(n)) ? cobertura : 0;
  let dentro = 0;
  for (const n of achados) if (esperados.has(n)) dentro++;
  return achados.size > 0 ? Math.min(cobertura, dentro / achados.size) : 0;
}

export function medirQuestoes(saida: SaidasDoCaso['questoes'], g: Gabarito): ResultadoQuestoes {
  const achadas = (saida?.questoes ?? []).map(q => ({ todos: new Set([...q.paragrafos, ...q.paragrafosConclusao]), conclusao: new Set(q.paragrafosConclusao) }));
  const pares: Array<{ e: number; a: number; s: number }> = [];
  g.questoes.forEach((q, e) => achadas.forEach((p, a) => pares.push({ e, a, s: correspondencia(new Set(q.paragrafos), p.todos, p.conclusao) })));
  const usadasE = new Set<number>();
  const usadasA = new Set<number>();
  for (const p of pares.sort((x, y) => y.s - x.s)) {
    if (p.s < LIMIAR_QUESTAO) break;
    if (usadasE.has(p.e) || usadasA.has(p.a)) continue;
    usadasE.add(p.e);
    usadasA.add(p.a);
  }
  return { esperadas: g.questoes.length, encontradas: usadasE.size, extras: achadas.length - usadasA.size };
}

const semAcento = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '');

const PALAVRAS_VAZIAS = new Set(['do', 'da', 'de', 'dos', 'das', 'no', 'na', 'nos', 'nas', 'o', 'a', 'os', 'as', 'e', 'em', 'n']);
const PROCESSO = /\b(eresp|aresp|resp|are|re|rhc|hc|rms|ms|rcl|pet|ai|ag)\s*n?[ºo°.]?\s*(\d[\d.]*\d|\d)(?:\s*[/-]?\s*(ac|al|am|ap|ba|ce|df|es|go|ma|mg|ms|mt|pa|pb|pe|pi|pr|rj|rn|ro|rr|rs|sc|se|sp|to)\b)?/;

const EXPANSOES: Array<[RegExp, string]> = [
  [/\blc\b/g, 'lei complementar'],
  [/\bec\b/g, 'emenda constitucional'],
  [/\bmp\b/g, 'medida provisoria'],
  [/\bdl\b/g, 'decreto lei']
];
const SUMULA_DE_OUTRO_TRIBUNAL = /sumula\s*(?:vinculante\s*)?n?[ºo°.]?\s*(\d{1,4})/;
const SIGLA_DE_TRIBUNAL = /\b(tst|tse|stm|tcu|tnu|tj[a-z]{2}|trf ?\d|trt ?\d+)\b/;

/** As palavras da citação, sem acento, pontuação nem ordem; o número do artigo e do parágrafo ficam presos ao rótulo. */
function palavrasDaCitacao(t: string): string {
  for (const [re, por] of EXPANSOES) t = t.replace(re, por);
  return t
    .replace(/\bart(?:igos?)?\.?\s*(\d+)/g, ' art_$1 ')
    .replace(/§+\s*(\d+)/g, ' par_$1 ')
    .split(/[^a-z0-9_]+/)
    .filter(w => w !== '' && !PALAVRAS_VAZIAS.has(w))
    .sort()
    .join(' ');
}
const minusculas = (texto: string): string => semAcento(texto).toLowerCase().replace(/(\d)\.(?=\d)/g, '$1');

/**
 * Chave que iguala escritas diferentes da mesma citação. Reconhecida (dispositivo das normas da base, súmula): vale o que foi
 * reconhecido. Processo ("AgRg no REsp 1.282.370/PE, Rel. …"): vale a classe, o número e a UF, sem turma, relator nem data.
 * Súmula de outro tribunal ("Súmula 331, IV, do TST" = "Súmula 331 do C. TST"): tribunal e número. O resto vale pelas palavras,
 * com siglas comuns por extenso (LC, EC, MP, DL): "art. 535 do CPC/1973" = "CPC/1973, art. 535".
 */
export function chaveDaCitacao(texto: string): string {
  const r = reconhecerCitacao(texto, NORMAS);
  if (r && r.tipo !== 'fora') return JSON.stringify(r);
  const t = minusculas(texto);
  const processo = PROCESSO.exec(t);
  if (processo) return `processo ${processo[1]} ${processo[2]!.replace(/\./g, '')} ${processo[3] ?? ''}`.trim();
  const sumula = SUMULA_DE_OUTRO_TRIBUNAL.exec(t);
  const tribunal = SIGLA_DE_TRIBUNAL.exec(t);
  if (sumula && tribunal) return `sumula ${tribunal[1]!.replace(' ', '')} ${sumula[1]}`;
  return palavrasDaCitacao(t);
}

const DETALHE_VAZIO = new Set(['inciso', 'paragrafo', 'alinea', 'o', 'a', 'e']);
const tokensDoDetalhe = (d: string | null): Set<string> =>
  new Set(semAcento(d ?? '').toLowerCase().split(/[^a-z0-9]+/).filter(w => w !== '' && !DETALHE_VAZIO.has(w)));
const contido = (a: ReadonlySet<string>, b: ReadonlySet<string>): boolean => a.size > 0 && [...a].every(x => b.has(x));

/**
 * A citação achada corresponde à esperada quando é a mesma pela chave, ou:
 * (1) as duas são artigo da mesma norma da base, com parágrafo, inciso ou alínea compatíveis (um contém o outro: "art. 43 do CTN"
 *     vale para "CTN, art. 43, I e II", mas "§ 3º" não vale para "§ 11");
 * (2) uma delas não foi reconhecida (escrita fora do padrão, norma fora da base): as palavras da esperada estão todas na achada,
 *     e a achada pode ser mais específica ("Lei Complementar nº 142/2013" vale para "LC nº 142/2013, art. 3º, IV"; o inverso não).
 * Precedente, súmula, tema e ação só valem pela chave.
 */
export function citacaoCorresponde(esperada: string, achada: string): boolean {
  const ke = chaveDaCitacao(esperada);
  const ka = chaveDaCitacao(achada);
  if (ke === ka) return true;
  const re = reconhecerCitacao(esperada, NORMAS);
  const ra = reconhecerCitacao(achada, NORMAS);
  if (re?.tipo === 'dispositivo' && ra?.tipo === 'dispositivo') {
    if (re.normaId !== ra.normaId || re.artigo !== ra.artigo) return false;
    const de = tokensDoDetalhe(re.detalhe);
    const da = tokensDoDetalhe(ra.detalhe);
    return de.size === 0 || da.size === 0 || contido(de, da) || contido(da, de);
  }
  const fechada = (r: ReturnType<typeof reconhecerCitacao>, k: string) =>
    k.startsWith('processo ') || k.startsWith('sumula ') || (r !== null && r.tipo !== 'dispositivo' && r.tipo !== 'fora');
  if (fechada(re, ke) || fechada(ra, ka)) return false;
  const pe = new Set(palavrasDaCitacao(minusculas(esperada)).split(' ').filter(w => w !== ''));
  const pa = new Set(palavrasDaCitacao(minusculas(achada)).split(' '));
  return contido(pe, pa);
}

export interface ResultadoCitacoes {
  esperadas: number;
  encontradas: number;
}

export function medirCitacoes(saida: SaidasDoCaso['fundamentos'], g: Gabarito): ResultadoCitacoes {
  const achadas = (saida?.fundamentos ?? []).map(f => f.citacao).filter(c => c.trim());
  const esperadas = g.citacoes.filter((c, i, todas) => todas.findIndex(o => chaveDaCitacao(o) === chaveDaCitacao(c)) === i);
  return { esperadas: esperadas.length, encontradas: esperadas.filter(e => achadas.some(a => citacaoCorresponde(e, a))).length };
}

export interface MedidaDoCaso {
  dispositivo: ResultadoDispositivo;
  questoes: ResultadoQuestoes;
  citacoes: ResultadoCitacoes;
}

export const medirCaso = (s: SaidasDoCaso, g: Gabarito): MedidaDoCaso => ({
  dispositivo: medirDispositivo(s.estrutura, g),
  questoes: medirQuestoes(s.questoes, g),
  citacoes: medirCitacoes(s.fundamentos, g)
});

export interface Totais {
  casos: number;
  dispositivoAcertos: number;
  questoesEsperadas: number;
  questoesEncontradas: number;
  questoesExtras: number;
  citacoesEsperadas: number;
  citacoesEncontradas: number;
}

export function totalizar(medidas: readonly MedidaDoCaso[]): Totais {
  const t: Totais = { casos: medidas.length, dispositivoAcertos: 0, questoesEsperadas: 0, questoesEncontradas: 0, questoesExtras: 0, citacoesEsperadas: 0, citacoesEncontradas: 0 };
  for (const m of medidas) {
    if (m.dispositivo.acertou) t.dispositivoAcertos++;
    t.questoesEsperadas += m.questoes.esperadas;
    t.questoesEncontradas += m.questoes.encontradas;
    t.questoesExtras += m.questoes.extras;
    t.citacoesEsperadas += m.citacoes.esperadas;
    t.citacoesEncontradas += m.citacoes.encontradas;
  }
  return t;
}

/** Razão de contagens; `null` (e não 0) quando não há o que medir. */
export const taxa = (parte: number, total: number): number | null => (total === 0 ? null : parte / total);
