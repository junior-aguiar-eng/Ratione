import { before, after, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { PGlite } from '@electric-sql/pglite';
import { aplicarMigracao, como, criarBanco, criarUsuario } from './harness';

type Tx = Parameters<Parameters<PGlite['transaction']>[0]>[0];
const servidor = <T>(db: PGlite, fn: (tx: Tx) => Promise<T>) => db.transaction(async tx => { await tx.exec('set local role service_role'); return fn(tx); });
interface Relatorio {
  inicio: string; fim: string;
  planos: Array<{ plano: string; custo_real_usd: number; reservado_usd: number; receita_centavos: number; reembolsado_centavos: number }>;
  fundos: Array<{ fundo: string; orcamento_usd: number; custo_real_usd: number; reservado_usd: number }>;
  teste_aprovado_centavos: number;
  clientes: Array<{ usuario_id: string; custo_real_usd: number; reservado_usd: number }>;
  total_clientes: number;
}
const resumo = (db: PGlite, pagina = 0) => servidor(db, tx => tx.query<{ r: Relatorio }>('select public.admin_financeiro($1) as r', [pagina])).then(r => r.rows[0].r);

describe('Painel administrativo: agregação e privilégios', () => {
  let db: PGlite;
  let u: string;
  before(async () => { db = await criarBanco(); u = await criarUsuario(db, 'admin-teste@exemplo.com'); });
  after(async () => { await db?.close(); });

  it('o agregado completo é exclusivo do servidor; clientes mantêm acesso apenas às próprias linhas', async () => {
    for (const id of [null, u]) await assert.rejects(como(db, id, tx => tx.query('select public.admin_financeiro()')), /permission denied/);
    const r = await resumo(db);
    assert.equal(r.planos.length, 4);
    assert.equal(r.total_clientes, 0);
    assert.deepEqual(r.clientes, []);
  });

  it('registra o plano do momento sem reclassificar o gasto quando a conta muda de plano', async () => {
    await db.query("insert into public.ia_uso (usuario_id,tarefa,referencia,chave,situacao,fundo,custo_usd) values ($1,'teste','x','x','gerada','gratuito',0.001)", [u]);
    await db.query("insert into public.assinaturas (usuario_id,plano_id,situacao,ciclo_fim) values ($1,'essencial','ativa',now()+interval '1 month')", [u]);
    await db.query("insert into public.ia_uso (usuario_id,tarefa,referencia,chave,situacao,fundo,custo_usd) values ($1,'teste','x','x','reservada','pagantes',0.2)", [u]);
    const r = await resumo(db);
    assert.equal(r.planos.find(p => p.plano === 'gratuito')!.custo_real_usd, 0.001);
    assert.equal(r.planos.find(p => p.plano === 'essencial')!.reservado_usd, 0.2);
    assert.equal(r.clientes[0].custo_real_usd, 0.001);
    assert.equal(r.clientes[0].reservado_usd, 0.2);
  });

  it('separa receita de produção, teste, reembolsos e meses fora da janela de Brasília', async () => {
    const a = await db.query<{ id: string }>("select id from public.assinaturas where usuario_id=$1", [u]);
    for (const [id, ambiente, situacao, valor] of [
      ['p1','producao','aprovada',2900], ['p2','producao','reembolsada',1000],
      ['p3','teste','aprovada',9000], ['p4','producao','pendente',8000], ['p5','producao','rejeitada',7000]
    ]) await db.query('insert into public.cobrancas (usuario_id,assinatura_id,mp_pagamento_id,ambiente,situacao,valor_centavos) values ($1,$2,$3,$4,$5,$6)', [u,a.rows[0].id,id,ambiente,situacao,valor]);
    await db.query("insert into public.cobrancas (usuario_id,assinatura_id,mp_pagamento_id,ambiente,situacao,valor_centavos,criada_em) values ($1,$2,'antiga','producao','aprovada',999999,(date_trunc('month',now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo')-interval '1 microsecond')", [u,a.rows[0].id]);
    const r = await resumo(db);
    assert.equal(r.planos.find(p => p.plano === 'essencial')!.receita_centavos, 2900);
    assert.equal(r.planos.find(p => p.plano === 'essencial')!.reembolsado_centavos, 1000);
    assert.equal(r.teste_aprovado_centavos, 9000);
    assert.equal(new Date(r.inicio).getUTCHours(), 3);
  });

  it('agrega mais de mil usos e pagina os clientes sem limitar os totais', async () => {
    await db.query("insert into public.ia_uso (usuario_id,tarefa,referencia,chave,situacao,fundo,custo_usd) select $1,'teste','x','x','gerada','pagantes',0.000001 from generate_series(1,1001)", [u]);
    for (let i=0;i<21;i++) {
      const id = await criarUsuario(db, `cliente-${i}@exemplo.com`);
      await db.query("insert into public.ia_uso (usuario_id,tarefa,referencia,chave,situacao,fundo,custo_usd) values ($1,'teste','x','x','gerada','gratuito',0.01)", [id]);
    }
    const primeira = await resumo(db);
    const segunda = await resumo(db, 1);
    assert.equal(primeira.planos.find(p=>p.plano==='essencial')!.custo_real_usd, 0.001001);
    assert.equal(primeira.total_clientes, 22);
    assert.equal(primeira.clientes.length, 20);
    assert.equal(segunda.clientes.length, 2);
    assert.equal(new Set([...primeira.clientes,...segunda.clientes].map(c=>c.usuario_id)).size,22);
    assert.deepEqual(primeira.planos, segunda.planos);
    await assert.rejects(resumo(db,-1), /página inválida/);
  });

  it('a atualização da mesma cobrança preserva o plano registrado na primeira gravação', async () => {
    const a = await db.query<{ id: string }>('select id from public.assinaturas where usuario_id=$1', [u]);
    const registrar = () => servidor(db,tx=>tx.query("select public.cobranca_registrar($1,'snapshot',2900,'aprovada','visa',now())",[a.rows[0].id]));
    await registrar();
    await db.query("update public.assinaturas set plano_id='profissional' where id=$1",[a.rows[0].id]);
    await registrar();
    const r = await db.query<{ plano_id: string }>("select plano_id from public.cobrancas where mp_pagamento_id='snapshot'");
    assert.equal(r.rows[0].plano_id,'essencial');
  });

  it('exclui usos fora do mês e cache, incluindo somente o início exato da janela', async () => {
    const antes = await resumo(db);
    const soma = (r: Relatorio) => r.planos.reduce((s,p)=>s+p.custo_real_usd,0);
    for (const [situacao, custo, deslocamento] of [['gerada',500,"- interval '1 microsecond'"],['gerada',600,"+ interval '1 month'"],['cache',100,''],['gerada',0.000002,'']] as const) {
      await db.query(`insert into public.ia_uso (usuario_id,tarefa,referencia,chave,situacao,fundo,custo_usd,criado_em) values ($1,'teste','x','x',$2,'pagantes',$3,(date_trunc('month',now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo') ${deslocamento})`,[u,situacao,custo]);
    }
    assert.ok(Math.abs(soma(await resumo(db))-soma(antes)-0.000002)<1e-12);
  });
});

describe('Painel administrativo: migração sobre dados existentes', () => {
  it('não atribui plano histórico por suposição nem altera custo, receita ou limite dos fundos', async () => {
    const db = await criarBanco('20261023000003_cobranca_mercadopago');
    try {
      const u = await criarUsuario(db, 'legado@exemplo.com');
      await db.query("insert into public.ia_uso (usuario_id,tarefa,referencia,chave,situacao,fundo,custo_usd) values ($1,'teste','x','x','gerada','gratuito',0.123456)", [u]);
      await db.query("insert into public.cobrancas (usuario_id,mp_pagamento_id,ambiente,valor_centavos,situacao) values ($1,'legado','producao',1900,'aprovada')", [u]);
      const antes = await db.query('select * from public.ia_fundos order by fundo');
      await aplicarMigracao(db, '20261024000001_painel_administrativo');
      const r = await resumo(db);
      const semPlano = r.planos.find(p=>p.plano==='sem_atribuicao')!;
      assert.equal(semPlano.custo_real_usd,0.123456);
      assert.equal(semPlano.receita_centavos,1900);
      assert.deepEqual((await db.query('select * from public.ia_fundos order by fundo')).rows,antes.rows);
    } finally { await db.close(); }
  });
});
