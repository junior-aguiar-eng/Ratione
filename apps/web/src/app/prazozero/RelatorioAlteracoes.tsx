'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import type { RelatorioAlteracoes as Relatorio } from '@ratione/prazozero';
import { dataCurta, diaDaSemana } from '../../lib/datas';

export default function RelatorioAlteracoes({ relatorio }: { relatorio: Relatorio }) {
  const comData = relatorio.itens.filter(i => i.dataSeAplicar);
  const semData = relatorio.itens.filter(i => !i.dataSeAplicar);

  return (
    <details className="group border border-line rounded-lg">
      <summary className="flex items-center justify-between gap-3 cursor-pointer list-none px-4 py-3 text-sm font-medium text-ink hover:bg-surface-2 rounded-lg">
        <span>
          O que pode alterar este prazo
          <span className="block text-sm font-normal text-ink-mute mt-0.5">
            {comData.length} {comData.length === 1 ? 'situação muda' : 'situações mudam'} a data; {semData.length} dependem de fatos do caso
          </span>
        </span>
        <ChevronDown className="w-4 h-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
      </summary>

      <div className="px-4 pb-5 pt-1 space-y-6 text-sm">
        <p className="text-ink-soft">
          Nada abaixo muda o prazo final mostrado ({dataCurta(relatorio.dataVencimentoFinal)}). São situações que o cálculo não conhece ou ainda não
          confirmou. Confira cada uma antes de contar com uma data diferente.
        </p>

        {comData.length > 0 && (
          <section>
            <h3 className="font-semibold text-ink mb-2">Mudam a data</h3>
            <ul className="space-y-4">
              {comData.map(i => (
                <li key={i.id} className="space-y-1">
                  <p className="font-medium text-ink">
                    {i.titulo}: <span className="num">{dataCurta(i.dataSeAplicar!)}</span>{' '}
                    <span className="font-normal text-ink-mute">({diaDaSemana(i.dataSeAplicar!)})</span>
                  </p>
                  <p className="text-ink-soft leading-snug">{i.descricao}</p>
                  <p className="text-xs text-ink-mute">{i.fundamentoLegal}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {semData.length > 0 && (
          <section>
            <h3 className="font-semibold text-ink mb-2">Dependem de fatos do caso</h3>
            <ul className="space-y-4">
              {semData.map(i => (
                <li key={i.id} className="space-y-1">
                  <p className="font-medium text-ink">{i.titulo}</p>
                  <p className="text-ink-soft leading-snug">{i.descricao}</p>
                  <p className="text-xs text-ink-mute">{i.fundamentoLegal}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </details>
  );
}
