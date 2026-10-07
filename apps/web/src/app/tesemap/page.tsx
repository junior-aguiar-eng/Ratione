'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  ExternalLink,
  BookOpen,
  Scale
} from 'lucide-react';
import { GRAFOS_PRECEDENTES_CATALOGADOS, NoGrafo } from '@ratione/tesemap';

export default function TeseMapPage() {
  const [temaSelecionadoChave, setTemaSelecionadoChave] = useState<string>('tema-1076-stj');

  const dadosGrafo = useMemo(() => {
    return GRAFOS_PRECEDENTES_CATALOGADOS[temaSelecionadoChave];
  }, [temaSelecionadoChave]);

  // 10.2 Painel lateral: nunca deixar vazio (iniciar com nó principal selecionado)
  const [noSelecionado, setNoSelecionado] = useState<NoGrafo | null>(null);

  useEffect(() => {
    if (dadosGrafo && dadosGrafo.nos.length > 0) {
      // Pré-selecionar o nó vinculante ou central
      const principal = dadosGrafo.nos.find(n => n.tipo === 'tese_vinculante') || dadosGrafo.nos[0];
      setNoSelecionado(principal);
    }
  }, [dadosGrafo]);

  // Nós com proporções discretas e cores semânticas conforme 10.3
  const initialNodes: Node[] = useMemo(() => {
    if (!dadosGrafo) return [];

    const positions: Record<string, { x: number; y: number }> = {
      // Tema 1076
      'tema-central': { x: 280, y: 30 },
      'cpc-art85-p2': { x: 70, y: 150 },
      'cpc-art85-p8': { x: 490, y: 150 },
      'tema-1076-stj': { x: 70, y: 290 },
      'lei-14365': { x: 70, y: 430 },
      'distinguishing-fazenda': { x: 490, y: 290 },

      // Súmula 479
      'tema-fraude-bancaria': { x: 280, y: 40 },
      'cdc-art14': { x: 280, y: 170 },
      'sumula-479-stj': { x: 280, y: 300 },
      'distinguishing-culpa-exclusiva': { x: 500, y: 300 }
    };

    return dadosGrafo.nos.map(n => {
      const pos = positions[n.id] || { x: 200, y: 200 };
      const ehVinculante = n.tipo === 'tese_vinculante';
      const ehDispositivo = n.tipo === 'dispositivo_legal';
      const ehDistinguishing = n.tipo === 'distinguishing';
      const ehLegislativo = n.tipo === 'inovacao_legislativa';

      let bg = '#11161D';
      let border = '#232B35';
      let text = '#F2F4F7';

      if (ehVinculante) {
        bg = '#14120D';
        border = '#C8903D';
        text = '#F2F4F7';
      } else if (ehDispositivo) {
        bg = '#0D141F';
        border = '#4F7FC8';
        text = '#F2F4F7';
      } else if (ehDistinguishing) {
        bg = '#16121E';
        border = '#8069B0';
        text = '#F2F4F7';
      } else if (ehLegislativo) {
        bg = '#0E1714';
        border = '#3E8F70';
        text = '#F2F4F7';
      }

      return {
        id: n.id,
        position: pos,
        data: { label: n.label, original: n },
        style: {
          backgroundColor: bg,
          borderColor: border,
          color: text,
          borderWidth: '1px',
          borderRadius: '6px',
          padding: '10px 14px',
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          width: 210,
          boxShadow: 'none'
        }
      };
    });
  }, [dadosGrafo]);

  // Arestas com estilo neutro e pontas direcionadas
  const initialEdges: Edge[] = useMemo(() => {
    if (!dadosGrafo) return [];

    return dadosGrafo.arestas.map(a => ({
      id: a.id,
      source: a.source,
      target: a.target,
      label: a.label,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#4B5563',
        width: 14,
        height: 14
      },
      style: {
        stroke: '#2F3946',
        strokeWidth: 1.2
      },
      labelStyle: {
        fill: '#A8B0BB',
        fontSize: 10,
        fontWeight: 400
      },
      labelBgStyle: {
        fill: '#0B0F14',
        fillOpacity: 0.95
      }
    }));
  }, [dadosGrafo]);

  return (
    <div className="space-y-8">
      {/* 10.4 Cabeçalho: Rede de Precedentes */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-medium text-[#8069B0] uppercase tracking-wider">
            TeseMap &middot; Rede de precedentes
          </span>
          <h1 className="text-3xl font-serif font-semibold text-[#F2F4F7]">
            Mapa da Tese e Jurisprudência
          </h1>
          <p className="text-sm text-[#A8B0BB] max-w-2xl">
            Navegação por precedentes vinculantes, distinções (distinguishing) e dispositivos legais interpretados.
          </p>
        </div>

        {/* Seletor de Tema */}
        <div className="w-full sm:w-72">
          <label className="text-[10px] text-[#737E8C] block uppercase mb-1">Tema selecionado</label>
          <select
            value={temaSelecionadoChave}
            onChange={e => setTemaSelecionadoChave(e.target.value)}
            className="w-full bg-[#11161D] border border-[#232B35] rounded px-3 py-2 text-xs text-[#F2F4F7] focus:outline-none focus:border-[#2B6F6A]"
          >
            <option value="tema-1076-stj">Tema 1.076 / STJ &middot; Honorários e Equidade</option>
            <option value="sumula-479-stj">Súmula 479 / STJ &middot; Fraude Bancária</option>
          </select>
        </div>
      </div>

      {/* Canvas do Grafo e Painel Lateral Preenchido */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[580px]">
        {/* Grafo React Flow */}
        <div className="lg:col-span-8 rounded-lg border border-[#232B35] overflow-hidden bg-[#0B0F14] relative">
          <ReactFlow
            nodes={initialNodes}
            edges={initialEdges}
            onNodeClick={(_, node) => {
              setNoSelecionado(node.data.original as NoGrafo);
            }}
            fitView
            className="bg-[#0B0F14]"
          >
            <Background color="#161C24" gap={18} size={1} />
            <Controls className="bg-[#11161D] border-[#232B35] text-[#A8B0BB]" />
          </ReactFlow>

          {/* 10.3 Legenda Semântica Discreta */}
          <div className="absolute bottom-3 left-3 p-2 rounded bg-[#11161D]/90 border border-[#232B35] text-[10px] flex items-center gap-4 text-[#A8B0BB]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#C8903D]" /> Precedente Vinculante
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4F7FC8]" /> Dispositivo Legal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#3E8F70]" /> Alteração Legislativa
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#8069B0]" /> Distinguishing
            </span>
          </div>
        </div>

        {/* 10.2 Painel Lateral Sempre Ativo e Informativo */}
        <div className="lg:col-span-4 bg-[#11161D] border border-[#232B35] rounded-lg p-6 overflow-y-auto flex flex-col justify-between">
          {noSelecionado && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-[#737E8C] uppercase tracking-wider block">
                  {noSelecionado.tipo.replace('_', ' ')}
                </span>
                <h3 className="font-serif text-lg font-semibold text-[#F2F4F7]">
                  {noSelecionado.label}
                </h3>
                {noSelecionado.tribunal && (
                  <span className="text-xs text-[#C8903D] block">
                    {noSelecionado.tribunal} {noSelecionado.numeroReferencia ? `&middot; ${noSelecionado.numeroReferencia}` : ''}
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded bg-[#0B0F14] border border-[#232B35] text-xs text-[#F2F4F7] leading-relaxed">
                {noSelecionado.descricao}
              </div>

              {/* Relações e Ações */}
              <div className="pt-4 border-t border-[#1C232C] space-y-2 text-xs">
                <span className="text-[11px] text-[#737E8C] block font-medium">Ações contextuais</span>
                <Link
                  href="/normaviva"
                  className="flex items-center justify-between p-2.5 rounded bg-[#0B0F14] border border-[#232B35] text-[#A8B0BB] hover:text-[#F2F4F7] hover:border-[#2F3946] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-[#4F7FC8]" />
                    <span>Ver artigo no NormaViva</span>
                  </span>
                  <ExternalLink className="w-3 h-3 text-[#737E8C]" />
                </Link>

                <Link
                  href="/argumenta"
                  className="flex items-center justify-between p-2.5 rounded bg-[#0B0F14] border border-[#232B35] text-[#A8B0BB] hover:text-[#F2F4F7] hover:border-[#2F3946] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Scale className="w-3.5 h-3.5 text-[#4A918B]" />
                    <span>Aplicar tese no Argumenta</span>
                  </span>
                  <ExternalLink className="w-3 h-3 text-[#737E8C]" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
