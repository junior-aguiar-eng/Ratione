import type { CasoEmMemoria } from './memoria';

/**
 * Ligação entre uma citação do Argumenta e as outras ferramentas. A URL leva só o número da questão ("Q2"), nunca texto da decisão:
 * o resto do caso fica na memória da aba (`memoria.ts`).
 */
export const PARAM_CASO = 'caso';

/** O identificador de questão que a análise gera: Q1 a Q10. */
const QUESTAO = /^Q(?:[1-9]|10)$/;

export type Ferramenta = 'normaviva' | 'tesemap';

/** Acrescenta `?caso=Q2` ao endereço da citação; endereço que já tem parâmetros os mantém. */
export function comCaso(href: string, questaoId: string | null | undefined): string {
  if (!questaoId || !QUESTAO.test(questaoId)) return href;
  const [caminho, busca = ''] = href.split('?');
  const q = new URLSearchParams(busca);
  q.set(PARAM_CASO, questaoId);
  return `${caminho}?${q.toString()}`;
}

/** A questão do caso na URL (`?caso=Q2`), ou `null` se ausente ou fora do formato. */
export function lerQuestaoDoCaso(busca: string): string | null {
  const v = new URLSearchParams(busca).get(PARAM_CASO);
  return v && QUESTAO.test(v) ? v : null;
}

/** Para onde "Voltar à análise" leva: o Argumenta, na questão de origem. */
export function urlDeVoltaAoCaso(questaoId: string): string {
  return `/argumenta?${PARAM_CASO}=${questaoId}`;
}

/** Qual dispositivo (NormaViva) ou nó (TeseMap) um endereço de citação abre. */
export function destinoDoEndereco(href: string): { ferramenta: Ferramenta; id: string } | null {
  const [caminho, busca = ''] = href.split('?');
  const q = new URLSearchParams(busca);
  if (caminho === '/normaviva' && q.get('d')) return { ferramenta: 'normaviva', id: q.get('d')! };
  if (caminho === '/tesemap' && q.get('n')) return { ferramenta: 'tesemap', id: q.get('n')! };
  return null;
}

/** Os fundamentos da questão cuja citação abre exatamente este dispositivo ou nó. */
export function fundamentosQueApontamPara(caso: Pick<CasoEmMemoria, 'resultados' | 'selos'>, questaoId: string, ferramenta: Ferramenta, destinoId: string | null) {
  if (!destinoId) return [];
  return (caso.resultados.fundamentos?.fundamentos ?? []).filter(f => {
    if (f.questao !== questaoId) return false;
    const selo = caso.selos.get(f.citacao.trim());
    return !!selo?.links.some(l => {
      const d = destinoDoEndereco(l.href);
      return d?.ferramenta === ferramenta && d.id === destinoId;
    });
  });
}
