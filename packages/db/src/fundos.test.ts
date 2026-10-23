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

const CHAVE = 'b'.repeat(64);
interface Inicio {
  ok: boolean;
  motivo: string | null;
  analise_id: string | null;
  restantes: number;
  plano: string;
  renova_em: string;
}
const iniciar = (db: PGlite, usuario: string, tipo = 'rapida') =>
  comoServidor(db, tx => tx.query<Inicio>('select * from public.analise_iniciar($1, $2)', [usuario, tipo])).then(r => r.rows[0]);
const reservar = (db: PGlite, usuario: string, analise: string, custoMax = 0.5) =>
  comoServidor(db, tx =>
    tx.query<{ ok: boolean; motivo: string | null; reserva_id: string | null }>('select * from public.ia_reservar($1, $2, $3, $4, $5, $6)', ['argumenta-estrutura', usuario, 'decisao:abc', CHAVE, analise, custoMax])
  ).then(r => r.rows[0]);
const finalizar = (db: PGlite, id: string, custo: number) => comoServidor(db, tx => tx.query("select public.ia_finalizar($1, 'gerada', 100, 50, 0, 0, $2)", [id, custo]));
const orcamento = (db: PGlite, fundo: string, usd: number) => db.query('update public.ia_fundos set orcamento_mes_usd = $1 where fundo = $2', [usd, fundo]);
const assinar = (db: PGlite, usuario: string) =>
  db.query("insert into public.assinaturas (usuario_id, plano_id, situacao, ciclo_inicio, ciclo_fim) values ($1, 'essencial', 'ativa', now() - interval '5 days', now() + interval '25 days')", [usuario]);

