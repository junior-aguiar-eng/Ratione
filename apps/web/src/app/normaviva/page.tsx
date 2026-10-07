'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Bookmark, Check, ExternalLink, Search } from 'lucide-react';
import { MotorNormaViva } from '@ratione/normaviva';
import PageHeader from '../../components/PageHeader';
import Notice from '../../components/Notice';
import { dataCurta, hojeIso } from '../../lib/datas';
import { salvarRegistro } from '../../lib/historico';

const FONTE_CPC = 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm';

interface ItemCatalogo {
  id: string;
  rotulo: string;
  norma: string;
  assunto: string;
  jurisprudencia?: string;
}

const CATALOGO: ItemCatalogo[] = [
  {
    id: 'CPC-ART-85-P2',
    rotulo: 'Art. 85, § 2º',
    norma: 'CPC/15',
    assunto: 'Honorários advocatícios: fixação em percentual',
    jurisprudencia: 'Tema 1.076/STJ'
  },
  {
    id: 'CPC-ART-85-P6A',
    rotulo: 'Art. 85, § 6º-A',
    norma: 'CPC/15',
    assunto: 'Honorários e vedação de equidade (Lei 14.365/2022)',
    jurisprudencia: 'Tema 1.076/STJ'
  },
  { id: 'CPC-ART-489-P1', rotulo: 'Art. 489, § 1º', norma: 'CPC/15', assunto: 'Fundamentação da decisão judicial' },
  { id: 'CPC-ART-219', rotulo: 'Art. 219', norma: 'CPC/15', assunto: 'Contagem de prazos em dias úteis' }
];

const normalizar = (t: string) =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const ROTULO_ALTERACAO: Record<string, string> = {
  redacao_original: 'Redação original',
  alterado: 'Alteração',
  acrescentado: 'Dispositivo acrescentado',
  revogado_expressamente: 'Revogação',
  declarado_inconstitucional: 'Declaração de inconstitucionalidade'
};

