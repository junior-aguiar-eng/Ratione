import { NextResponse } from 'next/server';

/**
 * Verificação de disponibilidade (uptime check do Cloud Monitoring). Pública e sem acesso a banco:
 * responde se o servidor está de pé. Não expõe versão, variável de ambiente nem dado de usuário.
 */
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}
