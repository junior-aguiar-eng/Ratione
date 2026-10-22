/**
 * Súmulas do STJ (F4-01). O portal de Dados Abertos do STJ não tem as súmulas, e a pesquisa de súmulas do SCON (`scon.stj.jus.br/SCON/sumstj/`)
 * bloqueia o acesso automático (403); o PDF público `docs_internet/VerbetesSTJ.pdf` parou em 22/11/2024, na Súmula 673. Por isso a lista entra
 * curada, como as súmulas do STF: o responsável imprime em PDF a pesquisa do SCON, e `pnpm importar:stj-sumulas` extrai o texto (`pdftotext -layout`),
 * valida e guarda o PDF e o texto em `corpus/stj/`.
 *
 * Formato do texto: cada súmula abre com "SÚMULA 479" (às vezes com o marcador "q" do PDF e a situação: "(SÚMULA CANCELADA)", "(SÚMULA ALTERADA)",
 * "(SÚMULA REVOGADA)"), seguida do enunciado e do parêntese com o órgão, o julgamento e a publicação ("(SEGUNDA SEÇÃO, julgado em 27/06/2012, DJe
 * 01/08/2012)"). Depois do parêntese pode vir a nota do STJ ("SÚMULA CANCELADA: A Segunda Seção, na sessão de ..."). O rodapé de cada página
 * ("scon.stj.jus.br/SCON/sumstj/  12") é descartado.
 */
import { dataBrParaIso as dataIso, juntarEspacos as espacos } from '@ratione/core';
import { sumulasCitadasNoTexto } from '../stf/sumulas';

export type SituacaoSumulaStj = 'aprovada' | 'alterada' | 'cancelada' | 'revogada';

export interface SumulaStj {
  /** `STJ-SUMULA-479`. */
  id: string;
  numero: number;
  situacao: SituacaoSumulaStj;
  enunciado: string;
  orgaoJulgador: string;
  /** AAAA-MM-DD; nulo nas súmulas antigas em que o STJ registra só a publicação. */
  dataJulgamento: string | null;
  /** "DJe 01/08/2012" ou "REPDJ 23/10/2001, p. 215, DJ 24/09/2001, p. 363", como o STJ escreve. */
  publicacao: string;
  /** O que vem depois do parêntese: a nota de cancelamento, revogação ou alteração, quando houver. */
  nota: string | null;
  /** Súmulas do STJ que o enunciado ou a nota citam, como ids; sem a própria. */
  sumulasCitadas: string[];
  /** Temas repetitivos do STJ que o enunciado ou a nota citam ("ao julgar o REsp 2.001.973/RS (tema repetitivo 1194)"), como números. */
  temasRepetitivos: number[];
}

export const idDaSumulaStj = (numero: number) => `STJ-SUMULA-${numero}`;


/** "tema repetitivo 1194", "Tema Repetitivo n. 1.076": números, sem repetir. */
export function temasRepetitivosNoTexto(texto: string): number[] {
  const n = new Set<number>();
  for (const m of texto.matchAll(/\btemas?\s+repetitivos?\s*(?:n[ºo°.]*\s*)?(\d{1,4}(?:\.\d{3})?)\b/gi)) n.add(Number(m[1].replace('.', '')));
  return [...n].sort((a, b) => a - b);
}


const CABECALHO = /^\s*(?:q\s+)?S[ÚU]MULA (\d+)(?:\s*\(S[ÚU]MULA (CANCELADA|ALTERADA|REVOGADA)\))?\s*(?:VEJA MAIS)?\s*$/;
const RODAPE = /^\s*scon\.stj\.jus\.br\/SCON\/sumstj\/\s+\d+\s*$/;
// "(SÚMULA 221, SEGUNDA SEÇÃO, julgado em 12/05/1999, DJ 26/05/1999, p. 68)", "(TERCEIRA SEÇÃO, julgado em 11/12/2024, DJe de 17/12/2024)",
// no DJEN (Diário de Justiça Eletrônico Nacional, desde 2025: "julgado em 10/9/2025, DJEN de 2/12/2025"),
// com a republicação antes ("julgado em 24/03/2010, REPDJe 20/05/2010, DJe 13/05/2010") ou, nas antigas, sem o julgamento ("CORTE ESPECIAL, DJ 15/03/1999, p. 326")
const PARENTESE = /\((?:S[ÚU]MULA \d+,\s*)?([^(),]+),\s*(?:julgad[oa] em (\d{1,2}\/\d{1,2}\/\d{4}),\s*)?((?:REP)?DJ(?:EN|e)?\s*(?:de\s*)?\d{1,2}\/\d{1,2}\/\d{4}[^()]*)\)/;

