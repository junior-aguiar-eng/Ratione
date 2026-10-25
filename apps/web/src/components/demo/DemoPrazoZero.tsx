'use client';

import { useId, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { ATOS_DEMO, DATA_INICIAL_DEMO, DATA_MAXIMA_DEMO, DATA_MINIMA_DEMO, TRIBUNAIS_DEMO, calcularDemoPrazo } from '../../lib/demoHero';
import { dataCurta, dataLonga, diaDaSemana } from '../../lib/datas';

/** PrazoZero: o cálculo é o do motor real, feito aqui no navegador. O visitante troca a data, o ato e o tribunal. */
export default function DemoPrazoZero() {
  const id = useId();
  const [data, setData] = useState(DATA_INICIAL_DEMO);
  const [atoId, setAtoId] = useState('apelacao');
  const [tribunalId, setTribunalId] = useState('TJSP');
  const r = useMemo(() => calcularDemoPrazo({ data, atoId, tribunalId }), [data, atoId, tribunalId]);
  const ato = ATOS_DEMO.find(a => a.id === atoId)!;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${id}-data`}>Disponibilização no DJe</Label>
          <Input id={`${id}-data`} type="date" value={data} min={DATA_MINIMA_DEMO} max={DATA_MAXIMA_DEMO} onChange={e => setData(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${id}-ato`}>Ato</Label>
          <NativeSelect id={`${id}-ato`} value={atoId} onChange={e => setAtoId(e.target.value)}>
            {ATOS_DEMO.map(a => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${id}-trib`}>Tribunal</Label>
          <NativeSelect id={`${id}-trib`} value={tribunalId} onChange={e => setTribunalId(e.target.value)}>
            {TRIBUNAIS_DEMO.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      <div aria-live="polite" className="flex flex-col gap-4">
        {r ? (
          <>
            <div>
              <p className="text-sm text-ink-mute">Prazo final</p>
              <p className="font-serif text-4xl sm:text-5xl font-semibold text-ink mt-1 leading-tight">{dataLonga(r.prazoFinal)}</p>
              <p className="text-base text-ink-soft mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <span>
                  {diaDaSemana(r.prazoFinal)} · {r.diasUteis} dias úteis · {ato.nome} · {tribunalId}
                </span>
                {r.calendarioConferido ? <Badge variant="ok">Calendário conferido</Badge> : <Badge variant="warn">Calendário não conferido</Badge>}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-ink">Dias que não contaram</p>
              <ul className="flex flex-wrap gap-1.5 mt-2">
                {r.excluidos.slice(0, 8).map(d => (
                  <li
                    key={d.data}
                    title={d.descricao}
                    className={`rounded-md px-2 py-1 text-xs num ${d.status === 'feriado' ? 'bg-warn-tint text-warn-text' : 'bg-surface-2 text-ink-soft'}`}
                  >
                    {dataCurta(d.data).slice(0, 5)} · {diaDaSemana(d.data).slice(0, 3).toLowerCase()}
                  </li>
                ))}
                {r.excluidos.length > 8 && <li className="rounded-md px-2 py-1 text-xs text-ink-mute">+{r.excluidos.length - 8}</li>}
              </ul>
            </div>
          </>
        ) : (
          <p className="text-sm text-ink-soft">Escolha uma data de 2026 (de janeiro a outubro).</p>
        )}
      </div>

      <p className="text-sm text-ink-mute">
        Base legal: {ato.base} e arts. 219, 220 e 224. Cálculo real do motor do PrazoZero, feito no seu navegador.{' '}
        <Link href="/prazozero" className="inline-flex items-center gap-1 text-brand-text underline underline-offset-2">
          Memória de cálculo completa <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </p>
    </div>
  );
}
