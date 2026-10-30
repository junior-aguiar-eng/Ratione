/**
 * Agenda de prazos: os avisos por e-mail ainda por vir (F2-10), agrupados pela proximidade do vencimento. Lógica pura, para testar sem tela.
 * Só entram os prazos que o usuário pediu para ser avisado; o resto fica na biblioteca de "Meu espaço".
 */
import { diferencaDiasIso } from '@ratione/prazozero';
import type { Lembrete } from './lembretes';

export interface ItemDaAgenda {
  lembrete: Lembrete;
  /** Dias corridos de hoje até o vencimento (0 = hoje). */
  dias: number;
  quando: string;
}

export type IdDoGrupo = 'imediato' | 'semana' | 'mes' | 'depois';

export interface GrupoDaAgenda {
  id: IdDoGrupo;
  titulo: string;
  itens: ItemDaAgenda[];
}

/** "hoje", "amanhã" ou "em N dias". */
export function rotuloDeProximidade(dias: number): string {
  if (dias <= 0) return 'hoje';
  if (dias === 1) return 'amanhã';
  return `em ${dias} dias`;
}

function grupoDoPrazo(dias: number): IdDoGrupo {
  if (dias <= 1) return 'imediato';
  if (dias <= 7) return 'semana';
  if (dias <= 30) return 'mes';
  return 'depois';
}

const TITULOS: Record<IdDoGrupo, string> = {
  imediato: 'Hoje e amanhã',
  semana: 'Nos próximos 7 dias',
  mes: 'Nos próximos 30 dias',
  depois: 'Mais adiante'
};

const ORDEM: IdDoGrupo[] = ['imediato', 'semana', 'mes', 'depois'];

/** Os prazos de hoje em diante, do mais próximo ao mais distante, em grupos; grupo vazio não aparece. */
export function montarAgenda(lembretes: readonly Lembrete[], hoje: string): GrupoDaAgenda[] {
  const itens = lembretes
    .filter(l => l.vencimento >= hoje)
    .map(l => {
      const dias = diferencaDiasIso(hoje, l.vencimento);
      return { lembrete: l, dias, quando: rotuloDeProximidade(dias) };
    })
    .sort((a, b) => a.lembrete.vencimento.localeCompare(b.lembrete.vencimento) || a.lembrete.titulo.localeCompare(b.lembrete.titulo));
  return ORDEM.map(id => ({ id, titulo: TITULOS[id], itens: itens.filter(i => grupoDoPrazo(i.dias) === id) })).filter(g => g.itens.length > 0);
}

/** Os prazos da agenda como eventos de calendário: só título, data e tribunal (nunca dados do processo). */
export function eventosDaAgenda(lembretes: readonly Lembrete[], hoje: string): Array<{ data: string; titulo: string; descricao: string }> {
  return montarAgenda(lembretes, hoje)
    .flatMap(g => g.itens)
    .map(({ lembrete: l }) => ({
      data: l.vencimento,
      titulo: l.titulo,
      descricao: `${l.tribunal ? `${l.tribunal}. ` : ''}Prazo calculado pelo Ratione (PrazoZero). Confira o calendário do tribunal.`
    }));
}
