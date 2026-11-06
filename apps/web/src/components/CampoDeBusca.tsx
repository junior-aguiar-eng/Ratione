'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { buscaValida, limparBusca } from '../lib/buscaUnica';

export const EXEMPLOS_DE_BUSCA = ['art. 85 CPC', 'Tema 1076', 'Súmula 7', 'apelação'] as const;

/** O campo da busca única: leva a pesquisa para `/buscar?q=`, onde as três ferramentas respondem de uma vez. */
export default function CampoDeBusca({ inicial = '', className, autoFocus }: { inicial?: string; className?: string; autoFocus?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState(inicial);

  return (
    <form
      role="search"
      aria-label="Buscar no Ratione"
      className={className}
      onSubmit={e => {
        e.preventDefault();
        if (buscaValida(q)) router.push(`/buscar?${new URLSearchParams({ q: limparBusca(q) }).toString()}`);
      }}
    >
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-mute absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden />
          <Input
            type="search"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Artigo, tema, súmula ou prazo: art. 85 CPC, Tema 1076, apelação…"
            aria-label="Pesquisar"
            autoComplete="off"
            autoFocus={autoFocus}
            maxLength={80}
            className="h-12 pl-10 text-base"
          />
        </div>
        <Button type="submit" className="h-12 px-5" disabled={!buscaValida(q)}>
          Buscar
        </Button>
      </div>
    </form>
  );
}
