/**
 * Carga do grafo do TeseMap no Supabase real (F4-03). A partir de `packages/tesemap`, NO SEU COMPUTADOR:
 *
 *   pnpm carregar:tesemap --simular   # monta os nós e mostra as contagens; não precisa de chave nem toca no banco
 *   pnpm carregar:tesemap             # grava (upsert) os nós dos precedentes do STJ e dos temas de repercussão geral do STF
 *                                     # o controle concentrado do STF (F4-02), as súmulas do STJ (F4-01) e o grafo mínimo (F4-05): nós de dispositivo e arestas, que só aparecem depois de validadas
 *
 * Variáveis de ambiente (no terminal, NUNCA em arquivo versionado nem em conversa): SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.
 * Antes: aplicar no SQL Editor `supabase/migrations/20261022000003_tesemap.sql`.
 *
 * Diferente da carga do NormaViva, esta NÃO apaga nada: o texto da lei é regenerável do Planalto, mas as arestas do grafo são curadoria e
 * validação humana. O `upsert` por `id` atualiza só os nós da fonte oficial; nó ou aresta curados à mão ficam como estão.
 */
import { carregarPrecedentesStj, carregarSumulasStj, manifestoStj, manifestoSumulasStj } from '../stj';
import { join } from 'node:path';
import { extrairRemissoes } from '@ratione/normaviva/referencias';
import { linhasDoCorpus } from '@ratione/normaviva/corpus';
import { carregarAplicacaoStf, carregarControleStf, carregarSumulasStf, carregarTemasRgStf, manifestoStf } from '../stf';
import { nosDosPrecedentesStj, temasStfCitadosPeloStj } from './nos-stj';
import { nosDasSumulasStf, nosDoControleConcentrado, nosDosTemasStf } from './nos-stf';
import { nosDasSumulasStj, temasQueLigamSumulas } from './nos-sumulas-stj';
import { citacoesNoTexto } from './citacoes';
import { arestasDoGrafoMinimo, carregarGrafoMinimo, nosDosDispositivos } from './grafo-minimo';
import type { ArestaBanco, NoBanco } from './esquemas';

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

/** Arestas por (origem, destino, tipo): recarregar atualiza rótulo, fonte e validação; aresta curada fora do arquivo fica como está. */
export async function carregarArestas(cliente: ClienteCarga, arestas: ArestaBanco[], log: (m: string) => void = () => {}): Promise<{ enviadas: number; noBanco: number }> {
  const r = await cliente.from('tesemap_arestas').upsert(arestas, { onConflict: 'origem_id,destino_id,tipo' });
  if (r.error) throw new Error(`gravar tesemap_arestas: ${r.error.message}`);
  log(`  tesemap_arestas: ${arestas.length} arestas enviadas (${arestas.filter(a => a.validado_por !== null).length} validadas)`);
  const c = await cliente.from('tesemap_arestas').select('*', { count: 'exact', head: true });
  if (c.error) throw new Error(`contar tesemap_arestas: ${c.error.message}`);
  return { enviadas: arestas.length, noBanco: c.count ?? 0 };
}

async function main() {
  // Atalhos para o NormaViva: só o dispositivo que existe no corpus de leis
  const corpus = linhasDoCorpus(join(__dirname, '..', '..', '..', 'normaviva', 'corpus'));
  const ids = new Set(corpus.flatMap(l => l.dispositivos.map(d => d.id)));
  const citar = (t: string) => citacoesNoTexto(t, extrairRemissoes, id => ids.has(id));
  const precedentesStj = carregarPrecedentesStj();
  const nosStj = nosDosPrecedentesStj(precedentesStj, manifestoStj(), citar);
  const nosStf = nosDosTemasStf(carregarTemasRgStf(), manifestoStf(), citar, temasStfCitadosPeloStj(nosStj), carregarAplicacaoStf());
  const sumulas = carregarSumulasStf();
  // As ligações das súmulas só valem para nó que existe no grafo: os do STJ, os temas do STF e as próprias súmulas
  const existentes = new Set([...nosStj, ...nosStf].map(n => n.id).concat(sumulas.map(x => x.id)));
  const nosSumulas = nosDasSumulasStf(sumulas, manifestoStf(), existentes, citar);
  const nosSumulasStj = nosDasSumulasStj(carregarSumulasStj(), manifestoSumulasStj(), temasQueLigamSumulas(precedentesStj), new Set(nosStj.map(n => n.id)), citar);
  const grafo = carregarGrafoMinimo();
  const nosDispositivos = nosDosDispositivos(grafo, corpus);
  const nosControle = nosDoControleConcentrado(carregarControleStf(), manifestoStf(), citar);
  const nos = [...nosStj, ...nosStf, ...nosSumulas, ...nosControle, ...nosSumulasStj, ...nosDispositivos];
  const arestas = arestasDoGrafoMinimo(grafo, nos);
  const comCitacao = nos.filter(n => (n.detalhes.citacoes as unknown[]).length > 0).length;
  console.log(
    `Nós montados: ${nos.length} = ${nosStj.length} do STJ (tese firmada, não cancelados) + ${nosStf.length} temas de repercussão geral do STF (${nosStf.filter(n => n.tipo === 'precedente').length} com tese; ${nosStf.filter(n => n.tipo === 'tema').length} como tema sem tese, entre eles os que o STJ cita e os muito aplicados) + ${nosSumulas.length} súmulas do STF (${nosSumulas.filter(n => n.detalhes.vinculante).length} vinculantes) + ${nosControle.length} processos de controle concentrado com mérito + ${nosSumulasStj.length} súmulas do STJ em vigor (${nosSumulasStj.filter(n => (n.detalhes.temasStj as unknown[]).length > 0).length} ligadas a tema repetitivo) + ${nosDispositivos.length} dispositivos do grafo mínimo; ${comCitacao} citam dispositivo do NormaViva`
  );
  console.log(`Arestas do grafo mínimo: ${arestas.length} (${arestas.filter(a => a.validado_por !== null).length} validadas; as pendentes não aparecem no site)`);
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
  const ra = await carregarArestas(cliente, arestas, console.log);
  console.log(`Arestas no banco: ${ra.noBanco}.`);
  if (ra.noBanco < arestas.length) throw new Error('O banco tem menos arestas do que as enviadas: investigue antes de usar.');
  console.log('Carga conferida.');
}

if (require.main === module) main().catch(e => {
  console.error(String(e instanceof Error ? e.message : e));
  process.exitCode = 1;
});
