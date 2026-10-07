import Link from 'next/link';
import Logo from './Logo';

const LINKS = [
  { href: '/#ferramentas', rotulo: 'Produto' },
  { href: '/metodologia#fontes', rotulo: 'Fontes jurídicas' },
  { href: '/metodologia', rotulo: 'Metodologia' },
  { href: '/privacidade', rotulo: 'Privacidade' },
  { href: '/termos', rotulo: 'Termos' }
];

export default function Footer() {
  return (
    <footer className="border-t border-line mt-24">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-8 py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <Link href="/" aria-label="Ratione, página inicial">
          <Logo />
        </Link>

        <nav aria-label="Institucional">
          <ul className="flex flex-wrap gap-x-7 gap-y-2 text-sm text-ink-soft">
            {LINKS.map(l => (
              <li key={l.rotulo}>
                <Link href={l.href} className="hover:text-ink transition-colors">
                  {l.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <span className="text-sm text-ink-mute">&copy; {new Date().getFullYear()} Ratione</span>
      </div>
    </footer>
  );
}
