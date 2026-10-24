import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { iniciarAnaliseNoBanco } from '../../../lib/ia/banco';
import { mensagemDeCota } from '../../../lib/ia/executar';
import { iaLigada } from '../../../lib/ia/politica';
import { origemPublica } from '../../../lib/origem';
import { paragrafosDaAnalise, rotuloDaAnalise } from '../../../lib/uso';
import { registrar } from '../../../lib/log';

/**
 * Inicia uma análise: `POST /api/analises` com `{ tipo: 'rapida', rotulo?, paragrafos? }`. Só metadados; nenhum texto da decisão.
 * É aqui que a cota do plano do usuário é conferida, UMA vez
 * (docs/produto/PLANOS_E_COBRANCA.md §5). Devolve o `analiseId` que as etapas do Argumenta (`/api/ia/argumenta-*`) carregam, quanto
 * resta da cota e quando ela renova. Só o servidor chama o banco; o navegador nunca escreve em `analises`.
 * Só o tipo `rapida` pode ser iniciado daqui: a explicação de dispositivo inicia a própria análise no executor, e a `completa` ainda não existe.
 */
const TIPOS_DA_TELA = ['rapida'] as const;
type PedidoAnalise = { tipo?: unknown; rotulo?: unknown; paragrafos?: unknown };

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicavel = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const secreta = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !publicavel || !secreta || !iaLigada(process.env)) {
    return NextResponse.json({ mensagem: 'Os recursos de IA não estão disponíveis nesta instalação.' }, { status: 503 });
  }

  const origem = request.headers.get('origin');
  if (origem && origem !== origemPublica(request)) return NextResponse.json({ mensagem: 'Origem não permitida.' }, { status: 403 });

  let corpo: PedidoAnalise | null = null;
  try {
    corpo = (await request.json()) as PedidoAnalise | null;
  } catch {
    corpo = null;
  }
  const tipo = corpo?.tipo;
  if (typeof tipo !== 'string' || !(TIPOS_DA_TELA as readonly string[]).includes(tipo)) {
    return NextResponse.json({ mensagem: 'Pedido inválido.' }, { status: 400 });
  }
  // Nome opcional que o cliente dá à análise: texto livre, então sem dado pessoal e com tamanho limitado
  const rotulo = rotuloDaAnalise(corpo?.rotulo);
  if (!rotulo.ok) return NextResponse.json({ mensagem: rotulo.mensagem }, { status: 400 });
  const tamanho = paragrafosDaAnalise(corpo?.paragrafos);
  if (!tamanho.ok) return NextResponse.json({ mensagem: tamanho.mensagem }, { status: 400 });

  const armazem = await cookies();
  const sessao = createServerClient(url, publicavel, {
    cookies: { getAll: () => armazem.getAll(), setAll: lista => lista.forEach(({ name, value, options }) => armazem.set(name, value, options)) }
  });
  const { data } = await sessao.auth.getUser();
  if (!data.user) return NextResponse.json({ mensagem: 'Entre na sua conta para analisar uma decisão.' }, { status: 401 });

  try {
    const servidor = createClient(url, secreta, { auth: { persistSession: false, autoRefreshToken: false } });
    const r = await iniciarAnaliseNoBanco(servidor, data.user.id, tipo, rotulo.rotulo, tamanho.paragrafos);
    if (!r.ok) {
      return NextResponse.json({ mensagem: mensagemDeCota(r.motivo, r.renovaEm), motivo: r.motivo, renovaEm: r.renovaEm, plano: r.plano }, { status: 429 });
    }
    return NextResponse.json({ analiseId: r.analiseId, restantes: r.restantes, renovaEm: r.renovaEm, plano: r.plano });
  } catch (e) {
    registrar('ERROR', 'Análise: erro ao iniciar', { erro_mensagem: (e as Error).message });
    return NextResponse.json({ mensagem: 'Não foi possível iniciar a análise agora. Tente de novo em alguns minutos.' }, { status: 500 });
  }
}
