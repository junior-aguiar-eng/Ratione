import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TeseMap | Ratione',
  description:
    'Mapa de relações entre precedentes, súmulas e temas, cada uma com fonte oficial e trecho literal.'
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
