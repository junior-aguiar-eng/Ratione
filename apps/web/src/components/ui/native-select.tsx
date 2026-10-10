import * as React from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { campoClasses } from '@/components/ui/input';

/**
 * Lista suspensa nativa (teclado, leitor de tela e seletor do celular de graça), no mesmo aspecto do `Input`.
 * Evita o `Select` do Radix, que troca o `<select>` por um menu próprio.
 */
function NativeSelect({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <div data-slot="native-select-wrapper" className="relative">
      <select data-slot="native-select" className={cn(campoClasses, 'appearance-none pr-9', className)} {...props} />
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-mute"
        aria-hidden
      />
    </div>
  );
}

export { NativeSelect };
