'use client';

import React from 'react';

/** Erro no próprio layout: substitui a página inteira, então precisa trazer <html> e <body> e não depende do CSS do app. */
export default function ErroGlobal({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 560, margin: '4rem auto', padding: '0 1.25rem', lineHeight: 1.6 }}>
        <h1>Algo deu errado</h1>
        <p>O erro foi registrado. Tente de novo; se persistir, volte à página inicial.</p>
        {error.digest && <p>Código para suporte: {error.digest}</p>}
        <button type="button" onClick={reset} style={{ padding: '0.5rem 1rem', marginRight: '0.75rem' }}>
          Tentar de novo
        </button>
        <a href="/">Página inicial</a>
      </body>
    </html>
  );
}
