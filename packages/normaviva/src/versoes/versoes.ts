/**
 * Versões dos dispositivos a partir das anotações do Planalto (F3-03).
 *
 * O que o corpus permite e o que não permite:
 * - O texto COMPILADO traz só a redação vigente. A redação anterior fica tachada ou some, e o parser descarta o tachado.
 *   Por isso há UMA versão por dispositivo: a vigente, com o ato que lhe deu a redação. O texto de datas anteriores à
 *   última alteração NÃO está no corpus (`textoAnteriorDisponivel: false`); a F3-04 precisa de outra fonte para ele.
 * - A anotação diz qual ato alterou, não quando a alteração entrou em vigor (vacatio legis). Decisão do revisor (19/10/2026):
 *   o início de vigência é PROVISÓRIO, igual à data de publicação do ato (API do Senado), e a versão sai com
 *   `vigenciaConfirmada: false`. Só uma cláusula de vigência lida muda isso. A consulta temporal tem de avisar.
 * - Sem data de publicação do Senado (ex.: ato que o Senado não lista como alteração), vale a data completa da própria anotação
 *   ("de 11.7.1984", data de assinatura); só com o ano, `vigenteDe` fica nulo e `anoDoAto` guarda o ano.
 */
import { atosDoTexto, type AtoSenado } from '../coleta/conferir';
import type { Anotacao, DispositivoParseado } from '../parser';

export type OrigemVersao = 'redacao_original' | 'redacao_dada' | 'incluido' | 'revogado' | 'vetado';

export interface AtoDaVersao {
  chave: string;
  /** "Lei nº 13.256 de 04/02/2016", como o Senado nomeia. Ausente quando o Senado não lista o ato. */
  rotulo: string | null;
  assinatura: string | null;
  publicacao: string | null;
  /** De onde veio a data de `vigenteDe`: publicação do Senado, data da anotação, ou só o ano. */
  fonteDaData: 'publicacao_senado' | 'assinatura_senado' | 'anotacao' | 'ano' | 'norma';
}

export interface VersaoNormativa {
  normaId: string;
  escopo: string;
  rotulo: string;
  tipo: DispositivoParseado['tipo'];
  numero: string;
  texto: string;
  origem: OrigemVersao;
  /** Ato que deu esta redação; nulo na redação original da norma. */
  ato: AtoDaVersao | null;
  /** ISO. Provisório (ver acima). Nulo só quando nem a data completa do ato se conhece. */
  vigenteDe: string | null;
  anoDoAto: number | null;
  vigenciaConfirmada: false;
  /** Sempre nulo: o corpus só tem a redação vigente. */
  vigenteAte: null;
  revogado: boolean;
  /** Todas as anotações do dispositivo, para auditoria. */
  anotacoes: Anotacao[];
  textoAnteriorDisponivel: false;
}

export interface DatasDaNorma {
  norma: { nome: string; assinatura: string | null; publicacao: string | null };
  atos: Record<string, AtoSenado>;
}

const ORIGEM_DA_ANOTACAO: Partial<Record<Anotacao['tipo'], OrigemVersao>> = { redacao_dada: 'redacao_dada', incluido: 'incluido', revogado: 'revogado' };

export interface Candidato {
  origem: OrigemVersao;
  ato: AtoDaVersao;
  vigenteDe: string | null;
  anoDoAto: number | null;
}

export function candidatoDaAnotacao(a: Anotacao, datas: DatasDaNorma): Candidato | undefined {
  const origem = ORIGEM_DA_ANOTACAO[a.tipo];
  if (!origem) return undefined;
  const atos = atosDoTexto(a.texto);
  if (atos.length === 0) return undefined;
  // Anotação com mais de um ato ("pela Lei X e pela Lei Y"): vale o último citado, que é o mais recente na ordem do Planalto
  const { chave, dataIso } = atos[atos.length - 1];
  const senado = datas.atos[chave];
  const ano = Number(chave.split(':')[2]);
  if (senado?.publicacao) {
    return { origem, ato: { chave, rotulo: senado.nome, assinatura: senado.assinatura, publicacao: senado.publicacao, fonteDaData: 'publicacao_senado' }, vigenteDe: senado.publicacao, anoDoAto: ano };
  }
  if (senado?.assinatura) {
    return { origem, ato: { chave, rotulo: senado.nome, assinatura: senado.assinatura, publicacao: null, fonteDaData: 'assinatura_senado' }, vigenteDe: senado.assinatura, anoDoAto: ano };
  }
  if (dataIso) {
    return { origem, ato: { chave, rotulo: null, assinatura: dataIso, publicacao: null, fonteDaData: 'anotacao' }, vigenteDe: dataIso, anoDoAto: ano };
  }
  return { origem, ato: { chave, rotulo: null, assinatura: null, publicacao: null, fonteDaData: 'ano' }, vigenteDe: null, anoDoAto: ano };
}

/** O candidato mais recente vence: data de vigência, depois ano. Empate fica com o que aparece por último na anotação. */
function maisRecente(candidatos: Candidato[]): Candidato | undefined {
  let melhor: Candidato | undefined;
  const peso = (c: Candidato) => c.vigenteDe ?? `${c.anoDoAto ?? 0}-12-31`;
  for (const c of candidatos) if (!melhor || peso(c) >= peso(melhor)) melhor = c;
  return melhor;
}

export function versaoDoDispositivo(normaId: string, d: DispositivoParseado, datas: DatasDaNorma): VersaoNormativa {
  const atual = maisRecente(d.anotacoes.map(a => candidatoDaAnotacao(a, datas)).filter((c): c is Candidato => !!c));
  const base = {
    normaId,
    escopo: d.escopo,
    rotulo: d.rotulo,
    tipo: d.tipo,
    numero: d.numero,
    texto: d.texto,
    vigenciaConfirmada: false as const,
    vigenteAte: null,
    anotacoes: d.anotacoes,
    textoAnteriorDisponivel: false as const
  };
  // Dispositivo vetado ("VETADO"): nunca teve texto vigente; não é redação original nem revogação
  if (!atual && d.texto === '' && d.anotacoes.some(a => a.tipo === 'vetado')) {
    return { ...base, origem: 'vetado', ato: null, vigenteDe: null, anoDoAto: null, revogado: false };
  }
  if (!atual) {
    return {
      ...base,
      origem: 'redacao_original',
      ato: null,
      vigenteDe: datas.norma.publicacao,
      anoDoAto: null,
      revogado: d.revogado
    };
  }
  return { ...base, origem: atual.origem, ato: atual.ato, vigenteDe: atual.vigenteDe, anoDoAto: atual.anoDoAto, revogado: d.revogado || atual.origem === 'revogado' };
}

export function versoesDaNorma(normaId: string, dispositivos: DispositivoParseado[], datas: DatasDaNorma): VersaoNormativa[] {
  return dispositivos.map(d => versaoDoDispositivo(normaId, d, datas));
}
