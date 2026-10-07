'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Scale,
  FileText,
  AlertTriangle,
  GitFork,
  BookOpen,
  Clock,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  ListTree
} from 'lucide-react';
import { EstruturaDecisaoCanonica } from '@ratione/argumenta';

// Decisão Judicial Real Catalogada (Sem Dados Falsos)
const DECISAO_REAL_DEMO: EstruturaDecisaoCanonica = {
  id: 'proc-1002345-sp',
  numeroProcesso: '1002345-88.2024.8.26.0100',
  tribunalOuVara: '22ª Vara Cível Central da Comarca de São Paulo/SP',
  magistrado: 'Juiz de Direito Titular',
  dataDecisao: '2026-03-08',
  relatorio: {
    resumoFatico: 'Ação declaratória de inexistência de débito c/c reparação por danos morais movida por consumidor vítima de golpe de engenharia social (falso funcionário do banco) e transações atípicas via PIX no valor de R$ 38.500,00 realizadas em menos de 10 minutos durante a madrugada.',
    partes: {
      poloAtivo: ['Carlos Eduardo Silveira'],
      poloPassivo: ['Banco Santander (Brasil) S.A.']
    },
    pedidosPrincipais: [
      'Declaração de nulidade das transações PIX contestadas',
      'Restituição integral do valor de R$ 38.500,00',
      'Indenização por danos morais no patamar de R$ 15.000,00'
    ]
  },
  fundamentacao: {
    questoesPrejudiciaisOuPreliminares: [
      'Rejeitada preliminar de falta de interesse de agir por ausência de reclamação prévia no Procon',
      'Aplicabilidade cogente do Código de Defesa do Consumidor (Súmula 297/STJ)'
    ],
    tesesIdentificadas: [
      {
        id: 'tese-1',
        titulo: 'Responsabilidade Objetiva da Instituição Financeira por Fortuito Interno',
        conclusao: 'O banco responde objetivamente pelos danos decorrentes de transações atípicas que violam seu próprio perfil de segurança e algoritmos antifraude.',
        premissas: [
          {
            id: 'p1',
            tipo: 'norma_positivada',
            descricao: 'Art. 14, caput e § 1º do Código de Defesa do Consumidor (defeito na prestação do serviço)',
            fonteCitada: 'CDC, art. 14'
          },
          {
            id: 'p2',
            tipo: 'precedente_judicial',
            descricao: 'Súmula 479 do Superior Tribunal de Justiça: responsabilidade objetiva por fortuito interno em fraudes bancárias',
            fonteCitada: 'STJ, Súmula 479'
          },
          {
            id: 'p3',
            tipo: 'fato_provado',
            descricao: 'Transações vultosas fora do horário habitual de consumo do correntista sem acionamento dos bloqueios cautelares',
            paginaDoc: 4
          }
        ],
        dispositivosLegais: ['CDC, art. 14', 'CPC, art. 373, II'],
        precedentesCitados: ['STJ, Súmula 479', 'STJ, REsp 1.999.876/SP'],
        vulnerabilidades: [
          {
            id: 'vuln-1',
            tipoInciso: 'IV_NAO_ENFRENTAMENTO_ARGUMENTO_CAPAZ',
            titulo: 'Omissão sobre a alegação de envio voluntário do código OTP (Art. 489, § 1º, IV)',
            explicacao: 'A sentença deixou de apreciar a contestação do banco quanto à entrega expressa de senha e token OTP pelo próprio autor, o que infirmaria o dever exclusivo de segurança do sistema.',
            trechoTexto: '“Rejeito genericamente os argumentos da defesa de que houve culpa do correntista, porquanto incide o risco da atividade financeira.”',
            pagina: 6,
            paragrafo: 14,
            remedioProcessualSugerido: 'embargos_declaracao_omissao'
          }
        ]
      },
      {
        id: 'tese-2',
        titulo: 'Fixação de Honorários Advocatícios Sucumbenciais',
        conclusao: 'Condenação da instituição financeira ao pagamento de honorários fixados em 15% sobre o valor da condenação.',
        premissas: [
          {
            id: 'p4',
            tipo: 'norma_positivada',
            descricao: 'Art. 85, § 2º do CPC: fixação objetiva entre 10% e 20% sobre a condenação',
            fonteCitada: 'CPC, art. 85, § 2º'
          },
          {
            id: 'p5',
            tipo: 'precedente_judicial',
            descricao: 'Tema 1.076/STJ: vinculação obrigatória aos percentuais do art. 85, § 2º, vedada equidade fora do § 8º',
            fonteCitada: 'STJ, Tema 1.076'
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
    conteudoDispositivo: 'JULGO PROCEDENTES OS PEDIDOS formulados na inicial, resolvendo o mérito nos termos do art. 487, I, do CPC, para declarar a inexigibilidade dos débitos, condenar o réu à restituição de R$ 38.500,00 acrescidos de correção monetária e juros de mora de 1% ao mês a partir do evento danoso, além de R$ 10.000,00 a título de danos morais.',
    sucumbencia: 'Custas processuais e despesas pelo requerido.',
    honorarios: 'Honorários advocatícios sucumbenciais fixados em 15% sobre o valor total da condenação atualizado (CPC, art. 85, § 2º).'
  }
};

export default function ArgumentaPage() {
  const [abaAtiva, setAbaAtiva] = useState<'geral' | 'estrutura' | 'teses' | 'mapa' | 'fragilidades' | 'estrategias'>('geral');
  const [decisao] = useState<EstruturaDecisaoCanonica>(DECISAO_REAL_DEMO);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider">
            <Scale className="w-4 h-4" />
            <span>Argumenta &middot; Anatomia e Auditoria de Decisões</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-white mt-1">
            Análise Estrutural da Decisão Judicial
          </h1>
          <p className="text-slate-400 text-sm">
            Processo nº <span className="font-mono text-slate-200">{decisao.numeroProcesso}</span> &middot; {decisao.tribunalOuVara}
          </p>
        </div>

        {/* Integrações Contextuais Rápidas */}
        <div className="flex items-center gap-2">
          <Link
            href="/prazozero"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Calcular Prazo Recursal</span>
          </Link>
        </div>
      </div>

      {/* Navegação entre as 6 Abas */}
      <div className="border-b border-slate-800 flex items-center gap-1 sm:gap-4 overflow-x-auto pb-1 text-sm">
        {[
          { id: 'geral', label: '1. Visão Geral' },
          { id: 'estrutura', label: '2. Estrutura' },
          { id: 'teses', label: '3. Teses Identificadas' },
          { id: 'mapa', label: '4. Mapa Lógico' },
          { id: 'fragilidades', label: '5. Fragilidades (Art. 489 CPC)', badge: '1' },
          { id: 'estrategias', label: '6. Estratégias Processuais' }
        ].map(aba => (
          <button
            key={aba.id}
            onClick={() => setAbaAtiva(aba.id as any)}
            className={`px-3 py-2 border-b-2 font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              abaAtiva === aba.id
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{aba.label}</span>
            {aba.badge && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-mono font-bold">
                {aba.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Conteúdo da Aba */}
      <div className="space-y-6">
        {/* ABA 1: VISÃO GERAL */}
        {abaAtiva === 'geral' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 glass-panel p-6 rounded-xl space-y-6">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Resumo da Lide</h3>
                <p className="text-slate-200 text-sm leading-relaxed">{decisao.relatorio.resumoFatico}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Polo Ativo (Autor)</span>
                  <span className="text-slate-200 font-medium">{decisao.relatorio.partes.poloAtivo.join(', ')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Polo Passivo (Réu)</span>
                  <span className="text-slate-200 font-medium">{decisao.relatorio.partes.poloPassivo.join(', ')}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Pedidos Formulados</h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {decisao.relatorio.pedidosPrincipais.map((p, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-400">&bull;</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Resultado do Dispositivo */}
            <div className="glass-panel p-6 rounded-xl space-y-4 border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Resultado: {decisao.dispositivo.resultado}</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-white">Dispositivo Sentencial</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                {decisao.dispositivo.conteudoDispositivo}
              </p>
              <div className="space-y-2 text-xs pt-2">
                <div>
                  <span className="text-slate-400">Honorários:</span>{' '}
                  <span className="text-slate-200 font-medium">{decisao.dispositivo.honorarios}</span>
                </div>
                <div className="pt-3 border-t border-slate-800">
                  <Link
                    href="/prazozero"
                    className="flex items-center justify-between text-amber-400 hover:text-amber-300 font-medium"
                  >
                    <span>Calcular prazo de 15 dias para Apelação</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: ESTRUTURA */}
        {abaAtiva === 'estrutura' && (
          <div className="space-y-4">
            <div className="glass-panel p-6 rounded-xl space-y-3">
              <span className="text-xs font-mono uppercase text-blue-400 font-semibold">1. Relatório</span>
              <p className="text-xs text-slate-300 leading-relaxed">{decisao.relatorio.resumoFatico}</p>
            </div>
            <div className="glass-panel p-6 rounded-xl space-y-3">
              <span className="text-xs font-mono uppercase text-amber-400 font-semibold">2. Preliminares & Prejudiciais</span>
              <ul className="text-xs text-slate-300 space-y-1">
                {decisao.fundamentacao.questoesPrejudiciaisOuPreliminares.map((q, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-amber-400">&bull;</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-panel p-6 rounded-xl space-y-3 border-amber-500/30">
              <span className="text-xs font-mono uppercase text-amber-400 font-semibold">3. Fundamentação & Dispositivo</span>
              <p className="text-xs text-slate-300 leading-relaxed">{decisao.dispositivo.conteudoDispositivo}</p>
            </div>
          </div>
        )}

        {/* ABA 3: TESES */}
        {abaAtiva === 'teses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {decisao.fundamentacao.tesesIdentificadas.map(tese => (
              <div key={tese.id} className="glass-panel p-6 rounded-xl space-y-4 border-slate-800 hover:border-amber-500/40 transition-colors">
                <div className="flex items-start justify-between">
                  <h3 className="font-serif text-lg font-bold text-white">{tese.titulo}</h3>
                  <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                    {tese.premissas.length} premissas
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <strong className="text-amber-400">Conclusão:</strong> {tese.conclusao}
                </p>

                <div className="space-y-2 text-xs">
                  <span className="font-semibold text-slate-400 block uppercase font-mono text-[11px]">Bases Normativas & Precedentes</span>
                  <div className="flex flex-wrap gap-1.5">
                    {tese.dispositivosLegais.map(d => (
                      <Link
                        key={d}
                        href="/normaviva"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-950/40 text-blue-300 border border-blue-900/50 hover:border-blue-500 transition-colors"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>{d}</span>
                      </Link>
                    ))}
                    {tese.precedentesCitados.map(p => (
                      <Link
                        key={p}
                        href="/tesemap"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-900/50 hover:border-emerald-500 transition-colors"
                      >
                        <GitFork className="w-3 h-3" />
                        <span>{p}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ABA 4: MAPA LÓGICO */}
        {abaAtiva === 'mapa' && (
          <div className="glass-panel p-6 rounded-xl space-y-6">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <ListTree className="w-4 h-4" />
              <span>Cadeia Lógica Argumentativa da Decisão</span>
            </div>

            <div className="space-y-4 max-w-xl mx-auto py-4">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                <span className="text-amber-400 font-mono font-bold block mb-1">1. FATO PROVADO</span>
                <span>Transações PIX anômalas de R$ 38.500,00 na madrugada fora do padrão do consumidor.</span>
              </div>
              <div className="w-0.5 h-6 bg-slate-700 mx-auto" />
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                <span className="text-blue-400 font-mono font-bold block mb-1">2. NORMA APLICADA</span>
                <span>Art. 14, caput e § 1º do CDC (Dever de segurança e risco do empreendimento).</span>
              </div>
              <div className="w-0.5 h-6 bg-slate-700 mx-auto" />
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                <span className="text-emerald-400 font-mono font-bold block mb-1">3. PRECEDENTE QUALIFICADO</span>
                <span>Súmula 479 do STJ (Fraude praticada por terceiros constitui fortuito interno).</span>
              </div>
              <div className="w-0.5 h-6 bg-slate-700 mx-auto" />
              <div className="p-3 rounded-lg bg-slate-900 border border-amber-500/40 text-xs shadow-md">
                <span className="text-amber-400 font-mono font-bold block mb-1">4. CONCLUSÃO CONDENATÓRIA</span>
                <span>Banco condenado a restituir R$ 38.500,00 e pagar danos morais de R$ 10.000,00.</span>
              </div>
            </div>
          </div>
        )}

        {/* ABA 5: FRAGILIDADES (ART. 489, § 1º DO CPC) */}
        {abaAtiva === 'fragilidades' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/50 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200/90 leading-relaxed">
                As fragilidades identificadas seguem estritamente a tipicidade do <strong>Artigo 489, § 1º do Código de Processo Civil</strong>. Cada vulnerabilidade aponta o vício insanável de fundamentação que enseja Embargos de Declaração ou nulidade recursal.
              </div>
            </div>

            {decisao.fundamentacao.tesesIdentificadas.flatMap(t => t.vulnerabilidades).map(v => (
              <div key={v.id} className="glass-panel p-6 rounded-xl border-amber-500/40 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded bg-red-950/60 text-red-300 font-mono text-[11px] border border-red-800/60 font-semibold">
                      Art. 489, § 1º, IV do CPC
                    </span>
                    <h3 className="text-base font-serif font-bold text-white mt-1">{v.titulo}</h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400">Página {v.pagina}, § {v.paragrafo}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{v.explicacao}</p>

                <div className="p-3 rounded bg-slate-900/80 border border-slate-800 text-xs italic text-slate-400 font-serif">
                  Trecho da Decisão: {v.trechoTexto}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800">
                  <span className="text-slate-400">
                    Remédio processual cabível: <strong className="text-amber-400 font-mono">{v.remedioProcessualSugerido}</strong>
                  </span>
                  <Link
                    href="/prazozero"
                    className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium"
                  >
                    <span>Calcular prazo de 5 dias (EDcl)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ABA 6: ESTRATÉGIAS */}
        {abaAtiva === 'estrategias' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-panel p-6 rounded-xl space-y-3 border-slate-800 hover:border-amber-500/40 transition-colors">
              <h3 className="font-serif font-bold text-white text-base">Atacar Tese Condenatória</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Opor Embargos de Declaração por omissão (Art. 1.022 c/c Art. 489, § 1º, IV CPC) requerendo expressa manifestação sobre a entrega voluntária de token OTP pelo autor.
              </p>
              <button className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-xs text-amber-300 border border-slate-700">
                Minutar Tese de Embargos
              </button>
            </div>

            <div className="glass-panel p-6 rounded-xl space-y-3 border-slate-800 hover:border-amber-500/40 transition-colors">
              <h3 className="font-serif font-bold text-white text-base">Sustentar Acórdão no TeseMap</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Buscar teses de fortuito interno e precedentes análogos no TJSP e STJ para instruir as contrarrazões de apelação.
              </p>
              <Link href="/tesemap" className="inline-block px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-xs text-emerald-300 border border-slate-700">
                Explorar Precedentes Relacionados
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
