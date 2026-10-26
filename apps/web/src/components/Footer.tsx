import Link from 'next/link';
import Logo from './Logo';
import { MODULOS } from '../lib/modulos';

const LINKS = [
  { href: '/metodologia#fontes', rotulo: 'Fontes jurídicas' },
  { href: '/metodologia', rotulo: 'Metodologia' },
  { href: '/privacidade', rotulo: 'Privacidade' },
  { href: '/termos', rotulo: 'Termos' }
];

const LINK = 'text-base text-ink-soft hover:text-ink transition-colors';

export default function Footer() {
  return (
    <footer className="border-t border-line mt-24 bg-surface/40">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-8 pt-14 pb-10">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link href="/" aria-label="Ratione, página inicial">
              <Logo grande />
            </Link>
            <p className="mt-4 text-base text-ink-soft leading-relaxed">Ferramentas jurídicas que mostram a fonte de cada resultado: prazo, norma vigente, precedente e argumento.</p>
          </div>

          <nav aria-label="Ferramentas">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-mute">Ferramentas</p>
            <ul className="mt-4 flex flex-col gap-3">
              {MODULOS.map(m => (
                <li key={m.href}>
                  <Link href={m.href} className={LINK}>
                    {m.nome}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Institucional">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-mute">Institucional</p>
            <ul className="mt-4 flex flex-col gap-3">
              {LINKS.map(l => (
                <li key={l.rotulo}>
                  <Link href={l.href} className={LINK}>
                    {l.rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 pt-6 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-ink-mute">
          <span>&copy; {new Date().getFullYear()} Ratione</span>
          <span>Apoio à pesquisa jurídica. Não substitui a análise do advogado.</span>
        </div>
      </div>
    </footer>
  );
}
