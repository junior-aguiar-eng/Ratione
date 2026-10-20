import type { DestinoSalvo } from './historico';

export type EstadoSalvar = 'ocioso' | 'salvo' | 'limite';

/** Depois de salvar: "salvo" por 2 s; conta cheia (item não guardado) avisa por 5 s. */
export function estadoAposSalvar(destino: DestinoSalvo): { estado: EstadoSalvar; ms: number } {
  return destino === 'limite' ? { estado: 'limite', ms: 5000 } : { estado: 'salvo', ms: 2000 };
}

/** Texto do botão "Salvar em Meu espaço" em cada estado; `padrao` é o texto de repouso de cada tela. */
export function rotuloSalvar(estado: EstadoSalvar, padrao: string): string {
  if (estado === 'salvo') return 'Salvo em Meu espaço';
  if (estado === 'limite') return 'Limite de itens atingido';
  return padrao;
}
