import { useSyncExternalStore } from 'react';
import type { DecisaoPreparada } from '@ratione/argumenta';
import type { SaidaEstrutura, SaidaFundamentos, SaidaQuestoes } from '../ia/tarefas/argumenta';
import type { VerificacaoDaCitacao } from '../argumenta/verificarCitacoes';

/**
 * O caso em andamento: a análise que a pessoa está lendo no Argumenta, guardada **só na memória desta aba do navegador**.
 * Serve para as outras ferramentas (NormaViva, TeseMap) mostrarem a relação com o caso e para a pessoa voltar à análise
 * depois de abrir uma citação. Não vai para `localStorage`, `sessionStorage`, cookie, URL nem servidor: recarregar ou fechar a aba
 * apaga tudo, como a tela de análise já prometia. A navegação dentro do site não recarrega a página, e por isso a memória sobrevive a ela.
 */
export interface Resultados {
  estrutura?: SaidaEstrutura;
  questoes?: SaidaQuestoes;
  fundamentos?: SaidaFundamentos;
}

export interface CasoEmMemoria {
  /** Parágrafos já pseudonimizados e a tabela de troca (que nunca sai do navegador). */
  enviada: DecisaoPreparada;
  resultados: Resultados;
  analiseId: string | null;
  rotulo: string;
  /** Selo e links de cada citação, pela citação sem espaços nas pontas. */
  selos: Map<string, VerificacaoDaCitacao>;
  aba: string;
}

let atual: CasoEmMemoria | null = null;
const ouvintes = new Set<() => void>();

const avisar = () => ouvintes.forEach(f => f());

export function lerCaso(): CasoEmMemoria | null {
  return atual;
}

export function guardarCaso(caso: CasoEmMemoria): void {
  atual = caso;
  avisar();
}

export function limparCaso(): void {
  if (atual === null) return;
  atual = null;
  avisar();
}

export function assinarCaso(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

/** O caso em andamento, atualizado quando muda; `null` no servidor e quando não há análise aberta nesta aba. */
export function useCaso(): CasoEmMemoria | null {
  return useSyncExternalStore(assinarCaso, lerCaso, () => null);
}
