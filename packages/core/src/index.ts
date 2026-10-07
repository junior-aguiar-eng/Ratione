import { z } from 'zod';

/**
 * Esferas e instâncias do Poder Judiciário Brasileiro
 */
export const EsferaJudicialSchema = z.enum([
  'superior',
  'federal',
  'estadual',
  'trabalho',
  'eleitoral',
  'militar'
]);
export type EsferaJudicial = z.infer<typeof EsferaJudicialSchema>;

/**
 * Entidade Tribunal Oficial Brasileiro (conforme padronização CNJ)
 */
export const TribunalSchema = z.object({
  id: z.string(), // ex: "STJ", "TJSP", "TRF3"
  nome: z.string(),
  sigla: z.string(),
  esfera: EsferaJudicialSchema,
  uf: z.string().optional(), // ex: "SP" (opcional para tribunais superiores)
  sede: z.string(),
  horarioExpedienteFim: z.string().default('19:00'), // Prazos eletrônicos terminam às 23:59:59 (Lei 11.419/06, art. 3º, par. ún.)
  fusoHorario: z.string().default('America/Sao_Paulo'),
  peticionamentoEletronicoFim: z.string().default('23:59:59')
});
export type Tribunal = z.infer<typeof TribunalSchema>;

/**
 * Catálogo Canônico de Tribunais Nacionais Brasileiros
 */
