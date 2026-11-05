import type { CasoEmMemoria } from './memoria';

/**
 * Ligação entre uma citação do Argumenta e as outras ferramentas. A URL leva só o número da questão ("Q2"), nunca texto da decisão:
 * o resto do caso fica na memória da aba (`memoria.ts`).
 */
export const PARAM_CASO = 'caso';

/** O identificador de questão que a análise gera: Q1 a Q10. */
const QUESTAO = /^Q(?:[1-9]|10)$/;

export type Ferramenta = 'normaviva' | 'tesemap';

/** `?caso=D`: a pessoa veio da decisão como um todo (não de uma questão), por exemplo para calcular o prazo de um recurso. */
const DA_DECISAO = 'D';

const ATO = /^[a-z0-9-]{2,40}$/;

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

/** O PrazoZero com o ato já escolhido e o caso junto (`?ato=apelacao&caso=D`). O ato é validado de novo quando o PrazoZero abre. */
export function urlDoPrazoDoCaso(atoId: string): string {
  const q = new URLSearchParams();
  if (ATO.test(atoId)) q.set('ato', atoId);
  q.set(PARAM_CASO, DA_DECISAO);
  return `/prazozero?${q.toString()}`;
}

/** A tela foi aberta a partir da decisão como um todo (`?caso=D`). */
export function veioDaDecisao(busca: string): boolean {
  return new URLSearchParams(busca).get(PARAM_CASO) === DA_DECISAO;
}

/** "Voltar à análise": o Argumenta restaura a análise da memória da aba; sem questão, ele não rola para nenhuma. */
export const URL_DE_VOLTA_A_DECISAO = '/argumenta';
