'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  ALTURA_DO_NO,
  COR_DO_PAPEL,
  LEGENDA_DO_GRAFO,
  NO_CENTRAL,
  POSICOES_DO_GRAFO,
  arestasDoNo,
  arestasValidadas,
  papelDoNo,
  rotuloDoNo
} from '../../lib/grafoVitrine';

/** TeseMap: o grafo mínimo do Tema 1.076/STJ. O visitante escolhe um nó e vê as relações validadas dele, cada uma com a explicação. */
export default function DemoTeseMap() {
  const [escolhido, setEscolhido] = useState(NO_CENTRAL);
  const relacoes = arestasDoNo(escolhido);
  const desenhaveis = arestasValidadas().filter(a => POSICOES_DO_GRAFO[a.origem] && POSICOES_DO_GRAFO[a.destino]);
  const ponta = (id: string, lado: 'dir' | 'esq' | 'cima' | 'baixo') => {
    const p = POSICOES_DO_GRAFO[id];
    if (lado === 'cima') return { x: p.x + p.w / 2, y: p.y };
    if (lado === 'baixo') return { x: p.x + p.w / 2, y: p.y + ALTURA_DO_NO };
    return { x: lado === 'dir' ? p.x + p.w : p.x, y: p.y + ALTURA_DO_NO / 2 };
  };

  return (
    <div className="flex flex-col gap-4">
      <svg viewBox="0 0 640 320" className="w-full h-auto max-h-48 hidden sm:block" role="group" aria-label="Mapa do Tema 1.076 do STJ: escolha um item para ver as relações dele">
        <defs>
          <marker id="seta-demo" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z" fill="rgb(var(--ink-mute))" />
          </marker>
          <marker id="seta-demo-forte" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z" fill="rgb(var(--brand))" />
          </marker>
        </defs>
        {desenhaveis.map(a => {
          const o = POSICOES_DO_GRAFO[a.origem];
          const d = POSICOES_DO_GRAFO[a.destino];
          const mesmaColuna = o.x === d.x;
          const p1 = mesmaColuna ? ponta(a.origem, o.y < d.y ? 'baixo' : 'cima') : ponta(a.origem, o.x < d.x ? 'dir' : 'esq');
          const p2 = mesmaColuna ? ponta(a.destino, o.y < d.y ? 'cima' : 'baixo') : ponta(a.destino, o.x < d.x ? 'esq' : 'dir');
          const ativa = a.origem === escolhido || a.destino === escolhido;
          return (
            <line
              key={a.id}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={ativa ? 'rgb(var(--brand))' : 'rgb(var(--ink-mute))'}
              strokeWidth={ativa ? 2.5 : 1.25}
              opacity={ativa ? 1 : 0.55}
              markerEnd={ativa ? 'url(#seta-demo-forte)' : 'url(#seta-demo)'}
            />
          );
        })}
        {Object.entries(POSICOES_DO_GRAFO).map(([id, p]) => {
          const ativo = id === escolhido;
          return (
            <g
              key={id}
              role="button"
              tabIndex={0}
              aria-pressed={ativo}
              aria-label={rotuloDoNo(id)}
              onClick={() => setEscolhido(id)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setEscolhido(id);
                }
              }}
              className="cursor-pointer outline-none focus-visible:[&>rect:first-child]:stroke-[rgb(var(--brand))]"
            >
              <rect x={p.x} y={p.y} width={p.w} height={ALTURA_DO_NO} rx="8" fill="rgb(var(--surface))" stroke={ativo ? 'rgb(var(--brand))' : 'rgb(var(--line-strong))'} strokeWidth={ativo ? 2.5 : 1} />
              <rect x={p.x} y={p.y} width="5" height={ALTURA_DO_NO} rx="2.5" fill={COR_DO_PAPEL[papelDoNo(id)]} />
              <foreignObject x={p.x + 16} y={p.y} width={p.w - 24} height={ALTURA_DO_NO} pointerEvents="none">
                <div style={{ height: ALTURA_DO_NO, display: 'flex', alignItems: 'center', fontSize: 14, lineHeight: 1.3, fontWeight: 500, color: 'rgb(var(--ink))' }}>{rotuloDoNo(id)}</div>
              </foreignObject>
            </g>
          );
        })}
      </svg>

      <div role="group" aria-label="Itens do mapa" className="flex flex-wrap gap-2 sm:hidden">
        {Object.keys(POSICOES_DO_GRAFO).map(id => (
          <button
            key={id}
            type="button"
            aria-pressed={id === escolhido}
            onClick={() => setEscolhido(id)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${id === escolhido ? 'bg-brand-tint text-brand-text' : 'border border-line-strong text-ink-soft'}`}
          >
            {rotuloDoNo(id)}
          </button>
        ))}
      </div>

      <ul aria-live="polite" tabIndex={0} aria-label="Relações do item escolhido" className="flex flex-col gap-2.5 min-h-[6.5rem] lg:max-h-[9.5rem] lg:overflow-y-auto lg:pr-2">
        {relacoes.map(a => (
          <li key={a.id} className="text-sm leading-snug text-ink-soft">
            <span className="font-medium text-ink">{rotuloDoNo(a.origem)}</span> <span className="text-brand-text">{a.tipo}</span>{' '}
            <span className="font-medium text-ink">{rotuloDoNo(a.destino)}</span>: {a.rotulo}
          </li>
        ))}
        {relacoes.length === 0 && <li className="text-sm text-ink-soft">Este item não tem relações validadas neste mapa.</li>}
      </ul>

      <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-ink-soft">
        {LEGENDA_DO_GRAFO.map(([c, t]) => (
          <li key={t} className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${c}`} /> {t}
          </li>
        ))}
      </ul>

      <p className="text-sm text-ink-mute">
        Relações validadas por revisão jurídica, cada uma com fonte oficial e trecho literal.{' '}
        <Link href="/tesemap?n=STJ-TEMA-1076" className="inline-flex items-center gap-1 text-brand-text underline underline-offset-2">
          Abrir no TeseMap <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </p>
    </div>
  );
}
