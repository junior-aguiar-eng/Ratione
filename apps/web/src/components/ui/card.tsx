import * as React from 'react';

import { cn } from '@/lib/utils';

/** Para dar o visual de card a outra tag (`<form>`, `<aside>`): `className={cn(cardClasses, 'p-6')}`. */
const cardClasses = 'bg-card text-card-foreground border rounded-lg';

/** Superfície com borda. O espaçamento interno fica por conta de quem usa (`p-5`, `p-6`) ou de `CardContent`. */
function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card" className={cn(cardClasses, className)} {...props} />;
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-header" className={cn('flex flex-col gap-1.5 p-6 pb-0', className)} {...props} />;
}

function CardTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return <h3 data-slot="card-title" className={cn('font-serif text-xl font-semibold text-foreground', className)} {...props} />;
}

function CardDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p data-slot="card-description" className={cn('text-sm text-muted-foreground leading-relaxed', className)} {...props} />;
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('p-6', className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-footer" className={cn('flex items-center p-6 pt-0', className)} {...props} />;
}

export { Card, cardClasses, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
