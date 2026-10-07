'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  Scale,
  BookOpen,
  GitFork,
  Clock,
  ArrowRight,
  Trash2,
  ExternalLink,
  FolderOpen
} from 'lucide-react';

export default function MeuEspacoPage() {
  const [secaoAtiva, setSecaoAtiva] = useState<'analises' | 'normas' | 'teses' | 'prazos'>('prazos');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
          <User className="w-4 h-4 text-amber-400" />
          <span>Meu Espaço &middot; Central de Trabalho do Jurista</span>
        </div>
        <h1 className="text-3xl font-serif font-bold text-white">
          Meu espaço
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          Retome suas análises salvas, consultas normativas históricas, teses favoritas e cálculos com memória descritiva.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 sm:gap-4 border-b border-slate-800 pb-1 text-sm">
        {[
          { id: 'prazos', label: 'Prazos Calculados', icon: Clock, count: '1' },
          { id: 'analises', label: 'Análises Salvas', icon: Scale, count: '1' },
          { id: 'normas', label: 'Normas Salvas', icon: BookOpen, count: '2' },
          { id: 'teses', label: 'Teses Salvas', icon: GitFork, count: '2' }
        ].map(s => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => setSecaoAtiva(s.id as any)}
              className={`flex items-center gap-2 px-3 py-2 border-b-2 font-medium transition-colors ${
                secaoAtiva === s.id
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{s.label}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[11px] font-mono text-slate-400">
                {s.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Conteúdo das Seções */}
      <div className="space-y-4">
        {secaoAtiva === 'prazos' && (
          <div className="glass-panel p-6 rounded-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono text-amber-400 block mb-1">
                  TJSP &middot; Apelação Cível (15 dias úteis)
                </span>
                <h3 className="text-base font-serif font-bold text-white">
                  Termo Ad Quem: 01 de abril de 2026
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Disponibilização: 10/03/2026 &middot; Publicação: 11/03/2026 &middot; Termo Inicial: 12/03/2026
                </p>
              </div>

              <Link
                href="/prazozero"
                className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-xs text-amber-300 border border-slate-700 flex items-center gap-1.5"
              >
                <span>Reabrir no PrazoZero</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {secaoAtiva === 'analises' && (
          <div className="glass-panel p-6 rounded-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono text-amber-400 block mb-1">
                  Sentença &middot; 22ª Vara Cível Central da Comarca de São Paulo/SP
                </span>
                <h3 className="text-base font-serif font-bold text-white">
                  Processo nº 1002345-88.2024.8.26.0100 (Fraude Bancária e PIX)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  2 teses identificadas &middot; 1 vulnerabilidade do Art. 489, § 1º, IV do CPC
                </p>
              </div>

              <Link
                href="/argumenta"
                className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-xs text-amber-300 border border-slate-700 flex items-center gap-1.5"
              >
                <span>Ver no Argumenta</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {secaoAtiva === 'normas' && (
          <div className="space-y-3">
            <div className="glass-panel p-5 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-serif font-bold text-white text-sm">Art. 85, § 2º do CPC/15</h4>
                <p className="text-xs text-slate-400 mt-0.5">Honorários de 10% a 20% e histórico da Lei 14.365/2022</p>
              </div>
              <Link href="/normaviva" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <span>Abrir</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="glass-panel p-5 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-serif font-bold text-white text-sm">Art. 489, § 1º do CPC/15</h4>
                <p className="text-xs text-slate-400 mt-0.5">Dever de fundamentação analítica e taxonomia de nulidades</p>
              </div>
              <Link href="/normaviva" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <span>Abrir</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        {secaoAtiva === 'teses' && (
          <div className="space-y-3">
            <div className="glass-panel p-5 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-serif font-bold text-white text-sm">Tema 1.076 / STJ</h4>
                <p className="text-xs text-slate-400 mt-0.5">Fixação de honorários e inadmissibilidade de equidade em causas vultosas</p>
              </div>
              <Link href="/tesemap" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                <span>Ver Grafo</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="glass-panel p-5 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-serif font-bold text-white text-sm">Súmula 479 / STJ</h4>
                <p className="text-xs text-slate-400 mt-0.5">Responsabilidade objetiva de bancos em fortuito interno</p>
              </div>
              <Link href="/tesemap" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                <span>Ver Grafo</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
