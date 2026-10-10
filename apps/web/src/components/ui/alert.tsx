import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const alertVariants = cva('flex gap-3 rounded-lg border p-4 text-sm leading-relaxed', {
  variants: {
    variant: {
      info: 'bg-info-tint text-info-text border-info/30',
      warn: 'bg-warn-tint text-warn-text border-warn/40',
      danger: 'bg-danger-tint text-danger-text border-danger/40'
    }
  },
  defaultVariants: {
    variant: 'info'
  }
});

/** `role="alert"` interrompe o leitor de tela; para avisos permanentes da página passe `role="note"`. */
function Alert({ className, variant, ...props }: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

function AlertTitle({ className, ...props }: React.ComponentProps<'p'>) {
  return <p data-slot="alert-title" className={cn('font-semibold', className)} {...props} />;
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="alert-description" className={className} {...props} />;
}

export { Alert, AlertTitle, AlertDescription, alertVariants };
