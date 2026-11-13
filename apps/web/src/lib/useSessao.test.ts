import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import type { User } from '@supabase/supabase-js';
import {
  criarLojaSessao,
  obterLojaSessao,
  useSessao,
  type ClienteAuthSessao
} from './useSessao';

const usuarioA = { id: 'aaaaaaaa-1111-4111-8111-111111111111', email: 'a@exemplo.test' } as User;

function criarClienteFalso(sessaoInicial: { user: User; access_token?: string } | null = null) {
  let inscricoes = 0;
  let cancelamentos = 0;
  let leituras = 0;
  let callbackAtual: ((evento: string, sessao: { user: User; access_token?: string } | null) => void) | null = null;
  let sessaoAtual = sessaoInicial;

  const cliente: ClienteAuthSessao = {
    auth: {
      async getSession() {
        leituras++;
        return { data: { session: sessaoAtual } };
      },
      onAuthStateChange(cb) {
        inscricoes++;
        callbackAtual = cb;
        return {
          data: {
            subscription: {
              unsubscribe() {
                cancelamentos++;
                if (callbackAtual === cb) callbackAtual = null;
              }
            }
          }
        };
      }
    }
  };

  return {
    cliente,
    stats: () => ({ inscricoes, cancelamentos, leituras }),
    definirSessao(sessao: { user: User; access_token?: string } | null) {
      sessaoAtual = sessao;
    },
    emitir(evento: string, sessao: { user: User; access_token?: string } | null) {
      sessaoAtual = sessao;
      callbackAtual?.(evento, sessao);
    }
  };
}

