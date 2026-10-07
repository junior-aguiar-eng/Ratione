export type StatusModulo = 'Disponível' | 'Prévia' | 'Demonstração';

export interface Modulo {
  href: string;
  nome: string;
  status: StatusModulo;
}

export const MODULOS: Modulo[] = [
  { href: '/argumenta', nome: 'Argumenta', status: 'Demonstração' },
  { href: '/normaviva', nome: 'NormaViva', status: 'Prévia' },
  { href: '/tesemap', nome: 'TeseMap', status: 'Prévia' },
  { href: '/prazozero', nome: 'PrazoZero', status: 'Disponível' }
];
