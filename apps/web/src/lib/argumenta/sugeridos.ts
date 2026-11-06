/**
 * F5-08, fase 3: "Para ler também" sob cada questão da análise. Parte só das citações que a decisão já fez e que a base conferiu
 * (selo "Encontrada"): de cada artigo, os precedentes do TeseMap que o citam expressamente; de cada precedente, os que a própria fonte liga a ele.
 * Sai do navegador apenas o identificador público do artigo ou do precedente, nunca texto da decisão ou da questão. Nada é inferido por IA e
 * nada é guardado. É sugestão de leitura: não diz que o precedente se aplica ao caso.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { precedentesQueCitam, type PrecedentesQueCitam } from '../ligacoes';
import { lerTeseMap, urlDoTeseMap } from '../parametrosSalvos';
import { destinoDoEndereco } from '../caso/ligacao';
import { ligadosPelasFontes, type NoLigado, type NoTese } from '../tesemap';
import type { LinkDaCitacao } from './verificarCitacoes';

export const LIMITE_DE_SUGERIDOS = 5;
/** Quantas citações da questão geram sugestões: limita as consultas por questão. */
export const LIMITE_DE_ORIGENS = 4;

export type MotivoDoSugerido = 'cita' | 'ligado';

export interface Sugerido {
  rotulo: string;
  href: string;
  tribunal: string | null;
  vinculante: boolean;
  /** Por que aparece: o precedente cita o artigo da decisão, ou a fonte o liga ao precedente que a decisão citou. */
  motivo: MotivoDoSugerido;
  /** O rótulo da citação da decisão de onde veio ("CPC, art. 85", "Tema 1076 do STJ"). */
  origem: string;
}

export interface SugeridosDaQuestao {
  itens: Sugerido[];
  temMais: boolean;
}

/** O que a busca lê do banco; separado para os testes não precisarem de um banco. */
export interface LeitorDeSugeridos {
  citamODispositivo(dispositivoId: string): Promise<PrecedentesQueCitam>;
  ligadosAoNo(noId: string): Promise<NoLigado[]>;
}

export function leitorSupabase(db: SupabaseClient): LeitorDeSugeridos {
  return {
    citamODispositivo: id => precedentesQueCitam(db, id),
    async ligadosAoNo(noId) {
      const r = await db.from('tesemap_nos').select('id, rotulo, tipo, tribunal, detalhes').eq('id', noId).maybeSingle();
      if (r.error) throw new Error(r.error.message);
      if (!r.data) return [];
      return ligadosPelasFontes(db, r.data as unknown as NoTese);
    }
  };
}

/** Os precedentes que a decisão já citou na questão, para não sugeri-los de volta. */
function jaCitados(links: readonly LinkDaCitacao[]): Set<string> {
  const ids = new Set<string>();
  for (const l of links) {
    const d = destinoDoEndereco(l.href);
    if (d?.ferramenta === 'tesemap') ids.add(d.id);
  }
  return ids;
}

/**
 * Sugestões para uma questão a partir dos links das suas citações conferidas. Uma consulta que falha não derruba as outras e nunca vira
 * "não há sugestão": a seção só aparece quando há o que mostrar.
 */
export async function sugeridosDaQuestao(leitor: LeitorDeSugeridos, links: readonly LinkDaCitacao[]): Promise<SugeridosDaQuestao> {
  const citados = jaCitados(links);
  const origens = links
    .map(l => ({ rotulo: l.rotulo, destino: destinoDoEndereco(l.href) }))
    .filter((o): o is { rotulo: string; destino: NonNullable<ReturnType<typeof destinoDoEndereco>> } => o.destino !== null)
    .filter((o, i, todas) => todas.findIndex(x => x.destino.ferramenta === o.destino.ferramenta && x.destino.id === o.destino.id) === i)
    .slice(0, LIMITE_DE_ORIGENS);

  const porOrigem = await Promise.all(
    origens.map(async (o): Promise<Sugerido[]> => {
      try {
        if (o.destino.ferramenta === 'normaviva') {
          const r = await leitor.citamODispositivo(o.destino.id);
          return r.itens.map(p => ({ rotulo: p.rotulo, href: p.href, tribunal: p.tribunal, vinculante: p.vinculante, motivo: 'cita', origem: o.rotulo }));
        }
        const ligados = await leitor.ligadosAoNo(o.destino.id);
        return ligados.map(n => ({ rotulo: n.rotulo, href: urlDoTeseMap({ noId: n.id }), tribunal: n.tribunal, vinculante: false, motivo: 'ligado', origem: o.rotulo }));
      } catch {
        return [];
      }
    })
  );

  // Primeira origem que traz o precedente fica com ele; os já citados na questão saem
  const vistos = new Map<string, Sugerido>();
  for (const s of porOrigem.flat()) {
    const id = lerTeseMap(s.href.split('?')[1] ?? '').noId;
    if (!id || citados.has(id) || vistos.has(id)) continue;
    vistos.set(id, s);
  }
  const todos = [...vistos.values()].sort((a, b) => Number(b.vinculante) - Number(a.vinculante));
  return { itens: todos.slice(0, LIMITE_DE_SUGERIDOS), temMais: todos.length > LIMITE_DE_SUGERIDOS };
}
