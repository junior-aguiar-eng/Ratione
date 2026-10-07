import type { RegimeContagem } from '../motor/calculadora';

/**
 * Catálogo de prazos com base legal. Cada entrada foi lida no texto vigente em 07/10/2026
 * (regra do PLANO §1: só versão compilada; na página anotada do Planalto vale o texto não tachado).
 * Alterar um prazo exige reler a lei e atualizar `lidoEm`.
 */
export type GrupoPrazo =
  | 'Cível: recursos'
  | 'Cível: defesa e manifestações'
  | 'Trabalhista'
  | 'Criminal'
  | 'Juizados Especiais'
  | 'Prazos materiais';

export interface PrazoCatalogado {
  id: string;
  ato: string;
  grupo: GrupoPrazo;
  dias: number;
  /** `processual`: calculado pelo motor. `material`: decadência/prescrição, fora do cálculo processual. */
  natureza: 'processual' | 'material';
  /** Regime de contagem do motor; ausente nos prazos materiais. */
  regime?: RegimeContagem;
  baseLegal: string;
  observacao?: string;
  fonte: { versao: 'compilada' | 'anotada (texto não tachado)'; lidoEm: string };
}

const LIDO = '2026-10-07';
const ANOTADA = { versao: 'anotada (texto não tachado)' as const, lidoEm: LIDO };
const COMPILADA = { versao: 'compilada' as const, lidoEm: LIDO };

const REGRA_RECURSOS =
  'Regra geral dos recursos do CPC: 15 dias para interpor e para responder, exceto embargos de declaração (art. 1.003, § 5º).';

