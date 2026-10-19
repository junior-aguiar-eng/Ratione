import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { detectarCharset, tipoDaPagina } from './coletar';
import { NORMAS_PLANALTO, BASE_PLANALTO } from './normas';

describe('Coleta do Planalto (F3-01)', () => {
  it('windows-1252 sem declaração decodifica acentos', () => {
    const r = detectarCharset(Buffer.from('<p>Constitui\xe7\xe3o</p>', 'latin1'), 'text/html');
    assert.strictEqual(r.charset, 'windows-1252');
    assert.match(r.texto, /Constituição/);
  });

  it('UTF-16 com BOM (Lei 11.340/2006) é reconhecido', () => {
    const bytes = Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from('<title>Lei nº 11.340</title>', 'utf16le')]);
    const r = detectarCharset(bytes, 'text/html');
    assert.strictEqual(r.charset, 'utf-16le');
    assert.match(r.texto, /Lei nº 11\.340/);
  });

  it('charset do cabeçalho vale; iso-8859-1 é lido como windows-1252', () => {
    const r = detectarCharset(Buffer.from('a\x93b\x94', 'latin1'), 'text/html; charset=iso-8859-1');
    assert.strictEqual(r.charset, 'windows-1252');
    assert.strictEqual(r.texto, 'a“b”');
  });

  it('UTF-8 estrito sem declaração', () => {
    assert.strictEqual(detectarCharset(Buffer.from('Constituição', 'utf8'), null).charset, 'utf-8');
  });

  it('tipo de página: compilada/consolidada ou anotada', () => {
    assert.strictEqual(tipoDaPagina('decreto-lei/del3689compilado.htm'), 'compilada');
    assert.strictEqual(tipoDaPagina('leis/l8112cons.htm'), 'compilada');
    assert.strictEqual(tipoDaPagina('constituicao/constituicao.htm'), 'compilada');
    assert.strictEqual(tipoDaPagina('leis/l9099.htm'), 'anotada');
  });

  it('lista de normas: ids únicos, caminhos únicos e HTTPS do Planalto', () => {
    assert.strictEqual(new Set(NORMAS_PLANALTO.map(n => n.id)).size, NORMAS_PLANALTO.length);
    assert.strictEqual(new Set(NORMAS_PLANALTO.map(n => n.caminho)).size, NORMAS_PLANALTO.length);
    assert.ok(BASE_PLANALTO.startsWith('https://www.planalto.gov.br/'));
    for (const n of NORMAS_PLANALTO) assert.match(n.id, /^(CF-1988|(LEI|DL|LC)-\d+-\d{4})$/);
  });
});
