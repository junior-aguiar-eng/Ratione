import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  carregarDetalhe,
  emLotes,
  IDS_POR_CONSULTA,
  mesclarComSinonimos,
  type Dispositivo,
  type Norma,
  type Relacao
} from './normaviva';

describe('Consulta em lotes (F3-05: o .in() vai na URL)', () => {
  it('parte os ids em lotes, junta as linhas na ordem e nenhuma consulta passa do tamanho', async () => {
    const ids = Array.from({ length: 200 }, (_, i) => `D${i}`);
    const tamanhos: number[] = [];
    const r = await emLotes<string>(ids, async lote => (tamanhos.push(lote.length), { data: lote, error: null }), 80);
    assert.deepEqual(tamanhos, [80, 80, 40]);
    assert.deepEqual(r.data, ids);
    assert.equal(r.error, null);
  });

  it('o maior artigo do corpus (~700 ids) cabe em consultas com URL bem abaixo de 8 KB', async () => {
    const ids = Array.from({ length: 700 }, (_, i) => `LEI-14133-2021-D${String(i).padStart(5, '0')}`);
    let maior = 0;
    await emLotes<string>(ids, async lote => ((maior = Math.max(maior, lote.join(',').length)), { data: [], error: null }));
    assert.ok(maior < 4000, `maior lista de ids: ${maior} caracteres`);
    assert.ok(IDS_POR_CONSULTA <= 100);
  });

  it('sem ids não consulta nada; erro de um lote é devolvido', async () => {
    let chamadas = 0;
    assert.deepEqual(await emLotes<string>([], async () => (chamadas++, { data: [], error: null })), { data: [], error: null });
    assert.equal(chamadas, 0);
    const r = await emLotes<string>(['a', 'b', 'c'], async lote => (lote[0] === 'c' ? { data: null, error: { message: 'falhou' } } : { data: lote, error: null }), 2);
    assert.equal(r.error?.message, 'falhou');
  });
});

describe('Resultados por sinônimo na busca por assunto (F3-05)', () => {
  const r = (id: string) => ({ id, norma_id: 'N', rotulo: `art. ${id}`, trecho: id });

  it('a pesquisa original vem inteira, na sua ordem, e sem marca', () => {
    const m = mesclarComSinonimos([r('1'), r('2')], [{ termo: 'locação', itens: [r('9')] }]);
    assert.deepEqual(m.map(x => x.id), ['1', '2', '9']);
    assert.equal(m[0].via_sinonimo, undefined);
    assert.equal(m[2].via_sinonimo, 'locação');
  });

  it('não repete dispositivo e alterna entre as alternativas', () => {
    const m = mesclarComSinonimos([r('1')], [
      { termo: 'a', itens: [r('1'), r('2'), r('3')] },
      { termo: 'b', itens: [r('4'), r('2')] }
    ]);
    assert.deepEqual(m.map(x => [x.id, x.via_sinonimo]), [['1', undefined], ['2', 'a'], ['4', 'b'], ['3', 'a']]);
  });

  it('o total respeita o limite, e o original nunca perde lugar para sinônimo', () => {
    const principal = Array.from({ length: 5 }, (_, i) => r(`p${i}`));
    const m = mesclarComSinonimos(principal, [{ termo: 'x', itens: [r('s1'), r('s2')] }], 6);
    assert.deepEqual(m.map(x => x.id), ['p0', 'p1', 'p2', 'p3', 'p4', 's1']);
  });
});

const NORMA_TESTE: Norma = {
  id: 'LEI-14133-2021',
  nome: 'Lei nº 14.133/2021',
  fonte_url: 'https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14133.htm',
  fonte_tipo_pagina: 'compilada',
  fonte_sha256: 'abc',
  lido_em: '2026-11-01',
  publicacao: '2021-04-01'
};

function criarDispositivo(ordem: number, rotulo: string, tipo = 'inciso'): Dispositivo {
  return {
    id: `${NORMA_TESTE.id}|corpo|${rotulo}`,
    norma_id: NORMA_TESTE.id,
    escopo: 'corpo',
    rotulo,
    tipo,
    numero: String(ordem),
    ordem,
    texto: `Texto de ${rotulo}`,
    continuacao: '',
    revogado: false,
    estrutura: []
  };
}

