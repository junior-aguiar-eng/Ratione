'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpenText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { obterSupabase } from '../../lib/supabase/client';
import { comCaso } from '../../lib/caso/ligacao';
import type { LinkDaCitacao } from '../../lib/argumenta/verificarCitacoes';
import { leitorSupabase, sugeridosDaQuestao, type SugeridosDaQuestao } from '../../lib/argumenta/sugeridos';

const VAZIO: SugeridosDaQuestao = { itens: [], temMais: false };

/**
 * "Para ler também": precedentes que citam os artigos da decisão nesta questão e os que as fontes ligam aos precedentes que ela citou.
 * Só sai da página o identificador público de cada citação conferida; o texto da decisão não vai a lugar nenhum. Só aparece quando há o que mostrar.
 */
export default function SugeridosDaQuestao({ questaoId, links }: { questaoId: string; links: LinkDaCitacao[] }) {
  const [sugeridos, setSugeridos] = useState<SugeridosDaQuestao>(VAZIO);
  // As citações mudam de objeto a cada render da análise; o que decide a busca são os endereços
  const chave = useMemo(() => links.map(l => `${l.rotulo}|${l.href}`).join('\n'), [links]);

  useEffect(() => {
    setSugeridos(VAZIO);
    const sb = obterSupabase();
    if (!sb || !chave) return;
    let ativo = true;
    const dadas = chave.split('\n').map(linha => {
      const [rotulo, href] = linha.split('|');
      return { rotulo, href };
    });
    void sugeridosDaQuestao(leitorSupabase(sb), dadas).then(r => {
      if (ativo) setSugeridos(r);
    });
    return () => {
      ativo = false;
    };
  }, [chave]);

  if (sugeridos.itens.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line bg-surface/85 p-4" data-testid={`sugeridos-${questaoId}`}>
      <p className="flex items-center gap-2 text-sm font-medium text-ink">
        <BookOpenText className="size-4 text-ink-soft" aria-hidden />
        Para ler também
      </p>
      <ul className="flex flex-col divide-y divide-line">
        {sugeridos.itens.map(s => (
          <li key={s.href} className="py-2 first:pt-0 last:pb-0">
            <Link href={comCaso(s.href, questaoId)} className="group flex flex-col gap-0.5">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-brand-text group-hover:underline underline-offset-2">{s.rotulo}</span>
                {s.vinculante && <Badge variant="brand">Vinculante</Badge>}
              </span>
              <span className="text-xs text-ink-mute">
                {s.motivo === 'cita' ? `Cita ${s.origem}, que a decisão usou` : `Ligado a ${s.origem}, que a decisão citou`}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-xs text-ink-mute">
        {sugeridos.temMais ? 'Os primeiros, vinculantes na frente. ' : ''}Sugestão de leitura a partir das citações da decisão, por citação expressa nas fontes. Não indica que o precedente se aplique ao caso.
      </p>
    </div>
  );
}
