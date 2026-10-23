import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cobrancaPronta, lerConfigCobranca, usuarioPodeUsarCobranca } from './config';
import { situacaoAposCobranca, situacaoDaAssinatura, situacaoDaCobranca } from './estados';
import { assinarAviso, assinaturaValida, manifesto, partesDaAssinatura } from './webhook';
import { ErroMp, criarClienteMp } from './mercadopago';
import { processarAviso, type BancoDaCobranca, type LeituraMp } from './processar';

describe('Cobrança: configuração (desligada por padrão; em teste, só a lista)', () => {
  it('sem COBRANCA_LIGADA=sim nada funciona, mesmo com credenciais', () => {
    for (const env of [{}, { COBRANCA_LIGADA: 'nao' }, { COBRANCA_LIGADA: 'true' }, { COBRANCA_LIGADA: 'SIM' }]) {
      const c = lerConfigCobranca({ ...env, MERCADOPAGO_ACCESS_TOKEN: 't', MERCADOPAGO_WEBHOOK_SECRET: 's', COBRANCA_AMBIENTE: 'producao' });
      assert.equal(c.ligada, false);
      assert.equal(cobrancaPronta(c), false);
      assert.equal(usuarioPodeUsarCobranca(c, 'qualquer@exemplo.com'), false);
    }
  });

  it('ligada mas sem o token ou sem o segredo do webhook: não está pronta', () => {
    assert.equal(cobrancaPronta(lerConfigCobranca({ COBRANCA_LIGADA: 'sim', MERCADOPAGO_WEBHOOK_SECRET: 's' })), false);
    assert.equal(cobrancaPronta(lerConfigCobranca({ COBRANCA_LIGADA: 'sim', MERCADOPAGO_ACCESS_TOKEN: 't' })), false);
    assert.equal(cobrancaPronta(lerConfigCobranca({ COBRANCA_LIGADA: 'sim', MERCADOPAGO_ACCESS_TOKEN: '  ', MERCADOPAGO_WEBHOOK_SECRET: 's' })), false);
  });

  it('o ambiente é teste a menos que seja exatamente "producao"; em teste só quem está na lista (sem diferenciar caixa, com , ; ou espaço)', () => {
    const base = { COBRANCA_LIGADA: 'sim', MERCADOPAGO_ACCESS_TOKEN: 't', MERCADOPAGO_WEBHOOK_SECRET: 's' };
    const teste = lerConfigCobranca({ ...base, COBRANCA_AMBIENTE: 'Producao', COBRANCA_TESTE_EMAILS: 'Ana@Exemplo.com; beto@exemplo.com carlos@exemplo.com,' });
    assert.equal(teste.ambiente, 'teste');
    assert.deepEqual(teste.emailsDeTeste, ['ana@exemplo.com', 'beto@exemplo.com', 'carlos@exemplo.com']);
    assert.equal(usuarioPodeUsarCobranca(teste, 'ANA@exemplo.com'), true);
    assert.equal(usuarioPodeUsarCobranca(teste, 'outra@exemplo.com'), false);
    assert.equal(usuarioPodeUsarCobranca(teste, null), false);
    const sem = lerConfigCobranca(base);
    assert.equal(usuarioPodeUsarCobranca(sem, 'ana@exemplo.com'), false, 'teste sem lista: ninguém');
    const prod = lerConfigCobranca({ ...base, COBRANCA_AMBIENTE: 'producao' });
    assert.equal(prod.ambiente, 'producao');
    assert.equal(usuarioPodeUsarCobranca(prod, 'qualquer@exemplo.com'), true);
  });
});

