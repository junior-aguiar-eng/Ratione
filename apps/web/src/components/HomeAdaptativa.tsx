'use client';

import type { ReactNode } from 'react';
import PainelDoUsuario from './PainelDoUsuario';
import { useSessao } from '../lib/useSessao';
import { useNomeDoUsuario } from '../lib/useNomeDoUsuario';

/**
 * A página inicial muda conforme quem chega: quem está logado vê o painel (busca, prazos, recentes e ferramentas); quem não está, e enquanto a
 * sessão ainda é conferida, vê a apresentação do Ratione, que já vem pronta do servidor (`children`).
 */
export default function HomeAdaptativa({ children }: { children: ReactNode }) {
  const { usuario } = useSessao();
  const nome = useNomeDoUsuario(usuario);
  return usuario ? <PainelDoUsuario nome={nome} /> : <>{children}</>;
}
