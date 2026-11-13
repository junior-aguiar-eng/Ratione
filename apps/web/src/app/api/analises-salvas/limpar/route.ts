import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { dependenciasPadrao, limparVencidas } from '../../../../lib/analisesSalvas/servico';
import { armazenamentoEBanco } from '../../../../lib/analisesSalvas/supabase';
import { limparSegredo } from '../../../../lib/lembretes';
import { registrar } from '../../../../lib/log';

/**
 * F5-10: faxina das análises salvas vencidas. Quem chama é o agendador (Cloud Scheduler, a cada hora), com
 * `Authorization: Bearer <DOCUMENTOS_LIMPEZA_SEGREDO>` (o mesmo segredo da faxina de documentos; mín. 32 caracteres). Sem o segredo a rota
 * recusa: nunca fica aberta. Cada arquivo vencido é apagado do armazenamento e, depois, a linha do banco. Análise sem vencimento não é tocada.
 */
export const dynamic = 'force-dynamic';

function segredoConfere(recebido: string | null, esperado: string): boolean {
  if (!recebido) return false;
  const a = Buffer.from(recebido);
  const b = Buffer.from(esperado);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const segredo = limparSegredo(process.env.DOCUMENTOS_LIMPEZA_SEGREDO);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secreta = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // A faxina não depende da flag de salvar: o que já foi guardado precisa vencer e sumir mesmo com o salvamento desligado
  if (!segredo || segredo.length < 32 || !url || !secreta) {
    return NextResponse.json({ mensagem: 'A limpeza de análises salvas ainda não está habilitada nesta instalação.' }, { status: 503 });
  }
  const cabecalho = request.headers.get('authorization') ?? '';
  if (!segredoConfere(cabecalho.startsWith('Bearer ') ? limparSegredo(cabecalho.slice(7)) ?? null : null, segredo)) {
    return NextResponse.json({ mensagem: 'Não autorizado.' }, { status: 401 });
  }
  try {
    const servidor = createClient(url, secreta, { auth: { persistSession: false, autoRefreshToken: false } });
    const apagadas = await limparVencidas({ ...dependenciasPadrao(), ...armazenamentoEBanco(servidor) }, 200, 20);
    return NextResponse.json({ apagadas });
  } catch (e) {
    registrar('ERROR', 'Análises salvas: erro na limpeza', { erro_mensagem: (e as Error).message });
    return NextResponse.json({ mensagem: 'Não foi possível concluir a limpeza.' }, { status: 500 });
  }
}
