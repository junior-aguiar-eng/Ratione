import { z } from 'zod';
import { ProcedenciaSchema } from './procedencia';

export * from './procedencia';
export * from './texto';

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

  // Tribunais Regionais do Trabalho (a sede é a do Tribunal; alguns atendem mais de um Estado: TRT8 PA e AP, TRT10 DF e TO, TRT11 AM e RR, TRT14 RO e AC)
  TRT1: { id: 'TRT1', nome: 'Tribunal Regional do Trabalho da 1ª Região', sigla: 'TRT1', esfera: 'trabalho', uf: 'RJ', sede: 'Rio de Janeiro/RJ', fusoHorario: 'America/Sao_Paulo', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TRT2: { id: 'TRT2', nome: 'Tribunal Regional do Trabalho da 2ª Região', sigla: 'TRT2', esfera: 'trabalho', uf: 'SP', sede: 'São Paulo/SP', fusoHorario: 'America/Sao_Paulo', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TRT3: { id: 'TRT3', nome: 'Tribunal Regional do Trabalho da 3ª Região', sigla: 'TRT3', esfera: 'trabalho', uf: 'MG', sede: 'Belo Horizonte/MG', fusoHorario: 'America/Sao_Paulo', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TRT4: { id: 'TRT4', nome: 'Tribunal Regional do Trabalho da 4ª Região', sigla: 'TRT4', esfera: 'trabalho', uf: 'RS', sede: 'Porto Alegre/RS', fusoHorario: 'America/Sao_Paulo', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TRT5: { id: 'TRT5', nome: 'Tribunal Regional do Trabalho da 5ª Região', sigla: 'TRT5', esfera: 'trabalho', uf: 'BA', sede: 'Salvador/BA', fusoHorario: 'America/Bahia', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TRT6: { id: 'TRT6', nome: 'Tribunal Regional do Trabalho da 6ª Região', sigla: 'TRT6', esfera: 'trabalho', uf: 'PE', sede: 'Recife/PE', fusoHorario: 'America/Recife', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TRT7: { id: 'TRT7', nome: 'Tribunal Regional do Trabalho da 7ª Região', sigla: 'TRT7', esfera: 'trabalho', uf: 'CE', sede: 'Fortaleza/CE', fusoHorario: 'America/Fortaleza', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TRT8: { id: 'TRT8', nome: 'Tribunal Regional do Trabalho da 8ª Região', sigla: 'TRT8', esfera: 'trabalho', uf: 'PA', sede: 'Belém/PA', fusoHorario: 'America/Belem', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TRT9: { id: 'TRT9', nome: 'Tribunal Regional do Trabalho da 9ª Região', sigla: 'TRT9', esfera: 'trabalho', uf: 'PR', sede: 'Curitiba/PR', fusoHorario: 'America/Sao_Paulo', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TRT10: { id: 'TRT10', nome: 'Tribunal Regional do Trabalho da 10ª Região', sigla: 'TRT10', esfera: 'trabalho', uf: 'DF', sede: 'Brasília/DF', fusoHorario: 'America/Sao_Paulo', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TRT11: { id: 'TRT11', nome: 'Tribunal Regional do Trabalho da 11ª Região', sigla: 'TRT11', esfera: 'trabalho', uf: 'AM', sede: 'Manaus/AM', fusoHorario: 'America/Manaus', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TRT12: { id: 'TRT12', nome: 'Tribunal Regional do Trabalho da 12ª Região', sigla: 'TRT12', esfera: 'trabalho', uf: 'SC', sede: 'Florianópolis/SC', fusoHorario: 'America/Sao_Paulo', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TRT13: { id: 'TRT13', nome: 'Tribunal Regional do Trabalho da 13ª Região', sigla: 'TRT13', esfera: 'trabalho', uf: 'PB', sede: 'João Pessoa/PB', fusoHorario: 'America/Fortaleza', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TRT14: { id: 'TRT14', nome: 'Tribunal Regional do Trabalho da 14ª Região', sigla: 'TRT14', esfera: 'trabalho', uf: 'RO', sede: 'Porto Velho/RO', fusoHorario: 'America/Porto_Velho', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TRT15: { id: 'TRT15', nome: 'Tribunal Regional do Trabalho da 15ª Região', sigla: 'TRT15', esfera: 'trabalho', uf: 'SP', sede: 'Campinas/SP', fusoHorario: 'America/Sao_Paulo', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TRT16: { id: 'TRT16', nome: 'Tribunal Regional do Trabalho da 16ª Região', sigla: 'TRT16', esfera: 'trabalho', uf: 'MA', sede: 'São Luís/MA', fusoHorario: 'America/Fortaleza', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TRT17: { id: 'TRT17', nome: 'Tribunal Regional do Trabalho da 17ª Região', sigla: 'TRT17', esfera: 'trabalho', uf: 'ES', sede: 'Vitória/ES', fusoHorario: 'America/Sao_Paulo', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TRT18: { id: 'TRT18', nome: 'Tribunal Regional do Trabalho da 18ª Região', sigla: 'TRT18', esfera: 'trabalho', uf: 'GO', sede: 'Goiânia/GO', fusoHorario: 'America/Sao_Paulo', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TRT19: { id: 'TRT19', nome: 'Tribunal Regional do Trabalho da 19ª Região', sigla: 'TRT19', esfera: 'trabalho', uf: 'AL', sede: 'Maceió/AL', fusoHorario: 'America/Maceio', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TRT20: { id: 'TRT20', nome: 'Tribunal Regional do Trabalho da 20ª Região', sigla: 'TRT20', esfera: 'trabalho', uf: 'SE', sede: 'Aracaju/SE', fusoHorario: 'America/Maceio', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TRT21: { id: 'TRT21', nome: 'Tribunal Regional do Trabalho da 21ª Região', sigla: 'TRT21', esfera: 'trabalho', uf: 'RN', sede: 'Natal/RN', fusoHorario: 'America/Fortaleza', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TRT22: { id: 'TRT22', nome: 'Tribunal Regional do Trabalho da 22ª Região', sigla: 'TRT22', esfera: 'trabalho', uf: 'PI', sede: 'Teresina/PI', fusoHorario: 'America/Fortaleza', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TRT23: { id: 'TRT23', nome: 'Tribunal Regional do Trabalho da 23ª Região', sigla: 'TRT23', esfera: 'trabalho', uf: 'MT', sede: 'Cuiabá/MT', fusoHorario: 'America/Cuiaba', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TRT24: { id: 'TRT24', nome: 'Tribunal Regional do Trabalho da 24ª Região', sigla: 'TRT24', esfera: 'trabalho', uf: 'MS', sede: 'Campo Grande/MS', fusoHorario: 'America/Campo_Grande', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },

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
  TJAL: { id: 'TJAL', nome: 'Tribunal de Justiça do Estado de Alagoas', sigla: 'TJAL', esfera: 'estadual', uf: 'AL', sede: 'Maceió/AL', fusoHorario: 'America/Maceio', horarioExpedienteFim: '19:00', peticionamentoEletronicoFim: '23:59:59' },
  TJES: { id: 'TJES', nome: 'Tribunal de Justiça do Estado do Espírito Santo', sigla: 'TJES', esfera: 'estadual', uf: 'ES', sede: 'Vitória/ES', fusoHorario: 'America/Sao_Paulo', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TJPA: { id: 'TJPA', nome: 'Tribunal de Justiça do Estado do Pará', sigla: 'TJPA', esfera: 'estadual', uf: 'PA', sede: 'Belém/PA', fusoHorario: 'America/Belem', horarioExpedienteFim: '19:00', peticionamentoEletronicoFim: '23:59:59' },
  TJPI: { id: 'TJPI', nome: 'Tribunal de Justiça do Estado do Piauí', sigla: 'TJPI', esfera: 'estadual', uf: 'PI', sede: 'Teresina/PI', fusoHorario: 'America/Fortaleza', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TJSE: { id: 'TJSE', nome: 'Tribunal de Justiça do Estado de Sergipe', sigla: 'TJSE', esfera: 'estadual', uf: 'SE', sede: 'Aracaju/SE', fusoHorario: 'America/Maceio', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TJAP: { id: 'TJAP', nome: 'Tribunal de Justiça do Estado do Amapá', sigla: 'TJAP', esfera: 'estadual', uf: 'AP', sede: 'Macapá/AP', fusoHorario: 'America/Belem', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TJTO: { id: 'TJTO', nome: 'Tribunal de Justiça do Estado do Tocantins', sigla: 'TJTO', esfera: 'estadual', uf: 'TO', sede: 'Palmas/TO', fusoHorario: 'America/Araguaina', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TJRR: { id: 'TJRR', nome: 'Tribunal de Justiça do Estado de Roraima', sigla: 'TJRR', esfera: 'estadual', uf: 'RR', sede: 'Boa Vista/RR', fusoHorario: 'America/Boa_Vista', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TJAC: { id: 'TJAC', nome: 'Tribunal de Justiça do Estado do Acre', sigla: 'TJAC', esfera: 'estadual', uf: 'AC', sede: 'Rio Branco/AC', fusoHorario: 'America/Rio_Branco', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TJRN: { id: 'TJRN', nome: 'Tribunal de Justiça do Estado do Rio Grande do Norte', sigla: 'TJRN', esfera: 'estadual', uf: 'RN', sede: 'Natal/RN', fusoHorario: 'America/Fortaleza', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TJPB: { id: 'TJPB', nome: 'Tribunal de Justiça do Estado da Paraíba', sigla: 'TJPB', esfera: 'estadual', uf: 'PB', sede: 'João Pessoa/PB', fusoHorario: 'America/Fortaleza', horarioExpedienteFim: '17:00', peticionamentoEletronicoFim: '23:59:59' },
  TJRO: { id: 'TJRO', nome: 'Tribunal de Justiça do Estado de Rondônia', sigla: 'TJRO', esfera: 'estadual', uf: 'RO', sede: 'Porto Velho/RO', fusoHorario: 'America/Porto_Velho', horarioExpedienteFim: '14:00', peticionamentoEletronicoFim: '23:59:59' },
  TJAM: { id: 'TJAM', nome: 'Tribunal de Justiça do Estado do Amazonas', sigla: 'TJAM', esfera: 'estadual', uf: 'AM', sede: 'Manaus/AM', fusoHorario: 'America/Manaus', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TJMS: { id: 'TJMS', nome: 'Tribunal de Justiça do Estado de Mato Grosso do Sul', sigla: 'TJMS', esfera: 'estadual', uf: 'MS', sede: 'Campo Grande/MS', fusoHorario: 'America/Campo_Grande', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TJMT: { id: 'TJMT', nome: 'Tribunal de Justiça do Estado de Mato Grosso', sigla: 'TJMT', esfera: 'estadual', uf: 'MT', sede: 'Cuiabá/MT', fusoHorario: 'America/Cuiaba', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
  TJMA: { id: 'TJMA', nome: 'Tribunal de Justiça do Estado do Maranhão', sigla: 'TJMA', esfera: 'estadual', uf: 'MA', sede: 'São Luís/MA', fusoHorario: 'America/Fortaleza', horarioExpedienteFim: '18:00', peticionamentoEletronicoFim: '23:59:59' },
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
  alteradoPor: z.string().optional(),
  procedencia: ProcedenciaSchema
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
  linkOficial: z.string().optional(),
  procedencia: ProcedenciaSchema
});
export type Precedente = z.infer<typeof PrecedenteSchema>;
