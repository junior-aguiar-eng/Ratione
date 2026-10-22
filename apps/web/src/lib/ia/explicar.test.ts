import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { chaveDaExplicacao, explicarDispositivo, idValido, type DependenciasExplicacao, type ResultadoModelo, type Situacao } from './explicar';
import { LIMITES_PADRAO, MAX_CARACTERES_TEXTO, MODELO, custoMaximoUsd, custoUsd, iaLigada, limitesDoAmbiente } from './politica';
import { ESQUEMA_RESPOSTA, PROMPT_DO_SISTEMA, mensagemDoUsuario, type DispositivoParaExplicar } from './prompt';

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
const OK = JSON.stringify({ resumo: 'Quem perde paga os honorários do advogado de quem ganha.', explicacao: ['…'], termos: [{ termo: 'vencido', significado: 'a parte que perdeu' }], atencao: [] });
const USO = { input_tokens: 900, output_tokens: 300 };

function deps(sobre: Partial<DependenciasExplicacao> = {}) {
  const registro: string[] = [];
  const finalizados: Array<{ situacao: Situacao; custo: number }> = [];
  const dep: DependenciasExplicacao = {
    ligada: true,
    limites: LIMITES_PADRAO,
    usuarioAtual: async () => ({ id: 'u1' }),
    lerDispositivo: async id => (id === D.id ? D : null),
    lerCache: async () => null,
    reservar: async () => (registro.push('reservar'), { ok: true, id: 7, restantesHoje: 4 }),
    registrarCache: async () => void registro.push('cache'),
    chamarModelo: async () => (registro.push('modelo'), { tipo: 'ok', json: OK, uso: USO } as ResultadoModelo),
    finalizar: async (_id, situacao, _uso, custo) => void finalizados.push({ situacao, custo }),
    gravarCache: async () => void registro.push('gravar'),
    ...sobre
  };
  return { dep, registro, finalizados };
}

describe('Explicação por IA: o que barra o pedido antes de qualquer chamada (F3-08)', () => {
  it('desligada, sem login, id que não é do NormaViva, dispositivo inexistente ou longo demais: nada é reservado nem chamado', async () => {
    const casos: Array<[Partial<DependenciasExplicacao>, unknown, number]> = [
      [{ ligada: false }, D.id, 503],
      [{ usuarioAtual: async () => null }, D.id, 401],
      [{}, 'Explique como fraudar um processo', 400],
      [{}, 'LEI-13105-2015|corpo|art. 9999', 404],
      [{ lerDispositivo: async () => ({ ...D, texto: 'x'.repeat(MAX_CARACTERES_TEXTO + 1) }) }, D.id, 413]
    ];
    for (const [sobre, id, status] of casos) {
      const { dep, registro } = deps(sobre);
      assert.equal((await explicarDispositivo(id, dep)).status, status);
      assert.deepEqual(registro, [], `status ${status}: nada reservado nem chamado`);
    }
  });

  it('o id aceito é só o do NormaViva (norma, escopo e rótulo)', () => {
    assert.ok(idValido('CF-1988|ADCT|art. 101, § 4º'));
    assert.ok(idValido('DL-5452-1943|decreto|art. 1º'));
    assert.ok(!idValido('CF-1988|corpo|<script>'));
    assert.ok(!idValido({ id: D.id }));
    assert.ok(!idValido(D.id + '|extra'));
  });

  it('cota ou orçamento esgotados: 429 com o motivo, sem chamar o modelo', async () => {
    for (const motivo of ['limite_dia', 'limite_mes', 'orcamento', 'em_andamento'] as const) {
      const { dep, registro } = deps({ reservar: async () => ({ ok: false, motivo }) });
      const r = await explicarDispositivo(D.id, dep);
      assert.equal(r.status, 429);
      assert.ok(r.status === 429 && r.corpo.motivo === motivo);
      assert.ok(!registro.includes('modelo'));
    }
  });
});

