import React from 'react';
import { Info, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Tom = 'info' | 'warn' | 'danger';

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
    <Alert role="note" variant={tom}>
      <Icone className="w-[18px] h-[18px] shrink-0 mt-0.5" aria-hidden />
      <div className="space-y-1">
        {titulo && <AlertTitle>{titulo}</AlertTitle>}
        <AlertDescription>{children}</AlertDescription>
      </div>
    </Alert>
  );
}
