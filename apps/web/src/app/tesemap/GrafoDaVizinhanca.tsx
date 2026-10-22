'use client';

import { useMemo } from 'react';
import { ReactFlow, Background, Controls, MarkerType, type Edge, type Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { posicoesRadiais, type NoTese, type Vizinhanca } from '../../lib/tesemap';

const MAXIMO_DE_VIZINHOS = 12;

const COR_TIPO: Record<string, string> = {
  tema: 'rgb(var(--brand))', questao: 'rgb(var(--info))', tese: 'rgb(var(--warn))', precedente: 'rgb(var(--warn))', sumula: 'rgb(var(--warn))',
  dispositivo: 'rgb(var(--info))', conceito: 'rgb(var(--ink-mute))', excecao: 'rgb(var(--rel))', distinguishing: 'rgb(var(--rel))', superacao: 'rgb(var(--danger))'
};

export default function GrafoDaVizinhanca({ vizinhanca, onAbrir }: { vizinhanca: Vizinhanca; onAbrir: (id: string) => void }) {
  const { no, arestas, vizinhos } = vizinhanca;
  const mostrados = vizinhos.slice(0, MAXIMO_DE_VIZINHOS);

  const nodes: Node[] = useMemo(() => {
    const estilo = (n: NoTese, central: boolean) => ({
      width: 220,
      padding: '10px 12px',
      borderRadius: 8,
      background: 'rgb(var(--surface))',
      color: 'rgb(var(--ink))',
      border: '1px solid rgb(var(--line-strong))',
      borderLeft: `5px solid ${COR_TIPO[n.tipo] ?? 'rgb(var(--ink-mute))'}`,
      fontSize: 13,
      lineHeight: 1.35,
      fontWeight: 500,
      textAlign: 'left' as const,
      boxShadow: central ? '0 0 0 2px rgb(var(--brand))' : 'none'
    });
    const pos = posicoesRadiais(mostrados.length);
    return [
      { id: no.id, position: { x: 0, y: 0 }, data: { label: no.rotulo }, style: estilo(no, true) },
      ...mostrados.map((v, i) => ({ id: v.id, position: pos[i], data: { label: v.rotulo }, style: estilo(v, false) }))
    ];
  }, [no, mostrados]);

  const edges: Edge[] = useMemo(() => {
    const visiveis = new Set(nodes.map(n => n.id));
    return arestas
      .filter(a => visiveis.has(a.origem_id) && visiveis.has(a.destino_id))
      .map(a => ({
        id: String(a.id),
        source: a.origem_id,
        target: a.destino_id,
        label: a.rotulo || a.tipo,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, color: '#7b8794', width: 16, height: 16 },
        style: { stroke: '#7b8794', strokeWidth: 1.5 },
        labelStyle: { fill: 'rgb(var(--ink-soft))', fontSize: 12, fontWeight: 500 },
        labelBgStyle: { fill: 'rgb(var(--canvas))', fillOpacity: 1 },
        labelBgPadding: [6, 3] as [number, number]
      }));
  }, [arestas, nodes]);

  return (
    <div className="flex flex-col gap-3">
      <div className="h-[460px] rounded-lg border border-line overflow-hidden bg-canvas">
        <ReactFlow
          key={no.id}
          nodes={nodes}
          edges={edges}
          onNodeClick={(_, n) => n.id !== no.id && onAbrir(n.id)}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.3}
          nodesDraggable={false}
          nodesConnectable={false}
          aria-label="Mapa de relações do precedente"
        >
          <Background gap={20} size={1} color="rgb(217 222 229 / 0.7)" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
      {vizinhos.length > MAXIMO_DE_VIZINHOS && <p className="text-sm text-ink-mute">Mostrando {MAXIMO_DE_VIZINHOS} de {vizinhos.length} precedentes relacionados.</p>}
      <ul className="flex flex-col gap-2 text-sm" aria-label="Relações em texto">
        {arestas.map(a => {
          const saida = a.origem_id === no.id;
          const outro = vizinhos.find(v => v.id === (saida ? a.destino_id : a.origem_id));
          return (
            <li key={a.id}>
              <span className="text-ink-mute">{saida ? a.rotulo || a.tipo : `${a.rotulo || a.tipo} (recebida)`}: </span>
              {outro ? (
                <button type="button" onClick={() => onAbrir(outro.id)} className="font-medium text-brand-text hover:underline underline-offset-2">
                  {outro.rotulo}
                </button>
              ) : (
                <span>{saida ? a.destino_id : a.origem_id}</span>
              )}
              <span className="text-ink-mute">
                {' '}
                · validada por {a.validado_por}
                {a.fontes[0] ? ` · ${a.fontes[0].ato}` : ''}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
