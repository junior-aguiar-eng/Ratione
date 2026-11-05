import type { BadgeTom } from '@/components/ui/badge';
import type { SaidaEstrutura, SaidaFundamentos, SaidaQuestoes } from '../ia/tarefas/argumenta';

/** Como a tela chama cada categoria, resultado e tipo de fundamento. Um só lugar, para a análise, o mapa e a faixa do caso não divergirem. */
type Questao = SaidaQuestoes['questoes'][number];

export const CATEGORIA: Record<Questao['categoria'], string> = {
  preliminar: 'Preliminar',
  prejudicial: 'Prejudicial',
  merito: 'Mérito',
  acessoria: 'Acessória'
};

export const RESULTADO: Record<Questao['resultado'], { rotulo: string; tom: BadgeTom }> = {
  acolhida: { rotulo: 'Acolhida', tom: 'ok' },
  rejeitada: { rotulo: 'Rejeitada', tom: 'danger' },
  parcialmente_acolhida: { rotulo: 'Parcialmente acolhida', tom: 'warn' },
  nao_conhecida: { rotulo: 'Não conhecida', tom: 'neutral' },
  prejudicada: { rotulo: 'Prejudicada', tom: 'neutral' },
  pendente: { rotulo: 'Pedido ainda não decidido', tom: 'neutral' }
};

export const FUNDAMENTO: Record<SaidaFundamentos['fundamentos'][number]['tipo'], { rotulo: string; tom: BadgeTom }> = {
  fato: { rotulo: 'Fato', tom: 'ok' },
  prova: { rotulo: 'Prova', tom: 'ok' },
  norma: { rotulo: 'Norma', tom: 'info' },
  precedente: { rotulo: 'Precedente', tom: 'rel' },
  doutrina: { rotulo: 'Doutrina', tom: 'neutral' },
  argumento: { rotulo: 'Argumento', tom: 'brand' }
};

export const TIPO_DECISAO: Record<SaidaEstrutura['tipo'], string> = {
  sentenca: 'Sentença',
  acordao: 'Acórdão',
  decisao_monocratica: 'Decisão monocrática',
  decisao_interlocutoria: 'Decisão interlocutória',
  outro: 'Decisão'
};
