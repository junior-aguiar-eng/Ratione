/**
 * F5-03: mapa de argumentos e teses, montado por CÓDIGO a partir do que as etapas 2 e 4 já extraíram (questões e fundamentos). Não chama o
 * modelo, não custa nada a mais e não emite juízo de valor: só reorganiza, na ordem do raciocínio (fato → norma → doutrina → precedente →
 * argumento → conclusão), o que o texto da decisão diz. Cada passo mantém os parágrafos de origem e a citação como vieram.
 */
import type { SaidaFundamentos, SaidaQuestoes } from '../ia/tarefas/argumenta';

type Questao = SaidaQuestoes['questoes'][number];
type Fundamento = SaidaFundamentos['fundamentos'][number];
export type TipoDeFundamento = Fundamento['tipo'];

/** As camadas do mapa, na ordem em que o raciocínio é lido. */
export const CAMADAS = [
  { id: 'fatos', rotulo: 'Fatos e provas', tipos: ['fato', 'prova'] },
  { id: 'normas', rotulo: 'Normas', tipos: ['norma'] },
  { id: 'doutrina', rotulo: 'Doutrina', tipos: ['doutrina'] },
  { id: 'precedentes', rotulo: 'Precedentes', tipos: ['precedente'] },
  { id: 'raciocinio', rotulo: 'Raciocínio da decisão', tipos: ['argumento'] }
] as const satisfies ReadonlyArray<{ id: string; rotulo: string; tipos: readonly TipoDeFundamento[] }>;

export type IdDaCamada = (typeof CAMADAS)[number]['id'];

export interface PassoDoMapa {
  tipo: TipoDeFundamento;
  descricao: string;
  citacao: string;
  paragrafos: number[];
}

export interface CamadaDaQuestao {
  id: IdDaCamada;
  rotulo: string;
  passos: PassoDoMapa[];
}

export interface MapaDaQuestao {
  questaoId: string;
  categoria: Questao['categoria'];
  resultado: Questao['resultado'];
  enunciado: string;
  /** A tese da questão: a conclusão a que a decisão chegou. */
  conclusao: string;
  paragrafosConclusao: number[];
  /** Só as camadas que têm passo; a ordem é a do raciocínio. */
  camadas: CamadaDaQuestao[];
  /** Quantos fundamentos foram identificados (0: a questão aparece sem camadas). */
  totalDePassos: number;
}

/** Uma norma, precedente ou doutrina citada, e em quais questões aparece. */
export interface AutoridadeCitada {
  citacao: string;
  tipo: 'norma' | 'precedente' | 'doutrina';
  /** Posição (a partir de 1) das questões em que a citação aparece, em ordem. */
  questoes: number[];
}

export interface MapaDaDecisao {
  questoes: MapaDaQuestao[];
  autoridades: AutoridadeCitada[];
  totais: Record<TipoDeFundamento, number>;
}

const TIPOS_DE_AUTORIDADE = ['norma', 'precedente', 'doutrina'] as const;
const eAutoridade = (t: TipoDeFundamento): t is AutoridadeCitada['tipo'] => (TIPOS_DE_AUTORIDADE as readonly string[]).includes(t);

/** A citação sem espaços de sobra, para juntar a mesma autoridade escrita igual. */
const chave = (c: string) => c.replace(/\s+/g, ' ').trim().toLowerCase();

export function montarMapa(questoes: SaidaQuestoes, fundamentos: SaidaFundamentos | undefined): MapaDaDecisao {
  const todos = fundamentos?.fundamentos ?? [];
  const totais: Record<TipoDeFundamento, number> = { fato: 0, prova: 0, norma: 0, precedente: 0, doutrina: 0, argumento: 0 };
  const autoridades = new Map<string, AutoridadeCitada>();

  const mapa = questoes.questoes.map((q, posicao): MapaDaQuestao => {
    const desta = todos.filter(f => f.questao === q.id);
    const camadas: CamadaDaQuestao[] = [];
    for (const c of CAMADAS) {
      const passos = desta
        .filter(f => (c.tipos as readonly TipoDeFundamento[]).includes(f.tipo))
        .map((f): PassoDoMapa => ({ tipo: f.tipo, descricao: f.descricao, citacao: f.citacao, paragrafos: f.paragrafos }));
      if (passos.length > 0) camadas.push({ id: c.id, rotulo: c.rotulo, passos });
    }
    for (const f of desta) {
      totais[f.tipo]++;
      const texto = f.citacao.trim();
      if (!texto || !eAutoridade(f.tipo)) continue;
      const k = `${f.tipo}|${chave(texto)}`;
      const existente = autoridades.get(k) ?? { citacao: texto, tipo: f.tipo, questoes: [] };
      if (!existente.questoes.includes(posicao + 1)) existente.questoes.push(posicao + 1);
      autoridades.set(k, existente);
    }
    return {
      questaoId: q.id,
      categoria: q.categoria,
      resultado: q.resultado,
      enunciado: q.enunciado,
      conclusao: q.conclusao,
      paragrafosConclusao: q.paragrafosConclusao,
      camadas,
      totalDePassos: desta.length
    };
  });

  // As autoridades mais usadas primeiro; entre iguais, a ordem em que apareceram
  const ordenadas = [...autoridades.values()]
    .map((a, i) => ({ a, i }))
    .sort((x, y) => y.a.questoes.length - x.a.questoes.length || x.i - y.i)
    .map(({ a }) => a);

  return { questoes: mapa, autoridades: ordenadas, totais };
}
