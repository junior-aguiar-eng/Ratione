/**
 * F5-04: confere, contra o banco público (só leitura, como visitante), as citações reais do corpus de avaliação: as do gabarito e as que o
 * modelo trouxe na última rodada. Mostra, por tipo e por selo, o que o reconhecedor e o verificador fazem, para o revisor olhar o que sair
 * como "não localizada", "fora da base" ou sem formato. Uso (NEXT_PUBLIC_* como no site):
 *   NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=... pnpm --filter web exec tsx scripts/conferir-citacoes.ts [rodada]
 */
import { createClient } from '@supabase/supabase-js';
import path from 'node:path';
import { reconhecerCitacao } from '../src/lib/argumenta/citacoes';
import { bancoSupabase, verificarCitacoes } from '../src/lib/argumenta/verificarCitacoes';
import { lerCasos, lerResultados, ultimaRodada } from '../src/lib/avaliacao/arquivos';
import { listarNormas } from '../src/lib/normaviva';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const chave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !chave) {
  console.error('Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (os mesmos do site).');
  process.exit(1);
}

const urlDoBanco: string = url;
const chaveDoBanco: string = chave;

async function main() {
  const pastas = { raiz: process.env.AVALIACAO_CORPUS ?? path.resolve(process.cwd(), '../../packages/argumenta/corpus') };
  const db = createClient(urlDoBanco, chaveDoBanco, { auth: { persistSession: false } });
  // As normas que a tela usa vêm do banco, e não da lista do código
  const normas = (await listarNormas(db)).map(n => n.id);
  const banco = bancoSupabase(db);

  const rodada = process.argv[2] ?? (await ultimaRodada(pastas));
  const casos = (await lerCasos(pastas)).filter(c => c.gabarito !== null);
  const resultados = rodada ? await lerResultados(pastas, rodada) : [];

  const origem = new Map<string, Set<string>>();
  const anota = (citacao: string, de: string) => {
    const t = citacao.trim();
    if (t) origem.set(t, (origem.get(t) ?? new Set()).add(de));
  };
  for (const c of casos) for (const x of c.gabarito!.citacoes) anota(x, 'gabarito');
  for (const r of resultados) for (const f of r.fundamentos.saida?.fundamentos ?? []) anota(f.citacao, 'modelo');

  const todas = [...origem.keys()];
  const selos = new Map<string, { estado: string; aviso?: string }>();
  for (let i = 0; i < todas.length; i += 50) {
    for (const [k, v] of await verificarCitacoes(todas.slice(i, i + 50), normas, banco)) selos.set(k, v);
  }

  const grupos = new Map<string, string[]>();
  for (const t of todas) {
    const r = reconhecerCitacao(t, normas);
    const s = selos.get(t);
    const chave2 = !r ? 'sem formato (sem selo)' : s ? `${r.tipo} → ${s.estado}` : `${r.tipo} → falha de leitura (sem selo)`;
    grupos.set(chave2, [...(grupos.get(chave2) ?? []), t]);
  }
  console.log(`Rodada ${rodada ?? '(nenhuma)'}: ${todas.length} citações distintas (${casos.length} casos)\n`);
  for (const [g, lista] of [...grupos].sort()) {
    console.log(`## ${g}: ${lista.length}`);
    if (!g.endsWith('encontrada')) for (const t of lista) console.log(`  - ${t}  [${[...(origem.get(t) ?? [])].join(', ')}]`);
  }
}

main().catch(e => {
  console.error((e as Error).message);
  process.exit(1);
});
