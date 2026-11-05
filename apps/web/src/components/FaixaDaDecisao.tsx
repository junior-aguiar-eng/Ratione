'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { restaurar } from '@ratione/argumenta';
import { Badge } from '@/components/ui/badge';
import { useCaso } from '../lib/caso/memoria';
import { URL_DE_VOLTA_A_DECISAO, veioDaDecisao } from '../lib/caso/ligacao';
import { TIPO_DECISAO } from '../lib/argumenta/rotulos';

/**
 * Faixa "Da sua decisão", no PrazoZero, quando a pessoa chegou pelo "Calcular o prazo" da análise do Argumenta: diz de qual decisão veio e o que
 * ela decidiu, e leva de volta à análise. O cálculo em si não muda: o ato vem escolhido, e a data e o tribunal são da pessoa. Sem o caso na memória
 * da aba (outra aba, recarga), a faixa não aparece.
 */
export default function FaixaDaDecisao({ className = '' }: { className?: string }) {
  const caso = useCaso();
  const [daDecisao, setDaDecisao] = useState(false);

  useEffect(() => {
    setDaDecisao(veioDaDecisao(window.location.search));
  }, []);

  const estrutura = caso?.resultados.estrutura;
  if (!caso || !estrutura || !daDecisao) return null;
  const r = (s: string) => restaurar(s, caso.enviada.substituicoes);

  return (
    <section aria-label="Da sua decisão" data-testid="faixa-da-decisao" className={`flex flex-col gap-2 rounded-xl border border-brand/30 bg-brand-tint/60 px-5 py-4 shadow-card ${className}`}>
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="inline-flex items-center gap-2 text-brand-text">
          <FileText className="w-4 h-4 shrink-0" aria-hidden />
          <h2 className="text-sm font-semibold">Da sua decisão</h2>
        </span>
        <Badge variant="brand">{TIPO_DECISAO[estrutura.tipo]}</Badge>
        <Link href={URL_DE_VOLTA_A_DECISAO} className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-brand-text hover:underline underline-offset-2">
          <ArrowLeft className="w-4 h-4" aria-hidden />
          Voltar à análise
        </Link>
      </header>
      <p className="font-serif text-lg font-semibold text-ink leading-snug">{r(estrutura.resultado)}</p>
      <p className="text-sm text-ink-soft">O recurso já está escolhido abaixo. Informe a data da intimação e o tribunal para calcular o prazo.</p>
    </section>
  );
}
