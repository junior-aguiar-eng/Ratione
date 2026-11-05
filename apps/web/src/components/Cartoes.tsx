import * as React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Os três cartões do Ratione, cada um para um tipo de conteúdo (docs/produto/DESIGN_SYSTEM.md, "Cartões por tipo de conteúdo"):
 * - `CartaoDeLeitura`: a fonte oficial (texto da lei, da decisão). Branco, de "papel", com o texto em serifa. É o que vale.
 * - `CartaoDeIA`: o que a IA gerou. Tom lilás e um passo de elevação acima, para nunca se confundir com o texto oficial.
 * - `CartaoDeContexto`: o que acompanha a leitura (histórico, remissões, fonte). Pequeno e neutro, para a coluna lateral.
 * Cor só por token; a elevação vem de `shadow-card` e `shadow-float`.
 */

export function CartaoDeLeitura({ className, ...props }: React.ComponentProps<'article'>) {
  return <article data-slot="cartao-de-leitura" className={cn('bg-surface border border-line rounded-xl shadow-card p-5 sm:p-7 flex flex-col gap-6', className)} {...props} />;
}

interface CartaoDeIAProps extends React.ComponentProps<'section'> {
  titulo: string;
  /** Texto curto à direita do título (por exemplo, quantas ainda restam na cota). */
  meta?: React.ReactNode;
  /** Recua o cartão para a direita no computador, ligado ao texto acima sem se misturar a ele. */
  deslocado?: boolean;
}

export function CartaoDeIA({ titulo, meta, deslocado = true, className, children, ...props }: CartaoDeIAProps) {
  return (
    <section
      data-slot="cartao-de-ia"
      className={cn(
        'bg-ia-tint border border-ia/30 border-b-2 border-b-ia/50 rounded-xl shadow-float p-5 flex flex-col gap-3',
        deslocado && 'md:ml-6',
        className
      )}
      {...props}
    >
      <header className="flex flex-wrap items-center gap-2 text-ia-text font-medium">
        <Sparkles className="w-4 h-4 shrink-0" aria-hidden />
        <h3 className="text-sm font-semibold">{titulo}</h3>
        {meta && <span className="ml-auto text-xs font-normal">{meta}</span>}
      </header>
      {children}
    </section>
  );
}

interface CartaoDeContextoProps extends Omit<React.ComponentProps<'section'>, 'title'> {
  titulo: string;
  icone?: React.ReactNode;
}

export function CartaoDeContexto({ titulo, icone, className, children, ...props }: CartaoDeContextoProps) {
  return (
    <section data-slot="cartao-de-contexto" className={cn('bg-surface/85 border border-line rounded-lg shadow-card p-4 flex flex-col gap-3', className)} {...props}>
      <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
        {icone && <span className="text-ink-mute [&>svg]:w-4 [&>svg]:h-4" aria-hidden>{icone}</span>}
        {titulo}
      </h3>
      {children}
    </section>
  );
}
