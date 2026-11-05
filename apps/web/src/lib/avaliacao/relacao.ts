/**
 * Medição da tarefa `relacionar-com-o-caso` com o corpus do Argumenta (docs/produto/IA_TAREFAS.md §8.1). Não há, no corpus, um gabarito de "esta fonte
 * se relaciona com esta questão"; a medição usa o que o corpus já tem, como aproximação:
 *
 * - **Pares positivos:** a questão do gabarito e uma norma ou precedente que a própria decisão cita **nos parágrafos daquela questão**. A decisão usou a fonte
 *   para aquela questão; logo, a relação esperada é `aplica`.
 * - **Pares negativos:** a mesma questão e uma fonte que a decisão de **outro caso** cita, e que não aparece nos parágrafos da questão. Em geral é assunto
 *   diferente; a relação esperada é qualquer uma menos `aplica`.
 *
 * É uma medida aproximada (um negativo pode, por acaso, tratar do mesmo ponto), por isso o relatório lista cada par com a resposta, para o revisor conferir.
 * Este módulo é puro: monta os pares e calcula as taxas; quem chama o modelo e o banco é `scripts/avaliar-relacao.ts`.
 */
import { normalizarParaComparar, type SaidaRelacao } from '../ia/tarefas/relacionarComOCaso';
import type { Etapa } from './executarCaso';
import type { CasoValidado } from './caso';
import { paragrafosDoCaso } from './caso';

export interface FonteResolvida {
  citacao: string;
  ferramenta: 'normaviva' | 'tesemap';
  destinoId: string;
}

export type Esperado = 'aplica' | 'nao_aplica';

export interface ParDeRelacao {
  casoId: string;
  questaoId: string;
  enunciado: string;
  conclusao: string;
  fonte: FonteResolvida;
  esperado: Esperado;
}

export interface ResultadoDoPar {
  par: ParDeRelacao;
  etapa: Etapa<SaidaRelacao>;
}

/** A citação, como aparece no gabarito, está escrita nos parágrafos da questão (comparação sem caixa, acento nem espaços extras). */
export function citacaoNosParagrafos(citacao: string, textos: readonly string[]): boolean {
  const c = normalizarParaComparar(citacao);
  return c.length >= 4 && textos.some(t => normalizarParaComparar(t).includes(c));
}

export function montarPares(
  casos: readonly CasoValidado[],
  fontes: ReadonlyMap<string, FonteResolvida>,
  limites: { porQuestao: number; maximo: number }
): ParDeRelacao[] {
  const positivos: ParDeRelacao[] = [];
  const questoesDosCasos = casos.map(caso => {
    const paragrafos = paragrafosDoCaso(caso);
    return caso.gabarito.questoes.map((q, i) => ({
      casoId: caso.id,
      questaoId: `Q${i + 1}`,
      enunciado: q.enunciado,
      conclusao: q.conclusao,
      textos: q.paragrafos.map(n => paragrafos[n - 1]).filter((t): t is string => typeof t === 'string'),
      citacoes: caso.gabarito.citacoes
    }));
  });

  for (const questoes of questoesDosCasos) {
    for (const q of questoes) {
      const achadas = q.citacoes
        .map(c => fontes.get(c.trim()))
        .filter((f): f is FonteResolvida => !!f && citacaoNosParagrafos(f.citacao, q.textos));
      const unicas = [...new Map(achadas.map(f => [`${f.ferramenta}|${f.destinoId}`, f])).values()].slice(0, limites.porQuestao);
      for (const fonte of unicas) positivos.push({ casoId: q.casoId, questaoId: q.questaoId, enunciado: q.enunciado, conclusao: q.conclusao, fonte, esperado: 'aplica' });
    }
  }

  // Um negativo para cada positivo: fonte citada em outro caso, em ordem fixa (sem sorteio, para a rodada ser repetível)
  const todas = [...new Map([...fontes.values()].map(f => [`${f.ferramenta}|${f.destinoId}`, f])).values()];
  const negativos: ParDeRelacao[] = [];
  positivos.forEach((p, i) => {
    const q = questoesDosCasos.flat().find(x => x.casoId === p.casoId && x.questaoId === p.questaoId)!;
    const doMesmoCaso = new Set(casos.find(c => c.id === p.casoId)!.gabarito.citacoes.map(c => c.trim()));
    for (let k = 0; k < todas.length; k++) {
      const f = todas[(i * 7 + k) % todas.length];
      if (doMesmoCaso.has(f.citacao.trim()) || citacaoNosParagrafos(f.citacao, q.textos)) continue;
      negativos.push({ casoId: p.casoId, questaoId: p.questaoId, enunciado: p.enunciado, conclusao: p.conclusao, fonte: f, esperado: 'nao_aplica' });
      break;
    }
  });

  const todos = [...positivos, ...negativos];
  if (todos.length <= limites.maximo) return todos;
  // Corta mantendo a proporção: metade de cada lado
  const metade = Math.floor(limites.maximo / 2);
  return [...positivos.slice(0, metade), ...negativos.slice(0, metade)];
}

