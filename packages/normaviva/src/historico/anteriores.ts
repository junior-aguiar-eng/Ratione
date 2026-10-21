/**
 * Redações anteriores no banco (F3-04): cada caso do F3-07 vira uma segunda linha em `versoes_dispositivo`, com o texto A, o ato que lhe deu
 * a redação (quando a anotação do próprio texto tachado o nomeia), o fim em `vigente_ate` e a origem do texto (`tachado_planalto`).
 *
 * Duas regras de honestidade, as mesmas da versão vigente (F3-03):
 * - a vigência é PROVISÓRIA (publicação do ato); o fim de A é a véspera da publicação do ato que deu a redação B;
 * - o início de A só se conhece quando a anotação do tachado nomeia o ato e há data dele; senão fica nulo (ou, na redação original, é a
 *   publicação da norma). A tela não afirma o que a base não sabe.
 * A linha leva a validação do caso (`conferida_por` e `conferida_em`) quando o revisor a registrou.
 */
import { createHash } from 'node:crypto';
import { separarAnotacoes } from '../parser';
import { candidatoDaAnotacao, type DatasDaNorma, type OrigemVersao } from '../versoes/versoes';
import type { LinhaVersao, LinhasDaNorma } from '../busca/carga';
import type { CasoHistorico } from './historico';
import { somarDiasIso } from './datas';

const sha = (t: string) => createHash('sha256').update(t, 'utf8').digest('hex');

export function versaoAnterior(caso: CasoHistorico, datas: DatasDaNorma): LinhaVersao {
  const anotacao = caso.antes.anotacao ? separarAnotacoes(`(${caso.antes.anotacao})`).anotacoes[0] : undefined;
  const candidato = anotacao ? candidatoDaAnotacao(anotacao, datas) : undefined;
  // Sem anotação no tachado, é a redação original (o Planalto só anota o que foi alterado depois)
  const origem: OrigemVersao = candidato?.origem ?? (anotacao ? (anotacao.tipo === 'incluido' ? 'incluido' : 'redacao_dada') : 'redacao_original');
  const original = origem === 'redacao_original';
  const validado = caso.validacao.status === 'validado';
  return {
    dispositivo_id: caso.dispositivoId,
    texto: caso.antes.texto,
    origem,
    ato_chave: candidato?.ato.chave ?? null,
    ato_rotulo: candidato?.ato.rotulo ?? null,
    ato_assinatura: candidato?.ato.assinatura ?? null,
    ato_publicacao: candidato?.ato.publicacao ?? null,
    ano_do_ato: candidato?.anoDoAto ?? null,
    fonte_da_data: candidato?.ato.fonteDaData ?? (original && datas.norma.publicacao ? 'norma' : null),
    vigente_de: candidato ? candidato.vigenteDe : original ? datas.norma.publicacao : null,
    vigente_ate: somarDiasIso(caso.depois.vigenteDe, -1),
    vigencia_confirmada: false,
    texto_anterior_disponivel: false,
    conhecido_em: caso.fonte.lidoEm,
    hash: sha(caso.antes.texto),
    fonte_do_texto: 'tachado_planalto',
    conferida_por: validado ? caso.validacao.por : null,
    conferida_em: validado ? caso.validacao.em : null
  };
}

/** Acrescenta às linhas de uma norma as redações anteriores dos casos dela e marca a versão vigente com `texto_anterior_disponivel`. */
export function acrescentarVersoesAnteriores(l: LinhasDaNorma, casos: CasoHistorico[], datas: DatasDaNorma): LinhasDaNorma {
  const dela = casos.filter(c => c.normaId === l.norma.id);
  if (dela.length === 0) return l;
  const comAnterior = new Set(dela.map(c => c.dispositivoId));
  return {
    ...l,
    versoes: [...l.versoes.map(v => (comAnterior.has(v.dispositivo_id) ? { ...v, texto_anterior_disponivel: true } : v)), ...dela.map(c => versaoAnterior(c, datas))]
  };
}
