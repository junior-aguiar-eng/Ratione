'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Loader2, RotateCcw } from 'lucide-react';
import { Badge, type BadgeTom } from '@/components/ui/badge';
import { DECISAO_DEMO } from '../../lib/decisaoDemo';

const ETAPAS = ['Preparando o documento', 'Identificando os fundamentos', 'Construindo as teses'] as const;
const MS_POR_ETAPA = 750;

/**
 * Argumenta: uma análise de exemplo, com a decisão fictícia do projeto, que se monta passo a passo como no produto. É uma demonstração (rotulada):
 * nenhum modelo é chamado. Quem prefere menos movimento (prefers-reduced-motion) vê o resultado de uma vez.
 */
export default function DemoArgumenta({ semMovimento }: { semMovimento: boolean }) {
  const [etapa, setEtapa] = useState(semMovimento ? ETAPAS.length : 0);
  const pronta = etapa >= ETAPAS.length;

  useEffect(() => {
    if (semMovimento || pronta) return;
    const t = setTimeout(() => setEtapa(e => e + 1), MS_POR_ETAPA);
    return () => clearTimeout(t);
  }, [etapa, pronta, semMovimento]);

  const tese = DECISAO_DEMO.fundamentacao.tesesIdentificadas[0];
  const linhas: { rotulo: string; texto: string; tom: BadgeTom }[] = [
    { rotulo: 'Decisão', texto: 'Sentença cível · Fraude bancária e transações via PIX', tom: 'neutral' },
    { rotulo: 'Tese', texto: tese.titulo, tom: 'brand' },
    { rotulo: 'Fundamento', texto: 'CDC, art. 14 · Súmula 479/STJ', tom: 'info' },
    { rotulo: 'Conclusão', texto: 'Pedidos julgados procedentes', tom: 'ok' }
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink">Análise de uma sentença de exemplo</p>
        {pronta && !semMovimento && (
          <button type="button" onClick={() => setEtapa(0)} className="inline-flex items-center gap-1.5 text-sm text-brand-text hover:underline">
            <RotateCcw className="w-3.5 h-3.5" /> Repetir
          </button>
        )}
      </div>

      <div aria-live="polite" className="min-h-[15.5rem]">
        {!pronta ? (
          <ol className="flex flex-col gap-3 pt-1">
            {ETAPAS.map((nome, i) => (
              <li key={nome} className={`flex items-center gap-3 text-base ${i <= etapa ? 'text-ink' : 'text-ink-mute'}`}>
                {i < etapa ? <Check className="w-4 h-4 text-ok-text" aria-hidden /> : i === etapa ? <Loader2 className="w-4 h-4 animate-spin text-brand-text" aria-hidden /> : <span className="w-4 h-4" aria-hidden />}
                {nome}
                {i === etapa ? '…' : ''}
              </li>
            ))}
          </ol>
        ) : (
          <div className="flex flex-col gap-4">
            <ol>
              {linhas.map((e, i) => (
                <li key={e.rotulo} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <Badge variant={e.tom} className="w-24 justify-center">
                      {e.rotulo}
                    </Badge>
                    {i < linhas.length - 1 && <span className="w-px flex-1 bg-line-strong my-1" />}
                  </div>
                  <p className="text-base text-ink pb-4 pt-0.5 leading-snug">{e.texto}</p>
                </li>
              ))}
            </ol>
            <div className="rounded-lg bg-danger-tint border border-danger/30 p-3.5 text-sm text-danger-text leading-relaxed">
              <span className="font-semibold">Ponto de atenção:</span> argumento defensivo não enfrentado (CPC, art. 489, § 1º, IV), à p. 6 da decisão.
            </div>
          </div>
        )}
      </div>

      <p className="text-sm text-ink-mute">
        Exemplo ilustrativo, com uma decisão fictícia; a análise da sua decisão traz a estrutura, as questões, as conclusões e os fundamentos.{' '}
        <Link href="/argumenta" className="inline-flex items-center gap-1 text-brand-text underline underline-offset-2">
          Analisar uma decisão <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </p>
    </div>
  );
}
