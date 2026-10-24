'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Notice from '../../../components/Notice';
import HistoricoCobrancas from './HistoricoCobrancas';
import { dataCurta, precoEmReais } from '../../../lib/uso';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Planos e assinatura (F8-05). SÓ aparece quando `GET /api/cobranca/situacao` diz que a cobrança está disponível para este usuário:
 * desligada, ou em teste e fora da lista, o servidor responde `{ disponivel: false }` e esta seção não renderiza nada.
 * O cartão é informado na página do Mercado Pago, nunca aqui.
 */

interface Situacao {
  disponivel: boolean;
  ambiente?: 'teste' | 'producao';
  planos?: Array<{ id: 'essencial' | 'profissional'; nome: string; precoCentavos: number }>;
  assinatura?: { plano: string; situacao: 'pendente' | 'ativa' | 'em_atraso' | 'pausada' | 'cancelada'; cicloFim: string | null } | null;
}

const NOME: Record<string, string> = { essencial: 'Essencial', profissional: 'Profissional' };

async function chamar(url: string, corpo?: unknown): Promise<{ ok: boolean; dados: Record<string, any> }> {
  try {
    const r = await fetch(url, corpo === undefined ? undefined : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });
    return { ok: r.ok, dados: await r.json().catch(() => ({})) };
  } catch {
    return { ok: false, dados: { mensagem: 'Sem conexão. Tente de novo.' } };
  }
}

