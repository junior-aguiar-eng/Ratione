'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, RotateCcw, Sparkles } from 'lucide-react';
import { Badge, type BadgeTom } from '@/components/ui/badge';
import { DECISAO_DEMO } from '../../lib/decisaoDemo';

const MS_POR_ACHADO = 1150;

interface Achado {
  id: string;
  rotulo: string;
  tom: BadgeTom;
  texto: string;
  pagina: number;
  /** Cor do grifo no trecho de origem. */
  grifo: string;
  /** Só as citações recebem o selo de conferência contra a base. */
  selo?: boolean;
}

/** Na ordem em que a leitura os encontra. */
const ACHADOS: Achado[] = [
  { id: 'tese', rotulo: 'Tese', tom: 'brand', texto: 'Responsabilidade objetiva por fortuito interno', pagina: 4, grifo: 'bg-brand-tint' },
  { id: 'stj', rotulo: 'Fundamento', tom: 'info', texto: 'Súmula 479/STJ', pagina: 4, grifo: 'bg-info-tint', selo: true },
  { id: 'cdc', rotulo: 'Fundamento', tom: 'info', texto: 'CDC, art. 14', pagina: 4, grifo: 'bg-info-tint', selo: true },
  { id: 'atencao', rotulo: 'Atenção', tom: 'danger', texto: 'Argumento não enfrentado (CPC, art. 489, § 1º, IV)', pagina: 6, grifo: 'bg-danger-tint' }
];

type Trecho = string | { achado: string; texto: string };

const PARAGRAFOS: { pagina: number; trechos: Trecho[] }[] = [
  {
    pagina: 4,
    trechos: [
      'A instituição financeira ',
      { achado: 'tese', texto: 'responde objetivamente pelos danos decorrentes de fraudes praticadas por terceiros' },
      ', por constituírem fortuito interno (',
      { achado: 'stj', texto: 'Súmula 479/STJ' },
      ' e ',
      { achado: 'cdc', texto: 'art. 14 do CDC' },
      ').'
    ]
  },
  {
    pagina: 6,
    trechos: [{ achado: 'atencao', texto: '“Rejeito os argumentos da defesa de que houve culpa do correntista, porquanto incide de forma irrestrita o risco da atividade financeira.”' }]
  }
];

/**
 * Argumenta: a leitura de uma decisão de exemplo. O texto vai sendo grifado e cada grifo vira uma conclusão ligada ao trecho de origem; passar o
 * ponteiro (ou o foco do teclado) sobre uma conclusão acende o trecho dela. É uma demonstração rotulada: nenhum modelo é chamado, e quem prefere
 * menos movimento (prefers-reduced-motion) vê tudo pronto.
 */
export default function DemoArgumenta({ semMovimento }: { semMovimento: boolean }) {
  const [passo, setPasso] = useState(semMovimento ? ACHADOS.length : 0);
  const [foco, setFoco] = useState<string | null>(null);
  const pronta = passo >= ACHADOS.length;

  useEffect(() => {
    if (semMovimento || pronta) return;
    const t = setTimeout(() => setPasso(p => p + 1), passo === 0 ? 700 : MS_POR_ACHADO);
    return () => clearTimeout(t);
  }, [passo, pronta, semMovimento]);

  const visivel = (id: string) => ACHADOS.findIndex(a => a.id === id) < passo;
  const grifoDe = (id: string) => ACHADOS.find(a => a.id === id)!.grifo;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2 text-sm font-medium text-ink">
          <Sparkles className="w-4 h-4 text-brand-text" aria-hidden /> Leitura de uma sentença de exemplo
        </p>
        {pronta && !semMovimento && (
          <button
            type="button"
            onClick={() => {
              setFoco(null);
              setPasso(0);
            }}
            className="inline-flex items-center gap-1.5 text-sm text-brand-text hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Repetir
          </button>
        )}
      </div>

      <div className="h-1 rounded-full bg-surface-2 overflow-hidden" role="progressbar" aria-label="Leitura da decisão" aria-valuemin={0} aria-valuemax={ACHADOS.length} aria-valuenow={passo}>
        <div className="h-full rounded-full bg-brand transition-[width] duration-700 ease-out" style={{ width: `${(passo / ACHADOS.length) * 100}%` }} />
      </div>

      <div className="rounded-lg border border-line bg-canvas/70 px-4 py-3.5">
        <p className="text-xs text-ink-mute mb-2.5">
          {(DECISAO_DEMO.tribunalOuVara ?? '').split(' · ')[0]} · Proc. {DECISAO_DEMO.numeroProcesso}
        </p>
        <div className="flex flex-col gap-3 font-serif text-[15px] leading-relaxed text-ink">
          {PARAGRAFOS.map(p => (
            <p key={p.pagina}>
              <span className="mr-2 font-sans text-xs text-ink-mute align-baseline">p. {p.pagina}</span>
              {p.trechos.map((t, i) =>
                typeof t === 'string' ? (
                  <span key={i}>{t}</span>
                ) : (
                  <mark
                    key={i}
                    onMouseEnter={() => visivel(t.achado) && setFoco(t.achado)}
                    onMouseLeave={() => setFoco(null)}
                    className={`rounded px-0.5 text-ink [box-decoration-break:clone] transition-colors duration-500 ${
                      visivel(t.achado) ? grifoDe(t.achado) : 'bg-transparent'
                    } ${foco === t.achado ? 'outline outline-2 outline-offset-1 outline-brand' : ''}`}
                  >
                    {t.texto}
                  </mark>
                )
              )}
            </p>
          ))}
        </div>
      </div>

      <ul aria-live="polite" className="flex flex-col gap-2">
        {ACHADOS.map(a => {
          const aparece = visivel(a.id);
          return (
            <li
              key={a.id}
              className={`transition-all duration-500 ${aparece ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'}`}
              aria-hidden={!aparece}
            >
              <button
                type="button"
                tabIndex={aparece ? 0 : -1}
                onMouseEnter={() => setFoco(a.id)}
                onMouseLeave={() => setFoco(null)}
                onFocus={() => setFoco(a.id)}
                onBlur={() => setFoco(null)}
                className={`w-full flex flex-wrap sm:flex-nowrap items-center gap-x-3 gap-y-1 rounded-lg border px-3 py-1.5 text-left transition-colors ${
                  foco === a.id ? 'border-brand bg-surface-2' : 'border-line bg-surface/60'
                }`}
              >
                <Badge variant={a.tom} className="w-24 justify-center shrink-0">
                  {a.rotulo}
                </Badge>
                <span className="order-last w-full sm:order-none sm:w-auto sm:flex-1 text-sm text-ink leading-snug">{a.texto}</span>
                {a.selo ? (
                  <span className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-ok-text shrink-0">
                    <Check className="w-3.5 h-3.5" aria-hidden /> Encontrada na base
                  </span>
                ) : (
                  <span className="ml-auto text-xs text-ink-mute shrink-0">p. {a.pagina}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <p className="text-sm text-ink-mute">
        {pronta ? 'Cada conclusão aponta para o trecho de onde veio.' : 'Lendo a decisão…'} Exemplo ilustrativo, com uma decisão fictícia: nenhum modelo foi chamado aqui.{' '}
        <Link href="/argumenta" className="inline-flex items-center gap-1 text-brand-text underline underline-offset-2">
          Analisar uma decisão <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </p>
    </div>
  );
}
