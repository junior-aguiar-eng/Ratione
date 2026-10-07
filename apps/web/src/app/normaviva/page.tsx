'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Calendar,
  History,
  GitFork,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  FileCode,
  ArrowRight
} from 'lucide-react';
import { MotorNormaViva, HISTORICO_DISPOSITIVOS_EXEMPLO } from '@ratione/normaviva';

export default function NormaVivaPage() {
  const motor = useMemo(() => new MotorNormaViva(), []);

  const [dispositivoSelecionadoId, setDispositivoSelecionadoId] = useState('CPC-ART-85-P2');
  const [dataConsulta, setDataConsulta] = useState('2026-10-06');

  // Consulta point-in-time real
  const versaoVigente = useMemo(() => {
    return motor.consultarDispositivoNaData(dispositivoSelecionadoId, dataConsulta);
  }, [motor, dispositivoSelecionadoId, dataConsulta]);

  const linhaDoTempo = useMemo(() => {
    return motor.obterLinhaDoTempo(dispositivoSelecionadoId);
  }, [motor, dispositivoSelecionadoId]);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-blue-400 uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>NormaViva &middot; Vigência e Histórico Legislativo Point-in-Time</span>
        </div>
        <h1 className="text-3xl font-serif font-bold text-white">
          A Norma no Tempo: Como Ela Realmente Vigora
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          Consulte o texto exato em qualquer momento histórico. Rastreabilidade de leis modificadoras conforme a Lei Complementar nº 95/1998.
        </p>
      </div>

      {/* Barra de Filtro e Data Point-in-Time */}
      <div className="glass-panel p-6 rounded-xl grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
        <div className="md:col-span-7 space-y-1.5">
          <label className="text-xs font-medium text-slate-300">
            Dispositivo Legal Selecionado
          </label>
          <select
            value={dispositivoSelecionadoId}
            onChange={e => setDispositivoSelecionadoId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
          >
            <option value="CPC-ART-85-P2">Art. 85, § 2º &middot; CPC/15 (Honorários Advocatícios Objetivos)</option>
            <option value="CPC-ART-85-P6A">Art. 85, § 6º-A &middot; CPC/15 (Inovação da Lei 14.365/2022)</option>
            <option value="CPC-ART-489-P1">Art. 489, § 1º &middot; CPC/15 (Dever de Fundamentação Analítica)</option>
            <option value="CPC-ART-219">Art. 219 &middot; CPC/15 (Contagem em Dias Úteis)</option>
          </select>
        </div>

        <div className="md:col-span-5 space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
            <span>Data de Consulta (Point-in-Time)</span>
            <span className="text-[11px] font-mono text-blue-400">Estado histórico</span>
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={dataConsulta}
              onChange={e => setDataConsulta(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => setDataConsulta('2026-10-06')}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 shrink-0"
            >
              Hoje
            </button>
          </div>
        </div>
      </div>

      {/* Resultado da Vigência */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Painel do Texto Vigente */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel p-6 rounded-xl border-blue-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-semibold">
                  {versaoVigente?.dispositivoRotulo}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {versaoVigente?.normaNome}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Vigente em {new Date(dataConsulta + 'T12:00:00Z').toLocaleDateString('pt-BR')}</span>
              </div>
            </div>

            {/* Texto Literal */}
            <div className="p-5 rounded-lg bg-slate-900/90 border border-slate-800 font-serif text-base text-slate-100 leading-relaxed shadow-inner">
              {versaoVigente?.texto}
            </div>

            {/* Metadados da Versão */}
            <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Ato Modificador</span>
                <span className="text-slate-200 font-medium">{versaoVigente?.atoModificador.rotulo}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Início da Vigência</span>
                <span className="text-slate-200 font-mono">{versaoVigente?.dataInicioVigencia}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Término da Vigência</span>
                <span className="text-slate-200 font-mono">
                  {versaoVigente?.dataFimVigencia ? versaoVigente.dataFimVigencia : 'Indeterminado (Atual)'}
                </span>
              </div>
            </div>

            {/* Link Cruzado Inteligente para TeseMap */}
            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-slate-400">Dúvidas sobre a interpretação jurisprudencial vinculante deste artigo?</span>
              <Link
                href="/tesemap"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium transition-colors"
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>Ver teses no TeseMap</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Linha do Tempo e Evolução Legislativa */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300">
            <History className="w-4 h-4 text-amber-400" />
            <span>Linha do Tempo do Dispositivo</span>
          </div>

          <div className="space-y-4 py-2">
            {linhaDoTempo.map((item, idx) => (
              <div key={item.id} className="relative pl-6 pb-4 border-l border-slate-800 last:border-0 last:pb-0">
                <div className="absolute -left-1.5 top-0.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-slate-900" />
                <div className="text-xs space-y-1">
                  <span className="font-mono text-blue-400 font-semibold block">
                    {item.dataInicioVigencia}
                  </span>
                  <p className="text-slate-200 font-medium">
                    {item.atoModificador.rotulo}
                  </p>
                  <span className="text-[11px] text-slate-400 block">
                    Tipo: {item.tipoAlteracao === 'redacao_original' ? 'Redação Original' : 'Alteração Legislativa'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400">
            Fonte: Corpus Legislativo Federal LexML e Legislação Oficial da Presidência da República.
          </div>
        </div>
      </div>
    </div>
  );
}
