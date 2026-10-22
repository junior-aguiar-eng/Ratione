import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { prepararDecisao } from '@ratione/argumenta';
import { executarTarefa, type DependenciasExecucao } from '../executar';
import type { PedidoModelo, ResultadoModelo } from '../contrato';
import { argumentaEstrutura, argumentaFundamentos, argumentaQuestoes } from './argumenta';

const TEXTO = `SENTENÇA

Autora: MARIA DOS SANTOS, CPF 123.456.789-09
Réu: BANCO FICTÍCIO S.A.

Trata-se de ação ajuizada por MARIA DOS SANTOS em face de BANCO FICTÍCIO S.A., na qual a autora pede a restituição de valores transferidos por fraudador.

A responsabilidade do banco é objetiva (CDC, art. 14), conforme a Súmula 479 do STJ.

Ante o exposto, JULGO PROCEDENTE o pedido.`;

const { paragrafos } = prepararDecisao(TEXTO);
const QUESTOES = [{ id: 'Q1', enunciado: 'O banco responde pela fraude?', conclusao: 'Sim, a responsabilidade é objetiva.' }];

function deps(json: string) {
  const registro: string[] = [];
  const pedidos: PedidoModelo[] = [];
  const dep: DependenciasExecucao = {
    ligada: true,
    env: {},
    orcamentoMensalUsd: 5,
    fontes: { lerDispositivo: async () => null },
    usuarioAtual: async () => ({ id: 'u1' }),
    lerCache: async () => (registro.push('lerCache'), null),
    reservar: async p => (registro.push(`reservar ${p.referencia}`), { ok: true, id: 1, restantesHoje: 4 }),
    registrarCache: async () => void registro.push('registrarCache'),
    chamarModelo: async p => (pedidos.push(p), { tipo: 'ok', json, uso: { input_tokens: 1_000, output_tokens: 500 } } as ResultadoModelo),
    finalizar: async (_id, situacao) => void registro.push(`finalizar ${situacao}`),
    gravarCache: async () => void registro.push('gravarCache')
  };
  return { dep, registro, pedidos };
}

const ESTRUTURA = {
  tipo: 'sentenca',
  resultado: 'Pedido julgado procedente',
  resumo: '[PARTE_1] pediu a restituição; o pedido foi acolhido.',
  pedidos: [{ descricao: 'Restituição dos valores', paragrafos: [4] }],
  secoes: [
    { tipo: 'cabecalho', inicio: 1, fim: 3 },
    { tipo: 'relatorio', inicio: 4, fim: 4 },
    { tipo: 'fundamentacao', inicio: 5, fim: 5 },
    { tipo: 'dispositivo', inicio: 6, fim: 6 }
  ]
};

describe('Argumenta: entrada das tarefas', () => {
  it('aceita os parágrafos preparados no navegador', () => {
    assert.deepEqual(argumentaEstrutura.validarEntrada({ paragrafos }), { paragrafos });
    assert.ok(argumentaFundamentos.validarEntrada({ paragrafos, questoes: QUESTOES }));
  });

  it('recusa texto com dado pessoal que a detecção ainda acha (navegador adulterado ou sem pseudonimizar)', () => {
    assert.equal(argumentaEstrutura.validarEntrada({ paragrafos: ['Autora: MARIA DOS SANTOS', 'Pedido procedente.'] }), null);
    assert.equal(argumentaQuestoes.validarEntrada({ paragrafos: ['O CPF 123.456.789-09 consta dos autos.'] }), null);
    assert.equal(
      argumentaFundamentos.validarEntrada({ paragrafos, questoes: [{ ...QUESTOES[0], conclusao: 'Contato: maria@exemplo.com' }] }),
      null
    );
  });

  it('recusa questões fora do formato', () => {
    for (const questoes of [[], [{ ...QUESTOES[0], id: 'Q11' }], [QUESTOES[0], QUESTOES[0]], [{ id: 'Q1', enunciado: '', conclusao: 'x' }], Array(11).fill(QUESTOES[0])]) {
      assert.equal(argumentaFundamentos.validarEntrada({ paragrafos, questoes }), null);
    }
  });
});

