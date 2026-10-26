import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { chaveDoCache, dataDeRenovacao, executarTarefa, mensagemDeCota, type DependenciasExecucao, type Situacao } from './executar';
import type { PedidoModelo, ResultadoModelo } from './contrato';
import { CATALOGO } from './catalogo';
import { custoMaximoUsd, custoUsd, iaLigada } from './politica';
import { explicarDispositivo, idDeDispositivoValido, mensagemDoDispositivo } from './tarefas/explicarDispositivo';
import type { DispositivoParaExplicar } from './fontes/dispositivoDoBanco';

const D: DispositivoParaExplicar = {
  id: 'LEI-13105-2015|corpo|art. 85',
  normaNome: 'Código de Processo Civil',
  rotulo: 'art. 85',
  texto: 'art. 85. A sentença condenará o vencido a pagar honorários ao advogado do vencedor.',
  atoDaRedacao: null,
  vigenteDe: '2016-03-18',
  vigenciaConfirmada: false,
  revogado: false
};
const TAREFA = 'explicar-dispositivo';
const ENTRADA = { dispositivoId: D.id };
const OK = JSON.stringify({ resumo: 'Quem perde paga os honorários do advogado de quem ganha.', explicacao: ['…'], termos: [{ termo: 'vencido', significado: 'a parte que perdeu' }], atencao: [] });
const USO = { input_tokens: 900, output_tokens: 300 };
const RENOVA = '2026-10-26T03:00:00.000Z';

function deps(sobre: Partial<DependenciasExecucao> = {}) {
  const registro: string[] = [];
  const finalizados: Array<{ situacao: Situacao; custo: number }> = [];
  const pedidos: PedidoModelo[] = [];
  const reservas: Array<Record<string, unknown>> = [];
  const dep: DependenciasExecucao = {
    ligada: true,
    fontes: { lerDispositivo: async id => (id === D.id ? D : null) },
    usuarioAtual: async () => ({ id: 'u1' }),
    lerCache: async () => null,
    iniciarAnalise: async () => (registro.push('iniciar'), { ok: true, analiseId: 'an-1', restantes: 4, renovaEm: RENOVA }),
    consumirAnalise: async () => void registro.push('consumir'),
    concluirAnalise: async () => void registro.push('concluir'),
    falhaAnalise: async () => void registro.push('falha'),
    cancelarAnalise: async () => void registro.push('cancelar'),
    reservar: async p => (registro.push('reservar'), reservas.push(p), { ok: true, id: 7 }),
    registrarCache: async () => void registro.push('cache'),
    chamarModelo: async p => (registro.push('modelo'), pedidos.push(p), { tipo: 'ok', json: OK, uso: USO } as ResultadoModelo),
    finalizar: async (_id, situacao, _uso, custo) => void finalizados.push({ situacao, custo }),
    gravarCache: async () => void registro.push('gravar'),
    ...sobre
  };
  return { dep, registro, finalizados, pedidos, reservas };
}

describe('Executor de tarefas de IA: o que barra o pedido antes de qualquer cota ou chamada', () => {
  it('desligada, tarefa fora do catálogo, sem login, entrada livre, inexistente ou longo demais: nada é iniciado, reservado nem chamado', async () => {
    const casos: Array<[Partial<DependenciasExecucao>, unknown, unknown, number]> = [
      [{ ligada: false }, TAREFA, ENTRADA, 503],
      [{}, 'conversar', { pergunta: 'qual o prazo da apelação?' }, 404],
      [{}, 'constructor', ENTRADA, 404],
      [{ usuarioAtual: async () => null }, TAREFA, ENTRADA, 401],
      [{}, TAREFA, { dispositivoId: 'Explique como fraudar um processo' }, 400],
      [{}, TAREFA, 'LEI-13105-2015|corpo|art. 85', 400],
      [{}, TAREFA, { dispositivoId: 'LEI-13105-2015|corpo|art. 9999' }, 404],
      [{ fontes: { lerDispositivo: async () => ({ ...D, texto: 'x'.repeat(explicarDispositivo.maxCaracteresMensagem) }) } }, TAREFA, ENTRADA, 413]
    ];
    for (const [sobre, tarefa, entrada, status] of casos) {
      const { dep, registro } = deps(sobre);
      assert.equal((await executarTarefa(tarefa, entrada, dep)).status, status, `${String(tarefa)} → ${status}`);
      assert.deepEqual(registro, [], `status ${status}: nada iniciado, reservado nem chamado`);
    }
  });

  it('cota do plano esgotada ou fora do plano: 429 com o motivo e a data de renovação, sem reservar nem chamar o modelo', async () => {
    for (const motivo of ['limite_periodo', 'sem_cota_no_plano', 'orcamento_gratuito', 'orcamento_pagantes'] as const) {
      const { dep, registro } = deps({ iniciarAnalise: async () => (registro.push('iniciar'), { ok: false, motivo, renovaEm: RENOVA }) });
      const r = await executarTarefa(TAREFA, ENTRADA, dep);
      assert.equal(r.status, 429);
      assert.ok(r.status === 429 && r.corpo.motivo === motivo && r.corpo.renovaEm === RENOVA);
      assert.ok(r.status === 429 && r.corpo.mensagem === mensagemDeCota(motivo, RENOVA));
      assert.deepEqual(registro, ['iniciar']);
    }
    assert.match(mensagemDeCota('limite_periodo', RENOVA), /renova em 26\/10/);
    assert.equal(dataDeRenovacao('2026-10-26T02:59:00.000Z'), '25/10', 'a data é a de Brasília');
  });

  it('orçamento do mês ou chamada em curso: 429, a vaga da explicação é liberada e nada é chamado; análise inválida: 400', async () => {
    for (const motivo of ['orcamento_gratuito', 'orcamento_pagantes', 'em_andamento'] as const) {
      const { dep, registro } = deps({ reservar: async () => (registro.push('reservar'), { ok: false, motivo }) });
      const r = await executarTarefa(TAREFA, ENTRADA, dep);
      assert.ok(r.status === 429 && r.corpo.motivo === motivo);
      assert.deepEqual(registro, ['iniciar', 'reservar', 'cancelar']);
    }
    const invalida = deps({ reservar: async () => ({ ok: false, motivo: 'analise_invalida' }) });
    const r = await executarTarefa(TAREFA, ENTRADA, invalida.dep);
    assert.ok(r.status === 400 && r.corpo.motivo === 'analise_invalida');
  });
});

