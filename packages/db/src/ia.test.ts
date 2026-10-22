import { before, describe, it } from 'node:test';
import assert from 'node:assert';
import type { PGlite } from '@electric-sql/pglite';
import { como, criarBanco, criarUsuario } from './harness';

type Tx = Parameters<Parameters<PGlite['transaction']>[0]>[0];
const comoServidor = <T>(db: PGlite, fn: (tx: Tx) => Promise<T>) =>
  db.transaction(async tx => {
    await tx.exec('set local role service_role');
    return fn(tx);
  });

const CHAVE = 'a'.repeat(64);
const reservar = (tx: Tx, usuario: string, porDia = 2, porMes = 10, orcamento = 1, custoMax = 0.01) =>
  tx
    .query<{ ok: boolean; motivo: string | null; reserva_id: string | null; restantes_hoje: number | null }>(
      'select * from public.ia_reservar($1, $2, $3, $4, $5, $6, $7)',
      [usuario, 'LEI-13105-2015|corpo|art. 85', CHAVE, porDia, porMes, orcamento, custoMax]
    )
    .then(r => r.rows[0]);
const finalizar = (tx: Tx, id: string, custo = 0.001) => tx.query("select public.ia_finalizar($1, 'gerada', 100, 50, 0, 0, $2)", [id, custo]);

describe('Explicação por IA: cota, orçamento e acesso (F3-08)', () => {
  let db: PGlite;
  let ana: string;
  let beto: string;

  before(async () => {
    db = await criarBanco();
    ana = await criarUsuario(db, 'ana@exemplo.com');
    beto = await criarUsuario(db, 'beto@exemplo.com');
  });

  it('o navegador (anon ou logado) não chama as funções nem escreve nas tabelas', async () => {
    await assert.rejects(como(db, ana, tx => reservar(tx, ana)), /permission denied/);
    await assert.rejects(como(db, ana, tx => tx.query("select public.ia_registrar_cache($1, 'x', 'y')", [ana])), /permission denied/);
    await assert.rejects(
      como(db, ana, tx => tx.query("insert into public.ia_uso (usuario_id, dispositivo_id, chave, situacao) values ($1, 'x', 'y', 'gerada')", [ana])),
      /permission denied/
    );
    await assert.rejects(como(db, ana, tx => tx.query('select * from public.ia_explicacoes')), /permission denied/);
    await assert.rejects(como(db, null, tx => tx.query('select * from public.ia_uso')), /permission denied/);
  });

  it('reserva, chamada em andamento barrada, finalização com o custo real e limite do dia', async () => {
    const r1 = await comoServidor(db, tx => reservar(tx, ana));
    assert.strictEqual(r1.ok, true);
    assert.strictEqual(r1.restantes_hoje, 1);
    assert.strictEqual((await comoServidor(db, tx => reservar(tx, ana))).motivo, 'em_andamento', 'duas abas ao mesmo tempo');
    await comoServidor(db, tx => finalizar(tx, r1.reserva_id!));
    const r2 = await comoServidor(db, tx => reservar(tx, ana));
    assert.strictEqual(r2.ok, true);
    await comoServidor(db, tx => finalizar(tx, r2.reserva_id!));
    assert.strictEqual((await comoServidor(db, tx => reservar(tx, ana))).motivo, 'limite_dia');
    // O limite é por usuário
    const b = await comoServidor(db, tx => reservar(tx, beto));
    assert.strictEqual(b.ok, true);
    await comoServidor(db, tx => finalizar(tx, b.reserva_id!));
  });

  it('uso do cache não conta na cota nem no orçamento', async () => {
    await comoServidor(db, tx => tx.query("select public.ia_registrar_cache($1, 'x', $2)", [beto, CHAVE]));
    const r = await comoServidor(db, tx => reservar(tx, beto));
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.restantes_hoje, 0, 'só a chamada anterior conta');
    await comoServidor(db, tx => finalizar(tx, r.reserva_id!));
  });

  it('o orçamento do mês soma todos os usuários e o custo máximo da chamada em curso', async () => {
    const carlos = await criarUsuario(db, 'carlos@exemplo.com');
    // Gasto até aqui: 3 chamadas de 0,001 de Ana e Beto; orçamento de 0,0035 não comporta mais uma de custo máximo 0,001
    assert.strictEqual((await comoServidor(db, tx => reservar(tx, carlos, 5, 10, 0.0035, 0.001))).motivo, 'orcamento');
    assert.strictEqual((await comoServidor(db, tx => reservar(tx, carlos, 5, 10, 1, 0.001))).ok, true);
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
