/**
 * Medição de `ler-intimacao` sobre o corpus de intimações: roda a MESMA tarefa do produto (instruções, esquema, validação e conferência
 * do servidor), sem banco nem cota; a chamada ao modelo é injetada (o avaliador usa `criarChamadaAoModelo`, os testes uma simulada).
 * Mede o que importa para a pessoa que confere: valor ERRADO (a IA preencheu diferente do gabarito) e valor INVENTADO (preencheu o que o
 * texto não diz). O campo OMITIDO só custa o preenchimento à mão. A saída que a conferência do servidor recusa é DESCARTADA: não chega à
 * pessoa e não gasta a cota, mas conta como resposta que não serviu.
 */
import { prepararDecisao } from '@ratione/argumenta';
import type { PedidoModelo, ResultadoModelo, Uso } from '../../ia/contrato';
import { custoUsd } from '../../ia/politica';
import { lerIntimacao, type SaidaIntimacao } from '../../ia/tarefas/lerIntimacao';
import { paragrafosDaIntimacao, type CasoDeIntimacao, type Valores } from './caso';

export type ChamarModelo = (p: PedidoModelo) => Promise<ResultadoModelo>;

export const CAMPOS = ['dias', 'tipoEvento', 'dataEvento', 'tribunal'] as const;
export type Campo = (typeof CAMPOS)[number];

const NEUTRO: Valores = { dias: 0, tipoEvento: 'nao_informado', dataEvento: '', tribunal: '' };
export type Veredito = 'certo' | 'omitido' | 'errado' | 'inventado';

/** Compara o que a IA devolveu com o gabarito, campo a campo. */
export function compararCampos(esperado: Valores, obtido: Valores): Record<Campo, Veredito> {
  const r = {} as Record<Campo, Veredito>;
  for (const c of CAMPOS) {
    const e = esperado[c];
    const o = obtido[c];
    const neutroE = e === NEUTRO[c];
    const neutroO = o === NEUTRO[c];
    r[c] = e === o ? 'certo' : neutroO ? 'omitido' : neutroE ? 'inventado' : 'errado';
  }
  return r;
}

export type EstadoDoCaso = 'ok' | 'descartada' | 'recusa' | 'cortada' | 'falha' | 'nao_enviavel';

export interface ResultadoDaIntimacao {
  casoId: string;
  estado: EstadoDoCaso;
  motivo?: string;
  obtido: Valores | null;
  veredito: Record<Campo, Veredito> | null;
  /** Campos que o servidor retirou da resposta por não terem apoio no texto (a resposta seguiu sem eles). */
  aparados: Campo[];
  uso?: Uso;
  custoUsd: number;
}

const valoresDe = (s: SaidaIntimacao): Valores => ({ dias: s.diasMencionados, tipoEvento: s.tipoEvento, dataEvento: s.dataEvento, tribunal: s.tribunal });

export async function executarIntimacao(caso: CasoDeIntimacao, chamar: ChamarModelo): Promise<ResultadoDaIntimacao> {
  const base = { casoId: caso.id, obtido: null, veredito: null, aparados: [] as Campo[], custoUsd: 0 };
  const entrada = lerIntimacao.validarEntrada({ paragrafos: paragrafosDaIntimacao(caso) });
  if (entrada === null) return { ...base, estado: 'nao_enviavel', motivo: 'entrada recusada pela tarefa (tamanho ou dado pessoal detectável)' };
  const mensagem = lerIntimacao.mensagem(entrada);
  if (mensagem.length > lerIntimacao.maxCaracteresMensagem) return { ...base, estado: 'nao_enviavel', motivo: 'mensagem acima do limite da tarefa' };

  const r = await chamar({
    modelo: lerIntimacao.modelo,
    esforco: lerIntimacao.esforco,
    maxTokens: lerIntimacao.maxTokensSaida,
    instrucoes: lerIntimacao.instrucoes,
    mensagem,
    esquema: lerIntimacao.esquemaSaida
  });
  if (r.tipo === 'falha') return { ...base, estado: 'falha', motivo: r.mensagem };
  const custo = custoUsd(lerIntimacao.modelo, r.uso);
  if (r.tipo !== 'ok') return { ...base, estado: r.tipo, uso: r.uso, custoUsd: custo };

  let json: unknown;
  try {
    json = JSON.parse(r.json);
  } catch {
    json = undefined;
  }
  const lida = lerIntimacao.saida.safeParse(json);
  const saida = lida.success ? { success: true as const, data: lerIntimacao.aparar?.(lida.data, entrada) ?? lida.data } : lida;
  const motivo = !saida.success ? 'fora do formato' : (lerIntimacao.conferirSaida?.(saida.data, entrada) ?? null);
  if (!saida.success || motivo) return { ...base, estado: 'descartada', motivo: motivo ?? 'fora do formato', uso: r.uso, custoUsd: custo };

  const obtido = valoresDe(saida.data);
  const aparados = lida.success ? CAMPOS.filter(c => valoresDe(lida.data)[c] !== obtido[c]) : [];
  return { casoId: caso.id, estado: 'ok', obtido, veredito: compararCampos(caso.esperado, obtido), aparados, uso: r.uso, custoUsd: custo };
}

