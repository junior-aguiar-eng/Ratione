import Link from 'next/link';
import { Badge, type BadgeTom } from '@/components/ui/badge';
import type { EstadoCitacao, VerificacaoDaCitacao } from '../../lib/argumenta/verificarCitacoes';

const ESTADO: Record<EstadoCitacao, { rotulo: string; tom: BadgeTom }> = {
  encontrada: { rotulo: 'Encontrada na base', tom: 'ok' },
  nao_localizada: { rotulo: 'Não localizada na base', tom: 'warn' },
  fora_do_corpus: { rotulo: 'Fora da base', tom: 'neutral' }
};

/** Mostra se a citação do fundamento existe no NormaViva ou no TeseMap, com o link quando existe. Não opina sobre o acerto da citação. */
export default function SeloCitacao({ verificacao }: { verificacao: VerificacaoDaCitacao }) {
  const { rotulo, tom } = ESTADO[verificacao.estado];
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      <Badge variant={tom} title={verificacao.aviso}>
        {rotulo}
      </Badge>
      {verificacao.links.map(l => (
        <Link key={l.href} href={l.href} className="text-sm text-brand-text underline underline-offset-2">
          {l.rotulo}
        </Link>
      ))}
      {verificacao.aviso && <span className="text-xs text-ink-mute">{verificacao.aviso}</span>}
    </span>
  );
}
