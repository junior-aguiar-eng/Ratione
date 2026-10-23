'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download } from 'lucide-react';
import PageHeader from '../../../components/PageHeader';
import EmptyState from '../../../components/EmptyState';
import Notice from '../../../components/Notice';
import { useSessao } from '../../../lib/useSessao';
import { obterSupabase } from '../../../lib/supabase/client';
import {
  ESTADO,
  ROTULO_TIPO,
  cotasDoPlano,
  dataCurta,
  dataHora,
  diasDeHistorico,
  estadoExibido,
  gastouCota,
  historicoEmCsv,
  inicioDoHistorico,
  nomeDoCsv,
  podeExportar,
  type LinhaAnalise,
  type LinhaResumo
} from '../../../lib/uso';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/** Quantas linhas do histórico a tela lê de uma vez. Passando disso, avisa e manda exportar. */
const LIMITE_DE_LINHAS = 500;

type Filtro = 'todas' | 'analises' | 'explicacoes';
const FILTROS: { id: Filtro; rotulo: string }[] = [
  { id: 'todas', rotulo: 'Tudo' },
  { id: 'analises', rotulo: 'Análises' },
  { id: 'explicacoes', rotulo: 'Explicações' }
];

const PERIODO: Record<LinhaResumo['periodo'], string> = { semana: 'por semana', mes: 'por mês' };

/**
 * Meu uso (F8-04): o que o cliente consome, em unidades que ele entende (docs/produto/PLANOS_E_COBRANCA.md §4). Lê o plano e a cota
 * pela função `uso_resumo()` e o histórico pela tabela `analises` (a RLS entrega só as linhas dele). Mostra só metadados: o texto
 * da decisão e a resposta nunca ficam guardados.
 */
