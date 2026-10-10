import { describe, it } from 'node:test';
import assert from 'node:assert';
import { TRIBUNAIS_BRASIL, TribunalSchema, DispositivoLegalSchema, PrecedenteSchema, ProcedenciaSchema, FonteSchema, situacaoProcedencia } from './index';

describe('Núcleo: tribunais', () => {
  it('toda entrada do catálogo respeita o esquema e a chave é o id', () => {
    for (const [chave, t] of Object.entries(TRIBUNAIS_BRASIL)) {
      const r = TribunalSchema.safeParse(t);
      assert.ok(r.success, `${chave}: ${r.success ? '' : JSON.stringify(r.error.issues)}`);
      assert.strictEqual(t.id, chave);
      assert.strictEqual(t.sigla, chave);
    }
  });

  it('tribunais estaduais e regionais têm UF; superiores não', () => {
    for (const t of Object.values(TRIBUNAIS_BRASIL)) {
      if (t.esfera === 'estadual') assert.ok(t.uf, `${t.id}: sem UF`);
    }
  });
});

const FONTE = { id: 'planalto-cpc', ato: 'Lei 13.105/2015', url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105compilada.htm', lido: 'texto compilado', lidoEm: '2026-10-07' };

describe('Núcleo: procedência', () => {
  it('aceita fonte completa e recusa URL inválida, data inexistente e fonte vazia', () => {
    assert.ok(FonteSchema.safeParse(FONTE).success);
    assert.ok(!FonteSchema.safeParse({ ...FONTE, url: 'planalto' }).success);
    assert.ok(!FonteSchema.safeParse({ ...FONTE, lidoEm: '2026-02-30' }).success);
    assert.ok(!FonteSchema.safeParse({ ...FONTE, lidoEm: '07/10/2026' }).success);
    assert.ok(!FonteSchema.safeParse({ ...FONTE, ato: '' }).success);
  });

  it('procedência exige ao menos uma fonte e uma origem conhecida', () => {
    assert.ok(ProcedenciaSchema.safeParse({ origem: 'curado', fontes: [FONTE] }).success);
    assert.ok(!ProcedenciaSchema.safeParse({ origem: 'curado', fontes: [] }).success);
    assert.ok(!ProcedenciaSchema.safeParse({ origem: 'ia', fontes: [FONTE] }).success);
  });

  it('sugestão da IA só deixa de ser pendente quando uma pessoa a valida', () => {
    assert.strictEqual(situacaoProcedencia({ origem: 'curado', fontes: [FONTE] }), 'curado');
    assert.strictEqual(situacaoProcedencia({ origem: 'sugerido_ia', fontes: [FONTE] }), 'sugestao_pendente');
    assert.strictEqual(
      situacaoProcedencia({ origem: 'sugerido_ia', fontes: [FONTE], validacao: { por: 'Junior', em: '2026-10-10' } }),
      'sugestao_validada'
    );
  });

  it('dispositivo e precedente não existem sem procedência', () => {
    const dispositivo = { id: 'X', normaId: 'LEI-13105-2015', rotulo: 'art. 219', tipo: 'artigo', numero: '219', texto: 't', vigenteEm: '2016-03-18' };
    assert.ok(!DispositivoLegalSchema.safeParse(dispositivo).success);
    assert.ok(DispositivoLegalSchema.safeParse({ ...dispositivo, procedencia: { origem: 'curado', fontes: [FONTE] } }).success);
    const precedente = { id: 'STJ-SUMULA-479', tribunal: 'STJ', tipo: 'sumula_stj', numeroOuTema: 'Súmula 479', enunciadoTese: 't' };
    assert.ok(!PrecedenteSchema.safeParse(precedente).success);
    assert.ok(PrecedenteSchema.safeParse({ ...precedente, procedencia: { origem: 'curado', fontes: [FONTE] } }).success);
  });
});