// ─── Métricas e relatório ─────────────────────────────────────────────────────────────────────────────────────────────────────

export interface MetricasDaRodada {
  casos: number;
  /** Casos que chegaram ao modelo e voltaram com saída válida. */
  respondidos: number;
  descartados: number;
  porCampo: Record<Campo, Record<Veredito, number>>;
  /** Casos respondidos em que os quatro campos bateram com o gabarito. */
  perfeitos: number;
  /** Valores errados ou inventados: o que só a conferência da pessoa pega. */
  erros: number;
  /** Campos retirados pelo servidor por falta de apoio no texto (a resposta seguiu sem eles). */
  camposAparados: number;
  custoUsd: number;
}

export function calcularMetricas(resultados: readonly ResultadoDaIntimacao[]): MetricasDaRodada {
  const vazio = (): Record<Veredito, number> => ({ certo: 0, omitido: 0, errado: 0, inventado: 0 });
  const porCampo = Object.fromEntries(CAMPOS.map(c => [c, vazio()])) as Record<Campo, Record<Veredito, number>>;
  let respondidos = 0;
  let perfeitos = 0;
  let erros = 0;
  let camposAparados = 0;
  let custo = 0;
  for (const r of resultados) {
    custo += r.custoUsd;
    if (r.estado !== 'ok' || !r.veredito) continue;
    respondidos++;
    camposAparados += r.aparados.length;
    for (const c of CAMPOS) {
      porCampo[c][r.veredito[c]]++;
      if (r.veredito[c] === 'errado' || r.veredito[c] === 'inventado') erros++;
    }
    if (CAMPOS.every(c => r.veredito![c] === 'certo')) perfeitos++;
  }
  const chegaram = resultados.filter(r => r.estado !== 'nao_enviavel');
  return { casos: resultados.length, respondidos, descartados: chegaram.length - respondidos, porCampo, perfeitos, erros, camposAparados, custoUsd: Math.round(custo * 1e6) / 1e6 };
}

const ROTULO_CAMPO: Record<Campo, string> = { dias: 'Dias do prazo', tipoEvento: 'Forma da intimação', dataEvento: 'Data do evento', tribunal: 'Tribunal' };
const pct = (n: number, d: number) => (d === 0 ? '—' : `${Math.round((n / d) * 100)}%`);
const mostra = (v: Valores[Campo]) => (v === '' ? '(vazio)' : String(v));