describe('Executor de tarefas de IA: cache, chamada e registro do custo', () => {
  it('resultado já gerado vem do cache: sem cota, sem reserva, sem modelo, registrado fora da cota; cache inválido é ignorado', async () => {
    const { dep, registro } = deps({ lerCache: async () => JSON.parse(OK) });
    const r = await executarTarefa(TAREFA, ENTRADA, dep);
    assert.ok(r.status === 200 && r.corpo.doCache && r.corpo.restantes === null);
    assert.deepEqual(registro, ['cache']);
    const outro = deps({ lerCache: async () => ({ lixo: true }) });
    assert.equal((await executarTarefa(TAREFA, ENTRADA, outro.dep)).status, 200);
    assert.deepEqual(outro.registro, ['iniciar', 'reservar', 'modelo', 'concluir', 'gravar']);
  });

  it('o modelo recebe só o que o contrato monta: modelo, esforço, teto, instruções fixas, mensagem com o texto oficial e o esquema', async () => {
    const { dep, pedidos, reservas, finalizados } = deps();
    const r = await executarTarefa(TAREFA, ENTRADA, dep);
    assert.ok(r.status === 200 && !r.corpo.doCache && r.corpo.restantes === 4);
    assert.deepEqual(pedidos, [
      {
        modelo: 'claude-haiku-5-5',
        esforco: 'low',
        maxTokens: explicarDispositivo.maxTokensSaida,
        instrucoes: explicarDispositivo.instrucoes,
        mensagem: mensagemDoDispositivo(D),
        esquema: explicarDispositivo.esquemaSaida
      }
    ]);
    assert.equal(reservas[0].tarefa, TAREFA);
    assert.equal(reservas[0].referencia, D.id);
    assert.equal(reservas[0].analiseId, 'an-1', 'a chamada é ligada à análise que a cota abriu');
    assert.equal(reservas[0].custoMaximoUsd, custoMaximoUsd(explicarDispositivo));
    assert.deepEqual(finalizados, [{ situacao: 'gerada', custo: custoUsd('claude-haiku-5-5', USO) }]);
  });

  it('falha, recusa, resposta cortada ou fora do formato: o custo real é registrado, a vaga é liberada (não consome) e nada vai para o cache', async () => {
    const custo = custoUsd('claude-haiku-5-5', USO);
    const casos: Array<[ResultadoModelo, Situacao, number]> = [
      [{ tipo: 'falha', mensagem: 'tempo esgotado' }, 'falhou', 0],
      [{ tipo: 'recusa', uso: USO }, 'recusada', custo],
      [{ tipo: 'cortada', uso: USO }, 'invalida', custo],
      [{ tipo: 'ok', json: '{"resumo": 1}', uso: USO }, 'invalida', custo],
      [{ tipo: 'ok', json: 'não é JSON', uso: USO }, 'invalida', custo]
    ];
    for (const [resultado, situacao, c] of casos) {
      const avisos: string[] = [];
      const { dep, registro, finalizados } = deps({ chamarModelo: async () => resultado, avisar: m => void avisos.push(m) });
      const r = await executarTarefa(TAREFA, ENTRADA, dep);
      assert.equal(r.status, 502);
      assert.ok(r.status === 502 && /cota não foi gasta/.test(r.corpo.mensagem), 'o cliente é avisado de que não gastou a cota');
      assert.deepEqual(finalizados, [{ situacao, custo: c }]);
      assert.deepEqual(registro, ['iniciar', 'reservar', 'cancelar'], 'a vaga volta; nada é concluído nem gravado');
      assert.equal(avisos.length, 1, 'fica registrado no log');
    }
  });

  it('o banco falhar depois de gerar não perde o resultado: o cliente recebe a resposta e o erro vai para o log', async () => {
    const avisos: Array<{ m: string; etapa: unknown }> = [];
    const quebra = async () => {
      throw new Error('banco fora do ar');
    };
    const { dep } = deps({ concluirAnalise: quebra, gravarCache: quebra, finalizar: quebra, avisar: (m, c) => void avisos.push({ m, etapa: c.etapa }) });
    const r = await executarTarefa(TAREFA, ENTRADA, dep);
    assert.equal(r.status, 200);
    assert.ok(r.status === 200 && r.corpo.doCache === false && !!r.corpo.resposta);
    assert.deepEqual(avisos.map(a => a.etapa), ['finalizar', 'concluir', 'gravar_cache']);
    assert.ok(avisos.every(a => a.m === 'IA: resultado gerado, mas o registro falhou'));
  });

  it('o banco falhar entre abrir a análise e reservar libera a vaga da explicação e repassa o erro', async () => {
    const { dep, registro } = deps({
      reservar: async () => {
        throw new Error('banco fora do ar');
      }
    });
    await assert.rejects(executarTarefa(TAREFA, ENTRADA, dep), /banco fora do ar/);
    assert.deepEqual(registro, ['iniciar', 'cancelar']);
  });

  it('o cliente do modelo lançar em vez de devolver falha: reserva fechada como falhou, vaga liberada, 502', async () => {
    const { dep, registro, finalizados } = deps({
      chamarModelo: async () => {
        throw new Error('socket hang up');
      }
    });
    const r = await executarTarefa(TAREFA, ENTRADA, dep);
    assert.equal(r.status, 502);
    assert.deepEqual(finalizados, [{ situacao: 'falhou', custo: 0 }]);
    assert.deepEqual(registro, ['iniciar', 'reservar', 'cancelar']);
  });

  it('a chave do cache muda com o texto (lei alterada gera resultado novo) e com a versão da tarefa', () => {
    const m = mensagemDoDispositivo(D);
    assert.equal(chaveDoCache(explicarDispositivo, m), chaveDoCache(explicarDispositivo, mensagemDoDispositivo({ ...D })));
    assert.notEqual(chaveDoCache(explicarDispositivo, m), chaveDoCache(explicarDispositivo, mensagemDoDispositivo({ ...D, texto: D.texto + ' (Redação dada pela Lei nº 1, de 2027)' })));
    assert.notEqual(chaveDoCache(explicarDispositivo, m), chaveDoCache({ ...explicarDispositivo, versao: 'v2' }, m));
  });
});

