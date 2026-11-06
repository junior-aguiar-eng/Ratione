/**
 * F5-10: o que se aceita como análise salva. O navegador manda o estado da análise aberta (decisão completa, resultados e selos); o servidor
 * confere o formato e o tamanho antes de cifrar e guardar. Nada daqui interpreta o texto da decisão: só a forma. As três etapas de IA são
 * conferidas pelos mesmos esquemas que as geram, para uma análise guardada poder ser reaberta com segurança.
 */
import { SaidaEstrutura, SaidaFundamentos, SaidaQuestoes } from '../ia/tarefas/argumenta';
import { destinoDoEndereco } from '../caso/ligacao';

export const LIMITES_DE_ANALISE_SALVA = {
  /** Quantas análises uma pessoa pode ter salvas ao mesmo tempo (decisão do responsável, 06/11/2026). */
  maxPorUsuario: 10,
  /** Tamanho do conteúdo (JSON) de cada análise. A decisão passa de 70.000 caracteres só raramente. */
  maxBytes: 5 * 1024 * 1024,
  maxCitacoes: 200,
  maxParagrafos: 1500,
  maxRotulo: 80
} as const;

/** Prazos que a pessoa escolhe (decisão do responsável, 06/11/2026). `sempre` não vence: só a pessoa apaga. */
export const PRAZOS_DE_ANALISE = { '30d': 30, '6m': 183, '1a': 365, sempre: null } as const;
export type PrazoDeAnalise = keyof typeof PRAZOS_DE_ANALISE;

export const ROTULO_DO_PRAZO: Record<PrazoDeAnalise, string> = { '30d': '30 dias', '6m': '6 meses', '1a': '1 ano', sempre: 'Até eu excluir' };

export function lerPrazo(valor: unknown): PrazoDeAnalise | null {
  return typeof valor === 'string' && Object.prototype.hasOwnProperty.call(PRAZOS_DE_ANALISE, valor) ? (valor as PrazoDeAnalise) : null;
}

/** O rótulo é opcional e pode ter nome de parte: só se limita o tamanho e se tiram espaços e quebras de linha. */
export function limparRotulo(valor: unknown): string | null {
  if (typeof valor !== 'string') return null;
  const t = valor.replace(/\s+/g, ' ').trim().slice(0, LIMITES_DE_ANALISE_SALVA.maxRotulo);
  return t || null;
}

export interface ConteudoSalvo {
  versao: 1;
  enviada: { paragrafos: string[]; substituicoes: unknown[]; caracteres: number };
  resultados: { estrutura: unknown; questoes?: unknown; fundamentos?: unknown };
  /** [citação sem espaços nas pontas, verificação]: o mesmo que a análise guarda na memória da aba. */
  selos: Array<[string, { estado: string; links: Array<{ rotulo: string; href: string }>; aviso?: string }]>;
}

export type ResultadoDaValidacao = { ok: true; conteudo: ConteudoSalvo; citacoes: string[] } | { ok: false; mensagem: string };

const falha = (mensagem: string): ResultadoDaValidacao => ({ ok: false, mensagem });
const objeto = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const ESTADOS = new Set(['encontrada', 'nao_localizada', 'fora_do_corpus']);
const ID_PUBLICO = /^[^\u0000-\u001f]{1,120}$/;

/** `normaviva:<dispositivo>` ou `tesemap:<nó>` de cada citação encontrada: identificadores públicos, sem dado pessoal. */
export function citacoesDosSelos(selos: ConteudoSalvo['selos']): string[] {
  const ids = new Set<string>();
  for (const [, v] of selos) {
    if (v.estado !== 'encontrada') continue;
    for (const l of v.links) {
      const d = destinoDoEndereco(l.href);
      if (d && ID_PUBLICO.test(d.id)) ids.add(`${d.ferramenta}:${d.id}`);
    }
  }
  return [...ids].slice(0, LIMITES_DE_ANALISE_SALVA.maxCitacoes);
}

export function validarConteudo(valor: unknown): ResultadoDaValidacao {
  if (!objeto(valor) || valor.versao !== 1) return falha('Conteúdo da análise inválido.');
  const { enviada, resultados, selos } = valor;

  if (!objeto(enviada) || !Array.isArray(enviada.paragrafos) || enviada.paragrafos.length === 0 || enviada.paragrafos.length > LIMITES_DE_ANALISE_SALVA.maxParagrafos) {
    return falha('A decisão da análise está vazia ou passa do limite de parágrafos.');
  }
  if (!enviada.paragrafos.every(p => typeof p === 'string')) return falha('Os parágrafos da decisão precisam ser texto.');
  if (!Array.isArray(enviada.substituicoes) || enviada.substituicoes.length > 20_000 || !enviada.substituicoes.every(objeto)) return falha('A tabela de troca da análise é inválida.');
  if (typeof enviada.caracteres !== 'number' || !Number.isFinite(enviada.caracteres)) return falha('O tamanho da decisão é inválido.');

  if (!objeto(resultados)) return falha('Os resultados da análise são inválidos.');
  if (!SaidaEstrutura.safeParse(resultados.estrutura).success) return falha('A estrutura da análise é inválida.');
  if (resultados.questoes !== undefined && !SaidaQuestoes.safeParse(resultados.questoes).success) return falha('As questões da análise são inválidas.');
  if (resultados.fundamentos !== undefined && !SaidaFundamentos.safeParse(resultados.fundamentos).success) return falha('Os fundamentos da análise são inválidos.');

  if (!Array.isArray(selos) || selos.length > LIMITES_DE_ANALISE_SALVA.maxCitacoes) return falha('Os selos das citações são inválidos.');
  const selosLidos: ConteudoSalvo['selos'] = [];
  for (const par of selos) {
    if (!Array.isArray(par) || par.length !== 2 || typeof par[0] !== 'string' || !objeto(par[1])) return falha('Os selos das citações são inválidos.');
    const v = par[1];
    if (typeof v.estado !== 'string' || !ESTADOS.has(v.estado) || !Array.isArray(v.links) || v.links.length > 10) return falha('Os selos das citações são inválidos.');
    const links = v.links.filter((l): l is { rotulo: string; href: string } => objeto(l) && typeof l.rotulo === 'string' && typeof l.href === 'string');
    if (links.length !== v.links.length) return falha('Os selos das citações são inválidos.');
    selosLidos.push([par[0], { estado: v.estado, links, ...(typeof v.aviso === 'string' ? { aviso: v.aviso } : {}) }]);
  }

  const conteudo: ConteudoSalvo = {
    versao: 1,
    enviada: { paragrafos: enviada.paragrafos as string[], substituicoes: enviada.substituicoes, caracteres: enviada.caracteres },
    resultados: { estrutura: resultados.estrutura, questoes: resultados.questoes, fundamentos: resultados.fundamentos },
    selos: selosLidos
  };
  return { ok: true, conteudo, citacoes: citacoesDosSelos(selosLidos) };
}
