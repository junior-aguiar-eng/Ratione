import { before, describe, it } from 'node:test';
import assert from 'node:assert';
import type { PGlite } from '@electric-sql/pglite';
import { aplicarMigracao, como, criarBanco, criarUsuario } from './harness';

type Tx = Parameters<Parameters<PGlite['transaction']>[0]>[0];
const comoServidor = <T>(db: PGlite, fn: (tx: Tx) => Promise<T>) =>
  db.transaction(async tx => {
    await tx.exec('set local role service_role');
    return fn(tx);
  });

const CHAVE = 'a'.repeat(64);
/** Inicia uma análise (a cota do período é conferida aqui) e devolve o id. */
const iniciar = (tx: Tx, usuario: string, tipo = 'explicacao') =>
  tx.query<{ ok: boolean; analise_id: string | null }>('select * from public.analise_iniciar($1, $2)', [usuario, tipo]).then(r => r.rows[0].analise_id!);
const reservar = (tx: Tx, usuario: string, analise: string, custoMax = 0.01, tarefa = 'explicar-dispositivo') =>
  tx
    .query<{ ok: boolean; motivo: string | null; reserva_id: string | null }>('select * from public.ia_reservar($1, $2, $3, $4, $5, $6)', [
      tarefa,
      usuario,
      'LEI-13105-2015|corpo|art. 85',
      CHAVE,
      analise,
      custoMax
    ])
    .then(r => r.rows[0]);
const finalizar = (tx: Tx, id: string, custo = 0.001) => tx.query("select public.ia_finalizar($1, 'gerada', 100, 50, 0, 0, $2)", [id, custo]);

