'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Scale, BookOpen, GitFork, Clock, User, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Início', icon: null },
    { href: '/argumenta', label: 'Argumenta', icon: Scale },
    { href: '/normaviva', label: 'NormaViva', icon: BookOpen },
    { href: '/tesemap', label: 'TeseMap', icon: GitFork },
    { href: '/prazozero', label: 'PrazoZero', icon: Clock },
    { href: '/meu-espaco', label: 'Meu espaço', icon: User }
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-700/30 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:border-amber-400 transition-colors">
            <Scale className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl tracking-wider font-bold gold-gradient-text leading-none">
              RATIONE
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-sans mt-0.5">
              Inteligência & Rigor Jurídico
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map(item => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-950'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Compliance Badge */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Determinístico &middot; CPC/15</span>
        </div>
      </div>
    </header>
  );
}
