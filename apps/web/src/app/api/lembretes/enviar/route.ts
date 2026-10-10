import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { executarEnvio, hojeNoBrasil, type DependenciasEnvio, type Lembrete, type Momento } from '../../../../lib/lembretes';
import { registrar } from '../../../../lib/log';

/**
 * Envio diário dos lembretes de prazo (F2-10). Quem chama é o agendador (Cloud Scheduler, uma vez por dia de manhã),
 * com `Authorization: Bearer <LEMBRETES_SEGREDO>`. Sem o segredo configurado, a rota recusa: ela nunca fica aberta.
 *
 * Variáveis: LEMBRETES_SEGREDO (mín. 32 caracteres), SUPABASE_SERVICE_ROLE_KEY (lê as contas e marca o envio),
 * RESEND_API_KEY (provedor de e-mail; sem ela a rota só simula e não envia nem marca nada) e LEMBRETES_REMETENTE.
 * O endereço de e-mail do usuário é lido de `auth.users` só na hora do envio e nunca vai para log nem para a resposta.
 */
export const dynamic = 'force-dynamic';

const REMETENTE_PADRAO = 'Ratione <nao-responda@nexojuris.ia.br>';

function segredoConfere(recebido: string | null, esperado: string): boolean {
  if (!recebido) return false;
  const a = Buffer.from(recebido);
  const b = Buffer.from(esperado);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const segredo = process.env.LEMBRETES_SEGREDO;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secreta = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!segredo || segredo.length < 32 || !url || !secreta) {
    return NextResponse.json({ mensagem: 'O envio de lembretes ainda não está habilitado nesta instalação.' }, { status: 503 });
  }
  const cabecalho = request.headers.get('authorization') ?? '';
  if (!segredoConfere(cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : null, segredo)) {
    return NextResponse.json({ mensagem: 'Não autorizado.' }, { status: 401 });
  }

  const sb = createClient(url, secreta, { auth: { persistSession: false, autoRefreshToken: false } });
  const chaveEmail = process.env.RESEND_API_KEY;
  const remetente = process.env.LEMBRETES_REMETENTE || REMETENTE_PADRAO;
  const coluna = (m: Momento) => (m === 'tres_dias' ? 'enviado_3_dias_em' : 'enviado_1_dia_em');

  const dep: DependenciasEnvio = {
    hoje: () => hojeNoBrasil(),
    simulacao: !chaveEmail,
    listarProximos: async (de, ate) => {
      const { data, error } = await sb.from('lembretes_prazo').select('*').gte('vencimento', de).lte('vencimento', ate);
      if (error) throw new Error('falha ao listar lembretes');
      return (data ?? []) as Lembrete[];
    },
    emailDe: async usuarioId => {
      const { data, error } = await sb.auth.admin.getUserById(usuarioId);
      return error ? null : (data.user?.email ?? null);
    },
    reservar: async (id, momento) => {
      // Só reserva se a marca ainda estiver vazia: duas execuções ao mesmo tempo não mandam o mesmo aviso duas vezes
      const { data, error } = await sb.from('lembretes_prazo').update({ [coluna(momento)]: new Date().toISOString() }).eq('id', id).is(coluna(momento), null).select('id');
      return !error && (data?.length ?? 0) === 1;
    },
    liberar: async (id, momento) => {
      await sb.from('lembretes_prazo').update({ [coluna(momento)]: null }).eq('id', id);
    },
    enviar: async (para, email) => {
      const resposta = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${chaveEmail}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: remetente, to: [para], subject: email.assunto, text: email.texto, html: email.html })
      });
      // Só o status vai para o log: a resposta do provedor pode repetir o endereço do destinatário
      if (!resposta.ok) registrar('WARNING', 'Lembrete: o provedor de e-mail recusou o envio', { status: resposta.status });
      return resposta.ok;
    }
  };

  try {
    const resumo = await executarEnvio(dep);
    registrar('INFO', 'Lembretes: envio diário concluído', { ...resumo, simulacao: dep.simulacao });
    return NextResponse.json({ ...resumo, simulacao: dep.simulacao });
  } catch (erro) {
    registrar('ERROR', 'Lembretes: o envio diário falhou', { erro_mensagem: erro instanceof Error ? erro.message : 'erro desconhecido' });
    return NextResponse.json({ mensagem: 'Não foi possível concluir o envio agora.' }, { status: 500 });
  }
}