export function montarRelatorio(args: { rodada: string; modelo: string; casos: readonly CasoDeIntimacao[]; resultados: readonly ResultadoDaIntimacao[]; aviso?: string }): string {
  const m = calcularMetricas(args.resultados);
  const linhas: string[] = [
    `# Medição de ler-intimacao · rodada ${args.rodada}`,
    '',
    ...(args.aviso ? [`> **${args.aviso}**`, ''] : []),
    `Modelo: ${args.modelo}. Casos validados: ${m.casos}. Respondidos: ${m.respondidos}. Descartados (fora do formato ou recusados pela conferência do servidor): ${m.descartados}. Custo: US$ ${m.custoUsd.toFixed(4)}.`,
    '',
    `Intimações em que os quatro campos bateram com o gabarito: **${m.perfeitos} de ${m.respondidos}** (${pct(m.perfeitos, m.respondidos)}).`,
    `Valores **errados ou inventados** (só a conferência da pessoa os pega): **${m.erros}**.`,
    `Campos que o servidor retirou por falta de apoio no texto, sem perder o resto da resposta: **${m.camposAparados}**.`,
    '',
    '| Campo | Certo | Omitido | Errado | Inventado |',
    '|---|---|---|---|---|',
    ...CAMPOS.map(c => {
      const p = m.porCampo[c];
      return `| ${ROTULO_CAMPO[c]} | ${p.certo} (${pct(p.certo, m.respondidos)}) | ${p.omitido} | ${p.errado} | ${p.inventado} |`;
    }),
    '',
    'Omitido = a IA deixou em branco o que o texto diz (a pessoa preenche à mão). Errado e inventado são os que importam: a pessoa só os pega se conferir o trecho.',
    '',
    '## Divergências',
    ''
  ];
  let alguma = false;
  for (const r of args.resultados) {
    const caso = args.casos.find(c => c.id === r.casoId);
    if (!caso) continue;
    if (r.estado !== 'ok' || !r.veredito || !r.obtido) {
      alguma = true;
      linhas.push(`- **${r.casoId}**: ${r.estado}${r.motivo ? ` (${r.motivo})` : ''}`);
      continue;
    }
    const difs = CAMPOS.filter(c => r.veredito![c] !== 'certo');
    if (difs.length === 0) continue;
    alguma = true;
    linhas.push(`- **${r.casoId}** (${caso.descricao})`);
    for (const c of difs) linhas.push(`  - ${ROTULO_CAMPO[c]}: esperado ${mostra(caso.esperado[c])}, obtido ${mostra(r.obtido[c])} — ${r.veredito[c]}`);
  }
  if (!alguma) linhas.push('Nenhuma divergência.');
  return linhas.join('\n') + '\n';
}

// ─── Folha de conferência (para o jurista validar o gabarito) ───────────────────────────────────────────────────────────────

const ROTULO_ESPERADO: Record<Campo, string> = { dias: 'Dias escritos no texto', tipoEvento: 'Forma da intimação', dataEvento: 'Data do evento', tribunal: 'Tribunal' };

export function gerarFolha(casos: readonly CasoDeIntimacao[]): string {
  const linhas: string[] = [
    '# Corpus sintético de intimações: folha de conferência',
    '',
    `Gerada por \`pnpm --filter web intimacoes folha\`. Os ${casos.length} textos são inventados (nomes, CPF, OAB e números de processo fictícios), com a redação`,
    'típica do Diário e do PJe. Para cada um, confira se o **gabarito** é o que um jurista marcaria ao ler o texto. O que for validado passa',
    'a medir a IA; o que não for, fica fora das métricas. O bloco "Enviado à IA" mostra o texto como sairia do navegador (já pseudonimizado).',
    '',
    'Regras do gabarito: dias = o que está escrito (0 se não diz); data = a do evento da forma indicada (disponibilização, quando há disponibilização',
    'e publicação); tribunal só se o texto o nomeia (comarca, vara ou cidade não bastam; fica vazio).',
    ''
  ];
  for (const c of casos) {
    const enviado = prepararDecisao(c.texto).paragrafos;
    linhas.push(`## ${c.id}`, '', `_${c.descricao}_`, '', ...c.texto.split('\n').map(l => `> ${l}`), '', '| Campo | Gabarito |', '|---|---|');
    for (const campo of CAMPOS) linhas.push(`| ${ROTULO_ESPERADO[campo]} | ${mostra(c.esperado[campo])} |`);
    linhas.push('', `Validação: ${c.validacao ? `${c.validacao.por}, em ${c.validacao.em}` : 'pendente'}`, '', '<details><summary>Enviado à IA</summary>', '');
    linhas.push(...enviado.map((p, i) => `${i + 1}. ${p}`), '', '</details>', '');
  }
  return linhas.join('\n');
}