describe('IA: chamadas dentro de uma análise, orçamento global e acesso (catálogo de tarefas)', () => {
  let db: PGlite;
  let ana: string;
  let beto: string;

  before(async () => {
    db = await criarBanco();
    ana = await criarUsuario(db, 'ana@exemplo.com');
    beto = await criarUsuario(db, 'beto@exemplo.com');
  });

  it('o navegador (anon ou logado) não chama as funções nem escreve nas tabelas', async () => {
    const id = await comoServidor(db, tx => iniciar(tx, ana));
    await assert.rejects(como(db, ana, tx => reservar(tx, ana, id)), /permission denied/);
    await assert.rejects(como(db, ana, tx => tx.query("select public.ia_registrar_cache('explicar-dispositivo', $1, 'x', 'y')", [ana])), /permission denied/);
    await assert.rejects(
      como(db, ana, tx => tx.query("insert into public.ia_uso (tarefa, usuario_id, referencia, chave, situacao) values ('explicar-dispositivo', $1, 'x', 'y', 'gerada')", [ana])),
      /permission denied/
    );
    await assert.rejects(como(db, ana, tx => tx.query('select * from public.ia_respostas')), /permission denied/);
    await assert.rejects(como(db, null, tx => tx.query('select * from public.ia_uso')), /permission denied/);
  });

  it('a reserva exige análise do próprio usuário e em andamento', async () => {
    const daAna = await comoServidor(db, tx => iniciar(tx, ana));
    assert.strictEqual((await comoServidor(db, tx => reservar(tx, beto, daAna))).motivo, 'analise_invalida', 'análise de outro usuário');
    assert.strictEqual((await comoServidor(db, tx => reservar(tx, ana, '00000000-0000-0000-0000-000000000000'))).motivo, 'analise_invalida', 'análise inexistente');
    await comoServidor(db, tx => tx.query('select public.analise_concluir($1, $2)', [daAna, ana]));
    assert.strictEqual((await comoServidor(db, tx => reservar(tx, ana, daAna))).motivo, 'analise_invalida', 'análise já concluída');
  });

  it('reserva, chamada em andamento barrada e finalização com o custo real, ligadas à análise', async () => {
    const id = await comoServidor(db, tx => iniciar(tx, ana));
    const r1 = await comoServidor(db, tx => reservar(tx, ana, id));
    assert.strictEqual(r1.ok, true);
    assert.strictEqual((await comoServidor(db, tx => reservar(tx, ana, id))).motivo, 'em_andamento', 'duas abas ao mesmo tempo');
    await comoServidor(db, tx => finalizar(tx, r1.reserva_id!));
    const r2 = await comoServidor(db, tx => reservar(tx, ana, id));
    assert.strictEqual(r2.ok, true, 'a mesma análise faz várias chamadas sem cota nova');
    await comoServidor(db, tx => finalizar(tx, r2.reserva_id!));
    const ligadas = await comoServidor(db, tx => tx.query<{ n: number }>('select count(*)::int as n from public.ia_uso where analise_id = $1', [id]));
    assert.strictEqual(ligadas.rows[0].n, 2);
    await comoServidor(db, tx => tx.query('select public.analise_concluir($1, $2)', [id, ana]));
  });

  it('uso do cache não conta no orçamento', async () => {
    await comoServidor(db, tx => tx.query("select public.ia_registrar_cache('explicar-dispositivo', $1, 'x', $2)", [beto, CHAVE]));
    const id = await comoServidor(db, tx => iniciar(tx, beto));
    const r = await comoServidor(db, tx => reservar(tx, beto, id));
    assert.strictEqual(r.ok, true);
    await comoServidor(db, tx => finalizar(tx, r.reserva_id!));
    await comoServidor(db, tx => tx.query('select public.analise_concluir($1, $2)', [id, beto]));
  });

  it('o orçamento do mês soma todos os usuários e o custo máximo da chamada em curso', async () => {
    const carlos = await criarUsuario(db, 'carlos@exemplo.com');
    const id = await comoServidor(db, tx => iniciar(tx, carlos));
    const gasto = await comoServidor(db, tx => tx.query<{ s: string }>('select coalesce(sum(custo_usd), 0)::text as s from public.ia_uso'));
    const jaGasto = Number(gasto.rows[0].s);
    assert.ok(jaGasto > 0);
    // O teto do fundo do Gratuito cabe no gasto de agora mais 0,0005, e a chamada de custo máximo 0,001 não cabe
    await db.query('update public.ia_fundos set orcamento_mes_usd = $1 where fundo = $2', [jaGasto + 0.0005, 'gratuito']);
    assert.strictEqual((await comoServidor(db, tx => reservar(tx, carlos, id, 0.001))).motivo, 'orcamento_gratuito');
    await db.query("update public.ia_fundos set orcamento_mes_usd = 15 where fundo = 'gratuito'");
    assert.strictEqual((await comoServidor(db, tx => reservar(tx, carlos, id, 0.001))).ok, true);
  });

  it('"uma de cada vez" vale para todas as tarefas do mesmo usuário', async () => {
    const dani = await criarUsuario(db, 'dani@exemplo.com');
    const id = await comoServidor(db, tx => iniciar(tx, dani, 'rapida'));
    const a = await comoServidor(db, tx => reservar(tx, dani, id, 0.0001, 'argumenta-estrutura'));
    assert.strictEqual(a.ok, true);
    assert.strictEqual((await comoServidor(db, tx => reservar(tx, dani, id, 0.0001, 'argumenta-questoes'))).motivo, 'em_andamento');
    await comoServidor(db, tx => finalizar(tx, a.reserva_id!, 0.0001));
    const b = await comoServidor(db, tx => reservar(tx, dani, id, 0.0001, 'argumenta-questoes'));
    assert.strictEqual(b.ok, true);
    await comoServidor(db, tx => finalizar(tx, b.reserva_id!, 0.0001));
  });

  it('cada usuário logado lê só o próprio registro de uso', async () => {
    const daAna = await como(db, ana, tx => tx.query<{ usuario_id: string }>('select usuario_id from public.ia_uso'));
    assert.ok(daAna.rows.length > 0);
    assert.ok(daAna.rows.every(r => r.usuario_id === ana));
  });

  it('a finalização só aceita resultado conhecido e só fecha reserva aberta', async () => {
    await assert.rejects(comoServidor(db, tx => tx.query("select public.ia_finalizar(1, 'cache', 0, 0, 0, 0, 0)")), /situação inválida/);
    const antes = await comoServidor(db, tx => tx.query<{ custo_usd: string }>('select custo_usd from public.ia_uso where id = 1'));
    await comoServidor(db, tx => tx.query("select public.ia_finalizar(1, 'gerada', 1, 1, 0, 0, 0.5)"));
    const depois = await comoServidor(db, tx => tx.query<{ custo_usd: string }>('select custo_usd from public.ia_uso where id = 1'));
    assert.deepStrictEqual(depois.rows, antes.rows, 'reserva já fechada não muda');
  });
});

describe('Migração do catálogo de tarefas sobre o banco que já tinha a explicação por IA', () => {
  it('preserva o cache e o registro de uso existentes, com a tarefa "explicar-dispositivo"', async () => {
    const db = await criarBanco('20261022000001_explicacao_ia');
    const ana = await criarUsuario(db, 'ana@exemplo.com');
    await comoServidor(db, async tx => {
      await tx.query("insert into public.ia_explicacoes (chave, dispositivo_id, hash_texto, modelo, versao_prompt, explicacao) values ($1, 'X|corpo|art. 1', 'h', 'claude-haiku-5-5', 'v1', '{}')", [CHAVE]);
      await tx.query("select public.ia_registrar_cache($1, 'X|corpo|art. 1', $2)", [ana, CHAVE]);
    });
    await aplicarMigracao(db, '20261022000002_ia_tarefas');
    const r = await db.query<{ tarefa: string; referencia: string; versao: string }>('select tarefa, referencia, versao from public.ia_respostas');
    assert.deepStrictEqual(r.rows, [{ tarefa: 'explicar-dispositivo', referencia: 'X|corpo|art. 1', versao: 'v1' }]);
    const u = await db.query<{ tarefa: string; referencia: string }>('select tarefa, referencia from public.ia_uso');
    assert.deepStrictEqual(u.rows, [{ tarefa: 'explicar-dispositivo', referencia: 'X|corpo|art. 1' }]);
  });
});
