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
const chamar = (db: PGlite, funcao: string, analise: string, usuario: string) =>
  comoServidor(db, tx => tx.query<{ r: unknown }>(`select public.${funcao}($1, $2) as r`, [analise, usuario])).then(r => r.rows[0].r);
const situacao = (db: PGlite, analise: string) =>
  db.query<{ situacao: string; consumiu: boolean; falhas: number }>('select situacao, consumiu, falhas from public.analises where id = $1', [analise]).then(r => r.rows[0]);

describe('Planos e cota por análise (F8-02 e F8-03)', () => {
  let db: PGlite;
  before(async () => {
    db = await criarBanco();
  });

  it('o catálogo traz os três planos e as cotas combinadas, legível por qualquer visitante', async () => {
    const planos = await como(db, null, tx => tx.query<{ id: string; periodo: string }>('select id, periodo from public.planos order by ordem'));
    assert.deepStrictEqual(planos.rows, [
      { id: 'gratuito', periodo: 'semana' },
      { id: 'essencial', periodo: 'mes' },
      { id: 'profissional', periodo: 'mes' }
    ]);
    const cotas = await como(db, null, tx => tx.query<{ plano_id: string; tipo: string; quantidade: number }>('select * from public.plano_cotas where quantidade > 0 order by plano_id, tipo'));
    const por = Object.fromEntries(cotas.rows.map(c => [`${c.plano_id}/${c.tipo}`, c.quantidade]));
    assert.deepStrictEqual(por, {
      'essencial/explicacao': 200,
      'essencial/rapida': 40,
      'gratuito/explicacao': 10,
      'gratuito/rapida': 3,
      'profissional/completa': 25,
      'profissional/explicacao': 500,
      'profissional/rapida': 150
    });
  });

  it('o gratuito tem 3 análises rápidas por semana: a 4ª é barrada, com o motivo e a data de renovação', async () => {
    const ana = await criarUsuario(db, 'ana@exemplo.com');
    const primeira = await iniciar(db, ana);
    assert.strictEqual(primeira.ok, true);
    assert.strictEqual(primeira.plano, 'gratuito');
    assert.strictEqual(primeira.restantes, 2);
    for (const id of [primeira.analise_id!, (await iniciar(db, ana)).analise_id!, (await iniciar(db, ana)).analise_id!]) {
      if (id) await chamar(db, 'analise_consumir', id, ana);
    }
    const quarta = await iniciar(db, ana);
    assert.strictEqual(quarta.ok, false);
    assert.strictEqual(quarta.motivo, 'limite_periodo');
    assert.ok(new Date(quarta.renova_em).getTime() > Date.now(), 'a renovação é no futuro');
    assert.ok(new Date(quarta.renova_em).getTime() - Date.now() <= 7 * 24 * 3600 * 1000, 'dentro de uma semana');
    // O limite é por tipo e por usuário
    assert.strictEqual((await iniciar(db, ana, 'explicacao')).ok, true);
    assert.strictEqual((await iniciar(db, await criarUsuario(db, 'beto@exemplo.com'))).ok, true);
  });

  it('o gratuito não tem análise completa', async () => {
    const dani = await criarUsuario(db, 'dani@exemplo.com');
    assert.strictEqual((await iniciar(db, dani, 'completa')).motivo, 'sem_cota_no_plano');
    await assert.rejects(iniciar(db, dani, 'qualquer'), /tipo de análise inválido/);
  });

  it('a semana vira na segunda-feira: análise de semanas anteriores não conta', async () => {
    const eva = await criarUsuario(db, 'eva@exemplo.com');
    for (let i = 0; i < 3; i++) {
      await db.query("insert into public.analises (usuario_id, tipo, consumiu, situacao, criada_em) values ($1, 'rapida', true, 'concluida', now() - interval '8 days')", [eva]);
    }
    const r = await iniciar(db, eva);
    assert.strictEqual(r.ok, true, 'as 3 de 8 dias atrás não contam');
    assert.strictEqual(r.restantes, 2);
  });

  it('uma análise em andamento reserva a vaga por 15 minutos e depois deixa de contar', async () => {
    const fabi = await criarUsuario(db, 'fabi@exemplo.com');
    for (let i = 0; i < 3; i++) assert.strictEqual((await iniciar(db, fabi)).ok, true);
    assert.strictEqual((await iniciar(db, fabi)).motivo, 'limite_periodo', 'as 3 reservas valem');
    await db.query("update public.analises set criada_em = now() - interval '16 minutes' where usuario_id = $1", [fabi]);
    assert.strictEqual((await iniciar(db, fabi)).ok, true, 'reservas abandonadas há mais de 15 minutos não contam');
  });

  it('consumir, concluir e cancelar só valem para o dono e para análise em andamento', async () => {
    const gabi = await criarUsuario(db, 'gabi@exemplo.com');
    const hugo = await criarUsuario(db, 'hugo@exemplo.com');
    const id = (await iniciar(db, gabi)).analise_id!;
    assert.strictEqual(await chamar(db, 'analise_consumir', id, hugo), false, 'de outro usuário');
    assert.strictEqual((await situacao(db, id)).consumiu, false);
    assert.strictEqual(await chamar(db, 'analise_consumir', id, gabi), true);
    assert.strictEqual(await chamar(db, 'analise_cancelar', id, gabi), false, 'depois de consumir não se cancela');
    assert.strictEqual(await chamar(db, 'analise_concluir', id, gabi), true);
    assert.strictEqual((await situacao(db, id)).situacao, 'concluida');
    assert.strictEqual(await chamar(db, 'analise_consumir', id, gabi), false, 'já concluída');
    const outra = (await iniciar(db, gabi)).analise_id!;
    assert.strictEqual(await chamar(db, 'analise_cancelar', outra, gabi), true);
    assert.strictEqual((await situacao(db, outra)).situacao, 'cancelada');
  });

  it('falha depois de entregar a 1ª etapa: tenta de novo uma vez; na 2ª falha a cota é estornada', async () => {
    const ines = await criarUsuario(db, 'ines@exemplo.com');
    const id = (await iniciar(db, ines)).analise_id!;
    await chamar(db, 'analise_consumir', id, ines);
    assert.strictEqual(await chamar(db, 'analise_falha', id, ines), 'em_andamento', '1ª falha: o cliente pode tentar de novo');
    assert.strictEqual((await situacao(db, id)).consumiu, true);
    assert.strictEqual(await chamar(db, 'analise_falha', id, ines), 'falhou', '2ª falha: não tem solução');
    const s = await situacao(db, id);
    assert.deepStrictEqual({ situacao: s.situacao, consumiu: s.consumiu }, { situacao: 'falhou', consumiu: false }, 'estorno');
    // Estornada, a vaga volta: 3 análises ainda cabem nesta semana
    for (let i = 0; i < 3; i++) assert.strictEqual((await iniciar(db, ines)).ok, true);
  });

  it('falha antes de entregar qualquer etapa não consome e só desiste na 3ª', async () => {
    const jo = await criarUsuario(db, 'jo@exemplo.com');
    const id = (await iniciar(db, jo)).analise_id!;
    assert.strictEqual(await chamar(db, 'analise_falha', id, jo), 'em_andamento');
    assert.strictEqual(await chamar(db, 'analise_falha', id, jo), 'em_andamento');
    assert.strictEqual(await chamar(db, 'analise_falha', id, jo), 'falhou');
    assert.strictEqual((await situacao(db, id)).consumiu, false);
    assert.strictEqual(await chamar(db, 'analise_falha', id, jo), null, 'depois de falhar de vez, nada muda');
  });

  it('o plano pago vale por ciclo: Essencial tem 40 por mês; cancelada vale até o fim do ciclo pago; vencida volta ao gratuito', async () => {
    const lia = await criarUsuario(db, 'lia@exemplo.com');
    await comoServidor(db, tx =>
      tx.query("insert into public.assinaturas (usuario_id, plano_id, situacao, ciclo_inicio, ciclo_fim) values ($1, 'essencial', 'ativa', now() - interval '10 days', now() + interval '20 days')", [lia])
    );
    const r = await iniciar(db, lia);
    assert.strictEqual(r.plano, 'essencial');
    assert.strictEqual(r.restantes, 39);
    // O ciclo é de um mês (28 a 31 dias) contado de 10 dias atrás: renova entre 18 e 21 dias daqui
    const dias = (new Date(r.renova_em).getTime() - Date.now()) / (24 * 3600 * 1000);
    assert.ok(dias > 17.5 && dias < 21.5, `renova em ~20 dias (deu ${dias.toFixed(1)})`);

    await db.query("update public.assinaturas set situacao = 'cancelada' where usuario_id = $1", [lia]);
    assert.strictEqual((await iniciar(db, lia)).plano, 'essencial', 'cancelada vale até o fim do ciclo pago');
    await db.query("update public.assinaturas set ciclo_fim = now() - interval '1 hour' where usuario_id = $1", [lia]);
    assert.strictEqual((await iniciar(db, lia)).plano, 'gratuito', 'vencida, volta ao gratuito');

    const atraso = await criarUsuario(db, 'atraso@exemplo.com');
    await db.query("insert into public.assinaturas (usuario_id, plano_id, situacao, ciclo_inicio, ciclo_fim) values ($1, 'essencial', 'em_atraso', now() - interval '31 days', now() - interval '1 day')", [atraso]);
    assert.strictEqual((await iniciar(db, atraso)).plano, 'essencial', 'em atraso: carência de 3 dias');
    await db.query("update public.assinaturas set ciclo_fim = now() - interval '4 days' where usuario_id = $1", [atraso]);
    assert.strictEqual((await iniciar(db, atraso)).plano, 'gratuito', 'carência acabou');

    const pendente = await criarUsuario(db, 'pendente@exemplo.com');
    await db.query("insert into public.assinaturas (usuario_id, plano_id, situacao) values ($1, 'profissional', 'pendente')", [pendente]);
    assert.strictEqual((await iniciar(db, pendente)).plano, 'gratuito', 'pendente ainda é gratuito');
  });

  it('a janela mensal acompanha o aniversário do ciclo e conta só o que caiu nela', async () => {
    const mia = await criarUsuario(db, 'mia@exemplo.com');
    // Ciclo começou há 40 dias: a janela atual começou há ~10 dias
    await db.query("insert into public.assinaturas (usuario_id, plano_id, situacao, ciclo_inicio) values ($1, 'essencial', 'ativa', now() - interval '40 days')", [mia]);
    await db.query("insert into public.analises (usuario_id, tipo, consumiu, situacao, criada_em) values ($1, 'rapida', true, 'concluida', now() - interval '20 days')", [mia]);
    await db.query("insert into public.analises (usuario_id, tipo, consumiu, situacao, criada_em) values ($1, 'rapida', true, 'concluida', now() - interval '5 days')", [mia]);
    const r = await iniciar(db, mia);
    assert.strictEqual(r.restantes, 40 - 1 - 1, 'a de 20 dias atrás é do ciclo anterior; contam a de 5 dias e esta');
  });

  it('o cliente vê só o próprio plano e uso; o navegador não escreve nem chama as funções internas', async () => {
    const nina = await criarUsuario(db, 'nina@exemplo.com');
    const id = (await iniciar(db, nina, 'explicacao')).analise_id!;
    await chamar(db, 'analise_consumir', id, nina);
    const resumo = await como(db, nina, tx =>
      tx.query<{ plano: string; tipo: string; quantidade: number; usadas: number; restantes: number }>('select plano, tipo, quantidade, usadas, restantes from public.uso_resumo() order by tipo')
    );
    const exp = resumo.rows.find(r => r.tipo === 'explicacao')!;
    assert.deepStrictEqual({ plano: exp.plano, quantidade: exp.quantidade, usadas: exp.usadas, restantes: exp.restantes }, { plano: 'gratuito', quantidade: 10, usadas: 1, restantes: 9 });
    assert.strictEqual((await como(db, null, tx => tx.query('select * from public.uso_resumo()').catch(() => ({ rows: ['negado'] })))).rows[0], 'negado', 'visitante não chama');

    const proprias = await como(db, nina, tx => tx.query<{ usuario_id: string }>('select usuario_id from public.analises'));
    assert.ok(proprias.rows.length > 0 && proprias.rows.every(r => r.usuario_id === nina));
    assert.strictEqual((await como(db, nina, tx => tx.query('select * from public.assinaturas'))).rows.length, 0);

    await assert.rejects(como(db, nina, tx => tx.query('select * from public.analise_iniciar($1, $2)', [nina, 'rapida'])), /permission denied/);
    await assert.rejects(como(db, nina, tx => tx.query('select public.analise_consumir($1, $2)', [id, nina])), /permission denied/);
    await assert.rejects(como(db, nina, tx => tx.query("insert into public.analises (usuario_id, tipo) values ($1, 'rapida')", [nina])), /permission denied/);
    await assert.rejects(como(db, nina, tx => tx.query("update public.analises set consumiu = false where id = $1", [id])), /permission denied/);
    await assert.rejects(como(db, nina, tx => tx.query("insert into public.assinaturas (usuario_id, plano_id, situacao) values ($1, 'profissional', 'ativa')", [nina])), /permission denied/);
    await assert.rejects(como(db, nina, tx => tx.query("update public.plano_cotas set quantidade = 9999")), /permission denied/);
  });

  it('um usuário não lê as análises nem as assinaturas de outro', async () => {
    const otto = await criarUsuario(db, 'otto@exemplo.com');
    const paula = await criarUsuario(db, 'paula@exemplo.com');
    await iniciar(db, otto);
    await db.query("insert into public.assinaturas (usuario_id, plano_id, situacao) values ($1, 'essencial', 'ativa')", [otto]);
    assert.strictEqual((await como(db, paula, tx => tx.query('select * from public.analises where usuario_id = $1', [otto]))).rows.length, 0);
    assert.strictEqual((await como(db, paula, tx => tx.query('select * from public.assinaturas where usuario_id = $1', [otto]))).rows.length, 0);
    assert.strictEqual((await como(db, otto, tx => tx.query('select * from public.assinaturas'))).rows.length, 1);
  });
});
