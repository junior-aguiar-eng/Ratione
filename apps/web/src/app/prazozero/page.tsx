'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Bookmark, CalendarPlus, Check, ChevronDown, Copy, ExternalLink, FileDown } from 'lucide-react';
import {
  MotorPrazoZero,
  ParametrosCalculoPrazo,
  ResultadoCalculoPrazo,
  TipoEventoOrigem,
  RegimeContagem,
  CATALOGO_PRAZOS,
  buscarPrazo,
  calcularPrazoMaterial,
  relatorioAlteracoes,
  ResultadoPrazoMaterial,
  TipoPrazoMaterial
} from '@ratione/prazozero';
import { TRIBUNAIS_BRASIL } from '@ratione/core';
import PageHeader from '../../components/PageHeader';
import Notice from '../../components/Notice';
import EmptyState from '../../components/EmptyState';
import { dataCurta, dataLonga, diaDaSemana, hojeIso } from '../../lib/datas';
import { salvarRegistro } from '../../lib/historico';
import AvisoPorEmail from './AvisoPorEmail';
import { gerarIcs } from '../../lib/ics';
import { exportarPdf, nomeArquivoSeguro } from '../../lib/imprimir';
import ResultadoMaterial from './ResultadoMaterial';
import RelatorioAlteracoes from './RelatorioAlteracoes';

const CATALOGO = CATALOGO_PRAZOS;
const GRUPOS = Array.from(new Set(CATALOGO.map(p => p.grupo)));
const unidade = (regime?: RegimeContagem) => (regime === 'cpp_dias_corridos' ? 'corridos' : 'úteis');
const MATERIAL: Record<string, { tipo: TipoPrazoMaterial; medida: string; pergunta: string }> = {
  'mandado-seguranca': { tipo: 'mandado_seguranca', medida: '120 dias corridos', pergunta: 'Quando o impetrante teve ciência do ato impugnado?' },
  'acao-rescisoria': { tipo: 'acao_rescisoria', medida: '2 anos', pergunta: 'Quando transitou em julgado a última decisão?' }
};

