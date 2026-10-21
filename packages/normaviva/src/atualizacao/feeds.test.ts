import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { alertasDaLista, alertasDeAlteracoes, chavesDasNormas, executarFeeds, normasCitadas, type DocumentoDaLista, type DependenciasFeeds } from './feeds';
import type { AtoSenado, VideSenado } from '../coleta/conferir';

const IDS = ['CF-1988', 'DL-2848-1940', 'DL-5452-1943', 'LEI-10406-2002', 'LEI-9099-1995', 'LEI-13105-2015', 'DL-3689-1941'];
const chaves = chavesDasNormas(IDS);

const doc = (tipo: string, normaNome: string, dataassinatura: string, ementa: string): DocumentoDaLista => ({ tipo, normaNome, dataassinatura, ementa });

describe('Quais normas monitoradas uma ementa cita (F3-06)', () => {
  it('pelo número do ato, como o Senado escreve a ementa de uma lei que altera o Código Penal', () => {
    assert.deepEqual(normasCitadas('Altera o Decreto-Lei nº 2.848, de 7 de dezembro de 1940 (Código Penal), a fim de majorar as penas previstas para os crimes de furto.', chaves), ['DL-2848-1940']);
    assert.deepEqual(normasCitadas('Altera a Lei nº 9.099, de 26 de setembro de 1995, para dispor sobre embargos.', chaves), ['LEI-9099-1995']);
  });

  it('pelo nome por extenso e pela sigla, como nas ementas dos acórdãos do STF', () => {
    assert.deepEqual(normasCitadas('declarar a inconstitucionalidade da expressão constante do art. 790, § 3º, da CLT', chaves), ['DL-5452-1943']);
    assert.deepEqual(normasCitadas('Altera o Código Civil para dispor sobre a taxa legal de juros.', chaves), ['LEI-10406-2002']);
  });

  it('a sigla vale por palavra inteira: CPP não é CP, e "cpc" dentro de outra palavra não conta', () => {
    assert.deepEqual(normasCitadas('Altera o art. 341 do CPP.', chaves), ['DL-3689-1941']);
    assert.deepEqual(normasCitadas('Dispõe sobre o decreto de recuperação (ccpcx).', chaves), []);
  });

  it('ementa que não cita nenhuma das normas: nada', () => {
    assert.deepEqual(normasCitadas('Altera o Decreto nº 11.427, de 2 de março de 2023, que aprova a Estrutura Regimental do Ministério.', chaves), []);
  });
});

describe('Alertas da lista de atos recentes', () => {
  const docs = [
    doc('LEI-n', 'Lei nº 15.397 de 30/04/2026', '30/04/2026', 'Altera o Decreto-Lei nº 2.848, de 7 de dezembro de 1940 (Código Penal), a fim de majorar penas.'),
    doc('DEC-n', 'Decreto nº 13.139 de 16/10/2026', '16/10/2026', 'Altera a Lei nº 9.099, de 26 de setembro de 1995.'),
    doc('EMC-n', 'Emenda Constitucional nº 142 de 20/10/2026', '20/10/2026', 'Altera o Sistema Tributário Nacional.'),
    doc('ADCon', 'Acórdão da Ação Declaratória de Constitucionalidade nº 80 de 03/09/2026', '03/09/2026', 'interpretação conforme ao § 3º do art. 790 da CLT'),
    doc('LEI-n', 'Lei nº 15.526 de 29/09/2026', '29/09/2026', 'Altera a Lei nº 8.171, de 17 de janeiro de 1991.')
  ];

  it('só tipo relevante, dentro da janela e que cite uma norma monitorada; emenda constitucional vale sempre para a CF', () => {
    const a = alertasDaLista(docs, chaves, '2026-09-01');
    assert.deepEqual(a.map(x => [x.normaId, x.ato.slice(0, 22)]), [
      ['CF-1988', 'Emenda Constitucional '],
      ['DL-2848-1940', 'Lei nº 15.397 de 30/04'] ].slice(0, 0).concat([
      ['CF-1988', 'Emenda Constitucional '],
      ['DL-5452-1943', 'Acórdão da Ação Declar']
    ] as never));
  });

  it('a janela corta o que é mais antigo; o decreto nunca entra, mesmo citando a norma', () => {
    const a = alertasDaLista(docs, chaves, '2026-04-01');
    assert.ok(a.some(x => x.normaId === 'DL-2848-1940'), 'a lei de abril entra na janela larga');
    assert.ok(!a.some(x => x.ato.startsWith('Decreto')), 'decreto fora');
    assert.equal(alertasDaLista(docs, chaves, '2026-10-17').length, 1, 'só a EC de 20/10');
  });

  it('ato que o texto da norma no corpus já cita não gera alerta (o Planalto já o consolidou); acórdão, sem chave, segue', () => {
    const jaCitado = (normaId: string, chave: string) => normaId === 'CF-1988' && chave === 'emenda-constitucional:142:2026';
    const a = alertasDaLista(docs, chaves, '2026-09-01', jaCitado);
    assert.ok(!a.some(x => x.normaId === 'CF-1988'));
    assert.ok(a.some(x => x.normaId === 'DL-5452-1943'));
  });
});

