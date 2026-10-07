'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Clock,
  Calendar,
  AlertCircle,
  Copy,
  Check,
  Building,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { MotorPrazoZero, ParametrosCalculoPrazo, TipoEventoOrigem, RegimeContagem } from '@ratione/prazozero';
import { TRIBUNAIS_BRASIL } from '@ratione/core';

export default function PrazoZeroPage() {
  const motor = useMemo(() => new MotorPrazoZero(), []);

  // Form State
  const [dataEvento, setDataEvento] = useState('2026-03-10');
  const [tipoEvento, setTipoEvento] = useState<TipoEventoOrigem>('disponibilizacao_dje');
  const [diasPrazo, setDiasPrazo] = useState<number>(15);
  const [nomeAto, setNomeAto] = useState('Apelação Cível');
  const [tribunalId, setTribunalId] = useState('TJSP');
  const [regime, setRegime] = useState<RegimeContagem>('cpc_dias_uteis');
  const [prazoEmDobro, setPrazoEmDobro] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // Real Deterministic Calculation
  const resultado = useMemo(() => {
    try {
      const params: ParametrosCalculoPrazo = {
        dataEvento,
        tipoEvento,
        diasPrazo: Number(diasPrazo) || 1,
        regime,
        tribunalId,
        prazoEmDobro,
        nomeAto
      };
      return motor.calcularPrazo(params);
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [motor, dataEvento, tipoEvento, diasPrazo, regime, tribunalId, prazoEmDobro, nomeAto]);

  const copiarCertidao = () => {
    if (!resultado) return;
    navigator.clipboard.writeText(resultado.certidaoAuditavel);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const aplicarAtalho = (dias: number, ato: string) => {
    setDiasPrazo(dias);
    setNomeAto(ato);
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider">
          <Clock className="w-4 h-4" />
          <span>PrazoZero &middot; Motor Determinístico Forense</span>
        </div>
        <h1 className="text-3xl font-serif font-bold text-white">
          Cálculo Transparente de Prazos Processuais
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          Zero inteligência artificial na contagem. Algoritmo estritamente determinístico conforme os Arts. 219 e 224 do CPC, Resolução CNJ nº 455/2022 e feriados legais catalogados.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Formulário de Parâmetros */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-xl space-y-6">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-amber-400" />
            <span>Dados da Publicação ou Intimação</span>
          </h2>

          {/* O que aconteceu? */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Forma de Intimação / Comunicação do Ato
            </label>
            <select
              value={tipoEvento}
              onChange={e => setTipoEvento(e.target.value as TipoEventoOrigem)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="disponibilizacao_dje">
                Disponibilização no DJe/DJEN (Regra Canônica do Art. 224, § 2º)
              </option>
              <option value="publicacao">
                Publicação já aperfeiçoada no Diário Oficial
              </option>
              <option value="intimacao_portal">
                Intimação Eletrônica no Portal (Lei 11.419/06)
              </option>
              <option value="carga_ou_audiencia">
                Carga dos Autos / Ciência Pessoal em Audiência
              </option>
            </select>
          </div>

          {/* Data do Evento */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Data do Ato (Disponibilização / Publicação)
            </label>
            <div className="relative">
              <input
                type="date"
                value={dataEvento}
                onChange={e => setDataEvento(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Tribunal */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Tribunal Competente
            </label>
            <select
              value={tribunalId}
              onChange={e => setTribunalId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            >
              {Object.values(TRIBUNAIS_BRASIL).map(t => (
                <option key={t.id} value={t.id}>
                  {t.sigla} - {t.nome} {t.uf ? `(${t.uf})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Atalhos de Prazos Forenses */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">
              Atalhos Rápidos de Prazos Canônicos
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => aplicarAtalho(15, 'Apelação Cível')}
                className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition-colors"
              >
                15 dias (Apelação / REsp)
              </button>
              <button
                type="button"
                onClick={() => aplicarAtalho(5, 'Embargos de Declaração')}
                className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition-colors"
              >
                5 dias (Embargos de Declaração)
              </button>
              <button
                type="button"
                onClick={() => aplicarAtalho(8, 'Recurso Ordinário CLT')}
                className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition-colors"
              >
                8 dias (CLT - RO)
              </button>
              <button
                type="button"
                onClick={() => aplicarAtalho(10, 'Agravo Interno')}
                className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition-colors"
              >
                10 dias (Agravo Interno)
              </button>
            </div>
          </div>

          {/* Prazo em Dias e Nome do Ato */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1 space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Prazo (dias)</label>
              <input
                type="number"
                min="1"
                max="180"
                value={diasPrazo}
                onChange={e => setDiasPrazo(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Nome do Ato Processual</label>
              <input
                type="text"
                value={nomeAto}
                onChange={e => setNomeAto(e.target.value)}
                placeholder="Ex: Contestação, Apelação..."
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Regime Processual */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Regime Processual</label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setRegime('cpc_dias_uteis')}
                className={`py-2 px-2 rounded-lg border font-medium transition-colors ${
                  regime === 'cpc_dias_uteis'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                CPC (Dias Úteis)
              </button>
              <button
                type="button"
                onClick={() => setRegime('clt_dias_uteis')}
                className={`py-2 px-2 rounded-lg border font-medium transition-colors ${
                  regime === 'clt_dias_uteis'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                CLT (Dias Úteis)
              </button>
              <button
                type="button"
                onClick={() => setRegime('cpp_dias_corridos')}
                className={`py-2 px-2 rounded-lg border font-medium transition-colors ${
                  regime === 'cpp_dias_corridos'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                CPP (Corridos)
              </button>
            </div>
          </div>

          {/* Prazo em Dobro */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <div>
              <div className="text-xs font-medium text-slate-200">Prazo em Dobro</div>
              <div className="text-[11px] text-slate-400">Fazenda Pública, MP ou Defensoria (CPC, arts. 180, 183, 186)</div>
            </div>
            <input
              type="checkbox"
              checked={prazoEmDobro}
              onChange={e => setPrazoEmDobro(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-700"
            />
          </div>
        </div>

        {/* Resultado & Memória de Cálculo */}
        <div className="lg:col-span-7 space-y-6">
          {resultado ? (
            <>
              {/* Card Destaque: Termo Ad Quem */}
              <div className="glass-panel p-6 rounded-xl border-amber-500/30 bg-gradient-to-br from-slate-900 to-[#10172A] relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs uppercase font-mono tracking-widest text-amber-400 font-semibold">
                      Termo Ad Quem &middot; Vencimento Final
                    </span>
                    <div className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                      {new Date(resultado.dataVencimentoFinal + 'T12:00:00Z').toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        weekday: 'long'
                      })}
                    </div>
                  </div>

                  <button
                    onClick={copiarCertidao}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold shadow-md transition-all"
                  >
                    {copiado ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4 text-slate-950" />}
                    <span>{copiado ? 'Copiado!' : 'Copiar Certidão'}</span>
                  </button>
                </div>

                {/* Ciclo de Contagem */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 mt-6 border-t border-slate-800 text-xs">
                  {resultado.dataDisponibilizacao && (
                    <div>
                      <div className="text-slate-400 text-[11px]">Disponibilização (DJe)</div>
                      <div className="font-mono text-slate-200 font-medium">{resultado.dataDisponibilizacao}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-slate-400 text-[11px]">Publicação Considerada</div>
                    <div className="font-mono text-slate-200 font-medium">{resultado.dataPublicacao}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px]">Termo Inicial (1º útil)</div>
                    <div className="font-mono text-slate-200 font-medium">{resultado.dataTermoInicial}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px]">Dias Computados</div>
                    <div className="font-mono text-amber-400 font-medium">
                      {resultado.diasTotaisComputados} {resultado.regime === 'cpp_dias_corridos' ? 'corridos' : 'úteis'}
                    </div>
                  </div>
                </div>

                {resultado.foiProrrogadoTermoFinal && (
                  <div className="mt-4 p-2.5 rounded bg-amber-950/40 border border-amber-800/60 text-xs text-amber-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{resultado.motivoProrrogacao}</span>
                  </div>
                )}
              </div>

              {/* Link Inteligente com NormaViva */}
              <div className="p-3.5 rounded-lg bg-blue-950/20 border border-blue-900/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>Fundamentação da contagem: <strong>Arts. 219 e 224 do CPC</strong></span>
                </div>
                <Link
                  href="/normaviva"
                  className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium"
                >
                  <span>Ver no NormaViva</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Memória de Cálculo Detalhada Dia a Dia */}
              <div className="glass-panel p-6 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
                    Memória Auditável da Contagem
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    Total: {resultado.diasCorridosTotais} dias corridos
                  </span>
                </div>

                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-2">
                  {resultado.memoriaCalculo.map((item, idx) => {
                    const ehVencimento = item.status === 'termo_final' || item.status === 'vencimento_prorrogado';
                    const ehDiaUtilContado = item.diaContadoNumero !== null;
                    const ehFeriado = item.status === 'feriado';
                    const ehFimDeSemana = item.status === 'fim_de_semana';
                    const ehRecesso = item.status === 'recesso_forense';

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-4 transition-colors ${
                          ehVencimento
                            ? 'bg-amber-500/15 border-amber-500/60 text-white font-medium shadow-sm'
                            : ehDiaUtilContado
                            ? 'bg-slate-900/70 border-slate-800 text-slate-200'
                            : ehFeriado || ehRecesso
                            ? 'bg-amber-950/20 border-amber-900/40 text-amber-200/90'
                            : 'bg-slate-950/40 border-slate-900 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-slate-400 w-20">{item.data}</span>
                          <span className="w-24 font-medium">{item.diaSemana}</span>
                          <span className="truncate max-w-xs sm:max-w-md">{item.descricao}</span>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                            {item.fundamentoLegal}
                          </span>
                          {item.diaContadoNumero && (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono font-bold text-[11px]">
                              Dia {item.diaContadoNumero}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="glass-panel p-12 rounded-xl text-center text-slate-400">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
              <p>Insira os parâmetros ao lado para gerar o cálculo com memória auditável.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