export default function PrazoZeroPage() {
  const motor = useMemo(() => new MotorPrazoZero(), []);

  const [atoId, setAtoId] = useState<string>('apelacao');
  const [diasOutro, setDiasOutro] = useState(15);
  const [nomeOutro, setNomeOutro] = useState('');
  const [tipoEvento, setTipoEvento] = useState<TipoEventoOrigem>('disponibilizacao_dje');
  const [dataEvento, setDataEvento] = useState('');
  const [tribunalId, setTribunalId] = useState('TJSP');
  const [regime, setRegime] = useState<RegimeContagem>('cpc_dias_uteis');
  const [prazoEmDobro, setPrazoEmDobro] = useState(false);
  const [litisconsortes, setLitisconsortes] = useState(false);
  const [excecaoCriminal, setExcecaoCriminal] = useState(false);

  const [memoriaAberta, setMemoriaAberta] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    setDataEvento(hojeIso());
  }, []);

  const prazo = atoId === 'outro' ? undefined : buscarPrazo(atoId);
  const material = prazo?.natureza === 'material' ? MATERIAL[prazo.id] : undefined;
  const dias = prazo ? prazo.dias : Math.min(Math.max(Math.trunc(diasOutro) || 1, 1), 365);
  const nomeAto = prazo
    ? prazo.grupo.startsWith('Cível') || prazo.natureza === 'material'
      ? prazo.ato
      : `${prazo.ato} (${prazo.grupo})`
    : nomeOutro.trim() || 'Prazo personalizado';

  const escolherAto = (id: string) => {
    setAtoId(id);
    const escolhido = buscarPrazo(id);
    if (escolhido?.regime) setRegime(escolhido.regime);
  };

  const resultadoMaterial = useMemo<ResultadoPrazoMaterial | null>(() => {
    if (!material || !/^\d{4}-\d{2}-\d{2}$/.test(dataEvento)) return null;
    try {
      return calcularPrazoMaterial({ tipo: material.tipo, dataInicio: dataEvento, tribunalId });
    } catch {
      return null;
    }
  }, [material, dataEvento, tribunalId]);

  const resultado = useMemo<ResultadoCalculoPrazo | null>(() => {
    if (material || !/^\d{4}-\d{2}-\d{2}$/.test(dataEvento)) return null;
    try {
      const params: ParametrosCalculoPrazo = {
        dataEvento,
        tipoEvento,
        diasPrazo: dias,
        regime,
        tribunalId,
        prazoEmDobro,
        litisconsortesComAdvogadosDistintos: litisconsortes,
        excecaoSuspensaoCriminal: regime === 'cpp_dias_corridos' && excecaoCriminal,
        nomeAto
      };
      return motor.calcularPrazo(params);
    } catch {
      return null;
    }
  }, [motor, material, dataEvento, tipoEvento, dias, regime, tribunalId, prazoEmDobro, litisconsortes, excecaoCriminal, nomeAto]);

  const relatorio = useMemo(() => {
    if (!resultado) return null;
    try {
      return relatorioAlteracoes(
        {
          dataEvento,
          tipoEvento,
          diasPrazo: dias,
          regime,
          tribunalId,
          prazoEmDobro,
          litisconsortesComAdvogadosDistintos: litisconsortes,
          excecaoSuspensaoCriminal: regime === 'cpp_dias_corridos' && excecaoCriminal,
          nomeAto
        },
        resultado
      );
    } catch {
      return null;
    }
  }, [resultado, dataEvento, tipoEvento, dias, regime, tribunalId, prazoEmDobro, litisconsortes, excecaoCriminal, nomeAto]);

  // Resumos derivados da própria memória de cálculo
  const resumo = useMemo(() => {
    if (!resultado) return null;
    const m = resultado.memoriaCalculo;
    const limpar = (t: string) => t.replace(/ \(não computado\)$/, '');
    return {
      fins: m.filter(i => i.status === 'fim_de_semana').length,
      recesso: m.filter(i => i.status === 'recesso_forense').length,
      feriados: m.filter(i => i.status === 'feriado').map(i => `${dataCurta(i.data)}: ${limpar(i.descricao)}`),
      base: Array.from(new Set(m.map(i => i.fundamentoLegal)))
    };
  }, [resultado]);

  const tipoDias = resultado?.regime === 'cpp_dias_corridos' ? 'corridos' : 'úteis';
  // Os avisos de dobro, litisconsórcio e data alternativa têm destaque próprio; os demais aparecem juntos, em qualquer calendário.
  const avisosGerais = (resultado?.avisos ?? []).filter(
    a => !a.includes('modo conservador') && !a.startsWith('Prazo em dobro') && !a.startsWith('Litisconsortes')
  );
  const tituloCalculo = `${nomeAto} · ${tribunalId}`;

  const copiarCertidao = async () => {
    if (!resultado) return;
    try {
      await navigator.clipboard.writeText(resultado.certidaoAuditavel);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // área de transferência indisponível
    }
  };

  const adicionarAoCalendario = () => {
    if (!resultado) return;
    const blob = new Blob([gerarIcs(resultado.dataVencimentoFinal, resultado.certidaoAuditavel, tituloCalculo)], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prazo-final-${resultado.dataVencimentoFinal}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportar = () => {
    if (!resultado) return;
    exportarPdf(`prazozero-${nomeArquivoSeguro(tituloCalculo)}-${resultado.dataVencimentoFinal}`, () => {
      const aberta = memoriaAberta;
      setMemoriaAberta(true);
      const detalhes = Array.from(document.querySelectorAll<HTMLDetailsElement>('details[data-imprimir]'));
      const abertos = detalhes.map(d => d.open);
      detalhes.forEach(d => (d.open = true));
      return () => {
        setMemoriaAberta(aberta);
        detalhes.forEach((d, i) => (d.open = abertos[i]));
      };
    });
  };

  const salvar = () => {
    if (!resultado) return;
    salvarRegistro({
      modulo: 'PrazoZero',
      tipo: 'prazo',
      titulo: `${nomeAto} · ${resultado.diasTotaisComputados} dias ${tipoDias}`,
      detalhe: `${tribunalId} · prazo final em ${dataCurta(resultado.dataVencimentoFinal)}`,
      url: '/prazozero'
    });
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  };

  return (
    <div>
      <PageHeader
        eyebrow="PrazoZero"
        title="Calcule um prazo"
        description="Informe o prazo, a intimação e o tribunal. O resultado mostra o prazo final e como cada dia foi contado."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start print:block">
        {/* Fluxo guiado */}
        <form
          className="lg:col-span-5 lg:sticky lg:top-24 card p-6 space-y-7 print:hidden"
          onSubmit={e => e.preventDefault()}
          aria-label="Dados do cálculo"
        >
          <fieldset className="space-y-3">
            <legend className="label mb-3">1. Qual prazo deseja calcular?</legend>
            <select
              id="ato"
              aria-label="Prazo a calcular"
              value={atoId}
              onChange={e => escolherAto(e.target.value)}
              className="field"
            >
              {GRUPOS.map(g => (
                <optgroup key={g} label={g}>
                  {CATALOGO.filter(p => p.grupo === g).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.ato} · {MATERIAL[p.id]?.medida ?? `${p.dias} dias ${unidade(p.regime)}`}
                    </option>
                  ))}
                </optgroup>
              ))}
              <option value="outro">Outro prazo (personalizado)</option>
            </select>
            {prazo && (
              <p className="text-sm text-ink-mute leading-snug">
                Base legal: {prazo.baseLegal}.{prazo.observacao ? ` ${prazo.observacao}` : ''}
              </p>
            )}

            {atoId === 'outro' && (
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div>
                  <label htmlFor="dias" className="label">
                    Dias
                  </label>
                  <input
                    id="dias"
                    type="number"
                    min={1}
                    max={365}
                    value={diasOutro}
                    onChange={e => setDiasOutro(parseInt(e.target.value, 10) || 1)}
                    className="field"
                  />
                </div>
                <div className="col-span-2">
                  <label htmlFor="nome-ato" className="label">
                    Nome do ato
                  </label>
                  <input
                    id="nome-ato"
                    type="text"
                    value={nomeOutro}
                    onChange={e => setNomeOutro(e.target.value)}
                    placeholder="Ex.: Agravo interno"
                    className="field"
                  />
                </div>
              </div>
            )}
          </fieldset>

          {!material && (
          <div>
            <label htmlFor="tipo-evento" className="label">
              2. Como ocorreu a intimação?
            </label>
            <select
              id="tipo-evento"
              value={tipoEvento}
              onChange={e => setTipoEvento(e.target.value as TipoEventoOrigem)}
              className="field"
            >
              <option value="disponibilizacao_dje">Disponibilização no Diário de Justiça eletrônico</option>
              <option value="publicacao">Publicação já considerada no Diário</option>
              <option value="intimacao_portal">Intimação eletrônica no portal do tribunal</option>
              <option value="carga_ou_audiencia">Ciência pessoal, em audiência ou por mandado</option>
            </select>
          </div>
          )}

          <div>
            <label htmlFor="data-evento" className="label">
              {material ? '2. ' + material.pergunta : '3. Quando ocorreu?'}
            </label>
            <input
              id="data-evento"
              type="date"
              value={dataEvento}
              onChange={e => setDataEvento(e.target.value)}
              className="field"
            />
          </div>

          <div>
            <label htmlFor="tribunal" className="label">
              {material ? '3. Em qual tribunal será proposta a ação?' : '4. Em qual tribunal?'}
            </label>
            <select id="tribunal" value={tribunalId} onChange={e => setTribunalId(e.target.value)} className="field">
              {Object.values(TRIBUNAIS_BRASIL).map(t => (
                <option key={t.id} value={t.id}>
                  {t.sigla} · {t.nome}
                </option>
              ))}
            </select>
          </div>

          {!material && (
          <details className="group border-t border-line pt-4">
            <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-ink-soft hover:text-ink list-none">
              <span>Opções avançadas</span>
              <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
            </summary>
            <div className="space-y-5 pt-4">
              <div>
                <label htmlFor="regime" className="label">
                  Regime de contagem
                </label>
                <select
                  id="regime"
                  value={regime}
                  onChange={e => setRegime(e.target.value as RegimeContagem)}
                  className="field"
                >
                  <option value="cpc_dias_uteis">CPC · dias úteis, com recesso forense</option>
                  <option value="clt_dias_uteis">CLT · dias úteis</option>
                  <option value="jef_dias_uteis">JEF · dias úteis (Lei 9.099, art. 12-A)</option>
                  <option value="cpp_dias_corridos">CPP · dias corridos</option>
                </select>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prazoEmDobro}
                  onChange={e => setPrazoEmDobro(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[rgb(var(--brand))]"
                />
                <span>
                  <span className="block text-sm font-medium text-ink">Prazo em dobro</span>
                  <span className="block text-sm text-ink-mute">Fazenda Pública, Ministério Público ou Defensoria</span>
                </span>
              </label>
              {regime === 'cpp_dias_corridos' && (
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={excecaoCriminal}
                    onChange={e => setExcecaoCriminal(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-[rgb(var(--brand))]"
                  />
                  <span>
                    <span className="block text-sm font-medium text-ink">Réu preso, Maria da Penha ou medida urgente</span>
                    <span className="block text-sm text-ink-mute">Nesses casos o prazo não se suspende de 20/12 a 20/01 (CPP, art. 798-A)</span>
                  </span>
                </label>
              )}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={litisconsortes}
                  onChange={e => setLitisconsortes(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[rgb(var(--brand))]"
                />
                <span>
                  <span className="block text-sm font-medium text-ink">Litisconsortes com advogados distintos</span>
                  <span className="block text-sm text-ink-mute">Só gera um aviso: o dobro do art. 229 não vale em autos eletrônicos</span>
                </span>
              </label>
            </div>
          </details>
          )}
        </form>

        {/* Resultado */}
        <div className="lg:col-span-7 space-y-9 print:space-y-6" aria-live="polite">
          {material ? (
            resultadoMaterial ? (
              <ResultadoMaterial resultado={resultadoMaterial} titulo={nomeAto} tribunalId={tribunalId} />
            ) : (
              <div className="card">
                <EmptyState titulo="Informe a data para calcular">
                  {material.pergunta} O resultado aparece aqui.
                </EmptyState>
              </div>
            )
          ) : !resultado || !resumo ? (
            <div className="card">
              <EmptyState titulo="Informe a data para calcular">
                Escolha o prazo, a forma de intimação e a data do evento. O resultado aparece aqui.
              </EmptyState>
            </div>
          ) : (
            <>
              <div className="hidden print:block border-b border-line pb-3 text-sm text-ink-soft">
                <p className="font-semibold text-ink">Ratione · PrazoZero: memória de cálculo</p>
                <p>
                  Gerado em {new Date().toLocaleString('pt-BR')}. Instrumento de apoio: confira o calendário do tribunal e os atos que possam
                  alterar o prazo.
                </p>
              </div>
              <section className="space-y-5">
                <div>
                  <p className="text-sm font-medium text-ink-mute">Prazo final</p>
                  <p className="font-serif text-4xl sm:text-5xl font-semibold text-ink leading-tight sm:leading-none mt-1">
                    {dataLonga(resultado.dataVencimentoFinal)}
                  </p>
                  <p className="text-base text-ink-soft mt-2">
                    {diaDaSemana(resultado.dataVencimentoFinal)} · {resultado.diasTotaisComputados} dias {tipoDias} ·{' '}
                    {nomeAto} · {tribunalId}
                  </p>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-line border border-line rounded-lg overflow-hidden">
                  {[
                    resultado.dataDisponibilizacao
                      ? ['Disponibilização', resultado.dataDisponibilizacao]
                      : null,
                    ['Publicação considerada', resultado.dataPublicacao],
                    ['Início da contagem', resultado.dataTermoInicial]
                  ]
                    .filter((x): x is string[] => x !== null)
                    .map(([rotulo, data]) => (
                      <div key={rotulo} className="bg-surface p-4">
                        <dt className="text-sm text-ink-mute">{rotulo}</dt>
                        <dd className="text-lg font-semibold text-ink num mt-0.5">{dataCurta(data)}</dd>
                        <dd className="text-sm text-ink-soft">{diaDaSemana(data)}</dd>
                      </div>
                    ))}
                </dl>

                {resultado.foiProrrogadoTermoFinal && resultado.motivoProrrogacao && (
                  <Notice tom="warn" titulo="Vencimento prorrogado">
                    {resultado.motivoProrrogacao}
                  </Notice>
                )}

                {resultado.alternativa && (
                  <Notice tom="warn" titulo={`Pode vencer só em ${dataCurta(resultado.alternativa.dataVencimentoFinal)}`}>
                    Mostramos a data mais cedo, para você não perder o prazo. Se{' '}
                    {resultado.alternativa.eventosPendentes.map(e => `${dataCurta(e.data)} (${e.nome})`).join('; ')}{' '}
                    {resultado.alternativa.eventosPendentes.length === 1 ? 'for confirmado' : 'forem confirmados'} como dia sem
                    expediente neste tribunal, o vencimento passa para essa data. Confirme no ato do tribunal antes de contar com ela.
                  </Notice>
                )}

                {prazoEmDobro && (
                  <Notice tom="warn" titulo="Prazo em dobro: confira antes de contar com ele">
                    {resultado.avisos.find(a => a.startsWith('Prazo em dobro'))}
                  </Notice>
                )}

                {litisconsortes && (
                  <Notice tom="warn" titulo="Litisconsórcio (art. 229): o prazo não foi duplicado">
                    {resultado.avisos.find(a => a.startsWith('Litisconsortes'))}
                  </Notice>
                )}

                {resultado.calendarioVerificado && resultado.fontesCalendario ? (
                  <Notice tom="info" titulo={`Calendário do ${tribunalId} conferido contra o ato oficial`}>
                    <ul className="space-y-1">
                      {resultado.fontesCalendario.map(f => (
                        <li key={f.url}>
                          <a href={f.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                            {f.ato}
                          </a>
                        </li>
                      ))}
                    </ul>
                    {avisosGerais.map(a => (
                      <p key={a} className="mt-2">
                        {a}
                      </p>
                    ))}
                  </Notice>
                ) : (
                  <Notice tom="info" titulo="Calendário do tribunal em conferência">
                    {avisosGerais.map(a => (
                      <p key={a} className="mb-1 last:mb-0">
                        {a}
                      </p>
                    ))}
                  </Notice>
                )}

                {relatorio && <RelatorioAlteracoes relatorio={relatorio} />}

                <div className="flex flex-wrap gap-2 no-print">
                  <button type="button" onClick={exportar} className="btn-secondary">
                    <FileDown className="w-4 h-4" />
                    Exportar PDF
                  </button>
                  <button type="button" onClick={copiarCertidao} className="btn-secondary">
                    {copiado ? <Check className="w-4 h-4 text-ok-text" /> : <Copy className="w-4 h-4" />}
                    {copiado ? 'Copiado' : 'Copiar memória de cálculo'}
                  </button>
                  <button type="button" onClick={adicionarAoCalendario} className="btn-secondary">
                    <CalendarPlus className="w-4 h-4" />
                    Adicionar ao calendário
                  </button>
                  <button type="button" onClick={salvar} className="btn-secondary">
                    {salvo ? <Check className="w-4 h-4 text-ok-text" /> : <Bookmark className="w-4 h-4" />}
                    {salvo ? 'Salvo em Meu espaço' : 'Salvar em Meu espaço'}
                  </button>
                </div>
              </section>

              <AvisoPorEmail tituloPadrao={`${nomeAto} · ${tribunalId}`} tribunal={tribunalId} vencimento={resultado.dataVencimentoFinal} />

              <section className="border-t border-line pt-7 space-y-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-2xl font-semibold text-ink">Como foi calculado</h2>
                    <p className="text-sm text-ink-soft mt-1">
                      {resultado.diasCorridosTotais} dias corridos entre o evento e o prazo final;{' '}
                      {resultado.diasTotaisComputados} dias {tipoDias} computados.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMemoriaAberta(v => !v)}
                    aria-expanded={memoriaAberta}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-text hover:underline underline-offset-2 whitespace-nowrap no-print"
                  >
                    {memoriaAberta ? 'Ocultar cálculo' : 'Ver cálculo completo'}
                    <ChevronDown className={`w-4 h-4 transition-transform ${memoriaAberta ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm">
                  <div>
                    <h3 className="font-semibold text-ink mb-2">Eventos considerados</h3>
                    <ul className="space-y-1.5 text-ink-soft leading-snug">
                      <li>Fins de semana: {resumo.fins || 'nenhum'}</li>
                      <li>
                        Recesso e férias (suspensão de prazos):{' '}
                        {resumo.recesso ? `${resumo.recesso} ${resumo.recesso === 1 ? 'dia' : 'dias'}` : 'nenhum'}
                      </li>
                      {resumo.feriados.length === 0 ? (
                        <li>Feriados: nenhum</li>
                      ) : (
                        resumo.feriados.map(f => <li key={f}>{f}</li>)
                      )}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink mb-2">Base utilizada</h3>
                    <ul className="space-y-1.5 text-ink-soft leading-snug">
                      {resumo.base.map(b => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {memoriaAberta && (
                  <div className="overflow-x-auto border border-line rounded-lg">
                    <table className="w-full text-sm min-w-[640px]">
                      <thead>
                        <tr className="bg-surface-2 text-left text-ink-soft">
                          <th className="font-medium px-4 py-2.5">Data</th>
                          <th className="font-medium px-4 py-2.5">Dia</th>
                          <th className="font-medium px-4 py-2.5">Contado</th>
                          <th className="font-medium px-4 py-2.5">Descrição e fundamento</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {resultado.memoriaCalculo.map((item, i) => {
                          const final = item.status === 'termo_final' || item.status === 'vencimento_prorrogado';
                          const contado = item.diaContadoNumero !== null;
                          return (
                            <tr key={i} className={final ? 'bg-brand-tint' : contado ? '' : 'text-ink-mute'}>
                              <td className="px-4 py-2.5 num whitespace-nowrap font-medium">{dataCurta(item.data)}</td>
                              <td className="px-4 py-2.5 whitespace-nowrap">{item.diaSemana}</td>
                              <td className="px-4 py-2.5 whitespace-nowrap">
                                {contado ? <span className="tag-brand">{item.diaContadoNumero}º dia</span> : 'Não'}
                              </td>
                              <td className="px-4 py-2.5">
                                <span className={final ? 'font-semibold text-ink' : ''}>
                                  {item.descricao.replace(/ \(não computado\)$/, '').replace('Termo Ad Quem alcançado', 'Prazo final alcançado')}
                                </span>
                                <span className="block text-xs text-ink-mute mt-0.5">{item.fundamentoLegal}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <Notice tom="info" titulo="Confira o calendário do tribunal">
                Feriados municipais e atos específicos de cada tribunal não são considerados. O feriado local deve ser
                comprovado no ato de interposição do recurso (CPC, art. 1.003, § 6º).{' '}
                <Link href="/metodologia" className="underline underline-offset-2 font-medium">
                  Limitações conhecidas
                </Link>
                .
              </Notice>

              <p className="text-sm text-ink-soft no-print">
                <Link
                  href="/normaviva"
                  className="inline-flex items-center gap-1.5 text-brand-text font-medium hover:underline underline-offset-2"
                >
                  Ver o fundamento legal no NormaViva
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
