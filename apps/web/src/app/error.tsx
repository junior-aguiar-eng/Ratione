'use client';

import React from 'react';
import Notice from '../components/Notice';

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
        <button type="button" onClick={reset} className="btn-primary">
          Tentar de novo
        </button>
        <a href="/" className="btn-secondary">
          Página inicial
        </a>
      </div>
    </div>
  );
}
