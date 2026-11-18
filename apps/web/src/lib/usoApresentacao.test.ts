import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  editarCampoNumerico,
  exibeMemoriaCalculo,
  numeroEmEdicao,
  percentualDeUso,
  resolverNumeroNoIntervalo,
  temOpcoesAvancadasNaUrl,
  urlSemParametroAssinatura
} from './usoApresentacao';

describe('usoApresentacao: percentualDeUso', () => {
  it('retorna 0 quando quantidade é zero, negativa ou inválida, sem gerar NaN', () => {
    assert.equal(percentualDeUso(0, 0), 0);
    assert.equal(percentualDeUso(5, 0), 0);
    assert.equal(percentualDeUso(3, -10), 0);
    assert.equal(percentualDeUso(NaN, 10), 0);
    assert.equal(percentualDeUso(10, NaN), 0);
    assert.equal(percentualDeUso(-2, 10), 0);
  });

  it('calcula a porcentagem arredondada e limitada entre 0 e 100', () => {
    assert.equal(percentualDeUso(0, 10), 0);
    assert.equal(percentualDeUso(1, 3), 33);
    assert.equal(percentualDeUso(2, 3), 67);
    assert.equal(percentualDeUso(10, 10), 100);
    assert.equal(percentualDeUso(15, 10), 100);
  });
});

describe('usoApresentacao: exibeMemoriaCalculo', () => {
  it('só libera o segundo passo quando memoriaCalculo tem mais de um item', () => {
    assert.equal(exibeMemoriaCalculo(undefined), false);
    assert.equal(exibeMemoriaCalculo(null), false);
    assert.equal(exibeMemoriaCalculo([]), false);
    assert.equal(exibeMemoriaCalculo([{ data: '2026-10-01' }]), false);
    assert.equal(exibeMemoriaCalculo([{ data: '2026-10-01' }, { data: '2026-10-15' }]), true);
  });
});

describe('usoApresentacao: entrada numérica durante edição e no blur/submit', () => {
  it('permite campo vazio temporário ao digitar sem forçar 1 a cada tecla', () => {
    assert.equal(editarCampoNumerico(''), '');
    assert.equal(editarCampoNumerico('   '), '');
    assert.equal(editarCampoNumerico('0'), '0');
    assert.equal(editarCampoNumerico('30'), '30');
    assert.equal(editarCampoNumerico('500'), '500');
    assert.equal(numeroEmEdicao(''), null);
    assert.equal(numeroEmEdicao('  '), null);
    assert.equal(numeroEmEdicao('abc'), null);
    assert.equal(numeroEmEdicao('30'), 30);
  });

  it('resolve fallback e limita ao intervalo válido apenas na confirmação (blur/submit)', () => {
    assert.equal(resolverNumeroNoIntervalo('', 1, 365, 1), 1);
    assert.equal(resolverNumeroNoIntervalo('  ', 1, 365, 15), 15);
    assert.equal(resolverNumeroNoIntervalo('0', 1, 365, 1), 1);
    assert.equal(resolverNumeroNoIntervalo('-5', 1, 365, 1), 1);
    assert.equal(resolverNumeroNoIntervalo('500', 1, 365, 1), 365);
    assert.equal(resolverNumeroNoIntervalo('30', 1, 365, 1), 30);
    assert.equal(resolverNumeroNoIntervalo('15.8', 1, 365, 1), 15);
  });
});

describe('usoApresentacao: opções avançadas da URL e limpeza de retorno da assinatura', () => {
  it('identifica quando a URL traz opções avançadas preenchidas', () => {
    assert.equal(temOpcoesAvancadasNaUrl({ atoId: 'apelacao', regime: 'cpc_dias_uteis' }, 'cpc_dias_uteis'), false);
    assert.equal(temOpcoesAvancadasNaUrl({ atoId: 'apelacao', regime: 'clt_dias_uteis' }, 'cpc_dias_uteis'), true);
    assert.equal(temOpcoesAvancadasNaUrl({ dobro: true }), true);
    assert.equal(temOpcoesAvancadasNaUrl({ litisconsortes: true }), true);
    assert.equal(temOpcoesAvancadasNaUrl({ excecaoCriminal: true }), true);
    assert.equal(temOpcoesAvancadasNaUrl({}), false);
  });

  it('remove somente o parâmetro assinatura mantendo os demais parâmetros e hash', () => {
    assert.equal(urlSemParametroAssinatura('/meu-espaco/uso'), null);
    assert.equal(urlSemParametroAssinatura('/meu-espaco/uso?assinatura=retorno'), '/meu-espaco/uso');
    assert.equal(
      urlSemParametroAssinatura('/meu-espaco/uso?filtro=analises&assinatura=retorno#uso-assinatura'),
      '/meu-espaco/uso?filtro=analises#uso-assinatura'
    );
  });
});
