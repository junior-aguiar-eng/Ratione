import React from 'react';

export default function EmptyState({
  titulo,
  children,
  acao
}: {
  titulo: string;
  children?: React.ReactNode;
  acao?: React.ReactNode;
}) {
  return (
    <div className="py-14 text-center space-y-3">
      <h3 className="font-serif text-xl font-semibold text-ink">{titulo}</h3>
      {children && <p className="text-sm text-ink-soft max-w-md mx-auto leading-relaxed">{children}</p>}
      {acao && <div className="pt-2">{acao}</div>}
    </div>
  );
}
