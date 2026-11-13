/** Quem consulta é o cabeçalho, o menu e a página, todos ao mesmo tempo: uma só pergunta ao servidor atende os que chegam juntos. */
const JANELA_MS = 1500;
const emVoo = new WeakMap<typeof fetch, Map<string, { quando: number; resposta: Promise<string | null> }>>();

function impressaoToken(token: string | undefined): string {
  if (!token) return '';
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  for (let i = 0; i < token.length; i++) {
    const c = token.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193);
    h2 = Math.imul(h2 ^ c, 0x85ebca6b);
  }
  return `${token.length}:${(h1 >>> 0).toString(36)}:${(h2 >>> 0).toString(36)}`;
}

function chaveConsulta(id: string, accessToken?: string): string {
  const impressao = impressaoToken(accessToken);
  return impressao ? `${id}:${impressao}` : id;
}

function consultarUmaVez(consultar: typeof fetch, id: string, accessToken?: string): Promise<string | null> {
  let porChave = emVoo.get(consultar);
  if (!porChave) emVoo.set(consultar, (porChave = new Map()));
  const chave = chaveConsulta(id, accessToken);
  const existente = porChave.get(chave);
  const agora = Date.now();
  if (existente && agora - existente.quando < JANELA_MS) return existente.resposta;
  for (const [k, v] of porChave) {
    if (agora - v.quando >= JANELA_MS) porChave.delete(k);
  }
  const resposta = (async () => {
    const r = await consultar('/api/conta/sessao', { cache: 'no-store' });
    if (!r.ok) return null;
    const verificado = await r.json();
    return typeof verificado?.usuarioId === 'string' ? verificado.usuarioId : null;
  })();
  const entrada = { quando: agora, resposta };
  porChave.set(chave, entrada);
  // Apenas confirmação positiva da mesma conta fica em cache; falha, null ou divergência sai imediatamente.
  void resposta.then(
    verificadoId => {
      if (verificadoId !== id && porChave.get(chave) === entrada) porChave.delete(chave);
    },
    () => {
      if (porChave.get(chave) === entrada) porChave.delete(chave);
    }
  );
  return resposta;
}

export function limparCacheSessaoValidada(
  consultar: typeof fetch | undefined = typeof fetch !== 'undefined' ? fetch : undefined
): void {
  if (consultar) emVoo.delete(consultar);
}

/** O cache local só fornece dados de apresentação depois que o servidor valida a mesma conta. */
export async function lerSessaoValidada<T extends { id: string }>(
  lerLocal: () => Promise<{ data: { session: { user: T; access_token?: string } | null } }>,
  consultar: typeof fetch = fetch
): Promise<T | null> {
  try {
    const { data } = await lerLocal();
    const sessao = data.session;
    const usuario = sessao?.user;
    if (!usuario) return null;
    return (await consultarUmaVez(consultar, usuario.id, sessao.access_token)) === usuario.id ? usuario : null;
  } catch {
    return null;
  }
}

export function usuarioAutenticadoNaoAnonimo(
  user: { id: string; is_anonymous?: boolean } | null | undefined
): { id: string } | null {
  if (!user || user.is_anonymous) return null;
  return { id: user.id };
}

export async function servirSessaoValidada(
  verificar: () => Promise<{ data: { user: { id: string; is_anonymous?: boolean } | null }; error: unknown }>
): Promise<Response> {
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store', Vary: 'Cookie' };
  try {
    const { data, error } = await verificar();
    const usuarioId = !error ? (usuarioAutenticadoNaoAnonimo(data.user)?.id ?? null) : null;
    return Response.json({ usuarioId }, { headers });
  } catch {
    return Response.json({ usuarioId: null }, { status: 503, headers });
  }
}