describe('Fundos de gasto de IA: o gratuito não derruba quem paga', () => {
  let db: PGlite;
  let gratis: string;
  let pagante: string;

  before(async () => {
    db = await criarBanco();
    gratis = await criarUsuario(db, 'gratis@exemplo.com');
    pagante = await criarUsuario(db, 'pagante@exemplo.com');
    await assinar(db, pagante);
  });

  it('os dois fundos existem com os tetos combinados, e só o servidor os lê', async () => {
    const r = await db.query<{ fundo: string; orcamento_mes_usd: string }>('select fundo, orcamento_mes_usd::text from public.ia_fundos order by fundo');
    assert.deepStrictEqual(r.rows, [
      { fundo: 'gratuito', orcamento_mes_usd: '15.00' },
      { fundo: 'pagantes', orcamento_mes_usd: '5.00' }
    ]);
    await assert.rejects(como(db, gratis, tx => tx.query('select * from public.ia_fundos')), /permission denied/);
    await assert.rejects(como(db, null, tx => tx.query('select * from public.ia_fundos')), /permission denied/);
    await assert.rejects(comoServidor(db, tx => tx.query("update public.ia_fundos set orcamento_mes_usd = 999 where fundo = 'gratuito'")), /permission denied/);
    await assert.rejects(como(db, gratis, tx => tx.query('select * from public.ia_fundos_situacao()')), /permission denied/);
  });

  it('cada chamada é debitada do fundo do plano de quem a fez', async () => {
    const a = (await iniciar(db, gratis)).analise_id!;
    const b = (await iniciar(db, pagante)).analise_id!;
    const ra = await reservar(db, gratis, a, 0.1);
    await finalizar(db, ra.reserva_id!, 0.002);
    const rb = await reservar(db, pagante, b, 0.1);
    await finalizar(db, rb.reserva_id!, 0.003);
    const linhas = await db.query<{ fundo: string; gasto_usd: string }>('select fundo, gasto_usd::text from public.ia_fundos_situacao() order by fundo');
    assert.deepStrictEqual(linhas.rows, [
      { fundo: 'gratuito', gasto_usd: '0.002000' },
      { fundo: 'pagantes', gasto_usd: '0.003000' }
    ]);
    const marca = await db.query<{ fundo: string }>('select fundo from public.ia_uso order by id');
    assert.deepStrictEqual(marca.rows.map(x => x.fundo), ['gratuito', 'pagantes']);
  });

  it('o fundo do gratuito acabou: o gratuito é barrado (sem gastar a cota), o pagante segue', async () => {
    await orcamento(db, 'gratuito', 0.002);
    const novo = await criarUsuario(db, 'novo@exemplo.com');
    const barrado = await iniciar(db, novo);
    assert.strictEqual(barrado.ok, false);
    assert.strictEqual(barrado.motivo, 'orcamento_gratuito');
    assert.strictEqual(barrado.restantes, 3, 'a cota da semana fica intacta');
    assert.ok(new Date(barrado.renova_em).getTime() > Date.now(), 'volta no 1º do mês seguinte');
    const semAnalise = await db.query<{ n: number }>('select count(*)::int as n from public.analises where usuario_id = $1', [novo]);
    assert.strictEqual(semAnalise.rows[0].n, 0, 'nenhuma vaga foi reservada');

    const pago = await iniciar(db, pagante);
    assert.strictEqual(pago.ok, true, 'o pagante não é afetado');
    const r = await reservar(db, pagante, pago.analise_id!, 0.1);
    assert.strictEqual(r.ok, true);
    await finalizar(db, r.reserva_id!, 0.001);
    await orcamento(db, 'gratuito', 15);
  });

  it('uma análise já iniciada também é barrada na reserva quando o fundo não comporta o custo máximo', async () => {
    const id = (await iniciar(db, gratis)).analise_id!;
    const gasto = Number((await db.query<{ g: string }>("select public.ia_gasto_do_fundo('gratuito')::text as g")).rows[0].g);
    await orcamento(db, 'gratuito', gasto + 0.05);
    assert.strictEqual((await reservar(db, gratis, id, 0.1)).motivo, 'orcamento_gratuito', 'custo máximo 0,10 passa de 0,05 que sobra');
    assert.strictEqual((await reservar(db, gratis, id, 0.04)).ok, true, 'cabe');
    await orcamento(db, 'gratuito', 15);
  });

  it('o fundo dos pagantes acabou: o pagante é barrado, o gratuito segue', async () => {
    await orcamento(db, 'pagantes', 0.001);
    const barrado = await iniciar(db, pagante, 'explicacao');
    assert.strictEqual(barrado.motivo, 'orcamento_pagantes');
    const livre = await iniciar(db, await criarUsuario(db, 'livre@exemplo.com'), 'explicacao');
    assert.strictEqual(livre.ok, true);
    await orcamento(db, 'pagantes', 5);
  });

  it('a cota do plano vale antes do fundo: sem cota, o motivo é o da cota', async () => {
    const x = await criarUsuario(db, 'sem-cota@exemplo.com');
    await orcamento(db, 'gratuito', 0);
    assert.strictEqual((await iniciar(db, x, 'completa')).motivo, 'sem_cota_no_plano', 'o gratuito não tem a completa, e isso é dito antes do fundo');
    assert.strictEqual((await iniciar(db, x)).motivo, 'orcamento_gratuito');
    await orcamento(db, 'gratuito', 15);
  });

  it('o gasto do mês só conta o mês corrente (Brasília) e ignora as linhas de cache', async () => {
    const y = await criarUsuario(db, 'mes@exemplo.com');
    const antes = Number((await db.query<{ g: string }>("select public.ia_gasto_do_fundo('gratuito')::text as g")).rows[0].g);
    await db.query("insert into public.ia_uso (tarefa, usuario_id, referencia, chave, situacao, custo_usd, fundo, criado_em) values ('argumenta-estrutura', $1, 'x', $2, 'gerada', 9, 'gratuito', now() - interval '40 days')", [y, CHAVE]);
    const depois = Number((await db.query<{ g: string }>("select public.ia_gasto_do_fundo('gratuito')::text as g")).rows[0].g);
    assert.strictEqual(depois, antes, 'uso de 40 dias atrás não entra');
    await comoServidor(db, tx => tx.query("select public.ia_registrar_cache('explicar-dispositivo', $1, 'x', $2)", [y, CHAVE]));
    const comCache = Number((await db.query<{ g: string }>("select public.ia_gasto_do_fundo('gratuito')::text as g")).rows[0].g);
    assert.strictEqual(comCache, antes, 'cache custa zero e não tem fundo');
  });

  it('a migração rotula o que já havia como gasto do gratuito', async () => {
    const velho = await criarBanco('20261023000001_planos_e_analises');
    const u = await criarUsuario(velho, 'velho@exemplo.com');
    await velho.query("insert into public.ia_uso (tarefa, usuario_id, referencia, chave, situacao, custo_usd) values ('explicar-dispositivo', $1, 'x', $2, 'gerada', 0.004), ('explicar-dispositivo', $1, 'x', $2, 'cache', 0)", [u, CHAVE]);
    const { aplicarMigracao } = await import('./harness');
    await aplicarMigracao(velho, '20261023000002_fundos_de_gasto');
    const r = await velho.query<{ situacao: string; fundo: string | null }>('select situacao, fundo from public.ia_uso order by id');
    assert.deepStrictEqual(r.rows, [
      { situacao: 'gerada', fundo: 'gratuito' },
      { situacao: 'cache', fundo: null }
    ]);
    assert.strictEqual(Number((await velho.query<{ g: string }>("select public.ia_gasto_do_fundo('gratuito')::text as g")).rows[0].g), 0.004);
  });
});
