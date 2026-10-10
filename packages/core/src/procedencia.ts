import { z } from 'zod';

/**
 * Procedência: de onde veio um dado jurídico e quem responde por ele (plano, §2.3: "dado jurídico é dado versionado
 * com procedência"). Sem fonte, o dado não entra; IA só sugere, e a sugestão fica marcada até um humano validar.
 */

/** Data ISO `AAAA-MM-DD` que existe no calendário (recusa 2026-02-30). */
export const DataIsoSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'use AAAA-MM-DD')
  .refine(s => {
    const d = new Date(`${s}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(s);
  }, 'data inexistente');

/** Documento oficial de onde um dado foi lido (ato, página do tribunal, texto compilado). */
export const FonteSchema = z.object({
  id: z.string().min(1), // ex: "stj-gdg-1010"
  ato: z.string().min(1), // ex: "Portaria STJ/GDG nº 1.010/2025"
  url: z.url(),
  /** O que foi lido de fato: o ato inteiro, só a notícia oficial, a versão compilada. */
  lido: z.string().min(1),
  lidoEm: DataIsoSchema
});
export type Fonte = z.infer<typeof FonteSchema>;

/** `curado`: uma pessoa leu a fonte e registrou o dado. `sugerido_ia`: a IA extraiu; só vale depois de validada. */
export const OrigemDadoSchema = z.enum(['curado', 'sugerido_ia']);
export type OrigemDado = z.infer<typeof OrigemDadoSchema>;

export const ValidacaoHumanaSchema = z.object({
  por: z.string().min(1),
  em: DataIsoSchema
});
export type ValidacaoHumana = z.infer<typeof ValidacaoHumanaSchema>;

export const ProcedenciaSchema = z.object({
  origem: OrigemDadoSchema,
  /** Ao menos uma: é o que torna o dado verificável. */
  fontes: z.array(FonteSchema).min(1),
  validacao: ValidacaoHumanaSchema.optional()
});
export type Procedencia = z.infer<typeof ProcedenciaSchema>;

export type SituacaoProcedencia = 'curado' | 'sugestao_validada' | 'sugestao_pendente';

/** Como o dado deve aparecer ao usuário: a sugestão da IA sem validação nunca passa por fato. */
export function situacaoProcedencia(p: Procedencia): SituacaoProcedencia {
  if (p.origem === 'curado') return 'curado';
  return p.validacao ? 'sugestao_validada' : 'sugestao_pendente';
}
