/**
 * Remissões expressas entre dispositivos (F3-05): "art. 85, § 2º, deste Código", "art. 22 da Constituição Federal",
 * "art. 5º da Lei nº 8.078, de 1990". Extração por regra, sobre o texto oficial; nada é inferido.
 *
 * Cada remissão sai com o `escopo` que diz quanta certeza há sobre a norma de destino:
 * - `mesma`: o texto diz "deste Código", "desta Lei", "deste artigo";
 * - `explicito`: o texto nomeia a outra norma (nome por extenso, sigla ou "Lei nº X, de AAAA");
 * - `presumido`: o texto cita o artigo sem dizer de que norma (na redação legislativa, é a própria norma);
 * - `externo`: nomeia outra norma que não está no corpus.
 */
import { atosDoTexto } from '../coleta/conferir';
import { idDeNormaPelaChave, normaPorNomeNoInicio, normaPorSigla } from './apelidos';
import { numeroComoNoParser } from './numero';

export type EscopoRemissao = 'mesma' | 'explicito' | 'presumido' | 'externo';

export interface Remissao {
  /** Trecho do texto onde a remissão aparece, para auditoria. */
  trecho: string;
  /** Número do artigo citado ("85", "5º", "1.015", "22-A"). */
  artigo: string;
  /** Detalhe citado depois do artigo ("§ 2º", "inciso IV", "caput"), se houver. */
  detalhe: string | null;
  escopo: EscopoRemissao;
  /** Id da norma de destino; nulo em `externo` e quando o nome não é reconhecido. */
  normaDestinoId: string | null;
  /** Para `externo`: o que o texto diz ("Lei nº 9.099, de 1995"). */
  normaDestinoTexto: string | null;
}

const NUMERO = String.raw`(\d[\d.]*)\s*(º|°|o(?=[\s,.;:)]|$))?(?:-([A-Z]{1,2})\b)?`;
const RE_ARTIGO = new RegExp(String.raw`\b[Aa]rts?\.?\s*${NUMERO}`, 'g');
const RE_DETALHE = /^\s*,?\s*((?:[Cc]aput|[Pp]ar[áa]grafo [úu]nico|§§?\s*\d+\s*[ºo°]?(?:-[A-Z])?|(?:[Ii]ncisos?\s+)?[IVXLCDM]+(?=[\s,;.)]|$)(?:\s*,?\s*(?:[Aa]l[íi]neas?\s+)?[a-z]\))?)(?:\s*(?:,|e|a)\s*(?:§§?\s*\d+\s*[ºo°]?|[IVXLCDM]+(?=[\s,;.)]|$)))*)/;
const RE_MESMA = /^[\s,;]*(?:d(?:este|esta|o presente|a presente)\s+(?:artigo|Código|Lei|Constituição|Decreto-Lei|Estatuto|Consolidação|Capítulo|Seção|Título|Livro|Parte)|d(?:este|esse)\s+\w+)/i;
const RE_OUTRA = /^[\s,;]*(?:d[aoe]s?|na|no|nos|nas|à|ao)\s+/i;

export { numeroComoNoParser } from './numero';

const RE_LISTA = new RegExp(String.raw`^\s*(?:,|e|ou)\s+(?:o\s+)?(?:[Aa]rts?\.?\s*)?${NUMERO}`);

export function extrairRemissoes(texto: string): Remissao[] {
  const saida: Remissao[] = [];
  for (const m of texto.matchAll(RE_ARTIGO)) {
    const fim = (m.index ?? 0) + m[0].length;
    let depois = texto.slice(fim);
    const artigos = [numeroComoNoParser(m[1].replace(/\.$/, ''), !!m[2], m[3])];

    const d = depois.match(RE_DETALHE);
    if (d) depois = depois.slice(d[0].length);
    const detalhe = d ? d[1].replace(/\s+/g, ' ').trim() : null;

    // "arts. 485 e 932": no plural, os números seguintes ligados por "e", "ou" ou vírgula também são citados
    if (/^arts/i.test(m[0])) {
      for (let l = depois.match(RE_LISTA); l; l = depois.match(RE_LISTA)) {
        artigos.push(numeroComoNoParser(l[1].replace(/\.$/, ''), !!l[2], l[3]));
        depois = depois.slice(l[0].length);
        const dl = depois.match(RE_DETALHE);
        if (dl) depois = depois.slice(dl[0].length);
      }
    }

    let escopo: EscopoRemissao = 'presumido';
    let normaDestinoId: string | null = null;
    let normaDestinoTexto: string | null = null;

    if (RE_MESMA.test(depois)) {
      escopo = 'mesma';
    } else {
      const o = depois.match(RE_OUTRA);
      if (o) {
        const resto = depois.slice(o[0].length);
        const porNome = normaPorNomeNoInicio(resto);
        const sigla = resto.match(/^([A-Z]{2,6}(?:\d{2})?)\b/)?.[1];
        const ato = atosDoTexto(resto.slice(0, 80))[0];
        const comecaComAto = /^(Lei|Lcp|Decreto|Medida|Emenda|Ato)\b/i.test(resto);
        if (porNome) {
          escopo = 'explicito';
          normaDestinoId = porNome;
        } else if (sigla && normaPorSigla(sigla)) {
          escopo = 'explicito';
          normaDestinoId = normaPorSigla(sigla)!;
        } else if (comecaComAto && ato) {
          const id = idDeNormaPelaChave(ato.chave);
          escopo = 'externo';
          normaDestinoId = id ?? null;
          normaDestinoTexto = resto.slice(0, 60).replace(/\s+/g, ' ').trim();
        }
      }
    }
    const trecho = texto.slice(Math.max(0, (m.index ?? 0) - 10), Math.min(texto.length, fim + 70)).replace(/\s+/g, ' ').trim();
    for (const artigo of artigos) saida.push({ trecho, artigo, detalhe: artigo === artigos[0] ? detalhe : null, escopo, normaDestinoId, normaDestinoTexto });
  }
  return saida;
}
