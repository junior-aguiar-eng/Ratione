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

/** Quantas relações com o caso a tela pede por análise: um limite de uso da tela, além da cota do plano. */
export const MAX_RELACOES_POR_CASO = 10;
/** As relações já geradas neste caso, pela chave `questão|ferramenta|destino`, para não pedir (nem gastar) de novo ao voltar a um item. */
const relacoes = new Map<string, unknown>();

const avisar = () => ouvintes.forEach(f => f());

export function lerCaso(): CasoEmMemoria | null {
  return atual;
}

export function guardarCaso(caso: CasoEmMemoria): void {
  // Outra análise: as relações da anterior não valem mais
  if (atual && atual.enviada !== caso.enviada) relacoes.clear();
  atual = caso;
  avisar();
}

export function limparCaso(): void {
  relacoes.clear();
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

export const chaveDaRelacao = (questaoId: string, ferramenta: string, destinoId: string) => `${questaoId}|${ferramenta}|${destinoId}`;
export const relacaoGuardada = <T,>(chave: string): T | undefined => relacoes.get(chave) as T | undefined;
export const guardarRelacao = (chave: string, resultado: unknown): void => void relacoes.set(chave, resultado);
export const relacoesFeitas = (): number => relacoes.size;
