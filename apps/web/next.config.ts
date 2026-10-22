import type { NextConfig } from 'next';
import path from 'path';
import { cabecalhosDeSeguranca } from './src/lib/cabecalhosSeguranca';

const nextConfig: NextConfig = {
  // Não anunciar a tecnologia do servidor (`x-powered-by: Next.js`)
  poweredByHeader: false,
  // Cabeçalhos de segurança em todas as respostas (ver src/lib/cabecalhosSeguranca.ts)
  async headers() {
    return [{ source: '/:path*', headers: cabecalhosDeSeguranca(process.env.NODE_ENV !== 'production') }];
  },
  // O Next 16.4 gera um AGENTS.md na pasta do app a cada `next dev`; as instruções do projeto ficam no PLANO.
  agentRules: false,
  // Servidor autocontido em `.next/standalone` para a imagem do Cloud Run (ver Dockerfile)
  output: 'standalone',
  outputFileTracingRoot: path.resolve(__dirname, '../../'),
  transpilePackages: [
    '@ratione/core',
    '@ratione/prazozero',
    '@ratione/argumenta',
    '@ratione/normaviva',
    '@ratione/tesemap'
  ]
};

export default nextConfig;
