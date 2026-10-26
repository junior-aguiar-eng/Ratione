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
    // Sem zerar o usuário aqui: o cabeçalho continua montado entre páginas e não deve piscar "Entrar" a cada navegação enquanto revalida.
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
      clearTimeout(agendado);
      if (!sessao) {
        setUsuario(null);
        setCarregando(false);
        return;
      }
      // O Auth também avisa ao voltar para a aba ou renovar o token: quem já foi validado fica na tela enquanto o servidor confirma de novo.
      // Fora do callback do Auth: getSession dentro dele pode aguardar o mesmo lock.
      agendado = setTimeout(verificar, 0);
    });
    return () => {
      ativo = false;
      clearTimeout(agendado);
      inscricao.subscription.unsubscribe();
    };
  }, [caminho]);

  return { usuario, carregando, contaDisponivel: disponivel };
}