describe('Cobrança: estados do Mercado Pago', () => {
  it('assinatura: pending, authorized, paused, cancelled; o que não se conhece é ignorado', () => {
    assert.equal(situacaoDaAssinatura('pending'), 'pendente');
    assert.equal(situacaoDaAssinatura('authorized'), 'ativa');
    assert.equal(situacaoDaAssinatura('PAUSED'), 'pausada');
    assert.equal(situacaoDaAssinatura('cancelled'), 'cancelada');
    assert.equal(situacaoDaAssinatura('canceled'), 'cancelada');
    for (const x of ['', 'finished', 'xyz', null, undefined]) assert.equal(situacaoDaAssinatura(x), null);
  });

  it('cobrança: aprovada, pendente, rejeitada, reembolsada, cancelada; o resto é ignorado', () => {
    assert.equal(situacaoDaCobranca('approved'), 'aprovada');
    assert.equal(situacaoDaCobranca('processed'), 'aprovada');
    assert.equal(situacaoDaCobranca('in_process'), 'pendente');
    assert.equal(situacaoDaCobranca('recycling'), 'pendente');
    assert.equal(situacaoDaCobranca('rejected'), 'rejeitada');
    assert.equal(situacaoDaCobranca('charged_back'), 'reembolsada');
    assert.equal(situacaoDaCobranca('cancelled'), 'cancelada');
    assert.equal(situacaoDaCobranca('novo_estado'), null);
  });

  it('cobrança rejeitada põe a assinatura ativa em atraso; aprovada a tira do atraso; o resto não mexe', () => {
    assert.equal(situacaoAposCobranca('ativa', 'rejeitada'), 'em_atraso');
    assert.equal(situacaoAposCobranca('em_atraso', 'aprovada'), 'ativa');
    assert.equal(situacaoAposCobranca('ativa', 'aprovada'), 'ativa');
    assert.equal(situacaoAposCobranca('pendente', 'rejeitada'), 'pendente');
    assert.equal(situacaoAposCobranca('cancelada', 'aprovada'), 'cancelada');
    assert.equal(situacaoAposCobranca('pausada', 'rejeitada'), 'pausada');
  });
});

describe('Cobrança: assinatura do webhook (HMAC-SHA256 do manifesto)', () => {
  const SEGREDO = 'segredo-da-aplicacao';
  const TS = '1704908010';
  const dados = (sobre: Partial<Parameters<typeof assinaturaValida>[0]> = {}) => ({
    xSignature: assinarAviso(SEGREDO, '2c9380847264097f01726b1a2a5a0b8a', 'req-1', TS),
    xRequestId: 'req-1',
    dataId: '2c9380847264097f01726b1a2a5a0b8a',
    segredo: SEGREDO,
    ...sobre
  });

  it('o manifesto segue o formato da documentação, omite o par ausente e põe o id alfanumérico em minúsculas', () => {
    assert.equal(manifesto('ABC123', 'r1', '99'), 'id:abc123;request-id:r1;ts:99;');
    assert.equal(manifesto('12345', 'r1', '99'), 'id:12345;request-id:r1;ts:99;');
    assert.equal(manifesto(null, 'r1', '99'), 'request-id:r1;ts:99;');
    assert.equal(manifesto('12345', null, '99'), 'id:12345;ts:99;');
    assert.deepEqual(partesDaAssinatura('ts=1704908010,v1=618c85'), { ts: '1704908010', v1: '618c85' });
    assert.deepEqual(partesDaAssinatura('v1=aa, ts=5'), { ts: '5', v1: 'aa' });
    assert.deepEqual(partesDaAssinatura('lixo'), { ts: null, v1: null });
  });

  it('aceita a assinatura correta, inclusive com o hash em maiúsculas', () => {
    assert.equal(assinaturaValida(dados()), true);
    const x = dados().xSignature!;
    assert.equal(assinaturaValida(dados({ xSignature: x.replace(/v1=(.*)$/, (_m, h: string) => `v1=${h.toUpperCase()}`) })), true);
  });

  it('recusa aviso adulterado: id, request-id, ts, segredo errado ou hash alterado', () => {
    assert.equal(assinaturaValida(dados({ dataId: 'outro-id' })), false);
    assert.equal(assinaturaValida(dados({ xRequestId: 'req-2' })), false);
    assert.equal(assinaturaValida(dados({ segredo: 'outro-segredo' })), false);
    assert.equal(assinaturaValida(dados({ xSignature: dados().xSignature!.replace(`ts=${TS}`, 'ts=1704908011') })), false);
    assert.equal(assinaturaValida(dados({ xSignature: dados().xSignature!.slice(0, -1) + (dados().xSignature!.endsWith('0') ? '1' : '0') })), false);
  });

  it('recusa assinatura ausente, mal formada, sem ts, sem v1, de tamanho errado ou não hexadecimal', () => {
    for (const xSignature of [null, '', 'lixo', `ts=${TS}`, 'v1=abcd', `ts=${TS},v1=`, `ts=${TS},v1=zzzz`, `ts=${TS},v1=abcd`]) {
      assert.equal(assinaturaValida(dados({ xSignature })), false, String(xSignature));
    }
    assert.equal(assinaturaValida(dados({ segredo: '' })), false);
  });
});

