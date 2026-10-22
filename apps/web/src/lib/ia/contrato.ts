import type { z } from 'zod';
import type { DispositivoParaExplicar } from './fontes/dispositivoDoBanco';

/**
 * Contrato de uma tarefa de IA do Ratione. Regra do produto (decisão do responsável, 22/10/2026): a IA nunca conversa; cada uso é uma
 * tarefa fechada, declarada aqui por inteiro, e o código conduz tudo (o que entra, o que o modelo recebe, o que sai e o que é mostrado).
 * O modelo só preenche o formato de saída. Ver `docs/produto/IA_TAREFAS.md`.
 */

/** Modelos com preço registrado em `politica.ts`. Outro modelo exige decisão do responsável e a linha de preço. */
export type ModeloPermitido = 'claude-haiku-5-5';

/**
 * Fontes de leitura que uma tarefa pode usar para montar o contexto. Só leitura das bases do Ratione:
 * nenhuma tarefa escreve, busca na web ou lê dado de outro usuário.
 */
export interface Fontes {
  lerDispositivo: (id: string) => Promise<DispositivoParaExplicar | null>;
}

/** JSON Schema da saída: objeto fechado (`additionalProperties: false`, todos os campos obrigatórios). */
export type EsquemaSaida = { type: 'object'; properties: Record<string, unknown>; required: readonly string[]; additionalProperties: false };

export interface TarefaIA<Entrada, Contexto, Saida> {
  /** Identificador estável, igual à chave no catálogo e ao final da rota (`/api/ia/<id>`). */
  id: string;
  /** O que a tarefa faz, em uma frase. */
  descricao: string;
  /** Onde e como o usuário dispara (sempre uma ação explícita na tela; nunca automático, nunca campo de conversa). */
  gatilho: string;
  modelo: ModeloPermitido;
  esforco: 'low' | 'medium';
  maxTokensSaida: number;
  /** Tamanho máximo da mensagem montada; acima disso a tarefa recusa (não se corta texto em silêncio). */
  maxCaracteresMensagem: number;
  /** Muda sempre que as instruções, a mensagem ou o esquema mudam (invalida o cache). */
  versao: string;
  /** Instruções do sistema: fixas, sem data nem dado variável. */
  instrucoes: string;
  /** Tarefas fechadas não chamam ferramentas. Etapas com consulta são código, fora do modelo. */
  ferramentas: readonly [];
  limitesPorUsuario: { porDia: number; porMes: number };
  /** O que o usuário pode mandar; qualquer outra coisa é recusada (400). Nunca pergunta livre. */
  validarEntrada: (bruta: unknown) => Entrada | null;
  /** Busca nas fontes o que o modelo vai receber; `null` = não encontrado (404). */
  montarContexto: (entrada: Entrada, fontes: Fontes) => Promise<Contexto | null>;
  /** Referência registrada no uso (ex.: o id do dispositivo), para auditoria. */
  referencia: (contexto: Contexto) => string;
  /** A mensagem ao modelo: só o contexto, com o material do usuário ou da base delimitado como dado. */
  mensagem: (contexto: Contexto) => string;
  esquemaSaida: EsquemaSaida;
  /** Validação da saída depois do modelo; o que não passa é descartado. */
  saida: z.ZodType<Saida>;
  /** Conferência adicional da saída contra o contexto (opcional): devolve o motivo da recusa, ou `null`. */
  conferirSaida?: (saida: Saida, contexto: Contexto) => string | null;
}

/** Pedido ao modelo, montado só pelo executor a partir do contrato. */
export interface PedidoModelo {
  modelo: ModeloPermitido;
  esforco: 'low' | 'medium';
  maxTokens: number;
  instrucoes: string;
  mensagem: string;
  esquema: EsquemaSaida;
}

export interface Uso {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
}

/** O que a chamada ao modelo devolve, já classificado (a classificação dos erros do SDK fica em `cliente.ts`). */
export type ResultadoModelo =
  | { tipo: 'ok'; json: string; uso: Uso }
  | { tipo: 'recusa'; uso: Uso }
  | { tipo: 'cortada'; uso: Uso }
  | { tipo: 'falha'; mensagem: string };

/** Qualquer tarefa do catálogo (cada uma tem os próprios tipos de entrada, contexto e saída). */
export type QualquerTarefa = TarefaIA<any, any, any>;
