import * as React from 'react';

import { cn } from '@/lib/utils';

/** Classes do campo de formulário; o `NativeSelect` reaproveita as mesmas. */
const campoClasses =
  'w-full min-w-0 bg-card border border-input rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-ink-mute focus:outline-hidden focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:opacity-60 aria-invalid:border-danger aria-invalid:ring-danger/20';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return <input type={type} data-slot="input" className={cn(campoClasses, className)} {...props} />;
}

export { Input, campoClasses };
