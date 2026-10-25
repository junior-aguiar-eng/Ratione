/**
 * F5-05: comandos do corpus de avaliação do Argumenta. Uso: `pnpm --filter web avaliacao <comando>`. Veja `packages/argumenta/corpus/LEIA-ME.md`.
 *
 *   novo <id> --texto arquivo.txt --fonte "descrição" --url URL [--acesso AAAA-MM-DD] [--tipo acordao]
 *   folha <id>                  gera a folha de conferência (parágrafos numerados)
 *   validar <id> [--por "Nome"] confere o gabarito preenchido e registra a validação
 *   rodar [--casos a,b] [--max-usd 1] [--confirmar]    sem --confirmar só mostra a estimativa; com ele chama o modelo
 *   relatorio [rodada]          refaz o relatório de uma rodada (a última, por padrão)
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { CasoSchema, ehValidado, paragrafosDoCaso, problemasDoGabarito, REVISOR_PADRAO, type Caso } from '../src/lib/avaliacao/caso';
import { gerarFolha } from '../src/lib/avaliacao/folha';
import { executarCaso } from '../src/lib/avaliacao/executarCaso';
import { montarRelatorio } from '../src/lib/avaliacao/relatorio';
import { gravarCaso, gravarFolha, gravarRelatorio, gravarResultado, gravarRodada, lerCaso, lerCasos, lerResultados, lerRodada, ultimaRodada } from '../src/lib/avaliacao/arquivos';
import { criarChamadaAoModelo } from '../src/lib/ia/cliente';
import { custoMaximoUsd } from '../src/lib/ia/politica';
import { argumentaEstrutura, argumentaFundamentos, argumentaQuestoes } from '../src/lib/ia/tarefas/argumenta';

const pastas = { raiz: process.env.AVALIACAO_CORPUS ?? path.resolve(process.cwd(), '../../packages/argumenta/corpus') };
const hoje = () => new Date().toISOString().slice(0, 10);

function opcoes(args: string[]): { posicionais: string[]; flags: Map<string, string> } {
  const posicionais: string[] = [];
  const flags = new Map<string, string>();
  for (let i = 0; i < args.length; i++) {
    if (!args[i].startsWith('--')) posicionais.push(args[i]);
    else if (args[i + 1] !== undefined && !args[i + 1].startsWith('--')) flags.set(args[i].slice(2), args[++i]);
    else flags.set(args[i].slice(2), 'sim');
  }
  return { posicionais, flags };
}

function sair(mensagem: string): never {
  console.error(mensagem);
  process.exit(1);
}

async function novo(posicionais: string[], flags: Map<string, string>) {
  const id = posicionais[0] ?? sair('Informe o id do caso (ex.: caso-001).');
  const arquivo = flags.get('texto') ?? sair('Informe --texto com o arquivo da decisão.');
  const caso = CasoSchema.safeParse({
    id,
    fonte: { descricao: flags.get('fonte') ?? '', url: flags.get('url') ?? '', acessadoEm: flags.get('acesso') ?? hoje() },
    tipo: flags.get('tipo') ?? 'outro',
    texto: (await readFile(arquivo, 'utf8')).replace(/\r\n/g, '\n').trim(),
    gabarito: null,
    validacao: null
  });
  if (!caso.success) sair(`Caso inválido: ${caso.error.issues.map(i => `${i.path.join('.')} ${i.message}`).join('; ')}`);
  if ((await lerCasos(pastas)).some(c => c.id === id)) sair(`Já existe o caso ${id}.`);
  await gravarCaso(pastas, caso.data);
  const folha = await gravarFolha(pastas, id, gerarFolha(caso.data));
  console.log(`Caso ${id} criado (${paragrafosDoCaso(caso.data).length} parágrafos).\nFolha de conferência: ${folha}`);
}

async function folha(posicionais: string[]) {
  const caso = await lerCaso(pastas, posicionais[0] ?? sair('Informe o id do caso.'));
  console.log(await gravarFolha(pastas, caso.id, gerarFolha(caso)));
}

async function validar(posicionais: string[], flags: Map<string, string>) {
  const caso = await lerCaso(pastas, posicionais[0] ?? sair('Informe o id do caso.'));
  if (!caso.gabarito) sair('Preencha o bloco "gabarito" do arquivo do caso antes de validar.');
  const problemas = problemasDoGabarito(caso.gabarito, paragrafosDoCaso(caso).length);
  if (problemas.length) sair(`Gabarito com problema:\n- ${problemas.join('\n- ')}`);
  const validado: Caso = { ...caso, validacao: { por: flags.get('por') ?? REVISOR_PADRAO, em: hoje() } };
  await gravarCaso(pastas, validado);
  console.log(`Caso ${caso.id} validado por ${validado.validacao!.por} em ${validado.validacao!.em}.`);
}

const TAREFAS = [argumentaEstrutura, argumentaQuestoes, argumentaFundamentos];

async function rodar(flags: Map<string, string>) {
  const so = flags.get('casos')?.split(',');
  const casos = (await lerCasos(pastas)).filter(ehValidado).filter(c => !so || so.includes(c.id));
  if (casos.length === 0) sair('Nenhum caso validado para rodar.');
  const maxUsd = Number(flags.get('max-usd') ?? '1');
  const tetoPorCaso = TAREFAS.reduce((s, t) => s + custoMaximoUsd(t), 0);

  console.log(`${casos.length} caso(s) validado(s); modelo ${argumentaEstrutura.modelo}; 3 chamadas por caso.`);
  console.log(`Teto de custo por caso: US$ ${tetoPorCaso.toFixed(4)}; teto da rodada: US$ ${(tetoPorCaso * casos.length).toFixed(4)} (o custo real costuma ser bem menor).`);
  if (flags.get('confirmar') !== 'sim') {
    console.log('Simulação: nada foi enviado ao modelo. Rode de novo com --confirmar para executar (e --max-usd N para limitar o gasto real).');
    return;
  }
  const chave = process.env.ANTHROPIC_API_KEY ?? sair('Defina ANTHROPIC_API_KEY no ambiente deste terminal para rodar.');
  const chamar = criarChamadaAoModelo(chave);

  const agora = new Date();
  const rodada = `${agora.toISOString().slice(0, 10)}T${String(agora.getHours()).padStart(2, '0')}${String(agora.getMinutes()).padStart(2, '0')}`;
  await gravarRodada(pastas, rodada, { modelo: argumentaEstrutura.modelo, em: hoje() });
  let gasto = 0;
  for (const caso of casos) {
    if (gasto >= maxUsd) {
      console.log(`Parei antes de ${caso.id}: gasto de US$ ${gasto.toFixed(4)} chegou ao limite de US$ ${maxUsd}.`);
      break;
    }
    const r = await executarCaso(caso, chamar);
    await gravarResultado(pastas, rodada, r);
    gasto += r.estrutura.custoUsd + r.questoes.custoUsd + r.fundamentos.custoUsd;
    console.log(`${caso.id}: ${[r.estrutura, r.questoes, r.fundamentos].map(e => e.estado).join(' / ')}${r.naoEnviavel ? ` (não enviável: ${r.naoEnviavel})` : ''}`);
  }
  await relatorio([rodada]);
}

async function relatorio(posicionais: string[]) {
  const rodada = posicionais[0] ?? (await ultimaRodada(pastas)) ?? sair('Nenhuma rodada encontrada.');
  const validados = (await lerCasos(pastas)).filter(ehValidado);
  const meta = await lerRodada(pastas, rodada);
  const arquivo = await gravarRelatorio(pastas, rodada, montarRelatorio({ rodada, modelo: meta.modelo, casos: validados, resultados: await lerResultados(pastas, rodada) }));
  console.log(`Relatório: ${arquivo}`);
}

const [comando, ...resto] = process.argv.slice(2);
const { posicionais, flags } = opcoes(resto);
const comandos: Record<string, () => Promise<void>> = {
  novo: () => novo(posicionais, flags),
  folha: () => folha(posicionais),
  validar: () => validar(posicionais, flags),
  rodar: () => rodar(flags),
  relatorio: () => relatorio(posicionais)
};
(comandos[comando ?? ''] ?? (() => sair('Comandos: novo, folha, validar, rodar, relatorio. Veja o cabeçalho de scripts/avaliacao.ts.')))().catch(e => sair(`Erro: ${(e as Error).message}`));
