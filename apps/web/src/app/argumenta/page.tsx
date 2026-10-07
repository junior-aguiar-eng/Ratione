'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Bookmark, Check, ExternalLink, FileText } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Notice from '../../components/Notice';
import { DECISAO_DEMO, TRECHOS_DEMO, TRECHO_POR_ITEM } from '../../lib/decisaoDemo';
import { salvarRegistro } from '../../lib/historico';

type Aba = 'geral' | 'teses' | 'estrutura' | 'fragilidades' | 'estrategia';

const ABAS: { id: Aba; rotulo: string }[] = [
  { id: 'geral', rotulo: 'Visão geral' },
  { id: 'teses', rotulo: 'Teses' },
  { id: 'estrutura', rotulo: 'Estrutura' },
  { id: 'fragilidades', rotulo: 'Fragilidades da fundamentação' },
  { id: 'estrategia', rotulo: 'Estratégia' }
];

const TIPO_PREMISSA: Record<string, { rotulo: string; tag: string }> = {
  fato_provado: { rotulo: 'Fato', tag: 'tag-ok' },
  fato_controverso: { rotulo: 'Fato controverso', tag: 'tag-warn' },
  norma_positivada: { rotulo: 'Norma', tag: 'tag-info' },
  precedente_judicial: { rotulo: 'Precedente', tag: 'tag-rel' },
  presuncao_legal: { rotulo: 'Presunção', tag: 'tag-neutral' }
};

const INCISO_ROTULO: Record<string, string> = {
  I_MERA_REPRODUCAO_NORMATIVA: 'CPC, art. 489, § 1º, I',
  II_CONCEITO_INDETERMINADO_SEM_CONCRECAO: 'CPC, art. 489, § 1º, II',
  III_MOTIVOS_GENERICOS_QUALQUER_DECISAO: 'CPC, art. 489, § 1º, III',
  IV_NAO_ENFRENTAMENTO_ARGUMENTO_CAPAZ: 'CPC, art. 489, § 1º, IV',
  V_PRECEDENTE_SEM_DEMONSTRACAO_SIMILITUDE: 'CPC, art. 489, § 1º, V',
  VI_DESRESPEITO_PRECEDENTE_SEM_DISTINCAO: 'CPC, art. 489, § 1º, VI'
};

const SECOES: { rotulo: string; paginas: string; aba: Aba; trecho: string }[] = [
  { rotulo: 'Relatório', paginas: 'p. 1–2', aba: 'geral', trecho: 't-relatorio' },
  { rotulo: 'Preliminares', paginas: 'p. 3', aba: 'estrutura', trecho: 't-preliminar' },
  { rotulo: 'Fundamentação', paginas: 'p. 4–7', aba: 'teses', trecho: 't-responsabilidade' },
  { rotulo: 'Dispositivo', paginas: 'p. 8', aba: 'geral', trecho: 't-dispositivo' }
];

const FONTES = [
  { rotulo: 'CDC, art. 14', href: 'https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm', externa: true },
  { rotulo: 'Súmula 479/STJ', href: '/tesemap', externa: false },
  { rotulo: 'CPC, art. 85, § 2º', href: '/normaviva', externa: false },
  { rotulo: 'Tema 1.076/STJ', href: '/tesemap', externa: false }
];

