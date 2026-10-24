import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { RegistroCobranca } from '../../app/meu-espaco/uso/HistoricoCobrancas';
import type { LinhaCobranca } from './historico';

describe('Apresentação de cobranças', () => {
  it('data de débito em cobrança rejeitada ou pendente não é anunciada como aprovação', () => {
    for (const situacao of ['rejeitada', 'pendente'] as const) {
      const cobranca: LinhaCobranca = {
        id: 'cobranca', valor_centavos: 2900, situacao, meio: null,
        criada_em: '2026-10-23T15:00:00Z', paga_em: '2026-10-24T15:00:00Z'
      };
      const html = renderToStaticMarkup(createElement(RegistroCobranca, { cobranca }));
      assert.doesNotMatch(html, /Pagamento aprovado/);
      assert.match(html, /Data informada pelo Mercado Pago/);
      assert.match(html, /24\/10\/2026/);
      assert.match(html, situacao === 'rejeitada' ? /Rejeitada/ : /Pendente/);
    }
  });
});
