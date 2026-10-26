import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NormaViva | Ratione',
  description:
    'Consulte a redação de um dispositivo legal em qualquer data, com o histórico de alterações e a fonte oficial.'
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
