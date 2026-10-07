'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { MotorPrazoZero, ParametrosCalculoPrazo, TipoEventoOrigem, RegimeContagem } from '@ratione/prazozero';
import { TRIBUNAIS_BRASIL } from '@ratione/core';

export default function PrazoZeroPage() {
  const motor = useMemo(() => new MotorPrazoZero(), []);

  // Estado do Fluxo Guiado
  const [atoSelecionado, setAtoSelecionado] = useState('apelacao');
  const [diasPrazo, setDiasPrazo] = useState<number>(15);
  const [nomeAto, setNomeAto] = useState('Apelação Cível');

  const [tipoEvento, setTipoEvento] = useState<TipoEventoOrigem>('disponibilizacao_dje');
  const [dataEvento, setDataEvento] = useState('2026-03-10');
  const [tribunalId, setTribunalId] = useState('TJSP');

  // Opções Avançadas (recolhidas por padrão)
  const [mostrarAvancadas, setMostrarAvancadas] = useState(false);
  const [regime, setRegime] = useState<RegimeContagem>('cpc_dias_uteis');
  const [prazoEmDobro, setPrazoEmDobro] = useState(false);

  // Memória de cálculo expansível
  const [mostrarMemoriaCompleta, setMostrarMemoriaCompleta] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // Execução do cálculo
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

  const selecionarAto = (chave: string, dias: number, nome: string) => {
    setAtoSelecionado(chave);
    setDiasPrazo(dias);
    setNomeAto(nome);
  };

  const copiarCertidao = () => {
    if (!resultado) return;
    navigator.clipboard.writeText(resultado.certidaoAuditavel);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="space-y-10">
      {/* Cabeçalho Sóbrio */}
      <div className="space-y-1">
        <span className="text-xs font-medium text-[#4A918B] uppercase tracking-wider">
          PrazoZero &middot; Cálculo verificável
        </span>
        <h1 className="text-3xl font-serif font-semibold text-[#F2F4F7]">
          Cálculo de Prazo Processual
        </h1>
        <p className="text-sm text-[#A8B0BB] max-w-2xl">
          Contagem transparente de prazos com memória dia a dia e fundamentação legal.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna 1: Fluxo Guiado (4 Etapas Simples) */}
        <div className="lg:col-span-5 bg-[#11161D] border border-[#232B35] rounded-lg p-6 space-y-6">
          {/* Etapa 1: Qual prazo deseja calcular? */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#F2F4F7] block">
              1. Qual prazo deseja calcular?
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => selecionarAto('apelacao', 15, 'Apelação Cível')}
                className={`p-2.5 rounded text-left border transition-colors ${
                  atoSelecionado === 'apelacao'
                    ? 'bg-[#161C24] border-[#2B6F6A] text-[#F2F4F7]'
                    : 'bg-[#0B0F14] border-[#232B35] text-[#A8B0BB] hover:border-[#2F3946]'
                }`}
              >
                <span className="font-medium block text-[#F2F4F7]">Apelação / Recurso</span>
                <span className="text-[10px] text-[#737E8C]">15 dias úteis</span>
              </button>

              <button
                type="button"
                onClick={() => selecionarAto('embargos', 5, 'Embargos de Declaração')}
                className={`p-2.5 rounded text-left border transition-colors ${
                  atoSelecionado === 'embargos'
                    ? 'bg-[#161C24] border-[#2B6F6A] text-[#F2F4F7]'
                    : 'bg-[#0B0F14] border-[#232B35] text-[#A8B0BB] hover:border-[#2F3946]'
                }`}
              >
                <span className="font-medium block text-[#F2F4F7]">Embargos de Declaração</span>
                <span className="text-[10px] text-[#737E8C]">5 dias úteis</span>
              </button>

              <button
                type="button"
                onClick={() => selecionarAto('contestacao', 15, 'Contestação')}
                className={`p-2.5 rounded text-left border transition-colors ${
                  atoSelecionado === 'contestacao'
                    ? 'bg-[#161C24] border-[#2B6F6A] text-[#F2F4F7]'
                    : 'bg-[#0B0F14] border-[#232B35] text-[#A8B0BB] hover:border-[#2F3946]'
                }`}
              >
                <span className="font-medium block text-[#F2F4F7]">Contestação</span>
                <span className="text-[10px] text-[#737E8C]">15 dias úteis</span>
              </button>

              <button
                type="button"
                onClick={() => selecionarAto('outro', diasPrazo, nomeAto)}
                className={`p-2.5 rounded text-left border transition-colors ${
                  atoSelecionado === 'outro'
                    ? 'bg-[#161C24] border-[#2B6F6A] text-[#F2F4F7]'
                    : 'bg-[#0B0F14] border-[#232B35] text-[#A8B0BB] hover:border-[#2F3946]'
                }`}
              >
                <span className="font-medium block text-[#F2F4F7]">Outro prazo</span>
                <span className="text-[10px] text-[#737E8C]">Personalizado</span>
              </button>
            </div>

            {atoSelecionado === 'outro' && (
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div>
                  <label className="text-[10px] text-[#737E8C] block mb-1">Dias</label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={diasPrazo}
                    onChange={e => setDiasPrazo(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-[#0B0F14] border border-[#232B35] rounded px-2.5 py-1.5 text-xs text-[#F2F4F7] focus:outline-none focus:border-[#2B6F6A]"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] text-[#737E8C] block mb-1">Nome do ato</label>
                  <input
                    type="text"
                    value={nomeAto}
                    onChange={e => setNomeAto(e.target.value)}
                    placeholder="Ex: Agravo de Instrumento"
                    className="w-full bg-[#0B0F14] border border-[#232B35] rounded px-2.5 py-1.5 text-xs text-[#F2F4F7] focus:outline-none focus:border-[#2B6F6A]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Etapa 2: Como ocorreu a intimação? */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#F2F4F7] block">
              2. Como ocorreu a intimação?
            </label>
            <select
              value={tipoEvento}
              onChange={e => setTipoEvento(e.target.value as TipoEventoOrigem)}
              className="w-full bg-[#0B0F14] border border-[#232B35] rounded px-3 py-2 text-xs text-[#F2F4F7] focus:outline-none focus:border-[#2B6F6A]"
            >
              <option value="disponibilizacao_dje">
                Disponibilização no DJe/DJEN (publicação no dia útil seguinte)
              </option>
              <option value="publicacao">
                Publicação oficial já considerada no Diário
              </option>
              <option value="intimacao_portal">
                Intimação eletrônica no Portal (Lei 11.419/06)
              </option>
              <option value="carga_ou_audiencia">
                Ciência pessoal em audiência ou mandado cumprido
              </option>
            </select>
          </div>

          {/* Etapa 3: Quando ocorreu? */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#F2F4F7] block">
              3. Quando ocorreu?
            </label>
            <input
              type="date"
              value={dataEvento}
              onChange={e => setDataEvento(e.target.value)}
              className="w-full bg-[#0B0F14] border border-[#232B35] rounded px-3 py-2 text-xs text-[#F2F4F7] focus:outline-none focus:border-[#2B6F6A]"
            />
          </div>

          {/* Etapa 4: Em qual tribunal? */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#F2F4F7] block">
              4. Em qual tribunal?
            </label>
            <select
              value={tribunalId}
              onChange={e => setTribunalId(e.target.value)}
              className="w-full bg-[#0B0F14] border border-[#232B35] rounded px-3 py-2 text-xs text-[#F2F4F7] focus:outline-none focus:border-[#2B6F6A]"
            >
              {Object.values(TRIBUNAIS_BRASIL).map(t => (
                <option key={t.id} value={t.id}>
                  {t.sigla} &middot; {t.nome} {t.uf ? `(${t.uf})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 11.2 Opções Avançadas (recolhidas) */}
          <div className="pt-2 border-t border-[#1C232C]">
            <button
              type="button"
              onClick={() => setMostrarAvancadas(!mostrarAvancadas)}
              className="flex items-center justify-between w-full text-xs text-[#A8B0BB] hover:text-[#F2F4F7] py-1 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Opções avançadas</span>
              </span>
              {mostrarAvancadas ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {mostrarAvancadas && (
              <div className="mt-3 space-y-3 p-3 bg-[#0B0F14] border border-[#232B35] rounded text-xs">
                <div>
                  <label className="text-[#737E8C] block mb-1">Regime legal</label>
                  <select
                    value={regime}
                    onChange={e => setRegime(e.target.value as RegimeContagem)}
                    className="w-full bg-[#11161D] border border-[#232B35] rounded px-2.5 py-1.5 text-xs text-[#F2F4F7] focus:outline-none focus:border-[#2B6F6A]"
                  >
                    <option value="cpc_dias_uteis">CPC &middot; Dias úteis com recesso forense (art. 220)</option>
                    <option value="clt_dias_uteis">CLT &middot; Dias úteis (art. 775)</option>
                    <option value="cpp_dias_corridos">CPP &middot; Dias corridos (art. 798)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[#F2F4F7] block">Prazo em dobro</span>
                    <span className="text-[10px] text-[#737E8C]">Fazenda Pública, MP ou Defensoria</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={prazoEmDobro}
                    onChange={e => setPrazoEmDobro(e.target.checked)}
                    className="rounded border-[#232B35] bg-[#11161D] text-[#2B6F6A] focus:ring-0"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Coluna 2: Resultado Prioritário e Memória de Cálculo */}
        <div className="lg:col-span-7 space-y-6">
          {resultado && (
            <>
              {/* 11.1 Resultado Prioritário no Topo */}
              <div className="bg-[#11161D] border border-[#232B35] rounded-lg p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#737E8C] block mb-1">
                      Prazo final
                    </span>
                    <div className="font-serif text-3xl sm:text-4xl font-semibold text-[#F2F4F7]">
                      {new Date(resultado.dataVencimentoFinal + 'T12:00:00Z').toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        weekday: 'long'
                      })}
                    </div>
                    <span className="text-xs text-[#A8B0BB] mt-1 block">
                      {resultado.diasTotaisComputados} dias {resultado.regime === 'cpp_dias_corridos' ? 'corridos' : 'úteis'} &middot; {nomeAto}
                    </span>
                  </div>

                  <button
                    onClick={copiarCertidao}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#161C24] hover:bg-[#2B6F6A] text-xs font-medium text-[#F2F4F7] border border-[#232B35] hover:border-[#2B6F6A] transition-colors"
                  >
                    {copiado ? <Check className="w-3.5 h-3.5 text-[#3E8F70]" /> : <Copy className="w-3.5 h-3.5 text-[#A8B0BB]" />}
                    <span>{copiado ? 'Copiado' : 'Copiar certidão'}</span>
                  </button>
                </div>

                {/* 11.3 Resumo das Datas Chave */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-[#1C232C] text-xs">
                  {resultado.dataDisponibilizacao && (
                    <div>
                      <span className="text-[#737E8C] block text-[11px]">Disponibilização</span>
                      <span className="font-mono text-[#F2F4F7] text-[11px]">{resultado.dataDisponibilizacao}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-[#737E8C] block text-[11px]">Publicação considerada</span>
                    <span className="font-mono text-[#F2F4F7] text-[11px]">{resultado.dataPublicacao}</span>
                  </div>
                  <div>
                    <span className="text-[#737E8C] block text-[11px]">Início da contagem</span>
                    <span className="font-mono text-[#F2F4F7] text-[11px]">{resultado.dataTermoInicial}</span>
                  </div>
                </div>

                {resultado.foiProrrogadoTermoFinal && (
                  <div className="p-3 rounded bg-[#C8903D]/10 border border-[#C8903D]/30 text-xs text-[#C8903D] flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>{resultado.motivoProrrogacao}</span>
                  </div>
                )}
              </div>

              {/* 11.3 Memória de Cálculo Expansível */}
              <div className="bg-[#11161D] border border-[#232B35] rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-[#F2F4F7]">
                      Memória de cálculo
                    </h3>
                    <p className="text-xs text-[#737E8C]">
                      {resultado.diasCorridosTotais} dias corridos no período &middot; {resultado.diasTotaisComputados} computados
                    </p>
                  </div>

                  <button
                    onClick={() => setMostrarMemoriaCompleta(!mostrarMemoriaCompleta)}
                    className="flex items-center gap-1 text-xs text-[#4A918B] hover:text-[#F2F4F7] font-medium"
                  >
                    <span>{mostrarMemoriaCompleta ? 'Ocultar detalhes' : 'Ver cálculo completo'}</span>
                    {mostrarMemoriaCompleta ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {mostrarMemoriaCompleta && (
                  <div className="space-y-1.5 pt-2 border-t border-[#1C232C] max-h-96 overflow-y-auto pr-1">
                    {resultado.memoriaCalculo.map((item, idx) => {
                      const ehVencimento = item.status === 'termo_final' || item.status === 'vencimento_prorrogado';
                      const ehUtilContado = item.diaContadoNumero !== null;
                      const ehNaoUtil = !item.diaUtil;

                      return (
                        <div
                          key={idx}
                          className={`p-2.5 rounded border text-xs flex items-center justify-between gap-3 ${
                            ehVencimento
                              ? 'bg-[#161C24] border-[#2B6F6A] text-[#F2F4F7] font-medium'
                              : ehUtilContado
                              ? 'bg-[#0B0F14] border-[#232B35] text-[#F2F4F7]'
                              : 'bg-[#0B0F14]/50 border-transparent text-[#737E8C]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[11px] w-20 text-[#A8B0BB]">{item.data}</span>
                            <span className="w-24 text-[11px]">{item.diaSemana}</span>
                            <span className="truncate max-w-xs">{item.descricao}</span>
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            <span className="text-[10px] text-[#737E8C] hidden sm:inline">
                              {item.fundamentoLegal}
                            </span>
                            {item.diaContadoNumero && (
                              <span className="px-1.5 py-0.2 rounded bg-[#161C24] text-[#4A918B] text-[10px] font-medium">
                                Dia {item.diaContadoNumero}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Relação contextual discreta com NormaViva */}
              <div className="flex items-center justify-between text-xs text-[#737E8C] px-1">
                <span>Fundamentação: Arts. 219, 220 e 224 do CPC</span>
                <Link
                  href="/normaviva"
                  className="text-[#4A918B] hover:text-[#F2F4F7] flex items-center gap-1"
                >
                  <span>Ver artigos no NormaViva</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
