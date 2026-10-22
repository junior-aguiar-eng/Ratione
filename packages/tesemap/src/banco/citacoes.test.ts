import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { extrairRemissoes } from '@ratione/normaviva/referencias';
import { linhasDoCorpus } from '@ratione/normaviva/corpus';
import { carregarPrecedentesStj, manifestoStj } from '../stj';
import { citacoesNoTexto } from './citacoes';
import { nosDosPrecedentesStj } from './nos-stj';

describe('Citações a dispositivos do NormaViva (F4-04)', () => {
  const ids = new Set(linhasDoCorpus(join(__dirname, '..', '..', '..', 'normaviva', 'corpus'), ['CF-1988', 'LEI-13105-2015']).flatMap(l => l.dispositivos.map(d => d.id)));
  const citar = (t: string) => citacoesNoTexto(t, extrairRemissoes, id => ids.has(id));

  it('só a norma nomeada no texto e que existe no corpus; repetição e artigo inexistente ficam de fora', () => {
    const c = citar('Compete à Justiça Federal (art. 109 da Constituição Federal) e vale o art. 85, § 8º, do CPC. De novo o art. 109 da Constituição Federal. Cita o art. 99999 do CPC.');
    assert.deepEqual(c.map(x => x.dispositivoId), ['CF-1988|corpo|art. 109', 'LEI-13105-2015|corpo|art. 85']);
    assert.equal(c[1].detalhe, '§ 8º');
  });

  it('artigo sem norma nomeada ("o art. 5º") não vira atalho: o texto não diz de que lei é', () => {
    assert.deepEqual(citar('Aplica-se o art. 5º e o art. 85.'), []);
  });

  it('nos nós do STJ, a citação carrega o id que abre o dispositivo no NormaViva (IAC 6 cita o art. 109 da CF)', () => {
    const m = manifestoStj();
    const nos = nosDosPrecedentesStj(carregarPrecedentesStj(), m, citar);
    const n = nos.find(x => x.id === 'STJ-IAC-6')!;
    const cit = (n.detalhes as { citacoes: Array<{ dispositivoId: string }> }).citacoes;
    assert.ok(cit.some(x => x.dispositivoId === 'CF-1988|corpo|art. 109'));
    const semAtalho = nosDosPrecedentesStj(carregarPrecedentesStj(), m).find(x => x.id === 'STJ-IAC-6')!;
    assert.deepEqual((semAtalho.detalhes as { citacoes: unknown[] }).citacoes, []);
  });
});
