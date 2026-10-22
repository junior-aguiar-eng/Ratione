/**
 * Nós das súmulas do STJ (F4-01). Entram as súmulas em vigor: aprovadas e alteradas (a alterada tem o enunciado novo; a redação anterior fica na nota).
 * Cancelada e revogada ficam de fora, como no STF. O enunciado é o texto oficial e a fonte é a pesquisa de súmulas do SCON, com o SHA-256 do PDF.
 *
 * Ligações registradas pelas fontes (a tela as mostra à parte das relações validadas): o tema repetitivo que, nos Dados Abertos do STJ, originou a súmula
 * (`sumulaOriginada`) ou a cita (`referenciaSumular`), e o tema repetitivo que a nota da súmula cita ("tema repetitivo 1194"). Só vale para tema que
 * existe no grafo (`existentes`).
 */
import { NoBancoSchema, type NoBanco } from './esquemas';
import type { CitacaoNormativa } from './citacoes';
import type { PrecedenteStj } from '../stj/precedentes';
import type { SumulaStj } from '../stj/sumulas';
import type { ManifestoSumulasStj } from '../stj/sumulas-corpus';

/** Número da súmula → números dos temas repetitivos que a originaram ou a citam, segundo os Dados Abertos do STJ. */
export function temasQueLigamSumulas(precedentes: PrecedenteStj[]): Map<number, Set<number>> {
  const mapa = new Map<number, Set<number>>();
  for (const p of precedentes) {
    if (p.tipo !== 'Tema') continue;
    for (const ref of [p.sumulaOriginada, p.referenciaSumular]) {
      for (const n of String(ref ?? '').match(/\d+/g) ?? []) {
        const numero = Number(n);
        if (!mapa.has(numero)) mapa.set(numero, new Set());
        mapa.get(numero)!.add(p.numero);
      }
    }
  }
  return mapa;
}

/** "SEGUNDA SEÇÃO" → "Segunda Seção", como a tela escreve o órgão dos outros nós. */
export const orgaoPorExtenso = (orgao: string) =>
  orgao.toLocaleLowerCase('pt-BR').replace(/(^|\s)(\p{L})/gu, (_, espaco: string, letra: string) => espaco + letra.toLocaleUpperCase('pt-BR')).replace(/\sD([aeo]s?)\s/g, ' d$1 ');

export function nosDasSumulasStj(
  sumulas: SumulaStj[],
  m: ManifestoSumulasStj,
  temasPorSumula: Map<number, Set<number>>,
  existentes: ReadonlySet<string>,
  citacoes: (texto: string) => CitacaoNormativa[] = () => []
): NoBanco[] {
  return sumulas
    .filter(s => s.situacao === 'aprovada' || s.situacao === 'alterada')
    .map(s => {
      const temas = [...new Set([...(temasPorSumula.get(s.numero) ?? []), ...s.temasRepetitivos])].filter(n => existentes.has(`STJ-TEMA-${n}`)).sort((a, b) => a - b);
      return NoBancoSchema.parse({
        id: s.id,
        tipo: 'sumula',
        rotulo: `Súmula ${s.numero} do STJ`,
        tribunal: 'STJ',
        numero_referencia: `Súmula ${s.numero}`,
        descricao: s.enunciado,
        dispositivo_id: null,
        detalhes: {
          // Mesmos nomes de campo das súmulas do STF, que a tela já lê ("Aprovada em", "Publicação", selo de situação)
          situacao: s.situacao === 'alterada' ? 'Alterada' : 'Aprovada',
          orgaoJulgador: orgaoPorExtenso(s.orgaoJulgador),
          dataAprovacao: s.dataJulgamento,
          dataJulgamento: s.dataJulgamento,
          fontePublicacao: s.publicacao,
          nota: s.nota,
          linkOficial: m.paginaUrl,
          temasStj: temas.map(numero => ({ numero: String(numero) })),
          citacoes: citacoes(s.enunciado)
        },
        origem_dado: 'curado',
        fontes: [
          {
            id: `stj-scon-sumulas-${s.numero}`,
            ato: `Súmula ${s.numero} do STJ (${orgaoPorExtenso(s.orgaoJulgador)}${s.dataJulgamento ? `, julgada em ${s.dataJulgamento.split('-').reverse().join('/')}` : ''}; ${s.publicacao})`,
            url: m.paginaUrl,
            lido: `${m.fonte}; ${m.obtidoPor}; PDF com SHA-256 ${m.pdf.sha256}, texto extraído por ${m.texto.extraidoCom}; importação mecânica`,
            lidoEm: m.lidoEm
          }
        ],
        validado_por: null,
        validado_em: null,
        atualizado_em: m.lidoEm
      });
    });
}
