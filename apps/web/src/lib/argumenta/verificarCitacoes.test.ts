import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { verificarCitacoes, type BancoDeCitacoes } from './verificarCitacoes';

const NORMAS = ['LEI-13105-2015', 'LEI-8078-1990', 'LEI-14133-2021'];

const DISPOSITIVOS: Record<string, string> = {
  'LEI-8078-1990|art. 14': 'LEI-8078-1990|corpo|art. 14',
  'LEI-13105-2015|art. 85': 'LEI-13105-2015|corpo|art. 85',
  'LEI-13105-2015|art. 85, § 2º': 'LEI-13105-2015|corpo|art. 85, § 2º'
};
const NOS = [
  { id: 'STJ-SUMULA-479', rotulo: 'Súmula 479 do STJ', ref: 'Súmula 479', tribunal: 'STJ' },
  { id: 'STF-SUMULA-339', rotulo: 'Súmula 339 do STF', ref: 'Súmula 339', tribunal: 'STF' },
  { id: 'STF-SUMULA-VINCULANTE-10', rotulo: 'Súmula Vinculante 10 do STF', ref: 'SV 10', tribunal: 'STF' },
  { id: 'STJ-TEMA-1076', rotulo: 'Tema 1076 do STJ', ref: '', tribunal: 'STJ' },
  { id: 'STF-ADI-4357', rotulo: 'ADI 4357', ref: '', tribunal: 'STF' }
];

const banco: BancoDeCitacoes = {
  async dispositivoId(normaId, rotulo) {
    return DISPOSITIVOS[`${normaId}|${rotulo}`] ?? null;
  },
  async sumulas(tribunais, referencias) {
    return NOS.filter(n => tribunais.includes(n.tribunal as 'STF' | 'STJ') && referencias.includes(n.ref)).map(({ id, rotulo }) => ({ id, rotulo }));
  },
  async nosPorId(ids) {
    return NOS.filter(n => ids.includes(n.id)).map(({ id, rotulo }) => ({ id, rotulo }));
  }
};

const um = async (c: string) => (await verificarCitacoes([c], NORMAS, banco)).get(c);

describe('Argumenta F5-04: verificação das citações no banco', () => {
  it('artigo que existe vira "encontrada" com link para o NormaViva', async () => {
    const v = await um('CDC, art. 14');
    assert.equal(v?.estado, 'encontrada');
    assert.equal(v?.links[0].href, '/normaviva?d=LEI-8078-1990%7Ccorpo%7Cart.+14');
  });

  it('artigo que não existe na norma vira "não localizada", sem dizer que a citação é falsa', async () => {
    const v = await um('art. 9999 do CDC');
    assert.equal(v?.estado, 'nao_localizada');
    assert.match(v?.aviso ?? '', /não quer dizer que ela esteja errada/);
  });

  it('detalhe conferido abre o dispositivo detalhado; detalhe ausente avisa e abre o artigo', async () => {
    assert.match((await um('art. 85, § 2º, do CPC'))?.links[0].href ?? '', /%C2%A7\+2%C2%BA|§/);
    const sem = await um('art. 85, § 9º, do CPC');
    assert.equal(sem?.estado, 'encontrada');
    assert.match(sem?.aviso ?? '', /não foi conferido/);
  });

  it('lei da base é encontrada; lei fora da base é "fora", não "não localizada"', async () => {
    assert.equal((await um('Lei 14.133/2021'))?.estado, 'encontrada');
    assert.equal((await um('Lei 8.666/1993'))?.estado, 'fora_do_corpus');
  });

  it('súmula: acha pelo tribunal, acha sem tribunal e não acha o que não existe', async () => {
    assert.equal((await um('Súmula 479 do STJ'))?.estado, 'encontrada');
    assert.equal((await um('Súmula 479'))?.links.length, 1);
    assert.equal((await um('Súmula 479 do STF'))?.estado, 'nao_localizada');
    assert.equal((await um('Súmula Vinculante 10'))?.estado, 'encontrada');
    assert.equal((await um('Súmula 9999 do STJ'))?.estado, 'nao_localizada');
  });

  it('tema pelo identificador do nó', async () => {
    assert.equal((await um('Tema 1.076 do STJ'))?.links[0].href, '/tesemap?n=STJ-TEMA-1076');
    assert.equal((await um('Tema 5 do STJ'))?.estado, 'nao_localizada');
  });

  it('ação de controle concentrado ausente é "fora da base" (só há as com mérito)', async () => {
    assert.equal((await um('ADI 4.357'))?.estado, 'encontrada');
    const ausente = await um('ADI 1');
    assert.equal(ausente?.estado, 'fora_do_corpus');
    assert.match(ausente?.aviso ?? '', /mérito julgado/);
  });

  it('norma ou tribunal que a base não cobre vira "fora da base"', async () => {
    assert.equal((await um('Súmula 331 do TST'))?.estado, 'fora_do_corpus');
  });

  it('o que não é citação reconhecível fica sem selo', async () => {
    const r = await verificarCitacoes(['Nelson Nery Jr.', 'REsp 1.234.567/SP', '', 'art. 14'], NORMAS, banco);
    assert.equal(r.size, 0);
  });

  it('falha na leitura do banco deixa a citação sem selo, sem derrubar as outras', async () => {
    const quebrado: BancoDeCitacoes = {
      ...banco,
      async dispositivoId() {
        throw new Error('rede');
      }
    };
    const r = await verificarCitacoes(['CDC, art. 14', 'Súmula 479 do STJ'], NORMAS, quebrado);
    assert.equal(r.has('CDC, art. 14'), false);
    assert.equal(r.get('Súmula 479 do STJ')?.estado, 'encontrada');
  });

  it('citações repetidas são conferidas uma vez e o total é limitado', async () => {
    let chamadas = 0;
    const contador: BancoDeCitacoes = { ...banco, async sumulas(t, r) { chamadas++; return banco.sumulas(t, r); } };
    await verificarCitacoes(['Súmula 479 do STJ', ' Súmula 479 do STJ '], NORMAS, contador);
    assert.equal(chamadas, 1);
    const muitas = Array.from({ length: 200 }, (_, i) => `Súmula ${i + 1} do STJ`);
    chamadas = 0;
    await verificarCitacoes(muitas, NORMAS, contador);
    assert.equal(chamadas, 60);
  });
});
