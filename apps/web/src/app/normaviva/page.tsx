'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bookmark, Check, ExternalLink, Search } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Notice from '../../components/Notice';
import { dataCurta, hojeIso } from '../../lib/datas';
import { useSalvar } from '../../lib/useSalvar';
import { rotuloSalvar } from '../../lib/rotuloSalvar';
import { lerNormaViva, urlDoNormaViva } from '../../lib/parametrosSalvos';
import { obterSupabase } from '../../lib/supabase/client';
import { carregarDetalhe, listarNormas, pesquisar, type Detalhe, type Norma, type ResultadoDaBusca } from '../../lib/normaviva';
import { ROTULO_ESCOPO, ROTULO_ORIGEM, ROTULO_RELACAO, segmentosDoTrecho, situacaoEm } from '../../lib/normavivaApresentacao';
import { linhaDoTempo } from '../../lib/linhaDoTempo';
import { DiffTexto, LinhaDoTempo } from './Historico';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

/** "art. 85, § 2º, I" → profundidade 2 (artigo = 0); usada só para recuar o texto. */
const profundidade = (rotulo: string) => rotulo.split(', ').length - 1;
const ultimoPasso = (rotulo: string) => {
  const p = rotulo.split(', ').pop() ?? rotulo;
  return p.startsWith('art. ') ? `Art. ${p.slice(5)}` : p;
};

