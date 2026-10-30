'use client';

import { useState } from 'react';
import { Check, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Copia o endereço completo do cálculo (os parâmetros vão na URL): quem abre o link vê o mesmo cálculo, para mandar a um colega ou ao cliente.
 * O link leva só ato, data, tribunal e as opções marcadas; nenhum dado do processo.
 */
export default function BotaoCopiarLink({ caminho, rotulo = 'Copiar link do cálculo' }: { caminho: string; rotulo?: string }) {
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(new URL(caminho, window.location.origin).toString());
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // área de transferência indisponível
    }
  };

  return (
    <Button variant="secondary" type="button" onClick={copiar}>
      {copiado ? <Check className="w-4 h-4 text-ok-text" /> : <Link2 className="w-4 h-4" />}
      {copiado ? 'Link copiado' : rotulo}
    </Button>
  );
}