export default function MeuUsoPage() {
  const { usuario, carregando, contaDisponivel } = useSessao();
  const [resumo, setResumo] = useState<LinhaResumo[] | null>(null);
  const [historico, setHistorico] = useState<LinhaAnalise[] | null>(null);
  const [truncado, setTruncado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>('todas');

  const usuarioId = usuario?.id;
  useEffect(() => {
    if (!usuarioId) return;
    let ativa = true;
    void (async () => {
      const sb = obterSupabase();
      if (!sb) return;
      const r = await sb.rpc('uso_resumo');
      if (!ativa) return;
      const linhas = (r.data ?? []) as LinhaResumo[];
      if (r.error || linhas.length === 0) {
        setErro('Não foi possível ler o seu uso agora. Tente de novo em alguns minutos.');
        return;
      }
      setResumo(linhas);
      const h = await sb
        .from('analises')
        .select('id, tipo, rotulo, situacao, consumiu, falhas, criada_em, concluida_em')
        .gte('criada_em', inicioDoHistorico(linhas[0].plano))
        .order('criada_em', { ascending: false })
        .limit(LIMITE_DE_LINHAS + 1);
      if (!ativa) return;
      if (h.error) {
        setErro('Não foi possível ler o seu histórico agora. Tente de novo em alguns minutos.');
        return;
      }
      const todas = (h.data ?? []) as LinhaAnalise[];
      setTruncado(todas.length > LIMITE_DE_LINHAS);
      setHistorico(todas.slice(0, LIMITE_DE_LINHAS));
    })();
    return () => {
      ativa = false;
    };
  }, [usuarioId]);

  const plano = resumo?.[0];
  const cotas = useMemo(() => cotasDoPlano(resumo ?? []), [resumo]);
  const visiveis = useMemo(
    () => (historico ?? []).filter(a => filtro === 'todas' || (filtro === 'analises' ? a.tipo !== 'explicacao' : a.tipo === 'explicacao')),
    [historico, filtro]
  );
  const semCusto = useMemo(() => (historico ?? []).filter(a => !gastouCota(a) && a.situacao !== 'em_andamento').length, [historico]);

  const exportar = () => {
    if (!historico) return;
    const blob = new Blob([historicoEmCsv(visiveis)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeDoCsv();
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Meu espaço"
        title="Meu uso"
        description="Quanto da sua cota de IA você usou, o que ainda resta e o histórico de cada análise. Só aparecem datas, tipos e resultados: o texto das decisões não fica guardado."
        actions={
          <Link href="/meu-espaco" className={buttonVariants({ variant: 'secondary' })}>
            <ArrowLeft className="w-4 h-4" />
            Voltar para Meu espaço
          </Link>
        }
      />

      {!carregando && !contaDisponivel && (
        <Notice tom="info" titulo="Conta indisponível">
          O uso fica na sua conta, e esta instalação não tem login configurado.
        </Notice>
      )}
      {!carregando && contaDisponivel && !usuario && (
        <Notice tom="info" titulo="Entre na sua conta">
          Para ver o seu uso,{' '}
          <Link href="/entrar?proximo=/meu-espaco/uso" className="underline underline-offset-2">
            entre na sua conta
          </Link>
          .
        </Notice>
      )}
      {erro && <Notice tom="warn">{erro}</Notice>}

      {plano && (
        <div className="flex flex-col gap-10">
          <section aria-labelledby="uso-plano" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="uso-plano" className="font-serif text-2xl font-semibold text-ink">
                Plano {plano.plano_nome}
              </h2>
              <p className="text-sm text-ink-soft">A cota renova em {dataCurta(plano.fim)}.</p>
            </div>
            <Card className="divide-y divide-line">
              {cotas.map(c => {
                const pct = Math.min(100, Math.round((c.usadas / c.quantidade) * 100));
                return (
                  <div key={c.tipo} className="p-5 flex flex-col gap-2">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-base font-medium text-ink">{ROTULO_TIPO[c.tipo]}</p>
                      <p className="text-sm text-ink-soft">
                        <strong className="text-ink">{c.restantes}</strong> {c.restantes === 1 ? 'restante' : 'restantes'} · {c.usadas} de {c.quantidade} usadas {PERIODO[c.periodo]}
                      </p>
                    </div>
                    <div
                      role="progressbar"
                      aria-label={`${ROTULO_TIPO[c.tipo]}: ${c.usadas} de ${c.quantidade} usadas`}
                      aria-valuemin={0}
                      aria-valuemax={c.quantidade}
                      aria-valuenow={c.usadas}
                      className="h-2 rounded-full bg-surface-2 overflow-hidden"
                    >
                      <div className={`h-full ${c.restantes === 0 ? 'bg-danger' : 'bg-brand'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </Card>
            {plano.plano === 'gratuito' && (
              <Notice tom="info" titulo="Você está no plano Gratuito">
                Os planos pagos, com mais análises, ainda não estão disponíveis. Quando estiverem, as cobranças e o recibo de cada uma aparecem aqui.
              </Notice>
            )}
          </section>

          <section aria-labelledby="uso-historico" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 id="uso-historico" className="font-serif text-2xl font-semibold text-ink">
                  Histórico
                </h2>
                <p className="text-sm text-ink-soft">Últimos {diasDeHistorico(plano.plano)} dias no seu plano. Horário de Brasília.</p>
              </div>
              {podeExportar(plano.plano) ? (
                <Button variant="secondary" type="button" onClick={exportar} disabled={!historico || visiveis.length === 0}>
                  <Download className="w-4 h-4" />
                  Exportar CSV
                </Button>
              ) : (
                <p className="text-sm text-ink-mute">A exportação em CSV está nos planos pagos.</p>
              )}
            </div>

            <div className="flex flex-wrap gap-1" role="group" aria-label="Filtrar o histórico">
              {FILTROS.map(f => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={filtro === f.id}
                  onClick={() => setFiltro(f.id)}
                  className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${filtro === f.id ? 'bg-brand-tint text-brand-text' : 'text-ink-soft hover:text-ink hover:bg-surface-2'}`}
                >
                  {f.rotulo}
                </button>
              ))}
            </div>

            {semCusto > 0 && (
              <p className="text-sm text-ink-soft" aria-live="polite">
                {semCusto} {semCusto === 1 ? 'tentativa não gastou' : 'tentativas não gastaram'} a sua cota (falhou, foi cancelada ou nada foi entregue).
              </p>
            )}
            {truncado && (
              <Notice tom="info">Mostrando as {LIMITE_DE_LINHAS} mais recentes{podeExportar(plano.plano) ? '.' : '; para ver o resto, assine um plano pago.'}</Notice>
            )}

            {historico === null ? null : visiveis.length === 0 ? (
              <EmptyState titulo="Nada por aqui ainda">Quando você analisar uma decisão ou pedir uma explicação de dispositivo, o registro aparece aqui.</EmptyState>
            ) : (
              <ul className="divide-y divide-line border-y border-line">
                {visiveis.map(a => {
                  const estado = estadoExibido(a);
                  const info = ESTADO[estado];
                  const gastou = gastouCota(a);
                  return (
                    <li key={a.id} className="py-4 flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                      <div className="min-w-0 flex flex-col gap-0.5">
                        <p className="text-base font-medium text-ink">{a.rotulo ? a.rotulo : ROTULO_TIPO[a.tipo]}</p>
                        <p className="text-sm text-ink-mute">
                          {a.rotulo ? `${ROTULO_TIPO[a.tipo]} · ` : ''}
                          {dataHora(a.criada_em)}
                        </p>
                        <p className="text-sm text-ink-soft">{info.explicacao}</p>
                      </div>
                      <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5 shrink-0">
                        <Badge variant={info.tom}>{info.rotulo}</Badge>
                        <span className={`text-sm ${gastou ? 'text-ink-soft' : 'text-ok-text'}`}>{gastou ? 'Gastou 1 da cota' : 'Não gastou cota'}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section aria-labelledby="uso-regras" className="flex flex-col gap-3">
            <h2 id="uso-regras" className="font-serif text-2xl font-semibold text-ink">
              Como a cota é contada
            </h2>
            <ul className="list-disc pl-5 flex flex-col gap-1.5 text-base text-ink-soft leading-relaxed">
              <li>Cada análise gasta 1 da cota, uma só vez, mesmo que tenha várias etapas.</li>
              <li>A análise passa a contar quando a primeira etapa é entregue. Se você fechar a página no meio, ela fica como interrompida e a cota é gasta.</li>
              <li>Se o sistema falhar, a cota não é gasta. Se uma etapa depois da primeira falhar de vez, a cota é devolvida.</li>
              <li>Explicação de dispositivo que já tinha sido gerada para outra pessoa não gasta cota.</li>
              <li>O Ratione não guarda o texto da decisão nem a resposta: este histórico mostra só o que aconteceu, não o conteúdo.</li>
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
