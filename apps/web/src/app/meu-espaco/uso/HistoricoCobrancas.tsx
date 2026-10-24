'use client';

import { useEffect, useState } from 'react';
import EmptyState from '../../../components/EmptyState';
import Notice from '../../../components/Notice';
import { obterSupabase } from '../../../lib/supabase/client';
import { dataHora, precoEmReais } from '../../../lib/uso';
import { lerHistoricoCobrancas, type LinhaCobranca, type PaginaCobrancas } from '../../../lib/cobranca/historico';
import type { Ambiente } from '../../../lib/cobranca/config';
import { Badge, type BadgeTom } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const SITUACOES: Record<LinhaCobranca['situacao'], { rotulo: string; tom: BadgeTom }> = {
  aprovada: { rotulo: 'Aprovada', tom: 'ok' },
  pendente: { rotulo: 'Pendente', tom: 'warn' },
  rejeitada: { rotulo: 'Rejeitada', tom: 'danger' },
  reembolsada: { rotulo: 'Reembolsada', tom: 'info' },
  cancelada: { rotulo: 'Cancelada', tom: 'neutral' }
};

export function RegistroCobranca({ cobranca: c }: { cobranca: LinhaCobranca }) {
  return (
    <li className="py-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div className="min-w-0 flex flex-col gap-1">
        <p className="font-medium text-ink">{precoEmReais(c.valor_centavos)}</p>
        <p className="text-sm text-ink-soft">Registrada em {dataHora(c.criada_em)}</p>
        {/* A integração também usa debit_date neste campo; a data sozinha não comprova aprovação. */}
        {c.paga_em && <p className="text-sm text-ink-soft">Data informada pelo Mercado Pago: {dataHora(c.paga_em)}</p>}
        <p className="text-sm text-ink-mute break-words">Meio de pagamento: {c.meio ?? 'não informado pelo Mercado Pago'}</p>
      </div>
      <Badge variant={SITUACOES[c.situacao].tom}>{SITUACOES[c.situacao].rotulo}</Badge>
    </li>
  );
}

/** Montado apenas depois de o servidor liberar a cobrança; a chave do pai isola usuário e ambiente. */
export default function HistoricoCobrancas({ usuarioId, ambiente, atualizacao }: { usuarioId: string; ambiente: Ambiente; atualizacao?: string }) {
  const [pagina, setPagina] = useState(0);
  const [versao, setVersao] = useState(0);
  const [resultado, setResultado] = useState<PaginaCobrancas | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativa = true;
    setCarregando(true);
    setResultado(null);
    setErro(null);
    void (async () => {
      try {
        const sb = obterSupabase();
        if (!sb) throw new Error('Conta indisponível.');
        const dados = await lerHistoricoCobrancas(sb, usuarioId, ambiente, pagina);
        if (ativa) setResultado(dados);
      } catch {
        if (ativa) setErro('Não foi possível ler as suas cobranças agora. Tente atualizar a lista.');
      } finally {
        if (ativa) setCarregando(false);
      }
    })();
    return () => { ativa = false; };
  }, [usuarioId, ambiente, pagina, versao, atualizacao]);

  return (
    <section aria-labelledby="uso-cobrancas" className="flex flex-col gap-4" aria-busy={carregando}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 id="uso-cobrancas" className="font-serif text-xl font-semibold text-ink">Cobranças</h3>
          <p className="text-sm text-ink-soft">{ambiente === 'teste' ? 'Somente cobranças de teste, sem pagamento real. ' : ''}Horário de Brasília.</p>
        </div>
        <Button type="button" variant="secondary" disabled={carregando} onClick={() => { setPagina(0); setVersao(v => v + 1); }}>
          Atualizar cobranças
        </Button>
      </div>
      {carregando && <p role="status" className="text-sm text-ink-soft">Carregando cobranças…</p>}
      {erro && <Notice tom="warn">{erro}</Notice>}
      {resultado && (resultado.linhas.length === 0 ? (
        <EmptyState titulo="Nenhuma cobrança nesta página">{pagina === 0 ? 'As cobranças da sua assinatura aparecem aqui quando forem informadas pelo Mercado Pago.' : 'Volte à página anterior ou atualize a lista.'}</EmptyState>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {resultado.linhas.map(c => <RegistroCobranca key={c.id} cobranca={c} />)}
        </ul>
      ))}
      <nav aria-label="Páginas de cobranças" className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="secondary" disabled={carregando || pagina === 0} onClick={() => setPagina(p => p - 1)}>Anterior</Button>
        <span className="text-sm text-ink-soft">Página {pagina + 1}</span>
        <Button type="button" variant="secondary" disabled={carregando || !resultado?.temMais} onClick={() => setPagina(p => p + 1)}>Próxima</Button>
      </nav>
    </section>
  );
}
