import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { temDadoPessoal } from '@ratione/argumenta';
import { dataApareceNoTrecho, lerIntimacao } from '../../ia/tarefas/lerIntimacao';
import type { PedidoModelo, ResultadoModelo } from '../../ia/contrato';
import { CasoDeIntimacaoSchema, intimacaoValidada, paragrafosDaIntimacao } from './caso';
import { CASOS } from './casos';
import { calcularMetricas, compararCampos, executarIntimacao, gerarFolha, montarRelatorio, type ChamarModelo } from './avaliar';

describe('Corpus de intimações: integridade', () => {
  it('são 20 casos, com ids únicos e no formato', () => {
    assert.equal(CASOS.length, 20);
    assert.equal(new Set(CASOS.map(c => c.id)).size, 20);
    for (const c of CASOS) assert.ok(CasoDeIntimacaoSchema.safeParse(c).success, c.id);
  });

  it('cobre os casos difíceis: sem prazo, prazo diferente do padrão, tribunal não nomeado, publicação, audiência, injeção', () => {
    assert.ok(CASOS.some(c => c.esperado.dias === 0));
    assert.ok(CASOS.some(c => c.esperado.dias === 30));
    assert.ok(CASOS.some(c => c.esperado.tribunal === '' && c.esperado.dias > 0));
    assert.ok(CASOS.some(c => c.esperado.tipoEvento === 'publicacao'));
    assert.ok(CASOS.some(c => c.esperado.tipoEvento === 'carga_ou_audiencia'));
    assert.ok(CASOS.some(c => c.esperado.tipoEvento === 'intimacao_portal'));
    assert.ok(CASOS.some(c => /IGNORE AS INSTRUÇÕES/.test(c.texto)));
    assert.ok(new Set(CASOS.map(c => c.esperado.tribunal)).size >= 15, 'tribunais variados');
  });

  it('o gabarito é coerente com o próprio texto: a data está escrita nele e o prazo em dias também', () => {
    for (const c of CASOS) {
      if (c.esperado.dataEvento) assert.ok(dataApareceNoTrecho(c.esperado.dataEvento, c.texto), `${c.id}: data não está no texto`);
      if (c.esperado.dias > 0) assert.match(c.texto, new RegExp(`\\b${c.esperado.dias}\\b`), `${c.id}: dias não estão no texto`);
    }
  });

  it('a pseudonimização tira todo dado fictício do que chega ao modelo, e a tarefa aceita a entrada', () => {
    for (const c of CASOS) {
      const enviado = paragrafosDaIntimacao(c).join('\n\n');
      for (const dado of c.dadosFicticios) assert.ok(!enviado.includes(dado), `${c.id}: "${dado}" chegaria ao modelo`);
      assert.ok(!temDadoPessoal(enviado), c.id);
      assert.ok(lerIntimacao.validarEntrada({ paragrafos: paragrafosDaIntimacao(c) }), `${c.id}: entrada recusada`);
      assert.ok(enviado.length > 100, `${c.id}: texto enviado ficou curto demais (a pseudonimização comeu o conteúdo?)`);
    }
  });

  it('os 20 casos estão validados, com nome de quem validou e data', () => {
    assert.equal(CASOS.filter(intimacaoValidada).length, 20);
    for (const c of CASOS.filter(intimacaoValidada)) assert.ok(c.validacao.por.length > 4 && /^\d{4}-\d{2}-\d{2}$/.test(c.validacao.em));
  });
});

