import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  ehErroDeLimite,
  importarComCliente,
  registroParaLinha,
  salvarRegistroCom,
  type ClienteItens,
  type NovoRegistro,
  type RegistroHistorico
} from './historico';
import { estadoAposSalvar, rotuloSalvar } from './rotuloSalvar';

const NOVO: NovoRegistro = { modulo: 'PrazoZero', tipo: 'prazo', titulo: 'Apelação · TJSP', url: '/prazozero' };
const MSG_LIMITE = 'limite de 1000 itens salvos por conta';

/** Cliente de mentira: `resposta` decide o erro de cada chamada de insert (lote ou linha), em ordem. */
function cliente(opcoes: { sessao?: boolean; respostas?: Array<string | null> }): { sb: ClienteItens; inseridos: object[][] } {
  const inseridos: object[][] = [];
  const respostas = [...(opcoes.respostas ?? [])];
  const sb: ClienteItens = {
    auth: { getSession: async () => ({ data: { session: opcoes.sessao === false ? null : { user: { id: 'u1' } } } }) },
    from: () => ({
      insert: async linhas => {
        inseridos.push(Array.isArray(linhas) ? linhas : [linhas]);
        const msg = respostas.shift() ?? null;
        return { error: msg === null ? null : { message: msg } };
      }
    })
  };
  return { sb, inseridos };
}

const local = (id: string, extra: Partial<RegistroHistorico> = {}): RegistroHistorico => ({
  id,
  modulo: 'NormaViva',
  tipo: 'norma',
  titulo: `Item ${id}`,
  url: '/normaviva',
  criadoEm: '2026-10-01T10:00:00.000Z',
  ...extra
});

describe('Limite de itens salvos: o cliente reconhece o gatilho do banco', () => {
  it('a mensagem do SQL da migração é a que o cliente reconhece', () => {
    const sql = readFileSync(join(__dirname, '../../../../supabase/migrations/20261020000002_limite_itens_salvos.sql'), 'utf-8');
    const mensagem = sql.match(/raise exception '([^']+)'/)?.[1];
    assert.ok(mensagem, 'a migração não tem a mensagem esperada');
    assert.ok(ehErroDeLimite(mensagem), mensagem);
    assert.ok(!ehErroDeLimite('violates check constraint'));
    assert.ok(!ehErroDeLimite(undefined));
  });
});

describe('Salvar com a conta cheia', () => {
  it('conta cheia devolve "limite" e NÃO guarda no navegador', async () => {
    const { sb } = cliente({ respostas: [MSG_LIMITE] });
    const guardados: NovoRegistro[] = [];
    assert.equal(await salvarRegistroCom(sb, NOVO, r => guardados.push(r)), 'limite');
    assert.deepEqual(guardados, []);
  });

  it('com espaço na conta, vai para a conta; sem login ou com outro erro, cai para o navegador', async () => {
    const guardados: NovoRegistro[] = [];
    assert.equal(await salvarRegistroCom(cliente({}).sb, NOVO, r => guardados.push(r)), 'conta');
    assert.equal(await salvarRegistroCom(cliente({ sessao: false }).sb, NOVO, r => guardados.push(r)), 'navegador');
    assert.equal(await salvarRegistroCom(cliente({ respostas: ['falha de rede'] }).sb, NOVO, r => guardados.push(r)), 'navegador');
    assert.equal(await salvarRegistroCom(null, NOVO, r => guardados.push(r)), 'navegador');
    assert.equal(guardados.length, 3);
  });
});

describe('Botão "Salvar em Meu espaço"', () => {
  it('conta cheia: aviso por 5 s com o texto de limite; salvo normal: 2 s', () => {
    assert.deepEqual(estadoAposSalvar('limite'), { estado: 'limite', ms: 5000 });
    assert.deepEqual(estadoAposSalvar('conta'), { estado: 'salvo', ms: 2000 });
    assert.deepEqual(estadoAposSalvar('navegador'), { estado: 'salvo', ms: 2000 });
  });

  it('o texto do botão em cada estado', () => {
    assert.equal(rotuloSalvar('ocioso', 'Salvar tema em Meu espaço'), 'Salvar tema em Meu espaço');
    assert.equal(rotuloSalvar('salvo', 'Salvar tema em Meu espaço'), 'Salvo em Meu espaço');
    assert.equal(rotuloSalvar('limite', 'Salvar tema em Meu espaço'), 'Limite de itens atingido');
  });
});

describe('Importar o histórico do navegador para a conta', () => {
  it('tudo certo: envia tudo em lote e nada fica no navegador', async () => {
    const { sb, inseridos } = cliente({});
    let restantes: RegistroHistorico[] | undefined;
    const r = await importarComCliente(sb, [local('a'), local('b')], x => (restantes = x));
    assert.deepEqual(r, { enviados: 2, mantidos: 0 });
    assert.equal(inseridos.length, 1);
    assert.deepEqual(restantes, []);
  });

  it('lote recusado: tenta um por um, e o registro ruim fica no navegador com os demais enviados', async () => {
    // lote falha; a e c entram; b é recusado
    const { sb } = cliente({ respostas: ['violates check constraint', null, 'violates check constraint', null] });
    let restantes: RegistroHistorico[] | undefined;
    const r = await importarComCliente(sb, [local('a'), local('b'), local('c')], x => (restantes = x));
    assert.deepEqual(r, { enviados: 2, mantidos: 1 });
    assert.deepEqual(restantes?.map(x => x.id), ['b']);
  });

  it('conta cheia no meio: para de insistir e mantém no navegador o que não coube', async () => {
    const { sb, inseridos } = cliente({ respostas: [MSG_LIMITE, null, MSG_LIMITE] });
    let restantes: RegistroHistorico[] | undefined;
    const r = await importarComCliente(sb, [local('a'), local('b'), local('c'), local('d')], x => (restantes = x));
    assert.deepEqual(r, { enviados: 1, mantidos: 3 });
    assert.deepEqual(restantes?.map(x => x.id), ['b', 'c', 'd']);
    assert.equal(inseridos.length, 3, 'depois do limite não há mais tentativas');
  });

  it('registro danificado no armazenamento local não é enviado e continua no navegador', async () => {
    const { sb, inseridos } = cliente({});
    const ruim = local('x', { modulo: 'Outro' as RegistroHistorico['modulo'] });
    let restantes: RegistroHistorico[] | undefined;
    const r = await importarComCliente(sb, [local('a'), ruim], x => (restantes = x));
    assert.deepEqual(r, { enviados: 1, mantidos: 1 });
    assert.equal(inseridos[0].length, 1);
    assert.deepEqual(restantes?.map(x => x.id), ['x']);
  });

  it('sem login, nada é enviado nem apagado', async () => {
    let gravou = false;
    const r = await importarComCliente(cliente({ sessao: false }).sb, [local('a')], () => (gravou = true));
    assert.deepEqual(r, { enviados: 0, mantidos: 1 });
    assert.equal(gravou, false);
  });

  it('a linha enviada respeita os limites do banco', () => {
    const l = registroParaLinha(local('a', { titulo: 'x'.repeat(400), url: '/normaviva?d=' + 'y'.repeat(600) }), 'u1');
    assert.equal(l.titulo.length, 300);
    assert.equal(l.url, '/normaviva');
  });
});