function criarDbFalso(opcoes: {
  dispositivos: Dispositivo[];
  relacoes?: Relacao[];
  erroNaPagina?: (inicio: number, fim: number) => { message: string; code?: string } | null;
}) {
  const paginasSolicitadas: Array<[number, number]> = [];
  const ordensSolicitadas: string[][] = [];
  const lotesRelacoes: number[] = [];

  function consulta(tabela: string) {
    const filtrosEq: Array<[string, unknown]> = [];
    const filtrosGte: Array<[string, number]> = [];
    const filtrosIn: Array<[string, unknown[]]> = [];
    const ordenacoes: string[] = [];
    let limite: number | null = null;
    let intervalo: [number, number] | null = null;
    let unico = false;

    function executar() {
      if (tabela === 'versoes_dispositivo') {
        return { data: [], error: null };
      }
      if (tabela === 'dispositivos' && intervalo) {
        paginasSolicitadas.push(intervalo);
        ordensSolicitadas.push([...ordenacoes]);
        const erro = opcoes.erroNaPagina?.(intervalo[0], intervalo[1]);
        if (erro) return { data: null, error: erro };
      }
      if (tabela === 'relacoes') {
        const filtroOrigem = filtrosIn.find(([col]) => col === 'origem_id');
        if (filtroOrigem) lotesRelacoes.push(filtroOrigem[1].length);
      }

      const base = tabela === 'dispositivos' ? opcoes.dispositivos : (opcoes.relacoes ?? []);
      let linhas = base.filter(item => {
        const reg = item as unknown as Record<string, unknown>;
        return (
          filtrosEq.every(([c, v]) => reg[c] === v) &&
          filtrosGte.every(([c, v]) => Number(reg[c]) >= v) &&
          filtrosIn.every(([c, vs]) => vs.includes(reg[c]))
        );
      });

      if (ordenacoes.length > 0) {
        // Sem desempate explícito por `id`, consultas paginadas no Postgres podem devolver empates em ordem diferente entre páginas
        const desempateInstavel = tabela === 'dispositivos' && intervalo !== null && !ordenacoes.includes('id');
        const inverterEmpate = desempateInstavel && paginasSolicitadas.length % 2 === 0;
        linhas = [...linhas].sort((a, b) => {
          const regA = a as unknown as Record<string, unknown>;
          const regB = b as unknown as Record<string, unknown>;
          for (const col of ordenacoes) {
            const va = regA[col];
            const vb = regB[col];
            const cmp =
              typeof va === 'number' && typeof vb === 'number'
                ? va - vb
                : String(va) < String(vb)
                  ? -1
                  : String(va) > String(vb)
                    ? 1
                    : 0;
            if (cmp !== 0) return cmp;
          }
          if (desempateInstavel) {
            const idA = String(regA.id);
            const idB = String(regB.id);
            const cmpId = idA < idB ? -1 : idA > idB ? 1 : 0;
            return inverterEmpate ? -cmpId : cmpId;
          }
          return 0;
        });
      }
      if (intervalo) linhas = linhas.slice(intervalo[0], intervalo[1] + 1);
      if (limite !== null) linhas = linhas.slice(0, limite);
      if (unico) {
        return linhas[0]
          ? { data: linhas[0], error: null }
          : { data: null, error: { message: 'dispositivo não encontrado' } };
      }
      return { data: linhas, error: null };
    }

    const cadeia = {
      select: () => cadeia,
      eq: (col: string, val: unknown) => (filtrosEq.push([col, val]), cadeia),
      gte: (col: string, val: number) => (filtrosGte.push([col, val]), cadeia),
      in: (col: string, vals: unknown[]) => (filtrosIn.push([col, vals]), cadeia),
      order: (col: string) => (ordenacoes.push(col), cadeia),
      limit: (n: number) => ((limite = n), cadeia),
      range: (inicio: number, fim: number) => ((intervalo = [inicio, fim]), cadeia),
      single: () => ((unico = true), cadeia),
      then: (ok?: (r: unknown) => unknown, err?: (e: unknown) => unknown) => Promise.resolve(executar()).then(ok, err)
    };
    return cadeia;
  }

  return {
    db: { from: consulta } as unknown as SupabaseClient,
    paginasSolicitadas,
    ordensSolicitadas,
    lotesRelacoes
  };
}

