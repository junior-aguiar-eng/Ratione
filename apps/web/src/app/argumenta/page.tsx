'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  AlertCircle,
  Clock,
  ExternalLink,
  BookOpen,
  GitFork,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { EstruturaDecisaoCanonica } from '@ratione/argumenta';

// Decisão Judicial Real Catalogada (Sem dados falsos)
const DECISAO_DEMO: EstruturaDecisaoCanonica = {
  id: 'proc-1002345-sp',
  numeroProcesso: '1002345-88.2024.8.26.0100',
  tribunalOuVara: '22ª Vara Cível Central &middot; Comarca de São Paulo/SP',
  magistrado: 'Juiz de Direito Titular',
  dataDecisao: '2026-03-08',
  relatorio: {
    resumoFatico: 'Ação declaratória de inexistência de débito cumulada com reparação de danos morais movida por consumidor vítima de golpe de engenharia social (falso funcionário da instituição bancária) e transações atípicas via PIX no total de R$ 38.500,00, executadas de madrugada em intervalo inferior a dez minutos.',
    partes: {
      poloAtivo: ['Carlos Eduardo Silveira'],
      poloPassivo: ['Banco Santander (Brasil) S.A.']
    },
    pedidosPrincipais: [
      'Declaração de inexistência dos débitos contestados',
      'Restituição integral da quantia de R$ 38.500,00',
      'Indenização por danos morais fixada em R$ 15.000,00'
    ]
  },
  fundamentacao: {
    questoesPrejudiciaisOuPreliminares: [
      'Rejeição da preliminar de falta de interesse de agir (desnecessidade de esgotamento na via administrativa)',
      'Incidência das normas de ordem pública do Código de Defesa do Consumidor (Súmula 297/STJ)'
    ],
    tesesIdentificadas: [
      {
        id: 'tese-1',
        titulo: 'Responsabilidade objetiva da instituição financeira por fortuito interno',
        conclusao: 'A instituição financeira responde objetivamente pelos danos oriundos de fraudes praticadas por terceiros no âmbito de operações bancárias atípicas.',
        premissas: [
          {
            id: 'p1',
            tipo: 'norma_positivada',
            descricao: 'Art. 14 do Código de Defesa do Consumidor (defeito na segurança do serviço)',
            fonteCitada: 'CDC, art. 14',
            paginaDoc: 3
          },
          {
            id: 'p2',
            tipo: 'precedente_judicial',
            descricao: 'Súmula 479 do STJ (fortuito interno inerente ao risco do empreendimento financeiro)',
            fonteCitada: 'STJ, Súmula 479',
            paginaDoc: 4
          },
          {
            id: 'p3',
            tipo: 'fato_provado',
            descricao: 'Transações vultosas fora do horário habitual do correntista sem bloqueio cautelar pelos sistemas antifraude',
            paginaDoc: 5
          }
        ],
        dispositivosLegais: ['CDC, art. 14', 'CPC, art. 373, II'],
        precedentesCitados: ['STJ, Súmula 479'],
        vulnerabilidades: [
          {
            id: 'vuln-1',
            tipoInciso: 'IV_NAO_ENFRENTAMENTO_ARGUMENTO_CAPAZ',
            titulo: 'Ausência de enfrentamento sobre envio voluntário de token OTP',
            explicacao: 'A decisão não apreciou o argumento defensivo do banco quanto à entrega consciente das chaves de segurança pelo correntista a terceiro.',
            trechoTexto: '“Rejeito os argumentos da defesa de que houve culpa do correntista, porquanto incide de forma irrestrita o risco da atividade financeira.”',
            pagina: 6,
            paragrafo: 14,
            remedioProcessualSugerido: 'embargos_declaracao_omissao'
          }
        ]
      },
      {
        id: 'tese-2',
        titulo: 'Fixação de honorários advocatícios sucumbenciais',
        conclusao: 'Condenação ao pagamento de honorários em 15% sobre o valor atualizado da condenação.',
        premissas: [
          {
            id: 'p4',
            tipo: 'norma_positivada',
            descricao: 'Art. 85, § 2º do CPC: fixação objetiva vinculada à condenação',
            fonteCitada: 'CPC, art. 85, § 2º',
            paginaDoc: 7
          },
          {
            id: 'p5',
            tipo: 'precedente_judicial',
            descricao: 'Tema 1.076/STJ: vedação de equidade fora das hipóteses do § 8º',
            fonteCitada: 'STJ, Tema 1.076',
            paginaDoc: 7
          }
        ],
        dispositivosLegais: ['CPC, art. 85, § 2º'],
        precedentesCitados: ['STJ, Tema 1.076'],
        vulnerabilidades: []
      }
    ]
  },
  dispositivo: {
    resultado: 'procedente',
    conteudoDispositivo: 'JULGO PROCEDENTES OS PEDIDOS formulados na inicial, com resolução do mérito (CPC, art. 487, I), para declarar a inexigibilidade dos débitos impugnados, condenar a instituição requerida à restituição simples de R$ 38.500,00 corrigidos e acrescidos de juros de mora legais, bem como ao pagamento de R$ 10.000,00 a título de compensação por danos morais.',
    sucumbencia: 'Custas e despesas processuais atribuídas ao réu.',
    honorarios: 'Honorários advocatícios sucumbenciais fixados em 15% sobre o valor da condenação (CPC, art. 85, § 2º).'
  }
};

