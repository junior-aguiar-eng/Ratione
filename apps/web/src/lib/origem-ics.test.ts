import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { dobrarLinhaIcs, escaparTextoIcs, gerarIcs } from './ics';
import { origemPublica } from './origem';

const octetos = (t: string) => new TextEncoder().encode(t).length;

describe('iCalendar', () => {
  it('escapa barra invertida, ponto e vírgula, vírgula e quebra de linha', () => {
    assert.equal(escaparTextoIcs('a;b,c\\d\ne'), 'a\\;b\\,c\\\\d\\ne');
  });

  it('dobra linhas longas em 75 octetos sem cortar caractere acentuado', () => {
    const linha = 'DESCRIPTION:' + 'ção '.repeat(60);
    const dobrada = dobrarLinhaIcs(linha);
    for (const parte of dobrada.split('\r\n')) assert.ok(octetos(parte) <= 75, parte);
    assert.equal(dobrada.replace(/\r\n /g, ''), linha);
  });

  it('o evento gerado não tem linha acima de 75 octetos', () => {
    const ics = gerarIcs('2026-11-03', 'Linha; um\n' + 'texto longo '.repeat(40), 'Apelação · TJSP');
    for (const l of ics.split('\r\n')) assert.ok(octetos(l) <= 75, l);
  });
});

describe('Origem pública', () => {
  const req = (url: string, h: Record<string, string>) => new Request(url, { headers: h });
  it('usa o Host e o protocolo encaminhado, não o endereço interno', () => {
    assert.equal(origemPublica(req('http://0.0.0.0:8080/x', { host: 'ratione.nexojuris.ia.br', 'x-forwarded-proto': 'https' })), 'https://ratione.nexojuris.ia.br');
  });
  it('X-Forwarded-Host tem prioridade, e só o primeiro valor da lista vale', () => {
    assert.equal(origemPublica(req('http://0.0.0.0:8080/x', { host: 'interno', 'x-forwarded-host': 'a.com, b.com', 'x-forwarded-proto': 'https, http' })), 'https://a.com');
  });
  it('sem cabeçalhos, cai na URL da requisição', () => {
    assert.equal(origemPublica(new Request('http://localhost:3000/x')), 'http://localhost:3000');
  });
  it('rejeita sintaxe inválida em X-Forwarded-Host e cai no Host válido ou URL', () => {
    assert.equal(origemPublica(req('http://0.0.0.0:8080/x', { host: 'ratione.nexojuris.ia.br', 'x-forwarded-host': 'evil.com/login', 'x-forwarded-proto': 'https' })), 'https://ratione.nexojuris.ia.br');
    assert.equal(origemPublica(req('http://localhost:3000/x', { 'x-forwarded-host': 'evil.com@good.com' })), 'http://localhost:3000');
  });
  it('com RATIONE_HOSTS_CONFIADOS, recusa host forjado em X-Forwarded-Host e usa host confiável ou origem configurada', () => {
    const antesHosts = process.env.RATIONE_HOSTS_CONFIADOS;
    const antesSite = process.env.SITE_URL;
    try {
      process.env.RATIONE_HOSTS_CONFIADOS = 'ratione.nexojuris.ia.br, preview.ratione.nexojuris.ia.br';
      process.env.SITE_URL = 'https://ratione.nexojuris.ia.br';
      assert.equal(origemPublica(req('http://0.0.0.0:8080/x', { host: 'interno', 'x-forwarded-host': 'evil.com', 'x-forwarded-proto': 'https' })), 'https://ratione.nexojuris.ia.br');
      assert.equal(origemPublica(req('http://0.0.0.0:8080/x', { host: 'ratione.nexojuris.ia.br', 'x-forwarded-host': 'evil.com', 'x-forwarded-proto': 'https' })), 'https://ratione.nexojuris.ia.br');
      assert.equal(origemPublica(req('http://0.0.0.0:8080/x', { host: 'interno', 'x-forwarded-host': 'preview.ratione.nexojuris.ia.br', 'x-forwarded-proto': 'https' })), 'https://preview.ratione.nexojuris.ia.br');
    } finally {
      if (antesHosts === undefined) delete process.env.RATIONE_HOSTS_CONFIADOS; else process.env.RATIONE_HOSTS_CONFIADOS = antesHosts;
      if (antesSite === undefined) delete process.env.SITE_URL; else process.env.SITE_URL = antesSite;
    }
  });
  it('prioriza SITE_URL / RATIONE_ORIGEM_PUBLICA fora de localhost contra X-Forwarded-Host forjado', () => {
    const antesOrigem = process.env.RATIONE_ORIGEM_PUBLICA;
    const antesSite = process.env.SITE_URL;
    try {
      process.env.SITE_URL = 'https://ratione.nexojuris.ia.br/qualquer';
      assert.equal(origemPublica(req('http://0.0.0.0:8080/x', { host: 'evil.com', 'x-forwarded-host': 'evil.com', 'x-forwarded-proto': 'https' })), 'https://ratione.nexojuris.ia.br');
      delete process.env.SITE_URL;
      process.env.RATIONE_ORIGEM_PUBLICA = 'https://app.ratione.exemplo';
      assert.equal(origemPublica(req('http://0.0.0.0:8080/x', { 'x-forwarded-host': 'evil.com', 'x-forwarded-proto': 'https' })), 'https://app.ratione.exemplo');
    } finally {
      if (antesOrigem === undefined) delete process.env.RATIONE_ORIGEM_PUBLICA; else process.env.RATIONE_ORIGEM_PUBLICA = antesOrigem;
      if (antesSite === undefined) delete process.env.SITE_URL; else process.env.SITE_URL = antesSite;
    }
  });
});
