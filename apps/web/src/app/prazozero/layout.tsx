import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PrazoZero | Ratione',
  description:
    'Calcule prazos processuais com a memória de cálculo dia a dia e o fundamento legal de cada exclusão.'
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
