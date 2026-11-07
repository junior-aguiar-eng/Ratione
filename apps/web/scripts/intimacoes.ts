/**
 * Corpus sintético de intimações (`ler-intimacao`). Uso: `pnpm --filter web intimacoes <comando>`. Veja `docs/produto/IA_TAREFAS.md` §8.2.
 *
 *   folha                                  gera `docs/produto/INTIMACAO_CORPUS.md`, a folha para o jurista conferir o gabarito
 *   rodar [--casos a,b] [--max-usd 0.5] [--confirmar]
 *                                          roda a tarefa sobre os casos VALIDADOS e grava o relatório em `apps/web/corpus-intimacoes/rodadas/`;
 *                                          sem --confirmar só mostra a estimativa; com ele chama o modelo (precisa de ANTHROPIC_API_KEY)
 *   rodar-externa --arquivo <amostra.json> [--max-usd 0.1] [--confirmar]
 *                                          mede a tarefa sobre uma amostra de intimações REAIS mantida fora do repositório (o texto traz nome de
 *                                          partes). O relatório vai para a pasta do arquivo, nunca para o repositório. Sem validação do revisor
 *                                          o gabarito é só proposto, e o relatório avisa isso no topo. Formato dos itens: `casoDeAmostraExterna`.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { CASOS } from '../src/lib/avaliacao/intimacoes/casos';
import { casoDeAmostraExterna, intimacaoValidada } from '../src/lib/avaliacao/intimacoes/caso';
import { executarIntimacao, gerarFolha, montarRelatorio, type ResultadoDaIntimacao } from '../src/lib/avaliacao/intimacoes/avaliar';
import { criarChamadaAoModelo } from '../src/lib/ia/cliente';
import { custoMaximoUsd } from '../src/lib/ia/politica';
import { lerIntimacao } from '../src/lib/ia/tarefas/lerIntimacao';

const hoje = () => new Date().toISOString().slice(0, 10);
const web = process.cwd();

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

async function folha() {
  const destino = path.resolve(web, '../../docs/produto/INTIMACAO_CORPUS.md');
  await writeFile(destino, gerarFolha(CASOS), 'utf8');
  console.log(`Folha de conferência: ${destino}`);
}

async function rodar(flags: Map<string, string>) {
  const so = flags.get('casos')?.split(',');
  const casos = CASOS.filter(intimacaoValidada).filter(c => !so || so.includes(c.id));
  if (casos.length === 0) sair('Nenhum caso validado para rodar (a validação é registrada no campo "validacao" de cada caso em casos.ts).');
  const maxUsd = Number(flags.get('max-usd') ?? '0.5');
  const teto = custoMaximoUsd(lerIntimacao);

  console.log(`${casos.length} caso(s) validado(s); modelo ${lerIntimacao.modelo}; 1 chamada por caso.`);
  console.log(`Teto de custo por caso: US$ ${teto.toFixed(4)}; teto da rodada: US$ ${(teto * casos.length).toFixed(4)} (o custo real costuma ser bem menor).`);
  if (flags.get('confirmar') !== 'sim') {
    console.log('Simulação: nada foi enviado ao modelo. Rode de novo com --confirmar para executar (e --max-usd N para limitar o gasto real).');
    return;
  }
  const chave = process.env.ANTHROPIC_API_KEY ?? sair('Defina ANTHROPIC_API_KEY no ambiente deste terminal para rodar.');
  const chamar = criarChamadaAoModelo(chave);

  const agora = new Date();
  const rodada = `${hoje()}T${String(agora.getHours()).padStart(2, '0')}${String(agora.getMinutes()).padStart(2, '0')}`;
  const resultados: ResultadoDaIntimacao[] = [];
  let gasto = 0;
  for (const caso of casos) {
    if (gasto >= maxUsd) {
      console.log(`Parei antes de ${caso.id}: gasto de US$ ${gasto.toFixed(4)} chegou ao limite de US$ ${maxUsd}.`);
      break;
    }
    const r = await executarIntimacao(caso, chamar);
    resultados.push(r);
    gasto += r.custoUsd;
    console.log(`${caso.id}: ${r.estado}${r.motivo ? ` (${r.motivo})` : ''}`);
  }
  const pasta = path.resolve(web, 'corpus-intimacoes/rodadas');
  await mkdir(pasta, { recursive: true });
  const arquivo = path.join(pasta, `${rodada}.md`);
  await writeFile(arquivo, montarRelatorio({ rodada, modelo: lerIntimacao.modelo, casos, resultados }), 'utf8');
  console.log(`Relatório: ${arquivo}`);
}

async function rodarExterna(flags: Map<string, string>) {
  const arquivo = flags.get('arquivo') ?? sair('Informe --arquivo <caminho do JSON da amostra>.');
  const bruto: unknown = JSON.parse(await readFile(arquivo, 'utf8'));
  if (!Array.isArray(bruto) || bruto.length === 0) sair('O arquivo precisa ser uma lista de itens, com ao menos um.');
  const so = flags.get('casos')?.split(',');
  const casos = bruto.map(casoDeAmostraExterna).filter(c => !so || so.includes(c.id));
  const naoValidados = casos.filter(c => !intimacaoValidada(c)).length;
  const maxUsd = Number(flags.get('max-usd') ?? '0.1');
  const teto = custoMaximoUsd(lerIntimacao);

  console.log(`${casos.length} caso(s) (${casos.length - naoValidados} com gabarito validado, ${naoValidados} só com gabarito proposto); modelo ${lerIntimacao.modelo}; 1 chamada por caso.`);
  console.log(`Teto de custo por caso: US$ ${teto.toFixed(4)}; teto da rodada: US$ ${(teto * casos.length).toFixed(4)} (o custo real costuma ser bem menor).`);
  console.log('O texto enviado ao modelo é o pseudonimizado pelo mesmo caminho do produto; o que a pseudonimização não limpa é recusado pela tarefa e não é enviado.');
  if (flags.get('confirmar') !== 'sim') {
    console.log('Simulação: nada foi enviado ao modelo. Rode de novo com --confirmar para executar (e --max-usd N para limitar o gasto real).');
    return;
  }
  const chave = process.env.ANTHROPIC_API_KEY ?? sair('Defina ANTHROPIC_API_KEY no ambiente deste terminal para rodar.');
  const chamar = criarChamadaAoModelo(chave);

  const agora = new Date();
  const rodada = `${hoje()}T${String(agora.getHours()).padStart(2, '0')}${String(agora.getMinutes()).padStart(2, '0')}`;
  const resultados: ResultadoDaIntimacao[] = [];
  let gasto = 0;
  for (const caso of casos) {
    if (gasto >= maxUsd) {
      console.log(`Parei antes de ${caso.id}: gasto de US$ ${gasto.toFixed(4)} chegou ao limite de US$ ${maxUsd}.`);
      break;
    }
    const r = await executarIntimacao(caso, chamar);
    resultados.push(r);
    gasto += r.custoUsd;
    console.log(`${caso.id}: ${r.estado}${r.motivo ? ` (${r.motivo})` : ''}`);
  }
  const aviso =
    naoValidados > 0
      ? `Gabarito PROPOSTO por regras, ainda não validado pelo revisor (${naoValidados} de ${casos.length} casos). Os números abaixo medem a concordância com essa proposta, não a correção jurídica.`
      : undefined;
  const destino = path.join(path.dirname(path.resolve(arquivo)), `resultado_${rodada}.md`);
  await writeFile(destino, montarRelatorio({ rodada, modelo: lerIntimacao.modelo, casos, resultados, aviso }), 'utf8');
  console.log(`Relatório (fora do repositório): ${destino}`);
}

const [comando, ...resto] = process.argv.slice(2);
const flags = opcoes(resto);
const comandos: Record<string, () => Promise<void>> = { folha, rodar: () => rodar(flags), 'rodar-externa': () => rodarExterna(flags) };
(comandos[comando ?? ''] ?? (() => sair('Comandos: folha, rodar. Veja o cabeçalho de scripts/intimacoes.ts.')))().catch(e => sair(`Erro: ${(e as Error).message}`));
