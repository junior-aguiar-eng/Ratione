import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { ligacoesDoPrazo } from '../lib/ligacoes';

export const classeDoChip =
  'inline-flex items-center rounded-md border border-line-strong bg-surface px-3 py-1.5 text-sm text-ink hover:bg-surface-2 transition-colors';

/**
 * Os artigos que fundamentam o prazo calculado, cada um abrindo no NormaViva. Com a data do cálculo, o NormaViva mostra a redação que
 * vigorava nela (o que importa quando o artigo mudou depois). Prazo personalizado não tem fundamento catalogado: fica o link geral.
 */
export default function LigacoesDoPrazo({ prazoId, em }: { prazoId: string; em?: string }) {
  const ligacoes = ligacoesDoPrazo(prazoId, em);
  if (ligacoes.length === 0) {
    return (
      <p className="text-sm text-ink-soft no-print">
        <Link href="/normaviva" className="inline-flex items-center gap-1.5 text-brand-text font-medium hover:underline underline-offset-2">
          Pesquisar a lei no NormaViva
          <ExternalLink className="w-3.5 h-3.5" aria-hidden />
        </Link>
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2 no-print">
      <p className="text-sm text-ink-soft">Fundamento legal no NormaViva{em ? ', na redação vigente na data informada' : ''}:</p>
      <ul className="flex flex-wrap gap-2">
        {ligacoes.map(l => (
          <li key={l.href}>
            <Link href={l.href} className={classeDoChip}>
              {l.rotulo}
              <ExternalLink className="w-3.5 h-3.5 ml-1.5 text-ink-mute" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
