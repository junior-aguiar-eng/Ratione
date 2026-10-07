import type { Metadata } from 'next';
import { Inter, Source_Serif_4, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ratione — Direito, estruturado.',
  description: 'Instrumentos especializados para análise de decisões, vigência legislativa, redes de precedentes e prazos processuais.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${sourceSerif.variable} ${jetbrainsMono.variable} dark`}>
      <body className="bg-[#0B0F14] text-[#F2F4F7] font-sans flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 max-w-[1320px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
