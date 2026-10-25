/**
 * F5-05: métricas do Argumenta contra o gabarito do revisor. Avaliam a **extração estrutural**, não a concordância com o texto da IA:
 * - dispositivo: o intervalo achado coincide com o do gabarito (sobreposição de parágrafos ≥ LIMIAR_DISPOSITIVO);
 * - questões: cada questão esperada é achada por sobreposição de parágrafos (≥ LIMIAR_QUESTAO), cada achada vale uma só esperada;
 * - citações: a citação esperada aparece entre os fundamentos, mesmo escrita de outro jeito ("CDC, art. 14" = "art. 14 do CDC");
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

export function medirQuestoes(saida: SaidasDoCaso['questoes'], g: Gabarito): ResultadoQuestoes {
  const achadas = (saida?.questoes ?? []).map(q => new Set([...q.paragrafos, ...q.paragrafosConclusao]));
  const pares: Array<{ e: number; a: number; s: number }> = [];
  g.questoes.forEach((q, e) => achadas.forEach((p, a) => pares.push({ e, a, s: jaccard(new Set(q.paragrafos), p) })));
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

/** Chave que iguala escritas diferentes da mesma citação; o que não se reconhece vale pelo texto normalizado. */
export function chaveDaCitacao(texto: string): string {
  const r = reconhecerCitacao(texto, NORMAS);
  if (r && r.tipo !== 'fora') return JSON.stringify(r);
  return semAcento(texto).toLowerCase().replace(/(\d)\.(?=\d)/g, '$1').replace(/[^a-z0-9]+/g, ' ').trim();
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
