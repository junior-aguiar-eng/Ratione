'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CalendarClock } from 'lucide-react';
import { CATALOGO_PRAZOS } from '@ratione/prazozero';
import { buttonVariants } from '@/components/ui/button';
import { NativeSelect } from '@/components/ui/native-select';
import { urlDoPrazoDoCaso } from '../lib/caso/ligacao';
import { cn } from '@/lib/utils';

/** Os atos que fazem sentido depois de uma decisão: recursos e embargos. Contestação, réplica e prazos materiais ficam de fora. */
const GRUPOS = ['Cível: recursos', 'Trabalhista', 'Criminal', 'Juizados Especiais'] as const;

/**
 * "Prazo para recorrer", na análise da decisão: a pessoa escolhe o recurso e abre o PrazoZero com o ato já escolhido e o caso junto.
 * Nada é sugerido nem escolhido por ela: o recurso cabível depende da matéria e do tribunal, e quem sabe é quem lê a decisão.
 */
export default function PrazoDoCaso() {
  const [atoId, setAtoId] = useState('');
  const atos = CATALOGO_PRAZOS.filter(p => p.natureza === 'processual' && (GRUPOS as readonly string[]).includes(p.grupo));

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-line bg-surface px-4 py-3 shadow-card no-print" data-testid="prazo-do-caso" role="group" aria-label="Prazo do recurso">
      <span className="inline-flex items-center gap-2 text-sm font-medium text-ink">
        <CalendarClock className="w-4 h-4 text-brand-text" aria-hidden />
        Prazo do recurso
      </span>
      <NativeSelect id="ato-do-caso" aria-label="Recurso a calcular" value={atoId} onChange={e => setAtoId(e.target.value)} className="w-auto min-w-64 max-w-full">
        <option value="">Escolha o recurso…</option>
        {GRUPOS.map(g => (
          <optgroup key={g} label={g}>
            {atos
              .filter(p => p.grupo === g)
              .map(p => (
                <option key={p.id} value={p.id}>
                  {p.ato} · {p.dias} dias
                </option>
              ))}
          </optgroup>
        ))}
      </NativeSelect>
      <Link
        href={urlDoPrazoDoCaso(atoId)}
        aria-disabled={!atoId}
        tabIndex={atoId ? 0 : -1}
        onClick={e => {
          if (!atoId) e.preventDefault();
        }}
        className={cn(buttonVariants({ variant: 'secondary' }), !atoId && 'pointer-events-none opacity-50')}
      >
        Calcular o prazo
      </Link>
    </div>
  );
}
