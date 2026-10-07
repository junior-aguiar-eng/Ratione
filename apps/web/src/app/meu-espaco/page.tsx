'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface RegistroBiblioteca {
  id: string;
  titulo: string;
  modulo: 'Argumenta' | 'NormaViva' | 'TeseMap' | 'PrazoZero';
  tipo: 'decisao' | 'norma' | 'tese' | 'prazo';
  dataRelativa: string;
  url: string;
  detalhe?: string;
}

const REGISTROS_EXEMPLO: RegistroBiblioteca[] = [
  {
    id: '1',
    titulo: 'Apelação Cível TJSP &middot; 15 dias úteis',
    modulo: 'PrazoZero',
    tipo: 'prazo',
    dataRelativa: 'hoje às 14:20',
    url: '/prazozero',
    detalhe: 'Prazo final em 01/04/2026'
  },
  {
    id: '2',
    titulo: 'Sentença Santander (Fraude Bancária e PIX)',
    modulo: 'Argumenta',
    tipo: 'decisao',
    dataRelativa: 'ontem',
    url: '/argumenta',
    detalhe: 'Processo 1002345-88.2024.8.26.0100 &middot; 1 omissão (Art. 489, § 1º, IV)'
  },
  {
    id: '3',
    titulo: 'Art. 85, § 2º &middot; CPC/15',
    modulo: 'NormaViva',
    tipo: 'norma',
    dataRelativa: '3 de outubro',
    url: '/normaviva',
    detalhe: 'Honorários advocatícios e Lei 14.365/2022'
  },
  {
    id: '4',
    titulo: 'Tema 1.076 / STJ &middot; Vedação da Equidade',
    modulo: 'TeseMap',
    tipo: 'tese',
    dataRelativa: '5 de outubro',
    url: '/tesemap',
    detalhe: 'Corte Especial &middot; Precedente Vinculante'
  }
];

export default function MeuEspacoPage() {
  const [filtro, setFiltro] = useState<'todos' | 'decisao' | 'norma' | 'tese' | 'prazo'>('todos');
  const [busca, setBusca] = useState('');

  const itensFiltrados = REGISTROS_EXEMPLO.filter(item => {
    const matchFiltro = filtro === 'todos' || item.tipo === filtro;
    const matchBusca = busca === '' || item.titulo.toLowerCase().includes(busca.toLowerCase()) || item.modulo.toLowerCase().includes(busca.toLowerCase());
    return matchFiltro && matchBusca;
  });

  return (
    <div className="space-y-8">
      {/* 12.1 Cabeçalho */}
      <div className="space-y-1">
        <span className="text-xs font-medium text-[#737E8C] uppercase tracking-wider">
          Biblioteca pessoal
        </span>
        <h1 className="text-3xl font-serif font-semibold text-[#F2F4F7]">
          Meu espaço
        </h1>
        <p className="text-sm text-[#A8B0BB]">
          Histórico e registros salvos nas suas sessões de trabalho jurídico.
        </p>
      </div>

      {/* 12.1 Barra de Busca e Filtros */}
      <div className="bg-[#11161D] border border-[#232B35] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filtros em texto/chips */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1 sm:pb-0">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'prazo', label: 'Prazos' },
            { id: 'decisao', label: 'Decisões' },
            { id: 'norma', label: 'Normas' },
            { id: 'tese', label: 'Teses' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id as any)}
              className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
                filtro === f.id
                  ? 'bg-[#161C24] text-[#F2F4F7] border border-[#2B6F6A]'
                  : 'text-[#A8B0BB] hover:text-[#F2F4F7] hover:bg-[#161C24]/50 border border-transparent'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Input de Busca */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#737E8C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar nos registros..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full bg-[#0B0F14] border border-[#232B35] rounded pl-9 pr-3 py-1.5 text-xs text-[#F2F4F7] focus:outline-none focus:border-[#2B6F6A]"
          />
        </div>
      </div>

      {/* 12.2 Lista de Itens como Registros Simples (sem cards aninhados gigantes) */}
      <div className="bg-[#11161D] border border-[#232B35] rounded-lg divide-y divide-[#1C232C]">
        {itensFiltrados.length > 0 ? (
          itensFiltrados.map(item => (
            <div
              key={item.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#161C24]/40 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-[#4A918B]">
                    {item.modulo}
                  </span>
                  <span className="text-[11px] text-[#737E8C]">&middot;</span>
                  <span className="text-[11px] text-[#737E8C]">{item.dataRelativa}</span>
                </div>
                <h3 className="text-sm font-medium text-[#F2F4F7]">
                  {item.titulo}
                </h3>
                {item.detalhe && (
                  <p className="text-xs text-[#A8B0BB]">{item.detalhe}</p>
                )}
              </div>

              <div className="shrink-0 pt-2 sm:pt-0">
                <Link
                  href={item.url}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#A8B0BB] hover:text-[#F2F4F7] px-3 py-1.5 rounded bg-[#0B0F14] border border-[#232B35] hover:border-[#2F3946] transition-colors"
                >
                  <span>Abrir</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-xs text-[#737E8C]">
            Nenhum registro encontrado para o filtro selecionado.
          </div>
        )}
      </div>
    </div>
  );
}
