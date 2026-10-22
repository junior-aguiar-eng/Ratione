/**
 * Controle concentrado do STF (F4-02): decisões em ADI, ADC, ADO e ADPF, do painel de controle concentrado da Transparência do STF (exportação CSV,
 * baixada pelo responsável: o portal bloqueia o acesso automático). Uma decisão por linha: processo, data, descrição, andamento agrupado, subgrupo e
 * observação (o texto da decisão). O arquivo não traz o objeto da ação nem a norma impugnada: o que se sabe do processo é o que as decisões dizem.
 *
 * Entra no grafo o processo com decisão final de MÉRITO (procedente, procedente em parte, improcedente), que é o precedente formado. A decisão de
 * mérito escolhida (`decisaoDeMerito`): descarta texto vazio ou de preenchimento ("*NI*", "Sem Descrição"), prefere a colegiada ("o Tribunal",
 * "Plenário") à monocrática e, entre as colegiadas, a mais recente; no mesmo dia, a de texto mais longo. Assim a homologação monocrática de 2025 na
 * ADPF 347 não toma o lugar do mérito julgado pelo Plenário em 2023, e o pedido de amicus curiae rotulado "Procedente" não vira mérito.
 */
import { juntarEspacos as espacos } from '@ratione/core';
import { lerCsv } from '../stj/csv';
import { dataBr } from './repercussao';

export const CLASSES_CONTROLE = ['ADI', 'ADC', 'ADO', 'ADPF'] as const;
export type ClasseControle = (typeof CLASSES_CONTROLE)[number];
export const RESULTADOS_DE_MERITO = ['Procedente', 'Procedente em parte', 'Improcedente'] as const;

export interface DecisaoControle {
  classe: ClasseControle;
  numero: number;
  /** AAAA-MM-DD; nulo quando o STF publica "-". */
  data: string | null;
  descricao: string;
  andamento: string;
  subgrupo: string;
  /** Texto da decisão; nulo quando é vazio ou de preenchimento. */
  texto: string | null;
}

const COLUNAS = ['Processo', 'Data', 'Descrição', 'Andamento agrupado', 'Subgrupo', 'Observação'];
const PREENCHIMENTO = /^(?:\*NI\*|Sem Descri[çc][ãa]o|Decis[ãa]o:?|-)?$/i;

export function lerDecisoesControle(csv: string): DecisaoControle[] {
  const linhas = lerCsv(csv.replace(/^﻿/, ''));
  if (linhas.length === 0) throw new Error('Controle concentrado: arquivo sem linhas');
  const faltam = COLUNAS.filter(c => !(c in linhas[0]));
  if (faltam.length > 0) throw new Error(`Controle concentrado: faltam colunas ${faltam.join(', ')} (o STF mudou o layout?)`);
  return linhas.map(l => {
    const m = l['Processo'].trim().match(/^(ADI|ADC|ADO|ADPF) (\d+)$/);
    if (!m) throw new Error(`Controle concentrado: processo não reconhecido "${l['Processo']}"`);
    const texto = espacos(l['Observação']);
    return {
      classe: m[1] as ClasseControle,
      numero: Number(m[2]),
      data: l['Data'].trim() === '-' ? null : dataBr(l['Data']),
      descricao: espacos(l['Descrição']),
      andamento: espacos(l['Andamento agrupado']),
      subgrupo: espacos(l['Subgrupo']),
      texto: PREENCHIMENTO.test(texto) ? null : texto
    };
  });
}

export const idDoProcessoControle = (classe: ClasseControle, numero: number) => `STF-${classe}-${numero}`;

/**
 * Decisão monocrática, pelo que o texto diz: o relator decide em primeira pessoa ("julgo procedente", "homologo", "determino", "nego seguimento") ou
 * invoca o art. 21 do Regimento Interno. O resto é colegiado: as fórmulas do Plenário variam demais ("O Tribunal julgou…", "Julgou-se procedente…",
 * "Julgado procedente…", "o Tribunal… modulou…", e até "JULGU" no arquivo do STF) para reconhecer uma a uma. Mencionar o Plenário não torna a decisão
 * colegiada: a monocrática que se submete "a referendo do Plenário" o menciona e decide em primeira pessoa.
 */
export const decisaoMonocratica = (d: DecisaoControle) =>
  !!d.texto &&
  // Só o art. 21 do RISTF (poderes do relator): "art. 37, I, do RISTF" (quem presidiu) e o regimento interno impugnado aparecem em decisão do Plenário
  /\b(?:julgo|homologo|determino|nego|conheço|declaro|defiro|indefiro|extingo|reconheço|acolho|rejeito)\b|\bart(?:igo)?\.?\s*21\b[^.]{0,40}?(?:RISTF|Regimento Interno d[oe] (?:Supremo|STF))/i.test(d.texto);
/** Texto que abre com a fórmula do Plenário ("Decisão: O Tribunal…", "TRIBUNAL,POR MAIORIA…") é colegiado mesmo com "julgo" digitado por engano. */
const ABRE_COM_O_PLENARIO = /^(?:decis[ãa]o\s*:?\s*)?(?:\([^)]*\)\s*)?(?:em voto per curiam,\s*)?(?:o\s+)?tribunal\b/i;
export const decisaoColegiada = (d: DecisaoControle) => !!d.texto && (ABRE_COM_O_PLENARIO.test(d.texto) || !decisaoMonocratica(d));

export interface ProcessoControle {
  id: string;
  classe: ClasseControle;
  numero: number;
  merito: DecisaoControle;
  colegiada: boolean;
  /** Quantas decisões do processo há no arquivo (todas as fases). */
  totalDeDecisoes: number;
}

/** A decisão de mérito do processo, pela regra do topo do arquivo; nula se não houver decisão final de mérito. */
export function decisaoDeMerito(decisoes: DecisaoControle[]): DecisaoControle | null {
  const merito = decisoes.filter(d => d.subgrupo === 'Decisão Final' && (RESULTADOS_DE_MERITO as readonly string[]).includes(d.andamento));
  if (merito.length === 0) return null;
  const nota = (d: DecisaoControle) => [d.texto ? 1 : 0, decisaoColegiada(d) ? 1 : 0, d.data ?? '', d.texto?.length ?? 0] as const;
  return merito.reduce((melhor, d) => {
    const a = nota(d);
    const b = nota(melhor);
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] > b[i] ? d : melhor;
    return melhor;
  });
}

/** Processos com decisão de mérito, em ordem de classe e número. */
export function processosComMerito(decisoes: DecisaoControle[]): ProcessoControle[] {
  const porProcesso = new Map<string, DecisaoControle[]>();
  for (const d of decisoes) {
    const id = idDoProcessoControle(d.classe, d.numero);
    if (!porProcesso.has(id)) porProcesso.set(id, []);
    porProcesso.get(id)!.push(d);
  }
  const out: ProcessoControle[] = [];
  for (const [id, ds] of porProcesso) {
    const merito = decisaoDeMerito(ds);
    if (merito) out.push({ id, classe: merito.classe, numero: merito.numero, merito, colegiada: decisaoColegiada(merito), totalDeDecisoes: ds.length });
  }
  return out.sort((a, b) => CLASSES_CONTROLE.indexOf(a.classe) - CLASSES_CONTROLE.indexOf(b.classe) || a.numero - b.numero);
}
