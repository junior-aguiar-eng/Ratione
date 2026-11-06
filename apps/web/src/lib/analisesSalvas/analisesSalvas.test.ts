import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import {
  abrirAnalise,
  analisesQueCitam,
  apagarAnalise,
  apagarTodasDoUsuario,
  listarAnalises,
  limparVencidas,
  salvarAnalise,
  type DependenciasDeAnalisesSalvas,
  type RegistroDeAnaliseSalva
} from './servico';
import { lerConfigDeAnalisesSalvas } from './config';
import { LIMITES_DE_ANALISE_SALVA, citacoesDosSelos, lerPrazo, limparRotulo, validarConteudo } from './validar';
import { cifrar } from '../documentos/cifra';

const CHAVE = randomBytes(32);
const AGORA = new Date('2026-11-06T12:00:00Z');
const DIA = 24 * 60 * 60 * 1000;

function conteudo(sobre: Record<string, unknown> = {}) {
  return {
    versao: 1,
    enviada: { paragrafos: ['Maria Silva ajuizou ação.', 'Julgo procedente.'], substituicoes: [{ original: 'Maria Silva', marcador: '[PARTE_1]' }], caracteres: 40 },
    resultados: {
      estrutura: { tipo: 'sentenca', resultado: 'Procedente', resumo: 'Resumo.', pedidos: [], secoes: [{ tipo: 'dispositivo', inicio: 1, fim: 2 }] },
      questoes: { questoes: [{ id: 'Q1', categoria: 'merito', enunciado: 'Cabe?', conclusao: 'Cabe.', resultado: 'acolhida', paragrafos: [1], paragrafosConclusao: [2] }] },
      fundamentos: { fundamentos: [{ questao: 'Q1', tipo: 'norma', descricao: 'Honorários', citacao: 'CPC, art. 85', paragrafos: [2] }] }
    },
    selos: [
      ['CPC, art. 85', { estado: 'encontrada', links: [{ rotulo: 'Abrir no NormaViva', href: '/normaviva?d=LEI-13105-2015%7Ccorpo%7Cart.+85' }] }],
      ['Tema 1076 do STJ', { estado: 'encontrada', links: [{ rotulo: 'Tema 1076 do STJ', href: '/tesemap?n=STJ-TEMA-1076' }] }],
      ['Lei X, art. 1', { estado: 'nao_localizada', links: [] }]
    ],
    ...sobre
  };
}

function simulacao(opcoes: { agora?: () => Date } = {}) {
  const arquivos = new Map<string, Buffer>();
  const linhas: RegistroDeAnaliseSalva[] = [];
  let seq = 0;
  const dep: DependenciasDeAnalisesSalvas = {
    chave: CHAVE,
    agora: opcoes.agora ?? (() => AGORA),
    novoId: () => `id-${++seq}`,
    armazenamento: {
      async gravar(c, b) {
        arquivos.set(c, b);
      },
      async ler(c) {
        return arquivos.get(c) ?? null;
      },
      async remover(cs) {
        cs.forEach(c => arquivos.delete(c));
      }
    },
    banco: {
      async inserir(r) {
        linhas.push(r);
      },
      async doUsuario(u) {
        return linhas.filter(l => l.usuarioId === u).sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime());
      },
      async remover(ids) {
        for (const id of ids) {
          const i = linhas.findIndex(l => l.id === id);
          if (i >= 0) linhas.splice(i, 1);
        }
      },
      async vencidas(ate, limite) {
        return linhas.filter(l => l.expiraEm !== null && l.expiraEm <= ate).slice(0, limite);
      }
    }
  };
  return { dep, arquivos, linhas };
}

