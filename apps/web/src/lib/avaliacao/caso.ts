/**
 * F5-05: formato de um caso do corpus de avaliação do Argumenta. O gabarito é do jurista revisor; sem `validacao` o caso existe, mas não
 * entra nas métricas. O número de cada parágrafo é o da segmentação do próprio sistema (a mesma que o modelo recebe).
 */
import { z } from 'zod';
import { prepararDecisao } from '@ratione/argumenta';

/** O analista validador jurídico do Ratione (nome completo, como vai em `validacao.por`). */
export const REVISOR_PADRAO = 'José Bonifácio de Aguiar Santos Júnior';

const DataIso = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'use AAAA-MM-DD');
const Paragrafos = z.array(z.number().int().min(1)).min(1).max(80);

const Intervalo = z.object({ inicio: z.number().int().min(1), fim: z.number().int().min(1) }).refine(d => d.inicio <= d.fim, 'início depois do fim');

export const GabaritoSchema = z
  .object({
    /** Intervalo de parágrafos do dispositivo (inclusive). */
    dispositivo: Intervalo,
    /** Outros intervalos que também valem como o dispositivo: o acórdão traz dois blocos que decidem (o bloco "Acórdão" e o fim do voto). */
    dispositivoAlternativo: z.array(Intervalo).max(3).optional(),
    /** Questões que a decisão resolve, com os parágrafos onde são discutidas e decididas. */
    questoes: z
      .array(z.object({ enunciado: z.string().min(3).max(400), conclusao: z.string().min(3).max(400), paragrafos: Paragrafos }).strict())
      .min(1)
      .max(10),
    /** Normas e precedentes que a decisão cita, como aparecem no texto ("CDC, art. 14"; "Súmula 479 do STJ"). */
    citacoes: z.array(z.string().min(2).max(200)).max(60)
  })
  .strict();
export type Gabarito = z.infer<typeof GabaritoSchema>;

export const CasoSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9][a-z0-9-]{2,59}$/, 'minúsculas, números e hífen'),
    fonte: z.object({ descricao: z.string().min(3).max(300), url: z.url(), acessadoEm: DataIso }).strict(),
    tipo: z.enum(['sentenca', 'acordao', 'decisao_monocratica', 'decisao_interlocutoria', 'outro']),
    texto: z.string().min(200),
    gabarito: GabaritoSchema.nullable(),
    validacao: z.object({ por: z.string().min(5), em: DataIso }).strict().nullable()
  })
  .strict()
  .refine(c => c.validacao === null || c.gabarito !== null, { message: 'validação sem gabarito', path: ['validacao'] });
export type Caso = z.infer<typeof CasoSchema>;

/** Caso com gabarito conferido por jurista: o único que entra nas métricas. */
export type CasoValidado = Caso & { gabarito: Gabarito; validacao: { por: string; em: string } };
export const ehValidado = (c: Caso): c is CasoValidado => c.gabarito !== null && c.validacao !== null;

/** Os parágrafos como o modelo os recebe (segmentados e pseudonimizados). */
export const paragrafosDoCaso = (c: Pick<Caso, 'texto'>): string[] => prepararDecisao(c.texto).paragrafos;

/** O gabarito só pode citar parágrafos que existem na segmentação; devolve o que está fora, para o revisor corrigir. */
export function problemasDoGabarito(g: Gabarito, totalParagrafos: number): string[] {
  const problemas: string[] = [];
  const fora = (n: number) => n < 1 || n > totalParagrafos;
  [g.dispositivo, ...(g.dispositivoAlternativo ?? [])].forEach((d, i) => {
    if (fora(d.inicio) || fora(d.fim)) problemas.push(`${i === 0 ? 'dispositivo' : `dispositivo alternativo ${i}`} fora da decisão (1 a ${totalParagrafos})`);
  });
  g.questoes.forEach((q, i) => {
    if (q.paragrafos.some(fora)) problemas.push(`questão ${i + 1} cita parágrafo fora da decisão (1 a ${totalParagrafos})`);
  });
  return problemas;
}
