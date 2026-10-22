/**
 * Linhas do grafo do TeseMap no banco (F4-03): `tesemap_nos` e `tesemap_arestas` (supabase/migrations/20261022000003_tesemap.sql).
 * A regra de procedência do plano vale aqui antes de o dado chegar ao banco: sem fonte não há linha, e o banco repete a regra (checks e RLS).
 */
import { z } from 'zod';
import { DataIsoSchema, FonteSchema } from '@ratione/core';

export const TIPOS_DE_NO = ['tema', 'questao', 'tese', 'precedente', 'sumula', 'dispositivo', 'conceito', 'excecao', 'distinguishing', 'superacao'] as const;
export const TIPOS_DE_ARESTA = ['interpreta', 'aplica', 'cita', 'confirma', 'distingue', 'supera', 'restringe', 'amplia', 'diverge', 'fundamenta', 'relaciona'] as const;

const ProcedenciaDaLinha = {
  origem_dado: z.enum(['curado', 'sugerido_ia']),
  fontes: z.array(FonteSchema).min(1),
  validado_por: z.string().min(1).nullable(),
  validado_em: DataIsoSchema.nullable(),
  atualizado_em: DataIsoSchema
};

/** Quem valida deixa nome e data juntos, como o `check` do banco. */
const validacaoCompleta = (l: { validado_por: string | null; validado_em: string | null }) => (l.validado_por === null) === (l.validado_em === null);

export const NoBancoSchema = z
  .object({
    id: z.string().min(1),
    tipo: z.enum(TIPOS_DE_NO),
    rotulo: z.string().min(1),
    tribunal: z.string().nullable(),
    numero_referencia: z.string().nullable(),
    descricao: z.string(),
    dispositivo_id: z.string().nullable(),
    detalhes: z.record(z.string(), z.unknown()),
    ...ProcedenciaDaLinha
  })
  .refine(validacaoCompleta, { message: 'validado_por e validado_em andam juntos' });
export type NoBanco = z.infer<typeof NoBancoSchema>;

export const ArestaBancoSchema = z
  .object({
    origem_id: z.string().min(1),
    destino_id: z.string().min(1),
    tipo: z.enum(TIPOS_DE_ARESTA),
    rotulo: z.string(),
    ...ProcedenciaDaLinha
  })
  .refine(validacaoCompleta, { message: 'validado_por e validado_em andam juntos' })
  .refine(a => a.origem_id !== a.destino_id, { message: 'a aresta liga dois nós diferentes' });
export type ArestaBanco = z.infer<typeof ArestaBancoSchema>;

/** Como o banco decide o que o público vê: nó curado ou validado; aresta só validada (e com os dois nós visíveis, que o banco confere). */
export const noVisivel = (n: Pick<NoBanco, 'origem_dado' | 'validado_por'>) => n.origem_dado === 'curado' || n.validado_por !== null;
export const arestaVisivel = (a: Pick<ArestaBanco, 'validado_por'>) => a.validado_por !== null;
