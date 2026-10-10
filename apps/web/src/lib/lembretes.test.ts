import { describe, it } from 'node:test';
import assert from 'node:assert';
import { opcoesDeAviso } from './lembretes-cliente';
import {
  avisoDevido,
  executarEnvio,
  hojeNoBrasil,
  limparSegredo,
  montarEmail,
  type DependenciasEnvio,
  type Email,
  type Lembrete,
  type Momento
} from './lembretes';

function lembrete(extra: Partial<Lembrete> = {}): Lembrete {
  return {
    id: 'l1',
    usuario_id: 'u1',
    titulo: 'Apelação · TJSP',
    tribunal: 'TJSP',
    vencimento: '2026-11-10',
    avisar_3_dias: true,
    avisar_1_dia: true,
    enviado_3_dias_em: null,
    enviado_1_dia_em: null,
    ...extra
  };
}

describe('Lembretes de prazo: quando cada aviso sai', () => {
  it('3 dias antes sai o aviso de 3 dias; 1 dia antes, o de 1 dia; fora disso, nada', () => {
    const l = lembrete();
    assert.strictEqual(avisoDevido(l, '2026-11-07'), 'tres_dias');
    assert.strictEqual(avisoDevido(l, '2026-11-09'), 'um_dia');
    for (const d of ['2026-11-01', '2026-11-06', '2026-11-11', '2026-12-01']) assert.strictEqual(avisoDevido(l, d), null, d);
  });

  it('o dia a mais cobre um envio perdido: faltando 2 dias sai o de 3; no dia do vencimento sai o de 1', () => {
    assert.strictEqual(avisoDevido(lembrete(), '2026-11-08'), 'tres_dias');
    assert.strictEqual(avisoDevido(lembrete({ avisar_3_dias: false }), '2026-11-10'), 'um_dia');
    assert.strictEqual(avisoDevido(lembrete(), '2026-11-10'), 'um_dia');
  });

  it('aviso já enviado não se repete, e o desligado não sai', () => {
    assert.strictEqual(avisoDevido(lembrete({ enviado_3_dias_em: '2026-11-07T11:00:00Z' }), '2026-11-07'), null);
    assert.strictEqual(avisoDevido(lembrete({ enviado_1_dia_em: '2026-11-09T11:00:00Z' }), '2026-11-09'), null);
    assert.strictEqual(avisoDevido(lembrete({ avisar_3_dias: false }), '2026-11-07'), null);
    assert.strictEqual(avisoDevido(lembrete({ avisar_1_dia: false }), '2026-11-09'), null);
  });

  it('criado em cima da hora: faltando 1 dia com os dois ligados, sai só o de 1 dia (um aviso por dia)', () => {
    assert.strictEqual(avisoDevido(lembrete(), '2026-11-09'), 'um_dia');
  });

  it('a data de hoje é a de Brasília, não a do servidor em UTC', () => {
    // 01:30 UTC de 11/11 ainda é 22:30 de 10/11 em Brasília
    assert.strictEqual(hojeNoBrasil(new Date('2026-11-11T01:30:00Z')), '2026-11-10');
    assert.strictEqual(hojeNoBrasil(new Date('2026-11-11T12:00:00Z')), '2026-11-11');
  });
});

describe('Lembretes de prazo: o e-mail', () => {
  it('leva título, tribunal, data e o aviso de conferir no tribunal; não leva dado do processo', () => {
    const e = montarEmail(lembrete(), '2026-11-07');
    assert.strictEqual(e.assunto, 'Ratione: seu prazo vence em 3 dias (10/11/2026)');
    assert.match(e.texto, /Apelação · TJSP/);
    assert.match(e.texto, /terça-feira, 10\/11\/2026/);
    assert.match(e.texto, /Confira a data no tribunal/);
    assert.match(e.texto, /\/meu-espaco/);
  });

  it('o texto muda com a proximidade: amanhã e hoje', () => {
    assert.match(montarEmail(lembrete(), '2026-11-09').assunto, /vence amanhã/);
    assert.match(montarEmail(lembrete(), '2026-11-10').assunto, /vence hoje/);
  });

  it('o título digitado pelo usuário não injeta HTML no e-mail', () => {
    const e = montarEmail(lembrete({ titulo: '<img src=x onerror=alert(1)> & "aspas"' }), '2026-11-07');
    assert.ok(!e.html.includes('<img'));
    assert.match(e.html, /&lt;img src=x onerror=alert\(1\)&gt; &amp; &quot;aspas&quot;/);
  });
});

function simulacoes(lista: Lembrete[], extra: Partial<DependenciasEnvio> = {}) {
  const enviados: Array<{ para: string; email: Email }> = [];
  const reservas: string[] = [];
  const liberadas: string[] = [];
  const dep: DependenciasEnvio = {
    hoje: () => '2026-11-07',
    listarProximos: async () => lista,
    emailDe: async id => (id === 'sem-email' ? null : `${id}@exemplo.com`),
    reservar: async (id, m: Momento) => {
      reservas.push(`${id}:${m}`);
      return true;
    },
    liberar: async (id, m: Momento) => {
      liberadas.push(`${id}:${m}`);
    },
    enviar: async (para, email) => {
      enviados.push({ para, email });
      return true;
    },
    simulacao: false,
    ...extra
  };
  return { dep, enviados, reservas, liberadas };
}

