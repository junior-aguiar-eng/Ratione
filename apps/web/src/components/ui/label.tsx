'use client';

import * as React from 'react';
import { Label as LabelPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

const rotuloClasses = 'block text-sm font-medium text-foreground mb-1.5';

function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return <LabelPrimitive.Root data-slot="label" className={cn(rotuloClasses, className)} {...props} />;
}

/** Título de um grupo de campos (`<fieldset>`): mesmo aspecto do `Label`. */
function Legend({ className, ...props }: React.ComponentProps<'legend'>) {
  return <legend data-slot="legend" className={cn(rotuloClasses, className)} {...props} />;
}

export { Label, Legend };
