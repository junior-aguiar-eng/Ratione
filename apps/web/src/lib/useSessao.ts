'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { obterSupabase } from './supabase/client';

/** Usuário logado (ou `null`). `carregando` é verdadeiro até a primeira leitura da sessão. */
export function useSessao(): { usuario: User | null; carregando: boolean; contaDisponivel: boolean } {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [disponivel, setDisponivel] = useState(false);

  useEffect(() => {
    const sb = obterSupabase();
    if (!sb) {
      setCarregando(false);
      return;
    }
    setDisponivel(true);
    let ativo = true;
    sb.auth.getSession().then(({ data }) => {
      if (!ativo) return;
      setUsuario(data.session?.user ?? null);
      setCarregando(false);
    });
    const { data: inscricao } = sb.auth.onAuthStateChange((_evento, sessao) => {
      setUsuario(sessao?.user ?? null);
    });
    return () => {
      ativo = false;
      inscricao.subscription.unsubscribe();
    };
  }, []);

  return { usuario, carregando, contaDisponivel: disponivel };
}