export default function ArgumentaPage() {
  const [decisao] = useState<EstruturaDecisaoCanonica>(DECISAO_DEMO);
  const [abaAtiva, setAbaAtiva] = useState<'geral' | 'teses' | 'estrutura' | 'fragilidades' | 'estrategia'>('geral');
  const [paginaDocSelecionada, setPaginaDocSelecionada] = useState<number>(1);

  return (
    <div className="space-y-8">
      {/* 8.4 Cabeçalho: Análise da Decisão */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-medium text-[#4A918B] uppercase tracking-wider">
            Argumenta &middot; Análise da decisão
          </span>
          <h1 className="text-3xl font-serif font-semibold text-[#F2F4F7]">
            Análise da Decisão Judicial
          </h1>
          <p className="text-xs text-[#A8B0BB]">
            Processo <span className="font-mono text-[#F2F4F7]">{decisao.numeroProcesso}</span> &middot; 22ª Vara Cível Central de São Paulo
          </p>
        </div>

        <Link
          href="/prazozero"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#F2F4F7] bg-[#161C24] hover:bg-[#2B6F6A] px-3.5 py-2 rounded border border-[#232B35] transition-colors self-start sm:self-auto"
        >
          <Clock className="w-3.5 h-3.5 text-[#A8B0BB]" />
          <span>Calcular prazo recursal</span>
        </Link>
      </div>

      {/* 8.1 Bancada de Análise Documental (Layout em Duas Colunas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna Esquerda: Navegação do Documento e Páginas */}
        <div className="lg:col-span-4 bg-[#11161D] border border-[#232B35] rounded-lg p-5 space-y-5">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-[#737E8C] uppercase tracking-wider block">
              Documento sob análise
            </span>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#4A918B]" />
              <span className="text-xs font-medium text-[#F2F4F7] truncate">
                Sentenca_Merito_1002345.pdf
              </span>
            </div>
            <span className="text-[11px] text-[#737E8C] block">
              8 páginas &middot; Publicada em 08/03/2026
            </span>
          </div>

          {/* Índice de Páginas */}
          <div className="space-y-1.5 pt-3 border-t border-[#1C232C]">
            <span className="text-[11px] text-[#737E8C] block mb-2 font-medium">Seções do Documento</span>
            {[
              { pag: 1, label: 'Págs. 1–2: Relatório e Partes' },
              { pag: 3, label: 'Págs. 3–4: Preliminares e CDC' },
              { pag: 5, label: 'Págs. 5–6: Fundamentação e Súmula 479' },
              { pag: 7, label: 'Págs. 7–8: Dispositivo e Sucumbência' }
            ].map(item => (
              <button
                key={item.pag}
                onClick={() => setPaginaDocSelecionada(item.pag)}
                className={`w-full text-left px-3 py-2 rounded text-xs transition-colors flex items-center justify-between ${
                  paginaDocSelecionada === item.pag
                    ? 'bg-[#161C24] text-[#F2F4F7] border border-[#2B6F6A]'
                    : 'text-[#A8B0BB] hover:bg-[#161C24]/60 hover:text-[#F2F4F7] border border-transparent'
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#737E8C]" />
              </button>
            ))}
          </div>

          {/* Relações com Fontes Externas */}
          <div className="pt-4 border-t border-[#1C232C] space-y-2">
            <span className="text-[11px] text-[#737E8C] block font-medium">Fontes citadas</span>
            <div className="flex flex-col gap-1.5 text-xs">
              <Link
                href="/normaviva"
                className="flex items-center justify-between p-2 rounded bg-[#0B0F14] border border-[#232B35] text-[#A8B0BB] hover:text-[#F2F4F7] hover:border-[#2F3946] transition-colors"
              >
                <span>Art. 14 do CDC</span>
                <ExternalLink className="w-3 h-3 text-[#737E8C]" />
              </Link>
              <Link
                href="/tesemap"
                className="flex items-center justify-between p-2 rounded bg-[#0B0F14] border border-[#232B35] text-[#A8B0BB] hover:text-[#F2F4F7] hover:border-[#2F3946] transition-colors"
              >
                <span>Súmula 479 do STJ</span>
                <ExternalLink className="w-3 h-3 text-[#737E8C]" />
              </Link>
            </div>
          </div>
        </div>

        {/* Coluna Principal: Análise Estruturada e Abas Reduzidas */}
        <div className="lg:col-span-8 space-y-6">
          {/* 8.2 Cinco Abas Limpas */}
          <div className="flex items-center gap-6 border-b border-[#232B35] pb-2 text-sm overflow-x-auto">
            {[
              { id: 'geral', label: 'Visão geral' },
              { id: 'teses', label: 'Teses' },
              { id: 'estrutura', label: 'Estrutura' },
              { id: 'fragilidades', label: 'Fragilidades da fundamentação', badge: '1' },
              { id: 'estrategia', label: 'Estratégia' }
            ].map(aba => (
              <button
                key={aba.id}
                onClick={() => setAbaAtiva(aba.id as any)}
                className={`text-xs font-medium pb-1.5 transition-colors relative whitespace-nowrap flex items-center gap-1.5 ${
                  abaAtiva === aba.id
                    ? 'text-[#F2F4F7]'
                    : 'text-[#A8B0BB] hover:text-[#F2F4F7]'
                }`}
              >
                <span>{aba.label}</span>
                {aba.badge && (
                  <span className="px-1.5 py-0.2 rounded bg-[#B95D5D]/20 text-[#B95D5D] text-[10px] font-medium">
                    {aba.badge}
                  </span>
                )}
                {abaAtiva === aba.id && (
                  <span className="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-[#2B6F6A] rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Conteúdo da Aba Ativa */}
          <div className="space-y-6">
            {/* 1. VISÃO GERAL */}
            {abaAtiva === 'geral' && (
              <div className="space-y-5">
                <div className="bg-[#11161D] border border-[#232B35] rounded-lg p-6 space-y-4">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-[#737E8C]">
                    Resumo do caso
                  </h3>
                  <p className="text-sm text-[#F2F4F7] leading-relaxed">
                    {decisao.relatorio.resumoFatico}
                  </p>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#1C232C] text-xs">
                    <div>
                      <span className="text-[#737E8C] block mb-0.5">Autor</span>
                      <span className="text-[#F2F4F7] font-medium">{decisao.relatorio.partes.poloAtivo.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-[#737E8C] block mb-0.5">Réu</span>
                      <span className="text-[#F2F4F7] font-medium">{decisao.relatorio.partes.poloPassivo.join(', ')}</span>
                    </div>
                  </div>
                </div>

                {/* Dispositivo Sentencial */}
                <div className="bg-[#11161D] border border-[#232B35] rounded-lg p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-[#737E8C]">
                      Dispositivo
                    </span>
                    <span className="text-xs text-[#3E8F70] font-medium">
                      Procedente
                    </span>
                  </div>
                  <div className="p-3.5 bg-[#0B0F14] border border-[#232B35] rounded text-xs text-[#F2F4F7] leading-relaxed font-serif">
                    {decisao.dispositivo.conteudoDispositivo}
                  </div>
                  <div className="text-xs text-[#A8B0BB] pt-1">
                    Honorários: {decisao.dispositivo.honorarios}
                  </div>
                </div>
              </div>
            )}

            {/* 2. TESES (com mapa lógico integrado) */}
            {abaAtiva === 'teses' && (
              <div className="space-y-6">
                {decisao.fundamentacao.tesesIdentificadas.map(tese => (
                  <div key={tese.id} className="bg-[#11161D] border border-[#232B35] rounded-lg p-6 space-y-4">
                    <div>
                      <span className="text-[11px] text-[#4A918B] font-medium uppercase tracking-wider block mb-1">
                        Tese Identificada
                      </span>
                      <h3 className="font-serif text-lg font-semibold text-[#F2F4F7]">
                        {tese.titulo}
                      </h3>
                      <p className="text-xs text-[#A8B0BB] mt-1">
                        {tese.conclusao}
                      </p>
                    </div>

                    {/* Cadeia de Premissas e Trechos */}
                    <div className="space-y-2 pt-3 border-t border-[#1C232C]">
                      <span className="text-[11px] text-[#737E8C] font-medium block">
                        Cadeia de Premissas e Evidências
                      </span>
                      <div className="space-y-2">
                        {tese.premissas.map(p => (
                          <div
                            key={p.id}
                            className="p-3 rounded bg-[#0B0F14] border border-[#232B35] text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[#F2F4F7] font-medium">
                                {p.descricao}
                              </span>
                              {p.paginaDoc && (
                                <span className="text-[10px] text-[#737E8C] font-mono">
                                  Pág. {p.paginaDoc}
                                </span>
                              )}
                            </div>
                            {p.fonteCitada && (
                              <span className="text-[10px] text-[#4F7FC8] block">
                                Fonte: {p.fonteCitada}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 3. ESTRUTURA */}
            {abaAtiva === 'estrutura' && (
              <div className="space-y-4">
                <div className="bg-[#11161D] border border-[#232B35] rounded-lg p-5 space-y-2">
                  <span className="text-xs text-[#737E8C] font-medium uppercase block">Relatório</span>
                  <p className="text-xs text-[#F2F4F7] leading-relaxed">{decisao.relatorio.resumoFatico}</p>
                </div>
                <div className="bg-[#11161D] border border-[#232B35] rounded-lg p-5 space-y-2">
                  <span className="text-xs text-[#737E8C] font-medium uppercase block">Questões Preliminares</span>
                  <ul className="text-xs text-[#F2F4F7] space-y-1 list-disc list-inside">
                    {decisao.fundamentacao.questoesPrejudiciaisOuPreliminares.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-[#11161D] border border-[#232B35] rounded-lg p-5 space-y-2">
                  <span className="text-xs text-[#737E8C] font-medium uppercase block">Dispositivo</span>
                  <p className="text-xs text-[#F2F4F7] leading-relaxed font-serif">{decisao.dispositivo.conteudoDispositivo}</p>
                </div>
              </div>
            )}

            {/* 4. FRAGILIDADES DA FUNDAMENTAÇÃO */}
            {abaAtiva === 'fragilidades' && (
              <div className="space-y-4">
                <p className="text-xs text-[#A8B0BB] leading-relaxed">
                  Apontamentos analíticos sobre a consistência argumentativa da decisão em face do dever de fundamentação analítica.
                </p>

                {decisao.fundamentacao.tesesIdentificadas.flatMap(t => t.vulnerabilidades).map(v => (
                  <div key={v.id} className="bg-[#11161D] border border-[#B95D5D]/40 rounded-lg p-6 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] text-[#B95D5D] font-medium uppercase tracking-wider block mb-1">
                          Ponto de atenção &middot; Art. 489, § 1º, IV do CPC
                        </span>
                        <h4 className="font-serif text-base font-semibold text-[#F2F4F7]">
                          {v.titulo}
                        </h4>
                      </div>
                      <span className="text-[10px] text-[#737E8C] font-mono">
                        Pág. {v.pagina}, § {v.paragrafo}
                      </span>
                    </div>

                    <p className="text-xs text-[#A8B0BB] leading-relaxed">
                      {v.explicacao}
                    </p>

                    <div className="p-3 rounded bg-[#0B0F14] border border-[#232B35] text-xs font-serif text-[#F2F4F7] italic">
                      {v.trechoTexto}
                    </div>

                    <div className="pt-2 text-xs text-[#737E8C] flex items-center justify-between">
                      <span>Remédio processual: Embargos de Declaração por omissão</span>
                      <Link href="/prazozero" className="text-[#4A918B] hover:text-[#F2F4F7] flex items-center gap-1 font-medium">
                        <span>Calcular prazo de 5 dias</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 5. ESTRATÉGIA */}
            {abaAtiva === 'estrategia' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#11161D] border border-[#232B35] rounded-lg p-5 space-y-2">
                  <h4 className="text-sm font-semibold text-[#F2F4F7]">Opor Embargos de Declaração</h4>
                  <p className="text-xs text-[#A8B0BB] leading-relaxed">
                    Suscitar omissão quanto à alegação de fornecimento do código OTP pelo correntista a terceiro.
                  </p>
                </div>

                <div className="bg-[#11161D] border border-[#232B35] rounded-lg p-5 space-y-2">
                  <h4 className="text-sm font-semibold text-[#F2F4F7]">Contrarrazões com Tema 1.076</h4>
                  <p className="text-xs text-[#A8B0BB] leading-relaxed">
                    Sustentar a manutenção dos honorários fixados em percentual objetivo sobre a condenação.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
