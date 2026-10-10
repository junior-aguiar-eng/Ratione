import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils';

/** Etiqueta de estado. Cada tom usa o par fundo/texto do tema, que mantém o contraste nos dois temas. */
const badgeVariants = cva('inline-flex w-fit items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium', {
  variants: {
    variant: {
      neutral: 'bg-surface-2 text-ink-soft',
      brand: 'bg-brand-tint text-brand-text',
      info: 'bg-info-tint text-info-text',
      ok: 'bg-ok-tint text-ok-text',
      warn: 'bg-warn-tint text-warn-text',
      danger: 'bg-danger-tint text-danger-text',
      rel: 'bg-rel-tint text-rel-text'
    }
  },
  defaultVariants: {
    variant: 'neutral'
  }
});

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span';

  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

type BadgeTom = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

export { Badge, badgeVariants, type BadgeTom };
