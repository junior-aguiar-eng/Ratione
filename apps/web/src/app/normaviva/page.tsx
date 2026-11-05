'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Bookmark, Check, ExternalLink, History, Link2, Quote, Search } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Notice from '../../components/Notice';
import { CartaoDeContexto, CartaoDeLeitura } from '../../components/Cartoes';
import { dataCurta, hojeIso } from '../../lib/datas';
import { useSalvar } from '../../lib/useSalvar';
import { rotuloSalvar } from '../../lib/rotuloSalvar';
import { lerNormaViva, urlDoNormaViva } from '../../lib/parametrosSalvos';
import FaixaDoCaso from '../../components/FaixaDoCaso';
import RelacaoComOCaso from '../../components/RelacaoComOCaso';
import { obterSupabase } from '../../lib/supabase/client';
import { carregarDetalhe, listarNormas, pesquisar, type Detalhe, type Norma, type ResultadoDaBusca } from '../../lib/normaviva';
import { ROTULO_ESCOPO, ROTULO_ORIGEM, ROTULO_RELACAO, situacaoEm, textoDoAvisoFuturo } from '../../lib/normavivaApresentacao';
import { avisosDoArtigo } from '@ratione/normaviva/vigencia-futura';
import { linhaDoTempo } from '../../lib/linhaDoTempo';
import { DiffTexto, LinhaDoTempo } from './Historico';
import ExplicacaoIA from './ExplicacaoIA';
import ResultadosDaBusca from './ResultadosDaBusca';
import LigacoesDoDispositivo from './LigacoesDoDispositivo';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

/** "art. 85, § 2º, I" → profundidade 2 (artigo = 0); usada só para recuar o texto. */
const profundidade = (rotulo: string) => rotulo.split(', ').length - 1;
const ultimoPasso = (rotulo: string) => {
  const p = rotulo.split(', ').pop() ?? rotulo;
  return p.startsWith('art. ') ? `Art. ${p.slice(5)}` : p;
};

