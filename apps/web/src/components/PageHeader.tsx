import React from 'react';

interface Props {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({ eyebrow, title, description, actions }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 pb-7 mb-8 border-b border-line">
      <div className="space-y-2 max-w-2xl">
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-ink">{title}</h1>
        {description && <p className="text-base text-ink-soft leading-relaxed">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 no-print">{actions}</div>}
    </div>
  );
}
