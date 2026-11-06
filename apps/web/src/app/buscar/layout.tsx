import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Buscar | Ratione',
  description: 'Uma pesquisa nas três bases do Ratione: legislação, precedentes e prazos.'
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
