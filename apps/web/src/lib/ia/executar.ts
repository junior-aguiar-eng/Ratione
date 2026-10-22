import { createHash } from 'node:crypto';
import { tarefaDoCatalogo } from './catalogo';
import type { Fontes, PedidoModelo, QualquerTarefa, ResultadoModelo, Uso } from './contrato';
import { custoMaximoUsd, custoUsd, limitesDaTarefa } from './politica';

/**
 * Executor único das tarefas de IA. A ordem é sempre a mesma e nenhuma tarefa a muda:
 * ligada → tarefa do catálogo → login → entrada válida → contexto das fontes → tamanho → cache → reserva (cota e orçamento) →
 * modelo → validação da saída → registro do custo → cache. O modelo recebe só o que o contrato da tarefa monta.
 */

export type MotivoNegado = 'limite_dia' | 'limite_mes' | 'orcamento' | 'em_andamento';
export type Reserva = { ok: true; id: number; restantesHoje: number } | { ok: false; motivo: MotivoNegado };
export type Situacao = 'gerada' | 'falhou' | 'recusada' | 'invalida';

export interface DependenciasExecucao {
  ligada: boolean;
  env: Record<string, string | undefined>;
  orcamentoMensalUsd: number;
  fontes: Fontes;
  usuarioAtual: () => Promise<{ id: string } | null>;
  lerCache: (p: { tarefa: string; chave: string }) => Promise<unknown | null>;
  /** No banco, de forma atômica: cota do usuário na tarefa, uma chamada de cada vez por usuário e orçamento do mês de todas as tarefas. */
  reservar: (p: {
    tarefa: string;
    usuarioId: string;
    referencia: string;
    chave: string;
    porDia: number;
    porMes: number;
    orcamentoMensalUsd: number;
    custoMaximoUsd: number;
  }) => Promise<Reserva>;
  /** Uso servido do cache: registrado sem custo e sem contar na cota. */
  registrarCache: (p: { tarefa: string; usuarioId: string; referencia: string; chave: string }) => Promise<void>;
  chamarModelo: (p: PedidoModelo) => Promise<ResultadoModelo>;
  /** Troca o custo reservado pelo custo real (zero se a chamada não chegou a ser cobrada). */
  finalizar: (reservaId: number, situacao: Situacao, uso: Uso | null, custoUsd: number) => Promise<void>;
  gravarCache: (p: { tarefa: string; chave: string; referencia: string; versao: string; modelo: string; resposta: unknown }) => Promise<void>;
  /** Registro de falhas e recusas (log do servidor). */
  avisar?: (mensagem: string, campos: Record<string, string | number | boolean | null | undefined>) => void;
}

export type RespostaExecucao =
  | { status: 200; corpo: { resposta: unknown; doCache: boolean; modelo: string; restantesHoje: number | null } }
  | { status: 400 | 401 | 404 | 413 | 429 | 502 | 503; corpo: { mensagem: string; motivo?: MotivoNegado } };

const MENSAGEM_NEGADO: Record<MotivoNegado, string> = {
  limite_dia: 'Você atingiu o limite de hoje para este recurso de IA. O que já foi gerado continua disponível.',
  limite_mes: 'Você atingiu o limite deste mês para este recurso de IA.',
  orcamento: 'Os recursos de IA atingiram o limite de uso deste mês e voltam no próximo.',
  em_andamento: 'Já há um pedido seu de IA em andamento. Aguarde ele terminar.'
};

const FALHOU = 'O recurso de IA falhou agora. Tente de novo em alguns minutos.';
const NAO_GEROU = 'Não foi possível gerar o resultado agora.';

/** Mesmo resultado para a mesma tarefa, versão, modelo e mensagem montada (que contém todo o contexto). */
export function chaveDoCache(t: QualquerTarefa, mensagem: string): string {
  return createHash('sha256').update([t.id, t.versao, t.modelo, mensagem].join('\u0000')).digest('hex');
}

