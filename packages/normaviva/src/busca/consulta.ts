/**
 * Interpreta a barra de pesquisa do NormaViva (F3-05): "art. 489 CPC", "art. 85, § 2º do Código de Processo Civil",
 * "Lei 14.133", "Lei nº 8.078/1990" e, fora disso, texto livre para a busca por assunto (Postgres FTS).
 */
import { NORMAS_CONHECIDAS, normaPorNomeNoInicio, normaPorSigla } from './apelidos';

const NOMES_EXATOS = new Set(NORMAS_CONHECIDAS.flatMap(n => n.nomes));
import { numeroComoNoParser } from './numero';

export type ConsultaInterpretada =
  | { tipo: 'dispositivo'; normaId: string | null; artigo: string; detalhe: string | null }
  | { tipo: 'norma'; normaId: string }
  | { tipo: 'texto'; termos: string };

const RE_CITACAO = /^\s*[Aa][Rr][Tt](?:igos?|s)?\.?\s*(\d[\d.]*)\s*(º|°|o(?=[\s,.;:]|$))?(?:\s*-\s*([A-Z]{1,2}))?\s*(?:,?\s*((?:[Cc]aput|,?\s*[IVXLCDM]+(?=\s*[,;)]|\s+\S)|[Pp]ar[áa]grafo [úu]nico|§\s*\d+\s*[ºo°]?(?:-[A-Z])?)(?:\s*,?\s*(?:[Ii]ncisos?\s+)?[IVXLCDM]+(?=[\s,;.)]|$))?)\s*)?(?:,?\s*(?:d[aoe]s?|n[aoe]s?)?\s*(.*))?$/;
const RE_LEI = /^\s*(lei(?:\s+complementar)?|decreto[- ]lei)\s*(?:n[ºo°.]*)?\s*(\d[\d.]*)\s*(?:[/,]\s*(?:de\s+)?(?:\d{1,2}[./]\d{1,2}[./])?(\d{4}|\d{2}))?\s*$/i;

/** Id da norma citada por tipo, número e ano ("Lei 8.078/90" → LEI-8078-1990); `undefined` se não houver uma só candidata no corpus. */
function normaPorNumero(l: RegExpMatchArray, normasConhecidas: string[]): string | undefined {
  const tipo = /complementar/i.test(l[1]) ? 'LC' : /decreto/i.test(l[1]) ? 'DL' : 'LEI';
  const numero = l[2].replace(/\./g, '');
  const ano = l[3];
  const candidatas = normasConhecidas.filter(id => {
    if (!id.startsWith(`${tipo}-${numero}-`)) return false;
    if (!ano) return true;
    return ano.length === 4 ? id.endsWith(`-${ano}`) : id.endsWith(`-19${ano}`) || id.endsWith(`-20${ano}`);
  });
  return candidatas.length === 1 ? candidatas[0] : undefined;
}

function normaDoResto(resto: string, normasConhecidas: string[]): string | null | undefined {
  const t = resto.trim();
  if (!t) return null;
  const lei = t.match(RE_LEI);
  if (lei) return normaPorNumero(lei, normasConhecidas);
  return normaPorNomeNoInicio(t) ?? normaPorSigla(t.split(/\s+/)[0]) ?? undefined;
}

export function interpretarConsulta(consulta: string, normasConhecidas: string[] = []): ConsultaInterpretada {
  const q = consulta.trim();
  const c = q.match(RE_CITACAO);
  if (c) {
    let detalhe = c[4] ?? '';
    let resto = c[5] ?? '';
    // "art. 50 CC": "CC" e "CDC" também são algarismos romanos; sem outra norma citada, vale como sigla e não como inciso
    if (/^,?\s*[IVXLCDM]+$/.test(detalhe) && !resto.trim() && normaPorSigla(detalhe.replace(/^,?\s*/, ''))) {
      resto = detalhe.replace(/^,?\s*/, '');
      detalhe = '';
    }
    const normaId = normaDoResto(resto, normasConhecidas);
    // "art. 489 xyz": sigla ou nome desconhecido não vira citação, vai para o texto livre
    if (normaId !== undefined) {
      return { tipo: 'dispositivo', normaId, artigo: numeroComoNoParser(c[1].replace(/\.$/, ''), !!c[2], c[3]), detalhe: detalhe ? detalhe.replace(/^,\s*/, '').replace(/\s+/g, ' ').trim() : null };
    }
  }
  const l = q.match(RE_LEI);
  if (l) {
    const normaId = normaPorNumero(l, normasConhecidas);
    if (normaId) return { tipo: 'norma', normaId };
  }
  // Só a sigla ou só o nome por extenso ("CPC", "Código de Processo Civil"); frase com assunto vai para o texto livre
  const porSigla = normaPorSigla(q);
  if (porSigla) return { tipo: 'norma', normaId: porSigla };
  const porNome = normaPorNomeNoInicio(q);
  if (porNome && normaPorNomeNoInicio(q.toLowerCase()) === porNome && NOMES_EXATOS.has(q.toLowerCase())) return { tipo: 'norma', normaId: porNome };
  return { tipo: 'texto', termos: q };
}
