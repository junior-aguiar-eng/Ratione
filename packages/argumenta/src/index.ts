import { z } from 'zod';

/**
 * Tipologia rigorosa de nulidades de fundamentação conforme Art. 489, § 1º do Código de Processo Civil
 */
export const IncisoArtigo489Schema = z.enum([
  'I_MERA_REPRODUCAO_NORMATIVA',               // Art. 489, § 1º, I
  'II_CONCEITO_INDETERMINADO_SEM_CONCRECAO',    // Art. 489, § 1º, II
  'III_MOTIVOS_GENERICOS_QUALQUER_DECISAO',     // Art. 489, § 1º, III
  'IV_NAO_ENFRENTAMENTO_ARGUMENTO_CAPAZ',      // Art. 489, § 1º, IV
  'V_PRECEDENTE_SEM_DEMONSTRACAO_SIMILITUDE',   // Art. 489, § 1º, V
  'VI_DESRESPEITO_PRECEDENTE_SEM_DISTINCAO'     // Art. 489, § 1º, VI
]);
export type IncisoArtigo489 = z.infer<typeof IncisoArtigo489Schema>;

export const VulnerabilidadeArgumentativaSchema = z.object({
  id: z.string(),
  tipoInciso: IncisoArtigo489Schema,
  titulo: z.string(),
  explicacao: z.string(),
  trechoTexto: z.string(),
  pagina: z.number().optional(),
  paragrafo: z.number().optional(),
  remedioProcessualSugerido: z.enum([
    'embargos_declaracao_omissao',
    'embargos_declaracao_contradicao',
    'apelacao_nulidade_sentenca',
    'recurso_especial_art_1022_cpc',
    'distinguishing_em_contrarazoes'
  ])
});
export type VulnerabilidadeArgumentativa = z.infer<typeof VulnerabilidadeArgumentativaSchema>;

export const PremissaArgumentoSchema = z.object({
  id: z.string(),
  tipo: z.enum(['fato_provado', 'fato_controverso', 'norma_positivada', 'precedente_judicial', 'presuncao_legal']),
  descricao: z.string(),
  fonteCitada: z.string().optional(),
  paginaDoc: z.number().optional()
});
export type PremissaArgumento = z.infer<typeof PremissaArgumentoSchema>;

export const TeseDecisaoSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  conclusao: z.string(),
  premissas: z.array(PremissaArgumentoSchema),
  dispositivosLegais: z.array(z.string()),
  precedentesCitados: z.array(z.string()),
  vulnerabilidades: z.array(VulnerabilidadeArgumentativaSchema).default([])
});
export type TeseDecisao = z.infer<typeof TeseDecisaoSchema>;

export const EstruturaDecisaoCanonicaSchema = z.object({
  id: z.string(),
  numeroProcesso: z.string().optional(),
  tribunalOuVara: z.string().optional(),
  magistrado: z.string().optional(),
  dataDecisao: z.string().optional(),
  relatorio: z.object({
    resumoFatico: z.string(),
    partes: z.object({
      poloAtivo: z.array(z.string()),
      poloPassivo: z.array(z.string())
    }),
    pedidosPrincipais: z.array(z.string())
  }),
  fundamentacao: z.object({
    tesesIdentificadas: z.array(TeseDecisaoSchema),
    questoesPrejudiciaisOuPreliminares: z.array(z.string()).default([])
  }),
  dispositivo: z.object({
    resultado: z.enum(['procedente', 'improcedente', 'parcialmente_procedente', 'extincao_sem_resolucao_merito']),
    conteudoDispositivo: z.string(),
    sucumbencia: z.string().optional(),
    honorarios: z.string().optional()
  })
});
export type EstruturaDecisaoCanonica = z.infer<typeof EstruturaDecisaoCanonicaSchema>;
