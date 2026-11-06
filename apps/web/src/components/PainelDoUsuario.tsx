'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, CalendarClock, CalendarDays, Clock, FileSearch, Network } from 'lucide-react';
import CampoDeBusca, { EXEMPLOS_DE_BUSCA } from './CampoDeBusca';
import { CartaoDeContexto } from './Cartoes';
import { carregarHistorico, type RegistroHistorico } from '../lib/historico';
import { listarLembretes } from '../lib/lembretes-cliente';
import { montarAgenda, type ItemDaAgenda } from '../lib/agenda';
import { dataCurta, diaDaSemana, hojeIso, tempoRelativo } from '../lib/datas';
import { useCaso } from '../lib/caso/memoria';
import { URL_DE_VOLTA_A_DECISAO } from '../lib/caso/ligacao';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ATALHOS = [
  { href: '/argumenta', nome: 'Argumenta', acao: 'Analisar uma decisão', Icone: FileSearch },
  { href: '/prazozero', nome: 'PrazoZero', acao: 'Calcular um prazo', Icone: CalendarClock },
  { href: '/normaviva', nome: 'NormaViva', acao: 'Consultar uma norma', Icone: BookOpen },
  { href: '/tesemap', nome: 'TeseMap', acao: 'Explorar uma tese', Icone: Network }
] as const;

const PRAZOS_NO_PAINEL = 4;
const RECENTES_NO_PAINEL = 5;

/**
 * O que a pessoa logada vê na página inicial: a busca única, o que vence primeiro, o que ela tocou por último e as quatro ferramentas.
 * Tudo vem do que ela mesma já tem na conta (prazos com aviso e itens salvos) e do caso em andamento nesta aba; nada é sugerido nem inferido.
 */
export default function PainelDoUsuario({ nome }: { nome: string | null }) {
  const caso = useCaso();
  const [prazos, setPrazos] = useState<ItemDaAgenda[] | null>(null);
  const [recentes, setRecentes] = useState<RegistroHistorico[] | null>(null);

  useEffect(() => {
    let ativo = true;
    void listarLembretes().then(l => {
      if (ativo) setPrazos(montarAgenda(l, hojeIso()).flatMap(g => g.itens).slice(0, PRAZOS_NO_PAINEL));
    });
    void carregarHistorico(RECENTES_NO_PAINEL).then(h => {
      if (ativo) setRecentes(h.itens.slice(0, RECENTES_NO_PAINEL));
    });
    return () => {
      ativo = false;
    };
  }, []);

  return (
    <div data-testid="painel-do-usuario" className="pt-10 sm:pt-14 pb-10 flex flex-col gap-8">
      <section className="flex flex-col gap-5 max-w-3xl">
        <div className="flex flex-col gap-2">
          <p className="eyebrow">Seu painel</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight text-ink leading-[1.08]">{nome ? `Olá, ${nome}.` : 'Olá.'}</h1>
        </div>
        <CampoDeBusca />
        <p className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
          <span>Por exemplo:</span>
          {EXEMPLOS_DE_BUSCA.map(e => (
            <Link key={e} href={`/buscar?${new URLSearchParams({ q: e }).toString()}`} className="rounded-md border border-line-strong bg-surface px-2.5 py-1 text-ink hover:bg-surface-2">
              {e}
            </Link>
          ))}
        </p>
      </section>

      {caso && (
        <section aria-label="Análise em andamento" data-testid="painel-caso" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ia/30 bg-ia-tint px-5 py-4 shadow-card">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ia-text">Análise em andamento</p>
            <p className="text-sm text-ink-soft truncate">{caso.rotulo || 'Decisão em análise nesta aba'}</p>
          </div>
          <Link href={URL_DE_VOLTA_A_DECISAO} className={cn(buttonVariants({ variant: 'secondary' }), 'shrink-0')}>
            Voltar à análise
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <CartaoDeContexto titulo="Próximos prazos" icone={<CalendarDays />} data-testid="painel-prazos">
          {prazos === null ? (
            <p className="text-sm text-ink-soft">Carregando…</p>
          ) : prazos.length === 0 ? (
            <p className="text-sm text-ink-soft">
              Nenhum prazo com aviso por e-mail. Ao calcular um prazo no <Link href="/prazozero" className="text-brand-text underline underline-offset-2">PrazoZero</Link>, você pode pedir o aviso.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-line">
              {prazos.map(({ lembrete: p, quando }) => (
                <li key={p.id} className="flex items-baseline justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                  <span className="min-w-0 truncate text-base font-medium text-ink">{p.titulo}</span>
                  <span className="shrink-0 text-sm text-ink-soft">
                    <span className="font-medium text-ink">{quando}</span> · {diaDaSemana(p.vencimento)}, {dataCurta(p.vencimento)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {prazos !== null && prazos.length > 0 && (
            <Link href="/meu-espaco" className="text-sm font-medium text-brand-text hover:underline underline-offset-2">
              Ver a agenda completa
            </Link>
          )}
        </CartaoDeContexto>

        <CartaoDeContexto titulo="Recentes" icone={<Clock />} data-testid="painel-recentes">
          {recentes === null ? (
            <p className="text-sm text-ink-soft">Carregando…</p>
          ) : recentes.length === 0 ? (
            <p className="text-sm text-ink-soft">Os itens que você salvar em Meu espaço aparecem aqui: normas, teses, prazos e análises.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-line">
              {recentes.map(r => (
                <li key={r.id}>
                  <Link href={r.url} className="flex items-baseline justify-between gap-4 py-2.5 hover:bg-surface-2/60 px-2 -mx-2 rounded-sm">
                    <span className="min-w-0 truncate text-base font-medium text-ink">{r.titulo}</span>
                    <span className="shrink-0 text-sm text-ink-mute whitespace-nowrap">
                      {r.modulo} · {tempoRelativo(r.criadoEm)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {recentes !== null && recentes.length > 0 && (
            <Link href="/meu-espaco" className="text-sm font-medium text-brand-text hover:underline underline-offset-2">
              Ver tudo em Meu espaço
            </Link>
          )}
        </CartaoDeContexto>
      </div>

      <ul aria-label="Ferramentas" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {ATALHOS.map(a => (
          <li key={a.href}>
            <Link
              href={a.href}
              className="flex h-full flex-col gap-3 rounded-xl border border-line bg-surface p-5 shadow-card transition-colors hover:bg-surface-2"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-tint text-brand-text">
                <a.Icone className="h-5 w-5" aria-hidden />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="eyebrow">{a.nome}</span>
                <span className="font-serif text-lg font-semibold text-ink leading-snug">{a.acao}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
