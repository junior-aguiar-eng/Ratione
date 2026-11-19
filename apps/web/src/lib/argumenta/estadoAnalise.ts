import type { DecisaoPreparada } from '@ratione/argumenta';
import type { Resultados } from '../caso/memoria';
import type { VerificacaoDaCitacao } from './verificarCitacoes';

export interface EstadoAnalise {
  enviada: DecisaoPreparada | null;
  resultados: Resultados;
  analiseId: string | null;
  encerrada: boolean;
  erro: string | null;
  erroDoArquivo: string | null;
  andamento: null;
  aba: 'geral';
  ativos: number[];
  textoAberto: boolean;
  rotulo: string;
  selos: Map<string, VerificacaoDaCitacao>;
  voltouParaQuestao: boolean;
}

/** Estado inicial limpo da tela de análise do Argumenta, usado ao iniciar uma nova análise. */
export function estadoInicialAnalise(): EstadoAnalise {
  return {
    enviada: null,
    resultados: {},
    analiseId: null,
    encerrada: false,
    erro: null,
    erroDoArquivo: null,
    andamento: null,
    aba: 'geral',
    ativos: [],
    textoAberto: false,
    rotulo: '',
    selos: new Map(),
    voltouParaQuestao: false
  };
}
