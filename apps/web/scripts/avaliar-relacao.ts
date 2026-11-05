/**
 * Medição da tarefa `relacionar-com-o-caso` com o corpus do Argumenta (docs/produto/IA_TAREFAS.md §8.1). Uso:
 *
 *   pnpm --filter web avaliar-relacao [--casos a,b] [--por-questao 2] [--max-pares 60] [--max-usd 1] [--modelo claude-sonnet-5-5] [--confirmar]
 *
 * Sem `--confirmar` só mostra quantos pares há e a estimativa de custo; com ele chama o modelo. Precisa de `ANTHROPIC_API_KEY`,
 * `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (leitura pública do NormaViva e do TeseMap). O relatório vai para
 * `packages/argumenta/corpus/resultados-relacao/<rodada>/`.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { ehValidado, type CasoValidado } from '../src/lib/avaliacao/caso';
import { lerCasos } from '../src/lib/avaliacao/arquivos';
import { etapa } from '../src/lib/avaliacao/executarCaso';
import { montarPares, relatorioDaRelacao, type FonteResolvida, type ResultadoDoPar } from '../src/lib/avaliacao/relacao';
import { criarChamadaAoModelo } from '../src/lib/ia/cliente';
import type { ModeloPermitido } from '../src/lib/ia/contrato';
import { custoMaximoUsd } from '../src/lib/ia/politica';
import { lerDispositivoParaExplicar } from '../src/lib/ia/fontes/dispositivoDoBanco';
import { lerNoParaRelacionar } from '../src/lib/ia/fontes/noDoTeseMap';
import { relacionarComOCaso } from '../src/lib/ia/tarefas/relacionarComOCaso';
import { bancoSupabase, LIMITE_DE_CITACOES, verificarCitacoes } from '../src/lib/argumenta/verificarCitacoes';
import { destinoDoEndereco } from '../src/lib/caso/ligacao';
import { listarNormas } from '../src/lib/normaviva';

const raiz = process.env.AVALIACAO_CORPUS ?? path.resolve(process.cwd(), '../../packages/argumenta/corpus');

function opcoes(args: string[]): Map<string, string> {
  const flags = new Map<string, string>();
  for (let i = 0; i < args.length; i++) {
    if (!args[i].startsWith('--')) continue;
    if (args[i + 1] !== undefined && !args[i + 1].startsWith('--')) flags.set(args[i].slice(2), args[++i]);
    else flags.set(args[i].slice(2), 'sim');
  }
  return flags;
}

function sair(mensagem: string): never {
  console.error(mensagem);
  process.exit(1);
}

async function main() {
  const flags = opcoes(process.argv.slice(2));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !chave) sair('Faltam NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (leitura pública do NormaViva e do TeseMap).');
  const db = createClient(url, chave, { auth: { persistSession: false, autoRefreshToken: false } });

  const escolhidos = flags.get('casos')?.split(',').map(s => s.trim());
  const casos = (await lerCasos({ raiz })).filter(ehValidado).filter(c => !escolhidos || escolhidos.includes(c.id)) as CasoValidado[];
  if (casos.length === 0) sair('Nenhum caso validado encontrado.');

  // Cada citação do gabarito que a base reconhece vira uma fonte (dispositivo do NormaViva ou nó do TeseMap)
  const citacoes = [...new Set(casos.flatMap(c => c.gabarito.citacoes.map(x => x.trim())))];
  const normas = (await listarNormas(db)).map(n => n.id);
  const fontes = new Map<string, FonteResolvida>();
  for (let i = 0; i < citacoes.length; i += LIMITE_DE_CITACOES) {
    const lote = citacoes.slice(i, i + LIMITE_DE_CITACOES);
    const selos = await verificarCitacoes(lote, normas, bancoSupabase(db));
    for (const [citacao, selo] of selos) {
      const destino = selo.estado === 'encontrada' ? destinoDoEndereco(selo.links[0]?.href ?? '') : null;
      if (destino) fontes.set(citacao, { citacao, ferramenta: destino.ferramenta, destinoId: destino.id });
    }
  }

  const porQuestao = Number(flags.get('por-questao') ?? 2);
  const maximo = Number(flags.get('max-pares') ?? 60);
  const pares = montarPares(casos, fontes, { porQuestao, maximo });
  const positivos = pares.filter(p => p.esperado === 'aplica').length;
  const estimativa = pares.length * custoMaximoUsd(relacionarComOCaso);
  console.log(`${casos.length} casos, ${fontes.size} citações com fonte na base, ${pares.length} pares (${positivos} positivos, ${pares.length - positivos} negativos).`);
  console.log(`Custo máximo estimado: US$ ${estimativa.toFixed(2)} (o gasto real costuma ser uma fração disso).`);
  if (pares.length === 0) sair('Nenhum par montado: as citações do gabarito não achadas na base ou não escritas nos parágrafos das questões.');

  const teto = Number(flags.get('max-usd') ?? 1);
  if (estimativa > teto) sair(`A estimativa passa do teto de US$ ${teto.toFixed(2)}. Reduza --max-pares ou suba --max-usd.`);
  if (!flags.has('confirmar')) {
    console.log('Sem --confirmar: nada foi chamado. Rode de novo com --confirmar para medir.');
    return;
  }
  const chaveApi = process.env.ANTHROPIC_API_KEY;
  if (!chaveApi) sair('Falta ANTHROPIC_API_KEY.');

  const modelo = (flags.get('modelo') as ModeloPermitido | undefined) ?? relacionarComOCaso.modelo;
  const chamar = criarChamadaAoModelo(chaveApi);
  const leitura = { lerDispositivo: (id: string) => lerDispositivoParaExplicar(db, id), lerNoTeseMap: (id: string) => lerNoParaRelacionar(db, id) };

  const resultados: ResultadoDoPar[] = [];
  for (const par of pares) {
    const entrada = { ferramenta: par.fonte.ferramenta, destinoId: par.fonte.destinoId, enunciado: par.enunciado, conclusao: par.conclusao };
    const r = await etapa(relacionarComOCaso, entrada, chamar, modelo, leitura);
    resultados.push({ par, etapa: r as ResultadoDoPar['etapa'] });
    process.stdout.write(`${resultados.length}/${pares.length} ${par.casoId} ${par.questaoId} → ${r.estado}${r.saida ? ` (${(r.saida as { relacao: string }).relacao})` : ''}\n`);
  }

  const data = new Date().toISOString().slice(0, 10);
  const rodada = new Date().toISOString().slice(0, 16).replace(/[-:]/g, '').replace('T', 'T');
  const pasta = path.join(raiz, 'resultados-relacao', rodada);
  await mkdir(pasta, { recursive: true });
  await writeFile(path.join(pasta, 'relatorio.md'), relatorioDaRelacao(resultados, modelo, data), 'utf8');
  await writeFile(path.join(pasta, 'resultados.json'), `${JSON.stringify(resultados, null, 2)}\n`, 'utf8');
  console.log(`Relatório em ${path.join(pasta, 'relatorio.md')}`);
}

main().catch(e => sair(String(e?.message ?? e)));