describe('Medição: comparação e métricas', () => {
  const E = { dias: 15, tipoEvento: 'disponibilizacao_dje', dataEvento: '2026-10-05', tribunal: 'TJSP' } as const;

  it('classifica cada campo como certo, omitido, errado ou inventado', () => {
    assert.deepEqual(compararCampos(E, { ...E }), { dias: 'certo', tipoEvento: 'certo', dataEvento: 'certo', tribunal: 'certo' });
    const v = compararCampos(E, { ...E, dias: 30, dataEvento: '2026-10-06', tribunal: '' });
    assert.deepEqual(v, { dias: 'errado', tipoEvento: 'certo', dataEvento: 'errado', tribunal: 'omitido' });
    const neutro = { dias: 0, tipoEvento: 'nao_informado', dataEvento: '', tribunal: '' } as const;
    assert.equal(compararCampos(neutro, { ...neutro, tribunal: 'TJSP' }).tribunal, 'inventado');
    assert.equal(compararCampos(neutro, neutro).dias, 'certo');
  });

  /** A saída que um modelo perfeito daria: cada campo preenchido com um trecho que existe no texto enviado. */
  const saidaCerta = (c: (typeof CASOS)[number]) => {
    const e = c.esperado;
    const texto = paragrafosDaIntimacao(c).join('\n\n');
    const trecho = (re: RegExp) => texto.match(re)?.[0] ?? '';
    return {
      tribunal: e.tribunal,
      trechoTribunal: e.tribunal ? trecho(/(tribunal[^\n]{3,80}|\bTR[TF]\d?[^\n]{0,40}|\bTJ[A-Z]{2,3}\b[^\n]{0,40})/i) : '',
      tipoEvento: e.tipoEvento,
      dataEvento: e.dataEvento,
      trechoData: e.dataEvento ? (texto.split('\n').find(l => dataApareceNoTrecho(e.dataEvento, l)) ?? '') : '',
      diasMencionados: e.dias,
      trechoPrazo: e.dias > 0 ? trecho(new RegExp(`[^\\n.]*\\b${e.dias}\\b[^\\n.]*`)) : ''
    };
  };
  const modeloQue = (devolver: (p: PedidoModelo) => unknown): ChamarModelo => async p =>
    ({ tipo: 'ok', json: JSON.stringify(devolver(p)), uso: { input_tokens: 900, output_tokens: 150 } }) as ResultadoModelo;

  it('um modelo que devolve o gabarito é medido sem erro, com custo contado', async () => {
    const resultados = [];
    for (const c of CASOS) resultados.push(await executarIntimacao(c, modeloQue(() => saidaCerta(c))));
    const descartados = resultados.filter(r => r.estado !== 'ok').map(r => `${r.casoId}: ${r.estado} ${r.motivo ?? ''}`);
    assert.deepEqual(descartados, [], 'a conferência do servidor aceita a saída que repete o gabarito com trechos reais');
    const m = calcularMetricas(resultados);
    assert.equal(m.respondidos, 20);
    assert.equal(m.perfeitos, 20);
    assert.equal(m.erros, 0);
    assert.ok(m.custoUsd > 0);
  });

  it('a mensagem ao modelo leva só o texto pseudonimizado', async () => {
    const vistas: string[] = [];
    for (const c of CASOS.slice(0, 5)) await executarIntimacao(c, modeloQue(p => (vistas.push(p.mensagem), saidaCerta(c))));
    for (const [i, c] of CASOS.slice(0, 5).entries()) for (const dado of c.dadosFicticios) assert.ok(!vistas[i].includes(dado), `${c.id}: ${dado}`);
  });

  it('data fora do trecho é descartada pelo servidor; tribunal errado com trecho verdadeiro chega à pessoa e conta como erro', async () => {
    const c = CASOS[0];
    const certa = saidaCerta(c);
    const errada = await executarIntimacao(c, modeloQue(() => ({ ...certa, dataEvento: '2026-10-06', trechoData: certa.trechoData.replace('05/10/2026', '06/10/2026') })));
    // O trecho trocado não existe no texto: a conferência do servidor recusa antes de a pessoa ver
    assert.equal(errada.estado, 'descartada');
    // Sigla errada com um trecho verdadeiro do texto: a conferência do servidor não compara a sigla com o trecho, então a resposta chega
    // à pessoa e só a medição a pega como erro
    const outroTribunal = await executarIntimacao(c, modeloQue(() => ({ ...certa, tribunal: 'TJRJ' })));
    assert.equal(outroTribunal.estado, 'ok');
    assert.equal(outroTribunal.veredito?.tribunal, 'errado');
  });

  it('forma da intimação errada passa pela conferência (não há trecho a checar) e entra como erro na medição', async () => {
    const c = CASOS[0];
    const r = await executarIntimacao(c, modeloQue(() => ({ ...saidaCerta(c), tipoEvento: 'publicacao' })));
    assert.equal(r.estado, 'ok');
    assert.equal(r.veredito?.tipoEvento, 'errado');
    const m = calcularMetricas([r]);
    assert.equal(m.erros, 1);
    assert.equal(m.perfeitos, 0);
  });

  it('saída fora do formato é descartada e entra na contagem; falha da API não conta como respondida', async () => {
    const c = CASOS[0];
    const ruim = await executarIntimacao(c, modeloQue(() => ({ ...saidaCerta(c), tipoEvento: 'evento-inventado' })));
    assert.equal(ruim.estado, 'descartada');
    const falha = await executarIntimacao(c, async () => ({ tipo: 'falha', mensagem: 'tempo esgotado' }));
    assert.equal(falha.estado, 'falha');
    const m = calcularMetricas([ruim, falha]);
    assert.equal(m.respondidos, 0);
    assert.equal(m.descartados, 2);
  });

  it('o relatório lista as divergências com o motivo e a folha traz os 20 casos', async () => {
    const c = CASOS[0];
    const r = await executarIntimacao(c, modeloQue(() => ({ ...saidaCerta(c), tipoEvento: 'publicacao' })));
    const rel = montarRelatorio({ rodada: 'teste', modelo: 'claude-haiku-5-5', casos: CASOS, resultados: [r] });
    assert.match(rel, /int-01-contestacao-tjsp-dje/);
    assert.match(rel, /Forma da intimação: esperado disponibilizacao_dje, obtido publicacao — errado/);
    const folha = gerarFolha(CASOS);
    assert.equal((folha.match(/^## int-/gm) ?? []).length, 20);
    assert.match(folha, /Validação: José Bonifácio de Aguiar Santos Júnior, em 2026-10-30/);
    assert.ok(!folha.includes('Validação: pendente'), 'os 20 casos estão validados');
  });
});
