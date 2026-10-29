'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { SupabaseClient } from '@supabase/supabase-js';
import { classeDoChip } from '../../components/LigacoesDoPrazo';
import { precedentesQueCitam, prazosDoDispositivo, type Ligacao, type PrecedentesQueCitam } from '../../lib/ligacoes';

function Grupo({ titulo, itens }: { titulo: string; itens: Ligacao[] }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-ink-soft">{titulo}</p>
      <ul className="flex flex-wrap gap-2">
        {itens.map(l => (
          <li key={l.href}>
            <Link href={l.href} className={classeDoChip}>
              {l.rotulo}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * O dispositivo nas outras ferramentas: os prazos do PrazoZero que ele fundamenta e os precedentes e súmulas do TeseMap que o citam.
 * Só aparece quando há algo a mostrar; a falta de ligação não quer dizer que não exista (a base cobre uma parte dos precedentes).
 */
export default function LigacoesDoDispositivo({ dispositivoId, db }: { dispositivoId: string; db: SupabaseClient }) {
  const prazos = prazosDoDispositivo(dispositivoId);
  const [precedentes, setPrecedentes] = useState<PrecedentesQueCitam>({ itens: [], temMais: false });

  useEffect(() => {
    let ativo = true;
    setPrecedentes({ itens: [], temMais: false });
    void precedentesQueCitam(db, dispositivoId).then(l => {
      if (ativo) setPrecedentes(l);
    });
    return () => {
      ativo = false;
    };
  }, [db, dispositivoId]);

  if (prazos.length === 0 && precedentes.itens.length === 0) return null;
  return (
    <section className="border-t border-line pt-6" aria-labelledby="nas-outras-ferramentas">
      <h3 id="nas-outras-ferramentas" className="font-serif text-xl font-semibold text-ink mb-3">
        Nas outras ferramentas
      </h3>
      <div className="flex flex-col gap-4">
        {prazos.length > 0 && <Grupo titulo="Prazos que este dispositivo fundamenta, no PrazoZero:" itens={prazos} />}
        {precedentes.itens.length > 0 && (
          <Grupo
            titulo={`Precedentes e súmulas que o citam, no TeseMap${precedentes.temMais ? ` (os primeiros ${precedentes.itens.length}; há outros)` : ''}:`}
            itens={precedentes.itens}
          />
        )}
      </div>
    </section>
  );
}
