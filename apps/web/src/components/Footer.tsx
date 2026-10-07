import { Scale } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-[#060910] text-slate-400 py-10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Scale className="w-5 h-5 text-amber-500/80" />
          <span className="font-serif text-slate-200 font-semibold tracking-wider">RATIONE</span>
          <span className="text-xs text-slate-400">| Plataforma de Inteligência e Rigor Jurídico</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span>CPC/15, Arts. 219, 220 e 224</span>
          <span>&middot;</span>
          <span>Art. 489, § 1º (Taxonomia de Nulidades)</span>
          <span>&middot;</span>
          <span>LC 95/1998 (Point-in-Time)</span>
          <span>&middot;</span>
          <span>Resolução CNJ nº 455/2022</span>
        </div>

        <div className="text-xs text-slate-400">
          &copy; {new Date().getFullYear()} Ratione. Sem mocks. Arquitetura forense.
        </div>
      </div>
    </footer>
  );
}