describe('carregarDetalhe: paginação de subdispositivos', () => {
  it('carrega artigo com 700 subdispositivos em 2 páginas e para antes do próximo artigo', async () => {
    const dispositivos: Dispositivo[] = [
      criarDispositivo(1, 'art. 6º', 'artigo'),
      ...Array.from({ length: 700 }, (_, i) => criarDispositivo(i + 2, `art. 6º, ${i + 1}`, 'inciso')),
      criarDispositivo(702, 'art. 7º', 'artigo'),
      criarDispositivo(703, 'art. 7º, I', 'inciso')
    ];
    const relacoes: Relacao[] = [
      {
        id: 1,
        origem_id: dispositivos[700].id,
        tipo: 'remete',
        destino_id: null,
        destino_norma_id: null,
        destino_rotulo: 'art. 7º',
        destino_ato: null,
        destino_texto: null,
        trecho: null,
        escopo: 'mesma'
      }
    ];
    const { db, paginasSolicitadas, lotesRelacoes } = criarDbFalso({ dispositivos, relacoes });

    const detalhe = await carregarDetalhe(db, dispositivos[0].id, [NORMA_TESTE]);

    assert.equal(detalhe.texto.length, 701);
    assert.equal(detalhe.texto[0].rotulo, 'art. 6º');
    assert.equal(detalhe.texto[700].rotulo, 'art. 6º, 700');
    assert.deepEqual(paginasSolicitadas, [
      [0, 499],
      [500, 999]
    ]);
    assert.equal(detalhe.relacoes.length, 1);
    assert.equal(detalhe.relacoes[0].origem_id, dispositivos[700].id);
    assert.ok(lotesRelacoes.length > 0 && lotesRelacoes.every(t => t <= IDS_POR_CONSULTA));
    assert.equal(
      lotesRelacoes.reduce((acc, n) => acc + n, 0),
      701
    );
  });

  it('para na fronteira de irmão do mesmo nível ou nível superior e não busca página extra após encontrar fronteira', async () => {
    const dispositivos: Dispositivo[] = [
      criarDispositivo(1, 'art. 6º, § 1º', 'paragrafo'),
      ...Array.from({ length: 520 }, (_, i) => criarDispositivo(i + 2, `art. 6º, § 1º, ${i + 1}`, 'inciso')),
      criarDispositivo(522, 'art. 6º, § 2º', 'paragrafo'),
      ...Array.from({ length: 600 }, (_, i) => criarDispositivo(523 + i, `art. 6º, § 2º, ${i + 1}`, 'inciso'))
    ];
    const { db, paginasSolicitadas } = criarDbFalso({ dispositivos });

    const detalhe = await carregarDetalhe(db, dispositivos[0].id, [NORMA_TESTE]);

    assert.equal(detalhe.texto.length, 521);
    assert.equal(detalhe.texto[detalhe.texto.length - 1].rotulo, 'art. 6º, § 1º, 520');
    assert.deepEqual(paginasSolicitadas, [
      [0, 499],
      [500, 999]
    ]);

    const dispositivosNivelSuperior: Dispositivo[] = [
      criarDispositivo(1, 'art. 6º, § 1º, I', 'inciso'),
      criarDispositivo(2, 'art. 6º, § 1º, I, a', 'alinea'),
      criarDispositivo(3, 'art. 6º, § 2º', 'paragrafo')
    ];
    const casoSuperior = criarDbFalso({ dispositivos: dispositivosNivelSuperior });
    const detalheSuperior = await carregarDetalhe(casoSuperior.db, dispositivosNivelSuperior[0].id, [NORMA_TESTE]);
    assert.deepEqual(
      detalheSuperior.texto.map(d => d.rotulo),
      ['art. 6º, § 1º, I', 'art. 6º, § 1º, I, a']
    );
    assert.deepEqual(casoSuperior.paginasSolicitadas, [[0, 499]]);
  });

  it('encerra corretamente quando o fim da norma coincide com página exata de 500 itens', async () => {
    const dispositivos: Dispositivo[] = [
      criarDispositivo(1, 'art. 6º', 'artigo'),
      ...Array.from({ length: 499 }, (_, i) => criarDispositivo(i + 2, `art. 6º, ${i + 1}`, 'inciso'))
    ];
    const { db, paginasSolicitadas } = criarDbFalso({ dispositivos });

    const detalhe = await carregarDetalhe(db, dispositivos[0].id, [NORMA_TESTE]);

    assert.equal(detalhe.texto.length, 500);
    assert.deepEqual(paginasSolicitadas, [
      [0, 499],
      [500, 999]
    ]);
  });

  it('para imediatamente na primeira página quando encontra próximo artigo antes de 500 itens', async () => {
    const dispositivos: Dispositivo[] = [
      criarDispositivo(1, 'art. 6º', 'artigo'),
      criarDispositivo(2, 'art. 6º, I', 'inciso'),
      criarDispositivo(3, 'art. 6º, II', 'inciso'),
      criarDispositivo(4, 'art. 7º', 'artigo'),
      ...Array.from({ length: 600 }, (_, i) => criarDispositivo(5 + i, `art. 7º, ${i + 1}`, 'inciso'))
    ];
    const { db, paginasSolicitadas } = criarDbFalso({ dispositivos });

    const detalhe = await carregarDetalhe(db, dispositivos[0].id, [NORMA_TESTE]);

    assert.equal(detalhe.texto.length, 3);
    assert.deepEqual(paginasSolicitadas, [[0, 499]]);
  });

  it('respeita o teto máximo seguro de 2000 itens sem entrar em loop infinito', async () => {
    const dispositivos: Dispositivo[] = [
      criarDispositivo(1, 'art. 6º', 'artigo'),
      ...Array.from({ length: 2200 }, (_, i) => criarDispositivo(i + 2, `art. 6º, ${i + 1}`, 'inciso'))
    ];
    const { db, paginasSolicitadas } = criarDbFalso({ dispositivos });

    const detalhe = await carregarDetalhe(db, dispositivos[0].id, [NORMA_TESTE]);

    assert.equal(detalhe.texto.length, 2000);
    assert.deepEqual(paginasSolicitadas, [
      [0, 499],
      [500, 999],
      [1000, 1499],
      [1500, 1999]
    ]);
  });

  it('propaga erro se alguma página falhar', async () => {
    const dispositivos: Dispositivo[] = [
      criarDispositivo(1, 'art. 6º', 'artigo'),
      ...Array.from({ length: 600 }, (_, i) => criarDispositivo(i + 2, `art. 6º, ${i + 1}`, 'inciso'))
    ];
    const { db } = criarDbFalso({
      dispositivos,
      erroNaPagina: inicio => (inicio === 500 ? { message: 'timeout' } : null)
    });

    await assert.rejects(() => carregarDetalhe(db, dispositivos[0].id, [NORMA_TESTE]), /ler o texto do dispositivo: timeout/);
  });

  it('mantém paginação determinística entre fronteiras de página quando há empate em ordem', async () => {
    const empatados = Array.from({ length: 10 }, (_, i) =>
      criarDispositivo(497, `art. 6º, empate-${String(i + 1).padStart(2, '0')}`, 'inciso')
    ).reverse();
    const dispositivos: Dispositivo[] = [
      criarDispositivo(1, 'art. 6º', 'artigo'),
      ...Array.from({ length: 495 }, (_, i) => criarDispositivo(i + 2, `art. 6º, ${i + 1}`, 'inciso')),
      ...empatados,
      criarDispositivo(498, 'art. 7º', 'artigo')
    ];
    const { db, paginasSolicitadas, ordensSolicitadas } = criarDbFalso({ dispositivos });

    const detalhe = await carregarDetalhe(db, dispositivos[0].id, [NORMA_TESTE]);
    const ids = detalhe.texto.map(d => d.id);
    const idsEmpatadosEsperados = Array.from(
      { length: 10 },
      (_, i) => `${NORMA_TESTE.id}|corpo|art. 6º, empate-${String(i + 1).padStart(2, '0')}`
    );

    assert.equal(detalhe.texto.length, 506);
    assert.equal(new Set(ids).size, 506);
    assert.deepEqual(ids.slice(496), idsEmpatadosEsperados);
    assert.deepEqual(paginasSolicitadas, [
      [0, 499],
      [500, 999]
    ]);
    assert.deepEqual(ordensSolicitadas, [
      ['ordem', 'id'],
      ['ordem', 'id']
    ]);
  });
});