describe('Argumenta: execução sem guardar nada', () => {
  it('estrutura: não lê nem grava cache, registra só o hash e manda a decisão numerada entre marcas', async () => {
    const { dep, registro, pedidos } = deps(JSON.stringify(ESTRUTURA));
    const r = await executarTarefa('argumenta-estrutura', { paragrafos }, dep);
    assert.equal(r.status, 200);
    assert.equal(registro.length, 2);
    assert.match(registro[0], /^reservar decisao:[0-9a-f]{16}$/);
    assert.equal(registro[1], 'finalizar gerada');
    const m = pedidos[0].mensagem;
    assert.match(m, /<decisao>\n§1\. SENTENÇA\n§2\. Autora: \[PARTE_1\], CPF \[CPF_1\]/);
    assert.ok(!m.includes('MARIA') && !m.includes('123.456.789-09'), 'nenhum dado pessoal chega ao modelo');
  });

  it('saída que cita parágrafo inexistente é descartada', async () => {
    const ruim = { ...ESTRUTURA, secoes: [{ tipo: 'dispositivo', inicio: 6, fim: 99 }] };
    const { dep, registro } = deps(JSON.stringify(ruim));
    assert.equal((await executarTarefa('argumenta-estrutura', { paragrafos }, dep)).status, 502);
    assert.ok(registro.includes('finalizar invalida'));
  });

  it('questões: repetidas ou com parágrafo inexistente são descartadas; certas passam', async () => {
    const q = { id: 'Q1', categoria: 'merito', enunciado: 'O banco responde?', conclusao: 'Sim.', resultado: 'acolhida', paragrafos: [5], paragrafosConclusao: [6] };
    assert.equal((await executarTarefa('argumenta-questoes', { paragrafos }, deps(JSON.stringify({ questoes: [q] })).dep)).status, 200);
    assert.equal((await executarTarefa('argumenta-questoes', { paragrafos }, deps(JSON.stringify({ questoes: [q, q] })).dep)).status, 502);
    const fora = { ...q, paragrafosConclusao: [0] };
    assert.equal((await executarTarefa('argumenta-questoes', { paragrafos }, deps(JSON.stringify({ questoes: [fora] })).dep)).status, 502);
  });

  it('fundamentos: a mensagem traz as questões; fundamento de questão que não veio é descartado', async () => {
    const f = { questao: 'Q1', tipo: 'norma', descricao: 'Responsabilidade objetiva do fornecedor.', citacao: 'CDC, art. 14', paragrafos: [5] };
    const certo = deps(JSON.stringify({ fundamentos: [f] }));
    assert.equal((await executarTarefa('argumenta-fundamentos', { paragrafos, questoes: QUESTOES }, certo.dep)).status, 200);
    assert.match(certo.pedidos[0].mensagem, /<questoes>\nQ1\. O banco responde pela fraude\? \| Conclusão: Sim, a responsabilidade é objetiva\.\n<\/questoes>\n<decisao>/);
    assert.ok(!certo.registro.includes('gravarCache'));
    const outra = deps(JSON.stringify({ fundamentos: [{ ...f, questao: 'Q2' }] }));
    assert.equal((await executarTarefa('argumenta-fundamentos', { paragrafos, questoes: QUESTOES }, outra.dep)).status, 502);
  });

  it('a decisão mais longa aceita, com 10 questões no teto, cabe na mensagem da etapa de fundamentos', () => {
    const longa = Array.from({ length: 200 }, (_, i) => `Parágrafo ${i} ${'x'.repeat(90)}`);
    while (argumentaEstrutura.validarEntrada({ paragrafos: longa }) === null) longa.pop();
    const questoes = Array.from({ length: 10 }, (_, i) => ({ id: `Q${i + 1}`, enunciado: 'e'.repeat(400), conclusao: 'c'.repeat(400) }));
    const entrada = argumentaFundamentos.validarEntrada({ paragrafos: longa, questoes });
    assert.ok(entrada);
    assert.ok(argumentaFundamentos.mensagem(entrada).length <= argumentaFundamentos.maxCaracteresMensagem);
  });
});