export default function Assinatura({ usuarioId, aoMudar, aoSaberSeHaPlanos }: { usuarioId: string; aoMudar: () => void; aoSaberSeHaPlanos: (disponivel: boolean) => void }) {
  const [s, setS] = useState<Situacao | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [voltouDoPagamento, setVoltouDoPagamento] = useState(false);

  const carregar = useCallback(async () => {
    const r = await chamar('/api/cobranca/situacao');
    const nova = (r.ok ? r.dados : { disponivel: false }) as Situacao;
    setS(nova);
    aoSaberSeHaPlanos(nova.disponivel === true);
    return nova;
  }, [aoSaberSeHaPlanos]);

  useEffect(() => {
    setVoltouDoPagamento(new URLSearchParams(window.location.search).get('assinatura') === 'retorno');
    void carregar();
  }, [carregar]);

  // Voltou da página de pagamento: o Mercado Pago avisa o servidor (webhook), que pode demorar alguns segundos. Confere por até ~30 s.
  useEffect(() => {
    if (!voltouDoPagamento) return;
    let tentativas = 0;
    const id = setInterval(async () => {
      tentativas += 1;
      const nova = await carregar();
      if (nova.assinatura?.situacao === 'ativa' || tentativas >= 10) {
        clearInterval(id);
        setVoltouDoPagamento(false);
        if (nova.assinatura?.situacao === 'ativa') aoMudar();
      }
    }, 3000);
    return () => clearInterval(id);
  }, [voltouDoPagamento, carregar, aoMudar]);

  if (!s?.disponivel) return null;

  const a = s.assinatura;
  const emCurso = a && (a.situacao === 'ativa' || a.situacao === 'em_atraso' || a.situacao === 'pausada');
  const cancelada = a && a.situacao === 'cancelada' && a.cicloFim && new Date(a.cicloFim).getTime() > Date.now();

  const assinar = async (plano: string) => {
    setOcupado(plano);
    setErro(null);
    const r = await chamar('/api/cobranca/assinar', { plano });
    if (r.ok && typeof r.dados.url === 'string') {
      window.location.assign(r.dados.url);
      return;
    }
    setErro(r.dados.mensagem ?? 'Não foi possível iniciar a assinatura agora.');
    setOcupado(null);
  };

  const cancelar = async () => {
    setOcupado('cancelar');
    setErro(null);
    const r = await chamar('/api/cobranca/cancelar', {});
    setOcupado(null);
    setConfirmando(false);
    if (!r.ok) {
      setErro(r.dados.mensagem ?? 'Não foi possível cancelar agora.');
      return;
    }
    await carregar();
    aoMudar();
  };

  return (
    <section aria-labelledby="uso-assinatura" className="flex flex-col gap-4">
      <h2 id="uso-assinatura" className="font-serif text-2xl font-semibold text-ink">
        Planos e assinatura
      </h2>

      {s.ambiente === 'teste' && (
        <Notice tom="warn" titulo="Ambiente de teste">
          A cobrança está em teste e visível só para contas autorizadas. Use as contas de teste do Mercado Pago: nenhum valor real é cobrado.
        </Notice>
      )}
      {voltouDoPagamento && (
        <Notice tom="info">
          <span className="inline-flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> Estamos confirmando o seu pagamento com o Mercado Pago. Isso pode levar alguns segundos.
          </span>
        </Notice>
      )}
      {erro && <Notice tom="danger">{erro}</Notice>}

      {emCurso ? (
        <Card className="p-5 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-base font-medium text-ink">Você assina o plano {NOME[a.plano] ?? a.plano}.</p>
            <Badge variant={a.situacao === 'ativa' ? 'ok' : 'warn'}>{a.situacao === 'ativa' ? 'Ativa' : a.situacao === 'em_atraso' ? 'Pagamento em atraso' : 'Pausada'}</Badge>
          </div>
          {a.cicloFim && <p className="text-sm text-ink-soft">Próxima cobrança em {dataCurta(a.cicloFim)}.</p>}
          {a.situacao === 'em_atraso' && <p className="text-sm text-ink-soft">A última cobrança não foi aprovada. O Mercado Pago tenta de novo; seu plano segue por mais 3 dias depois do fim do ciclo.</p>}
          {confirmando ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-ink">Cancelar a assinatura? O plano continua até o fim do ciclo já pago{a.cicloFim ? ` (${dataCurta(a.cicloFim)})` : ''}.</p>
              <Button type="button" variant="secondary" onClick={cancelar} disabled={ocupado !== null}>
                {ocupado === 'cancelar' ? 'Cancelando…' : 'Sim, cancelar'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setConfirmando(false)} disabled={ocupado !== null}>
                Manter
              </Button>
            </div>
          ) : (
            <div>
              <Button type="button" variant="secondary" onClick={() => setConfirmando(true)}>
                Cancelar assinatura
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <>
          {cancelada && a && (
            <Notice tom="info">
              Sua assinatura foi cancelada. O plano {NOME[a.plano] ?? a.plano} continua até {dataCurta(a.cicloFim!)}.
            </Notice>
          )}
          {a?.situacao === 'pendente' && !voltouDoPagamento && (
            <Notice tom="info">Há um pagamento ainda não confirmado. Se você já pagou, aguarde alguns minutos; se não concluiu, pode assinar de novo abaixo.</Notice>
          )}
          {(s.planos ?? []).length === 0 ? (
            <Notice tom="info">Os preços dos planos ainda não foram definidos.</Notice>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {s.planos!.map(p => (
                <li key={p.id}>
                  <Card className="p-5 flex flex-col gap-3 h-full">
                    <h3 className="font-serif text-xl font-semibold text-ink">{p.nome}</h3>
                    <p className="text-2xl font-semibold text-ink">
                      {precoEmReais(p.precoCentavos)}
                      <span className="text-sm font-normal text-ink-soft"> por mês</span>
                    </p>
                    <p className="text-sm text-ink-soft">Cobrança mensal no cartão pelo Mercado Pago. Cancele quando quiser, sem multa.</p>
                    <div className="mt-auto">
                      <Button type="button" onClick={() => void assinar(p.id)} disabled={ocupado !== null}>
                        {ocupado === p.id ? 'Abrindo o pagamento…' : `Assinar ${p.nome}`}
                      </Button>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {s.ambiente && <HistoricoCobrancas key={`${usuarioId}:${s.ambiente}`} usuarioId={usuarioId} ambiente={s.ambiente} atualizacao={a?.situacao} />}
    </section>
  );
}
