import { Badge } from '@/components/ui/badge';
import { segmentosDoTrecho, siglaDaNorma } from '../../lib/normavivaApresentacao';
import type { Norma, Resultado } from '../../lib/normaviva';

interface Props {
  itens: Resultado[];
  normas: Norma[];
  itemId: string | null;
  buscando: boolean;
  aviso?: string;
  onEscolher: (id: string) => void;
}

const sigla = (normas: Norma[], id: string) => siglaDaNorma(id, normas.find(n => n.id === id)?.nome ?? id);
const nomeDe = (normas: Norma[], id: string) => normas.find(n => n.id === id)?.nome ?? id;
const rotuloArt = (r: string) => r.replace(/^art\./, 'Art.');

/**
 * Resultados da pesquisa, em fichas compactas (antes, uma grade de cartões grandes empurrava o texto da lei para baixo).
 * - Mesmo artigo em várias normas ("art. 186"): uma linha de fichas, uma por norma.
 * - Artigos diferentes (pesquisa por assunto): lista compacta, de uma linha por resultado, com rolagem própria.
 */
export default function ResultadosDaBusca({ itens, normas, itemId, buscando, aviso, onEscolher }: Props) {
  if (itens.length === 0) return <p className="text-sm text-ink-soft">{buscando ? 'Pesquisando…' : 'Nenhum dispositivo encontrado.'}</p>;

  const mesmoArtigo = itens.length > 1 && itens.every(r => r.rotulo === itens[0].rotulo);

  return (
    <div className="flex flex-col gap-2" aria-live="polite">
      {aviso && <p className="text-sm text-ink-soft">{aviso}</p>}
      {mesmoArtigo ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-ink-soft mr-1">
            {rotuloArt(itens[0].rotulo)} em {itens.length} normas:
          </span>
          {itens.map(r => {
            const ativo = r.id === itemId;
            return (
              <button
                key={r.id}
                type="button"
                aria-pressed={ativo}
                title={`${nomeDe(normas, r.norma_id)}: ${r.trecho}`}
                onClick={() => onEscolher(r.id)}
                className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                  ativo ? 'border-brand bg-brand-tint text-brand-text font-semibold' : 'border-line-strong bg-surface text-ink-soft hover:bg-surface-2'
                }`}
              >
                {sigla(normas, r.norma_id)}
              </button>
            );
          })}
        </div>
      ) : (
        <ul className="rounded-lg border border-line bg-surface/85 divide-y divide-line max-h-72 overflow-y-auto shadow-card">
          {itens.map(r => {
            const ativo = r.id === itemId;
            return (
              <li key={r.id}>
                <button
                  type="button"
                  aria-pressed={ativo}
                  onClick={() => onEscolher(r.id)}
                  className={`w-full text-left px-4 py-2.5 transition-colors ${ativo ? 'bg-brand-tint' : 'hover:bg-surface-2'}`}
                >
                  <span className="flex flex-wrap items-baseline gap-x-2 text-sm">
                    <span className="font-semibold text-ink">{rotuloArt(r.rotulo)}</span>
                    <span className="text-ink-mute">{sigla(normas, r.norma_id)}</span>
                    {r.via_sinonimo && (
                      <Badge variant="info" data-testid="via-sinonimo">
                        por “{r.via_sinonimo}”
                      </Badge>
                    )}
                  </span>
                  <span className="block text-sm text-ink-soft line-clamp-1">
                    {segmentosDoTrecho(r.trecho).map((s, i) =>
                      s.destaque ? (
                        <mark key={i} className="bg-brand-tint text-ink rounded-sm px-0.5">
                          {s.texto}
                        </mark>
                      ) : (
                        <span key={i}>{s.texto}</span>
                      )
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
