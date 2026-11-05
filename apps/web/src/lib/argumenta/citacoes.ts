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
// "Tema 1.076", "Tema Repetitivo nº 1150", "Tema de Repercussão Geral nº 793": a natureza do tema pode vir entre "Tema" e o número
const RE_TEMA = /\btemas?\s+(?:repetitivos?\s+|de\s+repercuss[ãa]o\s+geral\s+|rg\s+)?(?:n[ºo°.]*\s*)?(\d{1,2}(?:\.\d{3})+|\d{1,5})\b/i;
const RE_ACAO = /\b(ADI|ADPF|ADC|ADO)\s*(?:n[ºo°.]*\s*)?(\d{1,2}(?:\.\d{3})+|\d{1,5})\b/;
const RE_CPC_1973 = /\bCPC\s*\/?\s*(?:de\s*)?(?:19)?73\b|\bCPC\s+(?:antigo|revogado)\b|c[óo]digo de processo civil\s*(?:de|\/)?\s*(?:19)?73\b|\blei\s*(?:n[ºo°.]*\s*)?5\.?869\b/i;
// Os artigos 543-A a 543-C são os dos recursos repetitivos do CPC de 1973; o de 2015 não tem artigo com letra, e "CPC, art. 543-C" já foi lido como o de 2015
const RE_CPC_1973_REPETITIVOS = /\b543-[A-C]\b/;
// Norma da base nomeada na citação (sigla ou nome por extenso). Se a citação a nomeia e o formato não se encaixa, a tela não diz nada: "fora da base" seria falso
const RE_NORMA_DA_BASE = /\b(?:CF|CRFB|CC|CPC|CP|CPP|CLT|CDC|LINDB|CTN|ECA|LGPD|CTB|LEP)\b|constitui[çc][ãa]o|c[óo]digo (?:civil|penal|de processo|de defesa|tribut[áa]rio|de tr[âa]nsito)|consolida[çc][ãa]o das leis|lei de execu[çc][ãa]o penal/i;
// Mais de um artigo, parágrafo ou inciso na mesma citação ("arts. 59 e 68", "§ 6º e § 8º", "II e III", "art. 14; art. 15"): conferir só o primeiro seria afirmar demais
const RE_VARIOS = /;|\barts\.?\s|§§|\be\s*(?:§|art\.?\s*\d|\d|[IVXLCDM]{1,4}\b)/;
// Alínea ("II, e", "III, \"a\"", "alíneas a e c"): o artigo e o inciso são conferidos, e a alínea fica como não conferida
const RE_ALINEA = /,?\s*al[íi]neas?\s+["“”]?[a-z]["“”]?(?:\s*(?:e|,)\s*["“”]?[a-z]["“”]?)*|,\s*["“”]?([a-z])["“”]?(?=\s*(?:,|;|$|\s+d[aoe]s?\s|\s+n[aoe]s?\s))/;
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

  // "CPC" sozinho é o de 2015, mas "CPC/73", "CPC de 1973" e a Lei 5.869 são o código revogado, que a base não tem: sem este corte o artigo
  // seria conferido no código errado e ganharia um selo de "encontrada" falso
  if (RE_CPC_1973.test(texto)) return { tipo: 'fora', motivo: 'Código de Processo Civil de 1973 (revogado), que a base não cobre.' };

  const ehArtigo = /\bart(?:igos?|s)?\.?\s*\d/i.test(texto);
  if (ehArtigo && RE_CPC_1973_REPETITIVOS.test(texto) && !/2015|\/\s*15\b/.test(texto)) {
    return { tipo: 'fora', motivo: 'Código de Processo Civil de 1973 (revogado), que a base não cobre.' };
  }
  // Escritas correntes da mesma norma: "CF/88", "CC/2002", "CPC/2015" e "Constituição" sem "Federal"
  let t = texto
    .replace(/\bCPC\s*\/\s*(?:20)?15\b/gi, 'CPC')
    .replace(/\bCF\s*\/\s*(?:19)?88\b/gi, 'CF')
    .replace(/\bCC\s*\/\s*(?:20)?02\b|\bCCB\b/g, 'CC')
    .replace(/\bConstitui[çc][ãa]o\b(?!\s+(?:Federal|da Rep))/gi, 'Constituição Federal')
    // "inciso I" vale como "I"; "da Lei de Execução Fiscal (Lei nº 6.830/80)" vale como "da Lei nº 6.830/80"
    .replace(/\bincisos?\s+(?=[IVXLCDM]+\b)/g, '')
    .replace(/\bd([aoe]s?)\s+[A-ZÀ-Ú][^()]*?\s*\(\s*((?:Lei|Decreto)[^)]*)\)/g, 'd$1 $2');
  // Norma da base com mais de um artigo, parágrafo ou inciso na mesma citação: sem selo, em vez de conferir só o primeiro
  if (ehArtigo && RE_NORMA_DA_BASE.test(t) && RE_VARIOS.test(t)) return null;
  let alinea: string | null = null;
  if (ehArtigo) {
    const m = t.match(RE_ALINEA);
    if (m) {
      alinea = m[0].replace(/^[,\s]+/, '').replace(/["“”]/g, '').replace(/^al[íi]neas?\s+/i, '').trim();
      t = t.replace(RE_ALINEA, '');
    }
  }

  const consulta = interpretarConsulta(normaAntesDoArtigo(t), normasConhecidas);
  if (consulta.tipo === 'dispositivo') {
    // Sem norma na citação ("art. 14" solto) não há o que conferir
    if (!consulta.normaId) return null;
    // A alínea vai no detalhe só para o selo avisar que ela não foi conferida
    const detalhe = alinea ? (consulta.detalhe ? `${consulta.detalhe}, alínea ${alinea}` : `alínea ${alinea}`) : consulta.detalhe;
    return { tipo: 'dispositivo', normaId: consulta.normaId, artigo: consulta.artigo, detalhe };
  }
  if (consulta.tipo === 'norma' && /^(lei|decreto)/i.test(texto)) return { tipo: 'norma', normaId: consulta.normaId };
  if (consulta.tipo === 'texto') {
    // Norma da base nomeada, mas num formato que não se reconhece: "fora da base" seria falso, então sem selo
    if (ehArtigo && RE_NORMA_DA_BASE.test(texto)) return null;
    if (/^art(?:igos?|s)?\.?\s*\d/i.test(normaAntesDoArtigo(texto)) || RE_LEI_FORA.test(texto)) {
      return { tipo: 'fora', motivo: 'Norma que a base ainda não cobre.' };
    }
  }
  return null;
}
