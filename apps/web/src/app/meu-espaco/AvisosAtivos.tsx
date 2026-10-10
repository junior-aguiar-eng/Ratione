'use client';

import React, { useEffect, useState } from 'react';
import { BellRing, Trash2 } from 'lucide-react';
import { useSessao } from '../../lib/useSessao';
import { dataCurta, diaDaSemana, hojeIso } from '../../lib/datas';
import { cancelarLembrete, listarLembretes } from '../../lib/lembretes-cliente';
import type { Lembrete } from '../../lib/lembretes';

/** Avisos por e-mail ainda por vir (F2-10), com o botão de cancelar. Só aparece para quem tem conta e ao menos um aviso. */
export default function AvisosAtivos() {
  const { usuario } = useSessao();
  const [avisos, setAvisos] = useState<Lembrete[] | null>(null);

  useEffect(() => {
    if (!usuario) return;
    let ativo = true;
    void listarLembretes().then(l => {
      if (ativo) setAvisos(l.filter(a => a.vencimento >= hojeIso()));
    });
    return () => {
      ativo = false;
    };
  }, [usuario]);

  if (!usuario || !avisos || avisos.length === 0) return null;

  const cancelar = async (id: string) => {
    if (await cancelarLembrete(id)) setAvisos(atuais => (atuais ?? []).filter(a => a.id !== id));
  };

  return (
    <section className="mb-8" aria-labelledby="avisos-email">
      <h2 id="avisos-email" className="font-serif text-xl font-semibold text-ink flex items-center gap-2">
        <BellRing className="w-5 h-5" aria-hidden />
        Avisos por e-mail
      </h2>
      <ul className="divide-y divide-line border-y border-line mt-3">
        {avisos.map(a => (
          <li key={a.id} className="flex items-start justify-between gap-4 py-4">
            <div className="min-w-0 space-y-0.5">
              <p className="text-base font-medium text-ink">{a.titulo}</p>
              <p className="text-sm text-ink-soft">
                Vence em {diaDaSemana(a.vencimento)}, {dataCurta(a.vencimento)}
                {a.tribunal ? ` · ${a.tribunal}` : ''}
              </p>
              <p className="text-sm text-ink-mute">
                {[a.avisar_3_dias ? (a.enviado_3_dias_em ? '3 dias antes (enviado)' : '3 dias antes') : null, a.avisar_1_dia ? (a.enviado_1_dia_em ? '1 dia antes (enviado)' : '1 dia antes') : null]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void cancelar(a.id)}
              aria-label={`Cancelar o aviso ${a.titulo}`}
              className="p-2 rounded-md text-ink-mute hover:text-danger-text hover:bg-danger-tint transition-colors shrink-0"
            >
              <Trash2 className="w-[18px] h-[18px]" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
