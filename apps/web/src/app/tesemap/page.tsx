'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ReactFlow, Background, Controls, Node, Edge, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { BookOpen, Bookmark, Check, ExternalLink, Scale } from 'lucide-react';
import { GRAFOS_PRECEDENTES_CATALOGADOS, NoGrafo, TipoNoGrafo } from '@ratione/tesemap';
import PageHeader from '../../components/PageHeader';
import Notice from '../../components/Notice';
import { salvarRegistro } from '../../lib/historico';

const TEMAS = [
  { id: 'tema-1076-stj', rotulo: 'Tema 1.076/STJ · Honorários e equidade' },
  { id: 'sumula-479-stj', rotulo: 'Súmula 479/STJ · Fraude bancária' }
];

// Layout hierárquico: as fontes ficam acima dos itens que elas alteram, interpretam ou distinguem.
const POSICOES: Record<string, { x: number; y: number }> = {
  // Tema 1.076/STJ
  'lei-14365': { x: 150, y: 0 },
  'distinguishing-fazenda': { x: 580, y: 0 },
  'tema-1076-stj': { x: 150, y: 160 },
  'cpc-art85-p2': { x: 150, y: 330 },
  'cpc-art85-p8': { x: 480, y: 410 },
  'tema-central': { x: 150, y: 490 },
  // Súmula 479/STJ
  'distinguishing-culpa-exclusiva': { x: 0, y: 0 },
  'sumula-479-stj': { x: 0, y: 160 },
  'cdc-art14': { x: 0, y: 330 },
  'tema-fraude-bancaria': { x: 330, y: 410 }
};

const ESTILO_TIPO: Record<TipoNoGrafo, { rotulo: string; cor: string; tag: string; ponto: string }> = {
  tema_central: { rotulo: 'Tema', cor: 'rgb(var(--brand))', tag: 'tag-brand', ponto: 'bg-brand' },
  tese_vinculante: { rotulo: 'Precedente vinculante', cor: 'rgb(var(--warn))', tag: 'tag-warn', ponto: 'bg-warn' },
  dispositivo_legal: { rotulo: 'Dispositivo legal', cor: 'rgb(var(--info))', tag: 'tag-info', ponto: 'bg-info' },
  distinguishing: { rotulo: 'Distinguishing', cor: 'rgb(var(--rel))', tag: 'tag-rel', ponto: 'bg-rel' },
  inovacao_legislativa: { rotulo: 'Alteração legislativa', cor: 'rgb(var(--ok))', tag: 'tag-ok', ponto: 'bg-ok' },
  acordao_paradigma: { rotulo: 'Acórdão paradigma', cor: 'rgb(var(--warn))', tag: 'tag-warn', ponto: 'bg-warn' }
};