describe('useSessao: assinatura única de onAuthStateChange e ciclo de vida', () => {
  it('compartilha uma única assinatura onAuthStateChange entre múltiplos assinantes e navegações', async () => {
    const falso = criarClienteFalso({ user: usuarioA, access_token: 'tok-1' });
    let validacoes = 0;
    const loja = obterLojaSessao(falso.cliente, async () => {
      validacoes++;
      return usuarioA;
    });

    const notificacoes: number[] = [0, 0, 0];
    const des1 = loja.assinar(() => notificacoes[0]++);
    const des2 = loja.assinar(() => notificacoes[1]++);
    const des3 = loja.assinar(() => notificacoes[2]++);

    await new Promise(r => setTimeout(r, 10));

    assert.equal(falso.stats().inscricoes, 1);
    assert.equal(validacoes, 1);
    assert.equal(loja.ler().usuario?.id, usuarioA.id);
    assert.equal(loja.ler().carregando, false);
    assert.equal(loja.ler().contaDisponivel, true);

    // Múltiplos hooks reportam a mesma rota inicial sem revalidar de novo
    loja.aoNavegar('/');
    loja.aoNavegar('/');
    loja.aoNavegar('/');
    await new Promise(r => setTimeout(r, 10));
    assert.equal(validacoes, 1);
    assert.equal(falso.stats().inscricoes, 1);

    // Troca de rota revalida uma única vez sem recriar assinatura e sem zerar o usuário
    loja.aoNavegar('/meu-espaco');
    loja.aoNavegar('/meu-espaco');
    loja.aoNavegar('/meu-espaco');
    assert.equal(loja.ler().usuario?.id, usuarioA.id);
    await new Promise(r => setTimeout(r, 10));
    assert.equal(validacoes, 2);
    assert.equal(falso.stats().inscricoes, 1);
    assert.equal(falso.stats().cancelamentos, 0);

    // Simula unmount/remount do React StrictMode sem recriar a assinatura singleton
    des1();
    des2();
    des3();
    const des4 = loja.assinar(() => {});
    assert.equal(falso.stats().inscricoes, 1);
    assert.equal(falso.stats().cancelamentos, 0);
    des4();
    loja.destruir();
    assert.equal(falso.stats().cancelamentos, 1);
  });

  it('retorna a mesma instância singleton por cliente Supabase em obterLojaSessao', () => {
    const falso1 = criarClienteFalso();
    const falso2 = criarClienteFalso();
    const a = obterLojaSessao(falso1.cliente);
    const b = obterLojaSessao(falso1.cliente);
    const c = obterLojaSessao(falso2.cliente);
    assert.equal(a, b);
    assert.notEqual(a, c);
    a.destruir();
    c.destruir();
  });

  it('SIGNED_OUT zera o usuário na hora e ignora verificação antiga ainda em voo', async () => {
    const falso = criarClienteFalso({ user: usuarioA, access_token: 'tok-1' });
    let resolverValidacao!: (u: User | null) => void;
    const loja = criarLojaSessao(
      falso.cliente,
      () =>
        new Promise<User | null>(resolve => {
          resolverValidacao = resolve;
        })
    );

    const des = loja.assinar(() => {});
    assert.equal(loja.ler().carregando, true);

    falso.emitir('SIGNED_OUT', null);
    assert.equal(loja.ler().usuario, null);
    assert.equal(loja.ler().carregando, false);

    // A resposta atrasada da verificação anterior não pode ressuscitar o usuário deslogado
    resolverValidacao(usuarioA);
    await new Promise(r => setTimeout(r, 10));
    assert.equal(loja.ler().usuario, null);

    des();
    loja.destruir();
  });

  it('SIGNED_IN agenda revalidação fora do callback e atualiza o usuário', async () => {
    const falso = criarClienteFalso(null);
    let deveAutenticar = false;
    const loja = criarLojaSessao(falso.cliente, async () => (deveAutenticar ? usuarioA : null));

    const des = loja.assinar(() => {});
    await new Promise(r => setTimeout(r, 10));
    assert.equal(loja.ler().usuario, null);
    assert.equal(loja.ler().carregando, false);

    deveAutenticar = true;
    falso.emitir('SIGNED_IN', { user: usuarioA, access_token: 'tok-novo' });
    await new Promise(r => setTimeout(r, 20));
    assert.equal(loja.ler().usuario?.id, usuarioA.id);
    assert.equal(loja.ler().carregando, false);

    des();
    loja.destruir();
  });

  it('INITIAL_SESSION com sessão não duplica verificação inicial já em voo', async () => {
    const falso = criarClienteFalso({ user: usuarioA, access_token: 'tok-1' });
    let validacoes = 0;
    const loja = criarLojaSessao(falso.cliente, async () => {
      validacoes++;
      await new Promise(r => setTimeout(r, 15));
      return usuarioA;
    });

    const des = loja.assinar(() => {});
    falso.emitir('INITIAL_SESSION', { user: usuarioA, access_token: 'tok-1' });
    await new Promise(r => setTimeout(r, 35));

    assert.equal(validacoes, 1);
    assert.equal(loja.ler().usuario?.id, usuarioA.id);
    assert.equal(loja.ler().carregando, false);

    des();
    loja.destruir();
  });

  it('sem cliente Supabase informa contaDisponivel=false e carregando=false ao assinar', () => {
    const loja = criarLojaSessao(null);
    assert.deepEqual(loja.ler(), { usuario: null, carregando: true, contaDisponivel: false });
    let notificacoes = 0;
    const des = loja.assinar(() => notificacoes++);
    assert.deepEqual(loja.ler(), { usuario: null, carregando: false, contaDisponivel: false });
    assert.equal(notificacoes, 1);
    des();
    loja.destruir();
  });

  it('em SSR renderiza estado inicial seguro sem chamar onAuthStateChange', () => {
    let capturado: ReturnType<typeof useSessao> | undefined;
    function Probe() {
      capturado = useSessao();
      return createElement('span', null, capturado.carregando ? 'carregando' : 'pronto');
    }
    const html = renderToString(createElement(Probe));
    assert.equal(html, '<span>carregando</span>');
    assert.deepEqual(capturado, { usuario: null, carregando: true, contaDisponivel: false });
  });
});
