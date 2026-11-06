'use client';

import Link from 'next/link';
import { Layers } from 'lucide-react';
import { CartaoDeContexto } from '../../components/Cartoes';
import { classeDoChip } from '../../components/LigacoesDoPrazo';
import { prazosDoDispositivo } from '../../lib/ligacoes';

/**
 * O dispositivo no PrazoZero: os prazos que ele fundamenta, cada um abrindo o cálculo com o ato já escolhido. Só aparece quando há algum.
 * Os precedentes que citam o dispositivo têm cartão próprio (`PrecedentesDoDispositivo`).
 */
export default function LigacoesDoDispositivo({ dispositivoId }: { dispositivoId: string }) {
  const prazos = prazosDoDispositivo(dispositivoId);
  if (prazos.length === 0) return null;
  return (
    <CartaoDeContexto titulo="No PrazoZero" icone={<Layers />}>
      <div className="flex flex-col gap-2">
        <p className="text-sm text-ink-soft">Prazos que este dispositivo fundamenta:</p>
        <ul className="flex flex-wrap gap-2">
          {prazos.map(l => (
            <li key={l.href}>
              <Link href={l.href} className={classeDoChip}>
                {l.rotulo}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </CartaoDeContexto>
  );
}
