/** Quem consulta é o cabeçalho, o menu e a página, todos ao mesmo tempo: uma só pergunta ao servidor atende os que chegam juntos. */
const JANELA_MS = 1500;
const emVoo = new WeakMap<typeof fetch, Map<string, { quando: number; resposta: Promise<string | null> }>>();

function consultarUmaVez(consultar: typeof fetch, id: string): Promise<string | null> {
  let porId = emVoo.get(consultar);
  if (!porId) emVoo.set(consultar, (porId = new Map()));
  const existente = porId.get(id);
  if (existente && Date.now() - existente.quando < JANELA_MS) return existente.resposta;
  const resposta = (async () => {
    const r = await consultar('/api/conta/sessao', { cache: 'no-store' });
    if (!r.ok) return null;
    const verificado = await r.json();
    return typeof verificado?.usuarioId === 'string' ? verificado.usuarioId : null;
  })();
  const entrada = { quando: Date.now(), resposta };
  porId.set(id, entrada);
  // Falha não fica guardada: a próxima tentativa pergunta de novo.
  resposta.catch(() => porId.get(id) === entrada && porId.delete(id));
  return resposta;
}

/** O cache local só fornece dados de apresentação depois que o servidor valida a mesma conta. */
export async function lerSessaoValidada<T extends { id: string }>(
  lerLocal: () => Promise<{ data: { session: { user: T } | null } }>,
  consultar: typeof fetch = fetch
): Promise<T | null> {
  try {
    const { data } = await lerLocal();
    const usuario = data.session?.user;
    if (!usuario) return null;
    return (await consultarUmaVez(consultar, usuario.id)) === usuario.id ? usuario : null;
  } catch {
    return null;
  }
}

export async function servirSessaoValidada(
  verificar: () => Promise<{ data: { user: { id: string; is_anonymous?: boolean } | null }; error: unknown }>
): Promise<Response> {
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store', Vary: 'Cookie' };
  try {
    const { data, error } = await verificar();
    const usuarioId = !error && data.user && !data.user.is_anonymous ? data.user.id : null;
    return Response.json({ usuarioId }, { headers });
  } catch {
    return Response.json({ usuarioId: null }, { status: 503, headers });
  }
}
