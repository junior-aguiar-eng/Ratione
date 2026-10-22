/**
 * Carga do grafo do TeseMap no Supabase real (F4-03). A partir de `packages/tesemap`, NO SEU COMPUTADOR:
 *
 *   pnpm carregar:tesemap --simular   # monta os nós e mostra as contagens; não precisa de chave nem toca no banco
 *   pnpm carregar:tesemap             # grava (upsert) os nós dos precedentes do STJ e dos temas de repercussão geral do STF
 *
 * Variáveis de ambiente (no terminal, NUNCA em arquivo versionado nem em conversa): SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.
 * Antes: aplicar no SQL Editor `supabase/migrations/20261022000003_tesemap.sql`.
 *
 * Diferente da carga do NormaViva, esta NÃO apaga nada: o texto da lei é regenerável do Planalto, mas as arestas do grafo são curadoria e
 * validação humana. O `upsert` por `id` atualiza só os nós da fonte oficial; nó ou aresta curados à mão ficam como estão.
 */
import { carregarPrecedentesStj, manifestoStj } from '../stj';
import { join } from 'node:path';
import { extrairRemissoes } from '@ratione/normaviva/referencias';
import { linhasDoCorpus } from '@ratione/normaviva/corpus';
import { carregarTemasRgStf, manifestoStf } from '../stf';
import { nosDosPrecedentesStj, temasStfCitadosPeloStj } from './nos-stj';
import { nosDosTemasStf } from './nos-stf';
import { citacoesNoTexto } from './citacoes';
import type { NoBanco } from './esquemas';

const LOTE = 200;

/** O mínimo do cliente do Supabase que a carga usa; o teste troca por um falso. */
export interface ClienteCarga {
  from(tabela: string): {
    upsert(linhas: unknown[], opcoes: { onConflict: string }): PromiseLike<{ error: { message: string } | null }>;
    select(colunas: string, opcoes: { count: 'exact'; head: true }): PromiseLike<{ count: number | null; error: { message: string } | null }>;
  };
}

export async function carregarNos(cliente: ClienteCarga, nos: NoBanco[], log: (m: string) => void = () => {}): Promise<{ enviados: number; noBanco: number }> {
  for (let i = 0; i < nos.length; i += LOTE) {
    const r = await cliente.from('tesemap_nos').upsert(nos.slice(i, i + LOTE), { onConflict: 'id' });
    if (r.error) throw new Error(`gravar tesemap_nos (lote ${i / LOTE + 1}): ${r.error.message}`);
  }
  log(`  tesemap_nos: ${nos.length} nós enviados`);
  const c = await cliente.from('tesemap_nos').select('*', { count: 'exact', head: true });
  if (c.error) throw new Error(`contar tesemap_nos: ${c.error.message}`);
  return { enviados: nos.length, noBanco: c.count ?? 0 };
}

async function main() {
  // Atalhos para o NormaViva: só o dispositivo que existe no corpus de leis
  const ids = new Set(linhasDoCorpus(join(__dirname, '..', '..', '..', 'normaviva', 'corpus')).flatMap(l => l.dispositivos.map(d => d.id)));
  const citar = (t: string) => citacoesNoTexto(t, extrairRemissoes, id => ids.has(id));
  const nosStj = nosDosPrecedentesStj(carregarPrecedentesStj(), manifestoStj(), citar);
  const nosStf = nosDosTemasStf(carregarTemasRgStf(), manifestoStf(), citar, temasStfCitadosPeloStj(nosStj));
  const nos = [...nosStj, ...nosStf];
  const comCitacao = nos.filter(n => (n.detalhes.citacoes as unknown[]).length > 0).length;
  console.log(`Nós montados: ${nos.length} = ${nosStj.length} do STJ (tese firmada, não cancelados) + ${nosStf.length} do STF (repercussão geral reconhecida: ${nosStf.filter(n => n.tipo === 'precedente').length} com tese, ${nosStf.filter(n => n.tipo === 'tema').length} como tema sem tese, entre eles os que o STJ cita); ${comCitacao} citam dispositivo do NormaViva`);
  if (process.argv.includes('--simular')) {
    console.log('Simulação: nada foi enviado ao banco.');
    return;
  }
  const url = process.env.SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) throw new Error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no terminal (veja o comentário no topo deste arquivo).');
  if (!/^https:\/\/[a-z0-9]+\.supabase\.co\/?$/.test(url)) throw new Error('SUPABASE_URL deve ser o endereço do projeto, no formato https://<ref>.supabase.co');
  const { createClient } = await import('@supabase/supabase-js');
  const cliente = createClient(url, chave, { auth: { persistSession: false } }) as unknown as ClienteCarga;
  console.log(`Gravando em ${url} ...`);
  const r = await carregarNos(cliente, nos, console.log);
  console.log(`Nós no banco: ${r.noBanco} (inclui os curados à mão, se houver).`);
  if (r.noBanco < nos.length) throw new Error('O banco tem menos nós do que os enviados: investigue antes de usar.');
  console.log('Carga conferida.');
}

if (require.main === module) main().catch(e => {
  console.error(String(e instanceof Error ? e.message : e));
  process.exitCode = 1;
});
