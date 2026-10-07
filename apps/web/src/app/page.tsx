import Link from 'next/link';
import { Scale, BookOpen, GitFork, Clock, ArrowRight, ShieldCheck, History } from 'lucide-react';

export default function HomePage() {
  const ferramentas = [
    {
      id: 'argumenta',
      nome: 'Argumenta',
      chamada: 'Entenda como uma decisão foi construída.',
      descricao: 'Desmonte sentenças e acórdãos em teses, premissas e vulnerabilidades do Art. 489, § 1º do CPC.',
      href: '/argumenta',
      botaoTexto: 'Analisar decisão',
      icone: Scale,
      corBorda: 'hover:border-amber-500/50',
      badge: 'Art. 489 CPC'
    },
    {
      id: 'normaviva',
      nome: 'NormaViva',
      chamada: 'Veja a lei como ela realmente vigora.',
      descricao: 'Consulte a redação exata de qualquer dispositivo no tempo (Point-in-Time), histórico de alterações e vigência.',
      href: '/normaviva',
      botaoTexto: 'Consultar norma',
      icone: BookOpen,
      corBorda: 'hover:border-blue-500/50',
      badge: 'LC 95/1998'
    },
    {
      id: 'tesemap',
      nome: 'TeseMap',
      chamada: 'Explore como uma tese se conecta à jurisprudência.',
      descricao: 'Navegue pelo grafo topológico de teses vinculantes, precedentes qualificados, distinções e superações.',
      href: '/tesemap',
      botaoTexto: 'Explorar tese',
      icone: GitFork,
      corBorda: 'hover:border-emerald-500/50',
      badge: 'Art. 927 CPC'
    },
    {
      id: 'prazozero',
      nome: 'PrazoZero',
      chamada: 'Calcule um prazo e veja exatamente como ele foi contado.',
      descricao: 'Motor 100% determinístico com memória de cálculo detalhada dia a dia e fundamentação legal de feriados.',
      href: '/prazozero',
      botaoTexto: 'Calcular prazo',
      icone: Clock,
      corBorda: 'hover:border-amber-400/50',
      badge: 'Arts. 219 e 224 CPC'
    }
  ];

  return (
    <div className="space-y-16 py-6">
      {/* Header Direto e Sóbrio */}
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Arquitetura Jurídica Especializada &middot; Sem assistentes genéricos</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
          O que você quer fazer hoje?
        </h1>
        <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
          Quatro ferramentas autônomas com rigor técnico e processual próprio. Escolha o seu objetivo e opere com segurança forense.
        </p>
      </div>

      {/* Quatro Grandes Ações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ferramentas.map(f => {
          const Icon = f.icone;
          return (
            <div
              key={f.id}
              className={`glass-panel p-7 rounded-xl flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-black/50 ${f.corBorda} group`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800">
                    {f.badge}
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl font-serif font-bold text-white tracking-wide">
                    {f.nome}
                  </h2>
                  <p className="text-base font-medium text-slate-200 mt-1">
                    {f.chamada}
                  </p>
                </div>

                <p className="text-sm text-slate-400 leading-relaxed">
                  {f.descricao}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/80">
                <Link
                  href={f.href}
                  className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-100 font-medium text-sm border border-slate-700/80 hover:border-amber-400 transition-all group-hover:shadow-md"
                >
                  <span>{f.botaoTexto}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Seção Recentes */}
      <div className="pt-8 border-t border-slate-900">
        <div className="flex items-center gap-2 mb-6 text-slate-400">
          <History className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 font-sans">
            Recentes na plataforma
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/argumenta"
            className="p-4 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors block"
          >
            <div className="text-[11px] text-amber-400 font-mono mb-1">Última análise</div>
            <div className="text-sm font-medium text-slate-200 truncate">Sentença &middot; ACP Fraude Bancária</div>
            <div className="text-xs text-slate-400 mt-1">2 teses &middot; 1 vulnerabilidade Art. 489</div>
          </Link>

          <Link
            href="/normaviva"
            className="p-4 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors block"
          >
            <div className="text-[11px] text-blue-400 font-mono mb-1">Última norma consultada</div>
            <div className="text-sm font-medium text-slate-200 truncate">Art. 85, § 2º &middot; CPC/15</div>
            <div className="text-xs text-slate-400 mt-1">Alterações da Lei 14.365/2022</div>
          </Link>

          <Link
            href="/tesemap"
            className="p-4 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors block"
          >
            <div className="text-[11px] text-emerald-400 font-mono mb-1">Última tese salva</div>
            <div className="text-sm font-medium text-slate-200 truncate">Tema 1.076 / STJ</div>
            <div className="text-xs text-slate-400 mt-1">Inadmissibilidade da equidade</div>
          </Link>

          <Link
            href="/prazozero"
            className="p-4 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors block"
          >
            <div className="text-[11px] text-amber-300 font-mono mb-1">Último cálculo</div>
            <div className="text-sm font-medium text-slate-200 truncate">Apelação TJSP &middot; 15 dias</div>
            <div className="text-xs text-slate-400 mt-1">Vencimento em 01/04/2026</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
