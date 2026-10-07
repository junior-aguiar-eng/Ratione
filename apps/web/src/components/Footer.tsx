import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-[#232B35] bg-[#0B0F14] text-[#A8B0BB] py-10 mt-20">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <span className="font-serif text-[#F2F4F7] font-semibold tracking-wider text-sm">RATIONE</span>
          <span className="text-xs text-[#737E8C]">&middot; Direito, estruturado.</span>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#A8B0BB]">
          <Link href="/argumenta" className="hover:text-[#F2F4F7] transition-colors">Produto</Link>
          <Link href="/normaviva" className="hover:text-[#F2F4F7] transition-colors">Fontes jurídicas</Link>
          <Link href="/tesemap" className="hover:text-[#F2F4F7] transition-colors">Metodologia</Link>
          <span className="text-[#737E8C]">&middot;</span>
          <Link href="/meu-espaco" className="hover:text-[#F2F4F7] transition-colors">Privacidade</Link>
          <Link href="/meu-espaco" className="hover:text-[#F2F4F7] transition-colors">Termos</Link>
          <Link href="/meu-espaco" className="hover:text-[#F2F4F7] transition-colors">Contato</Link>
        </nav>

        <div className="text-xs text-[#737E8C]">
          &copy; {new Date().getFullYear()} Ratione
        </div>
      </div>
    </footer>
  );
}