describe('Análises salvas (F5-10): validação', () => {
  it('aceita a análise completa e tira dela só os identificadores públicos das citações encontradas', () => {
    const v = validarConteudo(conteudo());
    assert.ok(v.ok);
    assert.deepStrictEqual(v.citacoes, ['normaviva:LEI-13105-2015|corpo|art. 85', 'tesemap:STJ-TEMA-1076']);
  });

  it('recusa conteúdo fora do formato, sem estrutura ou com resultado de IA inválido', () => {
    assert.ok(!validarConteudo(null).ok);
    assert.ok(!validarConteudo(conteudo({ versao: 2 })).ok);
    assert.ok(!validarConteudo(conteudo({ enviada: { paragrafos: [], substituicoes: [], caracteres: 0 } })).ok);
    assert.ok(!validarConteudo(conteudo({ enviada: { paragrafos: [1], substituicoes: [], caracteres: 1 } })).ok);
    assert.ok(!validarConteudo(conteudo({ resultados: {} })).ok);
    assert.ok(!validarConteudo(conteudo({ selos: [['x', { estado: 'inventado', links: [] }]] })).ok);
    assert.ok(!validarConteudo(conteudo({ selos: 'x' })).ok);
  });

  it('prazo só entre os quatro oferecidos, e o rótulo é opcional e limitado', () => {
    assert.deepStrictEqual(['30d', '6m', '1a', 'sempre'].map(lerPrazo), ['30d', '6m', '1a', 'sempre']);
    assert.strictEqual(lerPrazo('7d'), null);
    assert.strictEqual(lerPrazo(undefined), null);
    assert.strictEqual(lerPrazo('toString'), null);
    assert.strictEqual(limparRotulo('  Caso   do\n João  '), 'Caso do João');
    assert.strictEqual(limparRotulo('   '), null);
    assert.strictEqual(limparRotulo('x'.repeat(200))?.length, LIMITES_DE_ANALISE_SALVA.maxRotulo);
  });

  it('citações vindas de selos não encontrados ou sem endereço conhecido não entram', () => {
    assert.deepStrictEqual(citacoesDosSelos([['a', { estado: 'nao_localizada', links: [{ rotulo: 'x', href: '/normaviva?d=ABC' }] }], ['b', { estado: 'encontrada', links: [{ rotulo: 'x', href: '/outro?d=1' }] }]]), []);
  });

  it('só liga com a flag e a chave válida', () => {
    const chave = CHAVE.toString('base64');
    assert.strictEqual(lerConfigDeAnalisesSalvas({}), null);
    assert.strictEqual(lerConfigDeAnalisesSalvas({ ARGUMENTA_SALVAR_LIGADO: 'sim' }), null);
    assert.strictEqual(lerConfigDeAnalisesSalvas({ ANALISES_CHAVE: chave }), null);
    assert.strictEqual(lerConfigDeAnalisesSalvas({ ARGUMENTA_SALVAR_LIGADO: 'sim', ANALISES_CHAVE: 'curta' }), null);
    assert.ok(lerConfigDeAnalisesSalvas({ ARGUMENTA_SALVAR_LIGADO: 'sim', ANALISES_CHAVE: chave }));
  });
});

