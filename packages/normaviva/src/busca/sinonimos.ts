/**
 * Sinônimos de pesquisa do NormaViva (F3-05): o texto da lei e a fala de quem pesquisa nem sempre usam a mesma expressão
 * ("demissão" × "dispensa", "aluguel" × "locação", "escuta telefônica" × "interceptação"). A busca do Postgres é lexical, então
 * "demissão sem justa causa" não acha a CLT. Cada grupo lista expressões que o corpus ou o uso corrente tratam como a mesma coisa.
 *
 * Só ajuda a achar: a pesquisa original roda sempre e vem primeiro, o que vem de sinônimo é marcado na tela e nada aqui afirma
 * equivalência jurídica entre institutos. Não entram pares que o direito distingue (vício × defeito, posse × propriedade,
 * prescrição × decadência). Cada expressão de destino tem de existir no corpus; `sinonimos.test.ts` confere contra o banco carregado.
 */
export const GRUPOS_DE_SINONIMOS: string[][] = [
  ['demissão sem justa causa', 'dispensa sem justa causa', 'dispensa imotivada'],
  ['hora extra', 'horas extras', 'horas suplementares', 'jornada extraordinária'],
  ['décimo terceiro', 'décimo terceiro salário', 'gratificação natalina'],
  ['aluguel', 'locação'],
  ['inquilino', 'locatário'],
  ['senhorio', 'locador'],
  ['pensão alimentícia', 'alimentos'],
  ['liminar', 'tutela de urgência', 'tutela provisória'],
  ['justiça gratuita', 'gratuidade da justiça'],
  ['correção monetária', 'atualização monetária'],
  ['escuta telefônica', 'grampo', 'interceptação telefônica', 'interceptação das comunicações telefônicas'],
  ['foro privilegiado', 'prerrogativa de função', 'foro por prerrogativa de função'],
  ['funcionário público', 'servidor público'],
  ['propaganda enganosa', 'publicidade enganosa'],
  ['dano moral', 'dano extrapatrimonial'],
  ['assalto', 'roubo'],
  ['privacidade', 'vida privada', 'intimidade'],
  ['bafômetro', 'teste de alcoolemia'],
  ['carteira de motorista', 'carteira nacional de habilitação'],
  ['herança', 'sucessão hereditária'],
  ['bloqueio de bens', 'indisponibilidade de bens']
];

/** Quantas pesquisas alternativas, no máximo, uma consulta dispara (cada uma é uma chamada ao banco). */
export const MAX_VARIANTES = 4;

export interface Variante {
  /** A consulta com a expressão trocada. */
  consulta: string;
  /** A expressão que entrou no lugar, para dizer na tela por que o resultado apareceu. */
  termo: string;
}

const semAcento = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Troca, uma expressão por vez, o trecho da consulta que casa com um grupo. Expressões mais longas casam antes das curtas. */
export function variantesDaConsulta(consulta: string, grupos: string[][] = GRUPOS_DE_SINONIMOS): Variante[] {
  const base = semAcento(consulta);
  const achadas = grupos
    .flatMap(g => g.map(termo => ({ g, termo })))
    .sort((a, b) => b.termo.length - a.termo.length);
  const variantes: Variante[] = [];
  const cobertos: Array<[number, number]> = [];
  const vistos = new Set<string>([semAcento(consulta).trim()]);
  for (const { g, termo } of achadas) {
    const re = new RegExp(String.raw`(^|[^\p{L}\p{N}])(${semAcento(termo).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?![\p{L}\p{N}])`, 'u');
    const m = re.exec(base);
    if (!m) continue;
    const ini = m.index + m[1].length;
    const fim = ini + m[2].length;
    if (cobertos.some(([a, b]) => ini < b && fim > a)) continue; // "demissão por justa causa" já cobriu "justa causa"
    cobertos.push([ini, fim]);
    for (const outro of g) {
      if (outro === termo) continue;
      const nova = `${consulta.slice(0, ini)}${outro}${consulta.slice(fim)}`;
      const chave = semAcento(nova).trim();
      if (vistos.has(chave)) continue;
      vistos.add(chave);
      variantes.push({ consulta: nova, termo: outro });
    }
  }
  return variantes.slice(0, MAX_VARIANTES);
}
