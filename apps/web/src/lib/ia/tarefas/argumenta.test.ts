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
const ANALISE = '6f1c2d3e-4a5b-4c6d-8e7f-0a1b2c3d4e5f';
const QUESTOES = [{ id: 'Q1', enunciado: 'O banco responde pela fraude?', conclusao: 'Sim, a responsabilidade é objetiva.' }];

function deps(json: string, sobre: Partial<DependenciasExecucao> = {}) {
  const registro: string[] = [];
  const pedidos: PedidoModelo[] = [];
  const analises: string[] = [];
  const dep: DependenciasExecucao = {
    ligada: true,
    fontes: { lerDispositivo: async () => null },
    usuarioAtual: async () => ({ id: 'u1' }),
    lerCache: async () => (registro.push('lerCache'), null),
    iniciarAnalise: async () => (registro.push('iniciar'), { ok: true, analiseId: 'x', restantes: 0, renovaEm: '2026-10-26T03:00:00.000Z' }),
    consumirAnalise: async id => (registro.push('consumir'), void analises.push(id)),
    concluirAnalise: async id => (registro.push('concluir'), void analises.push(id)),
    falhaAnalise: async id => (registro.push('falha'), void analises.push(id)),
    cancelarAnalise: async () => void registro.push('cancelar'),
    reservar: async p => (registro.push(`reservar ${p.referencia} ${p.analiseId}`), { ok: true, id: 1 }),
    registrarCache: async () => void registro.push('registrarCache'),
    chamarModelo: async p => (pedidos.push(p), { tipo: 'ok', json, uso: { input_tokens: 1_000, output_tokens: 500 } } as ResultadoModelo),
    finalizar: async (_id, situacao) => void registro.push(`finalizar ${situacao}`),
    gravarCache: async () => void registro.push('gravarCache'),
    ...sobre
  };
  return { dep, registro, pedidos, analises };
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
const QUESTAO = { id: 'Q1', categoria: 'merito', enunciado: 'O banco responde?', conclusao: 'Sim.', resultado: 'acolhida', paragrafos: [5], paragrafosConclusao: [6] };
const FUNDAMENTO = { questao: 'Q1', tipo: 'norma', descricao: 'Responsabilidade objetiva do fornecedor.', citacao: 'CDC, art. 14', paragrafos: [5] };

describe('Argumenta: entrada das tarefas', () => {
  it('aceita a análise iniciada e os parágrafos preparados no navegador', () => {
    assert.deepEqual(argumentaEstrutura.validarEntrada({ analiseId: ANALISE, paragrafos }), { analiseId: ANALISE, paragrafos });
    assert.ok(argumentaFundamentos.validarEntrada({ analiseId: ANALISE, paragrafos, questoes: QUESTOES }));
  });

  it('recusa entrada sem análise ou com id que não é uma análise', () => {
    for (const analiseId of [undefined, '', 'abc', 42, "' or 1=1 --", ANALISE.toUpperCase() + 'x']) {
      assert.equal(argumentaEstrutura.validarEntrada({ analiseId, paragrafos }), null, String(analiseId));
    }
    assert.equal(argumentaQuestoes.validarEntrada({ paragrafos }), null);
  });

  it('recusa texto com dado pessoal que a detecção ainda acha (navegador adulterado ou sem pseudonimizar)', () => {
    assert.equal(argumentaEstrutura.validarEntrada({ analiseId: ANALISE, paragrafos: ['Autora: MARIA DOS SANTOS', 'Pedido procedente.'] }), null);
    assert.equal(argumentaQuestoes.validarEntrada({ analiseId: ANALISE, paragrafos: ['O CPF 123.456.789-09 consta dos autos.'] }), null);
    assert.equal(
      argumentaFundamentos.validarEntrada({ analiseId: ANALISE, paragrafos, questoes: [{ ...QUESTOES[0], conclusao: 'Contato: maria@exemplo.com' }] }),
      null
    );
  });

  it('recusa questões fora do formato', () => {
    for (const questoes of [[], [{ ...QUESTOES[0], id: 'Q11' }], [QUESTOES[0], QUESTOES[0]], [{ id: 'Q1', enunciado: '', conclusao: 'x' }], Array(11).fill(QUESTOES[0])]) {
      assert.equal(argumentaFundamentos.validarEntrada({ analiseId: ANALISE, paragrafos, questoes }), null);
    }
  });
});

describe('Argumenta: instrução da etapa de questões', () => {
  it('pede a admissibilidade como questão preliminar e exclui o que só consta da decisão recorrida', () => {
    assert.match(argumentaQuestoes.instrucoes, /juízo de admissibilidade/);
    assert.match(argumentaQuestoes.instrucoes, /conhecimento do recurso/);
    assert.match(argumentaQuestoes.instrucoes, /acórdão recorrido/);
  });
});

describe('Argumenta: esforço da etapa de fundamentos', () => {
  it('roda em esforço baixo: o raciocínio do esforço médio conta no teto de saída e cortou a resposta de uma decisão longa', () => {
    assert.equal(argumentaFundamentos.esforco, 'low');
    assert.equal(argumentaFundamentos.maxTokensSaida, 4_000);
  });
});

describe('Argumenta: cota por análise nas três etapas', () => {
  it('a 1ª etapa consome a análise; a 2ª não mexe na cota; a última conclui — todas ligadas à mesma análise', async () => {
    const e1 = deps(JSON.stringify(ESTRUTURA));
    assert.equal((await executarTarefa('argumenta-estrutura', { analiseId: ANALISE, paragrafos }, e1.dep)).status, 200);
    assert.deepEqual(e1.registro.map(r => r.split(' ')[0]), ['reservar', 'finalizar', 'consumir']);
    assert.match(e1.registro[0], new RegExp(`^reservar decisao:[0-9a-f]{16} ${ANALISE}$`));
    assert.deepEqual(e1.analises, [ANALISE]);

    const e2 = deps(JSON.stringify({ questoes: [QUESTAO] }));
    assert.equal((await executarTarefa('argumenta-questoes', { analiseId: ANALISE, paragrafos }, e2.dep)).status, 200);
    assert.deepEqual(e2.registro.map(r => r.split(' ')[0]), ['reservar', 'finalizar'], 'a etapa do meio não consome nem conclui');

    const e3 = deps(JSON.stringify({ fundamentos: [FUNDAMENTO] }));
    assert.equal((await executarTarefa('argumenta-fundamentos', { analiseId: ANALISE, paragrafos, questoes: QUESTOES }, e3.dep)).status, 200);
    assert.deepEqual(e3.registro.map(r => r.split(' ')[0]), ['reservar', 'finalizar', 'concluir']);
    assert.deepEqual(e3.analises, [ANALISE]);
  });

  it('nenhuma etapa inicia análise por conta própria nem toca no cache: o texto e a resposta não ficam guardados', async () => {
    for (const [id, json, extra] of [
      ['argumenta-estrutura', JSON.stringify(ESTRUTURA), {}],
      ['argumenta-questoes', JSON.stringify({ questoes: [QUESTAO] }), {}],
      ['argumenta-fundamentos', JSON.stringify({ fundamentos: [FUNDAMENTO] }), { questoes: QUESTOES }]
    ] as const) {
      const { dep, registro, pedidos } = deps(json);
      assert.equal((await executarTarefa(id, { analiseId: ANALISE, paragrafos, ...extra }, dep)).status, 200);
      for (const proibido of ['iniciar', 'lerCache', 'gravarCache', 'registrarCache', 'cancelar']) assert.ok(!registro.includes(proibido), `${id} não faz ${proibido}`);
      assert.ok(!pedidos[0].mensagem.includes('MARIA') && !pedidos[0].mensagem.includes('123.456.789-09'), 'nenhum dado pessoal chega ao modelo');
    }
  });

  it('a mensagem manda a decisão numerada entre marcas, sem o id da análise', async () => {
    const { dep, pedidos } = deps(JSON.stringify(ESTRUTURA));
    await executarTarefa('argumenta-estrutura', { analiseId: ANALISE, paragrafos }, dep);
    const m = pedidos[0].mensagem;
    assert.match(m, /<decisao>\n§1\. SENTENÇA\n§2\. Autora: \[PARTE_1\], CPF \[CPF_1\]/);
    assert.ok(!m.includes(ANALISE));
  });

  it('falha de uma etapa não consome: a falha é contada na análise (o banco decide quando desistir e estornar)', async () => {
    const modelo = deps(JSON.stringify(ESTRUTURA), { chamarModelo: async () => ({ tipo: 'falha', mensagem: 'tempo esgotado' }) });
    const r = await executarTarefa('argumenta-estrutura', { analiseId: ANALISE, paragrafos }, modelo.dep);
    assert.equal(r.status, 502);
    assert.ok(r.status === 502 && /cota não foi gasta/.test(r.corpo.mensagem));
    assert.deepEqual(modelo.registro.map(x => x.split(' ')[0]), ['reservar', 'finalizar', 'falha']);
    assert.ok(!modelo.registro.includes('consumir'));

    const ruim = deps(JSON.stringify({ ...ESTRUTURA, secoes: [{ tipo: 'dispositivo', inicio: 6, fim: 99 }] }));
    assert.equal((await executarTarefa('argumenta-estrutura', { analiseId: ANALISE, paragrafos }, ruim.dep)).status, 502, 'cita parágrafo inexistente');
    assert.deepEqual(ruim.registro.map(x => x.split(' ')[0]), ['reservar', 'finalizar', 'falha']);
  });

  it('análise que não é do usuário ou já encerrada: 400, e nada é chamado', async () => {
    const { dep, registro, pedidos } = deps(JSON.stringify(ESTRUTURA), { reservar: async () => ({ ok: false, motivo: 'analise_invalida' }) });
    const r = await executarTarefa('argumenta-estrutura', { analiseId: ANALISE, paragrafos }, dep);
    assert.equal(r.status, 400);
    assert.deepEqual(registro, []);
    assert.equal(pedidos.length, 0);
  });

  it('saída que cita parágrafo inexistente é descartada; questões repetidas e fundamento de questão que não veio também', async () => {
    const q = (extra: object = {}) => ({ ...QUESTAO, ...extra });
    assert.equal((await executarTarefa('argumenta-questoes', { analiseId: ANALISE, paragrafos }, deps(JSON.stringify({ questoes: [q()] })).dep)).status, 200);
    assert.equal((await executarTarefa('argumenta-questoes', { analiseId: ANALISE, paragrafos }, deps(JSON.stringify({ questoes: [q(), q()] })).dep)).status, 502);
    assert.equal((await executarTarefa('argumenta-questoes', { analiseId: ANALISE, paragrafos }, deps(JSON.stringify({ questoes: [q({ paragrafosConclusao: [0] })] })).dep)).status, 502);
    const entrada = { analiseId: ANALISE, paragrafos, questoes: QUESTOES };
    assert.equal((await executarTarefa('argumenta-fundamentos', entrada, deps(JSON.stringify({ fundamentos: [FUNDAMENTO] })).dep)).status, 200);
    assert.equal((await executarTarefa('argumenta-fundamentos', entrada, deps(JSON.stringify({ fundamentos: [{ ...FUNDAMENTO, questao: 'Q2' }] })).dep)).status, 502);
  });

  it('a decisão mais longa aceita, com 10 questões no teto, cabe na mensagem da etapa de fundamentos', () => {
    const longa = Array.from({ length: 200 }, (_, i) => `Parágrafo ${i} ${'x'.repeat(90)}`);
    while (argumentaEstrutura.validarEntrada({ analiseId: ANALISE, paragrafos: longa }) === null) longa.pop();
    const questoes = Array.from({ length: 10 }, (_, i) => ({ id: `Q${i + 1}`, enunciado: 'e'.repeat(400), conclusao: 'c'.repeat(400) }));
    const entrada = argumentaFundamentos.validarEntrada({ analiseId: ANALISE, paragrafos: longa, questoes });
    assert.ok(entrada);
    assert.ok(argumentaFundamentos.mensagem(entrada).length <= argumentaFundamentos.maxCaracteresMensagem);
  });
});
