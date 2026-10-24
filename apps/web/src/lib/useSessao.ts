'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { usePathname } from 'next/navigation';
import { obterSupabase } from './supabase/client';
import { lerSessaoValidada } from './sessaoValidada';

/** Usuário verificado pelo servidor (ou null). Cache local sozinho não autoriza navegação. */
export function useSessao(): { usuario: User | null; carregando: boolean; contaDisponivel: boolean } {
  const caminho = usePathname();
  const [usuario, setUsuario] = useState<User | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [disponivel, setDisponivel] = useState(false);

  useEffect(() => {
    setUsuario(null);
    setCarregando(true);
    const sb = obterSupabase();
    if (!sb) {
      setCarregando(false);
      return;
    }
    setDisponivel(true);
    let ativo = true;
    let geracao = 0;
    let agendado: ReturnType<typeof setTimeout> | undefined;
    const verificar = () => {
      const atual = ++geracao;
      void lerSessaoValidada(() => sb.auth.getSession()).then(usuario => {
        if (!ativo || atual !== geracao) return;
        setUsuario(usuario);
        setCarregando(false);
      });
    };
    verificar();
    const { data: inscricao } = sb.auth.onAuthStateChange((_evento, sessao) => {
      ++geracao;
      setUsuario(null);
      setCarregando(!!sessao);
      clearTimeout(agendado);
      // Fora do callback do Auth: getSession dentro dele pode aguardar o mesmo lock.
      if (sessao) agendado = setTimeout(verificar, 0);
    });
    return () => {
      ativo = false;
      clearTimeout(agendado);
      inscricao.subscription.unsubscribe();
    };
  }, [caminho]);

  return { usuario, carregando, contaDisponivel: disponivel };
}
