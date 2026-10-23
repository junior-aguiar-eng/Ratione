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

const criarPendente = (db: PGlite, usuario: string, plano = 'essencial', ambiente = 'teste') =>
  comoServidor(db, tx =>
    tx.query<{ assinatura_id: string; valor_centavos: number; antigas: string[] }>('select * from public.assinatura_criar_pendente($1, $2, $3)', [usuario, plano, ambiente])
  ).then(r => r.rows[0]);
const aplicar = (db: PGlite, id: string, situacao: string, mp = situacao, fim: string | null = null) =>
  comoServidor(db, tx => tx.query<{ r: string | null }>('select public.assinatura_aplicar($1, $2, $3, $4) as r', [id, situacao, mp, fim])).then(r => r.rows[0].r);
const vincular = (db: PGlite, id: string, mp: string) => comoServidor(db, tx => tx.query('select public.assinatura_vincular_mp($1, $2)', [id, mp]));
const plano = (db: PGlite, usuario: string) => db.query<{ plano: string }>('select plano from public.plano_vigente($1)', [usuario]).then(r => r.rows[0].plano);
const linha = (db: PGlite, id: string) =>
  db.query<{ situacao: string; mp_situacao: string | null; ciclo_inicio: string; ciclo_fim: string | null; mp_assinatura_id: string | null }>('select * from public.assinaturas where id = $1', [id]).then(r => r.rows[0]);
const emDias = (n: number) => new Date(Date.now() + n * 24 * 3600 * 1000).toISOString();

