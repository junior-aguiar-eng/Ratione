import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { citacoesDoNo, coberturaPorExtenso, numerosDeRepercussaoGeral, posicoesRadiais, resumoDoNo, tabelaAusente, textoDaPesquisa, type NoTese } from './tesemap';

const dc = (iso: string) => iso.split('-').reverse().join('/');
const no = (detalhes: Record<string, unknown>): NoTese => ({
  id: 'STJ-TEMA-1076', tipo: 'precedente', rotulo: 'Tema 1076 do STJ', tribunal: 'STJ', numero_referencia: 'Tema 1076', descricao: 'tese', dispositivo_id: null, detalhes,
  origem_dado: 'curado', fontes: [], validado_por: null, validado_em: null, atualizado_em: '2026-10-22'
});

describe('Pesquisa do TeseMap (F4-04)', () => {
  it('limpa o texto: milhar sem ponto, pontuação solta fora, espaços juntos, tamanho limitado', () => {
    assert.equal(textoDaPesquisa('Tema 1.076'), 'Tema 1076');
    assert.equal(textoDaPesquisa('a,b)or(id.eq.x*"%'), 'a b or id eq x');
    assert.equal(textoDaPesquisa('  honorários   por equidade  '), 'honorários por equidade');
    assert.equal(textoDaPesquisa('x'.repeat(200)).length, 80);
    assert.equal(textoDaPesquisa('(),*'), '');
  });

  it('banco sem a tabela (migração por aplicar) é reconhecido; outro erro não', () => {
    assert.equal(tabelaAusente({ code: '42P01' }), true);
    assert.equal(tabelaAusente({ code: 'PGRST205', message: "Could not find the table 'public.tesemap_nos' in the schema cache" }), true);
    assert.equal(tabelaAusente({ code: '42501', message: 'permission denied' }), false);
    assert.equal(tabelaAusente(null), false);
  });

  it('resumo da lista só traz o que o nó tem', () => {
    assert.equal(resumoDoNo(no({ dataJulgamento: '2022-03-16', orgaoJulgador: 'CE' }), dc), 'julgado em 16/03/2022 · CE');
    assert.equal(resumoDoNo(no({ orgaoJulgador: 'CE' }), dc), 'CE');
    assert.equal(resumoDoNo(no({}), dc), '');
  });

  it('citações malformadas no JSON são ignoradas, não derrubam a tela', () => {
    const ok = { normaId: 'CF-1988', artigo: '109', detalhe: '§ 3º', dispositivoId: 'CF-1988|corpo|art. 109' };
    assert.deepEqual(citacoesDoNo(no({ citacoes: [ok, { normaId: 1 }, null, 'x'] })), [ok]);
    assert.deepEqual(citacoesDoNo(no({ citacoes: 'x' })), []);
    assert.deepEqual(citacoesDoNo(no({})), []);
  });
});

describe('Cobertura e desenho do grafo (F4-04)', () => {
  it('cobertura declarada em português, com singular e plural', () => {
    assert.equal(
      coberturaPorExtenso([
        { tribunal: 'STJ', tipo: 'precedente', total: 1155, atualizado_em: '2026-10-22' },
        { tribunal: 'STF', tipo: 'sumula', total: 1, atualizado_em: '2026-10-01' },
        { tribunal: 'STF', tipo: 'sumula', total: 3, atualizado_em: '2026-10-01' }
      ]),
      '1.155 precedentes do STJ, 1 súmula do STF, 3 súmulas do STF'
    );
  });

  it('vizinhos numa circunferência: o primeiro no alto, igualmente espaçados, nenhum sobre o centro', () => {
    const p = posicoesRadiais(4, 300);
    assert.deepEqual(p, [{ x: 0, y: -300 }, { x: 300, y: 0 }, { x: 0, y: 300 }, { x: -300, y: 0 }]);
    assert.deepEqual(posicoesRadiais(0), []);
    assert.ok(posicoesRadiais(12).every(q => Math.hypot(q.x, q.y) > 290));
  });
});

describe('Ligação STJ e STF pela repercussão geral (F4-02)', () => {
  it('lê os números de tema do STF que o STJ liga, sem repetir e sem aceitar o que não é número', () => {
    const n = (rg: unknown): NoTese => ({ id: 'STJ-TEMA-1076', tipo: 'precedente', rotulo: 'x', tribunal: 'STJ', numero_referencia: null, descricao: '', dispositivo_id: null, detalhes: { repercussaoGeral: rg }, origem_dado: 'curado', fontes: [], validado_por: null, validado_em: null, atualizado_em: '2026-10-22' });
    assert.deepEqual(numerosDeRepercussaoGeral(n([{ numero: '1255' }, { numero: '1255' }, { numero: '12x' }, { numero: 3 }, null, 'x'])), ['1255']);
    assert.deepEqual(numerosDeRepercussaoGeral(n('x')), []);
    assert.deepEqual(numerosDeRepercussaoGeral(n(undefined)), []);
  });
});
