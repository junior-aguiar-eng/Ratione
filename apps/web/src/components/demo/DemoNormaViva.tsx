'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DATAS_DEMO_NORMA, consultarDemoNorma, resumirTexto } from '../../lib/demoHero';
import { dataCurta, hojeIso } from '../../lib/datas';

/** NormaViva: a redação de um dispositivo numa data. O visitante escolhe a data e vê o que valia nela (ou que ainda não existia). */
export default function DemoNormaViva() {
  const [escolhida, setEscolhida] = useState<(typeof DATAS_DEMO_NORMA)[number]['id']>('hoje');
  const iso = DATAS_DEMO_NORMA.find(d => d.id === escolhida)!.iso ?? hojeIso();
  const r = useMemo(() => consultarDemoNorma(iso), [iso]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-ink-mute">{r.normaNome}</p>
          <h3 className="font-serif text-3xl font-semibold text-ink mt-0.5">{r.rotulo}</h3>
        </div>
        {r.existe ? <Badge variant="ok">Vigente</Badge> : <Badge variant="neutral">Ainda não existia</Badge>}
      </div>

      <div role="radiogroup" aria-label="Ver a redação em" className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-ink-soft">Ver a redação em:</span>
        {DATAS_DEMO_NORMA.map(d => (
          <button
            key={d.id}
            type="button"
            role="radio"
            aria-checked={escolhida === d.id}
            onClick={() => setEscolhida(d.id)}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              escolhida === d.id ? 'bg-brand-tint text-brand-text' : 'border border-line-strong text-ink-soft hover:text-ink hover:bg-surface-2'
            }`}
          >
            {d.rotulo}
          </button>
        ))}
      </div>

      <div aria-live="polite" className="min-h-[9.5rem]">
        {r.existe && r.texto ? (
          <>
            <p className="text-base text-ink leading-relaxed">{resumirTexto(r.texto, 250)}</p>
            <p className="text-sm text-ink-soft mt-3">
              Acrescentado pela {r.ato}
              {r.desde ? `, em vigor desde ${dataCurta(r.desde)}` : ''}.
            </p>
          </>
        ) : (
          <p className="text-base text-ink-soft leading-relaxed">
            Em {dataCurta(iso)} este parágrafo ainda não fazia parte do CPC. Ele só passou a valer em 03/06/2022, quando a Lei nº 14.365/2022 o acrescentou.
          </p>
        )}
      </div>

      <p className="text-sm text-ink-mute">
        Dados do NormaViva, com o texto conferido na versão compilada do Planalto.{' '}
        <Link href="/normaviva" className="inline-flex items-center gap-1 text-brand-text underline underline-offset-2">
          Consultar uma norma <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </p>
    </div>
  );
}
