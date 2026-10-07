'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [itensRecentes, setItensRecentes] = useState<Array<{ titulo: string; modulo: string; url: string; data: string }>>([]);

  useEffect(() => {
    // Ler histórico real salvo pelo usuário caso exista
    try {
      const historico = localStorage.getItem('ratione_historico_recente');
      if (historico) {
        setItensRecentes(JSON.parse(historico));
      }
    } catch {
      // Ignorar caso sem acesso ao localStorage
    }
  }, []);

  return (
    <div className="space-y-16 py-8">
      {/* 7.1 Hero Sóbrio e Editorial */}
      <div className="max-w-3xl space-y-3">
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight text-[#F2F4F7] leading-tight">
          Direito, estruturado.
        </h1>
        <p className="text-base sm:text-lg text-[#A8B0BB] leading-relaxed font-sans">
          Ferramentas especializadas para analisar decisões, compreender normas, explorar jurisprudência e calcular prazos.
        </p>
      </div>

      {/* 7.2 Quatro Ferramentas com Representações Visuais Únicas e Distintas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 1. ARGUMENTA: Representação Visual da Cadeia de Decisão */}
        <div className="bg-[#11161D] border border-[#232B35] rounded-lg p-6 flex flex-col justify-between hover:border-[#2F3946] transition-colors group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#4A918B] uppercase tracking-wider">
                Argumenta
              </span>
              <span className="text-xs text-[#737E8C]">Análise de Decisões</span>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-semibold text-[#F2F4F7]">
                Entenda como uma decisão foi construída.
              </h2>
              <p className="text-xs text-[#A8B0BB] mt-1 leading-relaxed">
                Decomposição de sentenças e acórdãos em teses, premissas e análise crítica de fundamentação.
              </p>
            </div>

            {/* Representação visual específica: Decisão -> Tese -> Fundamento -> Conclusão */}
            <div className="bg-[#0B0F14] border border-[#232B35] rounded p-3.5 my-3 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[#A8B0BB]">
                <span className="text-[#F2F4F7] font-medium">Decisão analisada</span>
                <span className="text-[#737E8C]">Sentença Cível</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-[#1C232C]">
                <div className="bg-[#161C24] p-1.5 rounded border border-[#232B35] text-center">
                  <span className="block text-[#737E8C] text-[10px]">Tese</span>
                  <span className="text-[#F2F4F7] font-medium truncate block">Resp. Objetiva</span>
                </div>
                <div className="bg-[#161C24] p-1.5 rounded border border-[#232B35] text-center">
                  <span className="block text-[#737E8C] text-[10px]">Fundamento</span>
                  <span className="text-[#4F7FC8] font-medium truncate block">Art. 14 CDC</span>
                </div>
                <div className="bg-[#161C24] p-1.5 rounded border border-[#232B35] text-center">
                  <span className="block text-[#737E8C] text-[10px]">Conclusão</span>
                  <span className="text-[#3E8F70] font-medium truncate block">Procedente</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-[#1C232C]">
            <Link
              href="/argumenta"
              className="inline-flex items-center gap-2 text-xs font-medium text-[#F2F4F7] bg-[#161C24] hover:bg-[#2B6F6A] px-3.5 py-2 rounded border border-[#232B35] hover:border-[#2B6F6A] transition-all"
            >
              <span>Analisar decisão</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 2. NORMAVIVA: Representação de Artigo, Linha do Tempo e Versões */}
        <div className="bg-[#11161D] border border-[#232B35] rounded-lg p-6 flex flex-col justify-between hover:border-[#2F3946] transition-colors group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#4F7FC8] uppercase tracking-wider">
                NormaViva
              </span>
              <span className="text-xs text-[#737E8C]">Edição Legislativa</span>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-semibold text-[#F2F4F7]">
                Veja a lei como ela realmente vigora.
              </h2>
              <p className="text-xs text-[#A8B0BB] mt-1 leading-relaxed">
                Texto normativo contextualizado, linha do tempo legislativa e histórico de redações em qualquer data.
              </p>
            </div>

            {/* Representação visual específica: Artigo + Linha do Tempo */}
            <div className="bg-[#0B0F14] border border-[#232B35] rounded p-3.5 my-3 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#F2F4F7] font-medium">Art. 85, § 2º &middot; CPC</span>
                <span className="text-[#3E8F70] bg-[#3E8F70]/10 px-1.5 py-0.2 rounded text-[10px]">Vigente</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#737E8C] pt-2 border-t border-[#1C232C]">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#737E8C]" /> 2015: Redação Original
                </span>
                <span className="text-[#737E8C]">&rarr;</span>
                <span className="flex items-center gap-1.5 text-[#4F7FC8]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4F7FC8]" /> 2022: Lei 14.365
                </span>
                <span className="text-[#737E8C]">&rarr;</span>
                <span className="flex items-center gap-1.5 text-[#3E8F70]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3E8F70]" /> Hoje
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-[#1C232C]">
            <Link
              href="/normaviva"
              className="inline-flex items-center gap-2 text-xs font-medium text-[#F2F4F7] bg-[#161C24] hover:bg-[#2B6F6A] px-3.5 py-2 rounded border border-[#232B35] hover:border-[#2B6F6A] transition-all"
            >
              <span>Consultar norma</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 3. TESEMAP: Representação de Rede de Precedentes e Distinções */}
        <div className="bg-[#11161D] border border-[#232B35] rounded-lg p-6 flex flex-col justify-between hover:border-[#2F3946] transition-colors group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#8069B0] uppercase tracking-wider">
                TeseMap
              </span>
              <span className="text-xs text-[#737E8C]">Rede Jurisprudencial</span>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-semibold text-[#F2F4F7]">
                Explore como uma tese se conecta à jurisprudência.
              </h2>
              <p className="text-xs text-[#A8B0BB] mt-1 leading-relaxed">
                Navegação por precedentes vinculantes, distinções (distinguishing) e evolução de entendimentos.
              </p>
            </div>

            {/* Representação visual específica: Nós + Distinção */}
            <div className="bg-[#0B0F14] border border-[#232B35] rounded p-3.5 my-3 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#C8903D] font-medium">Tema 1.076 / STJ</span>
                <span className="text-[#737E8C] text-[10px]">Corte Especial</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] pt-2 border-t border-[#1C232C]">
                <span className="px-2 py-0.5 rounded bg-[#161C24] border border-[#4F7FC8] text-[#4F7FC8]">
                  Art. 85, § 2º
                </span>
                <span className="text-[#737E8C]">&harr;</span>
                <span className="px-2 py-0.5 rounded bg-[#161C24] border border-[#8069B0] text-[#8069B0]">
                  Distinguishing: Inestimável
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-[#1C232C]">
            <Link
              href="/tesemap"
              className="inline-flex items-center gap-2 text-xs font-medium text-[#F2F4F7] bg-[#161C24] hover:bg-[#2B6F6A] px-3.5 py-2 rounded border border-[#232B35] hover:border-[#2B6F6A] transition-all"
            >
              <span>Explorar tese</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 4. PRAZOZERO: Representação de Calendário, Contagem e Vencimento */}
        <div className="bg-[#11161D] border border-[#232B35] rounded-lg p-6 flex flex-col justify-between hover:border-[#2F3946] transition-colors group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#2B6F6A] uppercase tracking-wider">
                PrazoZero
              </span>
              <span className="text-xs text-[#737E8C]">Cálculo Verificável</span>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-semibold text-[#F2F4F7]">
                Calcule um prazo e veja exatamente como ele foi contado.
              </h2>
              <p className="text-xs text-[#A8B0BB] mt-1 leading-relaxed">
                Determinação objetiva de termo inicial e final, com memória de cálculo detalhada dia a dia.
              </p>
            </div>

            {/* Representação visual específica: Calendário + Vencimento Final */}
            <div className="bg-[#0B0F14] border border-[#232B35] rounded p-3.5 my-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#737E8C] uppercase block">Prazo Final Calculado</span>
                <span className="font-serif text-lg font-bold text-[#F2F4F7]">01 de abril de 2026</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#A8B0BB] block">15 dias úteis</span>
                <span className="text-[10px] text-[#4A918B]">Memória verificável &rarr;</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-[#1C232C]">
            <Link
              href="/prazozero"
              className="inline-flex items-center gap-2 text-xs font-medium text-[#F2F4F7] bg-[#161C24] hover:bg-[#2B6F6A] px-3.5 py-2 rounded border border-[#232B35] hover:border-[#2B6F6A] transition-all"
            >
              <span>Calcular prazo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 7.3 Recentes: Exibir apenas quando houver dados reais do usuário (se vazio, ocultar) */}
      {itensRecentes.length > 0 && (
        <div className="pt-6 border-t border-[#1C232C]">
          <h3 className="text-xs font-medium uppercase tracking-wider text-[#737E8C] mb-4">
            Recentes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {itensRecentes.map((item, idx) => (
              <Link
                key={idx}
                href={item.url}
                className="p-3 rounded bg-[#11161D] border border-[#232B35] hover:border-[#2F3946] transition-colors block"
              >
                <span className="text-[10px] text-[#4A918B] block mb-0.5">{item.modulo}</span>
                <span className="text-xs text-[#F2F4F7] font-medium block truncate">{item.titulo}</span>
                <span className="text-[10px] text-[#737E8C] block mt-1">{item.data}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
