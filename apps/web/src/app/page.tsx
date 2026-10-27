import Link from 'next/link';
import { ArrowRight, BookOpen, CalendarClock, FileSearch, Network } from 'lucide-react';
import RecentesHome from '../components/RecentesHome';
import DemoHero from '../components/demo/DemoHero';
import { MODULOS } from '../lib/modulos';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

/** As quatro ferramentas, uma frase cada: a demonstração interativa lá em cima já mostra como elas funcionam. */
const FERRAMENTAS = [
  {
    href: '/argumenta',
    nome: 'Argumenta',
    Icone: FileSearch,
    titulo: 'Entenda como uma decisão foi construída.',
    descricao: 'Teses, premissas, conclusões e pontos de atenção da fundamentação, com acesso ao trecho de origem de cada um.',
    cta: 'Analisar decisão'
  },
  {
    href: '/normaviva',
    nome: 'NormaViva',
    Icone: BookOpen,
    titulo: 'Veja a lei como ela realmente vigora.',
    descricao: 'Texto normativo, linha do tempo legislativa e a redação do dispositivo em qualquer data.',
    cta: 'Consultar norma'
  },
  {
    href: '/tesemap',
    nome: 'TeseMap',
    Icone: Network,
    titulo: 'Explore como uma tese se conecta à jurisprudência.',
    descricao: 'Precedentes do STJ e do STF, súmulas e controle concentrado, cada um com a fonte oficial e as relações conferidas.',
    cta: 'Explorar tese'
  },
  {
    href: '/prazozero',
    nome: 'PrazoZero',
    Icone: CalendarClock,
    titulo: 'Calcule um prazo e veja como ele foi contado.',
    descricao: 'Prazo final, base legal e memória de cálculo dia a dia, para conferir cada etapa da contagem.',
    cta: 'Calcular prazo'
  }
] as const;

export default function HomePage() {
  return (
    <div>
      <section className="pt-12 sm:pt-20 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
        <div className="lg:col-span-6 flex flex-col gap-8">
        <div className="flex flex-col gap-6">
          <span className="inline-flex self-start items-center gap-2 rounded-full border border-line bg-surface/70 backdrop-blur-sm px-3.5 py-1.5 text-sm font-medium text-brand-text shadow-card">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
            Plataforma de inteligência e rigor jurídico
          </span>
          <h1 className="font-serif text-5xl sm:text-6xl xl:text-7xl font-semibold tracking-tight text-ink leading-[1.04]">Direito, estruturado.</h1>
          <p className="text-lg sm:text-xl text-ink-soft leading-relaxed max-w-xl">
            Ferramentas especializadas para analisar decisões, compreender normas, explorar jurisprudência e calcular prazos.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/prazozero" className={cn(buttonVariants(), 'h-11 px-5 text-base')}>
              <span>Calcular prazo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="#ferramentas" className={cn(buttonVariants({ variant: 'secondary' }), 'h-11 px-5 text-base')}>
              Ver as ferramentas
            </Link>
          </div>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3" aria-label="O que a plataforma já reúne">
          {[
            ['28', 'normas federais, com a redação ao longo do tempo'],
            ['7.700+', 'precedentes, temas e súmulas do STJ e do STF'],
            ['121', 'cenários de prazo conferidos por revisão jurídica']
          ].map(([numero, rotulo]) => (
            <div key={rotulo} className="rounded-xl border border-line bg-surface/70 backdrop-blur-sm shadow-card px-4 py-3.5">
              <dt className="font-serif text-3xl font-semibold text-ink num">{numero}</dt>
              <dd className="text-sm text-ink-soft leading-snug mt-0.5">{rotulo}</dd>
            </div>
          ))}
        </dl>
        </div>

        <div className="lg:col-span-6">
          <DemoHero />
        </div>
      </section>

      <section id="ferramentas" className="scroll-mt-24 border-t border-line/70 pt-14 pb-6" aria-labelledby="titulo-ferramentas">
        <div className="max-w-2xl">
          <span className="eyebrow">Ferramentas</span>
          <h2 id="titulo-ferramentas" className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-ink leading-[1.15] mt-3">
            O que você quer fazer?
          </h2>
        </div>

        <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FERRAMENTAS.map(f => {
            const status = MODULOS.find(m => m.href === f.href)?.status;
            return (
              <li key={f.href} className="flex">
                <article className="flex w-full flex-col gap-4 rounded-2xl border border-line bg-surface/85 backdrop-blur-sm shadow-card p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-tint text-brand-text">
                      <f.Icone className="h-5 w-5" aria-hidden />
                    </span>
                    {status && status !== 'Disponível' && <Badge>{status}</Badge>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="eyebrow">{f.nome}</p>
                    <h3 className="font-serif text-xl font-semibold text-ink leading-snug">{f.titulo}</h3>
                    <p className="text-sm text-ink-soft leading-relaxed">{f.descricao}</p>
                  </div>
                  <Link href={f.href} className={cn(buttonVariants({ variant: 'secondary' }), 'mt-auto self-start')}>
                    <span>{f.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </article>
              </li>
            );
          })}
        </ul>
      </section>

      <RecentesHome />
    </div>
  );
}
