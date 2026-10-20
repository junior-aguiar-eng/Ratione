import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { SupabaseClient } from '@supabase/supabase-js';
import { lerVersoes, ordenarVersoes, type Versao } from './normaviva';
import { situacaoEm } from './normavivaApresentacao';
import { diffPalavras } from './diffTexto';
import { linhaDoTempo } from './linhaDoTempo';

const dc = (iso: string) => iso.split('-').reverse().join('/');
const base = (p: Partial<Versao>): Versao => ({
  texto: 't',
  origem: 'redacao_dada',
  ato_chave: null,
  ato_rotulo: null,
  ato_publicacao: null,
  ano_do_ato: null,
  fonte_da_data: null,
  vigente_de: null,
  vigencia_confirmada: false,
  texto_anterior_disponivel: false,
  hash: 'a'.repeat(64),
  ...p
});

// LINDB art. 6º: redação original (1942) até a Lei 3.238, publicada em 03/08/1957
const atual = base({ texto: 'A Lei em vigor terá efeito imediato…', ato_rotulo: 'Lei nº 3.238 de 01/08/1957', vigente_de: '1957-08-03', texto_anterior_disponivel: true, hash: 'b'.repeat(64) });
const original = base({
  texto: 'A lei em vigor terá efeito imediato e geral…',
  origem: 'redacao_original',
  vigente_de: '1942-09-04',
  vigente_ate: '1957-08-02',
  fonte_do_texto: 'tachado_planalto',
  conferida_por: null,
  conferida_em: null
});
const versoes = [atual, original];

describe('Consulta temporal com várias redações (F3-04)', () => {
  it('a partir da publicação do ato atual vale a redação atual', () => {
    assert.equal(situacaoEm(versoes, '1957-08-03', dc)?.tipo, 'redacao_atual');
    assert.equal(situacaoEm(versoes, '2026-10-21', dc)?.tipo, 'redacao_atual');
  });

  it('na véspera, vale a redação anterior, com texto da época, datas provisórias e aviso de não conferida', () => {
    const s = situacaoEm(versoes, '1957-08-02', dc);
    assert.equal(s?.tipo, 'texto_da_epoca');
    assert.ok(s?.tipo === 'texto_da_epoca');
    assert.equal(s.versao.texto, original.texto);
    assert.equal(s.conferida, false);
    const t = s.avisos.join(' ');
    assert.match(t, /até 02\/08\/1957/);
    assert.match(t, /Lei nº 3\.238/);
    assert.match(t, /04\/09\/1942 \(publicação da norma\)/);
    assert.match(t, /vacatio legis/);
    assert.match(t, /ainda não foi conferido/);
  });

  it('a redação anterior conferida diz por quem e quando', () => {
    const conferido = [atual, { ...original, conferida_por: 'Revisor', conferida_em: '2026-11-03' }];
    const s = situacaoEm(conferido, '1950-01-01', dc);
    assert.ok(s?.tipo === 'texto_da_epoca' && s.conferida);
    assert.match(s.avisos.join(' '), /conferido por Revisor em 03\/11\/2026/);
    assert.doesNotMatch(s.avisos.join(' '), /ainda não foi conferido/);
  });

  it('antes da publicação da norma não há texto', () => {
    const s = situacaoEm(versoes, '1940-01-01', dc);
    assert.equal(s?.tipo, 'texto_da_epoca_indisponivel');
    assert.ok(s?.tipo === 'texto_da_epoca_indisponivel');
    assert.match(s.aviso, /04\/09\/1942/);
  });

  it('antes do começo conhecido de uma redação que não é a original, a base diz que o texto era outro e não o tem', () => {
    const emenda2019 = { ...atual, vigente_de: '2019-11-13', ato_rotulo: 'Emenda Constitucional nº 103 de 12/11/2019' };
    const incluida = { ...original, origem: 'incluido' as const, vigente_de: '2004-12-31', vigente_ate: '2019-11-12', ato_rotulo: 'Emenda Constitucional nº 45 de 08/12/2004' };
    const s = situacaoEm([emenda2019, incluida], '2000-01-01', dc);
    assert.ok(s?.tipo === 'texto_da_epoca_indisponivel');
    assert.match(s.aviso, /31\/12\/2004/);
    assert.match(s.aviso, /não está na base/);
  });

  it('redação anterior sem início conhecido cobre qualquer data até o fim, avisando que o início é desconhecido', () => {
    const semInicio = { ...original, vigente_de: null, ano_do_ato: null };
    const s = situacaoEm([atual, semInicio], '1900-01-01', dc);
    assert.ok(s?.tipo === 'texto_da_epoca');
    assert.match(s.avisos.join(' '), /início desta redação não é conhecido/);
  });

  it('só o ano do ato: a redação anterior começa em 1º de janeiro daquele ano', () => {
    const emenda2019 = { ...atual, vigente_de: '2019-11-13' };
    const soAno = { ...original, origem: 'incluido' as const, vigente_de: null, ano_do_ato: 2004, vigente_ate: '2019-11-12' };
    assert.equal(situacaoEm([emenda2019, soAno], '2003-12-31', dc)?.tipo, 'texto_da_epoca_indisponivel');
    assert.equal(situacaoEm([emenda2019, soAno], '2004-01-01', dc)?.tipo, 'texto_da_epoca');
  });

  it('sem redação anterior, o comportamento de sempre: texto da época indisponível, nunca a redação atual', () => {
    const s = situacaoEm([atual], '1950-01-01', dc);
    assert.equal(s?.tipo, 'texto_da_epoca_indisponivel');
    assert.equal(situacaoEm([], '2026-01-01', dc), null);
  });

  it('as redações saem ordenadas: a vigente primeiro, depois as anteriores da mais recente para a mais antiga', () => {
    const meio = { ...original, vigente_de: '1980-01-01', vigente_ate: '1999-12-31', hash: 'c'.repeat(64) };
    const ordem = ordenarVersoes([original, meio, atual]).map(v => v.vigente_ate ?? 'vigente');
    assert.deepEqual(ordem, ['vigente', '1999-12-31', '1957-08-02']);
  });
});

