import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { chaveDoCache, executarTarefa, type DependenciasExecucao, type Situacao } from './executar';
import type { PedidoModelo, ResultadoModelo } from './contrato';
import { CATALOGO } from './catalogo';
import { ORCAMENTO_MENSAL_PADRAO_USD, custoMaximoUsd, custoUsd, iaLigada, limitesDaTarefa, orcamentoDoAmbiente } from './politica';
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

function deps(sobre: Partial<DependenciasExecucao> = {}) {
  const registro: string[] = [];
  const finalizados: Array<{ situacao: Situacao; custo: number }> = [];
  const pedidos: PedidoModelo[] = [];
  const reservas: Array<Record<string, unknown>> = [];
  const dep: DependenciasExecucao = {
    ligada: true,
    env: {},
    orcamentoMensalUsd: 5,
    fontes: { lerDispositivo: async id => (id === D.id ? D : null) },
    usuarioAtual: async () => ({ id: 'u1' }),
    lerCache: async () => null,
    reservar: async p => (registro.push('reservar'), reservas.push(p), { ok: true, id: 7, restantesHoje: 4 }),
    registrarCache: async () => void registro.push('cache'),
    chamarModelo: async p => (registro.push('modelo'), pedidos.push(p), { tipo: 'ok', json: OK, uso: USO } as ResultadoModelo),
    finalizar: async (_id, situacao, _uso, custo) => void finalizados.push({ situacao, custo }),
    gravarCache: async () => void registro.push('gravar'),
    ...sobre
  };
  return { dep, registro, finalizados, pedidos, reservas };
}

describe('Executor de tarefas de IA: o que barra o pedido antes de qualquer chamada', () => {
  it('desligada, tarefa fora do catálogo, sem login, entrada livre, inexistente ou longo demais: nada é reservado nem chamado', async () => {
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
      assert.deepEqual(registro, [], `status ${status}: nada reservado nem chamado`);
    }
  });

  it('cota ou orçamento esgotados: 429 com o motivo, sem chamar o modelo', async () => {
    for (const motivo of ['limite_dia', 'limite_mes', 'orcamento', 'em_andamento'] as const) {
      const { dep, registro } = deps({ reservar: async () => ({ ok: false, motivo }) });
      const r = await executarTarefa(TAREFA, ENTRADA, dep);
      assert.equal(r.status, 429);
      assert.ok(r.status === 429 && r.corpo.motivo === motivo);
      assert.ok(!registro.includes('modelo'));
    }
  });
});

describe('Executor de tarefas de IA: cache, chamada e registro do custo', () => {
  it('resultado já gerado vem do cache: sem reserva, sem modelo, registrado fora da cota; cache inválido é ignorado', async () => {
    const { dep, registro } = deps({ lerCache: async () => JSON.parse(OK) });
    const r = await executarTarefa(TAREFA, ENTRADA, dep);
    assert.ok(r.status === 200 && r.corpo.doCache);
    assert.deepEqual(registro, ['cache']);
    const outro = deps({ lerCache: async () => ({ lixo: true }) });
    assert.equal((await executarTarefa(TAREFA, ENTRADA, outro.dep)).status, 200);
    assert.deepEqual(outro.registro, ['reservar', 'modelo', 'gravar']);
  });

  it('o modelo recebe só o que o contrato monta: modelo, esforço, teto, instruções fixas, mensagem com o texto oficial e o esquema', async () => {
    const { dep, pedidos, reservas, finalizados } = deps();
    const r = await executarTarefa(TAREFA, ENTRADA, dep);
    assert.ok(r.status === 200 && !r.corpo.doCache && r.corpo.restantesHoje === 4);
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
    assert.equal(reservas[0].custoMaximoUsd, custoMaximoUsd(explicarDispositivo));
    assert.deepEqual(finalizados, [{ situacao: 'gerada', custo: custoUsd('claude-haiku-5-5', USO) }]);
  });

  it('falha, recusa, resposta cortada ou fora do formato: a reserva é fechada (conta na cota) e nada vai para o cache', async () => {
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
      assert.equal((await executarTarefa(TAREFA, ENTRADA, dep)).status, 502);
      assert.deepEqual(finalizados, [{ situacao, custo: c }]);
      assert.ok(!registro.includes('gravar'));
      assert.equal(avisos.length, 1, 'fica registrado no log');
    }
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

  it('o ambiente só aperta os limites da tarefa; o orçamento pode, no máximo, dobrar', () => {
    assert.deepEqual(limitesDaTarefa(explicarDispositivo, {}), { porDia: 5, porMes: 60 });
    assert.deepEqual(limitesDaTarefa(explicarDispositivo, { IA_LIMITE_DIA: '2', IA_LIMITE_MES: '500' }), { porDia: 2, porMes: 60 });
    assert.equal(orcamentoDoAmbiente({ IA_ORCAMENTO_MES_USD: '1.5' }), 1.5);
    assert.equal(orcamentoDoAmbiente({ IA_ORCAMENTO_MES_USD: '1000' }), ORCAMENTO_MENSAL_PADRAO_USD);
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
