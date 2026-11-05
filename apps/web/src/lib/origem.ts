/**
 * Origem pública do site (`https://host`) a partir dos cabeçalhos da requisição. Atrás do Cloud Run e do balanceador, `request.url`
 * pode trazer o endereço interno do servidor (`HOSTNAME=0.0.0.0`); o `Host` e o `X-Forwarded-*` dizem o que o navegador viu.
 */
export function origemPublica(request: Request): string {
  const h = request.headers;
  const primeiro = (v: string | null) => v?.split(',')[0]?.trim() || undefined;
  const host = primeiro(h.get('x-forwarded-host')) ?? primeiro(h.get('host'));
  if (!host) return new URL(request.url).origin;
  const proto = primeiro(h.get('x-forwarded-proto')) ?? new URL(request.url).protocol.replace(':', '');
  return `${proto === 'http' || proto === 'https' ? proto : 'https'}://${host}`;
}

/**
 * O pedido que ALTERA dados veio do próprio site? Navegadores sempre mandam `Origin` em POST e DELETE, então a falta do cabeçalho também é recusada
 * (defesa contra requisição forjada de outro site). Vale para toda rota que muda algo; rotas de agendador e webhook têm segredo ou assinatura.
 */
export function veioDoSite(request: Request): boolean {
  return request.headers.get('origin') === origemPublica(request);
}