function AvisoAntesDeCitar() {
  return (
    <Notice tom="info" titulo="Antes de citar">
      Confira o texto na fonte oficial antes de citá-lo.
    </Notice>
  );
}

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
            Constituição, códigos e as principais leis federais. Exemplos: <em>art. 489 CPC</em>, <em>Lei 14.133</em>,{' '}
            <em>desconsideração da personalidade jurídica</em>.
          </p>
        )}

        {resultado.tipo === 'resultados' && (
          <ResultadosDaBusca itens={resultado.itens} normas={normas} itemId={itemId} buscando={buscando} aviso={resultado.aviso} onEscolher={setItemId} />
        )}
      </section>

      <FaixaDoCaso ferramenta="normaviva" destinoId={itemId} className="mt-8" />

      {itemId && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mt-8 items-start">
          {abrindo && !detalhe ? (
            <div className="lg:col-span-12 h-48 rounded-xl bg-surface-2 animate-pulse" aria-hidden />
          ) : (
            detalhe && (
              <>
                <div className="lg:col-span-8 flex flex-col gap-5 min-w-0">
                  {/* Texto da lei: o cartão de leitura. O texto completo, com todos os parágrafos, incisos e alíneas, fica sempre à vista */}
                  <CartaoDeLeitura aria-label={`${detalhe.dispositivo.rotulo} · ${detalhe.norma.nome}`}>
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

                      <div className="flex flex-wrap items-center gap-3">
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
                        <Notice tom="info" titulo="Redação da época">
                          <span className="flex flex-col gap-1">
                            {situacao.avisos.map(a => (
                              <span key={a}>{a}</span>
                            ))}
                          </span>
                        </Notice>
                      </>
                    ) : situacao?.tipo === 'texto_da_epoca_indisponivel' ? (
                      <Notice tom="info" titulo="Texto anterior à redação atual">
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
                          <Notice tom="info" titulo="Vigência">
                            {situacao.aviso}
                          </Notice>
                        )}
                      </>
                    )}

                    {avisosDoArtigo(detalhe.norma.id, detalhe.dispositivo.rotulo, hoje).map(aviso => {
                      const t = textoDoAvisoFuturo(aviso, detalhe.norma.id, detalhe.dispositivo.rotulo, dataCurta);
                      return (
                        <Notice key={aviso.chave} tom="warn" titulo={t.titulo}>
                          <span className="flex flex-col gap-1" data-testid="aviso-vigencia-futura">
                            {t.linhas.map(l => (
                              <span key={l}>{l}</span>
                            ))}
                            {t.dispositivos.length > 0 && <span>Dispositivos alterados neste artigo: {t.dispositivos.join('; ')}.</span>}
                            <a href={t.fonteUrl} target="_blank" rel="noopener noreferrer" className="underline">
                              Ver o ato no Planalto
                            </a>
                          </span>
                        </Notice>
                      );
                    })}

                    {anterior && detalhe.versao && (
                      <section aria-labelledby="o-que-mudou" className="flex flex-col gap-3 border-t border-line pt-5">
                        <h3 id="o-que-mudou" className="font-serif text-xl font-semibold text-ink">
                          O que mudou
                        </h3>
                        <p className="text-sm text-ink-soft">
                          Da redação anterior para a atual{detalhe.versao.ato_rotulo ? ` (${detalhe.versao.ato_rotulo})` : ''}. O que saiu aparece riscado; o que entrou, destacado.
                        </p>
                        <DiffTexto antes={anterior.texto} depois={detalhe.versao.texto} />
                      </section>
                    )}

                    <div className="flex flex-wrap gap-2 no-print border-t border-line pt-5">
                      <Button variant="secondary" type="button" onClick={salvar}>
                        {salvo ? <Check className="w-4 h-4 text-ok-text" /> : <Bookmark className="w-4 h-4" />}
                        {rotuloSalvar(estadoSalvo, 'Salvar em Meu espaço')}
                      </Button>
                      <a href={detalhe.norma.fonte_url} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: 'secondary' })}>
                        Fonte oficial (Planalto)
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </CartaoDeLeitura>

                  {/* O que a IA gerou: cartão próprio, um passo acima e ligado ao texto, sem se misturar a ele */}
                  <RelacaoComOCaso key={`relacao-${detalhe.dispositivo.id}`} ferramenta="normaviva" destinoId={detalhe.dispositivo.id} />
                  <ExplicacaoIA key={detalhe.dispositivo.id} dispositivoId={detalhe.dispositivo.id} />

                  <AvisoAntesDeCitar />
                </div>

                {/* Contexto: acompanha a leitura numa coluna fixa, em cartões pequenos */}
                <aside
                  className="lg:col-span-4 flex flex-col gap-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pb-2"
                  aria-label="Histórico e relações do dispositivo"
                >
                  <CartaoDeContexto titulo="Histórico da redação" icone={<History />}>
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
                            <dt className="text-ink-mute">{detalhe.versao.vigencia_confirmada ? 'Em vigor desde' : 'Publicada em'}</dt>
                            <dd className="text-ink num mt-0.5">{dataCurta(detalhe.versao.vigente_de)}</dd>
                          </div>
                        )}
                        <div>
                          <dt className="text-ink-mute">Texto anterior</dt>
                          <dd className="text-ink-soft mt-0.5">{detalhe.versao.texto_anterior_disponivel ? 'Disponível' : 'Consulte o Planalto'}</dd>
                        </div>
                      </dl>
                    ) : (
                      <p className="text-sm text-ink-soft">Sem versão registrada.</p>
                    )}
                    {detalhe.versoes.length > 1 && (
                      <div className="border-t border-line pt-3">
                        <h4 className="text-sm font-medium text-ink mb-2">Linha do tempo</h4>
                        <LinhaDoTempo etapas={linhaDoTempo(detalhe.versoes, dataCurta)} />
                      </div>
                    )}
                    {detalhe.relacoes.filter(r => r.tipo !== 'remete' && r.origem_id !== detalhe.dispositivo.id).length > 0 && (
                      <ul className="border-t border-line pt-3 text-sm text-ink-soft flex flex-col gap-1.5">
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
                  </CartaoDeContexto>

                  {detalhe.relacoes.some(r => r.tipo === 'remete') && (
                    <CartaoDeContexto titulo="Remissões neste texto" icone={<Link2 />}>
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
                            </li>
                          ))}
                      </ul>
                    </CartaoDeContexto>
                  )}

                  {detalhe.citadoPor.length > 0 && (
                    <CartaoDeContexto titulo="Citado por" icone={<Quote />}>
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
                    </CartaoDeContexto>
                  )}

                  <LigacoesDoDispositivo dispositivoId={detalhe.dispositivo.id} db={db} />

                  <CartaoDeContexto titulo="Fonte" icone={<BookOpen />}>
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
                  </CartaoDeContexto>
                </aside>
              </>
            )
          )}
        </div>
      )}

      {!(itemId && detalhe) && (
        <div className="mt-10 max-w-3xl">
          <AvisoAntesDeCitar />
        </div>
      )}
    </div>
  );
}
