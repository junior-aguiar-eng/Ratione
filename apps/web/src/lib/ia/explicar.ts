import { createHash } from 'node:crypto';
import { MAX_CARACTERES_TEXTO, MODELO, VERSAO_PROMPT, custoMaximoUsd, custoUsd, type Limites, type Uso } from './politica';
import { RespostaExplicacao, type DispositivoParaExplicar } from './prompt';

/** O que a chamada ao modelo devolve, já classificado (a classificação dos erros do SDK fica em `cliente.ts`). */
export type ResultadoModelo =
  | { tipo: 'ok'; json: string; uso: Uso }
  | { tipo: 'recusa'; uso: Uso }
  | { tipo: 'cortada'; uso: Uso }
  | { tipo: 'falha'; mensagem: string };

export type MotivoNegado = 'limite_dia' | 'limite_mes' | 'orcamento' | 'em_andamento';

export type Reserva = { ok: true; id: number; restantesHoje: number } | { ok: false; motivo: MotivoNegado };

export type Situacao = 'gerada' | 'falhou' | 'recusada' | 'invalida';

export interface DependenciasExplicacao {
  ligada: boolean;
  limites: Limites;
  usuarioAtual: () => Promise<{ id: string } | null>;
  lerDispositivo: (id: string) => Promise<DispositivoParaExplicar | null>;
  lerCache: (chave: string) => Promise<RespostaExplicacao | null>;
  /** No banco, de forma atômica: confere cota do usuário, chamada em andamento e orçamento do mês, e grava a reserva com o custo máximo. */
  reservar: (p: { usuarioId: string; dispositivoId: string; chave: string; limites: Limites; custoMaximoUsd: number }) => Promise<Reserva>;
  /** Uso servido do cache: registrado sem custo e sem contar na cota. */
  registrarCache: (p: { usuarioId: string; dispositivoId: string; chave: string }) => Promise<void>;
  chamarModelo: (d: DispositivoParaExplicar) => Promise<ResultadoModelo>;
  /** Troca o custo reservado pelo custo real (zero se a chamada não chegou a ser cobrada). */
  finalizar: (reservaId: number, situacao: Situacao, uso: Uso | null, custoUsd: number) => Promise<void>;
  gravarCache: (p: { chave: string; dispositivo: DispositivoParaExplicar; resposta: RespostaExplicacao }) => Promise<void>;
}

export type RespostaRota =
  | { status: 200; corpo: { explicacao: RespostaExplicacao; doCache: boolean; modelo: string; restantesHoje: number | null } }
  | { status: 400 | 401 | 404 | 413 | 429 | 502 | 503; corpo: { mensagem: string; motivo?: MotivoNegado } };

const MENSAGEM_NEGADO: Record<MotivoNegado, string> = {
  limite_dia: 'Você atingiu o limite de explicações por IA de hoje. Explicações já geradas continuam disponíveis.',
  limite_mes: 'Você atingiu o limite de explicações por IA deste mês.',
  orcamento: 'A explicação por IA atingiu o limite de uso deste mês e volta no próximo.',
  em_andamento: 'Já há uma explicação sua sendo gerada. Aguarde ela terminar.'
};

/** Mesma explicação para o mesmo modelo, a mesma versão do prompt e o mesmo texto do dispositivo. */
export function chaveDaExplicacao(d: Pick<DispositivoParaExplicar, 'id' | 'texto'>): string {
  const hashTexto = createHash('sha256').update(d.texto).digest('hex');
  return createHash('sha256').update([MODELO, VERSAO_PROMPT, d.id, hashTexto].join('|')).digest('hex');
}

/** Só aceita o formato de id do NormaViva (`NORMA|escopo|rótulo`): nada de texto livre chega ao modelo. */
export function idValido(id: unknown): id is string {
  return typeof id === 'string' && id.length <= 200 && /^[A-Z]{2,4}(?:-\d+)?-\d{4}\|[A-Za-z0-9-]+\|[^|<>]+$/.test(id);
}

export async function explicarDispositivo(dispositivoId: unknown, dep: DependenciasExplicacao): Promise<RespostaRota> {
  if (!dep.ligada) return { status: 503, corpo: { mensagem: 'A explicação por IA não está disponível nesta instalação.' } };
  const usuario = await dep.usuarioAtual();
  if (!usuario) return { status: 401, corpo: { mensagem: 'Entre na sua conta para pedir a explicação por IA.' } };
  if (!idValido(dispositivoId)) return { status: 400, corpo: { mensagem: 'Dispositivo inválido.' } };

  const d = await dep.lerDispositivo(dispositivoId);
  if (!d) return { status: 404, corpo: { mensagem: 'Dispositivo não encontrado.' } };
  if (d.texto.length > MAX_CARACTERES_TEXTO) {
    return { status: 413, corpo: { mensagem: 'Este dispositivo é longo demais para a explicação por IA. Abra um parágrafo ou inciso dele.' } };
  }

  const chave = chaveDaExplicacao(d);
  const guardada = await dep.lerCache(chave);
  if (guardada) {
    await dep.registrarCache({ usuarioId: usuario.id, dispositivoId: d.id, chave });
    return { status: 200, corpo: { explicacao: guardada, doCache: true, modelo: MODELO, restantesHoje: null } };
  }

  const reserva = await dep.reservar({ usuarioId: usuario.id, dispositivoId: d.id, chave, limites: dep.limites, custoMaximoUsd: custoMaximoUsd() });
  if (!reserva.ok) return { status: 429, corpo: { mensagem: MENSAGEM_NEGADO[reserva.motivo], motivo: reserva.motivo } };

  const r = await dep.chamarModelo(d);
  if (r.tipo === 'falha') {
    await dep.finalizar(reserva.id, 'falhou', null, 0);
    return { status: 502, corpo: { mensagem: 'A explicação por IA falhou agora. Tente de novo em alguns minutos.' } };
  }
  const custo = custoUsd(r.uso);
  if (r.tipo !== 'ok') {
    await dep.finalizar(reserva.id, r.tipo === 'recusa' ? 'recusada' : 'invalida', r.uso, custo);
    return { status: 502, corpo: { mensagem: 'Não foi possível gerar a explicação deste dispositivo.' } };
  }

  let resposta: RespostaExplicacao;
  try {
    resposta = RespostaExplicacao.parse(JSON.parse(r.json));
  } catch {
    await dep.finalizar(reserva.id, 'invalida', r.uso, custo);
    return { status: 502, corpo: { mensagem: 'Não foi possível gerar a explicação deste dispositivo.' } };
  }
  await dep.finalizar(reserva.id, 'gerada', r.uso, custo);
  await dep.gravarCache({ chave, dispositivo: d, resposta });
  return { status: 200, corpo: { explicacao: resposta, doCache: false, modelo: MODELO, restantesHoje: reserva.restantesHoje } };
}
