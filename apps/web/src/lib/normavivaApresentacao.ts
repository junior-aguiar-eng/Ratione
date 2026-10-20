/**
 * Regras de apresentação do NormaViva (sem React, para testar): o que a tela pode e não pode afirmar sobre a vigência.
 *
 * O corpus compilado só traz a redação vigente (ver docs/produto/VERIFICACAO_FONTES.md §18). Por isso, para uma data anterior
 * à última alteração, a tela NÃO mostra texto algum: mostrar a redação atual como se fosse a da época seria dado jurídico errado.
 */
import type { Versao } from './normaviva';

export interface Segmento {
  texto: string;
  destaque: boolean;
}

/** Trecho do `ts_headline` ("… <b>honorários</b> …") em segmentos; só `<b>` marca destaque e qualquer outra tag é descartada. */
export function segmentosDoTrecho(trecho: string): Segmento[] {
  const segmentos: Segmento[] = [];
  let destaque = false;
  for (const parte of trecho.split(/(<\/?b>)/i)) {
    if (/^<b>$/i.test(parte)) destaque = true;
    else if (/^<\/b>$/i.test(parte)) destaque = false;
    else {
      const limpo = parte.replace(/<[^>]*>/g, '');
      if (limpo) segmentos.push({ texto: limpo, destaque });
    }
  }
  return segmentos;
}

export const ROTULO_ORIGEM: Record<Versao['origem'], string> = {
  redacao_original: 'Redação original da norma',
  redacao_dada: 'Redação dada por alteração',
  incluido: 'Dispositivo incluído por alteração',
  revogado: 'Revogado',
  vetado: 'Vetado (nunca teve texto vigente)'
};

export const ROTULO_RELACAO: Record<string, string> = {
  alterado_por: 'Redação alterada por',
  incluido_por: 'Dispositivo incluído por',
  revogado_por: 'Revogado por',
  remete: 'Remete a'
};

export const ROTULO_ESCOPO: Record<string, string> = {
  mesma: 'Mesma norma (o texto diz "deste Código" ou "desta Lei")',
  presumido: 'Mesma norma, presumida (o texto cita o artigo sem dizer de qual norma)',
  explicito: 'Outra norma, citada pelo nome',
  externo: 'Outra norma, fora da base'
};

export type SituacaoNaData =
  /** A data é igual ou posterior ao início provisório da redação atual: o texto da base vale, com aviso de vigência não confirmada. */
  | { tipo: 'redacao_atual'; provisoria: boolean; aviso: string }
  /** A data é anterior à redação atual: a base não tem o texto da época. */
  | { tipo: 'texto_da_epoca_indisponivel'; aviso: string }
  /** Dispositivo vetado ou sem data de vigência conhecida. */
  | { tipo: 'sem_data'; aviso: string };

/** `dataConsulta` e `vigente_de` em ISO (AAAA-MM-DD); a comparação de strings ISO é cronológica. */
export function situacaoNaData(versao: Versao, dataConsulta: string, dataCurta: (iso: string) => string): SituacaoNaData {
  if (versao.origem === 'vetado') {
    return { tipo: 'sem_data', aviso: 'Dispositivo vetado: nunca teve texto vigente.' };
  }
  if (!versao.vigente_de) {
    return {
      tipo: 'sem_data',
      aviso: `A base não tem a data em que esta redação passou a valer${versao.ano_do_ato ? ` (o ato é de ${versao.ano_do_ato})` : ''}. Confira no Planalto.`
    };
  }
  if (dataConsulta < versao.vigente_de) {
    const ato = versao.ato_rotulo ?? 'ato posterior';
    return {
      tipo: 'texto_da_epoca_indisponivel',
      aviso:
        versao.origem === 'redacao_original'
          ? `A norma foi publicada em ${dataCurta(versao.vigente_de)}; não havia texto antes disso.`
          : `A redação atual passou a valer, provavelmente, em ${dataCurta(versao.vigente_de)} (${ato}). O texto anterior a essa data não está na base: confira no Planalto ou no DOU da época.`
    };
  }
  return {
    tipo: 'redacao_atual',
    provisoria: !versao.vigencia_confirmada,
    aviso: versao.vigencia_confirmada
      ? `Redação em vigor desde ${dataCurta(versao.vigente_de)}.`
      : `Redação atual, que a base data de ${dataCurta(versao.vigente_de)}: é a data de publicação do ato, usada como início provisório. A vigência pode ter começado em outro dia (vacatio legis); a cláusula de vigência do ato não foi lida.`
  };
}
