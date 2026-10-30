/**
 * F5-05: roda as três etapas do Argumenta sobre um caso, com as mesmas tarefas do produto (instruções, esquema, validação e conferência),
 * mas sem banco, cota nem conta: a chamada ao modelo é injetada (em produção do avaliador, `criarChamadaAoModelo`; nos testes, uma simulada).
 * Uma etapa só roda se a anterior gerou saída válida; a que não roda não entra na taxa de descartadas.
 */
import { paragrafosValidos } from '@ratione/argumenta';
import type { PedidoModelo, QualquerTarefa, ResultadoModelo, Uso } from '../ia/contrato';
import { custoUsd } from '../ia/politica';
import { argumentaEstrutura, argumentaFundamentos, argumentaQuestoes, type SaidaEstrutura, type SaidaFundamentos, type SaidaQuestoes } from '../ia/tarefas/argumenta';
import { paragrafosDoCaso, type Caso } from './caso';

export type ChamarModelo = (p: PedidoModelo) => Promise<ResultadoModelo>;

const ANALISE_DE_AVALIACAO = '00000000-0000-4000-8000-000000000000';

export type EstadoDaEtapa = 'ok' | 'descartada' | 'recusa' | 'cortada' | 'falha' | 'nao_rodou';

export interface Etapa<T> {
  estado: EstadoDaEtapa;
  saida: T | null;
  /** Por que não chegou a uma saída válida (formato, conferência, mensagem longa, falha da API). */
  motivo?: string;
  uso?: Uso;
  custoUsd: number;
  /** Tempo da chamada ao modelo, em ms (medido na rodada; base para decidir o tempo máximo por chamada). Ausente se a etapa não rodou. */
  duracaoMs?: number;
}

export interface ResultadoDoCaso {
  casoId: string;
  paragrafos: number;
  /** Caso que nem chega ao modelo (decisão acima dos limites, dado pessoal ainda detectável): fica fora das taxas. */
  naoEnviavel?: string;
  estrutura: Etapa<SaidaEstrutura>;
  questoes: Etapa<SaidaQuestoes>;
  fundamentos: Etapa<SaidaFundamentos>;
}

const ENTRADA_RECUSADA = 'entrada recusada pela tarefa';
const vazia = <T>(motivo?: string): Etapa<T> => ({ estado: 'nao_rodou', saida: null, motivo, custoUsd: 0 });

/** Roda uma tarefa do catálogo sobre a entrada, sem cota nem registro, e mede quanto a etapa levou. */
async function etapa<T>(t: QualquerTarefa, entrada: unknown, chamar: ChamarModelo): Promise<Etapa<T>> {
  const inicio = Date.now();
  const e = await etapaSemTempo<T>(t, entrada, chamar);
  return e.estado === 'nao_rodou' ? e : { ...e, duracaoMs: Date.now() - inicio };
}

async function etapaSemTempo<T>(t: QualquerTarefa, entrada: unknown, chamar: ChamarModelo): Promise<Etapa<T>> {
  const valida = t.validarEntrada(entrada);
  if (valida === null) return vazia<T>(ENTRADA_RECUSADA);
  const contexto = await t.montarContexto(valida, { lerDispositivo: async () => null });
  if (contexto === null) return vazia<T>('sem contexto');
  const mensagem = t.mensagem(contexto);
  if (mensagem.length > t.maxCaracteresMensagem) return vazia<T>('mensagem acima do limite da tarefa');

  const r = await chamar({ modelo: t.modelo, esforco: t.esforco, maxTokens: t.maxTokensSaida, instrucoes: t.instrucoes, mensagem, esquema: t.esquemaSaida });
  if (r.tipo === 'falha') return { estado: 'falha', saida: null, motivo: r.mensagem, custoUsd: 0 };
  const custo = custoUsd(t.modelo, r.uso);
  if (r.tipo !== 'ok') return { estado: r.tipo, saida: null, uso: r.uso, custoUsd: custo };

  let json: unknown;
  try {
    json = JSON.parse(r.json);
  } catch {
    json = undefined;
  }
  const saida = t.saida.safeParse(json);
  // Qual regra do esquema recusou a saída vai no motivo: o relatório diz por que a etapa foi descartada, não só que foi.
  const erro = saida.success ? null : saida.error.issues.slice(0, 3).map(i => `${i.path.join('.') || 'raiz'}: ${i.message}`).join('; ');
  const motivo = erro !== null ? `fora do formato (${erro})` : (t.conferirSaida?.(saida.data, contexto) ?? null);
  if (!saida.success || motivo) return { estado: 'descartada', saida: null, motivo: motivo ?? 'fora do formato', uso: r.uso, custoUsd: custo };
  return { estado: 'ok', saida: saida.data as T, uso: r.uso, custoUsd: custo };
}

export async function executarCaso(caso: Pick<Caso, 'id' | 'texto'>, chamar: ChamarModelo): Promise<ResultadoDoCaso> {
  const paragrafos = paragrafosDoCaso(caso);
  const base = { casoId: caso.id, paragrafos: paragrafos.length };
  const semEtapas = { estrutura: vazia<SaidaEstrutura>(), questoes: vazia<SaidaQuestoes>(), fundamentos: vazia<SaidaFundamentos>() };
  if (!paragrafosValidos(paragrafos)) return { ...base, ...semEtapas, naoEnviavel: 'decisão acima dos limites de tamanho' };

  const entrada = { analiseId: ANALISE_DE_AVALIACAO, paragrafos };
  const estrutura = await etapa<SaidaEstrutura>(argumentaEstrutura, entrada, chamar);
  if (estrutura.motivo === ENTRADA_RECUSADA) {
    return { ...base, ...semEtapas, naoEnviavel: 'a decisão ainda tem dado pessoal detectável (acrescente os nomes à pseudonimização)' };
  }
  const questoes = await etapa<SaidaQuestoes>(argumentaQuestoes, entrada, chamar);
  if (!questoes.saida) return { ...base, estrutura, questoes, fundamentos: vazia<SaidaFundamentos>('sem questões válidas') };

  const resumo = questoes.saida.questoes.map(q => ({ id: q.id, enunciado: q.enunciado, conclusao: q.conclusao }));
  const fundamentos = await etapa<SaidaFundamentos>(argumentaFundamentos, { ...entrada, questoes: resumo }, chamar);
  return { ...base, estrutura, questoes, fundamentos };
}

/** Taxa de descartadas: etapas que chegaram ao modelo e não deram saída válida, sobre as que chegaram. */
export function contarChamadas(resultados: readonly ResultadoDoCaso[]): { chamadas: number; descartadas: number; custoUsd: number } {
  let chamadas = 0;
  let descartadas = 0;
  let custo = 0;
  for (const r of resultados) {
    for (const e of [r.estrutura, r.questoes, r.fundamentos]) {
      custo += e.custoUsd;
      if (e.estado === 'nao_rodou') continue;
      chamadas++;
      if (e.estado !== 'ok') descartadas++;
    }
  }
  return { chamadas, descartadas, custoUsd: Math.round(custo * 1e6) / 1e6 };
}
