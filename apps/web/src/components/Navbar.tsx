'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import UsuarioMenu from './UsuarioMenu';
import { MODULOS } from '../lib/modulos';
import { useSessao } from '../lib/useSessao';
import { useNomeDoUsuario } from '../lib/useNomeDoUsuario';
import { sairDaConta } from '../lib/sairDaConta';

export default function Navbar() {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);
  const meuEspacoAtivo = pathname.startsWith('/meu-espaco');
  const { usuario, contaDisponivel } = useSessao();
  const nome = useNomeDoUsuario(usuario);
  const contaAtiva = pathname.startsWith('/conta') || pathname.startsWith('/entrar');

  return (
    <header className="sticky top-0 z-50 bg-canvas/70 backdrop-blur-md border-b border-line">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-8 h-[72px] flex items-center justify-between">
        <Link href="/" aria-label="Ratione, página inicial" onClick={() => setAberto(false)}>
          <Logo grande />
        </Link>

        <nav className="hidden md:flex items-center gap-9" aria-label="Ferramentas">
          {MODULOS.map(item => {
            const ativo = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={ativo ? 'page' : undefined}
                className={`relative py-6 text-base font-medium transition-colors ${
                  ativo ? 'text-ink' : 'text-ink-soft hover:text-ink'
                }`}
              >
                {item.nome}
                {ativo && <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-brand" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Link
            href="/meu-espaco"
            aria-current={meuEspacoAtivo ? 'page' : undefined}
            className={`hidden md:inline-flex text-[15px] font-medium px-3 py-2 rounded-md transition-colors ${
              meuEspacoAtivo ? 'text-ink bg-surface-2' : 'text-ink-soft hover:text-ink hover:bg-surface-2'
            }`}
          >
            Meu espaço
          </Link>
          {contaDisponivel &&
            (usuario && nome ? (
              <UsuarioMenu nome={nome} ativo={pathname.startsWith('/conta')} />
            ) : (
              <Link
                href="/entrar"
                aria-current={contaAtiva ? 'page' : undefined}
                className={`hidden md:inline-flex text-[15px] font-medium px-3 py-2 rounded-md transition-colors ${
                  contaAtiva ? 'text-ink bg-surface-2' : 'text-ink-soft hover:text-ink hover:bg-surface-2'
                }`}
              >
                Entrar
              </Link>
            ))}
          <button
            type="button"
            className="md:hidden p-2 text-ink"
            aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={aberto}
            onClick={() => setAberto(v => !v)}
          >
            {aberto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {aberto && (
        <nav className="md:hidden border-t border-line bg-canvas px-5 py-2" aria-label="Menu">
          {usuario && nome && <p className="pt-3 pb-1 text-sm text-ink-mute">Conectado como <span className="font-medium text-ink">{nome}</span></p>}
          {[
            ...MODULOS.map(m => ({ href: m.href, nome: m.nome })),
            { href: '/meu-espaco', nome: 'Meu espaço' },
            ...(contaDisponivel ? [{ href: usuario ? '/conta' : '/entrar', nome: usuario ? 'Minha conta' : 'Entrar' }] : [])
          ].map(
            item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setAberto(false)}
                className={`block py-3.5 text-base border-b border-line last:border-0 ${
                  pathname.startsWith(item.href) ? 'text-brand-text font-semibold' : 'text-ink-soft'
                }`}
              >
                {item.nome}
              </Link>
            )
          )}
          {usuario && (
            <button
              type="button"
              onClick={() => void sairDaConta()}
              className="flex w-full items-center gap-2 py-3.5 text-base text-ink-soft"
            >
              <LogOut className="w-4 h-4" aria-hidden />
              Sair
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
