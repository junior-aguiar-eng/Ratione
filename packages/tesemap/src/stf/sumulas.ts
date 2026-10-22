/**
 * Súmulas do STF (F4-02), lidas das exportações da base de jurisprudência do STF (`jurisprudencia.stf.jus.br`, botão de exportar CSV): uma para as
 * súmulas vinculantes e outra para as não vinculantes. O STF bloqueia o acesso automático, então os arquivos são exportados por uma pessoa e entram por
 * `pnpm importar:stf`. Formato: ponto e vírgula, UTF-8, enunciado com espaços duplos (quebra de linha da exportação, que a leitura junta), e um rodapé
 * "Critérios de Busca" com a consulta usada, que fica no manifesto como parte da procedência. A exportação traz só as súmulas aprovadas (as canceladas
 * não vêm; o número que falta na sequência é uma súmula que não está no arquivo).
 */
import { lerCsv } from '../stj/csv';
import { dataBr } from './repercussao';

export interface SumulaStf {
  /** `STF-SV-63` ou `STF-SUMULA-736`. */
  id: string;
  numero: number;
  vinculante: boolean;
  titulo: string;
  enunciado: string;
  /** Endereço da súmula na base de jurisprudência do STF. */
  url: string;
  orgaoJulgador: string | null;
  dataAprovacao: string | null;
  fontePublicacao: string | null;
  situacao: string;
  ramoDoDireito: string | null;
  observacao: string | null;
  /** Súmulas que a observação do STF cita ("Veja Súmula 680"), como ids; sem a própria súmula. */
  sumulasCitadas: string[];
  /** Temas de repercussão geral que o enunciado ou a observação citam, como números. */
  temasCitados: number[];
}

const COLUNAS = ['Título', 'Título URL', 'Enunciado', 'Órgão julgador', 'Data de aprovação', 'Fonte de Publicação', 'Situação', 'Ramo do direito', 'Observação'];

export const idDaSumula = (numero: number, vinculante: boolean) => (vinculante ? `STF-SV-${numero}` : `STF-SUMULA-${numero}`);

const limpo = (s: string) => s.replace(/\s+/g, ' ').trim();
const textoOuNulo = (s: string) => (limpo(s) === '' || limpo(s) === '-' ? null : limpo(s));

/** Súmulas e súmulas vinculantes que um texto cita ("Veja Súmula 419 e Súmula 645", "a Súmula Vinculante 51"), como ids, sem repetir. */
export function sumulasCitadasNoTexto(texto: string): string[] {
  const ids = new Set<string>();
  for (const m of texto.matchAll(/S[úu]mula\s+(Vinculante\s+)?(\d+)/gi)) ids.add(idDaSumula(Number(m[2]), !!m[1]));
  return [...ids];
}

/** Temas de repercussão geral citados ("Tema 6 da repercussão geral", "tema 1.234"), como números, sem repetir. */
export function temasCitadosNoTexto(texto: string): number[] {
  const n = new Set<number>();
  for (const m of texto.matchAll(/\bTemas?\s*(?:n[ºo°.]*\s*)?(\d{1,4}(?:\.\d{3})?)\b/gi)) n.add(Number(m[1].replace('.', '')));
  return [...n].sort((a, b) => a - b);
}

/** Separa a tabela do rodapé "Critérios de Busca" e devolve a consulta (URL de Busca) usada na exportação, quando houver. */
export function separarRodape(csv: string): { tabela: string; consulta: string | null } {
  const i = csv.search(/^Crit[ée]rios de Busca/m);
  if (i < 0) return { tabela: csv, consulta: null };
  const rodape = csv.slice(i);
  return { tabela: csv.slice(0, i), consulta: rodape.match(/^URL de Busca:\s*(\S+)/m)?.[1] ?? null };
}

export function lerSumulasStf(csv: string, vinculante: boolean): { sumulas: SumulaStf[]; consulta: string | null } {
  const { tabela, consulta } = separarRodape(csv);
  const linhas = lerCsv(tabela.replace(/^﻿/, ''), ';').filter(l => (l['Título'] ?? '').trim() !== '');
  if (linhas.length === 0) throw new Error('Súmulas: arquivo sem linhas');
  const faltam = COLUNAS.filter(c => !(c in linhas[0]));
  if (faltam.length > 0) throw new Error(`Súmulas: faltam colunas ${faltam.join(', ')} (o STF mudou o layout?)`);
  const vistos = new Set<number>();
  const sumulas = linhas.map(l => {
    const m = l['Título'].trim().match(/^S[úu]mula\s+(vinculante\s+)?(\d+)$/i);
    if (!m) throw new Error(`Súmulas: título não reconhecido "${l['Título']}"`);
    if (!!m[1] !== vinculante) throw new Error(`Súmulas: "${l['Título']}" está no arquivo de súmulas ${vinculante ? 'vinculantes' : 'não vinculantes'}`);
    const numero = Number(m[2]);
    if (vistos.has(numero)) throw new Error(`Súmulas: número ${numero} repetido`);
    vistos.add(numero);
    const id = idDaSumula(numero, vinculante);
    const enunciado = limpo(l['Enunciado']);
    if (!enunciado) throw new Error(`Súmulas: ${l['Título']} sem enunciado`);
    const observacao = textoOuNulo(l['Observação']);
    return {
      id,
      numero,
      vinculante,
      titulo: limpo(l['Título']),
      enunciado,
      url: l['Título URL'].trim(),
      orgaoJulgador: textoOuNulo(l['Órgão julgador']),
      dataAprovacao: dataBr(l['Data de aprovação']),
      fontePublicacao: textoOuNulo(l['Fonte de Publicação']),
      situacao: limpo(l['Situação']),
      ramoDoDireito: textoOuNulo(l['Ramo do direito']),
      observacao,
      sumulasCitadas: sumulasCitadasNoTexto(observacao ?? '').filter(x => x !== id),
      temasCitados: temasCitadosNoTexto(`${enunciado} ${observacao ?? ''}`)
    } satisfies SumulaStf;
  });
  return { sumulas: sumulas.sort((a, b) => a.numero - b.numero), consulta };
}
