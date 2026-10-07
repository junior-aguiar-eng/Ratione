import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
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
