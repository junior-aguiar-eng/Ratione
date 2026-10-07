'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { lerHistorico, RegistroHistorico } from '../lib/historico';
import { tempoRelativo } from '../lib/datas';

/** Exibe somente registros reais do usuário; se não houver, não renderiza nada (plano §7.3). */
export default function RecentesHome() {
  const [itens, setItens] = useState<RegistroHistorico[]>([]);

  useEffect(() => {
    setItens(lerHistorico().slice(0, 4));
  }, []);

  if (itens.length === 0) return null;

  return (
    <section className="pt-14 border-t border-line" aria-labelledby="recentes">
      <div className="flex items-baseline justify-between mb-5">
        <h2 id="recentes" className="font-serif text-2xl font-semibold text-ink">
          Recentes
        </h2>
        <Link href="/meu-espaco" className="text-sm font-medium text-brand-text hover:underline underline-offset-2">
          Ver todos
        </Link>
      </div>
      <ul className="divide-y divide-line border-y border-line">
        {itens.map(item => (
          <li key={item.id}>
            <Link href={item.url} className="flex items-baseline justify-between gap-4 py-4 hover:bg-surface-2/60 px-2 -mx-2 rounded">
              <span className="text-base font-medium text-ink">{item.titulo}</span>
              <span className="text-sm text-ink-mute whitespace-nowrap">
                {item.modulo} · {tempoRelativo(item.criadoEm)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
