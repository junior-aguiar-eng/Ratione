import type { SupabaseClient } from '@supabase/supabase-js';
import type { Dispositivo } from '../normaviva';
import type { DispositivoParaExplicar } from './prompt';

type Linha = Pick<Dispositivo, 'id' | 'rotulo' | 'tipo' | 'ordem' | 'texto' | 'revogado'>;

/** O texto que a tela mostra para o dispositivo: ele e os que estão abaixo dele (mesma regra de `carregarDetalhe`), um por linha, com o rótulo. */
export function textoDoDispositivo(base: Linha, abaixo: Linha[]): string {
  const linhas: string[] = [];
  for (const d of abaixo) {
    if (d.ordem > base.ordem && (d.tipo === 'artigo' || d.rotulo.split(', ').length <= base.rotulo.split(', ').length)) break;
    linhas.push(`${d.rotulo}. ${d.revogado ? '(revogado)' : d.texto}`.trim());
  }
  return linhas.join('\n');
}

/** Lê do banco (leitura pública do NormaViva) o que a explicação recebe. Nada vem do navegador além do id. */
export async function lerDispositivoParaExplicar(db: SupabaseClient, id: string): Promise<DispositivoParaExplicar | null> {
  const base = await db.from('dispositivos').select('id, norma_id, escopo, rotulo, tipo, ordem, texto, revogado').eq('id', id).maybeSingle();
  if (base.error) throw new Error(`ler dispositivo: ${base.error.message}`);
  if (!base.data) return null;
  const d = base.data as Linha & { norma_id: string; escopo: string };
  const [abaixo, norma, versao] = await Promise.all([
    db.from('dispositivos').select('id, rotulo, tipo, ordem, texto, revogado').eq('norma_id', d.norma_id).eq('escopo', d.escopo).gte('ordem', d.ordem).order('ordem').limit(400),
    db.from('normas').select('nome').eq('id', d.norma_id).maybeSingle(),
    db.from('versoes_dispositivo').select('ato_rotulo, vigente_de, vigencia_confirmada').eq('dispositivo_id', id).is('vigente_ate', null).maybeSingle()
  ]);
  if (abaixo.error) throw new Error(`ler dispositivos abaixo: ${abaixo.error.message}`);
  if (norma.error || !norma.data) throw new Error(`ler norma ${d.norma_id}: ${norma.error?.message ?? 'não encontrada'}`);
  if (versao.error) throw new Error(`ler versão: ${versao.error.message}`);
  return {
    id: d.id,
    normaNome: norma.data.nome as string,
    rotulo: d.rotulo,
    texto: textoDoDispositivo(d, (abaixo.data ?? []) as Linha[]),
    atoDaRedacao: (versao.data?.ato_rotulo as string | null) ?? null,
    vigenteDe: (versao.data?.vigente_de as string | null) ?? null,
    vigenciaConfirmada: !!versao.data?.vigencia_confirmada,
    revogado: d.revogado
  };
}