describe('Diferença entre as redações', () => {
  const junta = (t: ReturnType<typeof diffPalavras>, tipo: string) => t.filter(x => x.tipo === tipo).map(x => x.texto.trim()).filter(Boolean);

  it('textos iguais: um trecho só, igual', () => {
    assert.deepEqual(diffPalavras('a lei vale', 'a lei vale'), [{ tipo: 'igual', texto: 'a lei vale' }]);
  });

  it('troca de palavra: sai uma, entra outra, o resto fica', () => {
    const d = diffPalavras('Os juízes deverão obedecer à ordem cronológica', 'Os juízes atenderão, preferencialmente, à ordem cronológica');
    assert.deepEqual(junta(d, 'removido'), ['deverão obedecer']);
    assert.deepEqual(junta(d, 'inserido'), ['atenderão, preferencialmente,']);
    assert.ok(d[0].tipo === 'igual' && d[0].texto.startsWith('Os juízes'));
  });

  it('acréscimo e supressão', () => {
    assert.deepEqual(junta(diffPalavras('pena de multa', 'pena de multa e prisão'), 'inserido'), ['e prisão']);
    assert.deepEqual(junta(diffPalavras('pena de multa e prisão', 'pena de multa'), 'removido'), ['e prisão']);
  });

  it('reconstrói os dois textos: juntando igual+removido dá o antes; igual+inserido, o depois', () => {
    const antes = 'A decretação da falência suspende o curso da prescrição e de todas as ações e execuções.';
    const depois = 'A decretação da falência ou o deferimento da recuperação judicial implica a suspensão do curso da prescrição.';
    const d = diffPalavras(antes, depois);
    assert.equal(d.filter(x => x.tipo !== 'inserido').map(x => x.texto).join(''), antes);
    assert.equal(d.filter(x => x.tipo !== 'removido').map(x => x.texto).join(''), depois);
  });

  it('texto vazio de um dos lados: tudo removido ou tudo inserido', () => {
    assert.deepEqual(diffPalavras('', 'novo'), [{ tipo: 'inserido', texto: 'novo' }]);
    assert.deepEqual(diffPalavras('velho', ''), [{ tipo: 'removido', texto: 'velho' }]);
    assert.deepEqual(diffPalavras('', ''), []);
  });

  it('ordinais e parágrafos fazem parte da palavra (º não vira sinal solto)', () => {
    const d = diffPalavras('nos termos do § 1º do art. 5º', 'nos termos do § 2º do art. 5º');
    assert.deepEqual(junta(d, 'removido'), ['1º']);
    assert.deepEqual(junta(d, 'inserido'), ['2º']);
  });

  it('texto grande demais não trava: devolve tudo como trocado', () => {
    const grande = Array.from({ length: 2500 }, (_, i) => `w${i}`).join(' ');
    const outro = Array.from({ length: 2500 }, (_, i) => `x${i}`).join(' ');
    const d = diffPalavras(grande, outro);
    assert.deepEqual(d.map(x => x.tipo), ['removido', 'inserido']);
  });
});

