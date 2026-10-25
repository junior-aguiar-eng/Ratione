/**
 * F5-04: reconhece, sem IA, o que a citação de um fundamento aponta ("CDC, art. 14", "Súmula 479 do STJ", "Tema 1.076 do STJ",
 * "ADI 4.357"). O reconhecimento é só texto: a conferência no banco fica em `verificarCitacoes.ts`. Citação que não se encaixa em
 * nenhum formato conhecido devolve `null` (sem selo), e não um palpite.
 */
import { interpretarConsulta } from '@ratione/normaviva/consulta';

export type Tribunal = 'STF' | 'STJ';

export type CitacaoReconhecida =
  | { tipo: 'dispositivo'; normaId: string; artigo: string; detalhe: string | null }
  | { tipo: 'norma'; normaId: string }
  | { tipo: 'sumula'; tribunais: Tribunal[]; numero: string; vinculante: boolean }
  | { tipo: 'tema'; tribunais: Tribunal[]; numero: string }
  | { tipo: 'acao'; classe: 'ADI' | 'ADPF' | 'ADC' | 'ADO'; numero: string }
  /** Norma ou precedente que o Ratione não cobre: não é prova de que a citação esteja errada. */
  | { tipo: 'fora'; motivo: string };

const OUTRO_TRIBUNAL = /\b(TST|TSE|STM|TCU|TJ[A-Z]{2}|TRF\s?\d|TRT\s?\d+|TRE[A-Z]{2})\b/;
const RE_SUMULA = /\bs[úu]mulas?\s+(vinculante\s+)?(?:n[ºo°.]*\s*)?(\d{1,4})\b/i;
const RE_TEMA = /\btemas?\s+(?:n[ºo°.]*\s*)?(\d{1,2}(?:\.\d{3})+|\d{1,5})\b/i;
const RE_ACAO = /\b(ADI|ADPF|ADC|ADO)\s*(?:n[ºo°.]*\s*)?(\d{1,2}(?:\.\d{3})+|\d{1,5})\b/;
const RE_LEI_FORA = /^\s*(lei|decreto|emenda|medida provisória|resolução|portaria|instrução normativa)\b/i;

/** Tribunais que o texto nomeia, pelas siglas ou por extenso; vazio se não nomeia nenhum dos dois. */
function tribunaisCitados(texto: string): Tribunal[] {
  const achados: Tribunal[] = [];
  if (/\bSTF\b|supremo tribunal federal/i.test(texto)) achados.push('STF');
  if (/\bSTJ\b|superior tribunal de justiça/i.test(texto)) achados.push('STJ');
  return achados;
}

/** "Súmulas 283 e 284" ou "Súmula 7, 83": mais de um número, e a citação não é de uma só súmula. */
function temOutroNumeroDepois(texto: string, fim: number): boolean {
  return /^\s*(?:,|e|ou|\/\s*\d)\s*\d/.test(texto.slice(fim));
}

/** "CDC, art. 14" vira "art. 14 CDC", a forma que a pesquisa do NormaViva já entende. */
function normaAntesDoArtigo(texto: string): string {
  const m = texto.match(/^(.+?)\s*,?\s+art(?:igos?|s)?\.?\s*(\d.*)$/i);
  return m && !/^art/i.test(texto) ? `art. ${m[2]} ${m[1]}` : texto;
}

export function reconhecerCitacao(entrada: string, normasConhecidas: string[]): CitacaoReconhecida | null {
  const texto = entrada.normalize('NFC').replace(/[ \s]+/g, ' ').trim();
  if (!texto) return null;

  const sumula = texto.match(RE_SUMULA);
  if (sumula) {
    if (temOutroNumeroDepois(texto, (sumula.index ?? 0) + sumula[0].length)) return null;
    if (OUTRO_TRIBUNAL.test(texto)) return { tipo: 'fora', motivo: 'Súmula de tribunal que a base ainda não cobre.' };
    const vinculante = !!sumula[1];
    const citados = tribunaisCitados(texto);
    const tribunais: Tribunal[] = vinculante ? ['STF'] : citados.length > 0 ? citados : ['STF', 'STJ'];
    return { tipo: 'sumula', tribunais, numero: sumula[2], vinculante };
  }

  const tema = texto.match(RE_TEMA);
  if (tema) {
    if (OUTRO_TRIBUNAL.test(texto)) return { tipo: 'fora', motivo: 'Tema de tribunal que a base ainda não cobre.' };
    const citados = tribunaisCitados(texto);
    const tribunais: Tribunal[] = citados.length > 0
      ? citados
      : /repercuss[aã]o geral/i.test(texto) ? ['STF'] : /repetitiv/i.test(texto) ? ['STJ'] : ['STF', 'STJ'];
    return { tipo: 'tema', tribunais, numero: tema[1].replace(/\./g, '') };
  }

  const acao = texto.match(RE_ACAO);
  if (acao) return { tipo: 'acao', classe: acao[1] as 'ADI' | 'ADPF' | 'ADC' | 'ADO', numero: acao[2].replace(/\./g, '') };

  const consulta = interpretarConsulta(normaAntesDoArtigo(texto), normasConhecidas);
  if (consulta.tipo === 'dispositivo') {
    // Sem norma na citação ("art. 14" solto) não há o que conferir
    return consulta.normaId ? { tipo: 'dispositivo', normaId: consulta.normaId, artigo: consulta.artigo, detalhe: consulta.detalhe } : null;
  }
  if (consulta.tipo === 'norma' && /^(lei|decreto)/i.test(texto)) return { tipo: 'norma', normaId: consulta.normaId };
  if (consulta.tipo === 'texto') {
    if (/^art(?:igos?|s)?\.?\s*\d/i.test(normaAntesDoArtigo(texto)) || RE_LEI_FORA.test(texto)) {
      return { tipo: 'fora', motivo: 'Norma que a base ainda não cobre.' };
    }
  }
  return null;
}
