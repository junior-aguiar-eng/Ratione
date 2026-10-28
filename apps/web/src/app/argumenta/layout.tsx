import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Argumenta | Ratione',
  description:
    'Veja como uma decisão foi construída: teses, premissas, conclusões e pontos de atenção, com acesso aos trechos originais.'
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