describe('Alertas das alterações registradas no Senado', () => {
  const ato = (nome: string, publicacao: string): AtoSenado => ({ nome, assinatura: publicacao, publicacao });
  const noSenado = { 'lei:13256:2016': ato('Lei nº 13.256 de 04/02/2016', '2016-02-05'), 'lei:14976:2024': ato('Lei nº 14.976 de 18/09/2024', '2024-09-19') };

  it('ato que o Senado lista e o corpus não conhece vira alerta, com a data de publicação', () => {
    const a = alertasDeAlteracoes('LEI-13105-2015', noSenado, { 'lei:13256:2016': noSenado['lei:13256:2016'] });
    assert.equal(a.length, 1);
    assert.equal(a[0].ato, 'Lei nº 14.976 de 18/09/2024');
    assert.equal(a[0].data, '2024-09-19');
    assert.equal(a[0].fonte, 'alteracao_no_senado');
  });

  it('tudo conhecido: nada; e o que o corpus já cita no texto também não alerta', () => {
    assert.deepEqual(alertasDeAlteracoes('LEI-13105-2015', noSenado, noSenado), []);
    assert.deepEqual(alertasDeAlteracoes('LEI-13105-2015', noSenado, {}, (_id, chave) => chave === 'lei:14976:2024').map(x => x.ato), ['Lei nº 13.256 de 04/02/2016']);
  });
});

describe('Execução dos feeds', () => {
  const vide = (nome: string, pub: string): VideSenado => ({ nomeNormaPosterior: nome, comentario: 'Declaração de Alteração Permanente', datAssinatura: pub, datapub: pub });
  const base = (sobre: Partial<DependenciasFeeds> = {}): DependenciasFeeds => ({
    hoje: () => '2026-10-21',
    normas: () => ['LEI-13105-2015', 'DL-2848-1940'],
    conhecidos: () => ({ 'LEI-13105-2015': {}, 'DL-2848-1940': {} }),
    textoDaNorma: () => '',
    videsDaNorma: async () => [],
    listaDoAno: async () => [],
    ...sobre
  });

  it('junta os alertas das duas fontes', async () => {
    const r = await executarFeeds(
      base({
        videsDaNorma: async id => (id === 'LEI-13105-2015' ? [vide('Lei nº 14.976 de 18/09/2024', '18/09/2024')] : []),
        listaDoAno: async () => [doc('LEI-n', 'Lei nº 15.397 de 30/10/2026', '20/10/2026', 'Altera o Decreto-Lei nº 2.848, de 7 de dezembro de 1940 (Código Penal).')]
      })
    );
    assert.deepEqual(r.alertas.map(a => `${a.fonte}:${a.normaId}`).sort(), ['alteracao_no_senado:LEI-13105-2015', 'ato_recente:DL-2848-1940']);
    assert.deepEqual(r.erros, []);
  });

  it('falha numa norma ou num ano não derruba o resto e aparece em `erros`', async () => {
    const r = await executarFeeds(
      base({
        videsDaNorma: async id => {
          if (id === 'LEI-13105-2015') throw new Error('Senado respondeu HTTP 503');
          return [vide('Lei nº 15.000 de 01/10/2026', '01/10/2026')];
        },
        listaDoAno: async () => {
          throw new Error('timeout');
        }
      })
    );
    assert.equal(r.alertas.length, 1);
    assert.equal(r.alertas[0].normaId, 'DL-2848-1940');
    assert.ok(r.erros.some(e => /LEI-13105-2015: Senado respondeu HTTP 503/.test(e)));
    assert.ok(r.erros.some(e => /lista de 2026: timeout/.test(e)));
  });

  it('na virada do ano olha também a lista do ano anterior', async () => {
    const anos: number[] = [];
    await executarFeeds(base({ hoje: () => '2027-01-05', listaDoAno: async ano => (anos.push(ano), []) }));
    assert.deepEqual(anos.sort(), [2026, 2027]);
  });

  it('no meio do ano olha só a lista do ano corrente', async () => {
    const anos: number[] = [];
    await executarFeeds(base({ listaDoAno: async ano => (anos.push(ano), []) }));
    assert.deepEqual(anos, [2026]);
  });
});
