import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { atosDoPrazoZero, buscaValida, buscarEmTudo, ferramentaMaisProvavel, limparBusca, ordenar, urlComBusca, LIMITE_POR_FERRAMENTA, type GrupoDaBusca } from './buscaUnica';
import { lerBusca } from './parametrosSalvos';

const grupo = (ferramenta: GrupoDaBusca['ferramenta'], n: number, indisponivel = false): GrupoDaBusca => ({
  ferramenta,
  titulo: ferramenta,
  itens: Array.from({ length: n }, (_, i) => ({ rotulo: `${ferramenta}${i}`, detalhe: '', href: '/' })),
  temMais: false,
  verTodos: '/',
  indisponivel
});

describe('Busca única: texto da pesquisa', () => {
  it('limpa espaços e limita o tamanho; menos de 2 caracteres não é pesquisa', () => {
    assert.equal(limparBusca('  art.   85  CPC '), 'art. 85 CPC');
    assert.equal(limparBusca('x'.repeat(200)).length, 80);
    assert.equal(buscaValida(' a '), false);
    assert.equal(buscaValida('ab'), true);
  });

  it('o endereço de cada ferramenta leva só a pesquisa já limpa', () => {
    assert.equal(urlComBusca('normaviva', '  art. 85 '), '/normaviva?q=art.+85');
    assert.equal(urlComBusca('tesemap', 'Tema 1076'), '/tesemap?q=Tema+1076');
  });

  it('as ferramentas leem ?q= da URL, limpo e limitado', () => {
    assert.equal(lerBusca('?q=art.+85+CPC'), 'art. 85 CPC');
    assert.equal(lerBusca('?q=' + 'a'.repeat(200)).length, 80);
    assert.equal(lerBusca('?d=x'), '');
    assert.equal(lerBusca('?q=a'), '');
  });
});

describe('Busca única: atos do PrazoZero', () => {
  it('acha pelo nome, sem acento nem caixa, e abre o cálculo com o ato escolhido', () => {
    const r = atosDoPrazoZero('APELACAO');
    assert.equal(r[0].rotulo, 'Apelação');
    assert.equal(r[0].href, '/prazozero?ato=apelacao');
    assert.match(r[0].detalhe, /15 dias · CPC, arts\. 1\.009/);
  });

  it('exige todas as palavras, e também acha pela base legal', () => {
    assert.ok(atosDoPrazoZero('agravo interno').every(i => /interno/i.test(i.rotulo)));
    assert.ok(atosDoPrazoZero('art. 1.023').some(i => i.rotulo === 'Embargos de declaração'));
    assert.deepEqual(atosDoPrazoZero('zzzxxx'), []);
    assert.deepEqual(atosDoPrazoZero('a'), []);
  });
});

describe('Busca única: ordem dos grupos', () => {
  it('pela forma da pesquisa', () => {
    assert.equal(ferramentaMaisProvavel('Tema 1076'), 'tesemap');
    assert.equal(ferramentaMaisProvavel('Súmula 7 do STJ'), 'tesemap');
    assert.equal(ferramentaMaisProvavel('art. 85 CPC'), 'normaviva');
    assert.equal(ferramentaMaisProvavel('prazo da apelação'), 'prazozero');
    assert.equal(ferramentaMaisProvavel('honorários'), null);
  });

  it('com resultado antes de vazio, vazio antes de indisponível, e a ferramenta provável na frente entre iguais', () => {
    const g = [grupo('normaviva', 0), grupo('tesemap', 3), grupo('prazozero', 2)];
    assert.deepEqual(ordenar('honorários', g).map(x => x.ferramenta), ['tesemap', 'prazozero', 'normaviva']);
    assert.deepEqual(ordenar('apelação', g).map(x => x.ferramenta), ['prazozero', 'tesemap', 'normaviva']);
    const q = [grupo('normaviva', 0, true), grupo('tesemap', 0), grupo('prazozero', 0)];
    assert.deepEqual(ordenar('x1', q).map(x => x.ferramenta), ['tesemap', 'prazozero', 'normaviva']);
  });
});

describe('Busca única: as três bases', () => {
  it('sem banco, o PrazoZero responde e as outras duas voltam como indisponíveis', async () => {
    const r = await buscarEmTudo(null, 'apelação');
    assert.equal(r[0].ferramenta, 'prazozero');
    assert.ok(r[0].itens.length > 0 && r[0].itens.length <= LIMITE_POR_FERRAMENTA);
    assert.deepEqual(r.filter(g => g.indisponivel).map(g => g.ferramenta).sort(), ['normaviva', 'tesemap']);
  });

  it('pesquisa curta não consulta nada', async () => {
    assert.deepEqual(await buscarEmTudo(null, ' a '), []);
  });

  it('uma base que falha não derruba a outra', async () => {
    const db = {
      from: () => ({ select: () => ({ order: async () => ({ data: null, error: { message: 'fora do ar' } }) }) }),
      rpc: async (nome: string) =>
        nome === 'tesemap_buscar'
          ? { data: [{ id: 'STJ-TEMA-1076', rotulo: 'Tema 1076 do STJ', tribunal: 'STJ', tipo: 'tema', descricao: 'Tese sobre honorários.' }], error: null }
          : { data: [], error: null }
    } as never;
    const r = await buscarEmTudo(db, 'Tema 1076');
    const tese = r.find(g => g.ferramenta === 'tesemap')!;
    assert.deepEqual(tese.itens, [{ rotulo: 'Tema 1076 do STJ', detalhe: 'STJ · Tese sobre honorários.', href: '/tesemap?n=STJ-TEMA-1076' }]);
    assert.equal(r.find(g => g.ferramenta === 'normaviva')!.indisponivel, true);
    assert.equal(r[0].ferramenta, 'tesemap');
  });
});
