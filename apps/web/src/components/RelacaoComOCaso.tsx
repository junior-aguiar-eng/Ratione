'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { restaurar } from '@ratione/argumenta';
import { CartaoDeIA } from './Cartoes';
import { Badge, type BadgeTom } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSessao } from '../lib/useSessao';
import { useQuestaoDoCaso } from '../lib/caso/useQuestaoDoCaso';
import { chaveDaRelacao, guardarRelacao, MAX_RELACOES_POR_CASO, relacaoGuardada, relacoesFeitas } from '../lib/caso/memoria';
import type { Ferramenta } from '../lib/caso/ligacao';
import type { SaidaRelacao } from '../lib/ia/tarefas/relacionarComOCaso';

const RELACAO: Record<SaidaRelacao['relacao'], { rotulo: string; tom: BadgeTom }> = {
  aplica: { rotulo: 'Trata do ponto da sua questão', tom: 'ok' },
  distingue: { rotulo: 'Trata de situação diferente da sua questão', tom: 'warn' },
  outro_ponto: { rotulo: 'Trata de outro ponto', tom: 'neutral' }
};

interface Pronto {
  relacao: SaidaRelacao;
  restantes: number | null;
}

type Estado = { tipo: 'ocioso' } | { tipo: 'carregando' } | { tipo: 'pronto'; pronto: Pronto } | { tipo: 'erro'; mensagem: string };

interface Props {
  ferramenta: Ferramenta;
  /** O dispositivo (NormaViva) ou o nó (TeseMap) aberto agora; a tela usa `key` com ele para voltar ao estado inicial ao trocar de item. */
  destinoId: string;
}

/**
 * Relação com o caso (tarefa "relacionar-com-o-caso" do catálogo de IA): só quando a pessoa chegou por uma citação da análise e clica no botão.
 * Manda ao servidor a questão e a conclusão como a análise as produziu (com marcadores no lugar dos dados pessoais) e o id da fonte; o texto da
 * fonte o servidor lê do banco. Os marcadores voltam a ser nomes só aqui, na tela. A resposta fica na memória da aba, junto do caso.
 */
export default function RelacaoComOCaso({ ferramenta, destinoId }: Props) {
  const { usuario, carregando, contaDisponivel } = useSessao();
  const { caso, questao } = useQuestaoDoCaso();
  const chave = questao ? chaveDaRelacao(questao.id, ferramenta, destinoId) : '';
  const [estado, setEstado] = useState<Estado>({ tipo: 'ocioso' });

  // O botão só existe quando a instalação ligou a funcionalidade no build (NEXT_PUBLIC_IA_RELACAO=sim)
  if (process.env.NEXT_PUBLIC_IA_RELACAO !== 'sim' || !contaDisponivel || carregando || !caso || !questao) return null;

  const guardada = relacaoGuardada<Pronto>(chave);
  const mostrado: Estado = estado.tipo === 'ocioso' && guardada ? { tipo: 'pronto', pronto: guardada } : estado;
  const r = (s: string) => restaurar(s, caso.enviada.substituicoes);
  const noLimite = !guardada && relacoesFeitas() >= MAX_RELACOES_POR_CASO;

  const pedir = async () => {
    setEstado({ tipo: 'carregando' });
    try {
      const resposta = await fetch('/api/ia/relacionar-com-o-caso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entrada: { ferramenta, destinoId, enunciado: questao.enunciado, conclusao: questao.conclusao } })
      });
      const corpo = await resposta.json().catch(() => ({}));
      if (resposta.ok) {
        const pronto: Pronto = { relacao: corpo.resposta, restantes: corpo.restantes ?? null };
        guardarRelacao(chave, pronto);
        setEstado({ tipo: 'pronto', pronto });
      } else setEstado({ tipo: 'erro', mensagem: corpo.mensagem ?? 'Não foi possível relacionar agora.' });
    } catch {
      setEstado({ tipo: 'erro', mensagem: 'Sem conexão. Tente de novo.' });
    }
  };

  return (
    <section aria-label="Relação com o seu caso" data-testid="relacao-com-o-caso" className="flex flex-col gap-3 no-print">
      {mostrado.tipo !== 'pronto' && (
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" type="button" onClick={pedir} disabled={!usuario || noLimite || mostrado.tipo === 'carregando'}>
            <Sparkles className="w-4 h-4" />
            {mostrado.tipo === 'carregando' ? 'Relacionando…' : 'Relacionar com a minha questão'}
          </Button>
          {noLimite && <span className="text-sm text-ink-soft">Você já fez {MAX_RELACOES_POR_CASO} relações neste caso. Uma nova análise libera outras.</span>}
          {!usuario && <span className="text-sm text-ink-soft">Entre na sua conta para usar este recurso.</span>}
        </div>
      )}
      {mostrado.tipo === 'erro' && <p className="text-sm text-danger-text">{mostrado.mensagem}</p>}
      {mostrado.tipo === 'pronto' && (
        <CartaoDeIA
          titulo="Relação com o seu caso"
          deslocado={false}
          meta={mostrado.pronto.restantes !== null ? (mostrado.pronto.restantes === 1 ? 'Resta 1 consulta de IA no seu plano' : `Restam ${mostrado.pronto.restantes} consultas de IA no seu plano`) : undefined}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={RELACAO[mostrado.pronto.relacao.relacao].tom}>{RELACAO[mostrado.pronto.relacao.relacao].rotulo}</Badge>
            <span className="text-xs text-ink-soft">Questão: {r(questao.enunciado)}</span>
          </div>
          <p className="text-base text-ink leading-relaxed">{r(mostrado.pronto.relacao.resumo)}</p>
          <blockquote className="font-serif text-base text-ink leading-[1.7] border-l-2 border-ia pl-4">
            <span className="block text-xs font-sans text-ink-soft mb-0.5">Trecho da fonte</span>“{mostrado.pronto.relacao.trecho}”
          </blockquote>
          <p className="text-sm text-ink-soft">O que o texto da fonte não permite concluir sobre o caso: {r(mostrado.pronto.relacao.limite)}</p>
          <p className="text-xs text-ink-soft leading-relaxed border-t border-ia/20 pt-3">
            Gerada por IA só a partir da sua questão e do texto desta fonte, sem outras leis nem precedentes. O trecho citado foi conferido no texto da fonte. Pode conter erro e não substitui a leitura da fonte nem orientação jurídica.
          </p>
        </CartaoDeIA>
      )}
    </section>
  );
}
