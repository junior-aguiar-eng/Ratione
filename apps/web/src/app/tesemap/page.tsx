'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Bookmark, Check, ExternalLink, Search } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Notice from '../../components/Notice';
import EmptyState from '../../components/EmptyState';
import { dataCurta } from '../../lib/datas';
import { useSalvar } from '../../lib/useSalvar';
import { rotuloSalvar } from '../../lib/rotuloSalvar';
import { lerTeseMap, urlDoNormaViva, urlDoTeseMap } from '../../lib/parametrosSalvos';
import { obterSupabase } from '../../lib/supabase/client';
import { abrirNo, aplicacaoDoNo, buscarNos, citacoesDoNo, coberturaPorExtenso, lerCobertura, ligadosPelasFontes, resumoDoNo, textoDoTotalDeAplicacao, type Cobertura, type NoLigado, type NoTese, type Vizinhanca } from '../../lib/tesemap';
import PreviaCatalogada from './PreviaCatalogada';
import GrafoDaVizinhanca from './GrafoDaVizinhanca';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Badge } from '@/components/ui/badge';
import { cardClasses } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const ROTULO_TIPO: Record<string, string> = {
  tema: 'Tema', questao: 'Questão jurídica', tese: 'Tese', precedente: 'Precedente', sumula: 'Súmula', dispositivo: 'Dispositivo',
  conceito: 'Conceito', excecao: 'Exceção', distinguishing: 'Distinguishing', superacao: 'Superação'
};

const texto = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null);

