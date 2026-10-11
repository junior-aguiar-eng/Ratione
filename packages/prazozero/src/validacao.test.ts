import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CENARIOS_VALIDADOS, CENARIOS_VALIDADOS_EM } from './validacao';

interface Cenario {
  validacao: { status: string; em: string | null };
}

const cenarios: Cenario[] = JSON.parse(readFileSync(join(__dirname, '../cenarios/cenarios.json'), 'utf-8'));

describe('PrazoZero: contagem de cenários validados mostrada na metodologia', () => {
  it('bate com o arquivo de cenários (atualize validacao.ts quando o arquivo mudar)', () => {
    const validados = cenarios.filter(c => c.validacao.status === 'validado');
    assert.strictEqual(CENARIOS_VALIDADOS, validados.length);
    assert.strictEqual(CENARIOS_VALIDADOS, cenarios.length, 'há cenário pendente: a metodologia não pode dizer que todos foram validados');
  });

  it('a data da última validação é a mais recente do arquivo', () => {
    const datas = cenarios.map(c => c.validacao.em).filter((d): d is string => !!d).sort();
    assert.strictEqual(CENARIOS_VALIDADOS_EM, datas[datas.length - 1]);
  });
});
