import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { compararPrecedentes, fontesManuaisVencidas, montarRelatorio, PRAZO_FONTE_MANUAL_DIAS, relatorioEmMarkdown } from './verificar';
import { carregarPrecedentesStj, manifestoStj } from '../stj/corpus';
import type { PrecedenteStj } from '../stj/precedentes';

const real = carregarPrecedentesStj();
const tema1076 = real.find(p => p.id === 'STJ-TEMA-1076')!;
const semTese = real.find(p => p.tipo === 'Tema' && !p.tese && !p.cancelado)!;
const com = (p: PrecedenteStj, sobre: Partial<PrecedenteStj>): PrecedenteStj => ({ ...p, ...sobre });

describe('Atualização periódica do TeseMap: o que mudou nos precedentes do STJ', () => {
  it('mesmo arquivo: nada muda', () => {
    assert.deepEqual(compararPrecedentes(real, real), { entram: [], saem: [], teseAlterada: [], situacaoAlterada: [] });
  });

  it('entra o tema que firmou tese; sai o cancelado e o que sumiu do arquivo; tese e situação alteradas', () => {
    const outro = real.find(p => p.id !== 'STJ-TEMA-1076' && p.tipo === 'Tema' && p.tese && !p.cancelado)!;
    const terceiro = real.find(p => p.id !== tema1076.id && p.id !== outro.id && p.tipo === 'IAC' && p.tese && !p.cancelado)!;
    const quarto = real.find(p => ![tema1076.id, outro.id, terceiro.id].includes(p.id) && p.tipo === 'Tema' && p.tese && !p.cancelado)!;
    const depois = real
      .filter(p => p.id !== terceiro.id)
      .map(p => {
        if (p.id === semTese.id) return com(p, { tese: 'Tese firmada agora.' });
        if (p.id === tema1076.id) return com(p, { cancelado: true });
        if (p.id === outro.id) return com(p, { tese: `${p.tese} (redação nova)` });
        if (p.id === quarto.id) return com(p, { situacao: 'Situação nova' });
        return p;
      });
    const m = compararPrecedentes(real, depois);
    assert.deepEqual(m.entram, [semTese.id]);
    assert.deepEqual(m.saem, [terceiro.id, tema1076.id].sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true })));
    assert.deepEqual(m.teseAlterada, [outro.id]);
    assert.deepEqual(m.situacaoAlterada, [quarto.id]);
  });

  it('espaços a mais na tese não contam como tese alterada', () => {
    const depois = real.map(p => (p.id === tema1076.id ? com(p, { tese: `  ${p.tese!.replace(/ /g, '   ')}\n` }) : p));
    assert.deepEqual(compararPrecedentes(real, depois).teseAlterada, []);
  });
});

describe('Atualização periódica do TeseMap: fontes de entrada manual e relatório', () => {
  it(`fonte manual vence depois de ${PRAZO_FONTE_MANUAL_DIAS} dias`, () => {
    const stf = [{ fonte: 'STF: sumulas', lidoEm: '2026-10-22', comoRenovar: 'x' }];
    assert.deepEqual(fontesManuaisVencidas('2027-01-20', stf), [], '90 dias ainda está no prazo');
    assert.deepEqual(fontesManuaisVencidas('2027-01-21', stf).map(f => [f.fonte, f.dias]), [['STF: sumulas', 91]]);
    const duas = [...stf, { fonte: 'STJ: súmulas', lidoEm: '2026-07-01', comoRenovar: 'y' }];
    assert.deepEqual(fontesManuaisVencidas('2026-10-22', duas).map(f => [f.fonte, f.dias]), [['STJ: súmulas', 113]]);
  });

  it('relatório: há o que fazer quando o STJ mudou ou alguma fonte manual venceu; sem isso, nada', () => {
    const atual = manifestoStj();
    const igual = montarRelatorio('2026-10-23', atual, atual, null, []);
    assert.equal(igual.stj.mudou, false);
    assert.equal(igual.haOQueFazer, false);
    const novo = { ...atual, arquivos: atual.arquivos.map(a => (a.nome === 'Temas.csv' ? { ...a, sha256: 'f'.repeat(64), modificadoEm: '2026-10-30' } : a)) };
    const mudancas = { entram: ['STJ-TEMA-9999'], saem: [], teseAlterada: [], situacaoAlterada: [] };
    const mudou = montarRelatorio('2026-10-30', atual, novo, mudancas, []);
    assert.equal(mudou.stj.mudou, true);
    assert.deepEqual(mudou.stj.mudancas, mudancas);
    assert.equal(mudou.haOQueFazer, true);
    assert.equal(montarRelatorio('2027-03-01', atual, atual, null, [{ fonte: 'STF: sumulas', lidoEm: '2026-10-22', dias: 130, comoRenovar: 'x' }]).haOQueFazer, true);
  });

  it('texto da issue: o que mudou no STJ, a amostra limitada a 30 e as fontes manuais vencidas', () => {
    const atual = manifestoStj();
    const novo = { ...atual, arquivos: atual.arquivos.map(a => (a.nome === 'Temas.csv' ? { ...a, sha256: 'f'.repeat(64), modificadoEm: '2026-10-30' } : a)) };
    const entram = Array.from({ length: 35 }, (_, i) => `STJ-TEMA-${2000 + i}`);
    const md = relatorioEmMarkdown(
      montarRelatorio('2026-10-30', atual, novo, { entram, saem: [], teseAlterada: ['STJ-TEMA-1076'], situacaoAlterada: [] }, [{ fonte: 'STF: sumulas', lidoEm: '2026-07-01', dias: 121, comoRenovar: 'baixar de novo' }])
    );
    assert.match(md, /^Verificação do TeseMap \(2026-10-30\)\. Nada foi alterado/);
    assert.match(md, /- Temas\.csv: modificado em 2026-10-30/);
    assert.doesNotMatch(md, /Processos\.csv/, 'arquivo que não mudou não aparece');
    assert.match(md, /\*\*35\*\* entram, \*\*0\*\* saem, \*\*1\*\* com tese alterada/);
    assert.match(md, /STJ-TEMA-2029 e mais 5/);
    assert.match(md, /- Tese alterada: STJ-TEMA-1076/);
    assert.match(md, /\*\*STF: sumulas\*\*: lida em 2026-07-01, há 121 dias/);
    assert.doesNotMatch(relatorioEmMarkdown(montarRelatorio('2026-10-23', atual, atual, null, [])), /###/);
  });
});
