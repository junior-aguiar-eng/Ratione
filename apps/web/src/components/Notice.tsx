import React from 'react';
import { Info, AlertTriangle } from 'lucide-react';

type Tom = 'info' | 'warn' | 'danger';

const ESTILOS: Record<Tom, string> = {
  info: 'bg-info-tint text-info-text border-info/30',
  warn: 'bg-warn-tint text-warn-text border-warn/40',
  danger: 'bg-danger-tint text-danger-text border-danger/40'
};

export default function Notice({
  tom = 'info',
  titulo,
  children
}: {
  tom?: Tom;
  titulo?: string;
  children: React.ReactNode;
}) {
  const Icone = tom === 'info' ? Info : AlertTriangle;
  return (
    <div role="note" className={`flex gap-3 rounded-lg border p-4 text-sm leading-relaxed ${ESTILOS[tom]}`}>
      <Icone className="w-[18px] h-[18px] shrink-0 mt-0.5" aria-hidden />
      <div className="space-y-1">
        {titulo && <p className="font-semibold">{titulo}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}
