'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Trash2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { lerHistorico, removerRegistro, RegistroHistorico, TipoHistorico } from '../../lib/historico';
import { tempoRelativo } from '../../lib/datas';

const FILTROS: { id: 'todos' | TipoHistorico; rotulo: string }[] = [
  { id: 'todos', rotulo: 'Todos' },
  { id: 'decisao', rotulo: 'Decisões' },
  { id: 'norma', rotulo: 'Normas' },
  { id: 'tese', rotulo: 'Teses' },
  { id: 'prazo', rotulo: 'Prazos' }
];

export default function MeuEspacoPage() {
  const [registros, setRegistros] = useState<RegistroHistorico[]>([]);
  const [carregado, setCarregado] = useState(false);
  const [filtro, setFiltro] = useState<'todos' | TipoHistorico>('todos');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    setRegistros(lerHistorico());
    setCarregado(true);
  }, []);

  const visiveis = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return registros.filter(
      r =>
        (filtro === 'todos' || r.tipo === filtro) &&
        (q === '' || `${r.titulo} ${r.detalhe ?? ''} ${r.modulo}`.toLowerCase().includes(q))
    );
  }, [registros, filtro, busca]);

  return (
    <div>
      <PageHeader
        eyebrow="Biblioteca pessoal"
        title="Meu espaço"
        description="Os cálculos, normas, teses e análises que você salvou. Os registros ficam apenas neste navegador."
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex flex-wrap gap-1" role="group" aria-label="Filtrar por tipo">
          {FILTROS.map(f => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filtro === f.id}
              onClick={() => setFiltro(f.id)}
              className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                filtro === f.id ? 'bg-brand-tint text-brand-text' : 'text-ink-soft hover:text-ink hover:bg-surface-2'
              }`}
            >
              {f.rotulo}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-ink-mute absolute left-3 top-1/2 -translate-y-1/2" aria-hidden />
          <input
            type="search"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Pesquisar nos registros"
            aria-label="Pesquisar nos registros"
            className="field pl-9!"
          />
        </div>
      </div>

      {!carregado ? null : registros.length === 0 ? (
        <EmptyState
          titulo="Você ainda não salvou nada"
          acao={
            <Link href="/prazozero" className="btn-primary">
              Calcular um prazo
            </Link>
          }
        >
          Use o botão &ldquo;Salvar em Meu espaço&rdquo; nas ferramentas para guardar cálculos, normas, teses e análises.
        </EmptyState>
      ) : visiveis.length === 0 ? (
        <EmptyState titulo="Nenhum registro encontrado">Altere o filtro ou a pesquisa.</EmptyState>
      ) : (
        <ul className="divide-y divide-line border-y border-line mt-4">
          {visiveis.map(r => (
            <li key={r.id} className="flex items-start justify-between gap-4 py-5">
              <div className="min-w-0 space-y-1">
                <Link href={r.url} className="text-lg font-medium text-ink hover:text-brand-text">
                  {r.titulo}
                </Link>
                <p className="text-sm text-ink-mute">
                  {r.modulo} · {tempoRelativo(r.criadoEm)}
                </p>
                {r.detalhe && <p className="text-sm text-ink-soft">{r.detalhe}</p>}
              </div>
              <button
                type="button"
                onClick={() => setRegistros(removerRegistro(r.id))}
                aria-label={`Remover ${r.titulo}`}
                className="p-2 rounded-md text-ink-mute hover:text-danger-text hover:bg-danger-tint transition-colors shrink-0"
              >
                <Trash2 className="w-[18px] h-[18px]" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