describe('Análises salvas (F5-10): guardar, reabrir e apagar', () => {
  it('guarda cifrado, sem texto no banco nem no caminho, e reabre com os nomes reais para o dono', async () => {
    const { dep, arquivos, linhas } = simulacao();
    const r = await salvarAnalise('u1', { conteudo: conteudo(), rotulo: 'Caso A', prazo: '30d' }, dep);
    assert.ok(r.ok);
    assert.strictEqual(linhas.length, 1);
    assert.strictEqual(linhas[0].caminho, `u1/${linhas[0].id}`);
    assert.deepStrictEqual(linhas[0].citacoes, ['normaviva:LEI-13105-2015|corpo|art. 85', 'tesemap:STJ-TEMA-1076']);
    assert.strictEqual(linhas[0].expiraEm?.getTime(), AGORA.getTime() + 30 * DIA);
    const bruto = arquivos.get(linhas[0].caminho)!;
    assert.ok(!bruto.toString('latin1').includes('Maria Silva'), 'o arquivo guardado não tem o texto em claro');
    assert.ok(!JSON.stringify(linhas).includes('Maria Silva'), 'o banco não tem o texto');

    const aberta = await abrirAnalise('u1', linhas[0].id, dep);
    assert.ok(aberta.ok);
    assert.strictEqual(aberta.conteudo.enviada.substituicoes.length, 1);
    assert.strictEqual(aberta.conteudo.enviada.paragrafos[0], 'Maria Silva ajuizou ação.');
  });

  it('os quatro prazos: 30 dias, 6 meses, 1 ano e sem vencimento', async () => {
    const { dep, linhas } = simulacao();
    for (const prazo of ['30d', '6m', '1a', 'sempre']) {
      const r = await salvarAnalise(`u-${prazo}`, { conteudo: conteudo(), prazo }, dep);
      assert.ok(r.ok, prazo);
    }
    const dias = linhas.map(l => (l.expiraEm ? Math.round((l.expiraEm.getTime() - AGORA.getTime()) / DIA) : null));
    assert.deepStrictEqual(dias, [30, 183, 365, null]);
    const sem = await salvarAnalise('u9', { conteudo: conteudo() }, dep);
    assert.ok(!sem.ok && sem.status === 400, 'sem prazo escolhido, não grava');
  });

  it('a 11ª análise é recusada até a pessoa apagar uma', async () => {
    const { dep, linhas } = simulacao();
    for (let i = 0; i < LIMITES_DE_ANALISE_SALVA.maxPorUsuario; i++) assert.ok((await salvarAnalise('u1', { conteudo: conteudo(), prazo: 'sempre' }, dep)).ok);
    const recusada = await salvarAnalise('u1', { conteudo: conteudo(), prazo: 'sempre' }, dep);
    assert.ok(!recusada.ok && recusada.status === 429);
    assert.match(recusada.mensagem, /Exclua alguma/);
    assert.ok((await salvarAnalise('u2', { conteudo: conteudo(), prazo: 'sempre' }, dep)).ok, 'o limite é por pessoa');
    assert.ok(await apagarAnalise('u1', linhas[0].id, dep));
    assert.ok((await salvarAnalise('u1', { conteudo: conteudo(), prazo: 'sempre' }, dep)).ok, 'depois de apagar uma, cabe outra');
  });

  it('o vencido sai antes de contar o limite e não abre mais; o sem vencimento fica', async () => {
    let agora = AGORA;
    const { dep, arquivos, linhas } = simulacao({ agora: () => agora });
    await salvarAnalise('u1', { conteudo: conteudo(), prazo: '30d' }, dep);
    await salvarAnalise('u1', { conteudo: conteudo(), prazo: 'sempre' }, dep);
    const [vence, fica] = [linhas[0].id, linhas[1].id];
    agora = new Date(AGORA.getTime() + 31 * DIA);
    const aberta = await abrirAnalise('u1', vence, dep);
    assert.ok(!aberta.ok && aberta.status === 404);
    assert.deepStrictEqual((await listarAnalises('u1', dep)).map(a => a.id), [fica]);
    assert.strictEqual(arquivos.size, 1, 'o arquivo vencido foi apagado do armazenamento');
  });

  it('análise de outra pessoa dá o mesmo "não encontrada", tanto para abrir quanto para apagar', async () => {
    const { dep, linhas } = simulacao();
    await salvarAnalise('u1', { conteudo: conteudo(), prazo: 'sempre' }, dep);
    const id = linhas[0].id;
    const alheia = await abrirAnalise('u2', id, dep);
    assert.ok(!alheia.ok && alheia.status === 404);
    assert.strictEqual(await apagarAnalise('u2', id, dep), false);
    assert.strictEqual(linhas.length, 1);
  });

  it('arquivo adulterado ou copiado para outro caminho não abre', async () => {
    const { dep, arquivos, linhas } = simulacao();
    await salvarAnalise('u1', { conteudo: conteudo(), prazo: 'sempre' }, dep);
    const { caminho, id } = linhas[0];
    const original = arquivos.get(caminho)!;
    arquivos.set(caminho, cifrar(Buffer.from('{"x":1}'), CHAVE, 'u2/outro'));
    const copiado = await abrirAnalise('u1', id, dep);
    assert.ok(!copiado.ok && copiado.status === 500);
    const adulterado = Buffer.from(original);
    adulterado[20] ^= 0xff;
    arquivos.set(caminho, adulterado);
    assert.ok(!(await abrirAnalise('u1', id, dep)).ok);
  });

  it('"citado nas suas análises": só as da própria pessoa que citam aquele artigo ou precedente', async () => {
    const { dep } = simulacao();
    await salvarAnalise('u1', { conteudo: conteudo(), rotulo: 'Caso A', prazo: 'sempre' }, dep);
    await salvarAnalise('u1', { conteudo: conteudo({ selos: [] }), rotulo: 'Sem citações', prazo: 'sempre' }, dep);
    await salvarAnalise('u2', { conteudo: conteudo(), rotulo: 'De outra pessoa', prazo: 'sempre' }, dep);
    const r = await analisesQueCitam('u1', 'tesemap:STJ-TEMA-1076', dep);
    assert.deepStrictEqual(r.map(a => a.rotulo), ['Caso A']);
    assert.deepStrictEqual(await analisesQueCitam('u1', 'tesemap:STJ-TEMA-9', dep), []);
  });

  it('se a linha do banco falha depois de gravar, o arquivo é desfeito; o gatilho do limite vira 429', async () => {
    const { dep, arquivos } = simulacao();
    dep.banco.inserir = async () => {
      throw new Error('falha do banco');
    };
    await assert.rejects(salvarAnalise('u1', { conteudo: conteudo(), prazo: 'sempre' }, dep), /falha do banco/);
    assert.strictEqual(arquivos.size, 0, 'nada órfão');
    dep.banco.inserir = async () => {
      throw new Error('limite de 10 análises salvas por usuário');
    };
    const r = await salvarAnalise('u1', { conteudo: conteudo(), prazo: 'sempre' }, dep);
    assert.ok(!r.ok && r.status === 429);
    assert.strictEqual(arquivos.size, 0);
  });

  it('apagar tudo (exclusão da conta) e a faxina dos vencidos funcionam sem a chave', async () => {
    const { dep, arquivos, linhas } = simulacao();
    await salvarAnalise('u1', { conteudo: conteudo(), prazo: '30d' }, dep);
    await salvarAnalise('u1', { conteudo: conteudo(), prazo: 'sempre' }, dep);
    await salvarAnalise('u2', { conteudo: conteudo(), prazo: '30d' }, dep);
    const semChave = { agora: () => new Date(AGORA.getTime() + 40 * DIA), armazenamento: dep.armazenamento, banco: dep.banco };
    assert.strictEqual(await limparVencidas(semChave), 2, 'só as de 30 dias venceram');
    assert.strictEqual(await apagarTodasDoUsuario('u1', semChave), 1);
    assert.strictEqual(linhas.length, 0);
    assert.strictEqual(arquivos.size, 0);
  });
});