export default function NormaVivaPage() {
  const motor = useMemo(() => new MotorNormaViva(), []);

  const [busca, setBusca] = useState('');
  const [itemId, setItemId] = useState(CATALOGO[0].id);
  const [hoje, setHoje] = useState('');
  const [dataConsulta, setDataConsulta] = useState('');
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    const h = hojeIso();
    setHoje(h);
    setDataConsulta(h);
  }, []);

  const resultados = useMemo(() => {
    const termos = normalizar(busca).split(' ').filter(Boolean);
    if (termos.length === 0) return CATALOGO;
    return CATALOGO.filter(i => {
      const palheiro = normalizar(`${i.rotulo} ${i.norma} ${i.assunto} ${i.id}`);
      return termos.every(t => palheiro.includes(t));
    });
  }, [busca]);

  const item = CATALOGO.find(i => i.id === itemId)!;
  const linhaDoTempo = useMemo(() => motor.obterLinhaDoTempo(itemId), [motor, itemId]);
  const versao = useMemo(
    () => (dataConsulta ? motor.consultarDispositivoNaData(itemId, dataConsulta) : null),
    [motor, itemId, dataConsulta]
  );
  const usandoHoje = dataConsulta !== '' && dataConsulta === hoje;
  const primeiraVigencia = linhaDoTempo[0]?.dataInicioVigencia;

  const salvar = () => {
    if (!versao) return;
    salvarRegistro({
      modulo: 'NormaViva',
      tipo: 'norma',
      titulo: `${item.rotulo} · ${item.norma}`,
      detalhe: `${item.assunto}. Redação em ${dataCurta(dataConsulta)}`,
      url: '/normaviva'
    });
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  };

  return (
    <div>
      <PageHeader
        eyebrow="NormaViva"
        title="Histórico da norma"
        description="Consulte a redação de um dispositivo em qualquer data e acompanhe como ele mudou ao longo do tempo."
      />

      {/* Pesquisa */}
      <section aria-label="Pesquisar dispositivo" className="space-y-4">
        <div className="relative max-w-2xl">
          <Search className="w-5 h-5 text-ink-mute absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden />
          <input
            type="search"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Pesquisar lei, artigo ou assunto. Ex.: art. 489 CPC"
            aria-label="Pesquisar lei, artigo ou assunto"
            className="field !pl-11 !py-3 text-base"
          />
        </div>

        {resultados.length === 0 ? (
          <p className="text-sm text-ink-soft">
            Nenhum dispositivo encontrado. A prévia reúne {CATALOGO.length} dispositivos do CPC/15.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {resultados.map(r => {
              const ativo = r.id === itemId;
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    aria-pressed={ativo}
                    onClick={() => setItemId(r.id)}
                    className={`text-left rounded-md border px-4 py-2.5 transition-colors ${
                      ativo ? 'border-brand bg-brand-tint' : 'border-line-strong bg-surface hover:bg-surface-2'
                    }`}
                  >
                    <span className="block text-sm font-semibold text-ink">
                      {r.rotulo} <span className="font-normal text-ink-mute">· {r.norma}</span>
                    </span>
                    <span className="block text-sm text-ink-soft">{r.assunto}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 mt-12 items-start">
        {/* Texto normativo */}
        <article className="lg:col-span-8 space-y-7">
          <header className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-ink-mute">Código de Processo Civil (Lei nº 13.105/2015)</p>
                <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-ink mt-1">{item.rotulo}</h2>
              </div>
              {dataConsulta &&
                (versao ? (
                  <span className="tag-ok">{usandoHoje ? 'Vigente' : `Redação em ${dataCurta(dataConsulta)}`}</span>
                ) : (
                  <span className="tag-warn">Sem redação nesta data</span>
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
              <input
                type="date"
                aria-label="Escolher data"
                value={dataConsulta}
                onChange={e => e.target.value && setDataConsulta(e.target.value)}
                className="field !w-auto"
              />
            </div>
          </header>

          {!dataConsulta ? (
            <div className="h-48 rounded-lg bg-surface-2 animate-pulse" aria-hidden />
          ) : versao ? (
            <>
              <blockquote className="font-serif text-lg sm:text-xl leading-[1.75] text-ink border-l-2 border-brand pl-6">
                {versao.texto}
              </blockquote>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-line pt-6 text-sm">
                <div>
                  <dt className="text-ink-mute">Ato modificador</dt>
                  <dd className="text-base font-medium text-ink mt-0.5">{versao.atoModificador.rotulo}</dd>
                </div>
                <div>
                  <dt className="text-ink-mute">Início da vigência</dt>
                  <dd className="text-base font-medium text-ink num mt-0.5">{dataCurta(versao.dataInicioVigencia)}</dd>
                </div>
              </dl>
            </>
          ) : (
            <Notice tom="warn" titulo={`O ${item.rotulo} não tinha redação em ${dataCurta(dataConsulta)}`}>
              {primeiraVigencia
                ? `A base registra este dispositivo a partir de ${dataCurta(primeiraVigencia)}.`
                : 'Não há versão registrada para este dispositivo.'}
            </Notice>
          )}

          <div className="flex flex-wrap gap-2 no-print">
            <button type="button" onClick={salvar} disabled={!versao} className="btn-secondary disabled:opacity-50">
              {salvo ? <Check className="w-4 h-4 text-ok-text" /> : <Bookmark className="w-4 h-4" />}
              {salvo ? 'Salvo em Meu espaço' : 'Salvar em Meu espaço'}
            </button>
            <a href={FONTE_CPC} target="_blank" rel="noopener noreferrer" className="btn-secondary">
              Fonte oficial (Planalto)
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </article>

        {/* Histórico */}
        <aside className="lg:col-span-4 space-y-9" aria-label="Histórico do dispositivo">
          <section>
            <h3 className="font-serif text-xl font-semibold text-ink mb-5">Linha do tempo</h3>
            <ol className="relative border-l border-line-strong ml-1.5 space-y-6">
              {linhaDoTempo.map(v => {
                const ativa = versao?.id === v.id;
                return (
                  <li key={v.id} className="pl-6 relative">
                    <span
                      className={`absolute -left-[7px] top-1 w-3.5 h-3.5 rounded-full ring-4 ring-canvas ${
                        ativa ? 'bg-brand' : 'bg-ink-mute'
                      }`}
                    />
                    <p className="text-sm font-semibold text-ink num">{dataCurta(v.dataInicioVigencia)}</p>
                    <p className="text-sm text-ink mt-0.5">{v.atoModificador.rotulo}</p>
                    <p className="text-sm text-ink-mute">{ROTULO_ALTERACAO[v.tipoAlteracao]}</p>
                  </li>
                );
              })}
              <li className="pl-6 relative">
                <span className="absolute -left-[7px] top-1 w-3.5 h-3.5 rounded-full ring-4 ring-canvas bg-ok" />
                <p className="text-sm font-semibold text-ink">Hoje</p>
                <p className="text-sm text-ink-mute">
                  {linhaDoTempo.at(-1)?.dataFimVigencia === null ? 'Vigente' : 'Sem vigência'}
                </p>
              </li>
            </ol>
          </section>

          <section className="border-t border-line pt-6">
            <h3 className="font-serif text-xl font-semibold text-ink mb-2">O que mudou</h3>
            <p className="text-sm text-ink-soft leading-relaxed">
              {linhaDoTempo.length > 1
                ? `${linhaDoTempo.length} redações registradas. Use a data para comparar.`
                : 'Nenhuma alteração posterior registrada na base atual.'}
            </p>
          </section>

          {item.jurisprudencia && (
            <section className="border-t border-line pt-6">
              <h3 className="font-serif text-xl font-semibold text-ink mb-2">Jurisprudência</h3>
              <p className="text-sm text-ink-soft mb-3">{item.jurisprudencia}</p>
              <Link
                href="/tesemap"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-text hover:underline underline-offset-2"
              >
                Explorar no TeseMap
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </section>
          )}
        </aside>
      </div>

      <div className="mt-14 max-w-3xl">
        <Notice tom="info" titulo="Prévia">
          A base reúne {CATALOGO.length} dispositivos do CPC/15. Confira o texto na fonte oficial antes de citá-lo.
        </Notice>
      </div>
    </div>
  );
}
