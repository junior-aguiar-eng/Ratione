import type { CasoValidado } from './caso';
import { contarChamadas, type ResultadoDoCaso } from './executarCaso';
import { LIMIAR_DISPOSITIVO, LIMIAR_QUESTAO, medirCaso, taxa, totalizar, type MedidaDoCaso } from './metricas';

const pct = (n: number | null) => (n === null ? 'sem dados' : `${(n * 100).toFixed(1).replace('.', ',')}%`);
const usd = (n: number) => `US$ ${n.toFixed(4).replace('.', ',')}`;
const fracao = (parte: number, total: number) => `${parte} de ${total} (${pct(taxa(parte, total))})`;

export interface EntradaDoRelatorio {
  rodada: string;
  modelo: string;
  casos: readonly CasoValidado[];
  resultados: readonly ResultadoDoCaso[];
}

/** Relatório em Markdown de uma rodada. Só os casos enviáveis e com gabarito validado entram nas taxas. */
export function montarRelatorio({ rodada, modelo, casos, resultados }: EntradaDoRelatorio): string {
  const porId = new Map(casos.map(c => [c.id, c]));
  const avaliados: Array<{ r: ResultadoDoCaso; medida: MedidaDoCaso }> = [];
  const fora: ResultadoDoCaso[] = [];
  for (const r of resultados) {
    const caso = porId.get(r.casoId);
    if (!caso) continue;
    if (r.naoEnviavel) fora.push(r);
    else avaliados.push({ r, medida: medirCaso({ estrutura: r.estrutura.saida, questoes: r.questoes.saida, fundamentos: r.fundamentos.saida }, caso.gabarito) });
  }
  const t = totalizar(avaliados.map(a => a.medida));
  const chamadas = contarChamadas(resultados);
  const custoMedio = avaliados.length ? chamadas.custoUsd / avaliados.length : 0;

  const linhas = [
    `# Avaliação do Argumenta: rodada ${rodada}`,
    '',
    `Modelo: **${modelo}** · casos avaliados: **${avaliados.length}** de ${casos.length} validados${fora.length ? ` (${fora.length} não enviáveis)` : ''}`,
    '',
    '## Resultado',
    '',
    '| Métrica | Resultado |',
    '|---|---|',
    `| Intervalo do dispositivo certo (sobreposição ≥ ${LIMIAR_DISPOSITIVO * 100}%) | ${fracao(t.dispositivoAcertos, t.casos)} |`,
    `| Questões esperadas encontradas (sobreposição de parágrafos ≥ ${LIMIAR_QUESTAO * 100}%) | ${fracao(t.questoesEncontradas, t.questoesEsperadas)} |`,
    `| Citações esperadas encontradas | ${fracao(t.citacoesEncontradas, t.citacoesEsperadas)} |`,
    `| Saídas descartadas pelo código | ${fracao(chamadas.descartadas, chamadas.chamadas)} |`,
    `| Questões achadas que o gabarito não tem | ${t.questoesExtras} |`,
    '',
    '## Custo',
    '',
    `Total da rodada: **${usd(chamadas.custoUsd)}** · médio por decisão avaliada: **${usd(custoMedio)}** (três etapas, preço do \`politica.ts\`).`,
    '',
    '## Por decisão',
    '',
    '| Caso | Parágrafos | Dispositivo | Questões | Citações | Etapas | Custo |',
    '|---|---|---|---|---|---|---|',
    ...avaliados.map(({ r, medida: m }) => {
      const d = m.dispositivo;
      const etapas = [r.estrutura, r.questoes, r.fundamentos].map(e => (e.estado === 'ok' ? 'ok' : e.estado)).join(' / ');
      return `| ${r.casoId} | ${r.paragrafos} | ${d.acertou ? 'certo' : d.achou ? `errado (${pct(d.sobreposicao)})` : 'não achou'} | ${m.questoes.encontradas}/${m.questoes.esperadas}${m.questoes.extras ? ` (+${m.questoes.extras})` : ''} | ${m.citacoes.encontradas}/${m.citacoes.esperadas} | ${etapas} | ${usd(contarChamadas([r]).custoUsd)} |`;
    }),
    ''
  ];
  if (fora.length) {
    linhas.push('## Não enviáveis', '', ...fora.map(r => `- **${r.casoId}**: ${r.naoEnviavel}`), '');
  }
  const motivos = resultados.flatMap(r => [r.estrutura, r.questoes, r.fundamentos].filter(e => e.motivo && e.estado !== 'nao_rodou').map(e => `${r.casoId}: ${e.estado}, ${e.motivo}`));
  if (motivos.length) linhas.push('## Saídas que não deram resultado', '', ...motivos.map(m => `- ${m}`), '');
  linhas.push(
    '## Como ler',
    '',
    `Avalia a **extração estrutural**, não a concordância com o texto da IA. Com ${avaliados.length} decisões, a amostra é pequena: use os números para decidir o que olhar, não para fixar um limite fino. O gabarito é do revisor (${[...new Set(casos.map(c => c.validacao.por))].join('; ') || 'sem casos validados'}).`,
    ''
  );
  return linhas.join('\n');
}