describe('Cobrança com o Mercado Pago: banco (F8-05)', () => {
  let db: PGlite;
  before(async () => {
    db = await criarBanco();
  });

  it('sem preço definido ninguém assina; o gratuito e planos que não existem são recusados', async () => {
    const u = await criarUsuario(db, 'a@exemplo.com');
    await assert.rejects(criarPendente(db, u), /preco_nao_definido/);
    await assert.rejects(criarPendente(db, u, 'gratuito'), /plano_invalido/);
    await assert.rejects(criarPendente(db, u, 'qualquer'), /plano_invalido/);
    await db.query("update public.planos set preco_mensal_centavos = 2900 where id = 'essencial'");
    await db.query("update public.planos set preco_mensal_centavos = 7900 where id = 'profissional'");
  });

  it('cria a assinatura pendente com o preço do plano; enquanto pendente, ainda é Gratuito', async () => {
    const u = await criarUsuario(db, 'b@exemplo.com');
    const p = await criarPendente(db, u);
    assert.strictEqual(p.valor_centavos, 2900);
    assert.deepStrictEqual(p.antigas, []);
    const l = await linha(db, p.assinatura_id);
    assert.strictEqual(l.situacao, 'pendente');
    assert.strictEqual(await plano(db, u), 'gratuito');
  });

  it('um novo checkout encerra o pendente abandonado e devolve o id dele no Mercado Pago, para cancelar lá', async () => {
    const u = await criarUsuario(db, 'c@exemplo.com');
    const primeira = await criarPendente(db, u);
    await vincular(db, primeira.assinatura_id, 'mp-antiga-1');
    const segunda = await criarPendente(db, u, 'profissional');
    assert.deepStrictEqual(segunda.antigas, ['mp-antiga-1']);
    assert.strictEqual(segunda.valor_centavos, 7900);
    assert.strictEqual((await linha(db, primeira.assinatura_id)).situacao, 'cancelada');
    assert.strictEqual((await linha(db, segunda.assinatura_id)).situacao, 'pendente');
  });

  it('ativar começa o ciclo agora e guarda o fim do ciclo pago; o plano passa a valer', async () => {
    const u = await criarUsuario(db, 'd@exemplo.com');
    const p = await criarPendente(db, u);
    await vincular(db, p.assinatura_id, 'mp-d');
    assert.strictEqual(await aplicar(db, p.assinatura_id, 'ativa', 'authorized', emDias(30)), 'ativa');
    const l = await linha(db, p.assinatura_id);
    assert.ok(Math.abs(new Date(l.ciclo_inicio).getTime() - Date.now()) < 60_000, 'o ciclo começa agora');
    assert.ok(l.ciclo_fim && new Date(l.ciclo_fim).getTime() > Date.now() + 29 * 24 * 3600 * 1000);
    assert.strictEqual(l.mp_situacao, 'authorized');
    assert.strictEqual(await plano(db, u), 'essencial');
    // Uma renovação traz um novo fim de ciclo, sem recomeçar o ciclo
    const inicio = l.ciclo_inicio;
    await aplicar(db, p.assinatura_id, 'ativa', 'authorized', emDias(60));
    assert.strictEqual(new Date((await linha(db, p.assinatura_id)).ciclo_inicio).getTime(), new Date(inicio).getTime());
  });

  it('quem já assina não abre outra assinatura; só uma em curso por usuário', async () => {
    const u = await criarUsuario(db, 'e@exemplo.com');
    const p = await criarPendente(db, u);
    await aplicar(db, p.assinatura_id, 'ativa', 'authorized', emDias(30));
    await assert.rejects(criarPendente(db, u, 'profissional'), /ja_assinante/);
    await assert.rejects(
      db.query("insert into public.assinaturas (usuario_id, plano_id, situacao) values ($1, 'profissional', 'pendente')", [u]),
      /assinaturas_uma_em_curso|duplicate key/
    );
  });

  it('cancelada é definitiva e vale até o fim do ciclo pago; depois volta ao Gratuito', async () => {
    const u = await criarUsuario(db, 'f@exemplo.com');
    const p = await criarPendente(db, u);
    await aplicar(db, p.assinatura_id, 'ativa', 'authorized', emDias(20));
    assert.strictEqual(await aplicar(db, p.assinatura_id, 'cancelada', 'cancelled', null), 'cancelada');
    const l = await linha(db, p.assinatura_id);
    assert.ok(l.ciclo_fim, 'o fim do ciclo já pago é mantido (cancelar não o apaga)');
    assert.strictEqual(await plano(db, u), 'essencial', 'vale até o fim do ciclo pago');
    assert.strictEqual(await aplicar(db, p.assinatura_id, 'ativa', 'authorized', emDias(50)), 'cancelada', 'nada reativa uma cancelada');
    await db.query("update public.assinaturas set ciclo_fim = now() - interval '1 hour' where id = $1", [p.assinatura_id]);
    assert.strictEqual(await plano(db, u), 'gratuito');
    // Depois de cancelar, pode assinar de novo
    assert.ok((await criarPendente(db, u)).assinatura_id);
  });

  it('em atraso tem a carência de 3 dias; pausada vale até o fim do ciclo pago', async () => {
    const u = await criarUsuario(db, 'g@exemplo.com');
    const p = await criarPendente(db, u);
    await aplicar(db, p.assinatura_id, 'ativa', 'authorized', emDias(5));
    await aplicar(db, p.assinatura_id, 'em_atraso', 'authorized', null);
    await db.query("update public.assinaturas set ciclo_fim = now() - interval '2 days' where id = $1", [p.assinatura_id]);
    assert.strictEqual(await plano(db, u), 'essencial', '2 dias depois do fim do ciclo: dentro da carência');
    await db.query("update public.assinaturas set ciclo_fim = now() - interval '4 days' where id = $1", [p.assinatura_id]);
    assert.strictEqual(await plano(db, u), 'gratuito', '4 dias depois: acabou');
    await aplicar(db, p.assinatura_id, 'pausada', 'paused', emDias(3));
    assert.strictEqual(await plano(db, u), 'essencial', 'pausada, com ciclo pago pela frente');
  });

  it('situação inválida e assinatura inexistente', async () => {
    await assert.rejects(aplicar(db, '00000000-0000-0000-0000-000000000000', 'vip'), /situacao_invalida/);
    assert.strictEqual(await aplicar(db, '00000000-0000-0000-0000-000000000000', 'ativa'), null);
  });

  it('a cobrança é registrada pelo id do pagamento e atualizada, sem duplicar; o cliente lê só as próprias', async () => {
    const u = await criarUsuario(db, 'h@exemplo.com');
    const outro = await criarUsuario(db, 'i@exemplo.com');
    const p = await criarPendente(db, u);
    const registrar = (situacao: string, paga: string | null) =>
      comoServidor(db, tx => tx.query("select public.cobranca_registrar($1, 'pag-123', 2900, $2, 'credit_card', $3)", [p.assinatura_id, situacao, paga]));
    await registrar('pendente', null);
    await registrar('aprovada', new Date().toISOString());
    const minhas = await como(db, u, tx => tx.query<{ situacao: string; valor_centavos: number; ambiente: string }>('select situacao, valor_centavos, ambiente from public.cobrancas'));
    assert.deepStrictEqual(minhas.rows, [{ situacao: 'aprovada', valor_centavos: 2900, ambiente: 'teste' }]);
    assert.strictEqual((await como(db, outro, tx => tx.query('select * from public.cobrancas'))).rows.length, 0);
    await assert.rejects(comoServidor(db, tx => tx.query("select public.cobranca_registrar('00000000-0000-0000-0000-000000000000', 'pag-x', 1, 'aprovada', null, null)")), /assinatura_inexistente/);
  });

  it('o mesmo aviso (mesmo x-request-id) não é registrado duas vezes; sem request-id, sempre é novo', async () => {
    const registrar = (req: string | null) =>
      comoServidor(db, tx => tx.query<{ r: string | null }>("select public.mp_evento_registrar('teste', 'subscription_preapproval', 'mp-1', $1) as r", [req])).then(r => r.rows[0].r);
    const primeiro = await registrar('req-1');
    assert.ok(primeiro);
    assert.strictEqual(await registrar('req-1'), null, 'repetido');
    assert.ok(await registrar('req-2'));
    assert.ok(await registrar(null));
    assert.ok(await registrar(null));
    await comoServidor(db, tx => tx.query("select public.mp_evento_concluir($1, 'ok')", [primeiro]));
    const l = await db.query<{ resultado: string; processado_em: string | null }>('select resultado, processado_em from public.mp_eventos where id = $1', [primeiro]);
    assert.strictEqual(l.rows[0].resultado, 'ok');
    assert.ok(l.rows[0].processado_em);
  });

  it('aviso que falhou é descartado para o reenvio entrar de novo; aviso concluído não pode ser descartado', async () => {
    const registrar = (req: string) =>
      comoServidor(db, tx => tx.query<{ r: string | null }>("select public.mp_evento_registrar('teste', 'subscription_preapproval', 'mp-9', $1) as r", [req])).then(r => r.rows[0].r);
    const descartar = (id: string) => comoServidor(db, tx => tx.query('select public.mp_evento_descartar($1)', [id]));
    const falhou = (await registrar('req-falha'))!;
    assert.strictEqual(await registrar('req-falha'), null, 'o reenvio idêntico é barrado enquanto o registro existe');
    await descartar(falhou);
    assert.ok(await registrar('req-falha'), 'descartado o registro, o reenvio entra de novo');
    const feito = (await registrar('req-feito'))!;
    await comoServidor(db, tx => tx.query("select public.mp_evento_concluir($1, 'aplicado')", [feito]));
    await descartar(feito);
    assert.strictEqual(await registrar('req-feito'), null, 'o aviso concluído continua registrado');
  });

  it('o navegador não chama as funções nem lê os avisos nem escreve nas tabelas da cobrança', async () => {
    const u = await criarUsuario(db, 'j@exemplo.com');
    await assert.rejects(como(db, u, tx => tx.query('select * from public.assinatura_criar_pendente($1, $2, $3)', [u, 'essencial', 'teste'])), /permission denied/);
    await assert.rejects(como(db, u, tx => tx.query("select public.assinatura_aplicar($1, 'ativa', 'x', null)", ['00000000-0000-0000-0000-000000000000'])), /permission denied/);
    await assert.rejects(como(db, u, tx => tx.query("select public.mp_evento_registrar('teste', 't', 'r', null)")), /permission denied/);
    await assert.rejects(como(db, u, tx => tx.query('select * from public.mp_eventos')), /permission denied/);
    await assert.rejects(como(db, null, tx => tx.query('select * from public.cobrancas')), /permission denied/);
    await assert.rejects(como(db, u, tx => tx.query("insert into public.cobrancas (usuario_id, mp_pagamento_id, ambiente, valor_centavos, situacao) values ($1, 'x', 'teste', 1, 'aprovada')", [u])), /permission denied/);
    await assert.rejects(como(db, u, tx => tx.query("update public.planos set preco_mensal_centavos = 1 where id = 'essencial'")), /permission denied/);
    // O preço do plano é público (a tela de planos o mostra)
    const preco = await como(db, null, tx => tx.query<{ preco: number }>("select preco_mensal_centavos as preco from public.planos where id = 'essencial'"));
    assert.strictEqual(preco.rows[0].preco, 2900);
  });
});
