'use client';

import { useEffect, useSyncExternalStore } from 'react';
import type { User } from '@supabase/supabase-js';
import { usePathname } from 'next/navigation';
import { obterSupabase } from './supabase/client';
import { lerSessaoValidada, limparCacheSessaoValidada } from './sessaoValidada';

export interface EstadoSessao {
  usuario: User | null;
  carregando: boolean;
  contaDisponivel: boolean;
}

export interface ClienteAuthSessao {
  auth: {
    getSession: () => Promise<{ data: { session: { user: User; access_token?: string } | null } }>;
    onAuthStateChange: (
      callback: (evento: string, sessao: { user: User; access_token?: string } | null) => void
    ) => { data: { subscription: { unsubscribe: () => void } } };
  };
}

export interface LojaSessao {
  assinar: (ouvinte: () => void) => () => void;
  ler: () => EstadoSessao;
  aoNavegar: (caminho: string | null) => void;
  revalidar: () => void;
  destruir: () => void;
}

const ESTADO_INICIAL: EstadoSessao = { usuario: null, carregando: true, contaDisponivel: false };
const lojasPorCliente = new WeakMap<ClienteAuthSessao, LojaSessao>();
let lojaAtiva: LojaSessao | null = null;

/** Cria uma loja de sessão compartilhada com no máximo uma assinatura `onAuthStateChange` por cliente. */
export function criarLojaSessao(
  sb: ClienteAuthSessao | null,
  validar?: () => Promise<User | null>,
  aoDestruir?: () => void
): LojaSessao {
  let estado: EstadoSessao = ESTADO_INICIAL;
  let iniciada = false;
  let destruida = false;
  let geracao = 0;
  let emVoo = false;
  let agendado: ReturnType<typeof setTimeout> | undefined;
  let inscricao: { unsubscribe: () => void } | null = null;
  let ultimoCaminho: string | null | undefined;
  const ouvintes = new Set<() => void>();

  const avisar = () => {
    ouvintes.forEach(f => f());
  };

  const definirEstado = (usuario: User | null, carregando: boolean, contaDisponivel: boolean) => {
    if (
      estado.usuario === usuario &&
      estado.carregando === carregando &&
      estado.contaDisponivel === contaDisponivel
    ) {
      return;
    }
    estado = { usuario, carregando, contaDisponivel };
    avisar();
  };

  const validarSessao = validar ?? (() => lerSessaoValidada(() => sb!.auth.getSession()));

  const verificar = () => {
    if (!sb || destruida) return;
    const atual = ++geracao;
    emVoo = true;
    void validarSessao().then(
      usuario => {
        if (destruida || atual !== geracao) return;
        emVoo = false;
        definirEstado(usuario, false, true);
      },
      () => {
        if (destruida || atual !== geracao) return;
        emVoo = false;
        definirEstado(null, false, true);
      }
    );
  };

  const iniciar = () => {
    if (iniciada || destruida) return;
    iniciada = true;
    if (!sb) {
      definirEstado(null, false, false);
      return;
    }
    definirEstado(estado.usuario, true, true);
    const { data } = sb.auth.onAuthStateChange((evento, sessao) => {
      if (destruida) return;
      if (!sessao) {
        ++geracao;
        emVoo = false;
        clearTimeout(agendado);
        limparCacheSessaoValidada();
        definirEstado(null, false, true);
        return;
      }
      if (evento === 'INITIAL_SESSION') {
        if (!emVoo && !estado.usuario) {
          clearTimeout(agendado);
          agendado = setTimeout(verificar, 0);
        }
        return;
      }
      ++geracao;
      emVoo = false;
      clearTimeout(agendado);
      if (evento === 'SIGNED_IN' || evento === 'TOKEN_REFRESHED') {
        limparCacheSessaoValidada();
      }
      // O Auth também avisa ao voltar para a aba ou renovar o token: quem já foi validado fica na tela enquanto o servidor confirma de novo.
      // Fora do callback do Auth: getSession dentro dele pode aguardar o mesmo lock.
      agendado = setTimeout(verificar, 0);
    });
    inscricao = data.subscription;
    clearTimeout(agendado);
    verificar();
  };

  return {
    assinar(ouvinte) {
      ouvintes.add(ouvinte);
      if (!iniciada) iniciar();
      return () => {
        ouvintes.delete(ouvinte);
      };
    },
    ler: () => estado,
    aoNavegar(caminho) {
      if (!iniciada || destruida || !sb) return;
      if (ultimoCaminho === undefined) {
        ultimoCaminho = caminho;
        return;
      }
      if (ultimoCaminho === caminho) return;
      ultimoCaminho = caminho;
      clearTimeout(agendado);
      verificar();
    },
    revalidar() {
      if (!iniciada || destruida || !sb) return;
      clearTimeout(agendado);
      verificar();
    },
    destruir() {
      if (destruida) return;
      destruida = true;
      clearTimeout(agendado);
      agendado = undefined;
      inscricao?.unsubscribe();
      inscricao = null;
      ouvintes.clear();
      aoDestruir?.();
    }
  };
}

/** Retorna a loja singleton associada a um cliente Supabase do navegador. */
export function obterLojaSessao(sb: ClienteAuthSessao, validar?: () => Promise<User | null>): LojaSessao {
  let loja = lojasPorCliente.get(sb);
  if (!loja) {
    loja = criarLojaSessao(sb, validar, () => {
      if (lojasPorCliente.get(sb) === loja) lojasPorCliente.delete(sb);
    });
    lojasPorCliente.set(sb, loja);
  }
  return loja;
}

const lerServidor = () => ESTADO_INICIAL;
const lerCliente = () => (lojaAtiva ? lojaAtiva.ler() : ESTADO_INICIAL);

function assinarSessao(ouvinte: () => void): () => void {
  if (!lojaAtiva) {
    const sb = obterSupabase();
    lojaAtiva = sb ? obterLojaSessao(sb) : criarLojaSessao(null);
  }
  return lojaAtiva.assinar(ouvinte);
}

/** Usuário verificado pelo servidor (ou null). Cache local sozinho não autoriza navegação. */
export function useSessao(): EstadoSessao {
  const caminho = usePathname();
  const estado = useSyncExternalStore(assinarSessao, lerCliente, lerServidor);

  useEffect(() => {
    lojaAtiva?.aoNavegar(caminho);
  }, [caminho]);

  return estado;
}
