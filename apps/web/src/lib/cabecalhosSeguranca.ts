/**
 * Cabeçalhos de segurança HTTP de todas as respostas do site (lidos pelo `next.config.ts`).
 *
 * A CSP permite script e estilo só do próprio site e conexão só com o Supabase (API e tempo real). Ela mantém `'unsafe-inline'` em `script-src`
 * porque o Next injeta scripts em linha (dados das rotas) e o layout tem o script que aplica o tema antes da pintura; trocar por nonce exige
 * renderizar tudo dinamicamente. Mesmo assim, ela fecha o que mais importa: a página não pode ser embutida por outro site (`frame-ancestors`),
 * não carrega plugin (`object-src`), não troca a base dos links (`base-uri`) e não envia formulário para fora (`form-action`).
 * Em desenvolvimento o Next precisa de `'unsafe-eval'` (recarga rápida); em produção, não.
 */
export function politicaDeConteudo(desenvolvimento: boolean): string {
  const diretivas: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", ...(desenvolvimento ? ["'unsafe-eval'"] : [])],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:'],
    'font-src': ["'self'", 'data:'],
    'connect-src': ["'self'", 'https://*.supabase.co', 'wss://*.supabase.co', ...(desenvolvimento ? ['ws://localhost:*'] : [])],
    'frame-ancestors': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"]
  };
  return Object.entries(diretivas)
    .map(([nome, valores]) => `${nome} ${valores.join(' ')}`)
    .join('; ');
}

export function cabecalhosDeSeguranca(desenvolvimento: boolean): Array<{ key: string; value: string }> {
  return [
    { key: 'Content-Security-Policy', value: politicaDeConteudo(desenvolvimento) },
    // Só HTTPS por um ano, também nos subdomínios do site (sem `preload`: entrar na lista dos navegadores é difícil de desfazer)
    { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' }
  ];
}
