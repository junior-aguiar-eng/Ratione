'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { obterSupabase } from './supabase/client';
import { EVENTO_PERFIL, nomeParaExibir } from './nomeDeExibicao';

/** Nome curto de quem está logado, para o cabeçalho: o perfil (se tiver nome) ou o começo do e-mail. Atualiza quando o perfil é salvo. */
export function useNomeDoUsuario(usuario: User | null): string | null {
  const [nomeDoPerfil, setNomeDoPerfil] = useState<string | null>(null);
  const usuarioId = usuario?.id;

  useEffect(() => {
    setNomeDoPerfil(null);
    const sb = obterSupabase();
    if (!sb || !usuarioId) return;
    let ativo = true;
    void sb
      .from('perfis')
      .select('nome')
      .eq('id', usuarioId)
      .maybeSingle()
      .then(({ data }) => {
        if (ativo) setNomeDoPerfil(data?.nome ?? null);
      });
    const aoSalvar = (e: Event) => setNomeDoPerfil((e as CustomEvent<string | null>).detail ?? null);
    window.addEventListener(EVENTO_PERFIL, aoSalvar);
    return () => {
      ativo = false;
      window.removeEventListener(EVENTO_PERFIL, aoSalvar);
    };
  }, [usuarioId]);

  return usuario ? nomeParaExibir(nomeDoPerfil, usuario.email) : null;
}

/** Quem salva o perfil avisa o cabeçalho, sem recarregar a página. */
export function avisarPerfilAtualizado(nome: string | null): void {
  window.dispatchEvent(new CustomEvent(EVENTO_PERFIL, { detail: nome }));
}