export default function ArgumentaPage() {
  const decisao = DECISAO_DEMO;
  const [aba, setAba] = useState<Aba>('geral');
  const [trechoAtivo, setTrechoAtivo] = useState<string>('t-relatorio');
  const [salvo, setSalvo] = useState(false);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const listaRef = useRef<HTMLUListElement | null>(null);
  const primeiraRenderizacao = useRef(true);

  // Rola apenas a lista de trechos (nunca a página) e só após ação do usuário.
  useEffect(() => {
    if (primeiraRenderizacao.current) {
      primeiraRenderizacao.current = false;
      return;
    }
    const el = refs.current[trechoAtivo];
    if (el && listaRef.current) {
      listaRef.current.scrollTo({ top: Math.max(el.offsetTop - 8, 0), behavior: 'smooth' });
    }
  }, [trechoAtivo]);

  const vulnerabilidades = decisao.fundamentacao.tesesIdentificadas.flatMap(t => t.vulnerabilidades);

  const verNoDocumento = (id: string) => setTrechoAtivo(TRECHO_POR_ITEM[id] ?? id);

  const salvar = () => {
    salvarRegistro({
      modulo: 'Argumenta',
      tipo: 'decisao',
      titulo: 'Sentença cível · fraude bancária e PIX (exemplo)',
      detalhe: `${vulnerabilidades.length} ponto de atenção na fundamentação (CPC, art. 489, § 1º)`,
      url: '/argumenta'
    });
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Argumenta"
        title="Análise da decisão"
        description="Veja como a decisão foi construída: teses, premissas, conclusões e pontos de atenção da fundamentação, com o trecho original ao lado."
        actions={
          <>
            <button type="button" onClick={salvar} className="btn-secondary">
              {salvo ? <Check className="w-4 h-4 text-ok-text" /> : <Bookmark className="w-4 h-4" />}
              {salvo ? 'Salvo em Meu espaço' : 'Salvar em Meu espaço'}
            </button>
            <Link href="/prazozero" className="btn-primary">
              Calcular prazo recursal
            </Link>
          </>
        }
      />

      <div className="mb-8">
        <Notice tom="info" titulo="Análise de exemplo">
          Esta é uma decisão ilustrativa, criada para demonstrar o módulo. O envio de documentos ainda não está
          disponível.
        </Notice>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Documento */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-5" aria-label="Documento analisado">
          <div className="card p-5 space-y-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-brand-text mt-0.5 shrink-0" aria-hidden />
              <div>
                <p className="text-base font-semibold text-ink">Sentença cível</p>
                <p className="text-sm text-ink-soft">{decisao.tribunalOuVara}</p>
                <p className="text-sm text-ink-mute mt-1">
                  Processo <span className="font-mono text-ink-soft">{decisao.numeroProcesso}</span>
                </p>
              </div>
            </div>

            <nav aria-label="Seções da decisão" className="border-t border-line pt-3">
              <ul className="space-y-0.5">
                {SECOES.map(s => (
                  <li key={s.rotulo}>
                    <button
                      type="button"
                      onClick={() => {
                        setAba(s.aba);
                        setTrechoAtivo(s.trecho);
                      }}
                      className="w-full flex items-baseline justify-between px-2.5 py-2 rounded-md text-sm text-ink-soft hover:text-ink hover:bg-surface-2 transition-colors"
                    >
                      <span className="font-medium">{s.rotulo}</span>
                      <span className="text-ink-mute">{s.paginas}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="card overflow-hidden">
            <h2 className="px-5 py-3 text-sm font-semibold text-ink border-b border-line bg-surface-2">
              Trechos da decisão
            </h2>
            <ul ref={listaRef} className="relative max-h-[420px] overflow-y-auto divide-y divide-line">
              {TRECHOS_DEMO.map(t => {
                const ativo = t.id === trechoAtivo;
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      ref={el => {
                        refs.current[t.id] = el;
                      }}
                      onClick={() => setTrechoAtivo(t.id)}
                      aria-pressed={ativo}
                      className={`w-full text-left px-5 py-4 border-l-[3px] transition-colors ${
                        ativo ? 'bg-brand-tint border-brand' : 'border-transparent hover:bg-surface-2'
                      }`}
                    >
                      <span className="flex items-center justify-between text-xs text-ink-mute mb-1.5">
                        <span>{t.secao}</span>
                        <span>
                          p. {t.pagina}, § {t.paragrafo}
                        </span>
                      </span>
                      <span className="block font-serif text-[15px] leading-relaxed text-ink">{t.texto}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Análise */}
        <div className="lg:col-span-8 space-y-8">
          <div role="tablist" aria-label="Seções da análise" className="flex gap-1 border-b border-line overflow-x-auto">
            {ABAS.map(a => {
              const ativa = aba === a.id;
              return (
                <button
                  key={a.id}
                  role="tab"
                  type="button"
                  id={`aba-${a.id}`}
                  aria-selected={ativa}
                  aria-controls="painel-analise"
                  onClick={() => setAba(a.id)}
                  className={`relative whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                    ativa ? 'text-ink' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  {a.rotulo}
                  {a.id === 'fragilidades' && vulnerabilidades.length > 0 && (
                    <span className="tag-danger !px-1.5">{vulnerabilidades.length}</span>
                  )}
                  {ativa && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-brand" />}
                </button>
              );
            })}
          </div>

          <div id="painel-analise" role="tabpanel" aria-labelledby={`aba-${aba}`} className="space-y-10">
            {aba === 'geral' && (
              <>
                <section className="space-y-3">
                  <h2 className="font-serif text-2xl font-semibold text-ink">Resumo do caso</h2>
                  <p className="text-base text-ink-soft leading-relaxed">{decisao.relatorio.resumoFatico}</p>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3 text-sm">
                    <div>
                      <dt className="text-ink-mute">Autor</dt>
                      <dd className="text-base font-medium text-ink mt-0.5">{decisao.relatorio.partes.poloAtivo.join(', ')}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-mute">Réu</dt>
                      <dd className="text-base font-medium text-ink mt-0.5">{decisao.relatorio.partes.poloPassivo.join(', ')}</dd>
                    </div>
                  </dl>
                  <div className="pt-2">
                    <h3 className="text-sm font-semibold text-ink mb-2">Pedidos</h3>
                    <ul className="list-disc pl-5 space-y-1 text-base text-ink-soft">
                      {decisao.relatorio.pedidosPrincipais.map(p => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </section>

                <section className="border-t border-line pt-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <h2 className="font-serif text-2xl font-semibold text-ink">Dispositivo</h2>
                    <span className="tag-ok">Procedente</span>
                  </div>
                  <blockquote className="font-serif text-lg leading-[1.7] text-ink border-l-2 border-brand pl-5">
                    {decisao.dispositivo.conteudoDispositivo}
                  </blockquote>
                  <p className="text-sm text-ink-soft">{decisao.dispositivo.honorarios}</p>
                </section>

                <section className="border-t border-line pt-8 space-y-3">
                  <h2 className="font-serif text-2xl font-semibold text-ink">Fontes citadas</h2>
                  <ul className="divide-y divide-line border-y border-line">
                    {FONTES.map(f => (
                      <li key={f.rotulo}>
                        {f.externa ? (
                          <a
                            href={f.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between py-3 text-base text-ink hover:text-brand-text"
                          >
                            {f.rotulo}
                            <ExternalLink className="w-4 h-4 text-ink-mute" />
                          </a>
                        ) : (
                          <Link href={f.href} className="flex items-center justify-between py-3 text-base text-ink hover:text-brand-text">
                            {f.rotulo}
                            <ArrowRight className="w-4 h-4 text-ink-mute" />
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            )}

            {aba === 'teses' &&
              decisao.fundamentacao.tesesIdentificadas.map((tese, i) => (
                <section key={tese.id} className={`space-y-5 ${i > 0 ? 'border-t border-line pt-8' : ''}`}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="eyebrow">Tese {i + 1}</span>
                      {tese.vulnerabilidades.length > 0 && (
                        <button type="button" onClick={() => setAba('fragilidades')} className="tag-danger hover:underline">
                          {tese.vulnerabilidades.length} ponto de atenção
                        </button>
                      )}
                    </div>
                    <h2 className="font-serif text-2xl font-semibold text-ink leading-snug">{tese.titulo}</h2>
                  </div>

                  <ol className="space-y-0">
                    {tese.premissas.map(p => {
                      const tipo = TIPO_PREMISSA[p.tipo];
                      return (
                        <li key={p.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <span className={`${tipo.tag} w-28 justify-center`}>{tipo.rotulo}</span>
                            <span className="w-px flex-1 bg-line-strong my-1" />
                          </div>
                          <div className="pb-5 pt-0.5">
                            <p className="text-base text-ink leading-snug">{p.descricao}</p>
                            <button
                              type="button"
                              onClick={() => verNoDocumento(p.id)}
                              className="text-sm text-brand-text hover:underline underline-offset-2 mt-1"
                            >
                              Ver no documento · p. {p.paginaDoc}
                            </button>
                          </div>
                        </li>
                      );
                    })}
                    <li className="flex gap-4">
                      <span className="tag-brand w-28 justify-center self-start">Conclusão</span>
                      <p className="text-base font-medium text-ink leading-snug pt-0.5">{tese.conclusao}</p>
                    </li>
                  </ol>
                </section>
              ))}

            {aba === 'estrutura' && (
              <ol className="space-y-8">
                {[
                  {
                    rotulo: 'Relatório',
                    paginas: 'p. 1–2',
                    trecho: 't-relatorio',
                    itens: [decisao.relatorio.resumoFatico]
                  },
                  {
                    rotulo: 'Preliminares',
                    paginas: 'p. 3',
                    trecho: 't-preliminar',
                    itens: decisao.fundamentacao.questoesPrejudiciaisOuPreliminares
                  },
                  {
                    rotulo: 'Fundamentação',
                    paginas: 'p. 4–7',
                    trecho: 't-responsabilidade',
                    itens: decisao.fundamentacao.tesesIdentificadas.map(t => t.titulo)
                  },
                  {
                    rotulo: 'Dispositivo',
                    paginas: 'p. 8',
                    trecho: 't-dispositivo',
                    itens: [decisao.dispositivo.conteudoDispositivo]
                  }
                ].map(s => (
                  <li key={s.rotulo} className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-x-8 gap-y-2">
                    <div>
                      <h2 className="font-serif text-xl font-semibold text-ink">{s.rotulo}</h2>
                      <button
                        type="button"
                        onClick={() => setTrechoAtivo(s.trecho)}
                        className="text-sm text-brand-text hover:underline underline-offset-2"
                      >
                        {s.paginas}
                      </button>
                    </div>
                    <ul className="space-y-2 text-base text-ink-soft leading-relaxed">
                      {s.itens.map(i => (
                        <li key={i}>{i}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            )}

            {aba === 'fragilidades' && (
              <>
                <p className="text-base text-ink-soft leading-relaxed">
                  Pontos em que a fundamentação pode não atender ao dever de análise completa dos argumentos (CPC, art.
                  489, § 1º).
                </p>
                {vulnerabilidades.map(v => (
                  <section key={v.id} className="rounded-lg border border-danger/40 bg-danger-tint/50 p-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="tag-danger">{INCISO_ROTULO[v.tipoInciso]}</span>
                      <span className="text-sm text-ink-mute">
                        p. {v.pagina}, § {v.paragrafo}
                      </span>
                    </div>
                    <h2 className="font-serif text-xl font-semibold text-ink leading-snug">{v.titulo}</h2>
                    <p className="text-base text-ink-soft leading-relaxed">{v.explicacao}</p>
                    <blockquote className="font-serif text-base italic text-ink border-l-2 border-danger pl-4">
                      {v.trechoTexto}
                    </blockquote>
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-sm">
                      <button
                        type="button"
                        onClick={() => verNoDocumento(v.id)}
                        className="font-medium text-brand-text hover:underline underline-offset-2"
                      >
                        Ver no documento
                      </button>
                      <Link
                        href="/prazozero"
                        className="inline-flex items-center gap-1.5 font-medium text-brand-text hover:underline underline-offset-2"
                      >
                        Embargos de declaração: calcular o prazo de 5 dias
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </section>
                ))}
              </>
            )}

            {aba === 'estrategia' && (
              <ul className="divide-y divide-line border-y border-line">
                <li className="py-6 space-y-2">
                  <h2 className="font-serif text-xl font-semibold text-ink">Opor embargos de declaração</h2>
                  <p className="text-base text-ink-soft leading-relaxed">
                    Suscitar a omissão quanto à alegação de entrega do código OTP pelo correntista a terceiro.
                  </p>
                  <Link href="/prazozero" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-text hover:underline underline-offset-2">
                    Calcular o prazo <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </li>
                <li className="py-6 space-y-2">
                  <h2 className="font-serif text-xl font-semibold text-ink">Contrarrazões com o Tema 1.076/STJ</h2>
                  <p className="text-base text-ink-soft leading-relaxed">
                    Sustentar a manutenção dos honorários fixados em percentual objetivo sobre a condenação.
                  </p>
                  <Link href="/tesemap" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-text hover:underline underline-offset-2">
                    Ver o precedente no TeseMap <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
