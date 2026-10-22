/**
 * Grafo mínimo conhecido do TeseMap (F4-05): `corpus/grafo-minimo.json`, o grafo do Tema 1.076/STJ (honorários por apreciação equitativa).
 *
 * Os nós de dispositivo saem do corpus do NormaViva (texto oficial do Planalto, versão compilada) e ligam à tela do NormaViva. As arestas são
 * interpretação, por isso nascem `sugerido_ia` e só aparecem depois que o responsável registra a validação no arquivo. Cada aresta cita um
 * trecho literal, e a montagem recusa o trecho que não estiver, palavra por palavra, no texto oficial do nó de onde ele diz vir.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { DataIsoSchema, juntarEspacos as espacos } from '@ratione/core';
import { ArestaBancoSchema, NoBancoSchema, TIPOS_DE_ARESTA, type ArestaBanco, type NoBanco } from './esquemas';

/** Prefixo dos nós do grafo que são dispositivos do NormaViva: `NV|` + id do dispositivo no corpus. */
export const PREFIXO_DISPOSITIVO = 'NV|';

const ValidacaoSchema = z
  .object({ status: z.enum(['pendente', 'validado']), por: z.string().min(1).nullable(), em: DataIsoSchema.nullable() })
  .refine(v => (v.status === 'validado') === (v.por !== null && v.em !== null) && (v.por === null) === (v.em === null), {
    message: 'validado leva nome e data; pendente não leva nenhum dos dois'
  });

export const GrafoMinimoSchema = z.object({
  descricao: z.string(),
  atualizadoEm: DataIsoSchema,
  dispositivos: z.array(z.object({ id: z.string().min(1), rotulo: z.string().min(1) })).min(1),
  arestas: z
    .array(
      z.object({
        id: z.string().regex(/^[a-z0-9-]+$/),
        origem: z.string().min(1),
        destino: z.string().min(1),
        tipo: z.enum(TIPOS_DE_ARESTA),
        rotulo: z.string().min(1),
        trechoDe: z.string().min(1),
        trecho: z.string().min(20),
        validacao: ValidacaoSchema
      })
    )
    .min(1),
  esperado: z.object({ vizinhosDoTema1076: z.array(z.string()) })
});
export type GrafoMinimo = z.infer<typeof GrafoMinimoSchema>;

export function carregarGrafoMinimo(pasta = join(__dirname, '..', '..', 'corpus')): GrafoMinimo {
  return GrafoMinimoSchema.parse(JSON.parse(readFileSync(join(pasta, 'grafo-minimo.json'), 'utf-8')));
}

/** O mínimo do corpus do NormaViva que o grafo usa (as linhas de `linhasDoCorpus`). */
export interface NormaDoCorpus {
  norma: { id: string; nome: string; fonte_url: string; fonte_tipo_pagina: string; fonte_sha256: string; lido_em: string };
  dispositivos: { id: string; texto: string; continuacao: string; anotacoes: unknown }[];
}

/** Nós dos dispositivos do grafo, com o texto oficial e a fonte do Planalto; recusa dispositivo que não exista no corpus. */
export function nosDosDispositivos(grafo: GrafoMinimo, corpus: NormaDoCorpus[]): NoBanco[] {
  return grafo.dispositivos.map(g => {
    const norma = corpus.find(c => c.dispositivos.some(d => d.id === g.id));
    const d = norma?.dispositivos.find(x => x.id === g.id);
    if (!norma || !d) throw new Error(`grafo mínimo: o dispositivo ${g.id} não existe no corpus do NormaViva`);
    const n = norma.norma;
    return NoBancoSchema.parse({
      id: PREFIXO_DISPOSITIVO + g.id,
      tipo: 'dispositivo',
      rotulo: g.rotulo,
      tribunal: null,
      numero_referencia: null,
      descricao: espacos(`${d.texto} ${d.continuacao}`),
      dispositivo_id: g.id,
      detalhes: { norma: n.nome, anotacoes: d.anotacoes, citacoes: [] },
      origem_dado: 'curado',
      fontes: [
        {
          id: `planalto-${n.id}`,
          ato: `${n.nome}, versão ${n.fonte_tipo_pagina} do Planalto`,
          url: n.fonte_url,
          lido: `Texto do dispositivo na página oficial (SHA-256 ${n.fonte_sha256}); importação mecânica, sem edição`,
          lidoEm: n.lido_em
        }
      ],
      validado_por: null,
      validado_em: null,
      atualizado_em: n.lido_em
    });
  });
}

/** Textos oficiais de um nó em que um trecho pode estar: a tese ou o título, a questão e a descrição do tema. */
function textosOficiais(n: NoBanco): string[] {
  return [n.descricao, n.detalhes.questao, n.detalhes.descricaoDoTema].filter((t): t is string => typeof t === 'string').map(espacos);
}

/**
 * Arestas do grafo mínimo. Recusa: nó de origem ou destino que não exista, trecho que não esteja literalmente no texto oficial do nó citado
 * (`trechoDe`) e nó citado que não seja uma das pontas da aresta.
 */
export function arestasDoGrafoMinimo(grafo: GrafoMinimo, nos: NoBanco[]): ArestaBanco[] {
  const porId = new Map(nos.map(n => [n.id, n]));
  return grafo.arestas.map(a => {
    for (const ponta of [a.origem, a.destino]) if (!porId.has(ponta)) throw new Error(`grafo mínimo, aresta ${a.id}: o nó ${ponta} não existe`);
    if (a.trechoDe !== a.origem && a.trechoDe !== a.destino) throw new Error(`grafo mínimo, aresta ${a.id}: o trecho deve vir de uma das pontas`);
    const citado = porId.get(a.trechoDe)!;
    if (!textosOficiais(citado).some(t => t.includes(espacos(a.trecho)))) {
      throw new Error(`grafo mínimo, aresta ${a.id}: o trecho não está, palavra por palavra, no texto oficial de ${a.trechoDe}`);
    }
    const fonte = citado.fontes[0];
    const validado = a.validacao.status === 'validado';
    return ArestaBancoSchema.parse({
      origem_id: a.origem,
      destino_id: a.destino,
      tipo: a.tipo,
      rotulo: a.rotulo,
      origem_dado: 'sugerido_ia',
      fontes: [{ ...fonte, id: `${fonte.id}:${a.id}`, ato: `${fonte.ato} (${citado.rotulo})`, lido: `Trecho literal: "${espacos(a.trecho)}"` }],
      validado_por: validado ? a.validacao.por : null,
      validado_em: validado ? a.validacao.em : null,
      atualizado_em: grafo.atualizadoEm
    });
  });
}
