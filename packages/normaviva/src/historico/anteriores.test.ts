import { before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { PGlite } from '@electric-sql/pglite';
import { criarBanco, como } from '@ratione/db/harness';
import { inserirNorma, linhasDoCorpus, type LinhaVersao } from '../busca/carga';
import { versaoAnterior } from './anteriores';
import { sqlDeVersoesAnteriores, versoesAnterioresDoCorpus } from './gerar-sql';
import { somarDiasIso } from './datas';
import type { CasoHistorico } from './historico';

const PASTA = join(__dirname, '..', '..', 'corpus');
const casos: CasoHistorico[] = JSON.parse(readFileSync(join(PASTA, 'historico-conhecido.json'), 'utf-8'));
const datasDoSenado = JSON.parse(readFileSync(join(PASTA, 'atos-senado.json'), 'utf-8')) as { normas: Record<string, never> };

describe('Redações anteriores como segunda versão do dispositivo (F3-04)', () => {
  const sem = linhasDoCorpus(PASTA);
  const com = linhasDoCorpus(PASTA, undefined, { comHistorico: true });
  const versoesDe = (normaId: string, dispositivoId: string) => com.find(l => l.norma.id === normaId)!.versoes.filter(v => v.dispositivo_id === dispositivoId);

  it('sem o histórico (padrão) o corpus continua com uma versão por dispositivo; com ele, uma a mais por caso', () => {
    const n = (ls: typeof sem) => ls.reduce((s, l) => s + l.versoes.length, 0);
    assert.equal(n(sem), 29447);
    assert.equal(n(com), 29447 + casos.length);
  });

  it('cada caso tem exatamente duas versões: a vigente (sem fim) e a anterior, que acaba na véspera da publicação do ato da vigente', () => {
    for (const c of casos) {
      const v = versoesDe(c.normaId, c.dispositivoId);
      assert.equal(v.length, 2, c.id);
      const vigente = v.filter(x => x.vigente_ate === null);
      const anterior = v.filter(x => x.vigente_ate !== null);
      assert.equal(vigente.length, 1, c.id);
      assert.equal(anterior.length, 1, c.id);
      assert.equal(vigente[0].texto, c.depois.texto, c.id);
      assert.equal(vigente[0].fonte_do_texto, 'compilado', c.id);
      assert.equal(vigente[0].texto_anterior_disponivel, true, c.id);
      assert.equal(anterior[0].texto, c.antes.texto, c.id);
      assert.equal(anterior[0].fonte_do_texto, 'tachado_planalto', c.id);
      assert.equal(anterior[0].vigente_ate, somarDiasIso(c.depois.vigenteDe, -1), c.id);
      assert.equal(anterior[0].vigencia_confirmada, false, c.id);
      if (anterior[0].vigente_de) assert.ok(anterior[0].vigente_de <= anterior[0].vigente_ate!, `${c.id}: a redação anterior começa depois de acabar`);
    }
  });

  it('o hash é o do texto de cada versão', async () => {
    const { createHash } = await import('node:crypto');
    for (const c of casos.slice(0, 10)) for (const v of versoesDe(c.normaId, c.dispositivoId)) assert.equal(v.hash, createHash('sha256').update(v.texto, 'utf8').digest('hex'), c.id);
  });

  it('redação original: começa na publicação da norma (provisório) e não tem ato', () => {
    const [, anterior] = versoesDe('DL-4657-1942', 'DL-4657-1942|corpo|art. 6º').sort((a, b) => Number(a.vigente_ate !== null) - Number(b.vigente_ate !== null));
    assert.equal(anterior.origem, 'redacao_original');
    assert.equal(anterior.ato_rotulo, null);
    assert.equal(anterior.fonte_da_data, 'norma');
    assert.equal(anterior.vigente_de, '1942-09-04');
    assert.equal(anterior.vigente_ate, '1957-08-02');
  });

  it('redação anterior que o Planalto anota como incluída por um ato guarda a origem e o ano desse ato', () => {
    const v = versoesDe('CF-1988', 'CF-1988|corpo|art. 103-B, § 4º, III').find(x => x.vigente_ate !== null)!;
    assert.equal(v.origem, 'incluido');
    assert.equal(v.ano_do_ato, 2004);
  });

  it('a conferência do revisor vai junto; enquanto não houver, fica nula', () => {
    const base = casos[0];
    const dados = datasDoSenado.normas[base.normaId];
    assert.deepEqual([versaoAnterior(base, dados).conferida_por, versaoAnterior(base, dados).conferida_em], [null, null]);
    const conferido = versaoAnterior({ ...base, validacao: { status: 'validado', por: 'Revisor', em: '2026-11-01' } }, dados);
    assert.deepEqual([conferido.conferida_por, conferido.conferida_em], ['Revisor', '2026-11-01']);
  });

  describe('no banco', () => {
    let db: PGlite;
    before(async () => {
      db = await criarBanco();
      for (const l of linhasDoCorpus(PASTA, ['DL-4657-1942', 'LEI-8078-1990', 'LEI-9099-1995'], { comHistorico: true })) await inserirNorma(db as never, l);
    });

    it('a carga grava as duas versões; a de fonte tachada é a única com fim', async () => {
      const r = await db.query<{ fonte_do_texto: string; vigente_ate: string | null }>(
        "select fonte_do_texto, vigente_ate::text from public.versoes_dispositivo where dispositivo_id = 'DL-4657-1942|corpo|art. 6º' order by vigente_ate nulls last"
      );
      assert.deepEqual(r.rows, [{ fonte_do_texto: 'tachado_planalto', vigente_ate: '1957-08-02' }, { fonte_do_texto: 'compilado', vigente_ate: null }]);
    });

    it('não admite duas redações vigentes (sem fim) para o mesmo dispositivo', async () => {
      const v = linhasDoCorpus(PASTA, ['DL-4657-1942'])[0].versoes.find(x => x.dispositivo_id === 'DL-4657-1942|corpo|art. 1º')!;
      await assert.rejects(
        db.query('insert into public.versoes_dispositivo (dispositivo_id, texto, origem, conhecido_em, hash) values ($1, $2, $3, $4, $5)', [v.dispositivo_id, 'outra vigente', 'redacao_dada', '2026-10-21', 'a'.repeat(64)]),
        /versoes_dispositivo_vigente_idx|duplicate key/
      );
    });

    it('quem confere informa quem e quando, os dois juntos', async () => {
      await assert.rejects(db.query("update public.versoes_dispositivo set conferida_por = 'Revisor' where dispositivo_id = 'DL-4657-1942|corpo|art. 6º' and vigente_ate is not null"), /versoes_dispositivo_conferida_junto/);
    });

    it('o visitante (sem login) lê as redações anteriores, como o resto da base pública', async () => {
      const r = await como(db, null, tx => tx.query("select texto from public.versoes_dispositivo where dispositivo_id = 'LEI-9099-1995|corpo|art. 83, § 2º' and fonte_do_texto = 'tachado_planalto'"));
      assert.equal(r.rows.length, 1);
    });
  });
});

describe('SQL que leva as redações anteriores ao banco já carregado (F3-04)', () => {
  const arquivo = join(__dirname, '..', '..', '..', '..', 'supabase', 'correcoes', '20261021_versoes_anteriores.sql');
  const sql = readFileSync(arquivo, 'utf-8');

  it('o arquivo versionado é o que o gerador produz do corpus (regenere com `pnpm historico:sql` se os casos mudarem)', () => {
    assert.equal(sql, sqlDeVersoesAnteriores(versoesAnterioresDoCorpus()));
    assert.equal(sql.split('\n').filter(l => l.startsWith('  ($t$')).length, casos.length);
  });

  it('aplicado sobre o banco carregado SEM o histórico, deixa a tabela de versões idêntica à de uma carga COM o histórico, e rodar de novo não muda nada', async () => {
    const colunas =
      'select dispositivo_id, texto, origem, ato_chave, ato_rotulo, ato_assinatura::text, ato_publicacao::text, ano_do_ato, fonte_da_data, vigente_de::text, vigente_ate::text, vigencia_confirmada, texto_anterior_disponivel, conhecido_em::text, hash, fonte_do_texto, conferida_por, conferida_em::text from public.versoes_dispositivo order by dispositivo_id, vigente_ate nulls last';
    const carregar = async (comHistorico: boolean) => {
      const db = await criarBanco();
      for (const l of linhasDoCorpus(PASTA, undefined, { comHistorico })) await inserirNorma(db as never, l);
      return db;
    };
    const antigo = await carregar(false);
    const alvo = (await (await carregar(true)).query(colunas)).rows;
    await antigo.exec(sql);
    const apos = (await antigo.query(colunas)).rows;
    assert.equal(apos.length, 29447 + casos.length);
    assert.deepEqual(apos, alvo);
    await antigo.exec(sql);
    assert.deepEqual((await antigo.query(colunas)).rows, alvo);
  });
});

/** Só para o tipo: a linha de versão tem os campos novos. */
const _forma: Pick<LinhaVersao, 'vigente_ate' | 'fonte_do_texto' | 'conferida_por' | 'conferida_em'> = { vigente_ate: null, fonte_do_texto: 'compilado', conferida_por: null, conferida_em: null };
void _forma;