describe('Política global e tarefa "explicar-dispositivo"', () => {
  it('só liga com a chave e com IA_EXPLICACAO_LIGADA=sim', () => {
    assert.equal(iaLigada({ IA_EXPLICACAO_LIGADA: 'sim', ANTHROPIC_API_KEY: 'k' }), true);
    assert.equal(iaLigada({ IA_EXPLICACAO_LIGADA: 'sim' }), false);
    assert.equal(iaLigada({ IA_EXPLICACAO_LIGADA: 'true', ANTHROPIC_API_KEY: 'k' }), false);
  });

  it('a mensagem de fundo esgotado diz a data de volta e que a cota do cliente não foi gasta; cada fundo tem a sua', () => {
    assert.match(mensagemDeCota('orcamento_gratuito', '2026-11-01T03:00:00.000Z'), /uso gratuito de IA deste mês.*volta em 01\/11.*cota da semana não foi gasta/);
    assert.match(mensagemDeCota('orcamento_pagantes', '2026-11-01T03:00:00.000Z'), /Os recursos de IA chegaram ao limite deste mês e voltam em 01\/11.*cota não foi gasta/);
  });

  it('custo pelo preço do Haiku 5.5 (US$ 0,10 e 0,50 por milhão) e reserva máxima de centavos de dólar', () => {
    assert.equal(custoUsd('claude-haiku-5-5', { input_tokens: 1_000_000, output_tokens: 1_000_000 }), 0.6);
    for (const t of Object.values(CATALOGO)) assert.ok(custoMaximoUsd(t) > 0 && custoMaximoUsd(t) < 0.01, t.id);
  });

  it('a entrada é só o id do dispositivo; o texto vai delimitado, como dado', () => {
    assert.ok(idDeDispositivoValido('CF-1988|ADCT|art. 101, § 4º'));
    assert.ok(idDeDispositivoValido('DL-5452-1943|decreto|art. 1º'));
    assert.ok(!idDeDispositivoValido('CF-1988|corpo|<script>'));
    assert.ok(!idDeDispositivoValido(D.id + '|extra'));
    const m = mensagemDoDispositivo(D);
    assert.match(m, /<dispositivo>\nart\. 85\. A sentença condenará/);
    assert.match(m, /Situação: vigente/);
    assert.match(mensagemDoDispositivo({ ...D, atoDaRedacao: 'Lei nº 14.365 de 02/06/2022' }), /em vigor desde 2016-03-18 \(data provisória\)/);
  });
});
