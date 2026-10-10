'use client';

import React from 'react';
import Notice from '../components/Notice';
import { Button, buttonVariants } from '@/components/ui/button';

/** Erro numa página: o servidor já registrou o detalhe; aqui só orientamos quem usa. */
export default function Erro({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="font-serif text-3xl font-semibold text-ink">Algo deu errado</h1>
      <Notice tom="danger" titulo="Não foi possível concluir esta ação.">
        O erro foi registrado. Tente de novo; se persistir, volte à página inicial.
        {error.digest && (
          <>
            {' '}
            Código para suporte: <span className="font-mono">{error.digest}</span>.
          </>
        )}
      </Notice>
      <div className="flex gap-3">
        <Button type="button" onClick={reset}>
          Tentar de novo
        </Button>
        <a href="/" className={buttonVariants({ variant: 'secondary' })}>
          Página inicial
        </a>
      </div>
    </div>
  );
}
