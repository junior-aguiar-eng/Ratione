/**
 * Precedentes qualificados do STJ (F4-01), lidos dos Dados Abertos do STJ (conjunto "Precedentes qualificados", licença CC BY).
 * Dois arquivos que se ligam por `sequencialPrecedente`: Temas (um por precedente) e Processos (os recursos de cada precedente).
 *
 * Achados da leitura real (22/10/2026), que o dicionário de dados do STJ não diz:
 * - os arquivos usam vírgula, não ponto e vírgula como o dicionário;
 * - `tipoPrecedente` vale `Tema` (não "Tema Repetitivo"), `Controvérsia`, `IAC`, `SIRDR` ou `PUIL`;
 * - o mesmo precedente repete em várias linhas quando o STJ o liga a mais de um Tema de Repercussão Geral do STF; as linhas só diferem aí;
 * - no arquivo de Processos `tipoPrecedente` pode vir vazio e `Embargos de Divergência` tem espaços no nome.
 * Coluna esperada que faltar derruba a leitura: layout mudado não pode virar dado em branco.
 */
import { z } from 'zod';
import { DataIsoSchema } from '@ratione/core';
import { lerCsv } from './csv';

export const TIPOS_STJ = ['Tema', 'Controvérsia', 'IAC', 'SIRDR', 'PUIL'] as const;
export type TipoStj = (typeof TIPOS_STJ)[number];

const ROTULO_ID: Record<TipoStj, string> = { Tema: 'TEMA', Controvérsia: 'CONTROVERSIA', IAC: 'IAC', SIRDR: 'SIRDR', PUIL: 'PUIL' };

const dataOuNula = (s: string) => (s.trim() === '' ? null : DataIsoSchema.parse(s.trim()));
const textoOuNulo = (s: string) => (s.trim() === '' ? null : s.trim());

export interface RepercussaoGeralLigada {
  /** Tema de Repercussão Geral do STF que o STJ liga a este precedente. */
  numero: string;
  descricao: string | null;
}

export interface ProcessoDoPrecedente {
  processo: string;
  numeroRegistro: string;
  relator: string | null;
  leadingCase: boolean;
  dataAfetacao: string | null;
  dataJulgamento: string | null;
  dataPublicacaoAcordao: string | null;
  processoStf: string | null;
  tribunalOrigem: string | null;
  siglaTribunalOrigem: string | null;
  ufOrigem: string | null;
  desafetado: boolean;
}

export interface PrecedenteStj {
  /** `STJ-TEMA-1076`, `STJ-IAC-5`, `STJ-SIRDR-3`, `STJ-PUIL-12`, `STJ-CONTROVERSIA-75`. */
  id: string;
  sequencial: string;
  tipo: TipoStj;
  numero: number;
  dataPrimeiraAfetacao: string | null;
  dataJulgamento: string | null;
  dataPublicacaoAcordao: string | null;
  /** Como o STJ informa ("Trânsito em Julgado", "Afetado", "Cancelada"…); não é normalizada para não inventar efeito jurídico. */
  situacao: string;
  cancelado: boolean;
  questao: string | null;
  tese: string | null;
  informacoesComplementares: string | null;
  delimitacao: string | null;
  entendimentoAnterior: string | null;
  anotacoes: string | null;
  referenciaLegislativa: string | null;
  referenciaSumular: string | null;
  sumulaOriginada: string | null;
  orgaoJulgador: string | null;
  assuntos: string | null;
  repercussaoGeral: RepercussaoGeralLigada[];
  processos: ProcessoDoPrecedente[];
}

const COLUNAS_TEMAS = [
  'sequencialPrecedente', 'tipoPrecedente', 'numeroPrecedente', 'dataPrimeiraAfetacao', 'dataJulgamento', 'dataPublicacaoAcordao', 'situacao',
  'informacoesComplementares', 'questaoSubmetidaAJulgamento', 'teseFirmada', 'anotacoesNUGEPNAC', 'delimitacaoJulgado', 'entendimentoAnterior',
  'referenciaLegislativa', 'referenciaSumular', 'sumulaOriginada', 'orgaoJulgador', 'Assuntos', 'numeroRepercussaoGeralSTF', 'descricaoRepercussaoGeral'
];
const COLUNAS_PROCESSOS = [
  'sequencialPrecedente', 'Processo', 'numeroRegistro', 'ministroRelator', 'leadingCase', 'dataAfetacao', 'dataJulgamento', 'dataPbulicacaoAcordao',
  'processoSTF', 'tribunalOrigem', 'siglaTribunalOrigem', 'origemUF', 'Desafetação'
];

function exigirColunas(linhas: Array<Record<string, string>>, colunas: string[], arquivo: string) {
  if (linhas.length === 0) throw new Error(`${arquivo}: arquivo sem linhas`);
  const faltam = colunas.filter(c => !(c in linhas[0]));
  if (faltam.length > 0) throw new Error(`${arquivo}: faltam colunas ${faltam.join(', ')} (o STJ mudou o layout?)`);
}

const simNao = (s: string) => /^(s|sim|true|1)$/i.test(s.trim());

const TipoSchema = z.enum(TIPOS_STJ);

