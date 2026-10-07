import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calcularPrazoMaterial } from './materiais';

describe('Prazos materiais (F2-14)', () => {
  it('mandado de segurança: 120 dias corridos, sem o dia da ciência', () => {
    const r = calcularPrazoMaterial({ tipo: 'mandado_seguranca', dataInicio: '2026-03-02' });
    assert.strictEqual(r.dataLimite, '2026-06-30');
    assert.strictEqual(r.dataAlternativa, undefined);
    assert.strictEqual(r.prorrogado, false);
  });

  it('mandado de segurança: o recesso não suspende (CC 207): ciência em 05/01 vence em 05/05', () => {
    assert.strictEqual(calcularPrazoMaterial({ tipo: 'mandado_seguranca', dataInicio: '2026-01-05' }).dataLimite, '2026-05-05');
    // atravessa 20/12 a 20/01 sem contar a mais
    assert.strictEqual(calcularPrazoMaterial({ tipo: 'mandado_seguranca', dataInicio: '2025-12-10' }).dataLimite, '2026-04-09');
  });

  it('mandado de segurança: vencimento em domingo fica no 120º dia, com a prorrogação só como alternativa', () => {
    const r = calcularPrazoMaterial({ tipo: 'mandado_seguranca', dataInicio: '2026-03-07' });
    assert.strictEqual(r.dataLimite, '2026-07-05');
    assert.strictEqual(r.dataAlternativa, '2026-07-06');
    assert.match(r.descricaoAlternativa!, /jurisprudência/);
  });

  it('mandado de segurança: vencimento em feriado (7/9) também fica no 120º dia', () => {
    const r = calcularPrazoMaterial({ tipo: 'mandado_seguranca', dataInicio: '2026-05-10', tribunalId: 'TJSP', uf: 'SP' });
    assert.strictEqual(r.dataLimite, '2026-09-07');
    assert.strictEqual(r.dataAlternativa, '2026-09-08');
  });

  it('ação rescisória: mesmo dia e mês, 2 anos depois, sem prorrogação em dia útil', () => {
    const r = calcularPrazoMaterial({ tipo: 'acao_rescisoria', dataInicio: '2024-08-12' });
    assert.strictEqual(r.dataLimite, '2026-08-12');
    assert.strictEqual(r.prorrogado, false);
  });

  it('ação rescisória: vencimento em recesso prorroga ao primeiro dia útil (art. 975, § 1º)', () => {
    const r = calcularPrazoMaterial({ tipo: 'acao_rescisoria', dataInicio: '2024-12-20' });
    assert.strictEqual(r.dataLimite, '2027-01-21');
    assert.strictEqual(r.prorrogado, true);
  });

  it('ação rescisória: férias forenses do STJ em julho prorrogam o vencimento', () => {
    const r = calcularPrazoMaterial({ tipo: 'acao_rescisoria', dataInicio: '2024-07-10', tribunalId: 'STJ' });
    assert.strictEqual(r.dataLimite, '2026-08-03');
    assert.strictEqual(r.prorrogado, true);
  });

  it('ação rescisória: Corpus Christi conferido no TJSP (04 e 05/06/2026) prorroga para 08/06', () => {
    const r = calcularPrazoMaterial({ tipo: 'acao_rescisoria', dataInicio: '2024-06-04', tribunalId: 'TJSP', uf: 'SP' });
    assert.strictEqual(r.dataLimite, '2026-06-08');
    assert.strictEqual(r.dataAlternativa, undefined);
  });

  it('ação rescisória: dia pendente (Corpus Christi sem ato) aparece só como alternativa', () => {
    const r = calcularPrazoMaterial({ tipo: 'acao_rescisoria', dataInicio: '2024-06-04' });
    assert.strictEqual(r.dataLimite, '2026-06-04');
    assert.strictEqual(r.dataAlternativa, '2026-06-05');
  });

  it('ação rescisória: 29/02 sem correspondência adota o dia mais cedo e avisa', () => {
    const r = calcularPrazoMaterial({ tipo: 'acao_rescisoria', dataInicio: '2024-02-29' });
    assert.strictEqual(r.memoriaCalculo[1].data, '2026-02-28');
    assert.strictEqual(r.dataLimite, '2026-03-02'); // 28/02 é sábado; 01/03 é domingo
    assert.ok(r.avisos.some(a => a.includes('não existe dois anos depois')));
  });

  it('rejeita data inválida', () => {
    assert.throws(() => calcularPrazoMaterial({ tipo: 'mandado_seguranca', dataInicio: '2026-02-30' }), /dataInicio inválida/);
  });
});
