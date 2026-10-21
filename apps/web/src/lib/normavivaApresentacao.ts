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

// ---------- Várias redações do mesmo dispositivo (F3-04) ----------

export type SituacaoEm =
  | SituacaoNaData
  /** A data cai numa redação anterior que a base conhece: mostra o texto da época, com os avisos de fonte e de vigência provisória. */
  | { tipo: 'texto_da_epoca'; versao: Versao; conferida: boolean; avisos: string[] };

/** Começo conhecido de uma redação: a data, ou o 1º de janeiro do ano do ato quando só o ano se sabe; `null` se nada se sabe. */
function inicioConhecido(v: Versao): string | null {
  return v.vigente_de ?? (v.ano_do_ato ? `${v.ano_do_ato}-01-01` : null);
}

function avisosDaAnterior(v: Versao, atual: Versao, dataCurta: (iso: string) => string): string[] {
  const avisos: string[] = [];
  avisos.push(`Redação que vigorou até ${dataCurta(v.vigente_ate!)}, véspera da publicação de ${atual.ato_rotulo ?? 'ato posterior'}, que deu a redação atual.`);
  if (v.vigente_de) {
    avisos.push(`Início: ${dataCurta(v.vigente_de)}${v.origem === 'redacao_original' ? ' (publicação da norma)' : ` (publicação de ${v.ato_rotulo ?? 'ato anterior'})`}.`);
  } else {
    avisos.push('O início desta redação não é conhecido pela base.');
  }
  avisos.push('As datas são as de publicação dos atos, usadas como provisórias: a vigência pode ter começado ou acabado em outro dia (vacatio legis), e a cláusula de vigência não foi lida.');
  avisos.push(
    v.conferida_em
      ? `Texto lido do trecho tachado da página anotada do Planalto e conferido por ${v.conferida_por} em ${dataCurta(v.conferida_em)}.`
      : 'Texto lido do trecho tachado da página anotada do Planalto; ainda não foi conferido no Diário Oficial. Confira antes de citá-lo.'
  );
  return avisos;
}

/**
 * O que a base pode afirmar sobre o dispositivo em `dataConsulta`, considerando todas as redações conhecidas.
 * A regra é a de sempre: nunca mostrar uma redação como se fosse a de outra época. Antes da redação atual, só há texto se uma redação
 * anterior cobre a data; fora delas, a base diz que não tem.
 */
export function situacaoEm(versoes: Versao[], dataConsulta: string, dataCurta: (iso: string) => string): SituacaoEm | null {
  const atual = versoes.find(v => !v.vigente_ate) ?? versoes[0];
  if (!atual) return null;
  const base = situacaoNaData(atual, dataConsulta, dataCurta);
  if (base.tipo !== 'texto_da_epoca_indisponivel') return base;

  const anteriores = versoes.filter(v => v.vigente_ate);
  if (anteriores.length === 0) return base;
  const dentro = anteriores.find(v => dataConsulta <= v.vigente_ate! && dataConsulta >= (inicioConhecido(v) ?? '0000-01-01'));
  if (dentro) return { tipo: 'texto_da_epoca', versao: dentro, conferida: !!dentro.conferida_em, avisos: avisosDaAnterior(dentro, atual, dataCurta) };

  const maisAntiga = anteriores[anteriores.length - 1];
  const inicio = inicioConhecido(maisAntiga);
  if (inicio && dataConsulta < inicio) {
    return {
      tipo: 'texto_da_epoca_indisponivel',
      aviso:
        maisAntiga.origem === 'redacao_original'
          ? `A norma foi publicada em ${dataCurta(inicio)}; não havia texto antes disso.`
          : `A base conhece a redação deste dispositivo a partir de ${dataCurta(inicio)}. Antes disso o texto era outro e não está na base: confira no Planalto ou no DOU da época.`
    };
  }
  return base;
}
