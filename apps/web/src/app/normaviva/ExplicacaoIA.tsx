'use client';

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import Notice from '../../components/Notice';
import { Button } from '@/components/ui/button';
import { useSessao } from '../../lib/useSessao';
import type { RespostaExplicacao } from '../../lib/ia/prompt';

type Estado =
  | { tipo: 'ocioso' }
  | { tipo: 'carregando' }
  | { tipo: 'pronto'; explicacao: RespostaExplicacao; doCache: boolean; restantesHoje: number | null }
  | { tipo: 'erro'; mensagem: string };

/**
 * Explicação por IA (F3-08): só quando a pessoa logada clica. Nada é pedido ao abrir a página nem ao trocar de dispositivo
 * (o componente recebe `key` com o id e volta ao estado inicial). Regras em `lib/ia/politica.ts`.
 */
export default function ExplicacaoIA({ dispositivoId }: { dispositivoId: string }) {
  const { usuario, carregando, contaDisponivel } = useSessao();
  const [estado, setEstado] = useState<Estado>({ tipo: 'ocioso' });

  // O botão só existe quando a instalação ligou a funcionalidade no build (NEXT_PUBLIC_IA_EXPLICACAO=sim)
  if (process.env.NEXT_PUBLIC_IA_EXPLICACAO !== 'sim' || !contaDisponivel || carregando) return null;

  const pedir = async () => {
    setEstado({ tipo: 'carregando' });
    try {
      const r = await fetch('/api/normaviva/explicar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dispositivoId }) });
      const corpo = await r.json().catch(() => ({}));
      if (r.ok) setEstado({ tipo: 'pronto', explicacao: corpo.explicacao, doCache: !!corpo.doCache, restantesHoje: corpo.restantesHoje ?? null });
      else setEstado({ tipo: 'erro', mensagem: corpo.mensagem ?? 'A explicação por IA falhou agora.' });
    } catch {
      setEstado({ tipo: 'erro', mensagem: 'Sem conexão. Tente de novo.' });
    }
  };

  return (
    <section aria-labelledby="explicacao-ia" className="flex flex-col gap-3 no-print">
      <h3 id="explicacao-ia" className="sr-only">
        Explicação por IA
      </h3>
      {estado.tipo !== 'pronto' && (
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" type="button" onClick={pedir} disabled={!usuario || estado.tipo === 'carregando'}>
            <Sparkles className="w-4 h-4" />
            {estado.tipo === 'carregando' ? 'Gerando explicação…' : 'Explicar com IA'}
          </Button>
          {!usuario && <span className="text-sm text-ink-soft">Entre na sua conta para pedir a explicação por IA.</span>}
        </div>
      )}
      {estado.tipo === 'erro' && <p className="text-sm text-danger-text">{estado.mensagem}</p>}
      {estado.tipo === 'pronto' && (
        <div className="flex flex-col gap-3 rounded-md border border-line bg-surface-2 p-4 text-sm">
          <p className="text-base text-ink">{estado.explicacao.resumo}</p>
          {estado.explicacao.explicacao.length > 0 && (
            <ul className="list-disc pl-5 flex flex-col gap-1 text-ink">
              {estado.explicacao.explicacao.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          )}
          {estado.explicacao.termos.length > 0 && (
            <dl className="flex flex-col gap-1.5">
              {estado.explicacao.termos.map((t, i) => (
                <div key={i}>
                  <dt className="inline font-medium text-ink">{t.termo}: </dt>
                  <dd className="inline text-ink-soft">{t.significado}</dd>
                </div>
              ))}
            </dl>
          )}
          {estado.explicacao.atencao.length > 0 && (
            <ul className="flex flex-col gap-1 text-ink-soft">
              {estado.explicacao.atencao.map((t, i) => (
                <li key={i}>Atenção: {t}</li>
              ))}
            </ul>
          )}
          <Notice titulo="Explicação gerada por IA (Claude Haiku 5.5)">
            Feita só a partir do texto acima, sem jurisprudência nem outras fontes. Pode conter erro e não substitui o texto da lei nem orientação
            jurídica.
            {estado.restantesHoje !== null && ` Você ainda pode pedir ${estado.restantesHoje} explicação(ões) nova(s) hoje.`}
            {estado.doCache && ' Esta explicação já tinha sido gerada e não contou no seu limite.'}
          </Notice>
        </div>
      )}
    </section>
  );
}
