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
});
