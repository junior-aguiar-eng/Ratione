import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { compararHtml } from './comparar';
import { avaliarNorma } from './atualizar';
import type { EntradaManifesto } from '../coleta/coletar';

const pagina = (corpo: string, rodape = 'v1') => `<html><body><p>Menu ${rodape}</p>${corpo}</body></html>`;

const BASE = pagina(
  '<p>Art. 1º Texto original.</p><p>Art. 2º Segundo. (Redação dada pela Lei nº 1, de 2000)</p><p>Art. 3º Terceiro.</p>'
);

describe('Comparação de leituras (F3-06)', () => {
  it('só a página mudou (menu, rodapé): natureza so_pagina, nada na lista de mudanças', () => {
    const r = compararHtml(BASE, pagina('<p>Art. 1º Texto original.</p><p>Art. 2º Segundo. (Redação dada pela Lei nº 1, de 2000)</p><p>Art. 3º Terceiro.</p>', 'v2'));
    assert.strictEqual(r.natureza, 'so_pagina');
    assert.strictEqual(r.amostra.length, 0);
  });

  it('dispositivo novo, texto alterado e anotação nova', () => {
    const depois = pagina(
      '<p>Art. 1º Texto alterado.</p><p>Art. 2º Segundo. (Redação dada pela Lei nº 9, de 2024)</p><p>Art. 3º Terceiro.</p><p>Art. 4º Quarto. (Incluído pela Lei nº 9, de 2024)</p>'
    );
    const r = compararHtml(BASE, depois);
    assert.strictEqual(r.natureza, 'texto_de_lei');
    assert.deepStrictEqual([r.novos, r.textoAlterado, r.anotacaoAlterada, r.removidos], [1, 1, 1, 0]);
    assert.deepStrictEqual(r.amostra.map(m => `${m.tipo}:${m.rotulo}`).sort(), ['anotacao_alterada:art. 2º', 'novo:art. 4º', 'texto_alterado:art. 1º']);
  });

  it('dispositivo que passa a revogado e dispositivo removido', () => {
    const depois = pagina('<p>Art. 1º Texto original.</p><p>Art. 2º (Revogado pela Lei nº 9, de 2024)</p>');
    const r = compararHtml(BASE, depois);
    assert.strictEqual(r.revogados, 1);
    assert.strictEqual(r.removidos, 1);
    assert.ok(r.amostra.some(m => m.tipo === 'removido' && m.rotulo === 'art. 3º'));
  });
});

describe('Decisão da atualização (F3-06)', () => {
  const anterior: EntradaManifesto = { id: 'LEI-1-2000', nome: 'Lei 1', url: 'u', tipoPagina: 'compilada', titulo: 't', charset: 'utf-8', bytes: 10, sha256: 'a'.repeat(64), lidoEm: '2026-10-19', arquivo: 'LEI-1-2000.html.gz' };

  it('mesmo SHA-256: sem mudança, nada na fila', () => {
    const r = avaliarNorma(anterior, BASE, { ...anterior }, Buffer.from(BASE), '2026-10-20');
    assert.strictEqual(r.resultado, 'sem_mudanca');
  });

  it('SHA-256 diferente mas texto igual (parte volátil da página): so_pagina, não entra na fila', () => {
    const r = avaliarNorma(anterior, BASE, { ...anterior, sha256: 'c'.repeat(64) }, Buffer.from(pagina('<p>Art. 1º Texto original.</p><p>Art. 2º Segundo. (Redação dada pela Lei nº 1, de 2000)</p><p>Art. 3º Terceiro.</p>', 'v9'), 'utf8'), '2026-10-20');
    assert.strictEqual(r.resultado, 'so_pagina');
  });

  it('SHA-256 diferente com texto alterado: entra na fila como pendente, com o resumo', () => {
    const novoHtml = pagina('<p>Art. 1º Texto alterado.</p><p>Art. 2º Segundo.</p><p>Art. 3º Terceiro.</p>');
    const r = avaliarNorma(anterior, BASE, { ...anterior, sha256: 'b'.repeat(64), bytes: 99 }, Buffer.from(novoHtml, 'utf8'), '2026-10-20');
    assert.strictEqual(r.resultado, 'mudou');
    if (r.resultado !== 'mudou') return;
    assert.strictEqual(r.item.status, 'pendente');
    assert.strictEqual(r.item.detectadoEm, '2026-10-20');
    assert.strictEqual(r.item.shaAntigo, anterior.sha256);
    assert.strictEqual(r.item.resumo.natureza, 'texto_de_lei');
    assert.ok(r.item.resumo.textoAlterado >= 1);
  });
});