export default function TeseMapPage() {
  const db = useMemo(() => obterSupabase(), []);
  const [cobertura, setCobertura] = useState<{ itens: Cobertura[]; indisponivel: boolean } | null>(null);
  const [busca, setBusca] = useState('');
  const [tribunal, setTribunal] = useState('');
  const [tipo, setTipo] = useState('');
  const [lista, setLista] = useState<NoTese[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [noId, setNoId] = useState<string | null>(null);
  const [aberto, setAberto] = useState<Vizinhanca | null>(null);
  const [abrindo, setAbrindo] = useState(false);
  const [ligados, setLigados] = useState<NoLigado[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const { estado: estadoSalvo, salvar: salvarNaConta } = useSalvar();
  const salvo = estadoSalvo === 'salvo';
  const sequencia = useRef(0);

  useEffect(() => {
    const doLink = lerTeseMap(window.location.search);
    if (doLink.noId) setNoId(doLink.noId);
  }, []);

  useEffect(() => {
    if (!db) return;
    lerCobertura(db).then(setCobertura).catch(e => setErro(String(e.message ?? e)));
  }, [db]);

  const semDados = !db || (cobertura !== null && (cobertura.indisponivel || cobertura.itens.length === 0));

  // Pesquisa com pequena espera depois da última tecla; só vale a resposta da pesquisa mais recente
  useEffect(() => {
    if (!db || !cobertura || semDados) return;
    const minha = ++sequencia.current;
    setBuscando(true);
    const t = setTimeout(async () => {
      try {
        const r = await buscarNos(db, { texto: busca, tribunal, tipo });
        if (minha === sequencia.current) {
          setLista(r);
          setErro(null);
        }
      } catch (e) {
        if (minha === sequencia.current) setErro(String((e as Error).message ?? e));
      } finally {
        if (minha === sequencia.current) setBuscando(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [db, cobertura, semDados, busca, tribunal, tipo]);

  useEffect(() => {
    if (!db || !noId || semDados) return;
    let vivo = true;
    setAbrindo(true);
    abrirNo(db, noId)
      .then(v => vivo && (setAberto(v), setErro(null)))
      .catch(e => vivo && setErro(String(e.message ?? e)))
      .finally(() => vivo && setAbrindo(false));
    return () => {
      vivo = false;
    };
  }, [db, noId, semDados]);

  // Ligações que as próprias fontes registram (STJ → tema do STF; súmula do STF → súmula ou tema), nos dois sentidos: só o que existe no grafo
  useEffect(() => {
    setLigados([]);
    if (!db || !aberto) return;
    let vivo = true;
    ligadosPelasFontes(db, aberto.no)
      .then(l => vivo && setLigados(l))
      .catch(() => vivo && setLigados([]));
    return () => {
      vivo = false;
    };
  }, [db, aberto]);

  // Sem Supabase, sem tabelas (migração por aplicar) ou sem nenhum dado: a prévia catalogada
  if (semDados) return <PreviaCatalogada />;
  if (db && !cobertura) return <p className="text-sm text-ink-soft py-10">{erro ?? 'Carregando o TeseMap…'}</p>;

  const tribunais = [...new Set((cobertura?.itens ?? []).map(c => c.tribunal).filter(Boolean))].sort();
  const tipos = [...new Set((cobertura?.itens ?? []).map(c => c.tipo))].sort();
  const total = (cobertura?.itens ?? []).reduce((s, c) => s + c.total, 0);
  const atualizado = (cobertura?.itens ?? []).map(c => c.atualizado_em).sort().pop();
  const declarada = coberturaPorExtenso(cobertura?.itens ?? []);

  const no = aberto?.no ?? null;
  const salvar = () => {
    if (!no) return;
    salvarNaConta({ modulo: 'TeseMap', tipo: 'tese', titulo: no.rotulo, detalhe: no.descricao.slice(0, 160), url: urlDoTeseMap({ noId: no.id }) });
  };

  return (
    <div>
      <PageHeader
        eyebrow="TeseMap"
        title="Mapa da tese"
        description="Precedentes qualificados com a tese firmada, a fonte oficial e as relações que uma pessoa validou."
      />

      <p className="text-sm text-ink-soft mb-6 max-w-3xl" data-testid="cobertura">
        Cobertura: {declarada}. Dados lidos em {atualizado ? dataCurta(atualizado) : '—'}. Fontes: STJ, Dados Abertos (licença CC BY), e STF (Portal da Transparência e base de jurisprudência). Não é toda a jurisprudência: é o conjunto declarado acima.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-6">
        <div className="sm:col-span-6">
          <Label htmlFor="busca-tese">Pesquisar</Label>
          <div className="relative">
            <Search className="w-4 h-4 text-ink-mute absolute left-3 top-1/2 -translate-y-1/2" aria-hidden />
            <Input id="busca-tese" value={busca} onChange={e => setBusca(e.target.value)} placeholder="Tema 1076, honorários, equidade…" className="pl-9" autoComplete="off" />
          </div>
        </div>
        <div className="sm:col-span-3">
          <Label htmlFor="tribunal-tese">Tribunal</Label>
          <NativeSelect id="tribunal-tese" value={tribunal} onChange={e => setTribunal(e.target.value)}>
            <option value="">Todos</option>
            {tribunais.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="sm:col-span-3">
          <Label htmlFor="tipo-tese">Tipo</Label>
          <NativeSelect id="tipo-tese" value={tipo} onChange={e => setTipo(e.target.value)}>
            <option value="">Todos</option>
            {tipos.map(t => (
              <option key={t} value={t}>
                {ROTULO_TIPO[t] ?? t}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      {erro && <Notice tom="warn" titulo="Não consegui ler o TeseMap">{erro}</Notice>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-4">
        <section className="lg:col-span-4 flex flex-col gap-2" aria-label="Resultados" aria-live="polite">
          <p className="text-sm text-ink-mute">
            {buscando ? 'Pesquisando…' : `${lista.length}${lista.length === 40 ? '+' : ''} de ${total.toLocaleString('pt-BR')} · mais recentemente julgados primeiro`}
          </p>
          {!buscando && lista.length === 0 ? (
            <EmptyState titulo="Nada encontrado">Tente o número do tema (ex.: 1076) ou uma palavra da tese.</EmptyState>
          ) : (
            <ul className="flex flex-col gap-2 lg:max-h-[720px] lg:overflow-y-auto pr-1">
              {lista.map(n => (
                <li key={n.id}>
                  <button
                    type="button"
                    aria-pressed={n.id === noId}
                    onClick={() => setNoId(n.id)}
                    className={cn('w-full text-left rounded-md border px-4 py-2.5 transition-colors', n.id === noId ? 'border-brand bg-brand-tint' : 'border-line-strong bg-surface hover:bg-surface-2')}
                  >
                    <span className="block text-sm font-semibold text-ink">{n.rotulo}</span>
                    <span className="block text-xs text-ink-mute">{resumoDoNo(n, dataCurta)}</span>
                    <span className="text-sm text-ink-soft line-clamp-2">{n.descricao}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="lg:col-span-8 flex flex-col gap-6">
          {!noId && <EmptyState titulo="Escolha um precedente">Pesquise ou escolha um item da lista para ver a tese, a fonte e as relações validadas.</EmptyState>}
          {noId && abrindo && !no && <p className="text-sm text-ink-soft">Abrindo…</p>}
          {noId && !abrindo && !aberto && !erro && <Notice tom="info" titulo="Precedente não encontrado">Este precedente não está na base ou ainda não passou pela validação.</Notice>}

          {aberto && no && (
            <article className={cn(cardClasses, 'p-6 flex flex-col gap-6')} aria-label="Precedente selecionado">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="warn">{ROTULO_TIPO[no.tipo] ?? no.tipo}</Badge>
                  {no.detalhes.vinculante === true && <Badge variant="brand">Vinculante</Badge>}
                  {texto(no.detalhes.situacao) && <Badge variant="neutral">{texto(no.detalhes.situacao)}</Badge>}
                </div>
                <h2 className="font-serif text-2xl font-semibold text-ink leading-snug">{no.rotulo}</h2>
                <p className="text-sm text-ink-mute">{[no.tribunal, resumoDoNo(no, dataCurta)].filter(Boolean).join(' · ')}</p>
              </div>

              {texto(no.detalhes.questao) && (
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-semibold text-ink">Questão submetida a julgamento</h3>
                  <p className="text-base text-ink-soft leading-relaxed">{texto(no.detalhes.questao)}</p>
                </div>
              )}

              {no.detalhes.teseFirmada === false ? (
                <Notice tom="info" titulo="Sem tese firmada no arquivo do tribunal">
                  O arquivo do STF não traz tese para este tema: o mérito está pendente, a repercussão geral foi negada ou a tese não foi informada. A questão acima é a que o tribunal registra. Consulte o processo no portal do STF.
                </Notice>
              ) : (
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-semibold text-ink">{no.tipo === 'sumula' ? 'Enunciado' : 'Tese firmada'}</h3>
                  <p className="font-serif text-lg text-ink leading-[1.7] border-l-2 border-brand pl-5 whitespace-pre-line" data-testid="tese-firmada">
                    {no.descricao}
                  </p>
                </div>
              )}

              <LigacoesEntreTribunais ligados={ligados} onAbrir={setNoId} />

              <DadosComplementares no={no} />

              <AplicacaoDoTema no={no} />

              <Atalhos no={no} />

              <div className="border-t border-line pt-4 flex flex-col gap-3 text-sm text-ink-mute" data-testid="fonte">
                {no.fontes.map(f => (
                  <p key={f.id} className="[overflow-wrap:anywhere]">
                    Fonte:{' '}
                    <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-brand-text underline underline-offset-2">
                      {f.ato}
                    </a>
                    . Lido em {dataCurta(f.lidoEm)}. {f.lido}.
                  </p>
                ))}
                {no.validado_por && <p>Validado por {no.validado_por} em {dataCurta(no.validado_em ?? no.atualizado_em)}.</p>}
                <p>Confira a tese na fonte oficial do tribunal antes de citá-la.</p>
                <Button variant="secondary" type="button" onClick={salvar} className="w-full sm:w-auto sm:self-start">
                  {salvo ? <Check className="w-4 h-4 text-ok-text" /> : <Bookmark className="w-4 h-4" />}
                  {rotuloSalvar(estadoSalvo, 'Salvar em Meu espaço')}
                </Button>
              </div>
            </article>
          )}

          {aberto && no && (
            <section aria-labelledby="relacoes-tese" className="flex flex-col gap-3">
              <h3 id="relacoes-tese" className="font-serif text-xl font-semibold text-ink">
                Relações validadas
              </h3>
              {aberto.arestas.length === 0 ? (
                <Notice tom="info" titulo="Nenhuma relação validada ainda">
                  O mapa só desenha relações (interpreta, distingue, supera…) que uma pessoa conferiu na fonte. Este precedente ainda não tem nenhuma; a tese e a fonte acima são o dado oficial.
                </Notice>
              ) : (
                <GrafoDaVizinhanca vizinhanca={aberto} onAbrir={setNoId} />
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function AplicacaoDoTema({ no }: { no: NoTese }) {
  const a = aplicacaoDoNo(no);
  if (!a) return null;
  return (
    <div className="border-t border-line pt-4 flex flex-col gap-2 text-sm" data-testid="aplicacao-do-tema">
      <h3 className="text-sm font-semibold text-ink">Aplicação pelo STF (devoluções à origem)</h3>
      <p className="text-ink">{textoDoTotalDeAplicacao(a)}</p>
      {a.total > 0 && (
        <p className="text-ink-soft">
          Por ano:{' '}
          {a.porAno.map(([ano, n]) => `${ano}${a.anosPossivelmenteIncompletos.includes(ano) ? '*' : ''}: ${n.toLocaleString('pt-BR')}`).join(' · ')}
        </p>
      )}
      <p className="text-xs text-ink-mute">
        Conta as decisões do STF que devolveram processos ao tribunal de origem pelo regime da repercussão geral citando este tema. Não é o total de citações do tema na jurisprudência.
        {a.anosPossivelmenteIncompletos.length > 0 && ` *O arquivo do STF parece incompleto em ${a.anosPossivelmenteIncompletos.join(', ')} (bem menos decisões que nos demais anos).`}
      </p>
    </div>
  );
}

function LigacoesEntreTribunais({ ligados, onAbrir }: { ligados: NoLigado[]; onAbrir: (id: string) => void }) {
  if (ligados.length === 0) return null;
  return (
    <div className="border-t border-line pt-4 flex flex-col gap-2 text-sm" data-testid="ligacoes-tribunais">
      <h3 className="text-sm font-semibold text-ink">Ligações registradas pelas fontes</h3>
      <ul className="flex flex-wrap gap-2">
        {ligados.map(l => (
          <li key={l.id}>
            <button type="button" onClick={() => onAbrir(l.id)} className="inline-flex items-center rounded-md border border-line-strong bg-surface px-3 py-1.5 text-ink hover:bg-surface-2">
              {l.rotulo}
            </button>
          </li>
        ))}
      </ul>
      <p className="text-xs text-ink-mute">São as ligações que o próprio tribunal registra: o STJ, no arquivo de precedentes qualificados; o STF, na observação da súmula. Não são relações validadas do mapa.</p>
    </div>
  );
}

function DadosComplementares({ no }: { no: NoTese }) {
  const rg = Array.isArray(no.detalhes.repercussaoGeral) ? (no.detalhes.repercussaoGeral as Array<{ numero: string; descricao: string | null }>) : [];
  const linhas: Array<[string, React.ReactNode]> = [];
  const add = (rotulo: string, v: unknown) => {
    const t = texto(v);
    if (t) linhas.push([rotulo, t]);
  };
  add('Órgão julgador', no.detalhes.orgaoJulgador);
  add('Processo paradigma', no.detalhes.processoParadigma);
  add('Relator', no.detalhes.relator);
  add('Ramos do direito', no.detalhes.ramosDoDireito);
  add('Ramo do direito', no.detalhes.ramoDoDireito);
  if (no.tribunal === 'STF') add('Suspensão nacional', no.detalhes.suspensaoNacional);
  if (texto(no.detalhes.dataPublicacaoAcordao)) linhas.push(['Acórdão publicado em', dataCurta(no.detalhes.dataPublicacaoAcordao as string)]);
  add('Referência legislativa', no.detalhes.referenciaLegislativa);
  add('Súmula originada', no.detalhes.sumulaOriginada);
  add('Assuntos', no.detalhes.assuntos);
  if (no.tribunal === 'STF' && no.tipo !== 'sumula' && texto(no.detalhes.dataJulgamento)) linhas.push(['Julgado em', dataCurta(no.detalhes.dataJulgamento as string)]);
  if (no.tipo === 'sumula' && texto(no.detalhes.dataAprovacao)) linhas.push(['Aprovada em', dataCurta(no.detalhes.dataAprovacao as string)]);
  add('Publicação', no.detalhes.fontePublicacao);
  add('Observação do STF', no.detalhes.observacao);
  add('Nota do STJ', no.detalhes.nota);
  if (Array.isArray(no.detalhes.processosLeadingCase) && no.detalhes.processosLeadingCase.length > 0) linhas.push(['Processos paradigma', (no.detalhes.processosLeadingCase as string[]).join('; ')]);
  if (rg.length > 0) linhas.push(['Repercussão geral no STF', rg.map(r => `Tema ${r.numero}${r.descricao ? `: ${r.descricao}` : ''}`).join(' | ')]);
  if (linhas.length === 0) return null;
  return (
    <dl className="grid grid-cols-1 sm:grid-cols-[11rem_1fr] gap-x-6 gap-y-2 text-sm border-t border-line pt-4">
      {linhas.map(([k, v]) => (
        <React.Fragment key={k}>
          <dt className="text-ink-mute">{k}</dt>
          <dd className="text-ink">{v}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

function Atalhos({ no }: { no: NoTese }) {
  const citacoes = citacoesDoNo(no);
  const link = texto(no.detalhes.linkOficial);
  if (citacoes.length === 0 && !link) return null;
  return (
    <div className="border-t border-line pt-4 flex flex-col gap-2 text-sm">
      {citacoes.length > 0 && (
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-ink">Dispositivos que a tese ou a questão citam (NormaViva)</h3>
          <ul className="flex flex-wrap gap-2">
            {citacoes.map(c => (
              <li key={`${c.dispositivoId}|${c.detalhe ?? ''}`}>
                <Link href={urlDoNormaViva({ dispositivoId: c.dispositivoId })} className="inline-flex items-center rounded-md border border-line-strong bg-surface px-3 py-1.5 text-ink hover:bg-surface-2">
                  art. {c.artigo}
                  {c.detalhe ? `, ${c.detalhe}` : ''} · {c.normaId}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-xs text-ink-mute">Citação expressa no texto; não é interpretação do mapa.</p>
        </div>
      )}
      {link && (
        <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 py-1.5 text-ink hover:text-brand-text">
          <ExternalLink className="w-4 h-4 text-ink-mute" />
          {texto(no.detalhes.linkOficial)?.includes('stf.jus.br') ? 'Consultar no portal do STF' : 'Consultar no site do STJ'}
        </a>
      )}
    </div>
  );
}
