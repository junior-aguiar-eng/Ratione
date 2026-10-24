/** Só informa a autorização da sessão, sem dados financeiros ou configuração de usuários. */
export async function servirAcessoAdministrativo(verificar: () => Promise<boolean>): Promise<Response> {
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store', Vary: 'Cookie' };
  try {
    return new Response(JSON.stringify({ administrador: await verificar() }), { headers });
  } catch {
    return new Response(JSON.stringify({ administrador: false }), { status: 503, headers });
  }
}