export default function TeseMapPage() {
  const [temaId, setTemaId] = useState(TEMAS[0].id);
  const [noSelecionado, setNoSelecionado] = useState<NoGrafo | null>(null);
  const [salvo, setSalvo] = useState(false);

  const grafo = GRAFOS_PRECEDENTES_CATALOGADOS[temaId];

  useEffect(() => {
    if (grafo?.nos.length) {
      setNoSelecionado(grafo.nos.find(n => n.tipo === 'tese_vinculante') ?? grafo.nos[0]);
    }
  }, [grafo]);

  const nodes: Node[] = useMemo(() => {
    if (!grafo) return [];
    return grafo.nos.map(n => {
      const estilo = ESTILO_TIPO[n.tipo];
      const selecionado = noSelecionado?.id === n.id;
      return {
        id: n.id,
        position: POSICOES[n.id] ?? { x: 200, y: 200 },
        data: { label: n.label, original: n },
        style: {
          width: 230,
          padding: '12px 14px',
          borderRadius: 8,
          background: 'rgb(var(--surface))',
          color: 'rgb(var(--ink))',
          border: '1px solid rgb(var(--line-strong))',
          borderLeft: `5px solid ${estilo.cor}`,
          fontSize: 14,
          lineHeight: 1.35,
          fontWeight: 500,
          textAlign: 'left' as const,
          boxShadow: selecionado ? '0 0 0 2px rgb(var(--brand))' : 'none'
        }
      };
    });
  }, [grafo, noSelecionado]);

  const edges: Edge[] = useMemo(() => {
    if (!grafo) return [];
    // Invertida para que arestas retas sejam desenhadas por último e seus rótulos fiquem sobre as demais.
    return [...grafo.arestas].reverse().map(a => ({
      id: a.id,
      source: a.source,
      target: a.target,
      label: a.label,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed, color: '#7b8794', width: 16, height: 16 },
      style: { stroke: '#7b8794', strokeWidth: 1.5 },
      labelStyle: { fill: 'rgb(var(--ink-soft))', fontSize: 12, fontWeight: 500 },
      labelBgStyle: { fill: 'rgb(var(--canvas))', fillOpacity: 1 },
      labelBgPadding: [6, 3] as [number, number]
    }));
  }, [grafo]);

  const relacoes = useMemo(() => {
    if (!grafo || !noSelecionado) return [];
    const por = (id: string) => grafo.nos.find(n => n.id === id)!;
    return grafo.arestas
      .filter(a => a.source === noSelecionado.id || a.target === noSelecionado.id)
      .map(a => {
        const saida = a.source === noSelecionado.id;
        return { id: a.id, saida, rotulo: a.label, outro: por(saida ? a.target : a.source) };
      });
  }, [grafo, noSelecionado]);

  const tiposPresentes = useMemo(
    () => Array.from(new Set((grafo?.nos ?? []).map(n => n.tipo))),
    [grafo]
  );

  const salvar = () => {
    if (!grafo) return;
    const tema = TEMAS.find(t => t.id === temaId)!;
    salvarRegistro({
      modulo: 'TeseMap',
      tipo: 'tese',
      titulo: tema.rotulo.split(' · ')[0],
      detalhe: grafo.temaPrincipal,
      url: '/tesemap'
    });
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  };

  return (
    <div>
      <PageHeader
        eyebrow="TeseMap"
        title="Mapa da tese"
        description="Veja como um precedente se relaciona com os dispositivos que interpreta, as alterações legislativas e as distinções possíveis."
        actions={
          <div className="w-full sm:w-80">
            <label htmlFor="tema" className="label">
              Tema
            </label>
            <select id="tema" value={temaId} onChange={e => setTemaId(e.target.value)} className="field">
              {TEMAS.map(t => (
                <option key={t.id} value={t.id}>
                  {t.rotulo}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <p className="text-lg font-serif text-ink mb-6 max-w-3xl">{grafo?.temaPrincipal}</p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-4">
          <div className="h-[600px] rounded-lg border border-line overflow-hidden bg-canvas">
            <ReactFlow
              key={temaId}
              nodes={nodes}
              edges={edges}
              onNodeClick={(_, node) => setNoSelecionado(node.data.original as NoGrafo)}
              fitView
              fitViewOptions={{ padding: 0.12 }}
              minZoom={0.4}
              nodesDraggable={false}
              nodesConnectable={false}
              aria-label="Mapa de relações do precedente"
            >
              <Background gap={20} size={1} color="rgb(217 222 229 / 0.7)" />
              <Controls showInteractive={false} />
            </ReactFlow>
          </div>

          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft" aria-label="Legenda">
            {tiposPresentes.map(t => (
              <li key={t} className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${ESTILO_TIPO[t].ponto}`} />
                {ESTILO_TIPO[t].rotulo}
              </li>
            ))}
          </ul>
        </div>

        <aside className="lg:col-span-4 lg:sticky lg:top-24 card p-6 space-y-6" aria-label="Detalhe do item selecionado">
          {noSelecionado && (
            <>
              <div className="space-y-3">
                <span className={ESTILO_TIPO[noSelecionado.tipo].tag}>{ESTILO_TIPO[noSelecionado.tipo].rotulo}</span>
                <h2 className="font-serif text-2xl font-semibold text-ink leading-snug">{noSelecionado.label}</h2>
                {noSelecionado.tribunal && (
                  <p className="text-sm text-ink-mute">
                    {noSelecionado.tribunal}
                    {noSelecionado.numeroReferencia ? ` · ${noSelecionado.numeroReferencia}` : ''}
                  </p>
                )}
                <p className="text-base text-ink-soft leading-relaxed">{noSelecionado.descricao}</p>
              </div>

              {relacoes.length > 0 && (
                <div className="border-t border-line pt-5">
                  <h3 className="text-sm font-semibold text-ink mb-3">Relações</h3>
                  <ul className="space-y-2.5">
                    {relacoes.map(r => (
                      <li key={r.id} className="text-sm leading-snug">
                        <span className="text-ink-mute">{r.saida ? r.rotulo : `${r.rotulo} (recebida)`}</span>
                        <br />
                        <button
                          type="button"
                          onClick={() => setNoSelecionado(r.outro)}
                          className="text-left font-medium text-brand-text hover:underline underline-offset-2"
                        >
                          {r.outro.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border-t border-line pt-5 space-y-2 text-sm">
                {noSelecionado.id.startsWith('cpc-art85') && (
                  <Link href="/normaviva" className="flex items-center gap-2.5 py-1.5 text-ink hover:text-brand-text">
                    <BookOpen className="w-4 h-4 text-info-text" />
                    Ver o dispositivo no NormaViva
                  </Link>
                )}
                {noSelecionado.tipo === 'tese_vinculante' && (
                  <Link href="/argumenta" className="flex items-center gap-2.5 py-1.5 text-ink hover:text-brand-text">
                    <Scale className="w-4 h-4 text-brand-text" />
                    Ver aplicação em uma decisão (Argumenta)
                  </Link>
                )}
                {noSelecionado.tribunal === 'STJ' && (
                  <a
                    href="https://www.stj.jus.br/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 py-1.5 text-ink hover:text-brand-text"
                  >
                    <ExternalLink className="w-4 h-4 text-ink-mute" />
                    Consultar no site do STJ
                  </a>
                )}
                <button type="button" onClick={salvar} className="btn-secondary w-full first:mt-2">
                  {salvo ? <Check className="w-4 h-4 text-ok-text" /> : <Bookmark className="w-4 h-4" />}
                  {salvo ? 'Salvo em Meu espaço' : 'Salvar tema em Meu espaço'}
                </button>
              </div>
            </>
          )}
        </aside>
      </div>

      <div className="mt-12 max-w-3xl">
        <Notice tom="info" titulo="Prévia">
          O mapa reúne dois temas catalogados. Confira o enunciado e a tese na fonte oficial do tribunal antes de citá-los.
        </Notice>
      </div>
    </div>
  );
}
