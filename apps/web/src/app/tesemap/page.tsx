'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  GitFork,
  BookOpen,
  Scale,
  ExternalLink,
  ShieldCheck,
  Info,
  Maximize2
} from 'lucide-react';
import { GRAFOS_PRECEDENTES_CATALOGADOS, NoGrafo } from '@ratione/tesemap';

export default function TeseMapPage() {
  const [temaSelecionadoChave, setTemaSelecionadoChave] = useState<string>('tema-1076-stj');
  const [noSelecionado, setNoSelecionado] = useState<NoGrafo | null>(null);

  const dadosGrafo = useMemo(() => {
    return GRAFOS_PRECEDENTES_CATALOGADOS[temaSelecionadoChave];
  }, [temaSelecionadoChave]);

  // Converter Nós do TeseMap em Nós do xyflow com coordenadas limpas
  const initialNodes: Node[] = useMemo(() => {
    if (!dadosGrafo) return [];

    const positions: Record<string, { x: number; y: number }> = {
      // Tema 1076
      'tema-central': { x: 300, y: 30 },
      'cpc-art85-p2': { x: 80, y: 160 },
      'cpc-art85-p8': { x: 520, y: 160 },
      'tema-1076-stj': { x: 80, y: 310 },
      'lei-14365': { x: 80, y: 460 },
      'distinguishing-fazenda': { x: 520, y: 310 },

      // Súmula 479
      'tema-fraude-bancaria': { x: 300, y: 40 },
      'cdc-art14': { x: 300, y: 180 },
      'sumula-479-stj': { x: 300, y: 320 },
      'distinguishing-culpa-exclusiva': { x: 540, y: 320 }
    };

    return dadosGrafo.nos.map(n => {
      const pos = positions[n.id] || { x: 250, y: 250 };
      const ehVinculante = n.tipo === 'tese_vinculante';
      const ehDispositivo = n.tipo === 'dispositivo_legal';
      const ehDistinguishing = n.tipo === 'distinguishing';
      const ehLegislativo = n.tipo === 'inovacao_legislativa';

      let bg = '#0f172a';
      let border = '#334155';
      let text = '#f1f5f9';

      if (ehVinculante) {
        bg = '#1a1405';
        border = '#c59b27';
        text = '#fef08a';
      } else if (ehDispositivo) {
        bg = '#0b192e';
        border = '#3b82f6';
        text = '#bfdbfe';
      } else if (ehDistinguishing) {
        bg = '#1f132b';
        border = '#a855f7';
        text = '#e9d5ff';
      } else if (ehLegislativo) {
        bg = '#08211b';
        border = '#10b981';
        text = '#a7f3d0';
      }

      return {
        id: n.id,
        position: pos,
        data: { label: n.label, original: n },
        style: {
          background: bg,
          borderColor: border,
          color: text,
          borderWidth: '1.5px',
          borderRadius: '10px',
          padding: '12px 16px',
          fontSize: '12px',
          fontWeight: 600,
          width: 220,
          boxShadow: '0 4px 14px rgba(0,0,0,0.4)'
        }
      };
    });
  }, [dadosGrafo]);

  // Converter Arestas com Labels semânticos
  const initialEdges: Edge[] = useMemo(() => {
    if (!dadosGrafo) return [];

    return dadosGrafo.arestas.map(a => ({
      id: a.id,
      source: a.source,
      target: a.target,
      label: a.label,
      animated: a.tipo === 'interpreta',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#64748b'
      },
      style: {
        stroke: '#475569',
        strokeWidth: 1.5
      },
      labelStyle: {
        fill: '#94a3b8',
        fontSize: 10,
        fontWeight: 500
      },
      labelBgStyle: {
        fill: '#090d16',
        fillOpacity: 0.85
      }
    }));
  }, [dadosGrafo]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider">
            <GitFork className="w-4 h-4" />
            <span>TeseMap &middot; Grafo Topológico de Precedentes (Art. 927 CPC)</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-white mt-1">
            Rede Jurisprudencial & Distinções
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            Navegue por teses vinculantes, conexões normativas e hipóteses de distinguishing sem perder a visão do conjunto.
          </p>
        </div>

        {/* Seletor de Caso Precedente */}
        <div className="w-full sm:w-72">
          <select
            value={temaSelecionadoChave}
            onChange={e => {
              setTemaSelecionadoChave(e.target.value);
              setNoSelecionado(null);
            }}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
          >
            <option value="tema-1076-stj">Tema 1.076/STJ &middot; Honorários e Equidade</option>
            <option value="sumula-479-stj">Súmula 479/STJ &middot; Fraude Bancária</option>
          </select>
        </div>
      </div>

      {/* Tema Central Banner */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-400 uppercase font-mono text-[11px]">Tema em Exibição:</span>
          <span className="text-slate-200 font-medium">{dadosGrafo.temaPrincipal}</span>
        </div>
        <span className="text-slate-400 text-[11px] font-mono">
          {dadosGrafo.nos.length} nós &middot; {dadosGrafo.arestas.length} arestas
        </span>
      </div>

      {/* Canvas Interativo do Grafo + Painel de Inspeção */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[580px]">
        {/* Grafo React Flow */}
        <div className="lg:col-span-8 rounded-xl border border-slate-800 overflow-hidden bg-[#070b12] relative">
          <ReactFlow
            nodes={initialNodes}
            edges={initialEdges}
            onNodeClick={(_, node) => {
              setNoSelecionado(node.data.original as NoGrafo);
            }}
            fitView
            className="bg-[#070B12]"
          >
            <Background color="#1e293b" gap={20} size={1} />
            <Controls className="bg-slate-900 border-slate-800 text-slate-300" />
          </ReactFlow>

          {/* Legenda Flutuante */}
          <div className="absolute bottom-4 left-4 p-2.5 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-800 text-[11px] flex flex-wrap gap-3">
            <span className="flex items-center gap-1.5 text-amber-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Precedente Vinculante
            </span>
            <span className="flex items-center gap-1.5 text-blue-300">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Dispositivo Legal
            </span>
            <span className="flex items-center gap-1.5 text-emerald-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Inovação Legislativa
            </span>
            <span className="flex items-center gap-1.5 text-purple-300">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Distinguishing
            </span>
          </div>
        </div>

        {/* Inspetor do Nó Selecionado */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-xl overflow-y-auto flex flex-col justify-between">
          {noSelecionado ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-300 font-bold">
                  {noSelecionado.tipo.replace('_', ' ')}
                </span>
                <h3 className="font-serif text-lg font-bold text-white mt-1">
                  {noSelecionado.label}
                </h3>
                {noSelecionado.tribunal && (
                  <span className="text-xs text-amber-400 font-mono block">
                    Tribunal: {noSelecionado.tribunal} {noSelecionado.numeroReferencia ? `(${noSelecionado.numeroReferencia})` : ''}
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                {noSelecionado.descricao}
              </div>

              {/* Ações Rápidas Conectadas */}
              <div className="space-y-2 pt-4 border-t border-slate-800 text-xs">
                <Link
                  href="/normaviva"
                  className="flex items-center justify-between p-2.5 rounded bg-blue-950/30 hover:bg-blue-950/60 border border-blue-900/50 text-blue-300 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Ver dispositivos no NormaViva</span>
                  </span>
                  <ExternalLink className="w-3 h-3" />
                </Link>

                <Link
                  href="/argumenta"
                  className="flex items-center justify-between p-2.5 rounded bg-amber-950/30 hover:bg-amber-950/60 border border-amber-900/50 text-amber-300 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Scale className="w-3.5 h-3.5" />
                    <span>Aplicar tese no Argumenta</span>
                  </span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs space-y-2">
              <Info className="w-8 h-8 text-slate-600" />
              <p>Clique em qualquer nó do grafo ao lado para inspecionar os enunciados, ratio decidendi e conexões normativas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
