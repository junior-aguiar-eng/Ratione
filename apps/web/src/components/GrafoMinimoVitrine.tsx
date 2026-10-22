import Link from 'next/link';
import grafoMinimo from '@ratione/tesemap/grafo-minimo.json';
import { dataCurta } from '../lib/datas';

/**
 * Vitrine do TeseMap: o grafo mínimo do Tema 1.076/STJ (F4-05), o mesmo que está no banco, lido do arquivo do repositório no build. Só mostra as
 * relações validadas, cada uma com fonte oficial e trecho literal conferido; serve à página inicial e à reserva do /tesemap quando o banco não responde.
 */
type Papel = 'precedente' | 'dispositivo' | 'tema';

interface ArestaVitrine {
  id: string;
  origem: string;
  destino: string;
  tipo: string;
  rotulo: string;
  validacao: { status: string; por: string | null; em: string | null };
}

const PREFIXO_DISPOSITIVO = 'NV|';

const rotuloDoNo = (id: string) => {
  if (id.startsWith(PREFIXO_DISPOSITIVO)) return grafoMinimo.dispositivos.find(d => PREFIXO_DISPOSITIVO + d.id === id)?.rotulo ?? id;
  const stj = id.match(/^STJ-TEMA-(\d+)$/);
  if (stj) return `Tema ${Number(stj[1]).toLocaleString('pt-BR')} do STJ`;
  const rg = id.match(/^STF-RG-(\d+)$/);
  if (rg) return `Tema ${Number(rg[1]).toLocaleString('pt-BR')} do STF (repercussão geral)`;
  return id;
};

const papelDoNo = (id: string): Papel => (id.startsWith(PREFIXO_DISPOSITIVO) ? 'dispositivo' : id.startsWith('STF-RG-') ? 'tema' : 'precedente');

const COR: Record<Papel, string> = { precedente: 'rgb(var(--warn))', dispositivo: 'rgb(var(--info))', tema: 'rgb(var(--rel))' };
const LEGENDA: Array<[string, string]> = [
  ['bg-warn', 'Precedente qualificado do STJ'],
  ['bg-info', 'Dispositivo de lei (NormaViva)'],
  ['bg-rel', 'Tema de repercussão geral do STF']
];

// Duas colunas (viewBox 640x320): o Tema 1.076 no meio da esquerda, o § 6º-A acima dele e o Tema 1.255 abaixo; os parágrafos que ele interpreta à direita.
const ALTURA = 62;
const ESQ = { x: 10, w: 250 };
const DIR = { x: 380, w: 250 };
const POSICOES: Record<string, { x: number; y: number; w: number }> = {
  'NV|LEI-13105-2015|corpo|art. 85, § 6º-A': { ...ESQ, y: 8 },
  'STJ-TEMA-1076': { ...ESQ, y: 128 },
  'STF-RG-1255': { ...ESQ, y: 248 },
  'NV|LEI-13105-2015|corpo|art. 85, § 2º': { ...DIR, y: 8 },
  'NV|LEI-13105-2015|corpo|art. 85, § 3º': { ...DIR, y: 128 },
  'NV|LEI-13105-2015|corpo|art. 85, § 8º': { ...DIR, y: 248 }
};

export default function GrafoMinimoVitrine() {
  const validadas = (grafoMinimo.arestas as ArestaVitrine[]).filter(a => a.validacao.status === 'validado');
  const desenhaveis = validadas.filter(a => POSICOES[a.origem] && POSICOES[a.destino]);
  const ponta = (id: string, lado: 'dir' | 'esq' | 'cima' | 'baixo') => {
    const p = POSICOES[id];
    if (lado === 'cima') return { x: p.x + p.w / 2, y: p.y };
    if (lado === 'baixo') return { x: p.x + p.w / 2, y: p.y + ALTURA };
    return { x: lado === 'dir' ? p.x + p.w : p.x, y: p.y + ALTURA / 2 };
  };
  const validadores = [...new Set(validadas.map(a => a.validacao.por).filter((x): x is string => !!x))];
  const datas = validadas.map(a => a.validacao.em).filter((x): x is string => !!x).sort();

  return (
    <div>
      <svg viewBox="0 0 640 320" className="w-full h-auto hidden sm:block" role="img" aria-label="Mapa do Tema 1.076/STJ com as relações validadas">
        <defs>
          <marker id="seta-vitrine" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z" fill="rgb(var(--ink-mute))" />
          </marker>
        </defs>
        {desenhaveis.map(a => {
          const o = POSICOES[a.origem];
          const d = POSICOES[a.destino];
          const mesmaColuna = o.x === d.x;
          const p1 = mesmaColuna ? ponta(a.origem, o.y < d.y ? 'baixo' : 'cima') : ponta(a.origem, o.x < d.x ? 'dir' : 'esq');
          const p2 = mesmaColuna ? ponta(a.destino, o.y < d.y ? 'cima' : 'baixo') : ponta(a.destino, o.x < d.x ? 'esq' : 'dir');
          return <line key={a.id} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgb(var(--ink-mute))" strokeWidth="1.5" markerEnd="url(#seta-vitrine)" />;
        })}
        {Object.entries(POSICOES).map(([id, p]) => (
          <g key={id}>
            <rect x={p.x} y={p.y} width={p.w} height={ALTURA} rx="8" fill="rgb(var(--surface))" stroke="rgb(var(--line-strong))" />
            <rect x={p.x} y={p.y} width="5" height={ALTURA} rx="2.5" fill={COR[papelDoNo(id)]} />
            <foreignObject x={p.x + 16} y={p.y} width={p.w - 24} height={ALTURA}>
              <div style={{ height: ALTURA, display: 'flex', alignItems: 'center', fontSize: 14, lineHeight: 1.3, fontWeight: 500, color: 'rgb(var(--ink))' }}>{rotuloDoNo(id)}</div>
            </foreignObject>
          </g>
        ))}
      </svg>

      <ul className="flex flex-col gap-3 mt-5">
        {validadas.map(a => (
          <li key={a.id} className="text-sm leading-snug text-ink-soft">
            <span className="font-medium text-ink">{rotuloDoNo(a.origem)}</span> <span className="text-brand-text">{a.tipo}</span>{' '}
            <span className="font-medium text-ink">{rotuloDoNo(a.destino)}</span>: {a.rotulo}
          </li>
        ))}
      </ul>

      <ul className="flex flex-wrap gap-x-5 gap-y-2 mt-5 text-sm text-ink-soft">
        {LEGENDA.map(([c, t]) => (
          <li key={t} className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${c}`} /> {t}
          </li>
        ))}
      </ul>

      <p className="text-sm text-ink-mute mt-4">
        {validadas.length} relações, cada uma com fonte oficial e trecho literal
        {validadores.length > 0 && datas.length > 0 ? `, validadas por ${validadores.join(', ')} em ${dataCurta(datas[datas.length - 1])}` : ''}.{' '}
        <Link href="/tesemap?n=STJ-TEMA-1076" className="text-brand-text underline underline-offset-2">
          Abrir no TeseMap
        </Link>
      </p>
    </div>
  );
}
