import React from 'react';
import { RESPONSAVEL, VERSAO_TEXTOS, VIGENCIA_TEXTOS } from '../lib/legal';
import { dataCurta } from '../lib/datas';

/** Estrutura das páginas jurídicas: seções numeradas, lista e a linha de versão. */
export function Documento({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-10 text-base text-ink-soft leading-relaxed">{children}</div>;
}

export function Secao({ numero, titulo, id, children }: { numero: number; titulo: string; id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="flex flex-col gap-3 scroll-mt-24">
      <h2 className="font-serif text-2xl font-semibold text-ink">
        {numero}. {titulo}
      </h2>
      {children}
    </section>
  );
}

export function Lista({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc pl-5 flex flex-col gap-2">{children}</ul>;
}

export function Destaque({ children }: { children: React.ReactNode }) {
  return <strong className="text-ink">{children}</strong>;
}

export function LinhaDeVersao() {
  return (
    <p className="text-sm text-ink-mute">
      Versão {VERSAO_TEXTOS} · em vigor desde {dataCurta(VIGENCIA_TEXTOS)}
    </p>
  );
}

export function ContatoDoResponsavel() {
  return (
    <a href={`mailto:${RESPONSAVEL.email}`} className="text-brand-text underline underline-offset-2">
      {RESPONSAVEL.email}
    </a>
  );
}
