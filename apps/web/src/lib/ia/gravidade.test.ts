import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { gravidadeDoAviso } from './gravidade';

const falha = (erro_mensagem: string) => gravidadeDoAviso('IA: chamada falhou', { tarefa: 'explicar-dispositivo', erro_mensagem });

describe('IA: gravidade do aviso de falha', () => {
  it('saldo esgotado na Anthropic vira ERROR (a mensagem real de 22/10/2026)', () => {
    assert.equal(
      falha('pedido recusado pela API (400): 400 {"type":"error","error":{"type":"invalid_request_error","message":"Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits."}}'),
      'ERROR'
    );
  });

  it('chave inválida ou sem permissão vira ERROR', () => {
    assert.equal(falha('chave da API inválida (401)'), 'ERROR');
    assert.equal(falha('erro da API (403)'), 'ERROR');
  });

  it('falha passageira continua WARNING: o usuário tenta de novo', () => {
    assert.equal(falha('limite de taxa da API (429)'), 'WARNING');
    assert.equal(falha('tempo esgotado'), 'WARNING');
    assert.equal(falha('erro da API (529)'), 'WARNING');
    assert.equal(falha('pedido recusado pela API (400): mensagem inválida'), 'WARNING');
  });

  it('outros avisos da IA (recusa, resposta cortada, saída descartada) continuam WARNING', () => {
    for (const m of ['IA: modelo recusou', 'IA: resposta cortada', 'IA: saída descartada']) assert.equal(gravidadeDoAviso(m, { erro_mensagem: 'credit balance' }), 'WARNING');
  });

  it('sem mensagem de erro, WARNING', () => {
    assert.equal(gravidadeDoAviso('IA: chamada falhou', {}), 'WARNING');
  });
});