describe('Cobrança: cliente do Mercado Pago', () => {
  const resposta = (corpo: unknown, status = 200) => new Response(JSON.stringify(corpo), { status, headers: { 'Content-Type': 'application/json' } });
  function cliente(responder: (url: string, init: RequestInit) => Response | Promise<Response>) {
    const chamadas: Array<{ url: string; init: RequestInit }> = [];
    const f = (async (url: string, init: RequestInit) => {
      chamadas.push({ url: String(url), init });
      return responder(String(url), init);
    }) as unknown as typeof fetch;
    return { mp: criarClienteMp('TOKEN-SECRETO', { fetch: f, base: 'https://mp.exemplo' }), chamadas };
  }

  it('cria a assinatura pendente com o corpo da documentação e devolve o link de pagamento', async () => {
    const { mp, chamadas } = cliente(() => resposta({ id: 'mp-1', status: 'pending', external_reference: 'ref-1', init_point: 'https://www.mercadopago.com.br/subscriptions/checkout?x=1' }));
    const a = await mp.criarAssinatura({ motivo: 'Ratione, plano Essencial', referencia: 'ref-1', email: 'ana@exemplo.com', valorCentavos: 2900, backUrl: 'https://ratione.exemplo/meu-espaco/uso', fim: new Date('2031-01-01T00:00:00.000Z') });
    assert.equal(a.id, 'mp-1');
    assert.equal(a.linkDePagamento, 'https://www.mercadopago.com.br/subscriptions/checkout?x=1');
    assert.equal(chamadas[0].url, 'https://mp.exemplo/preapproval');
    assert.equal(chamadas[0].init.method, 'POST');
    assert.equal((chamadas[0].init.headers as Record<string, string>).Authorization, 'Bearer TOKEN-SECRETO');
    assert.deepEqual(JSON.parse(chamadas[0].init.body as string), {
      reason: 'Ratione, plano Essencial',
      external_reference: 'ref-1',
      payer_email: 'ana@exemplo.com',
      auto_recurring: { frequency: 1, frequency_type: 'months', end_date: '2031-01-01T00:00:00.000Z', transaction_amount: 29, currency_id: 'BRL' },
      back_url: 'https://ratione.exemplo/meu-espaco/uso',
      status: 'pending'
    });
  });

  it('sem link de pagamento, sem id ou com erro do Mercado Pago: falha com erro tipado e sem vazar o token', async () => {
    const nova = { motivo: 'm', referencia: 'r', email: 'a@b.c', valorCentavos: 100, backUrl: 'https://x', fim: new Date() };
    await assert.rejects(cliente(() => resposta({ id: 'mp-1', status: 'pending' })).mp.criarAssinatura(nova), (e: unknown) => e instanceof ErroMp && /link de pagamento/.test(e.message));
    await assert.rejects(cliente(() => resposta({ status: 'pending' })).mp.criarAssinatura(nova), (e: unknown) => e instanceof ErroMp && /id da assinatura/.test(e.message));
    const erro = await cliente(() => resposta({ message: 'invalid payer_email' }, 400)).mp.criarAssinatura(nova).catch((e: ErroMp) => e);
    assert.ok(erro instanceof ErroMp);
    assert.equal(erro.status, 400);
    assert.ok(!erro.message.includes('TOKEN-SECRETO'));
    const rede = await criarClienteMp('T', { fetch: (async () => Promise.reject(new Error('ECONNRESET com TOKEN-SECRETO'))) as unknown as typeof fetch }).buscarAssinatura('x').catch((e: ErroMp) => e);
    assert.ok(rede instanceof ErroMp && rede.status === 504 && !rede.message.includes('TOKEN-SECRETO'));
  });

  it('lê a assinatura (próxima cobrança), devolve nulo no 404, cancela com PUT e lê a cobrança em centavos', async () => {
    const { mp, chamadas } = cliente(url => {
      if (url.endsWith('/preapproval/mp-1')) return resposta({ id: 'mp-1', status: 'authorized', external_reference: 'ref-1', next_payment_date: '2026-11-23T10:00:00.000-03:00' });
      if (url.endsWith('/authorized_payments/77')) return resposta({ id: 77, preapproval_id: 'mp-1', transaction_amount: 29.9, status: 'processed', payment: { id: 5551, status: 'approved', payment_method_id: 'visa', date_approved: '2026-10-23T10:00:00.000-03:00' } });
      if (url.endsWith('/preapproval/inexistente')) return resposta({ message: 'not found' }, 404);
      return resposta({ id: 'mp-1', status: 'cancelled' });
    });
    const a = await mp.buscarAssinatura('mp-1');
    assert.deepEqual(a, { id: 'mp-1', status: 'authorized', referencia: 'ref-1', proximaCobranca: '2026-11-23T10:00:00.000-03:00', linkDePagamento: null });
    assert.equal(await mp.buscarAssinatura('inexistente'), null);
    await mp.cancelarAssinatura('mp-1');
    const put = chamadas.find(c => c.init.method === 'PUT')!;
    assert.deepEqual(JSON.parse(put.init.body as string), { status: 'cancelled' });
    const c = await mp.buscarCobranca('77');
    assert.deepEqual(c, { id: '77', assinaturaMpId: 'mp-1', status: 'approved', valorCentavos: 2990, pagamentoId: '5551', meio: 'visa', pagaEm: '2026-10-23T10:00:00.000-03:00' });
  });

  it('o id vai codificado na URL (não dá para injetar caminho)', async () => {
    const { mp, chamadas } = cliente(() => resposta({ id: 'x', status: 'pending' }));
    await mp.buscarAssinatura('../../users/me');
    assert.ok(chamadas[0].url.endsWith('/preapproval/..%2F..%2Fusers%2Fme'));
  });
});

