/**
 * Tela "Meu uso" (F8-04, docs/produto/PLANOS_E_COBRANCA.md §4): o que o cliente vê do próprio consumo. Lógica pura, sem rede: a tela lê
 * `uso_resumo()` e a tabela `analises` (a RLS entrega só as linhas do usuário) e usa estas funções para mostrar e exportar.
 */

import { temDadoPessoal } from '@ratione/argumenta';

export type TipoAnalise = 'rapida' | 'completa' | 'explicacao';
export type SituacaoAnalise = 'em_andamento' | 'concluida' | 'falhou' | 'cancelada';

/** Uma linha de `analises` como a tela a lê. */
export interface LinhaAnalise {
  id: string;
  tipo: TipoAnalise;
  rotulo: string | null;
  situacao: SituacaoAnalise;
  consumiu: boolean;
  falhas: number;
  criada_em: string;
  concluida_em: string | null;
}

/** Linha de `uso_resumo()`: o plano em vigor e, por tipo, quanto da cota já foi usado na janela. */
export interface LinhaResumo {
  plano: string;
  plano_nome: string;
  periodo: 'semana' | 'mes';
  inicio: string;
  fim: string;
  tipo: TipoAnalise;
  quantidade: number;
  usadas: number;
  restantes: number;
}

export const ROTULO_TIPO: Record<TipoAnalise, string> = {
  rapida: 'Análise rápida',
  completa: 'Análise completa',
  explicacao: 'Explicação de dispositivo'
};

/** Mesmo prazo do banco (`analise_iniciar`): reserva sem conclusão há mais de 15 minutos deixa de ser "em andamento". */
const MINUTOS_DE_RESERVA = 15;

export type EstadoExibido = 'concluida' | 'em_andamento' | 'interrompida' | 'falhou' | 'cancelada' | 'abandonada';

/**
 * O que mostrar para cada análise. `interrompida`: a 1ª etapa foi entregue (consumiu) e o cliente não terminou. `abandonada`: a análise
 * foi iniciada e nada foi entregue (não consumiu). O banco guarda só `em_andamento`; a tela decide pelo relógio, como o banco faz na cota.
 */
export function estadoExibido(a: Pick<LinhaAnalise, 'situacao' | 'consumiu' | 'criada_em'>, agora: Date = new Date()): EstadoExibido {
  if (a.situacao !== 'em_andamento') return a.situacao;
  const parada = agora.getTime() - new Date(a.criada_em).getTime() > MINUTOS_DE_RESERVA * 60_000;
  if (!parada) return 'em_andamento';
  return a.consumiu ? 'interrompida' : 'abandonada';
}

/** Texto do estado e se a análise gastou cota. Só o que foi entregue gasta; o resto não. */
export const ESTADO: Record<EstadoExibido, { rotulo: string; tom: 'ok' | 'warn' | 'danger' | 'neutral' | 'info'; consumiu: (a: Pick<LinhaAnalise, 'consumiu'>) => boolean; explicacao: string }> = {
  concluida: { rotulo: 'Concluída', tom: 'ok', consumiu: () => true, explicacao: 'Todas as etapas foram entregues.' },
  em_andamento: { rotulo: 'Em andamento', tom: 'info', consumiu: a => a.consumiu, explicacao: 'Ainda sendo gerada.' },
  interrompida: { rotulo: 'Interrompida', tom: 'warn', consumiu: () => true, explicacao: 'A 1ª etapa foi entregue e a análise não foi concluída; a cota foi gasta.' },
  falhou: { rotulo: 'Falhou', tom: 'danger', consumiu: () => false, explicacao: 'O sistema não conseguiu entregar. Sua cota não foi gasta.' },
  cancelada: { rotulo: 'Cancelada', tom: 'neutral', consumiu: () => false, explicacao: 'Não foi iniciada. Sua cota não foi gasta.' },
  abandonada: { rotulo: 'Não concluída', tom: 'neutral', consumiu: () => false, explicacao: 'Iniciada e nada foi entregue. Sua cota não foi gasta.' }
};

export const gastouCota = (a: Pick<LinhaAnalise, 'situacao' | 'consumiu' | 'criada_em'>, agora: Date = new Date()): boolean => ESTADO[estadoExibido(a, agora)].consumiu(a);

