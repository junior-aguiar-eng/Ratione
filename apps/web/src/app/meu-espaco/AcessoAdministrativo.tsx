'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

/** O servidor decide. Uma resposta antiga nunca libera o atalho para outra conta. */
export default function AcessoAdministrativo({ usuarioId }: { usuarioId: string }) {
  const [autorizado, setAutorizado] = useState(false);
  useEffect(() => {
    const controle = new AbortController();
    let ativo = true;
    setAutorizado(false);
    void fetch('/api/admin/acesso', { cache: 'no-store', signal: controle.signal })
      .then(async resposta => {
        const dados = resposta.ok ? await resposta.json() : null;
        if (ativo) setAutorizado(dados?.administrador === true);
      })
      .catch(() => { if (ativo) setAutorizado(false); });
    return () => { ativo = false; controle.abort(); };
  }, [usuarioId]);
  if (!autorizado) return null;
  return <Link href="/meu-espaco/administracao" className={buttonVariants({ variant: 'secondary' })}>Painel administrativo</Link>;
}
