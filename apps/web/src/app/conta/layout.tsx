import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Minha conta | Ratione' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
