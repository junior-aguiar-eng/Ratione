'use client';

import Link from 'next/link';
import { ArrowLeft, Link2 } from 'lucide-react';
import { restaurar } from '@ratione/argumenta';
import { Badge } from '@/components/ui/badge';
import { useQuestaoDoCaso } from '../lib/caso/useQuestaoDoCaso';
import { fundamentosQueApontamPara, urlDeVoltaAoCaso, type Ferramenta } from '../lib/caso/ligacao';
import { CATEGORIA, FUNDAMENTO, RESULTADO } from '../lib/argumenta/rotulos';

interface Props {
  ferramenta: Ferramenta;
  /** O dispositivo (NormaViva) ou o nó (TeseMap) que a tela mostra agora. */
  destinoId: string | null;
  className?: string;
}

/**
 * Faixa "Do seu caso": aparece no NormaViva e no TeseMap quando a pessoa chegou por uma citação da análise do Argumenta. Diz de qual questão
 * ela veio, mostra o enunciado e, se o que está aberto é mesmo a citação de um fundamento daquela questão, como a decisão o usou. O resto do caso
 * está só na memória da aba (`lib/caso/memoria.ts`); sem ele, a faixa não aparece. Sem texto de IA: tudo vem da análise que a pessoa já leu.
 */
export default function FaixaDoCaso({ ferramenta, destinoId, className = '' }: Props) {
  const { caso, questao: q, posicao } = useQuestaoDoCaso();
  if (!caso || !q) return null;

  const r = (s: string) => restaurar(s, caso.enviada.substituicoes);
  const usos = fundamentosQueApontamPara(caso, q.id, ferramenta, destinoId);

  return (
    <section aria-label="Do seu caso" data-testid="faixa-do-caso" className={`flex flex-col gap-2.5 rounded-xl border border-brand/30 bg-brand-tint/60 px-5 py-4 shadow-card ${className}`}>
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="inline-flex items-center gap-2 text-brand-text">
          <Link2 className="w-4 h-4 shrink-0" aria-hidden />
          <h2 className="text-sm font-semibold">Do seu caso</h2>
        </span>
        <span className="text-xs text-ink-soft">
          Questão {posicao + 1} · {CATEGORIA[q.categoria]}
        </span>
        <Badge variant={RESULTADO[q.resultado].tom}>{RESULTADO[q.resultado].rotulo}</Badge>
        <Link href={urlDeVoltaAoCaso(q.id)} className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-brand-text hover:underline underline-offset-2">
          <ArrowLeft className="w-4 h-4" aria-hidden />
          Voltar à análise
        </Link>
      </header>
      <p className="font-serif text-lg font-semibold text-ink leading-snug">{r(q.enunciado)}</p>
      {usos.length > 0 && (
        <div className="flex flex-col gap-1.5 border-t border-brand/20 pt-2.5">
          <p className="text-sm text-ink-soft">{usos.length === 1 ? 'A decisão citou isto nesta questão como:' : 'A decisão citou isto nesta questão em mais de um ponto:'}</p>
          <ul className="flex flex-col gap-1.5">
            {usos.map((f, i) => (
              <li key={i} className="flex gap-3">
                <Badge variant={FUNDAMENTO[f.tipo].tom} className="w-24 justify-center self-start shrink-0">
                  {FUNDAMENTO[f.tipo].rotulo}
                </Badge>
                <p className="text-base text-ink leading-snug">
                  {r(f.descricao)}
                  {f.citacao && <span className="text-ink-soft"> ({r(f.citacao)})</span>}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