export const TRIBUNAIS_BRASIL: Record<string, Tribunal> = {
  // Tribunais Superiores
  STF: { id: 'STF', nome: 'Supremo Tribunal Federal', sigla: 'STF', esfera: 'superior', sede: 'Brasília/DF', fusoHorario: 'America/Sao_Paulo', horarioExpedienteFim: '19:00', peticionamentoEletronicoFim: '23:59:59' },
  STJ: { id: 'STJ', nome: 'Superior Tribunal de Justiça', sigla: 'STJ', esfera: 'superior', sede: 'Brasília/DF', fusoHorario: 'America/Sao_Paulo', horarioExpedienteFim: '19:00', peticionamentoEletronicoFim: '23:59:59' },
  TST: { id: 'TST', nome: 'Tribunal Superior do Trabalho', sigla: 'TST', esfera: 'superior', sede: 'Brasília/DF', fusoHorario: 'America/Sao_Paulo', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TSE: { id: 'TSE', nome: 'Tribunal Superior Eleitoral', sigla: 'TSE', esfera: 'superior', sede: 'Brasília/DF', fusoHorario: 'America/Sao_Paulo', horarioExpedienteFim: '19:00', peticionamentoEletronicoFim: '23:59:59' },

  // Tribunais Regionais Federais
  TRF1: { id: 'TRF1', nome: 'Tribunal Regional Federal da 1ª Região', sigla: 'TRF1', esfera: 'federal', sede: 'Brasília/DF', fusoHorario: 'America/Sao_Paulo', horarioExpedienteFim: '19:00', peticionamentoEletronicoFim: '23:59:59' },
  TRF2: { id: 'TRF2', nome: 'Tribunal Regional Federal da 2ª Região', sigla: 'TRF2', esfera: 'federal', uf: 'RJ', sede: 'Rio de Janeiro/RJ', fusoHorario: 'America/Sao_Paulo', horarioExpedienteFim: '17:00', peticionamentoEletronicoFim: '23:59:59' },
  TRF3: { id: 'TRF3', nome: 'Tribunal Regional Federal da 3ª Região', sigla: 'TRF3', esfera: 'federal', uf: 'SP', sede: 'São Paulo/SP', fusoHorario: 'America/Sao_Paulo', horarioExpedienteFim: '19:00', peticionamentoEletronicoFim: '23:59:59' },
  TRF4: { id: 'TRF4', nome: 'Tribunal Regional Federal da 4ª Região', sigla: 'TRF4', esfera: 'federal', uf: 'RS', sede: 'Porto Alegre/RS', fusoHorario: 'America/Sao_Paulo', horarioExpedienteFim: '19:00', peticionamentoEletronicoFim: '23:59:59' },
  TRF5: { id: 'TRF5', nome: 'Tribunal Regional Federal da 5ª Região', sigla: 'TRF5', esfera: 'federal', uf: 'PE', sede: 'Recife/PE', fusoHorario: 'America/Recife', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TRF6: { id: 'TRF6', nome: 'Tribunal Regional Federal da 6ª Região', sigla: 'TRF6', esfera: 'federal', uf: 'MG', sede: 'Belo Horizonte/MG', fusoHorario: 'America/Sao_Paulo', horarioExpedienteFim: '19:00', peticionamentoEletronicoFim: '23:59:59' },

  // Tribunais de Justiça Estaduais Selecionados (completando os principais polos)
  TJSP: { id: 'TJSP', nome: 'Tribunal de Justiça do Estado de São Paulo', sigla: 'TJSP', esfera: 'estadual', uf: 'SP', sede: 'São Paulo/SP', fusoHorario: 'America/Sao_Paulo', horarioExpedienteFim: '19:00', peticionamentoEletronicoFim: '23:59:59' },
  TJRJ: { id: 'TJRJ', nome: 'Tribunal de Justiça do Estado do Rio de Janeiro', sigla: 'TJRJ', esfera: 'estadual', uf: 'RJ', sede: 'Rio de Janeiro/RJ', fusoHorario: 'America/Sao_Paulo', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TJMG: { id: 'TJMG', nome: 'Tribunal de Justiça do Estado de Minas Gerais', sigla: 'TJMG', esfera: 'estadual', uf: 'MG', sede: 'Belo Horizonte/MG', fusoHorario: 'America/Sao_Paulo', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TJRS: { id: 'TJRS', nome: 'Tribunal de Justiça do Estado do Rio Grande do Sul', sigla: 'TJRS', esfera: 'estadual', uf: 'RS', sede: 'Porto Alegre/RS', fusoHorario: 'America/Sao_Paulo', horarioExpedienteFim: '19:00', peticionamentoEletronicoFim: '23:59:59' },
  TJPR: { id: 'TJPR', nome: 'Tribunal de Justiça do Estado do Paraná', sigla: 'TJPR', esfera: 'estadual', uf: 'PR', sede: 'Curitiba/PR', fusoHorario: 'America/Sao_Paulo', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TJSC: { id: 'TJSC', nome: 'Tribunal de Justiça do Estado de Santa Catarina', sigla: 'TJSC', esfera: 'estadual', uf: 'SC', sede: 'Florianópolis/SC', fusoHorario: 'America/Sao_Paulo', horarioExpedienteFim: '19:00', peticionamentoEletronicoFim: '23:59:59' },
  TJBA: { id: 'TJBA', nome: 'Tribunal de Justiça do Estado da Bahia', sigla: 'TJBA', esfera: 'estadual', uf: 'BA', sede: 'Salvador/BA', fusoHorario: 'America/Bahia', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TJDF: { id: 'TJDF', nome: 'Tribunal de Justiça do Distrito Federal e dos Territórios', sigla: 'TJDF', esfera: 'estadual', uf: 'DF', sede: 'Brasília/DF', fusoHorario: 'America/Sao_Paulo', horarioExpedienteFim: '19:00', peticionamentoEletronicoFim: '23:59:59' },
  TJGO: { id: 'TJGO', nome: 'Tribunal de Justiça do Estado de Goiás', sigla: 'TJGO', esfera: 'estadual', uf: 'GO', sede: 'Goiânia/GO', fusoHorario: 'America/Sao_Paulo', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TJPE: { id: 'TJPE', nome: 'Tribunal de Justiça do Estado de Pernambuco', sigla: 'TJPE', esfera: 'estadual', uf: 'PE', sede: 'Recife/PE', fusoHorario: 'America/Recife', horarioExpedienteFim: '17:00', peticionamentoEletronicoFim: '23:59:59' },
  TJCE: { id: 'TJCE', nome: 'Tribunal de Justiça do Estado do Ceará', sigla: 'TJCE', esfera: 'estadual', uf: 'CE', sede: 'Fortaleza/CE', fusoHorario: 'America/Fortaleza', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TJES: { id: 'TJES', nome: 'Tribunal de Justiça do Estado do Espírito Santo', sigla: 'TJES', esfera: 'estadual', uf: 'ES', sede: 'Vitória/ES', fusoHorario: 'America/Sao_Paulo', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' }
};

/**
 * Tipo de Dispositivo segundo a Lei Complementar nº 95/1998
 */
export const TipoDispositivoSchema = z.enum([
  'artigo',
  'paragrafo_unico',
  'paragrafo',
  'inciso',
  'alinea',
  'item'
]);
export type TipoDispositivo = z.infer<typeof TipoDispositivoSchema>;

/**
 * Estrutura Canônica de Dispositivo Legal
 */
export const DispositivoLegalSchema = z.object({
  id: z.string(), // ex: "CPC-L13105-ART489-P1-IV"
  normaId: z.string(), // ex: "LEI-13105-2015" (CPC)
  rotulo: z.string(), // ex: "art. 489, § 1º, IV"
  tipo: TipoDispositivoSchema,
  numero: z.string(),
  texto: z.string(),
  vigenteEm: z.string(), // ISO Date
  revogado: z.boolean().default(false),
  alteradoPor: z.string().optional()
});
export type DispositivoLegal = z.infer<typeof DispositivoLegalSchema>;

/**
 * Precedente Qualificado (Art. 927 do CPC)
 */
export const TipoPrecedenteSchema = z.enum([
  'stf_controle_concentrado', // ADI, ADC, ADPF
  'stf_repercussao_geral',    // Tema RG
  'stf_sumula_vinculante',    // SV
  'stj_repetitivo',           // Tema Repetitivo STJ
  'iac',                      // Incidente de Assunção de Competência
  'irdr',                     // Incidente de Resolução de Demandas Repetitivas
  'sumula_stj',               // Súmula STJ
  'sumula_stf'                // Súmula STF
]);
export type TipoPrecedente = z.infer<typeof TipoPrecedenteSchema>;

export const PrecedenteSchema = z.object({
  id: z.string(), // ex: "STJ-TEMA-1076"
  tribunal: z.string(),
  tipo: TipoPrecedenteSchema,
  numeroOuTema: z.string(), // ex: "Tema 1.076" ou "Súmula 479"
  enunciadoTese: z.string(),
  dispositivosRelacionados: z.array(z.string()).default([]),
  dataPublicacaoAcordao: z.string().optional(),
  linkOficial: z.string().optional()
});
export type Precedente = z.infer<typeof PrecedenteSchema>;
