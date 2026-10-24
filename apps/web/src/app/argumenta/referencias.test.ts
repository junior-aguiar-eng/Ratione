import assert from 'node:assert/strict';
import { test } from 'node:test';
import { referenciaVisual } from './referencias';

test('a referência localiza todos os trechos sem mostrar âncoras técnicas', () => {
  assert.deepEqual(referenciaVisual([7, 4, 7]), {
    trechos: [4, 7],
    rotulo: 'Ver no texto',
    descricao: 'Localizar 2 trechos no texto da decisão'
  });
  assert.deepEqual(referenciaVisual([3]), {
    trechos: [3],
    rotulo: 'Ver no texto',
    descricao: 'Localizar trecho no texto da decisão'
  });
});
