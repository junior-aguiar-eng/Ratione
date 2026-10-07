import type { Metadata } from 'next';
import { Inter, Source_Serif_4, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const sourceSerif = Source_Serif_4({ subsets: ['latin'], variable: '--font-source-serif', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'Ratione | Direito, estruturado.',
  description:
    'Ferramentas especializadas para analisar decisões, compreender normas, explorar jurisprudência e calcular prazos.'
};

// Define o tema antes da primeira pintura para evitar flash.
const SCRIPT_TEMA = `try{var t=localStorage.getItem('ratione_tema');document.documentElement.dataset.theme=t==='dark'?'dark':'light';}catch(e){document.documentElement.dataset.theme='light';}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      data-theme="light"
      suppressHydrationWarning
      className={`${inter.variable} ${sourceSerif.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body className="font-sans flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 max-w-[1320px] w-full mx-auto px-5 sm:px-8 py-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
