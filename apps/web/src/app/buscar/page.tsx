'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, CalendarClock, Network, Search } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import Notice from '../../components/Notice';
import { CartaoDeLeitura } from '../../components/Cartoes';
import { EXEMPLOS_DE_BUSCA } from '../../components/CampoDeBusca';
import { Input } from '@/components/ui/input';
import { obterSupabase } from '../../lib/supabase/client';
import { buscaValida, buscarEmTudo, limparBusca, type FerramentaDaBusca, type GrupoDaBusca } from '../../lib/buscaUnica';
import { lerBusca } from '../../lib/parametrosSalvos';

const ICONE: Record<FerramentaDaBusca, typeof Search> = { normaviva: BookOpen, tesemap: Network, prazozero: CalendarClock };
const DESCRICAO: Record<FerramentaDaBusca, string> = {
  normaviva: 'Legislação federal, na redação de cada data',
  tesemap: 'Precedentes, temas e súmulas do STJ e do STF',
  prazozero: 'Prazos processuais e materiais, com a base legal'
};

export default function BuscarPage() {
  const db = useMemo(() => obterSupabase(), []);
  const [q, setQ] = useState('');
  const [grupos, setGrupos] = useState<GrupoDaBusca[] | null>(null);
  const [buscando, setBuscando] = useState(false);
  const sequencia = useRef(0);

  useEffect(() => {
    const doLink = lerBusca(window.location.search);
    if (doLink) setQ(doLink);
  }, []);

  // Pequena espera depois da última tecla; só vale a resposta da pesquisa mais recente; a URL guarda só a pesquisa, sem empilhar histórico
  useEffect(() => {
    if (!buscaValida(q)) {
      setGrupos(null);
      setBuscando(false);
      return;
    }
    const minha = ++sequencia.current;
    setBuscando(true);
    const t = setTimeout(async () => {
      const r = await buscarEmTudo(db, q);
      if (minha !== sequencia.current) return;
      setGrupos(r);
      setBuscando(false);
      window.history.replaceState(null, '', `/buscar?${new URLSearchParams({ q: limparBusca(q) }).toString()}`);
    }, 300);
    return () => clearTimeout(t);
  }, [db, q]);

  const semNada = grupos !== null && grupos.every(g => g.itens.length === 0 && !g.indisponivel);

  return (
    <div>
      <PageHeader eyebrow="Buscar" title="Uma pesquisa, três bases" description="Legislação, precedentes e prazos de uma vez. Cada resultado abre na ferramenta própria, com a fonte oficial." />

      <div className="relative max-w-3xl">
        <Search className="w-4 h-4 text-ink-mute absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden />
        <Input
          type="search"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="art. 85 CPC, Tema 1076, Súmula 7, apelação…"
          aria-label="Pesquisar"
          autoComplete="off"
          autoFocus
          maxLength={80}
          className="h-12 pl-10 text-base"
        />
      </div>

      {!buscaValida(q) && (
        <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
          <span>Por exemplo:</span>
          {EXEMPLOS_DE_BUSCA.map(e => (
            <button key={e} type="button" onClick={() => setQ(e)} className="rounded-md border border-line-strong bg-surface px-3 py-1.5 text-ink hover:bg-surface-2">
              {e}
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-6" aria-live="polite">
        {buscando && grupos === null && <p className="text-sm text-ink-soft">Pesquisando…</p>}
        {semNada && !buscando && (
          <EmptyState titulo="Nada encontrado">Tente o número do artigo (art. 85 CPC), o número do tema (Tema 1076) ou uma palavra do assunto.</EmptyState>
        )}
        {grupos && !semNada && (
          <div className={`grid grid-cols-1 xl:grid-cols-3 gap-6 items-start ${buscando ? 'opacity-60' : ''}`}>
            {grupos.map(g => (
              <GrupoDeResultados key={g.ferramenta} g={g} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GrupoDeResultados({ g }: { g: GrupoDaBusca }) {
  const Icone = ICONE[g.ferramenta];
  return (
    <CartaoDeLeitura aria-label={`Resultados no ${g.titulo}`} data-testid={`resultados-${g.ferramenta}`} className="gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-serif text-xl font-semibold text-ink flex items-center gap-2">
          <Icone className="w-5 h-5 text-brand-text" aria-hidden />
          {g.titulo}
        </h2>
        <p className="text-sm text-ink-mute">{DESCRICAO[g.ferramenta]}</p>
      </div>

      {g.indisponivel ? (
        <Notice tom="info" titulo={`O ${g.titulo} não respondeu agora`}>
          Abra a ferramenta para tentar de novo.
        </Notice>
      ) : g.itens.length === 0 ? (
        <p className="text-sm text-ink-soft">Nenhum resultado no {g.titulo}.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line">
          {g.itens.map(i => (
            <li key={i.href} className="py-3 first:pt-0 last:pb-0">
              <Link href={i.href} className="group flex flex-col gap-1">
                <span className="text-base font-semibold text-brand-text group-hover:underline underline-offset-2">{i.rotulo}</span>
                {i.detalhe && <span className="text-sm text-ink-soft leading-snug">{i.detalhe}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link href={g.verTodos} className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-brand-text hover:underline underline-offset-2">
        {g.temMais ? `Ver todos no ${g.titulo}` : `Abrir o ${g.titulo}`}
        <ArrowRight className="w-4 h-4" aria-hidden />
      </Link>
    </CartaoDeLeitura>
  );
}