export const CATALOGO_PRAZOS: PrazoCatalogado[] = [
  // ---------- Cível: recursos ----------
  { id: 'apelacao', ato: 'Apelação', grupo: 'Cível: recursos', dias: 15, natureza: 'processual', regime: 'cpc_dias_uteis', baseLegal: 'CPC, arts. 1.009 e 1.003, § 5º', fonte: ANOTADA },
  { id: 'agravo-instrumento', ato: 'Agravo de instrumento', grupo: 'Cível: recursos', dias: 15, natureza: 'processual', regime: 'cpc_dias_uteis', baseLegal: 'CPC, arts. 1.015 e 1.003, § 5º', fonte: ANOTADA },
  { id: 'agravo-interno', ato: 'Agravo interno', grupo: 'Cível: recursos', dias: 15, natureza: 'processual', regime: 'cpc_dias_uteis', baseLegal: 'CPC, arts. 1.021, § 2º, e 1.003, § 5º', fonte: ANOTADA },
  {
    id: 'embargos-declaracao',
    ato: 'Embargos de declaração',
    grupo: 'Cível: recursos',
    dias: 5,
    natureza: 'processual',
    regime: 'cpc_dias_uteis',
    baseLegal: 'CPC, art. 1.023',
    observacao: 'Exceção à regra de 15 dias (art. 1.003, § 5º). A resposta do embargado também é de 5 dias (art. 1.023, § 2º).',
    fonte: ANOTADA
  },
  { id: 'recurso-extraordinario', ato: 'Recurso extraordinário', grupo: 'Cível: recursos', dias: 15, natureza: 'processual', regime: 'cpc_dias_uteis', baseLegal: 'CPC, arts. 1.029 e 1.003, § 5º', fonte: ANOTADA },
  { id: 'recurso-especial', ato: 'Recurso especial', grupo: 'Cível: recursos', dias: 15, natureza: 'processual', regime: 'cpc_dias_uteis', baseLegal: 'CPC, arts. 1.029 e 1.003, § 5º', fonte: ANOTADA },
  { id: 'agravo-re-resp', ato: 'Agravo em recurso extraordinário ou especial', grupo: 'Cível: recursos', dias: 15, natureza: 'processual', regime: 'cpc_dias_uteis', baseLegal: 'CPC, arts. 1.042 (redação da Lei 15.484/2026) e 1.003, § 5º', fonte: ANOTADA },
  { id: 'embargos-divergencia', ato: 'Embargos de divergência', grupo: 'Cível: recursos', dias: 15, natureza: 'processual', regime: 'cpc_dias_uteis', baseLegal: 'CPC, arts. 1.043 e 1.003, § 5º', fonte: ANOTADA },
  { id: 'recurso-ordinario-cpc', ato: 'Recurso ordinário constitucional', grupo: 'Cível: recursos', dias: 15, natureza: 'processual', regime: 'cpc_dias_uteis', baseLegal: 'CPC, arts. 1.028 e 1.003, § 5º', fonte: ANOTADA },
  {
    id: 'contrarrazoes',
    ato: 'Contrarrazões / resposta a recurso',
    grupo: 'Cível: recursos',
    dias: 15,
    natureza: 'processual',
    regime: 'cpc_dias_uteis',
    baseLegal: 'CPC, arts. 1.010, § 1º, 1.030 e 1.003, § 5º',
    observacao: REGRA_RECURSOS,
    fonte: ANOTADA
  },

  // ---------- Cível: defesa e manifestações ----------
  { id: 'contestacao', ato: 'Contestação', grupo: 'Cível: defesa e manifestações', dias: 15, natureza: 'processual', regime: 'cpc_dias_uteis', baseLegal: 'CPC, art. 335', fonte: ANOTADA },
  { id: 'replica', ato: 'Réplica', grupo: 'Cível: defesa e manifestações', dias: 15, natureza: 'processual', regime: 'cpc_dias_uteis', baseLegal: 'CPC, arts. 350 e 351', fonte: ANOTADA },
  {
    id: 'impugnacao-cumprimento',
    ato: 'Impugnação ao cumprimento de sentença',
    grupo: 'Cível: defesa e manifestações',
    dias: 15,
    natureza: 'processual',
    regime: 'cpc_dias_uteis',
    baseLegal: 'CPC, art. 525',
    observacao: 'Conta-se depois de vencido o prazo do art. 523 sem pagamento voluntário.',
    fonte: ANOTADA
  },
  { id: 'supletivo', ato: 'Prazo supletivo (sem previsão legal nem fixado pelo juiz)', grupo: 'Cível: defesa e manifestações', dias: 5, natureza: 'processual', regime: 'cpc_dias_uteis', baseLegal: 'CPC, art. 218, § 3º', fonte: ANOTADA },

  // ---------- Trabalhista ----------
  { id: 'recurso-ordinario-clt', ato: 'Recurso ordinário', grupo: 'Trabalhista', dias: 8, natureza: 'processual', regime: 'clt_dias_uteis', baseLegal: 'CLT, art. 895', fonte: COMPILADA },
  { id: 'agravo-peticao', ato: 'Agravo de petição', grupo: 'Trabalhista', dias: 8, natureza: 'processual', regime: 'clt_dias_uteis', baseLegal: 'CLT, art. 897, a', fonte: COMPILADA },
  { id: 'agravo-instrumento-clt', ato: 'Agravo de instrumento', grupo: 'Trabalhista', dias: 8, natureza: 'processual', regime: 'clt_dias_uteis', baseLegal: 'CLT, art. 897, b', fonte: COMPILADA },
  { id: 'embargos-declaracao-clt', ato: 'Embargos de declaração', grupo: 'Trabalhista', dias: 5, natureza: 'processual', regime: 'clt_dias_uteis', baseLegal: 'CLT, art. 897-A', fonte: COMPILADA },

  // ---------- Criminal ----------
  { id: 'apelacao-criminal', ato: 'Apelação', grupo: 'Criminal', dias: 5, natureza: 'processual', regime: 'cpp_dias_corridos', baseLegal: 'CPP, art. 593', fonte: COMPILADA },
  {
    id: 'rese',
    ato: 'Recurso em sentido estrito',
    grupo: 'Criminal',
    dias: 5,
    natureza: 'processual',
    regime: 'cpp_dias_corridos',
    baseLegal: 'CPP, art. 586',
    observacao: 'Na hipótese do art. 581, XIV (lista de jurados), o prazo é de 20 dias (art. 586, parágrafo único).',
    fonte: COMPILADA
  },
  {
    id: 'razoes-apelacao-criminal',
    ato: 'Razões de apelação',
    grupo: 'Criminal',
    dias: 8,
    natureza: 'processual',
    regime: 'cpp_dias_corridos',
    baseLegal: 'CPP, art. 600',
    observacao: 'Nas contravenções, 3 dias; assistente, 3 dias depois do Ministério Público (art. 600, caput e § 1º).',
    fonte: COMPILADA
  },
  { id: 'embargos-declaracao-criminal', ato: 'Embargos de declaração contra acórdão', grupo: 'Criminal', dias: 2, natureza: 'processual', regime: 'cpp_dias_corridos', baseLegal: 'CPP, art. 619', fonte: COMPILADA },

  // ---------- Juizados Especiais ----------
  { id: 'recurso-inominado', ato: 'Recurso inominado', grupo: 'Juizados Especiais', dias: 10, natureza: 'processual', regime: 'jef_dias_uteis', baseLegal: 'Lei 9.099/1995, arts. 42 e 12-A', fonte: ANOTADA },
  { id: 'embargos-declaracao-jef', ato: 'Embargos de declaração', grupo: 'Juizados Especiais', dias: 5, natureza: 'processual', regime: 'jef_dias_uteis', baseLegal: 'Lei 9.099/1995, arts. 49 e 12-A', fonte: ANOTADA },

  // ---------- Prazos materiais (decadência): fora do cálculo processual ----------
  {
    id: 'mandado-seguranca',
    ato: 'Mandado de segurança (prazo para impetrar)',
    grupo: 'Prazos materiais',
    dias: 120,
    natureza: 'material',
    baseLegal: 'Lei 12.016/2009, art. 23',
    observacao: 'Decadência, contada da ciência do ato impugnado. Contagem própria, não é prazo processual em dias úteis.',
    fonte: ANOTADA
  },
  {
    id: 'acao-rescisoria',
    ato: 'Ação rescisória (2 anos)',
    grupo: 'Prazos materiais',
    dias: 730,
    natureza: 'material',
    baseLegal: 'CPC, art. 975',
    observacao:
      '2 anos do trânsito em julgado da última decisão; prorroga-se ao primeiro dia útil se expirar em recesso, feriado ou dia sem expediente (art. 975, § 1º). Contagem em anos, não em dias.',
    fonte: ANOTADA
  }
];

/** Prazos que o motor calcula (os materiais ficam de fora). */
export function prazosCalculaveis(): PrazoCatalogado[] {
  return CATALOGO_PRAZOS.filter(p => p.natureza === 'processual' && p.regime);
}

export function buscarPrazo(id: string): PrazoCatalogado | undefined {
  return CATALOGO_PRAZOS.find(p => p.id === id);
}
