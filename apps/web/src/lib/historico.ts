import { obterSupabase } from './supabase/client';

export type ModuloHistorico = 'Argumenta' | 'NormaViva' | 'TeseMap' | 'PrazoZero';
export type TipoHistorico = 'decisao' | 'norma' | 'tese' | 'prazo';

export interface RegistroHistorico {
  id: string;
  modulo: ModuloHistorico;
  tipo: TipoHistorico;
  titulo: string;
  detalhe?: string;
  url: string;
  criadoEm: string; // ISO completo
}

export type NovoRegistro = Omit<RegistroHistorico, 'id' | 'criadoEm'>;

/** Linha da tabela `itens_salvos` (ver supabase/migrations). */
export interface LinhaItemSalvo {
  id: string;
  usuario_id?: string;
  modulo: ModuloHistorico;
  tipo: TipoHistorico;
  titulo: string;
  detalhe: string | null;
  url: string | null;
  criado_em: string;
}

export function linhaParaRegistro(l: LinhaItemSalvo): RegistroHistorico {
  return {
    id: l.id,
    modulo: l.modulo,
    tipo: l.tipo,
    titulo: l.titulo,
    ...(l.detalhe ? { detalhe: l.detalhe } : {}),
    url: l.url ?? '/',
    criadoEm: l.criado_em
  };
}

/** Respeita os limites do banco: título até 300, detalhe até 1000, URL interna (começa com "/"). */
export function registroParaLinha(r: NovoRegistro, usuarioId: string, criadoEm?: string) {
  const url = r.url.startsWith('/') && !r.url.startsWith('//') ? r.url.slice(0, 500) : '/';
  return {
    usuario_id: usuarioId,
    modulo: r.modulo,
    tipo: r.tipo,
    titulo: r.titulo.trim().slice(0, 300) || 'Sem título',
    detalhe: r.detalhe ? r.detalhe.slice(0, 1000) : null,
    url,
    ...(criadoEm ? { criado_em: criadoEm } : {})
  };
}

// ---------- Neste navegador (sem conta) ----------

const CHAVE = 'ratione_historico_recente';
const LIMITE = 100;

export function lerHistorico(): RegistroHistorico[] {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return [];
    const dados = JSON.parse(bruto);
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

function salvarNoNavegador(r: NovoRegistro): void {
  try {
    const registro: RegistroHistorico = {
      ...r,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      criadoEm: new Date().toISOString()
    };
    localStorage.setItem(CHAVE, JSON.stringify([registro, ...lerHistorico()].slice(0, LIMITE)));
  } catch {
    // armazenamento indisponível: ignorar
  }
}

export function removerRegistro(id: string): RegistroHistorico[] {
  const restantes = lerHistorico().filter(r => r.id !== id);
  try {
    localStorage.setItem(CHAVE, JSON.stringify(restantes));
  } catch {
    // ignorar
  }
  return restantes;
}

export function limparNavegador(): void {
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    // ignorar
  }
}

// ---------- Na conta (com login) ----------

/**
 * Salva o registro. Com login, vai para a conta (Supabase, região de São Paulo); sem login, ou se a conta falhar,
 * fica neste navegador. O chamador não precisa esperar.
 */
export function salvarRegistro(r: NovoRegistro): void {
  void (async () => {
    const sb = obterSupabase();
    if (sb) {
      try {
        const { data } = await sb.auth.getSession();
        if (data.session) {
          const { error } = await sb.from('itens_salvos').insert(registroParaLinha(r, data.session.user.id));
          if (!error) return;
        }
      } catch {
        // cai para o navegador
      }
    }
    salvarNoNavegador(r);
  })();
}

export interface HistoricoCarregado {
  itens: RegistroHistorico[];
  origem: 'conta' | 'navegador';
}

/** Com login, o histórico da conta; sem login, o deste navegador. */
export async function carregarHistorico(limite = LIMITE): Promise<HistoricoCarregado> {
  const sb = obterSupabase();
  if (sb) {
    try {
      const { data: sessao } = await sb.auth.getSession();
      if (sessao.session) {
        const { data, error } = await sb
          .from('itens_salvos')
          .select('id, modulo, tipo, titulo, detalhe, url, criado_em')
          .order('criado_em', { ascending: false })
          .limit(limite);
        if (!error && data) return { itens: (data as LinhaItemSalvo[]).map(linhaParaRegistro), origem: 'conta' };
      }
    } catch {
      // cai para o navegador
    }
  }
  return { itens: lerHistorico().slice(0, limite), origem: 'navegador' };
}

export async function removerDaConta(id: string): Promise<boolean> {
  const sb = obterSupabase();
  if (!sb) return false;
  const { error } = await sb.from('itens_salvos').delete().eq('id', id);
  return !error;
}

/** Envia para a conta os itens salvos só neste navegador (a pedido do usuário). Devolve quantos foram enviados. */
export async function importarNavegadorParaConta(): Promise<number> {
  const sb = obterSupabase();
  if (!sb) return 0;
  const { data: sessao } = await sb.auth.getSession();
  if (!sessao.session) return 0;
  const locais = lerHistorico();
  if (locais.length === 0) return 0;
  const linhas = locais.map(l => registroParaLinha(l, sessao.session!.user.id, l.criadoEm));
  const { error } = await sb.from('itens_salvos').insert(linhas);
  if (error) return 0;
  limparNavegador();
  return linhas.length;
}
