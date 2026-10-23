import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { CATALOGO } from './catalogo';
import { PRECO_USD_POR_MILHAO, TETOS } from './politica';

/**
 * Trava do catálogo de tarefas (regra do produto, 22/10/2026): toda tarefa tem o contrato completo e dentro dos tetos, e nenhum código
 * fala com a IA por fora do executor. Se este teste falhar, a mudança precisa passar pelo catálogo (`docs/produto/IA_TAREFAS.md`).
 */

const RAIZ = join(__dirname, '..', '..', '..', '..', '..');
const PASTAS = [join(RAIZ, 'apps', 'web', 'src'), join(RAIZ, 'packages')];

function arquivos(pasta: string): string[] {
  return readdirSync(pasta).flatMap(nome => {
    if (nome === 'node_modules' || nome.startsWith('.')) return [];
    const caminho = join(pasta, nome);
    if (statSync(caminho).isDirectory()) return arquivos(caminho);
    return /\.(ts|tsx|js|mjs)$/.test(nome) && !/\.test\.ts$/.test(nome) ? [caminho] : [];
  });
}

const relativo = (c: string) => relative(RAIZ, c).split(sep).join('/');

/** Confere recursivamente que todo objeto do esquema é fechado e com todos os campos obrigatórios. */
function esquemaFechado(s: unknown, onde: string): string[] {
  if (!s || typeof s !== 'object') return [];
  const o = s as Record<string, unknown>;
  const erros: string[] = [];
  if (o.type === 'object') {
    const props = Object.keys((o.properties as Record<string, unknown>) ?? {});
    if (o.additionalProperties !== false) erros.push(`${onde}: additionalProperties deve ser false`);
    const req = (o.required as string[] | undefined) ?? [];
    if (props.some(p => !req.includes(p))) erros.push(`${onde}: todos os campos devem ser obrigatórios`);
    for (const p of props) erros.push(...esquemaFechado((o.properties as Record<string, unknown>)[p], `${onde}.${p}`));
  }
  if (o.type === 'array') erros.push(...esquemaFechado(o.items, `${onde}[]`));
  return erros;
}

describe('Catálogo de tarefas de IA: contrato de cada tarefa', () => {
  for (const [chave, t] of Object.entries(CATALOGO)) {
    it(`${chave}: contrato completo e dentro dos tetos`, () => {
      assert.equal(t.id, chave, 'o id é a chave do catálogo');
      assert.match(t.id, /^[a-z][a-z0-9-]{2,40}$/, 'id em minúsculas com hífen (é também a coluna "tarefa" do banco)');
      assert.ok(t.descricao.length > 10 && t.gatilho.length > 10, 'descrição e gatilho escritos');
      assert.ok(t.modelo in PRECO_USD_POR_MILHAO, 'modelo com preço registrado');
      assert.ok(['low', 'medium'].includes(t.esforco), 'esforço baixo ou médio');
      assert.ok(t.maxTokensSaida > 0 && t.maxTokensSaida <= TETOS.maxTokensSaida);
      assert.ok(t.maxCaracteresMensagem > 0 && t.maxCaracteresMensagem <= TETOS.maxCaracteresMensagem);
      assert.ok(['rapida', 'completa', 'explicacao'].includes(t.cota.tipo), 'cota de um tipo que o plano conhece');
      assert.ok(['por-chamada', 'por-analise'].includes(t.cota.modo));
      if (t.cota.modo === 'por-analise') assert.equal(typeof t.analiseDe, 'function', 'tarefa por análise diz de onde vem o id da análise');
      else assert.equal(t.analiseDe, undefined);
      assert.match(t.versao, /^v\d+-\d{4}-\d{2}-\d{2}$/, 'versão com data');
      assert.equal(typeof t.guardaResultado, 'boolean', 'decide se a resposta vai para o cache');
      if (t.id.startsWith('argumenta-')) assert.equal(t.guardaResultado, false, 'material do usuário nunca vai para o cache');
      assert.deepEqual(t.ferramentas, [], 'tarefa fechada não chama ferramentas');
      assert.doesNotMatch(t.instrucoes, /\d{4}-\d{2}-\d{2}/, 'instruções fixas, sem data');
      assert.deepEqual(esquemaFechado(t.esquemaSaida, 'saida'), []);
      assert.equal(t.validarEntrada(undefined), null, 'sem entrada, recusa');
      assert.equal(t.validarEntrada('pergunta livre ao modelo'), null, 'texto livre como entrada, recusa');
    });
  }
});

describe('Catálogo de tarefas de IA: ninguém fala com o modelo por fora', () => {
  const todos = PASTAS.flatMap(arquivos);

  it('só lib/ia/cliente.ts importa o SDK da Anthropic ou chama a API diretamente', () => {
    const fora = todos
      .filter(c => /@anthropic-ai\/sdk|api\.anthropic\.com|anthropic-version/.test(readFileSync(c, 'utf-8')))
      .map(relativo)
      .filter(c => c !== 'apps/web/src/lib/ia/cliente.ts');
    assert.deepEqual(fora, []);
  });

  it('só a rota /api/ia/[tarefa] usa o cliente da IA, e sempre pelo executor', () => {
    const usam = todos.filter(c => /lib\/ia\/cliente'/.test(readFileSync(c, 'utf-8'))).map(relativo);
    assert.deepEqual(usam, ['apps/web/src/app/api/ia/[tarefa]/route.ts']);
    assert.match(readFileSync(join(RAIZ, usam[0]), 'utf-8'), /executarTarefa\(/);
  });
});
