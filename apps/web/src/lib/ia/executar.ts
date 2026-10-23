import { createHash } from 'node:crypto';
import { tarefaDoCatalogo } from './catalogo';
import type { Fontes, PedidoModelo, QualquerTarefa, ResultadoModelo, Uso } from './contrato';
import { custoMaximoUsd, custoUsd } from './politica';

/**
 * Executor único das tarefas de IA. A ordem é sempre a mesma e nenhuma tarefa a muda:
 * ligada → tarefa do catálogo → login → entrada válida → contexto das fontes → tamanho → cache → cota (análise) → reserva (orçamento) →
 * modelo → validação da saída → registro do custo → cache. O modelo recebe só o que o contrato da tarefa monta.
 *
 * A cota é por análise, não por chamada (docs/produto/PLANOS_E_COBRANCA.md §5): conferida uma vez ao iniciar a análise. Tarefa
 * `por-chamada` (a explicação de dispositivo) inicia a própria análise aqui; tarefa `por-analise` (as etapas do Argumenta) recebe o
 * `analiseId` que a tela obteve em `POST /api/analises`. Falha não consome: a análise é cancelada ou estornada no banco.
 * Tarefa com `guardaResultado: false` pula as duas etapas de cache: nada do material do usuário fica guardado.
 */

export type MotivoCota = 'limite_periodo' | 'sem_cota_no_plano';
export type MotivoReserva = 'orcamento' | 'em_andamento' | 'analise_invalida';
export type MotivoNegado = MotivoCota | MotivoReserva;
export type Reserva = { ok: true; id: number } | { ok: false; motivo: MotivoReserva };
export type Situacao = 'gerada' | 'falhou' | 'recusada' | 'invalida';

export type InicioDeAnalise =
  | { ok: true; analiseId: string; restantes: number; renovaEm: string }
  | { ok: false; motivo: MotivoCota; renovaEm: string };