export async function executarTarefa(idTarefa: unknown, entradaBruta: unknown, dep: DependenciasExecucao): Promise<RespostaExecucao> {
  if (!dep.ligada) return { status: 503, corpo: { mensagem: 'Os recursos de IA não estão disponíveis nesta instalação.' } };
  const t = tarefaDoCatalogo(idTarefa);
  if (!t) return { status: 404, corpo: { mensagem: 'Recurso de IA inexistente.' } };
  const usuario = await dep.usuarioAtual();
  if (!usuario) return { status: 401, corpo: { mensagem: 'Entre na sua conta para usar os recursos de IA.' } };

  const entrada = t.validarEntrada(entradaBruta);
  if (entrada === null) return { status: 400, corpo: { mensagem: 'Pedido inválido.' } };
  const contexto = await t.montarContexto(entrada, dep.fontes);
  if (contexto === null) return { status: 404, corpo: { mensagem: 'Não encontrado.' } };

  const mensagem = t.mensagem(contexto);
  if (mensagem.length > t.maxCaracteresMensagem) {
    return { status: 413, corpo: { mensagem: 'O conteúdo é longo demais para este recurso de IA. Abra uma parte menor.' } };
  }
  const referencia = t.referencia(contexto);
  const chave = chaveDoCache(t, mensagem);

  const guardada = await dep.lerCache({ tarefa: t.id, chave });
  const valida = guardada !== null ? t.saida.safeParse(guardada) : null;
  if (valida?.success) {
    await dep.registrarCache({ tarefa: t.id, usuarioId: usuario.id, referencia, chave });
    return { status: 200, corpo: { resposta: valida.data, doCache: true, modelo: t.modelo, restantesHoje: null } };
  }

  const limites = limitesDaTarefa(t, dep.env);
  const reserva = await dep.reservar({
    tarefa: t.id,
    usuarioId: usuario.id,
    referencia,
    chave,
    porDia: limites.porDia,
    porMes: limites.porMes,
    orcamentoMensalUsd: dep.orcamentoMensalUsd,
    custoMaximoUsd: custoMaximoUsd(t)
  });
  if (!reserva.ok) return { status: 429, corpo: { mensagem: MENSAGEM_NEGADO[reserva.motivo], motivo: reserva.motivo } };

  const r = await dep.chamarModelo({ modelo: t.modelo, esforco: t.esforco, maxTokens: t.maxTokensSaida, instrucoes: t.instrucoes, mensagem, esquema: t.esquemaSaida });
  if (r.tipo === 'falha') {
    dep.avisar?.('IA: chamada falhou', { tarefa: t.id, referencia, erro_mensagem: r.mensagem });
    await dep.finalizar(reserva.id, 'falhou', null, 0);
    return { status: 502, corpo: { mensagem: FALHOU } };
  }
  const custo = custoUsd(t.modelo, r.uso);
  if (r.tipo !== 'ok') {
    dep.avisar?.(r.tipo === 'recusa' ? 'IA: modelo recusou' : 'IA: resposta cortada', { tarefa: t.id, referencia });
    await dep.finalizar(reserva.id, r.tipo === 'recusa' ? 'recusada' : 'invalida', r.uso, custo);
    return { status: 502, corpo: { mensagem: NAO_GEROU } };
  }

  let json: unknown;
  try {
    json = JSON.parse(r.json);
  } catch {
    json = undefined;
  }
  const saida = t.saida.safeParse(json);
  const motivo = !saida.success ? 'fora do formato' : (t.conferirSaida?.(saida.data, contexto) ?? null);
  if (!saida.success || motivo) {
    dep.avisar?.('IA: saída descartada', { tarefa: t.id, referencia, motivo });
    await dep.finalizar(reserva.id, 'invalida', r.uso, custo);
    return { status: 502, corpo: { mensagem: NAO_GEROU } };
  }

  await dep.finalizar(reserva.id, 'gerada', r.uso, custo);
  await dep.gravarCache({ tarefa: t.id, chave, referencia, versao: t.versao, modelo: t.modelo, resposta: saida.data });
  return { status: 200, corpo: { resposta: saida.data, doCache: false, modelo: t.modelo, restantesHoje: reserva.restantesHoje } };
}
