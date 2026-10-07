import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'Ratione — Plataforma de Inteligência & Rigor Jurídico',
  description: 'Quatro motores especializados: Argumenta, NormaViva, TeseMap e PrazoZero. Sem assistentes genéricos. Rigor processual e técnico.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-[#080C14] text-slate-100 flex flex-col min-h-screen selection:bg-amber-500/30 selection:text-amber-200">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