export interface DependenciasExecucao {
  ligada: boolean;
  orcamentoMensalUsd: number;
  fontes: Fontes;
  usuarioAtual: () => Promise<{ id: string } | null>;
  lerCache: (p: { tarefa: string; chave: string }) => Promise<unknown | null>;
  /** Cota do plano: confere e reserva a vaga de uma análise nova (no banco, de forma atômica). */
  iniciarAnalise: (p: { usuarioId: string; tipo: string }) => Promise<InicioDeAnalise>;
  /** A 1ª etapa foi entregue: a análise passa a contar na cota. */
  consumirAnalise: (analiseId: string, usuarioId: string) => Promise<void>;
  /** A última etapa foi entregue (também consome, se ainda não consumiu). */
  concluirAnalise: (analiseId: string, usuarioId: string) => Promise<void>;
  /** Uma etapa falhou: no banco, o cliente pode tentar de novo, e a falha sem solução desiste e estorna a cota. */
  falhaAnalise: (analiseId: string, usuarioId: string) => Promise<void>;
  /** Desiste de uma análise que ainda não consumiu e libera a vaga. */
  cancelarAnalise: (analiseId: string, usuarioId: string) => Promise<void>;
  /** No banco, de forma atômica: análise do usuário em andamento, uma chamada de cada vez por usuário e orçamento do mês de todas as tarefas. */
  reservar: (p: {
    tarefa: string;
    usuarioId: string;
    referencia: string;
    chave: string;
    analiseId: string;
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
  | { status: 200; corpo: { resposta: unknown; doCache: boolean; modelo: string; restantes: number | null } }
  | { status: 400 | 401 | 404 | 413 | 429 | 502 | 503; corpo: { mensagem: string; motivo?: MotivoNegado; renovaEm?: string } };

/** "23/10", no horário de Brasília. */
export function dataDeRenovacao(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' });
}

/** A mensagem que o cliente lê quando a cota do plano não deixa começar. */
export function mensagemDeCota(motivo: MotivoCota, renovaEm: string): string {
  return motivo === 'limite_periodo'
    ? `Você usou toda a cota deste recurso no período do seu plano. Ela renova em ${dataDeRenovacao(renovaEm)}. O que já foi gerado continua disponível.`
    : 'Este recurso não está incluído no seu plano.';
}

const MENSAGEM_NEGADO: Record<'orcamento' | 'em_andamento', string> = {
  orcamento: 'Os recursos de IA atingiram o limite de uso deste mês e voltam no próximo. Sua cota não foi gasta.',
  em_andamento: 'Já há um pedido seu de IA em andamento. Aguarde ele terminar.'
};

const ANALISE_INVALIDA = 'Esta análise não está mais aberta. Comece uma nova.';
const FALHOU = 'O recurso de IA falhou agora. Sua cota não foi gasta. Tente de novo em alguns minutos.';
const NAO_GEROU = 'Não foi possível gerar o resultado agora. Sua cota não foi gasta.';

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

  const guardada = t.guardaResultado ? await dep.lerCache({ tarefa: t.id, chave }) : null;
  const valida = guardada !== null ? t.saida.safeParse(guardada) : null;
  if (valida?.success) {
    await dep.registrarCache({ tarefa: t.id, usuarioId: usuario.id, referencia, chave });
    return { status: 200, corpo: { resposta: valida.data, doCache: true, modelo: t.modelo, restantes: null } };
  }

  // Cota do plano: a explicação inicia a própria análise; as etapas do Argumenta trazem a análise que a tela iniciou
  const porChamada = t.cota.modo === 'por-chamada';
  let analiseId: string;
  let restantes: number | null = null;
  if (porChamada) {
    const inicio = await dep.iniciarAnalise({ usuarioId: usuario.id, tipo: t.cota.tipo });
    if (!inicio.ok) {
      return { status: 429, corpo: { mensagem: mensagemDeCota(inicio.motivo, inicio.renovaEm), motivo: inicio.motivo, renovaEm: inicio.renovaEm } };
    }
    analiseId = inicio.analiseId;
    restantes = inicio.restantes;
  } else {
    analiseId = t.analiseDe!(entrada);
  }
  /** Falha sem entregar: a explicação libera a vaga; a etapa de uma análise conta a falha (o banco decide a hora de desistir e estornar). */
  const falhou = () => (porChamada ? dep.cancelarAnalise(analiseId, usuario.id) : dep.falhaAnalise(analiseId, usuario.id));

  const reserva = await dep.reservar({
    tarefa: t.id,
    usuarioId: usuario.id,
    referencia,
    chave,
    analiseId,
    orcamentoMensalUsd: dep.orcamentoMensalUsd,
    custoMaximoUsd: custoMaximoUsd(t)
  });
  if (!reserva.ok) {
    if (porChamada) await dep.cancelarAnalise(analiseId, usuario.id);
    if (reserva.motivo === 'analise_invalida') return { status: 400, corpo: { mensagem: ANALISE_INVALIDA, motivo: 'analise_invalida' } };
    return { status: 429, corpo: { mensagem: MENSAGEM_NEGADO[reserva.motivo], motivo: reserva.motivo } };
  }

  const r = await dep.chamarModelo({ modelo: t.modelo, esforco: t.esforco, maxTokens: t.maxTokensSaida, instrucoes: t.instrucoes, mensagem, esquema: t.esquemaSaida });
  if (r.tipo === 'falha') {
    dep.avisar?.('IA: chamada falhou', { tarefa: t.id, referencia, erro_mensagem: r.mensagem });
    await dep.finalizar(reserva.id, 'falhou', null, 0);
    await falhou();
    return { status: 502, corpo: { mensagem: FALHOU } };
  }
  const custo = custoUsd(t.modelo, r.uso);
  if (r.tipo !== 'ok') {
    dep.avisar?.(r.tipo === 'recusa' ? 'IA: modelo recusou' : 'IA: resposta cortada', { tarefa: t.id, referencia });
    await dep.finalizar(reserva.id, r.tipo === 'recusa' ? 'recusada' : 'invalida', r.uso, custo);
    await falhou();
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
    await falhou();
    return { status: 502, corpo: { mensagem: NAO_GEROU } };
  }

  await dep.finalizar(reserva.id, 'gerada', r.uso, custo);
  if (porChamada || t.cota.conclui) await dep.concluirAnalise(analiseId, usuario.id);
  else if (t.cota.consome) await dep.consumirAnalise(analiseId, usuario.id);
  if (t.guardaResultado) await dep.gravarCache({ tarefa: t.id, chave, referencia, versao: t.versao, modelo: t.modelo, resposta: saida.data });
  return { status: 200, corpo: { resposta: saida.data, doCache: false, modelo: t.modelo, restantes } };
}
