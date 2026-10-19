/**
 * Interpreta a barra de pesquisa do NormaViva (F3-05): "art. 489 CPC", "art. 85, § 2º do Código de Processo Civil",
 * "Lei 14.133", "Lei nº 8.078/1990" e, fora disso, texto livre para a busca por assunto (Postgres FTS).
 */
import { NORMAS_CONHECIDAS, normaPorNomeNoInicio, normaPorSigla } from './apelidos';

const NOMES_EXATOS = new Set(NORMAS_CONHECIDAS.flatMap(n => n.nomes));
import { numeroComoNoParser } from './referencias';

export type ConsultaInterpretada =
  | { tipo: 'dispositivo'; normaId: string | null; artigo: string; detalhe: string | null }
  | { tipo: 'norma'; normaId: string }
  | { tipo: 'texto'; termos: string };

const RE_CITACAO = /^\s*[Aa][Rr][Tt][Ss]?\.?\s*(\d[\d.]*)\s*(º|°|o(?=[\s,.;:]|$))?(?:\s*-\s*([A-Z]{1,2}))?\s*(?:,?\s*((?:[Cc]aput|[Pp]ar[áa]grafo [úu]nico|§\s*\d+\s*[ºo°]?(?:-[A-Z])?)(?:\s*,?\s*(?:[Ii]ncisos?\s+)?[IVXLCDM]+(?=[\s,;.)]|$))?)\s*)?(?:,?\s*(?:d[aoe]s?|n[aoe]s?)?\s*(.*))?$/;
const RE_LEI = /^\s*(lei(?:\s+complementar)?|decreto[- ]lei)\s*(?:n[ºo°.]*)?\s*(\d[\d.]*)\s*(?:[/,]\s*(?:de\s+)?(?:\d{1,2}[./]\d{1,2}[./])?(\d{4}))?\s*$/i;

function normaDoResto(resto: string): string | null | undefined {
  const t = resto.trim();
  if (!t) return null;
  return normaPorNomeNoInicio(t) ?? normaPorSigla(t.split(/\s+/)[0]) ?? undefined;
}

export function interpretarConsulta(consulta: string, normasConhecidas: string[] = []): ConsultaInterpretada {
  const q = consulta.trim();
  const c = q.match(RE_CITACAO);
  if (c) {
    const normaId = normaDoResto(c[5] ?? '');
    // "art. 489 xyz": sigla ou nome desconhecido não vira citação, vai para o texto livre
    if (normaId !== undefined) {
      return { tipo: 'dispositivo', normaId, artigo: numeroComoNoParser(c[1].replace(/\.$/, ''), !!c[2], c[3]), detalhe: c[4] ? c[4].replace(/\s+/g, ' ').trim() : null };
    }
  }
  const l = q.match(RE_LEI);
  if (l) {
    const tipo = /complementar/i.test(l[1]) ? 'LC' : /decreto/i.test(l[1]) ? 'DL' : 'LEI';
    const numero = l[2].replace(/\./g, '');
    const candidatas = normasConhecidas.filter(id => id.startsWith(`${tipo}-${numero}-`) && (!l[3] || id.endsWith(`-${l[3]}`)));
    if (candidatas.length === 1) return { tipo: 'norma', normaId: candidatas[0] };
  }
  // Só a sigla ou só o nome por extenso ("CPC", "Código de Processo Civil"); frase com assunto vai para o texto livre
  const porSigla = normaPorSigla(q);
  if (porSigla) return { tipo: 'norma', normaId: porSigla };
  const porNome = normaPorNomeNoInicio(q);
  if (porNome && normaPorNomeNoInicio(q.toLowerCase()) === porNome && NOMES_EXATOS.has(q.toLowerCase())) return { tipo: 'norma', normaId: porNome };
  return { tipo: 'texto', termos: q };
}