describe('Linha do tempo', () => {
  it('da redação mais antiga para a atual, com período, ato e o estado da conferência', () => {
    const etapas = linhaDoTempo(versoes, dc);
    assert.deepEqual(etapas.map(e => e.titulo), ['Redação original', 'Redação atual']);
    assert.equal(etapas[0].periodo, 'de 04/09/1942 a 02/08/1957');
    assert.equal(etapas[1].periodo, 'desde 03/08/1957');
    assert.equal(etapas[1].ato, 'Redação dada por alteração: Lei nº 3.238 de 01/08/1957');
    assert.equal(etapas[0].conferida, false);
    assert.equal(etapas[1].conferida, null);
    assert.ok(etapas.every(e => e.provisoria));
  });

  it('uma redação só (a maioria dos dispositivos): só a atual', () => {
    assert.deepEqual(linhaDoTempo([atual], dc).map(e => e.titulo), ['Redação atual']);
  });

  it('anterior sem início: "até"; conferida no registro do revisor', () => {
    const e = linhaDoTempo([atual, { ...original, vigente_de: null, conferida_por: 'R', conferida_em: '2026-11-01' }], dc)[0];
    assert.equal(e.periodo, 'até 02/08/1957');
    assert.equal(e.conferida, true);
  });
});

describe('Leitura das redações no banco', () => {
  /** Cliente falso: a 1ª consulta (com as colunas novas) pode falhar como o PostgREST falha com coluna inexistente. */
  function falso(opcoes: { semColunasNovas: boolean; outroErro?: boolean }) {
    const consultas: string[] = [];
    const db = {
      from: () => ({
        select: (colunas: string) => {
          consultas.push(colunas.includes('vigente_ate') ? 'nova' : 'antiga');
          const resultado = () =>
            opcoes.outroErro
              ? { data: null, error: { message: 'falha de rede', code: '08006' } }
              : colunas.includes('vigente_ate')
                ? opcoes.semColunasNovas
                  ? { data: null, error: { message: 'column versoes_dispositivo.vigente_ate does not exist', code: '42703' } }
                  : { data: [original, atual], error: null }
                : { data: [atual], error: null };
          const cadeia = { eq: () => cadeia, limit: () => cadeia, then: (ok: (r: unknown) => unknown) => Promise.resolve(resultado()).then(ok) };
          return cadeia;
        }
      })
    } as unknown as SupabaseClient;
    return { db, consultas };
  }

  it('com as colunas novas, traz a vigente e a anterior, a vigente primeiro', async () => {
    const { db, consultas } = falso({ semColunasNovas: false });
    const v = await lerVersoes(db, 'x');
    assert.deepEqual(v.map(x => x.vigente_ate ?? null), [null, '1957-08-02']);
    assert.deepEqual(consultas, ['nova']);
  });

  it('banco sem as colunas novas (migração por aplicar): cai para a consulta antiga e a página segue no ar', async () => {
    const { db, consultas } = falso({ semColunasNovas: true });
    const v = await lerVersoes(db, 'x');
    assert.equal(v.length, 1);
    assert.deepEqual(consultas, ['nova', 'antiga']);
  });

  it('outro erro do banco não é engolido', async () => {
    const { db } = falso({ semColunasNovas: false, outroErro: true });
    await assert.rejects(lerVersoes(db, 'x'), /ler a versão: falha de rede/);
  });
});
