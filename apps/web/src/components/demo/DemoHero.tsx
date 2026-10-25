'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DemoArgumenta from './DemoArgumenta';
import DemoNormaViva from './DemoNormaViva';
import DemoPrazoZero from './DemoPrazoZero';
import DemoTeseMap from './DemoTeseMap';

const ABAS = [
  { id: 'prazozero', nome: 'PrazoZero' },
  { id: 'normaviva', nome: 'NormaViva' },
  { id: 'tesemap', nome: 'TeseMap' },
  { id: 'argumenta', nome: 'Argumenta' }
] as const;

const SEGUNDOS_POR_ABA = 11;

function usarMenosMovimento(): boolean {
  const [reduzido, setReduzido] = useState(false);
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduzido(m.matches);
    const aoMudar = () => setReduzido(m.matches);
    m.addEventListener('change', aoMudar);
    return () => m.removeEventListener('change', aoMudar);
  }, []);
  return reduzido;
}

/**
 * Janela do produto no topo da página inicial: uma demonstração interativa de cada ferramenta. Troca de aba sozinha até o visitante mexer
 * em algo (clicar, digitar, passar o teclado) ou quando o ponteiro está sobre ela; quem prefere menos movimento não tem rotação automática.
 */
export default function DemoHero() {
  const [aba, setAba] = useState<string>('prazozero');
  const [interagiu, setInteragiu] = useState(false);
  const [sobre, setSobre] = useState(false);
  const semMovimento = usarMenosMovimento();

  useEffect(() => {
    if (interagiu || sobre || semMovimento) return;
    const t = setInterval(() => setAba(atual => ABAS[(ABAS.findIndex(a => a.id === atual) + 1) % ABAS.length].id), SEGUNDOS_POR_ABA * 1000);
    return () => clearInterval(t);
  }, [interagiu, sobre, semMovimento]);

  return (
    <div
      className="rounded-2xl border border-line bg-surface/85 backdrop-blur-sm shadow-card overflow-hidden"
      onMouseEnter={() => setSobre(true)}
      onMouseLeave={() => setSobre(false)}
      onPointerDown={() => setInteragiu(true)}
      onKeyDown={() => setInteragiu(true)}
    >
      <Tabs value={aba} onValueChange={setAba}>
        <div className="flex items-center gap-3 border-b border-line px-4 pt-3 bg-surface-2/60">
          <div className="hidden xl:flex gap-1.5 pb-3" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          </div>
          <TabsList className="border-b-0 flex-1 gap-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Demonstração de cada ferramenta">
            {ABAS.map(a => (
              <TabsTrigger key={a.id} value={a.id} className="px-2.5 sm:px-4">
                {a.nome}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="p-5 sm:p-6 min-h-[26rem]">
          <TabsContent value="prazozero">
            <DemoPrazoZero />
          </TabsContent>
          <TabsContent value="normaviva">
            <DemoNormaViva />
          </TabsContent>
          <TabsContent value="tesemap">
            <DemoTeseMap />
          </TabsContent>
          <TabsContent value="argumenta">
            <DemoArgumenta semMovimento={semMovimento} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
