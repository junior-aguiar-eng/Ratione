'use client';

import { useCallback, useState } from 'react';
import { salvarRegistro, type NovoRegistro } from './historico';
import { estadoAposSalvar, type EstadoSalvar } from './rotuloSalvar';

/** Botão "Salvar em Meu espaço": mostra "salvo" por 2 s e, se a conta estiver cheia, avisa por 5 s (o item não foi guardado). */
export function useSalvar(): { estado: EstadoSalvar; salvar: (r: NovoRegistro) => void } {
  const [estado, setEstado] = useState<EstadoSalvar>('ocioso');
  const salvar = useCallback((r: NovoRegistro) => {
    void salvarRegistro(r).then(destino => {
      const proximo = estadoAposSalvar(destino);
      setEstado(proximo.estado);
      setTimeout(() => setEstado('ocioso'), proximo.ms);
    });
  }, []);
  return { estado, salvar };
}
