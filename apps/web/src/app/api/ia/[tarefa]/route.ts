import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { executarTarefa } from '../../../../lib/ia/executar';
import { dependenciasDoBanco } from '../../../../lib/ia/banco';
import { criarChamadaAoModelo } from '../../../../lib/ia/cliente';
import { lerDispositivoParaExplicar } from '../../../../lib/ia/fontes/dispositivoDoBanco';
import { lerNoParaRelacionar } from '../../../../lib/ia/fontes/noDoTeseMap';
import { iaLigada } from '../../../../lib/ia/politica';
import { gravidadeDoAviso } from '../../../../lib/ia/gravidade';
import { veioDoSite } from '../../../../lib/origem';
import { registrar } from '../../../../lib/log';
import { LIMITE_CORPO, lerJsonLimitado } from '../../../../lib/corpoJson';

/**
 * Rota única dos recursos de IA: `POST /api/ia/<tarefa>` com `{ entrada }`. Só executa tarefas do catálogo (`lib/ia/catalogo.ts`),
 * pelo executor único (`lib/ia/executar.ts`). Precisa de `IA_EXPLICACAO_LIGADA=sim`, `ANTHROPIC_API_KEY` e `SUPABASE_SERVICE_ROLE_KEY`
 * no servidor; sem eles, responde 503 e não chama nada. A cota é do plano do usuário, por análise (`POST /api/analises`).
 * Regras: `docs/produto/IA_TAREFAS.md`.
 */
const CHAVES_PROPRIAS: Record<string, string> = {
  'relacionar-com-o-caso': 'IA_RELACAO_LIGADA',
  'ler-intimacao': 'IA_INTIMACAO_LIGADA',
  'explicar-precedente': 'IA_PRECEDENTE_LIGADA'
};

export async function POST(request: Request, { params }: { params: Promise<{ tarefa: string }> }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicavel = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const secreta = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const chaveApi = process.env.ANTHROPIC_API_KEY;
  if (!url || !publicavel || !secreta || !chaveApi || !iaLigada(process.env)) {
    return NextResponse.json({ mensagem: 'Os recursos de IA não estão disponíveis nesta instalação.' }, { status: 503 });
  }

  // Só a partir do próprio site
  if (!veioDoSite(request)) return NextResponse.json({ mensagem: 'Origem não permitida.' }, { status: 403 });

  const { tarefa } = await params;
  // Tarefas com chave própria: só ligam depois de medidas (docs/produto/IA_TAREFAS.md)
  const chaveDaTarefa = CHAVES_PROPRIAS[tarefa];
  if (chaveDaTarefa && process.env[chaveDaTarefa] !== 'sim') {
    return NextResponse.json({ mensagem: 'Este recurso de IA não está disponível nesta instalação.' }, { status: 503 });
  }
  let corpo: { entrada?: unknown } = {};
  try {
    const lido = await lerJsonLimitado(request, LIMITE_CORPO.analiseDeIA);
    if (!lido.ok) return NextResponse.json({ mensagem: lido.mensagem }, { status: lido.status });
    corpo = (lido.valor ?? {}) as { entrada?: unknown };
  } catch {
    /* sem corpo: a validação da entrada recusa */
  }

  const armazem = await cookies();
  const sessao = createServerClient(url, publicavel, {
    cookies: { getAll: () => armazem.getAll(), setAll: lista => lista.forEach(({ name, value, options }) => armazem.set(name, value, options)) }
  });
  const semSessao = { auth: { persistSession: false, autoRefreshToken: false } };
  const publico = createClient(url, publicavel, semSessao);
  const servidor = createClient(url, secreta, semSessao);

  try {
    const r = await executarTarefa(tarefa, corpo.entrada, {
      ligada: true,
      fontes: { lerDispositivo: id => lerDispositivoParaExplicar(publico, id), lerNoTeseMap: id => lerNoParaRelacionar(publico, id) },
      usuarioAtual: async () => {
        const { data } = await sessao.auth.getUser();
        return data.user ? { id: data.user.id } : null;
      },
      ...dependenciasDoBanco(servidor),
      chamarModelo: criarChamadaAoModelo(chaveApi),
      // Saldo esgotado ou chave inválida: ERROR, para o alerta por e-mail avisar o responsável (lib/ia/gravidade.ts)
      avisar: (mensagem, campos) => registrar(gravidadeDoAviso(mensagem, campos), mensagem, campos)
    });
    return NextResponse.json(r.corpo, { status: r.status });
  } catch (e) {
    registrar('ERROR', 'IA: erro inesperado', { tarefa, erro_mensagem: (e as Error).message });
    return NextResponse.json({ mensagem: 'O recurso de IA falhou agora. Tente de novo em alguns minutos.' }, { status: 500 });
  }
}