export interface Medicao {
  positivos: { total: number; aplica: number; distingue: number; outroPonto: number };
  negativos: { total: number; aplica: number; distingue: number; outroPonto: number };
  /** Pares que chegaram ao modelo e não deram saída válida (formato, trecho fora da fonte, opinião sobre o caso, falha da API). */
  descartados: number;
  chamadas: number;
  custoUsd: number;
}

export function medir(resultados: readonly ResultadoDoPar[]): Medicao {
  const m: Medicao = {
    positivos: { total: 0, aplica: 0, distingue: 0, outroPonto: 0 },
    negativos: { total: 0, aplica: 0, distingue: 0, outroPonto: 0 },
    descartados: 0,
    chamadas: 0,
    custoUsd: 0
  };
  for (const { par, etapa } of resultados) {
    m.custoUsd += etapa.custoUsd;
    if (etapa.estado === 'nao_rodou') continue;
    m.chamadas++;
    const lado = par.esperado === 'aplica' ? m.positivos : m.negativos;
    lado.total++;
    if (etapa.estado !== 'ok' || !etapa.saida) {
      m.descartados++;
      continue;
    }
    if (etapa.saida.relacao === 'aplica') lado.aplica++;
    else if (etapa.saida.relacao === 'distingue') lado.distingue++;
    else lado.outroPonto++;
  }
  m.custoUsd = Math.round(m.custoUsd * 1e6) / 1e6;
  return m;
}

const pct = (n: number, d: number) => (d === 0 ? '—' : `${((100 * n) / d).toFixed(0)}%`);

export function relatorioDaRelacao(resultados: readonly ResultadoDoPar[], modelo: string, data: string): string {
  const m = medir(resultados);
  const validosPos = m.positivos.aplica + m.positivos.distingue + m.positivos.outroPonto;
  const validosNeg = m.negativos.aplica + m.negativos.distingue + m.negativos.outroPonto;
  const linhas: string[] = [
    `# Medição da relação com o caso (${data})`,
    '',
    `Modelo: \`${modelo}\`. Tarefa \`relacionar-com-o-caso\`. Medida aproximada: ver o cabeçalho de \`lib/avaliacao/relacao.ts\`.`,
    '',
    '## Resumo',
    '',
    '| | Pares | Aplica | Distingue | Outro ponto |',
    '|---|---|---|---|---|',
    `| **Positivos** (a decisão usou a fonte nesta questão; esperado: aplica) | ${m.positivos.total} | ${m.positivos.aplica} (${pct(m.positivos.aplica, validosPos)}) | ${m.positivos.distingue} (${pct(m.positivos.distingue, validosPos)}) | ${m.positivos.outroPonto} (${pct(m.positivos.outroPonto, validosPos)}) |`,
    `| **Negativos** (fonte de outro caso; esperado: não aplica) | ${m.negativos.total} | ${m.negativos.aplica} (${pct(m.negativos.aplica, validosNeg)}) | ${m.negativos.distingue} (${pct(m.negativos.distingue, validosNeg)}) | ${m.negativos.outroPonto} (${pct(m.negativos.outroPonto, validosNeg)}) |`,
    '',
    `- **Acerto nos positivos:** ${pct(m.positivos.aplica, validosPos)}. **Falso "aplica" nos negativos:** ${pct(m.negativos.aplica, validosNeg)}.`,
    `- **Descartados** (formato, trecho que não está na fonte, opinião sobre o caso ou falha da API): ${m.descartados} de ${m.chamadas} (${pct(m.descartados, m.chamadas)}).`,
    `- **Custo:** US$ ${m.custoUsd.toFixed(4)} em ${m.chamadas} chamadas.`,
    '',
    '## Cada par, para conferência do revisor',
    '',
    '| Caso | Questão | Fonte | Esperado | Resposta | Resumo | Trecho citado |',
    '|---|---|---|---|---|---|---|'
  ];
  const cel = (s: string) => s.replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
  for (const { par, etapa } of resultados) {
    const resposta = etapa.estado === 'ok' && etapa.saida ? etapa.saida.relacao : `(${etapa.estado}${etapa.motivo ? `: ${etapa.motivo}` : ''})`;
    linhas.push(
      `| ${par.casoId} | ${par.questaoId}: ${cel(par.enunciado)} | ${cel(par.fonte.citacao)} | ${par.esperado === 'aplica' ? 'aplica' : 'não aplica'} | ${cel(resposta)} | ${etapa.saida ? cel(etapa.saida.resumo) : ''} | ${etapa.saida ? cel(etapa.saida.trecho) : ''} |`
    );
  }
  linhas.push('');
  return linhas.join('\n');
}