/** Quanto do histórico o plano mostra (PLANOS_E_COBRANCA.md §2.2): 30 dias no Gratuito, 12 meses nos pagos. */
export const diasDeHistorico = (plano: string): number => (plano === 'gratuito' ? 30 : 365);

/** Só os planos pagos exportam o histórico. */
export const podeExportar = (plano: string): boolean => plano !== 'gratuito';

/** O instante de corte do histórico visível (ISO), para a consulta ao banco. */
export const inicioDoHistorico = (plano: string, agora: Date = new Date()): string => new Date(agora.getTime() - diasDeHistorico(plano) * 24 * 3600 * 1000).toISOString();

/** "23/10/2026 14:05", no horário de Brasília. */
export function dataHora(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }).replace(',', '');
}

/** "26/10", no horário de Brasília. */
export function dataCurta(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' });
}

/** "R$ 29,00" a partir de centavos. */
export function precoEmReais(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/ /g, ' ');
}

export const MAX_ROTULO = 80;

/**
 * Nome que o cliente dá à análise. É texto livre guardado no banco, então o servidor confere: no máximo 80 caracteres, uma linha, e nada
 * que a detecção de dados pessoais do Argumenta reconheça (CPF, CNPJ, número de processo, e-mail, nome rotulado como "Autor:" etc.).
 * Um nome de pessoa solto no meio do texto não é detectável; por isso a tela pede para não colocar nomes das partes.
 */
export function rotuloDaAnalise(bruto: unknown): { ok: true; rotulo: string | null } | { ok: false; mensagem: string } {
  if (bruto === undefined || bruto === null || bruto === '') return { ok: true, rotulo: null };
  if (typeof bruto !== 'string') return { ok: false, mensagem: 'Nome da análise inválido.' };
  const limpo = bruto.replace(/\s+/g, ' ').trim();
  if (limpo === '') return { ok: true, rotulo: null };
  if (limpo.length > MAX_ROTULO) return { ok: false, mensagem: `O nome da análise pode ter até ${MAX_ROTULO} caracteres.` };
  if (temDadoPessoal(limpo)) {
    return { ok: false, mensagem: 'O nome da análise não pode ter CPF, CNPJ, número de processo, e-mail nem nomes de partes. Use um nome genérico.' };
  }
  return { ok: true, rotulo: limpo };
}

/** Linhas do resumo que o plano realmente oferece (cota maior que zero), na ordem em que a tela mostra. */
export function cotasDoPlano(resumo: readonly LinhaResumo[]): LinhaResumo[] {
  const ordem: TipoAnalise[] = ['rapida', 'completa', 'explicacao'];
  return resumo.filter(l => l.quantidade > 0).sort((a, b) => ordem.indexOf(a.tipo) - ordem.indexOf(b.tipo));
}

/**
 * Célula de CSV segura: aspas dobradas e entre aspas; texto que começa com `=`, `+`, `-`, `@`, tabulação ou retorno recebe um apóstrofo
 * antes (o Excel e o Planilhas tratariam como fórmula, e o nome da análise é digitado pelo cliente).
 */
export function celulaCsv(valor: string): string {
  const seguro = /^[=+\-@\t\r]/.test(valor) ? `'${valor}` : valor;
  return `"${seguro.replace(/"/g, '""')}"`;
}

/** CSV do histórico (separador `;`, que o Excel em português abre direto), com BOM para os acentos. Só metadados: nunca o texto da decisão. */
export function historicoEmCsv(linhas: readonly LinhaAnalise[], agora: Date = new Date()): string {
  const cabecalho = ['Data e hora (Brasília)', 'Tipo', 'Nome', 'Resultado', 'Gastou cota'].map(celulaCsv).join(';');
  const corpo = linhas.map(a => {
    const estado = estadoExibido(a, agora);
    return [dataHora(a.criada_em), ROTULO_TIPO[a.tipo], a.rotulo ?? '', ESTADO[estado].rotulo, gastouCota(a, agora) ? 'Sim' : 'Não'].map(celulaCsv).join(';');
  });
  return '﻿' + [cabecalho, ...corpo].join('\r\n') + '\r\n';
}

/** Nome do arquivo exportado, ex.: `ratione-uso-2026-10-23.csv` (a data de Brasília). */
export function nomeDoCsv(agora: Date = new Date()): string {
  const [d, m, a] = agora.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Sao_Paulo' }).split('/');
  return `ratione-uso-${a}-${m}-${d}.csv`;
}
