'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { CartaoDeIA } from './Cartoes';
import { Button } from '@/components/ui/button';
import { useSessao } from '../lib/useSessao';
import type { SaidaPrecedente } from '../lib/ia/tarefas/explicarPrecedente';

type Estado =
  | { tipo: 'ocioso' }
  | { tipo: 'carregando' }
  | { tipo: 'pronto'; explicacao: SaidaPrecedente; doCache: boolean; restantes: number | null }
  | { tipo: 'erro'; mensagem: string };

/**
 * Explicação do precedente por IA (tarefa "explicar-precedente" do catálogo): só quando a pessoa logada clica. Nada é pedido ao abrir a página
 * nem ao trocar de precedente (a tela usa `key` com o id e o componente volta ao estado inicial). A explicação é feita só a partir da tese que o
 * tribunal registra, e o trecho citado foi conferido no servidor.
 */
export default function ExplicacaoDoPrecedente({ noId }: { noId: string }) {
  const { usuario, carregando, contaDisponivel } = useSessao();
  const [estado, setEstado] = useState<Estado>({ tipo: 'ocioso' });

  // O botão só existe quando a instalação ligou a funcionalidade no build (NEXT_PUBLIC_IA_PRECEDENTE=sim)
  if (process.env.NEXT_PUBLIC_IA_PRECEDENTE !== 'sim' || !contaDisponivel || carregando) return null;

  const pedir = async () => {
    setEstado({ tipo: 'carregando' });
    try {
      const r = await fetch('/api/ia/explicar-precedente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entrada: { noId } })
      });
      const corpo = await r.json().catch(() => ({}));
      if (r.ok) setEstado({ tipo: 'pronto', explicacao: corpo.resposta, doCache: !!corpo.doCache, restantes: corpo.restantes ?? null });
      else setEstado({ tipo: 'erro', mensagem: corpo.mensagem ?? 'A explicação por IA falhou agora.' });
    } catch {
      setEstado({ tipo: 'erro', mensagem: 'Sem conexão. Tente de novo.' });
    }
  };

  return (
    <section aria-label="Explicação do precedente por IA" data-testid="explicacao-do-precedente" className="flex flex-col gap-3 no-print">
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
        <CartaoDeIA
          titulo="Explicação por IA"
          deslocado={false}
          meta={estado.restantes !== null ? (estado.restantes === 1 ? 'Resta 1 explicação no seu plano' : `Restam ${estado.restantes} explicações no seu plano`) : undefined}
        >
          <p className="text-base text-ink leading-relaxed">{estado.explicacao.resumo}</p>
          {estado.explicacao.explicacao.length > 0 && (
            <ul className="list-disc pl-5 flex flex-col gap-1 text-sm text-ink">
              {estado.explicacao.explicacao.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          )}
          <blockquote className="font-serif text-base text-ink leading-[1.7] border-l-2 border-ia pl-4">
            <span className="block text-xs font-sans text-ink-soft mb-0.5">Trecho da tese</span>“{estado.explicacao.trecho}”
          </blockquote>
          {estado.explicacao.termos.length > 0 && (
            <dl className="flex flex-col gap-1.5 text-sm">
              {estado.explicacao.termos.map((t, i) => (
                <div key={i}>
                  <dt className="inline font-medium text-ink">{t.termo}: </dt>
                  <dd className="inline text-ink-soft">{t.significado}</dd>
                </div>
              ))}
            </dl>
          )}
          {estado.explicacao.atencao.length > 0 && (
            <div className="flex flex-col gap-1 text-sm text-ink-soft">
              <p className="font-medium text-ink">Limites do texto</p>
              <ul className="list-disc pl-5 flex flex-col gap-1">
                {estado.explicacao.atencao.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-xs text-ink-soft leading-relaxed border-t border-ia/20 pt-3">
            Gerada por IA só a partir da tese acima, sem outras fontes. O trecho citado foi conferido no texto do precedente. Não substitui a leitura da tese na fonte oficial nem orientação jurídica.
            {estado.doCache && ' Esta explicação já tinha sido gerada e não contou na sua cota.'}
          </p>
        </CartaoDeIA>
      )}
    </section>
  );
}
