'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  GitFork,
  ExternalLink,
  Calendar,
  Check,
  History
} from 'lucide-react';
import { MotorNormaViva } from '@ratione/normaviva';

export default function NormaVivaPage() {
  const motor = useMemo(() => new MotorNormaViva(), []);

  const [dispositivoSelecionadoId, setDispositivoSelecionadoId] = useState('CPC-ART-85-P2');
  const [dataConsulta, setDataConsulta] = useState('2026-10-06');
  const [usandoDataAtual, setUsandoDataAtual] = useState(true);

  const selecionarDataAtual = () => {
    setDataConsulta('2026-10-06');
    setUsandoDataAtual(true);
  };

  const selecionarOutraData = (novaData: string) => {
    setDataConsulta(novaData);
    setUsandoDataAtual(novaData === '2026-10-06');
  };

  const versaoVigente = useMemo(() => {
    return motor.consultarDispositivoNaData(dispositivoSelecionadoId, dataConsulta);
  }, [motor, dispositivoSelecionadoId, dataConsulta]);

  const linhaDoTempo = useMemo(() => {
    return motor.obterLinhaDoTempo(dispositivoSelecionadoId);
  }, [motor, dispositivoSelecionadoId]);

  return (
    <div className="space-y-8">
      {/* 9.4 Cabeçalho: Edição Legislativa */}
      <div className="space-y-1">
        <span className="text-xs font-medium text-[#4F7FC8] uppercase tracking-wider">
          NormaViva &middot; Histórico da norma
        </span>
        <h1 className="text-3xl font-serif font-semibold text-[#F2F4F7]">
          Edição e Vigência Legislativa
        </h1>
        <p className="text-sm text-[#A8B0BB] max-w-2xl">
          Texto normativo contextualizado e histórico de redações em determinada data.
        </p>
      </div>

      {/* 9.3 Barra de Seleção e Data */}
      <div className="bg-[#11161D] border border-[#232B35] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Seletor de Artigo */}
        <div className="space-y-1 flex-1 max-w-md">
          <label className="text-[11px] font-medium text-[#737E8C] block uppercase tracking-wider">
            Dispositivo
          </label>
          <select
            value={dispositivoSelecionadoId}
            onChange={e => setDispositivoSelecionadoId(e.target.value)}
            className="w-full bg-[#0B0F14] border border-[#232B35] rounded px-3 py-2 text-xs text-[#F2F4F7] focus:outline-none focus:border-[#2B6F6A]"
          >
            <option value="CPC-ART-85-P2">Art. 85, § 2º &middot; CPC/15 (Fixação objetiva de honorários)</option>
            <option value="CPC-ART-85-P6A">Art. 85, § 6º-A &middot; CPC/15 (Inclusão pela Lei 14.365/2022)</option>
            <option value="CPC-ART-489-P1">Art. 489, § 1º &middot; CPC/15 (Dever de fundamentação analítica)</option>
            <option value="CPC-ART-219">Art. 219 &middot; CPC/15 (Contagem em dias úteis)</option>
          </select>
        </div>

        {/* 9.3 Ver redação em: [ Hoje ] [ escolher data ] */}
        <div className="space-y-1">
          <span className="text-[11px] font-medium text-[#737E8C] block uppercase tracking-wider">
            Ver redação em:
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selecionarDataAtual}
              className={`px-3 py-2 rounded text-xs font-medium transition-colors border ${
                usandoDataAtual
                  ? 'bg-[#161C24] text-[#F2F4F7] border-[#2B6F6A]'
                  : 'bg-[#0B0F14] text-[#A8B0BB] border-[#232B35] hover:text-[#F2F4F7]'
              }`}
            >
              Hoje
            </button>

            <div className="relative">
              <input
                type="date"
                value={dataConsulta}
                onChange={e => selecionarOutraData(e.target.value)}
                className={`bg-[#0B0F14] border rounded px-3 py-2 text-xs text-[#F2F4F7] focus:outline-none focus:border-[#2B6F6A] ${
                  !usandoDataAtual ? 'border-[#2B6F6A]' : 'border-[#232B35]'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 9.1 Estrutura: Centro (Texto Normativo) + Lateral (Histórico) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Centro: Texto Normativo Editorial */}
        <div className="lg:col-span-8 bg-[#11161D] border border-[#232B35] rounded-lg p-7 space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-serif font-bold text-[#4F7FC8]">
                {versaoVigente?.normaNome}
              </span>
              <h2 className="font-serif text-2xl font-semibold text-[#F2F4F7]">
                {versaoVigente?.dispositivoRotulo}
              </h2>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#3E8F70]/15 text-[#3E8F70] text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3E8F70]" />
              <span>Vigente em {new Date(dataConsulta + 'T12:00:00Z').toLocaleDateString('pt-BR')}</span>
            </div>
          </div>

          {/* Texto da Lei com Tipografia Editorial Limpa */}
          <div className="p-6 bg-[#0B0F14] border border-[#232B35] rounded font-serif text-base text-[#F2F4F7] leading-relaxed tracking-wide">
            {versaoVigente?.texto}
          </div>

          {/* Metadados da Redação */}
          <div className="pt-4 border-t border-[#1C232C] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#A8B0BB]">
            <div>
              <span className="text-[#737E8C] block text-[11px]">Ato modificador</span>
              <span className="text-[#F2F4F7] font-medium">{versaoVigente?.atoModificador.rotulo}</span>
            </div>
            <div>
              <span className="text-[#737E8C] block text-[11px]">Início da vigência</span>
              <span className="font-mono text-[#F2F4F7]">{versaoVigente?.dataInicioVigencia}</span>
            </div>
          </div>

          {/* Relação contextual limpa com o TeseMap */}
          <div className="pt-4 border-t border-[#1C232C] flex items-center justify-between text-xs text-[#737E8C]">
            <span>Jurisprudência vinculante associada a este dispositivo</span>
            <Link
              href="/tesemap"
              className="inline-flex items-center gap-1 text-[#4A918B] hover:text-[#F2F4F7] font-medium"
            >
              <span>Explorar no TeseMap</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Lateral: 9.2 Linha do Tempo e Relações */}
        <div className="lg:col-span-4 bg-[#11161D] border border-[#232B35] rounded-lg p-6 space-y-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#737E8C]">
            <History className="w-4 h-4 text-[#4A918B]" />
            <span>Linha do Tempo da Norma</span>
          </div>

          <div className="space-y-4 py-1">
            {linhaDoTempo.map(item => (
              <div key={item.id} className="relative pl-5 pb-4 border-l border-[#232B35] last:border-0 last:pb-0">
                <div className="absolute -left-1 top-1 w-2 h-2 rounded-full bg-[#4F7FC8]" />
                <div className="text-xs space-y-0.5">
                  <span className="font-mono text-[11px] text-[#A8B0BB] block">
                    {item.dataInicioVigencia}
                  </span>
                  <span className="text-[#F2F4F7] font-medium block">
                    {item.atoModificador.rotulo}
                  </span>
                  <span className="text-[10px] text-[#737E8C] block">
                    {item.tipoAlteracao === 'redacao_original' ? 'Redação original' : 'Alteração legislativa'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#1C232C] text-[11px] text-[#737E8C] leading-relaxed">
            Texto consolidado com base em fontes oficiais da legislação federal e LexML.
          </div>
        </div>
      </div>
    </div>
  );
}
