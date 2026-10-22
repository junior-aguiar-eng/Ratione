/**
 * Temas de repercussão geral do STF (F4-02), lidos do CSV de dados abertos da Transparência do STF (`transparencia.stf.jus.br`).
 * O STF bloqueia o acesso automático (403, verificado em 22/10/2026), então o arquivo é baixado pelo responsável e entra no repositório por
 * `pnpm importar:stf`, que guarda os bytes originais com SHA-256. Um tema por linha; "-" é o valor de campo vazio do arquivo.
 * Coluna esperada que faltar derruba a leitura: layout mudado não pode virar dado em branco.
 */
import { DataIsoSchema } from '@ratione/core';
import { lerCsv } from '../stj/csv';

export interface TemaRgStf {
  /** `STF-RG-1255`. */
  id: string;
  numero: number;
  /** `Ativo` ou `Cancelado` (o arquivo marca os cancelados também na situação, como "**Cancelado**"). */
  status: string;
  titulo: string;
  descricao: string | null;
  /** Tese fixada; nulo enquanto o mérito não foi julgado. */
  tese: string | null;
  processoParadigma: string | null;
  relator: string | null;
  /** Como o STF informa ("RG reconhecida - mérito julgado", "RG negada - matéria infraconstitucional"…); não é normalizada. */
  situacaoRg: string;
  situacaoJulgamento: string | null;
  linkProcesso: string | null;
  dataAutuacao: string | null;
  dataAdmissibilidade: string | null;
  dataJulgamento: string | null;
  ramosDoDireito: string | null;
  assunto: string | null;
  suspensaoNacional: string | null;
}

const COLUNAS = [
  'Status Tema', 'Número tema', 'Título tema', 'Descrição tema', 'Tese', 'Processo paradigma', 'Relator atual', 'Situação repercussão geral',
  'Situação julgamento tema', 'Link Processo', 'Data autuação', 'Data admissibilidade RG', 'Data julgamento tema', 'Ramos do Direito', 'Assunto',
  'Situação Suspensão Nacional'
];

const vazio = (s: string) => s.trim() === '' || s.trim() === '-';
const textoOuNulo = (s: string) => (vazio(s) ? null : s.trim());

/** "21/03/2013" → "2013-03-21"; "-" ou vazio → nulo; qualquer outra coisa é erro, não data torta. */
export function dataBr(s: string): string | null {
  if (vazio(s)) return null;
  const m = s.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) throw new Error(`data fora do formato DD/MM/AAAA: "${s}"`);
  return DataIsoSchema.parse(`${m[3]}-${m[2]}-${m[1]}`);
}

export function lerTemasRg(csv: string): TemaRgStf[] {
  const linhas = lerCsv(csv);
  if (linhas.length === 0) throw new Error('Repercussão geral: arquivo sem linhas');
  const faltam = COLUNAS.filter(c => !(c in linhas[0]));
  if (faltam.length > 0) throw new Error(`Repercussão geral: faltam colunas ${faltam.join(', ')} (o STF mudou o layout?)`);
  const vistos = new Set<number>();
  return linhas
    .map(l => {
      const numero = Number(l['Número tema'].trim());
      if (!Number.isInteger(numero) || numero <= 0) throw new Error(`Repercussão geral: número de tema inválido "${l['Número tema']}"`);
      if (vistos.has(numero)) throw new Error(`Repercussão geral: tema ${numero} repetido`);
      vistos.add(numero);
      return {
        id: `STF-RG-${numero}`,
        numero,
        status: l['Status Tema'].trim(),
        titulo: l['Título tema'].trim(),
        descricao: textoOuNulo(l['Descrição tema']),
        tese: textoOuNulo(l['Tese']),
        processoParadigma: textoOuNulo(l['Processo paradigma']),
        relator: textoOuNulo(l['Relator atual']),
        situacaoRg: l['Situação repercussão geral'].trim(),
        situacaoJulgamento: textoOuNulo(l['Situação julgamento tema']),
        linkProcesso: textoOuNulo(l['Link Processo']),
        dataAutuacao: dataBr(l['Data autuação']),
        dataAdmissibilidade: dataBr(l['Data admissibilidade RG']),
        dataJulgamento: dataBr(l['Data julgamento tema']),
        ramosDoDireito: textoOuNulo(l['Ramos do Direito']),
        assunto: textoOuNulo(l['Assunto']),
        suspensaoNacional: textoOuNulo(l['Situação Suspensão Nacional'])
      };
    })
    .sort((a, b) => a.numero - b.numero);
}

const cancelado = (t: TemaRgStf) => t.status.toLowerCase() === 'cancelado' || /cancelado/i.test(t.situacaoRg);

/**
 * Entram no grafo: tema com repercussão geral RECONHECIDA e não cancelado. Com tese firmada (mérito julgado ou reafirmação de jurisprudência) vira
 * `precedente`; com o mérito ainda pendente vira `tema` (a questão em julgamento, sem tese). Ficam de fora a repercussão negada (matéria
 * infraconstitucional ou sem relevância), os cancelados, os ainda em análise de repercussão e os julgados que o arquivo traz sem tese.
 * Exceção (`destaque`): o tema que um precedente do STJ cita, ou que as decisões do STF aplicam muitas vezes (ver `LIMIAR_DE_APLICACAO`), entra como
 * `tema` mesmo com a repercussão negada ou sem tese no arquivo: sem isso o grafo deixaria de fora os temas que a prática mais encontra (o Tema 660, o mais
 * aplicado, é de repercussão negada). A tela mostra a situação ("RG negada - matéria infraconstitucional"). Cancelado e ainda em análise nunca entram.
 */
/** Número de decisões de devolução que torna um tema "muito aplicado" o bastante para entrar no grafo mesmo sem tese ou com a repercussão negada. */
export const LIMIAR_DE_APLICACAO = 50;

export function classificarTemaRg(t: TemaRgStf, destaque = false): 'precedente' | 'tema' | null {
  if (cancelado(t)) return null;
  if (/^RG reconhecida/i.test(t.situacaoRg)) {
    if (/mérito pendente/i.test(t.situacaoRg)) return 'tema';
    if (t.tese) return 'precedente';
    return destaque ? 'tema' : null;
  }
  return destaque && /^RG negada/i.test(t.situacaoRg) ? 'tema' : null;
}
