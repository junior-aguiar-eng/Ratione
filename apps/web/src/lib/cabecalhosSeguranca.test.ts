import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cabecalhosDeSeguranca, politicaDeConteudo } from './cabecalhosSeguranca';

describe('Cabeçalhos de segurança HTTP', () => {
  it('produção: os seis cabeçalhos, sem unsafe-eval nem websocket local', () => {
    const c = Object.fromEntries(cabecalhosDeSeguranca(false).map(h => [h.key, h.value]));
    assert.deepEqual(Object.keys(c).sort(), ['Content-Security-Policy', 'Permissions-Policy', 'Referrer-Policy', 'Strict-Transport-Security', 'X-Content-Type-Options', 'X-Frame-Options']);
    assert.equal(c['X-Frame-Options'], 'DENY');
    assert.equal(c['X-Content-Type-Options'], 'nosniff');
    assert.match(c['Strict-Transport-Security'], /^max-age=31536000; includeSubDomains$/);
    assert.doesNotMatch(c['Content-Security-Policy'], /unsafe-eval|localhost/);
  });

  it('CSP: o site não é embutido, não carrega plugin, não envia formulário para fora e só conversa com o Supabase', () => {
    const csp = politicaDeConteudo(false);
    for (const d of ["frame-ancestors 'none'", "object-src 'none'", "base-uri 'self'", "form-action 'self'", "default-src 'self'"]) assert.ok(csp.includes(d), d);
    assert.match(csp, /connect-src 'self' https:\/\/\*\.supabase\.co wss:\/\/\*\.supabase\.co(;|$)/);
  });

  it('desenvolvimento: libera o eval e o websocket da recarga rápida', () => {
    const csp = politicaDeConteudo(true);
    assert.match(csp, /script-src [^;]*'unsafe-eval'/);
    assert.match(csp, /connect-src [^;]*ws:\/\/localhost:\*/);
  });
});