describe('Cobrança: processamento dos avisos (relê o recurso, nunca confia no corpo)', () => {
  const REF = '6f1c2d3e-4a5b-4c6d-8e7f-0a1b2c3d4e5f';
  function montar(nossa: { id: string; situacao: Parameters<typeof situacaoAposCobranca>[0] } | null, assinatura: Awaited<ReturnType<LeituraMp['buscarAssinatura']>>, cobranca: Awaited<ReturnType<LeituraMp['buscarCobranca']>> = null) {
    const registro: string[] = [];
    const mp: LeituraMp = { buscarAssinatura: async () => assinatura, buscarCobranca: async () => cobranca };
    const banco: BancoDaCobranca = {
      acharAssinatura: async p => (registro.push(`achar ${p.referencia ?? '-'} ${p.mpId ?? '-'}`), nossa),
      aplicar: async (id, situacao, mpSituacao, fim) => void registro.push(`aplicar ${id} ${situacao} ${mpSituacao} ${fim ?? '-'}`),
      registrarCobranca: async p => void registro.push(`cobranca ${p.assinaturaId} ${p.pagamentoId} ${p.valorCentavos} ${p.situacao}`)
    };
    return { mp, banco, registro };
  }
  const assinatura = (status: string) => ({ id: 'mp-1', status, referencia: REF, proximaCobranca: '2026-11-23T13:00:00.000Z', linkDePagamento: null });

  it('assinatura autorizada: aplica "ativa" com o fim do ciclo, achando a nossa pela referência e pelo id de lá', async () => {
    const { mp, banco, registro } = montar({ id: 'a1', situacao: 'pendente' }, assinatura('authorized'));
    assert.equal(await processarAviso({ topico: 'subscription_preapproval', recursoId: 'mp-1' }, mp, banco), 'aplicado');
    assert.deepEqual(registro, [`achar ${REF} mp-1`, 'aplicar a1 ativa authorized 2026-11-23T13:00:00.000Z']);
  });

  it('referência que não é um id nosso não é usada para achar; cancelada e pausada são aplicadas', async () => {
    const forjada = { ...assinatura('cancelled'), referencia: "'; drop table assinaturas; --" };
    const { mp, banco, registro } = montar({ id: 'a1', situacao: 'ativa' }, forjada);
    await processarAviso({ topico: 'subscription_preapproval', recursoId: 'mp-1' }, mp, banco);
    assert.deepEqual(registro, ['achar - mp-1', 'aplicar a1 cancelada cancelled 2026-11-23T13:00:00.000Z']);
    const p = montar({ id: 'a1', situacao: 'ativa' }, assinatura('paused'));
    await processarAviso({ topico: 'subscription_preapproval', recursoId: 'mp-1' }, p.mp, p.banco);
    assert.match(p.registro[1], /aplicar a1 pausada paused/);
  });

  it('assinatura em atraso continua em atraso quando o Mercado Pago ainda a mostra autorizada (só uma cobrança aprovada a tira)', async () => {
    const { mp, banco, registro } = montar({ id: 'a1', situacao: 'em_atraso' }, assinatura('authorized'));
    await processarAviso({ topico: 'subscription_preapproval', recursoId: 'mp-1' }, mp, banco);
    assert.match(registro[1], /aplicar a1 em_atraso authorized/);
  });

  it('sem assinatura nossa, recurso que não existe, estado desconhecido e tópico que não tratamos: nada é gravado', async () => {
    const a = montar(null, assinatura('authorized'));
    assert.equal(await processarAviso({ topico: 'subscription_preapproval', recursoId: 'mp-1' }, a.mp, a.banco), 'sem_assinatura');
    const b = montar({ id: 'a1', situacao: 'ativa' }, null);
    assert.equal(await processarAviso({ topico: 'subscription_preapproval', recursoId: 'mp-1' }, b.mp, b.banco), 'recurso_inexistente');
    const c = montar({ id: 'a1', situacao: 'ativa' }, assinatura('novo_estado'));
    assert.equal(await processarAviso({ topico: 'subscription_preapproval', recursoId: 'mp-1' }, c.mp, c.banco), 'ignorado');
    assert.ok(!c.registro.some(r => r.startsWith('aplicar')));
    const d = montar({ id: 'a1', situacao: 'ativa' }, assinatura('authorized'));
    for (const topico of ['payment', 'subscription_preapproval_plan', 'point_integration_wh']) {
      assert.equal(await processarAviso({ topico, recursoId: 'x' }, d.mp, d.banco), 'ignorado');
    }
    assert.deepEqual(d.registro, []);
  });

  const cobranca = (status: string) => ({ id: '77', assinaturaMpId: 'mp-1', status, valorCentavos: 2900, pagamentoId: '5551', meio: 'visa', pagaEm: '2026-10-23T13:00:00.000Z' });

  it('cobrança aprovada é registrada; rejeitada registra e põe a assinatura ativa em atraso; aprovada depois tira do atraso', async () => {
    const aprovada = montar({ id: 'a1', situacao: 'ativa' }, null, cobranca('approved'));
    assert.equal(await processarAviso({ topico: 'subscription_authorized_payment', recursoId: '77' }, aprovada.mp, aprovada.banco), 'aplicado');
    assert.deepEqual(aprovada.registro, ['achar - mp-1', 'cobranca a1 5551 2900 aprovada']);

    const rejeitada = montar({ id: 'a1', situacao: 'ativa' }, null, cobranca('rejected'));
    await processarAviso({ topico: 'subscription_authorized_payment', recursoId: '77' }, rejeitada.mp, rejeitada.banco);
    assert.deepEqual(rejeitada.registro, ['achar - mp-1', 'cobranca a1 5551 2900 rejeitada', 'aplicar a1 em_atraso cobranca_rejeitada -']);

    const volta = montar({ id: 'a1', situacao: 'em_atraso' }, null, cobranca('approved'));
    await processarAviso({ topico: 'subscription_authorized_payment', recursoId: '77' }, volta.mp, volta.banco);
    assert.match(volta.registro[2], /aplicar a1 ativa authorized/);
  });

  it('cobrança sem id de pagamento, sem valor ou de estado desconhecido não é registrada', async () => {
    for (const c of [{ ...cobranca('approved'), pagamentoId: null }, { ...cobranca('approved'), valorCentavos: null }, cobranca('novo_estado')]) {
      const { mp, banco, registro } = montar({ id: 'a1', situacao: 'ativa' }, null, c);
      assert.equal(await processarAviso({ topico: 'subscription_authorized_payment', recursoId: '77' }, mp, banco), 'ignorado');
      assert.ok(!registro.some(r => r.startsWith('cobranca')));
    }
  });
});
