/**
 * F5-05: métricas do Argumenta contra o gabarito do revisor. Avaliam a **extração estrutural**, não a concordância com o texto da IA:
 * - dispositivo: o intervalo achado coincide com o do gabarito (sobreposição de parágrafos ≥ LIMIAR_DISPOSITIVO);
 * - questões: cada questão esperada é achada quando a achada **cobre** os parágrafos dela e a **conclusão** da achada cai dentro dela
 *   (ambos ≥ LIMIAR_QUESTAO); cada achada vale uma só esperada;
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
  const esperado = intervalo(g.dispositivo.inicio, g.dispositivo.fim);
  const candidatas = (estrutura?.secoes ?? []).filter(s => s.tipo === 'dispositivo');
  if (candidatas.length === 0) return { achou: false, sobreposicao: 0, acertou: false };
  const sobreposicao = Math.max(...candidatas.map(s => jaccard(esperado, intervalo(s.inicio, s.fim))));
  return { achou: true, sobreposicao, acertou: sobreposicao >= LIMIAR_DISPOSITIVO };
}

export interface ResultadoQuestoes {
  esperadas: number;
  encontradas: number;
  /** Questões achadas sem correspondente no gabarito: não entram na taxa, mas aparecem no relatório. */
  extras: number;
}

/**
 * Uma questão achada corresponde a uma esperada quando (1) cobre pelo menos LIMIAR_QUESTAO dos parágrafos dela e (2) pelo menos
 * LIMIAR_QUESTAO dos parágrafos da própria conclusão ficam dentro dela. A cobertura não pune o modelo por incluir precedentes
 * transcritos no meio; a ancoragem da conclusão impede que uma questão larga demais valha por várias. Vale o menor dos dois.
 */
export function correspondencia(esperados: ReadonlySet<number>, achados: ReadonlySet<number>, conclusao: ReadonlySet<number>): number {
  if (esperados.size === 0) return 0;
  let cobertos = 0;
  for (const n of esperados) if (achados.has(n)) cobertos++;
  const base = conclusao.size > 0 ? conclusao : achados;
  let ancorados = 0;
  for (const n of base) if (esperados.has(n)) ancorados++;
  return Math.min(cobertos / esperados.size, base.size > 0 ? ancorados / base.size : 0);
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

/**
 * Chave que iguala escritas diferentes da mesma citação. Reconhecida (dispositivo das normas da base, súmula): vale o que foi
 * reconhecido. Processo ("AgRg no REsp 1.282.370/PE, Rel. …"): vale a classe, o número e a UF, sem turma, relator nem data.
 * O resto vale pelas palavras, sem acento, pontuação nem ordem, com o número do artigo e do parágrafo presos ao rótulo
 * ("art. 535 do CPC/1973" = "CPC/1973, art. 535").
 */
export function chaveDaCitacao(texto: string): string {
  const r = reconhecerCitacao(texto, NORMAS);
  if (r && r.tipo !== 'fora') return JSON.stringify(r);
  const t = semAcento(texto).toLowerCase().replace(/(\d)\.(?=\d)/g, '$1');
  const processo = PROCESSO.exec(t);
  if (processo) return `processo ${processo[1]} ${processo[2]!.replace(/\./g, '')} ${processo[3] ?? ''}`.trim();
  return t
    .replace(/\bart(?:igos?)?\.?\s*(\d+)/g, ' art_$1 ')
    .replace(/§+\s*(\d+)/g, ' par_$1 ')
    .split(/[^a-z0-9_]+/)
    .filter(w => w !== '' && !PALAVRAS_VAZIAS.has(w))
    .sort()
    .join(' ');
}

export interface ResultadoCitacoes {
  esperadas: number;
  encontradas: number;
}

export function medirCitacoes(saida: SaidasDoCaso['fundamentos'], g: Gabarito): ResultadoCitacoes {
  const achadas = new Set((saida?.fundamentos ?? []).map(f => f.citacao).filter(c => c.trim()).map(chaveDaCitacao));
  const esperadas = [...new Set(g.citacoes.map(chaveDaCitacao))];
  return { esperadas: esperadas.length, encontradas: esperadas.filter(k => achadas.has(k)).length };
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
