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

const MODULOS: readonly string[] = ['Argumenta', 'NormaViva', 'TeseMap', 'PrazoZero'];
const TIPOS: readonly string[] = ['decisao', 'norma', 'tese', 'prazo'];

/** Registro lido do navegador com a forma que o banco aceita (o armazenamento local pode ter dado antigo ou editado à mão). */
export function registroValido(r: unknown): r is RegistroHistorico {
  if (typeof r !== 'object' || r === null) return false;
  const x = r as Record<string, unknown>;
  return (
    typeof x.id === 'string' &&
    typeof x.titulo === 'string' &&
    typeof x.url === 'string' &&
    typeof x.modulo === 'string' &&
    MODULOS.includes(x.modulo) &&
    typeof x.tipo === 'string' &&
    TIPOS.includes(x.tipo) &&
    typeof x.criadoEm === 'string' &&
    !Number.isNaN(Date.parse(x.criadoEm))
  );
}

/** O banco aceita URL interna de até 500 caracteres. Acima disso, vale só o caminho, sem os parâmetros (cortar a query daria um link quebrado). */
function urlParaBanco(url: string): string {
  if (!url.startsWith('/') || url.startsWith('//')) return '/';
  return url.length <= 500 ? url : url.split('?')[0].slice(0, 500);
}

/** Respeita os limites do banco: título até 300, detalhe até 1000, URL interna (começa com "/"). */
export function registroParaLinha(r: NovoRegistro, usuarioId: string, criadoEm?: string) {
  const url = urlParaBanco(r.url);
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

export type DestinoSalvo = 'conta' | 'navegador' | 'limite';

/** Mensagem do gatilho do banco (supabase/migrations/…_limite_itens_salvos.sql). */
export const ehErroDeLimite = (mensagem: string | undefined) => /limite de \d+ itens salvos/.test(mensagem ?? '');

/** O que salvar e importar usam do cliente do Supabase (separado para testar sem rede). */
export interface ClienteItens {
  auth: { getSession(): Promise<{ data: { session: { user: { id: string } } | null } }> };
  from(tabela: 'itens_salvos'): { insert(linhas: object | object[]): PromiseLike<{ error: { message: string } | null }> };
}

/**
 * Salva o registro. Com login, vai para a conta (Supabase, região de São Paulo); sem login, ou se a conta falhar,
 * fica neste navegador. Conta cheia (teto de itens) não cai para o navegador: devolve 'limite'.
 */
export function salvarRegistro(r: NovoRegistro): Promise<DestinoSalvo> {
  return salvarRegistroCom(obterSupabase() as ClienteItens | null, r, salvarNoNavegador);
}

export async function salvarRegistroCom(sb: ClienteItens | null, r: NovoRegistro, guardarNoNavegador: (r: NovoRegistro) => void): Promise<DestinoSalvo> {
  if (sb) {
    try {
      const { data } = await sb.auth.getSession();
      if (data.session) {
        const { error } = await sb.from('itens_salvos').insert(registroParaLinha(r, data.session.user.id));
        if (!error) return 'conta';
        // Conta cheia: guardar no navegador esconderia o problema (o item não apareceria em outros dispositivos)
        if (ehErroDeLimite(error.message)) return 'limite';
      }
    } catch {
      // cai para o navegador
    }
  }
  guardarNoNavegador(r);
  return 'navegador';
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

export interface ResultadoImportacao {
  enviados: number;
  /** Registros que continuam neste navegador (inválidos, ou a conta atingiu o limite). */
  mantidos: number;
}

/**
 * Envia para a conta os itens salvos só neste navegador (a pedido do usuário). Em lote; se o lote falhar, tenta um por um, de modo que
 * um registro ruim (ou o limite da conta) não impeça os demais. Só sai do navegador o que foi enviado.
 */
export function importarNavegadorParaConta(): Promise<ResultadoImportacao> {
  return importarComCliente(obterSupabase() as ClienteItens | null, lerHistorico(), restantes => {
    try {
      if (restantes.length === 0) localStorage.removeItem(CHAVE);
      else localStorage.setItem(CHAVE, JSON.stringify(restantes));
    } catch {
      // armazenamento indisponível: ignorar
    }
  });
}

export async function importarComCliente(
  sb: ClienteItens | null,
  locais: RegistroHistorico[],
  gravarRestantes: (restantes: RegistroHistorico[]) => void
): Promise<ResultadoImportacao> {
  if (!sb) return { enviados: 0, mantidos: locais.length };
  const { data: sessao } = await sb.auth.getSession();
  const usuarioId = sessao.session?.user.id;
  if (!usuarioId || locais.length === 0) return { enviados: 0, mantidos: locais.length };

  const validos = locais.filter(registroValido);
  const linhas = validos.map(l => registroParaLinha(l, usuarioId, l.criadoEm));
  const enviadosIds = new Set<string>();

  const { error } = await sb.from('itens_salvos').insert(linhas);
  if (!error) validos.forEach(v => enviadosIds.add(v.id));
  else {
    for (let i = 0; i < linhas.length; i++) {
      const { error: erroLinha } = await sb.from('itens_salvos').insert(linhas[i]);
      if (!erroLinha) enviadosIds.add(validos[i].id);
      else if (ehErroDeLimite(erroLinha.message)) break;
    }
  }

  const restantes = locais.filter(l => !enviadosIds.has(l.id));
  gravarRestantes(restantes);
  return { enviados: enviadosIds.size, mantidos: restantes.length };
}