/**
 * Lê o texto extraído do PDF. Recusa: arquivo sem súmula, número repetido, lacuna na numeração (de 1 até a maior), súmula sem enunciado e
 * súmula sem o parêntese de julgamento e publicação. Devolve em ordem crescente.
 */
export function lerSumulasStj(texto: string): SumulaStj[] {
  const linhas = texto.replace(/\f/g, '\n').split(/\r?\n/).filter(l => !RODAPE.test(l));
  const blocos: { numero: number; marcador: string | undefined; corpo: string[] }[] = [];
  for (const l of linhas) {
    const m = l.match(CABECALHO);
    if (m) blocos.push({ numero: Number(m[1]), marcador: m[2], corpo: [] });
    else if (blocos.length > 0) blocos[blocos.length - 1].corpo.push(l);
  }
  if (blocos.length === 0) throw new Error('Súmulas do STJ: nenhuma súmula no texto (o PDF é a pesquisa de súmulas do SCON?)');
  const vistos = new Set<number>();
  const sumulas = blocos.map(b => {
    if (vistos.has(b.numero)) throw new Error(`Súmulas do STJ: número ${b.numero} repetido`);
    vistos.add(b.numero);
    const corpo = espacos(b.corpo.join(' '));
    const p = corpo.match(PARENTESE);
    if (!p || p.index === undefined) throw new Error(`Súmulas do STJ: a Súmula ${b.numero} não tem o parêntese de julgamento e publicação`);
    const enunciado = corpo.slice(0, p.index).trim();
    if (!enunciado) throw new Error(`Súmulas do STJ: a Súmula ${b.numero} não tem enunciado`);
    // Trava: se o parêntese reconhecido foi o da redação anterior, o enunciado arrastaria a nota do STJ junto
    if (/REDA[ÇC][ÃA]O ANTERIOR|S[ÚU]MULA (?:CANCELADA|REVISADA|ALTERADA|REVOGADA):/.test(enunciado)) {
      throw new Error(`Súmulas do STJ: o enunciado da Súmula ${b.numero} contém a nota do STJ (formato da publicação não reconhecido?)`);
    }
    const nota = corpo.slice(p.index + p[0].length).replace(/^[.\s]+$/, '').trim() || null;
    const id = idDaSumulaStj(b.numero);
    const citado = `${enunciado} ${nota ?? ''}`;
    return {
      id,
      numero: b.numero,
      situacao: (b.marcador?.toLowerCase() ?? 'aprovada') as SituacaoSumulaStj,
      enunciado,
      orgaoJulgador: espacos(p[1]),
      dataJulgamento: p[2] ? dataIso(p[2]) : null,
      publicacao: espacos(p[3]),
      nota,
      // Súmula "do STF" citada no texto do STJ não é súmula do STJ: só entram as citações sem tribunal ou "do STJ"
      sumulasCitadas: sumulasCitadasNoTexto(citado.replace(/S[úu]mulas?\s+(?:Vinculantes?\s+)?n?\.?\s*\d+\s*(?:\/|do\s+)STF/gi, ''))
        .filter(x => /^STF-SUMULA-/.test(x))
        .map(x => idDaSumulaStj(Number(x.replace('STF-SUMULA-', ''))))
        .filter(x => x !== id),
      temasRepetitivos: temasRepetitivosNoTexto(citado)
    } satisfies SumulaStj;
  });
  const maior = Math.max(...vistos);
  const faltam = Array.from({ length: maior }, (_, i) => i + 1).filter(n => !vistos.has(n));
  if (faltam.length > 0) throw new Error(`Súmulas do STJ: faltam na numeração ${faltam.slice(0, 10).join(', ')}${faltam.length > 10 ? '…' : ''} (página do PDF cortada?)`);
  return sumulas.sort((a, b) => a.numero - b.numero);
}