export function lerProcessos(csv: string): Map<string, ProcessoDoPrecedente[]> {
  const linhas = lerCsv(csv);
  exigirColunas(linhas, COLUNAS_PROCESSOS, 'Processos.csv');
  const porSeq = new Map<string, ProcessoDoPrecedente[]>();
  for (const l of linhas) {
    const lista = porSeq.get(l.sequencialPrecedente) ?? [];
    lista.push({
      processo: l.Processo.trim(),
      numeroRegistro: l.numeroRegistro.trim(),
      relator: textoOuNulo(l.ministroRelator),
      leadingCase: simNao(l.leadingCase),
      dataAfetacao: dataOuNula(l.dataAfetacao),
      dataJulgamento: dataOuNula(l.dataJulgamento),
      dataPublicacaoAcordao: dataOuNula(l.dataPbulicacaoAcordao),
      processoStf: textoOuNulo(l.processoSTF),
      tribunalOrigem: textoOuNulo(l.tribunalOrigem),
      siglaTribunalOrigem: textoOuNulo(l.siglaTribunalOrigem),
      ufOrigem: textoOuNulo(l.origemUF),
      desafetado: simNao(l['Desafetação'])
    });
    porSeq.set(l.sequencialPrecedente, lista);
  }
  return porSeq;
}

/** Junta as linhas repetidas de cada precedente, somando os Temas de Repercussão Geral ligados, e anexa os processos. */
export function lerPrecedentes(temasCsv: string, processosCsv: string): PrecedenteStj[] {
  const linhas = lerCsv(temasCsv);
  exigirColunas(linhas, COLUNAS_TEMAS, 'Temas.csv');
  const processos = lerProcessos(processosCsv);
  const porSeq = new Map<string, PrecedenteStj>();
  for (const l of linhas) {
    const tipo = TipoSchema.parse(l.tipoPrecedente.trim());
    const numero = Number(l.numeroPrecedente.trim());
    if (!Number.isInteger(numero) || numero <= 0) throw new Error(`Temas.csv: número inválido "${l.numeroPrecedente}" (sequencial ${l.sequencialPrecedente})`);
    const rg: RepercussaoGeralLigada | null = l.numeroRepercussaoGeralSTF.trim() ? { numero: l.numeroRepercussaoGeralSTF.trim(), descricao: textoOuNulo(l.descricaoRepercussaoGeral) } : null;
    const existente = porSeq.get(l.sequencialPrecedente);
    if (existente) {
      if (existente.tipo !== tipo || existente.numero !== numero) throw new Error(`Temas.csv: sequencial ${l.sequencialPrecedente} aparece com dois precedentes diferentes`);
      if (rg && !existente.repercussaoGeral.some(x => x.numero === rg.numero)) existente.repercussaoGeral.push(rg);
      continue;
    }
    const situacao = l.situacao.trim();
    porSeq.set(l.sequencialPrecedente, {
      id: `STJ-${ROTULO_ID[tipo]}-${numero}`,
      sequencial: l.sequencialPrecedente.trim(),
      tipo,
      numero,
      dataPrimeiraAfetacao: dataOuNula(l.dataPrimeiraAfetacao),
      dataJulgamento: dataOuNula(l.dataJulgamento),
      dataPublicacaoAcordao: dataOuNula(l.dataPublicacaoAcordao),
      situacao,
      cancelado: /^cancelad[oa]$/i.test(situacao),
      questao: textoOuNulo(l.questaoSubmetidaAJulgamento),
      tese: textoOuNulo(l.teseFirmada),
      informacoesComplementares: textoOuNulo(l.informacoesComplementares),
      delimitacao: textoOuNulo(l.delimitacaoJulgado),
      entendimentoAnterior: textoOuNulo(l.entendimentoAnterior),
      anotacoes: textoOuNulo(l.anotacoesNUGEPNAC),
      referenciaLegislativa: textoOuNulo(l.referenciaLegislativa),
      referenciaSumular: textoOuNulo(l.referenciaSumular),
      sumulaOriginada: textoOuNulo(l.sumulaOriginada),
      orgaoJulgador: textoOuNulo(l.orgaoJulgador),
      assuntos: textoOuNulo(l.Assuntos),
      repercussaoGeral: rg ? [rg] : [],
      processos: processos.get(l.sequencialPrecedente.trim()) ?? []
    });
  }
  const ids = new Set<string>();
  for (const p of porSeq.values()) {
    if (ids.has(p.id)) throw new Error(`Temas.csv: ${p.id} repetido com sequenciais diferentes`);
    ids.add(p.id);
  }
  return [...porSeq.values()].sort((a, b) => a.tipo.localeCompare(b.tipo) || a.numero - b.numero);
}

/**
 * A "tese" que o STJ publica nem sempre é uma tese: nos temas com mérito julgado e acórdão ainda não publicado o campo traz o aviso
 * "*Aguardando a publicação do acórdão do julgamento de mérito." (5 casos em 22/10/2026). Tese firmada é a que tem texto e não é esse aviso.
 */
export function temTeseFirmada(p: Pick<PrecedenteStj, 'tese'>): boolean {
  return !!p.tese && !/^\*?\s*aguardando\s+a\s+publica/i.test(p.tese);
}
