const primeiroValor = (v: string | null): string | undefined => v?.split(',')[0]?.trim() || undefined;

function hostValido(bruto: string | undefined): string | undefined {
  if (!bruto) return undefined;
  const valor = bruto.trim();
  if (!valor || valor.length > 253 || /[\s/@\\?#\u0000-\u001f]/.test(valor)) return undefined;
  if (!/^(?:[a-z0-9.-]+|\[[0-9a-f:.]+\])(?::\d{1,5})?$/i.test(valor)) return undefined;
  try {
    const u = new URL(`http://${valor}`);
    if (u.username || u.password || u.pathname !== '/' || u.search || u.hash) return undefined;
    if (!u.hostname || u.hostname.startsWith('.') || u.hostname.endsWith('.') || u.hostname.includes('..')) return undefined;
    if (u.port) {
      const porta = Number(u.port);
      if (!Number.isInteger(porta) || porta < 1 || porta > 65535) return undefined;
    }
    return u.host;
  } catch {
    return undefined;
  }
}

function ehLocalhost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h === 'localhost' || h === '127.0.0.1' || h === '[::1]' || h === '0.0.0.0';
}

function lerOrigemConfigurada(env: NodeJS.ProcessEnv): string | undefined {
  const explicita = env.RATIONE_ORIGEM_PUBLICA?.trim();
  const candidatos = explicita ? [explicita] : [env.SITE_URL?.trim(), env.NEXT_PUBLIC_SITE_URL?.trim()];

  for (const bruto of candidatos) {
    if (!bruto) continue;
    try {
      const u = new URL(bruto);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') continue;
      if (!explicita && env.NODE_ENV !== 'production' && ehLocalhost(u.hostname)) continue;
      return u.origin;
    } catch {
      continue;
    }
  }
  return undefined;
}

function lerHostsConfiados(env: NodeJS.ProcessEnv): Set<string> | null {
  const bruto = env.RATIONE_HOSTS_CONFIADOS?.trim();
  if (!bruto) return null;
  const hosts = bruto
    .split(/[\s,;]+/)
    .map(h => hostValido(h)?.toLowerCase())
    .filter((h): h is string => Boolean(h));
  return new Set(hosts);
}

/**
 * Origem pública do site (`https://host`). Atrás do Cloud Run e do balanceador, `request.url` pode trazer o endereço interno (`HOSTNAME=0.0.0.0`);
 * quando `RATIONE_ORIGEM_PUBLICA`, `SITE_URL` / `NEXT_PUBLIC_SITE_URL` (fora de localhost em dev) ou `RATIONE_HOSTS_CONFIADOS` estiverem definidos,
 * impede spoof por `X-Forwarded-Host` / `Host` fora da política e valida a sintaxe do host antes de compor a origem.
 */
export function origemPublica(request: Request, env: NodeJS.ProcessEnv = process.env): string {
  const origemConfigurada = lerOrigemConfigurada(env);
  const hostsConfiados = lerHostsConfiados(env);

  if (origemConfigurada && !hostsConfiados) {
    return origemConfigurada;
  }

  const h = request.headers;
  const protoBruto = primeiroValor(h.get('x-forwarded-proto')) ?? new URL(request.url).protocol.replace(':', '');
  const proto = protoBruto === 'http' || protoBruto === 'https' ? protoBruto : 'https';

  const candidatos = [hostValido(primeiroValor(h.get('x-forwarded-host'))), hostValido(primeiroValor(h.get('host')))];
  for (const host of candidatos) {
    if (!host) continue;
    if (hostsConfiados && !hostsConfiados.has(host.toLowerCase())) continue;
    return `${proto}://${host}`;
  }

  if (origemConfigurada) return origemConfigurada;
  if (hostsConfiados && hostsConfiados.size > 0) {
    const primeiroConfiado = hostsConfiados.values().next().value;
    if (primeiroConfiado) return `https://${primeiroConfiado}`;
  }
  return new URL(request.url).origin;
}

/**
 * O pedido que ALTERA dados veio do próprio site? Navegadores sempre mandam `Origin` em POST e DELETE, então a falta do cabeçalho também é recusada
 * (defesa contra requisição forjada de outro site). Vale para toda rota que muda algo; rotas de agendador e webhook têm segredo ou assinatura.
 */
export function veioDoSite(request: Request, env: NodeJS.ProcessEnv = process.env): boolean {
  return request.headers.get('origin') === origemPublica(request, env);
}