export default function NormaVivaPage() {
  const db = useMemo(() => obterSupabase(), []);
  const [normas, setNormas] = useState<Norma[]>([]);
  const [busca, setBusca] = useState('');
  const [resultado, setResultado] = useState<ResultadoDaBusca>({ tipo: 'vazio' });
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [itemId, setItemId] = useState<string | null>(null);
  const [detalhe, setDetalhe] = useState<Detalhe | null>(null);
  const [abrindo, setAbrindo] = useState(false);
  const [hoje, setHoje] = useState('');
  const [dataConsulta, setDataConsulta] = useState('');
  const { estado: estadoSalvo, salvar: salvarNaConta } = useSalvar();
  const salvo = estadoSalvo === 'salvo';
  const sequencia = useRef(0);

  useEffect(() => {
    const h = hojeIso();
    const salvo = lerNormaViva(window.location.search);
    setHoje(h);
    setDataConsulta(salvo.em ?? h);
    if (salvo.dispositivoId) setItemId(salvo.dispositivoId);
  }, []);

  useEffect(() => {
    if (!db) return;
    listarNormas(db).then(setNormas).catch(e => setErro(String(e.message ?? e)));
  }, [db]);

  // Pesquisa com pequena espera depois da última tecla; só vale a resposta da pesquisa mais recente
  useEffect(() => {
    if (!db || normas.length === 0) return;
    const minha = ++sequencia.current;
    const t = setTimeout(async () => {
      setBuscando(true);
      try {
        const r = await pesquisar(db, busca, normas);
        if (minha === sequencia.current) {
          setResultado(r);
          setErro(null);
        }
      } catch (e) {
        if (minha === sequencia.current) setErro((e as Error).message);
      } finally {
        if (minha === sequencia.current) setBuscando(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [db, busca, normas]);

  useEffect(() => {
    if (!db || !itemId || normas.length === 0) return;
    let vivo = true;
    setAbrindo(true);
    carregarDetalhe(db, itemId, normas)
      .then(d => vivo && (setDetalhe(d), setErro(null)))
      .catch(e => vivo && setErro((e as Error).message))
      .finally(() => vivo && setAbrindo(false));
    return () => {
      vivo = false;
    };
  }, [db, itemId, normas]);

  const nomeDaNorma = (id: string) => normas.find(n => n.id === id)?.nome ?? id;
  const situacao = detalhe && dataConsulta ? situacaoEm(detalhe.versoes, dataConsulta, dataCurta) : null;
  // A redação anterior mais recente e a atual: o que o dispositivo mudou na última alteração que a base conhece
  const anterior = detalhe?.versoes.find(v => v.vigente_ate) ?? null;
  const usandoHoje = dataConsulta !== '' && dataConsulta === hoje;

  const salvar = () => {
    if (!detalhe) return;
    salvarNaConta({
      modulo: 'NormaViva',
      tipo: 'norma',
      titulo: `${detalhe.dispositivo.rotulo} · ${detalhe.norma.nome}`,
      detalhe: `Texto lido do Planalto em ${dataCurta(detalhe.norma.lido_em)}`,
      url: urlDoNormaViva({ dispositivoId: detalhe.dispositivo.id, em: usandoHoje ? undefined : dataConsulta })
    });
  };

  if (!db) {
    return (
      <div>
        <PageHeader eyebrow="NormaViva" title="Histórico da norma" description="Pesquise leis, artigos e assuntos." />
        <Notice tom="warn" titulo="Base indisponível">
          O NormaViva lê a base de leis do Supabase, e esta cópia do site está sem a configuração dele.
        </Notice>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="NormaViva"
        title="Histórico da norma"
        description="Pesquise um artigo, uma lei ou um assunto e veja o texto vigente, o que o alterou e a fonte oficial."
      />

      {/* Pesquisa */}
      <section aria-label="Pesquisar dispositivo" className="flex flex-col gap-4">
        <div className="relative max-w-2xl">
          <Search className="w-5 h-5 text-ink-mute absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden />
          <Input
            type="search"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Pesquisar lei, artigo ou assunto. Ex.: art. 489 CPC"
            aria-label="Pesquisar lei, artigo ou assunto"
            className="pl-11 py-3 text-base"
          />
        </div>

        {erro && (
          <Notice tom="warn" titulo="Não consegui ler a base">
            {erro}
          </Notice>
        )}

        {resultado.tipo === 'vazio' && !erro && (
          <p className="text-sm text-ink-soft max-w-2xl">
            A base reúne {normas.length || 28} normas federais (Constituição, códigos e leis de maior uso), lidas do Planalto. Exemplos: <em>art. 489 CPC</em>, <em>Lei 14.133</em>,{' '}
            <em>desconsideração da personalidade jurídica</em>.
          </p>
        )}

        {resultado.tipo === 'resultados' && (
          <div className="flex flex-col gap-3" aria-live="polite">
            {resultado.aviso && <p className="text-sm text-ink-soft">{resultado.aviso}</p>}
            {resultado.itens.length === 0 ? (
              <p className="text-sm text-ink-soft">{buscando ? 'Pesquisando…' : 'Nenhum dispositivo encontrado.'}</p>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {resultado.itens.map(r => {
                  const ativo = r.id === itemId;
                  return (
                    <li key={r.id}>
                      <button
                        type="button"
                        aria-pressed={ativo}
                        onClick={() => setItemId(r.id)}
                        className={`w-full text-left rounded-md border px-4 py-2.5 transition-colors ${
                          ativo ? 'border-brand bg-brand-tint' : 'border-line-strong bg-surface hover:bg-surface-2'
                        }`}
                      >
                        <span className="block text-sm font-semibold text-ink">
                          {ultimoPasso(r.rotulo).startsWith('Art.') ? r.rotulo.replace(/^art\./, 'Art.') : r.rotulo}{' '}
                          <span className="font-normal text-ink-mute">· {nomeDaNorma(r.norma_id)}</span>
                        </span>
                        <span className="block text-sm text-ink-soft">
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
        )}
      </section>

      {itemId && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 mt-12 items-start">
          {abrindo && !detalhe ? (
            <div className="lg:col-span-12 h-48 rounded-lg bg-surface-2 animate-pulse" aria-hidden />
          ) : (
            detalhe && (
              <>
                {/* Texto normativo */}
                <article className="lg:col-span-8 flex flex-col gap-7">
                  <header className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-ink-mute">{detalhe.norma.nome}</p>
                        <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-ink mt-1">{detalhe.dispositivo.rotulo.replace(/^art\./, 'Art.')}</h2>
                        {detalhe.dispositivo.estrutura.length > 0 && <p className="text-sm text-ink-mute mt-1">{detalhe.dispositivo.estrutura.join(' · ')}</p>}
                      </div>
                      {situacao &&
                        (situacao.tipo === 'texto_da_epoca' ? (
                          <Badge variant="brand">Redação da época</Badge>
                        ) : detalhe.dispositivo.revogado || detalhe.versao?.origem === 'revogado' ? (
                          <Badge variant="warn">Revogado</Badge>
                        ) : situacao.tipo === 'redacao_atual' ? (
                          <Badge variant="ok">Vigente</Badge>
                        ) : (
                          <Badge variant="warn">Sem texto nesta data</Badge>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <span className="text-sm font-medium text-ink">Ver redação em:</span>
                      <button
                        type="button"
                        aria-pressed={usandoHoje}
                        onClick={() => setDataConsulta(hoje)}
                        className={`px-3.5 py-2 rounded-md text-sm font-medium border transition-colors ${
                          usandoHoje ? 'border-brand bg-brand-tint text-brand-text' : 'border-line-strong bg-surface text-ink-soft hover:bg-surface-2'
                        }`}
                      >
                        Hoje
                      </button>
                      <Input
                        type="date"
                        aria-label="Escolher data"
                        value={dataConsulta}
                        onChange={e => e.target.value && setDataConsulta(e.target.value)}
                        className="w-auto"
                      />
                    </div>
                  </header>

                  {situacao?.tipo === 'texto_da_epoca' ? (
                    <>
                      <div className="font-serif text-lg leading-[1.75] text-ink border-l-2 border-brand pl-6" data-testid="texto-da-epoca">
                        <p>
                          <span className="font-semibold">{ultimoPasso(detalhe.dispositivo.rotulo)}</span> {situacao.versao.texto}
                        </p>
                      </div>
                      {detalhe.texto.length > 1 && (
                        <Notice tom="info">
                          Nesta data, os parágrafos, incisos e alíneas deste dispositivo podem ter sido outros. A base só tem o texto atual deles, e por isso não os mostra aqui.
                        </Notice>
                      )}
                      <Notice tom="warn" titulo="Redação da época">
                        <span className="flex flex-col gap-1">
                          {situacao.avisos.map(a => (
                            <span key={a}>{a}</span>
                          ))}
                        </span>
                      </Notice>
                    </>
                  ) : situacao?.tipo === 'texto_da_epoca_indisponivel' ? (
                    <Notice tom="warn" titulo={`A base não tem o texto de ${dataCurta(dataConsulta)}`}>
                      {situacao.aviso}
                    </Notice>
                  ) : (
                    <>
                      <div className="font-serif text-lg leading-[1.75] text-ink border-l-2 border-brand pl-6 flex flex-col gap-3" data-testid="texto-do-dispositivo">
                        {detalhe.texto.map(t => (
                          <p key={t.id} style={{ marginLeft: `${Math.min(profundidade(t.rotulo), 4) * 1.25}rem` }} className={t.revogado ? 'text-ink-mute' : ''}>
                            <span className="font-semibold">{ultimoPasso(t.rotulo)}</span>{' '}
                            {t.revogado && t.texto === '' ? '(Revogado)' : t.texto}
                            {t.continuacao && <span className="block text-base text-ink-soft mt-1">{t.continuacao}</span>}
                          </p>
                        ))}
                      </div>
                      {situacao && (
                        <Notice tom={situacao.tipo === 'redacao_atual' && !situacao.provisoria ? 'info' : 'warn'} titulo="Vigência">
                          {situacao.aviso}
                        </Notice>
                      )}
                    </>
                  )}

                  {anterior && detalhe.versao && (
                    <section aria-labelledby="o-que-mudou" className="flex flex-col gap-3">
                      <h3 id="o-que-mudou" className="font-serif text-xl font-semibold text-ink">
                        O que mudou
                      </h3>
                      <p className="text-sm text-ink-soft">
                        Da redação anterior para a atual{detalhe.versao.ato_rotulo ? ` (${detalhe.versao.ato_rotulo})` : ''}. O que saiu aparece riscado; o que entrou, destacado.
                        {anterior.conferida_em ? '' : ' A redação anterior ainda não foi conferida no Diário Oficial.'}
                      </p>
                      <DiffTexto antes={anterior.texto} depois={detalhe.versao.texto} />
                    </section>
                  )}

                  <div className="flex flex-wrap gap-2 no-print">
                    <Button variant="secondary" type="button" onClick={salvar}>
                      {salvo ? <Check className="w-4 h-4 text-ok-text" /> : <Bookmark className="w-4 h-4" />}
                      {rotuloSalvar(estadoSalvo, 'Salvar em Meu espaço')}
                    </Button>
                    <a href={detalhe.norma.fonte_url} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: 'secondary' })}>
                      Fonte oficial (Planalto)
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </article>

                {/* Histórico e relações */}
                <aside className="lg:col-span-4 flex flex-col gap-9" aria-label="Histórico e relações do dispositivo">
                  <section>
                    <h3 className="font-serif text-xl font-semibold text-ink mb-3">O que mudou</h3>
                    {detalhe.versao ? (
                      <dl className="text-sm flex flex-col gap-3">
                        <div>
                          <dt className="text-ink-mute">Redação atual</dt>
                          <dd className="text-base font-medium text-ink mt-0.5">{ROTULO_ORIGEM[detalhe.versao.origem]}</dd>
                        </div>
                        {detalhe.versao.ato_rotulo && (
                          <div>
                            <dt className="text-ink-mute">Ato</dt>
                            <dd className="text-ink mt-0.5">{detalhe.versao.ato_rotulo}</dd>
                          </div>
                        )}
                        {detalhe.versao.vigente_de && (
                          <div>
                            <dt className="text-ink-mute">{detalhe.versao.vigencia_confirmada ? 'Em vigor desde' : 'Vigência (provisória)'}</dt>
                            <dd className="text-ink num mt-0.5">{dataCurta(detalhe.versao.vigente_de)}</dd>
                          </div>
                        )}
                        <div>
                          <dt className="text-ink-mute">Texto anterior</dt>
                          <dd className="text-ink-soft mt-0.5">{detalhe.versao.texto_anterior_disponivel ? 'Disponível' : 'Não está na base atual'}</dd>
                        </div>
                      </dl>
                    ) : (
                      <p className="text-sm text-ink-soft">Sem versão registrada.</p>
                    )}
                    {detalhe.versoes.length > 1 && (
                      <div className="mt-5">
                        <h4 className="text-sm font-medium text-ink mb-2">Linha do tempo</h4>
                        <LinhaDoTempo etapas={linhaDoTempo(detalhe.versoes, dataCurta)} />
                      </div>
                    )}
                    {detalhe.relacoes.filter(r => r.tipo !== 'remete' && r.origem_id !== detalhe.dispositivo.id).length > 0 && (
                      <ul className="mt-4 text-sm text-ink-soft flex flex-col gap-1.5">
                        {detalhe.relacoes
                          .filter(r => r.tipo !== 'remete' && r.origem_id !== detalhe.dispositivo.id)
                          .map(r => (
                            <li key={r.id}>
                              <span className="text-ink">{detalhe.texto.find(t => t.id === r.origem_id)?.rotulo.split(', ').slice(1).join(', ') || ''}</span>{' '}
                              {ROTULO_RELACAO[r.tipo].toLowerCase()} {r.destino_texto ?? r.destino_ato}
                            </li>
                          ))}
                      </ul>
                    )}
                  </section>

                  {detalhe.relacoes.some(r => r.tipo === 'remete') && (
                    <section className="border-t border-line pt-6">
                      <h3 className="font-serif text-xl font-semibold text-ink mb-3">Remissões neste texto</h3>
                      <ul className="flex flex-col gap-2 text-sm">
                        {detalhe.relacoes
                          .filter(r => r.tipo === 'remete')
                          .map(r => (
                            <li key={r.id} title={r.escopo ? ROTULO_ESCOPO[r.escopo] : undefined}>
                              {r.destino_id ? (
                                <button type="button" onClick={() => setItemId(r.destino_id)} className="text-brand-text hover:underline underline-offset-2 text-left">
                                  {detalhe.rotulosDestino[r.destino_id]?.rotulo.replace(/^art\./, 'Art.') ?? r.destino_texto}
                                  {r.destino_norma_id && r.destino_norma_id !== detalhe.dispositivo.norma_id ? ` · ${nomeDaNorma(r.destino_norma_id)}` : ''}
                                </button>
                              ) : (
                                <span className="text-ink-soft">{r.destino_texto}</span>
                              )}
                              {r.escopo === 'presumido' && <span className="text-ink-mute"> (norma presumida)</span>}
                            </li>
                          ))}
                      </ul>
                    </section>
                  )}

                  {detalhe.citadoPor.length > 0 && (
                    <section className="border-t border-line pt-6">
                      <h3 className="font-serif text-xl font-semibold text-ink mb-3">Citado por</h3>
                      <ul className="flex flex-col gap-2 text-sm">
                        {detalhe.citadoPor.map(c => (
                          <li key={c.origem_id}>
                            <button type="button" onClick={() => setItemId(c.origem_id)} className="text-brand-text hover:underline underline-offset-2 text-left">
                              {c.rotulo.replace(/^art\./, 'Art.')}
                              {c.norma_id && c.norma_id !== detalhe.dispositivo.norma_id ? ` · ${nomeDaNorma(c.norma_id)}` : ''}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  <section className="border-t border-line pt-6">
                    <h3 className="font-serif text-xl font-semibold text-ink mb-3">Fonte</h3>
                    <dl className="text-sm flex flex-col gap-2">
                      <div>
                        <dt className="text-ink-mute">Página lida</dt>
                        <dd className="text-ink-soft mt-0.5">{detalhe.norma.fonte_tipo_pagina === 'compilada' ? 'Texto compilado do Planalto' : 'Página anotada do Planalto (vale o texto não tachado)'}</dd>
                      </div>
                      <div>
                        <dt className="text-ink-mute">Lida em</dt>
                        <dd className="text-ink num mt-0.5">{dataCurta(detalhe.norma.lido_em)}</dd>
                      </div>
                    </dl>
                  </section>
                </aside>
              </>
            )
          )}
        </div>
      )}

      <div className="mt-14 max-w-3xl">
        <Notice tom="info" titulo="Como ler esta base">
          O texto foi extraído automaticamente do Planalto e pode ter falhas de formatação: confira na fonte oficial antes de citá-lo. Na maioria dos dispositivos a base guarda só a
          redação vigente; em alguns há também a redação anterior (veja a linha do tempo), ainda sem conferência no Diário Oficial. As datas de vigência mostradas são as de publicação
          do ato, usadas como datas provisórias.
        </Notice>
      </div>
    </div>
  );
}
