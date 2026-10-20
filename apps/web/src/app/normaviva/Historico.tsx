import React from 'react';
import { Check, Clock } from 'lucide-react';
import { diffPalavras } from '../../lib/diffTexto';
import type { EtapaDaLinha } from '../../lib/linhaDoTempo';

/**
 * "O que mudou" (F3-04): a diferença entre duas redações, palavra por palavra. O que saiu aparece riscado e o que entrou, destacado; o sentido
 * não depende só da cor (risco e fundo diferentes, e `<del>` e `<ins>` para leitores de tela).
 */
export function DiffTexto({ antes, depois }: { antes: string; depois: string }) {
  const trechos = diffPalavras(antes, depois);
  return (
    <p className="font-serif text-lg leading-[1.75] text-ink" data-testid="diff-texto">
      {trechos.map((t, i) =>
        t.tipo === 'igual' ? (
          <span key={i}>{t.texto}</span>
        ) : t.tipo === 'removido' ? (
          <del key={i} className="bg-danger-tint text-danger-text line-through decoration-1 rounded-sm px-0.5">
            {t.texto}
          </del>
        ) : (
          <ins key={i} className="bg-ok-tint text-ok-text no-underline rounded-sm px-0.5">
            {t.texto}
          </ins>
        )
      )}
    </p>
  );
}

/** Linha do tempo das redações, da mais antiga para a atual. */
export function LinhaDoTempo({ etapas }: { etapas: EtapaDaLinha[] }) {
  return (
    <ol className="flex flex-col gap-4 border-l-2 border-line pl-4" aria-label="Linha do tempo das redações" data-testid="linha-do-tempo">
      {etapas.map(e => (
        <li key={e.chave} className="relative">
          <span
            aria-hidden
            className={`absolute -left-[1.4rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 ${e.atual ? 'bg-brand border-brand' : 'bg-surface border-line-strong'}`}
          />
          <p className="text-sm font-semibold text-ink">{e.titulo}</p>
          {e.periodo && <p className="text-sm text-ink num">{e.periodo}</p>}
          <p className="text-sm text-ink-soft">{e.ato}</p>
          {e.provisoria && <p className="text-xs text-ink-mute mt-0.5">Datas provisórias (publicação do ato)</p>}
          {e.conferida !== null && (
            <p className="text-xs mt-0.5 inline-flex items-center gap-1 text-ink-mute">
              {e.conferida ? <Check className="w-3 h-3 text-ok-text" aria-hidden /> : <Clock className="w-3 h-3" aria-hidden />}
              {e.conferida ? 'Texto conferido no Diário Oficial' : 'Texto ainda não conferido no Diário Oficial'}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