describe('Lembretes de prazo: o envio diário', () => {
  it('envia só o que está devido hoje, reserva antes de enviar e conta o resumo', async () => {
    const { dep, enviados, reservas } = simulacoes([lembrete({ id: 'a' }), lembrete({ id: 'b', vencimento: '2026-11-20' }), lembrete({ id: 'c', usuario_id: 'u2', vencimento: '2026-11-10' })]);
    const r = await executarEnvio(dep);
    assert.deepStrictEqual(r, { analisados: 3, enviados: 2, simulados: 0, semEmail: 0, falhas: 0 });
    assert.deepStrictEqual(reservas, ['a:tres_dias', 'c:tres_dias']);
    assert.deepStrictEqual(enviados.map(e => e.para), ['u1@exemplo.com', 'u2@exemplo.com']);
  });

  it('busca a janela certa: de hoje a 3 dias à frente', async () => {
    let janela: [string, string] = ['', ''];
    const { dep } = simulacoes([], { listarProximos: async (de, ate) => ((janela = [de, ate]), []) });
    await executarEnvio(dep);
    assert.deepStrictEqual(janela, ['2026-11-07', '2026-11-10']);
  });

  it('sem chave do provedor (simulação): conta o que sairia e não envia nem reserva nada', async () => {
    const { dep, enviados, reservas } = simulacoes([lembrete()], { simulacao: true });
    const r = await executarEnvio(dep);
    assert.strictEqual(r.simulados, 1);
    assert.strictEqual(enviados.length, 0);
    assert.strictEqual(reservas.length, 0);
  });

  it('conta sem e-mail: não envia e não reserva (tenta de novo no dia seguinte)', async () => {
    const { dep, enviados, reservas } = simulacoes([lembrete({ usuario_id: 'sem-email' })]);
    const r = await executarEnvio(dep);
    assert.strictEqual(r.semEmail, 1);
    assert.strictEqual(enviados.length, 0);
    assert.strictEqual(reservas.length, 0);
  });

  it('falha no envio (ou exceção): libera a reserva para tentar de novo, sem derrubar os outros', async () => {
    let n = 0;
    const { dep, liberadas } = simulacoes([lembrete({ id: 'a' }), lembrete({ id: 'b' }), lembrete({ id: 'c' })], {
      enviar: async () => {
        n++;
        if (n === 1) return false;
        if (n === 2) throw new Error('rede');
        return true;
      }
    });
    const r = await executarEnvio(dep);
    assert.deepStrictEqual(r, { analisados: 3, enviados: 1, simulados: 0, semEmail: 0, falhas: 2 });
    assert.deepStrictEqual(liberadas, ['a:tres_dias', 'b:tres_dias']);
  });

  it('dois envios simultâneos não mandam o mesmo aviso duas vezes: quem não consegue reservar não envia', async () => {
    const { dep, enviados } = simulacoes([lembrete()], { reservar: async () => false });
    const r = await executarEnvio(dep);
    assert.strictEqual(r.enviados, 0);
    assert.strictEqual(enviados.length, 0);
  });

  it('o endereço de e-mail de cada conta é buscado uma vez só', async () => {
    let buscas = 0;
    const { dep } = simulacoes([lembrete({ id: 'a' }), lembrete({ id: 'b' })], { emailDe: async () => (buscas++, 'u1@exemplo.com') });
    await executarEnvio(dep);
    assert.strictEqual(buscas, 1);
  });
});

describe('Lembretes de prazo: o que o formulário oferece', () => {
  it('prazo distante: oferece os dois avisos; faltando 2 dias, só o de 1 dia; vencendo hoje ou passado, nenhum', () => {
    assert.deepStrictEqual(opcoesDeAviso('2026-11-01', '2026-11-10'), { dias: 9, tres: true, um: true });
    assert.deepStrictEqual(opcoesDeAviso('2026-11-08', '2026-11-10'), { dias: 2, tres: false, um: true });
    assert.deepStrictEqual(opcoesDeAviso('2026-11-10', '2026-11-10'), { dias: 0, tres: false, um: false });
    assert.deepStrictEqual(opcoesDeAviso('2026-11-12', '2026-11-10'), { dias: -2, tres: false, um: false });
  });
});

describe('Lembretes de prazo: segredos vindos do ambiente', () => {
  it('apara espaços e quebras de linha das pontas (o PowerShell acrescenta uma ao enviar o segredo por pipe)', () => {
    assert.strictEqual(limparSegredo('abc123\r\n'), 'abc123');
    assert.strictEqual(limparSegredo('  abc123\n'), 'abc123');
    assert.strictEqual(limparSegredo('abc123'), 'abc123');
  });

  it('vazio, só espaços ou ausente vira undefined (a rota trata como não configurado)', () => {
    assert.strictEqual(limparSegredo(''), undefined);
    assert.strictEqual(limparSegredo(' \r\n'), undefined);
    assert.strictEqual(limparSegredo(undefined), undefined);
    assert.strictEqual(limparSegredo(null), undefined);
  });
});
