import { z } from 'zod';
import { prepararDecisao } from '@ratione/argumenta';
import { TRIBUNAIS_BRASIL } from '@ratione/core';
import { ehDataIsoValida } from '@ratione/prazozero';
import { TIPOS_DE_EVENTO } from '../../ia/tarefas/lerIntimacao';

/**
 * Formato de um caso do corpus de intimações. O `esperado` é o gabarito do jurista; sem `validacao` o caso existe, mas não entra nas
 * métricas. `dadosFicticios` lista o que NÃO pode chegar ao modelo (nomes, CPF, número do processo): o teste confere a pseudonimização.
 * Os valores neutros, os mesmos que a tarefa devolve quando o texto não diz: `dias` 0, `tipoEvento` "nao_informado", `dataEvento` e `tribunal` vazios.
 */
export const ValoresSchema = z
  .object({
    dias: z.number().int().min(0).max(365),
    tipoEvento: z.enum(TIPOS_DE_EVENTO),
    dataEvento: z.string().refine(d => d === '' || ehDataIsoValida(d), 'use AAAA-MM-DD ou vazio'),
    tribunal: z.string().refine(t => t === '' || Object.hasOwn(TRIBUNAIS_BRASIL, t), 'use uma sigla da lista do Ratione ou vazio')
  })
  .strict();
export type Valores = z.infer<typeof ValoresSchema>;

export const CasoDeIntimacaoSchema = z
  .object({
    id: z.string().regex(/^int-\d{2}-[a-z0-9-]{3,50}$/),
    descricao: z.string().min(10).max(300),
    texto: z.string().min(100),
    dadosFicticios: z.array(z.string().min(3)).max(20),
    esperado: ValoresSchema,
    validacao: z.object({ por: z.string().min(5), em: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }).strict().nullable()
  })
  .strict();
export type CasoDeIntimacao = z.infer<typeof CasoDeIntimacaoSchema>;

export type CasoValidadoDeIntimacao = CasoDeIntimacao & { validacao: { por: string; em: string } };
export const intimacaoValidada = (c: CasoDeIntimacao): c is CasoValidadoDeIntimacao => c.validacao !== null;

/** Os parágrafos como o navegador os envia (segmentados e pseudonimizados). */
export const paragrafosDaIntimacao = (c: Pick<CasoDeIntimacao, 'texto'>): string[] => prepararDecisao(c.texto).paragrafos;
