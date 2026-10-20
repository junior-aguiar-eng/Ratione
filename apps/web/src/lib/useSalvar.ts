'use client';

import { useCallback, useState } from 'react';
import { salvarRegistro, type NovoRegistro } from './historico';

export type EstadoSalvar = 'ocioso' | 'salvo' | 'limite';

/** Botão "Salvar em Meu espaço": mostra "salvo" por 2 s e, se a conta estiver cheia, avisa por 5 s (o item não foi guardado). */
export function useSalvar(): { estado: EstadoSalvar; salvar: (r: NovoRegistro) => void } {
  const [estado, setEstado] = useState<EstadoSalvar>('ocioso');
  const salvar = useCallback((r: NovoRegistro) => {
    void salvarRegistro(r).then(destino => {
      const limite = destino === 'limite';
      setEstado(limite ? 'limite' : 'salvo');
      setTimeout(() => setEstado('ocioso'), limite ? 5000 : 2000);
    });
  }, []);
  return { estado, salvar };
}