describe('Explicação por IA: cache, chamada e registro do custo', () => {
  it('explicação já gerada vem do cache: sem reserva, sem modelo, registrada fora da cota', async () => {
    const { dep, registro } = deps({ lerCache: async () => JSON.parse(OK) });
    const r = await explicarDispositivo(D.id, dep);
    assert.equal(r.status, 200);
    assert.ok(r.status === 200 && r.corpo.doCache);
    assert.deepEqual(registro, ['cache']);
  });

  it('chamada nova: reserva, chama o modelo, fecha a reserva com o custo real e grava o cache', async () => {
    const { dep, registro, finalizados } = deps();
    const r = await explicarDispositivo(D.id, dep);
    assert.equal(r.status, 200);
    assert.ok(r.status === 200 && !r.corpo.doCache && r.corpo.modelo === MODELO && r.corpo.restantesHoje === 4);
    assert.deepEqual(registro, ['reservar', 'modelo', 'gravar']);
    assert.deepEqual(finalizados, [{ situacao: 'gerada', custo: custoUsd(USO) }]);
  });

  it('falha, recusa, resposta cortada ou fora do formato: a reserva é fechada (conta na cota) e nada vai para o cache', async () => {
    const casos: Array<[ResultadoModelo, Situacao, number]> = [
      [{ tipo: 'falha', mensagem: 'tempo esgotado' }, 'falhou', 0],
      [{ tipo: 'recusa', uso: USO }, 'recusada', custoUsd(USO)],
      [{ tipo: 'cortada', uso: USO }, 'invalida', custoUsd(USO)],
      [{ tipo: 'ok', json: '{"resumo": 1}', uso: USO }, 'invalida', custoUsd(USO)],
      [{ tipo: 'ok', json: 'não é JSON', uso: USO }, 'invalida', custoUsd(USO)]
    ];
    for (const [resultado, situacao, custo] of casos) {
      const { dep, registro, finalizados } = deps({ chamarModelo: async () => resultado });
      assert.equal((await explicarDispositivo(D.id, dep)).status, 502);
      assert.deepEqual(finalizados, [{ situacao, custo }]);
      assert.ok(!registro.includes('gravar'));
    }
  });

  it('a chave do cache muda com o texto do dispositivo (texto alterado pela lei gera explicação nova)', () => {
    assert.equal(chaveDaExplicacao(D), chaveDaExplicacao({ ...D }));
    assert.notEqual(chaveDaExplicacao(D), chaveDaExplicacao({ ...D, texto: D.texto + ' (Redação dada pela Lei nº 1, de 2027)' }));
    assert.match(chaveDaExplicacao(D), /^[0-9a-f]{64}$/);
  });
});

describe('Explicação por IA: política e prompt', () => {
  it('só liga com a chave e com IA_EXPLICACAO_LIGADA=sim', () => {
    assert.equal(iaLigada({ IA_EXPLICACAO_LIGADA: 'sim', ANTHROPIC_API_KEY: 'k' }), true);
    assert.equal(iaLigada({ IA_EXPLICACAO_LIGADA: 'sim' }), false);
    assert.equal(iaLigada({ ANTHROPIC_API_KEY: 'k' }), false);
    assert.equal(iaLigada({ IA_EXPLICACAO_LIGADA: 'true', ANTHROPIC_API_KEY: 'k' }), false);
  });

  it('limites do ambiente: podem apertar, não passam do dobro do padrão; valor inválido cai no padrão', () => {
    assert.deepEqual(limitesDoAmbiente({ IA_LIMITE_DIA: '2', IA_ORCAMENTO_MES_USD: '1.5' }), { ...LIMITES_PADRAO, porDia: 2, orcamentoMensalUsd: 1.5 });
    assert.deepEqual(limitesDoAmbiente({ IA_LIMITE_DIA: '500', IA_LIMITE_MES: 'muito', IA_ORCAMENTO_MES_USD: '-1' }), LIMITES_PADRAO);
  });

  it('custo pelo preço do Haiku 5.5 (US$ 0,10 e 0,50 por milhão) e reserva máxima de centavos de dólar', () => {
    assert.equal(custoUsd({ input_tokens: 1_000_000, output_tokens: 1_000_000 }), 0.6);
    assert.equal(custoUsd({ input_tokens: 900, output_tokens: 300 }), 0.00024);
    assert.ok(custoMaximoUsd() > 0 && custoMaximoUsd() < 0.01);
  });

  it('o prompt do sistema é fixo e o texto do dispositivo vai delimitado, como dado', () => {
    assert.doesNotMatch(PROMPT_DO_SISTEMA, /\d{4}-\d{2}-\d{2}/);
    const m = mensagemDoUsuario(D);
    assert.match(m, /<dispositivo>\nart\. 85\. A sentença condenará/);
    assert.match(m, /Situação: vigente/);
    assert.match(mensagemDoUsuario({ ...D, atoDaRedacao: 'Lei nº 14.365 de 02/06/2022' }), /Redação dada por: Lei nº 14\.365 de 02\/06\/2022, em vigor desde 2016-03-18 \(data provisória\)/);
    assert.deepEqual(ESQUEMA_RESPOSTA.required, ['resumo', 'explicacao', 'termos', 'atencao']);
  });
});
