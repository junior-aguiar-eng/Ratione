'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const ferramentas = [
    { href: '/argumenta', label: 'Argumenta' },
    { href: '/normaviva', label: 'NormaViva' },
    { href: '/tesemap', label: 'TeseMap' },
    { href: '/prazozero', label: 'PrazoZero' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0B0F14]/90 backdrop-blur-sm border-b border-[#232B35]">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Marca: Símbolo Abstrato de Estrutura Lógica + Nome */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded bg-[#161C24] border border-[#232B35] flex items-center justify-center text-[#4A918B] group-hover:border-[#2B6F6A] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              {/* Símbolo Abstrato: Grafo / Ramificação Estrutural de Decisão */}
              <circle cx="6" cy="6" r="2.5" />
              <circle cx="18" cy="6" r="2.5" />
              <circle cx="18" cy="18" r="2.5" />
              <circle cx="6" cy="18" r="2.5" />
              <path d="M6 8.5v7" />
              <path d="M8.5 6h7" />
              <path d="M8.5 18h7" />
              <path d="M8.5 8.5l7 7" />
            </svg>
          </div>
          <span className="font-serif text-lg tracking-wider font-semibold text-[#F2F4F7]">
            RATIONE
          </span>
        </Link>

        {/* Navegação Central Textual (sem botões dourados, com indicador sutil em petróleo) */}
        <nav className="hidden sm:flex items-center gap-6">
          {ferramentas.map(item => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors relative py-1 ${
                  isActive
                    ? 'text-[#F2F4F7]'
                    : 'text-[#A8B0BB] hover:text-[#F2F4F7]'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2B6F6A] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Direita: Meu espaço */}
        <div className="flex items-center gap-4">
          <Link
            href="/meu-espaco"
            className={`text-sm font-medium transition-colors px-3 py-1.5 rounded border ${
              pathname === '/meu-espaco'
                ? 'bg-[#161C24] text-[#F2F4F7] border-[#2B6F6A]'
                : 'text-[#A8B0BB] hover:text-[#F2F4F7] border-[#232B35] hover:bg-[#11161D]'
            }`}
          >
            Meu espaço
          </Link>
        </div>
      </div>
    </header>
  );
}
