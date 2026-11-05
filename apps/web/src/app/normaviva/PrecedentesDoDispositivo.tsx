'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Scale } from 'lucide-react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { CartaoDeContexto } from '../../components/Cartoes';
import { Badge } from '@/components/ui/badge';
import { LIMITE_DE_PRECEDENTES, precedentesQueCitam, type PrecedentesQueCitam } from '../../lib/ligacoes';

/**
 * "Precedentes que citam este artigo": os temas, precedentes e súmulas do TeseMap cujo texto cita o dispositivo (ou o artigo que o contém),
 * cada um com a marca de vinculante e a prévia da tese, e o endereço para abrir no TeseMap. A lista é de citação expressa, montada
 * de dados já conferidos; nada é inferido por IA. Só aparece quando há o que mostrar.
 */
export default function PrecedentesDoDispositivo({ dispositivoId, db }: { dispositivoId: string; db: SupabaseClient }) {
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

  if (precedentes.itens.length === 0) return null;
  return (
    <CartaoDeContexto titulo="Precedentes que citam este artigo" icone={<Scale />} data-testid="precedentes-do-dispositivo">
      <ul className="flex flex-col divide-y divide-line">
        {precedentes.itens.map(p => (
          <li key={p.href} className="py-3 first:pt-0 last:pb-0">
            <Link href={p.href} className="group flex flex-col gap-1.5">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-brand-text group-hover:underline underline-offset-2">{p.rotulo}</span>
                {p.vinculante && <Badge variant="brand">Vinculante</Badge>}
              </span>
              {p.tese && <span className="font-serif text-base text-ink-soft leading-snug">{p.tese}</span>}
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-xs text-ink-mute">
        {precedentes.temMais ? `Os primeiros ${LIMITE_DE_PRECEDENTES}, vinculantes e súmulas na frente; há outros no TeseMap. ` : ''}
        Citação expressa no texto do precedente. A tese está completa, com a fonte oficial, no TeseMap.
      </p>
    </CartaoDeContexto>
  );
}
