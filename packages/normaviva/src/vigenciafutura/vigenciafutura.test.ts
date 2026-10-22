import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { clausulaDeVigencia, lerVigencia, vigenteEm } from './vigencia';
import { avisosDoArtigo, chaveDoArtigo, type AvisoVigenciaFutura } from './avisos';
import { alteracoesDoAto, executarVigencia, numeroEAno, urlPlanaltoDoAto, type DependenciasVigencia, type DetalheDoAto } from './atualizar';
import type { DocumentoDaLista } from '../atualizacao/feeds';

const ler = (frase: string, publicacao = '2026-04-01') => {
  const clausula = clausulaDeVigencia(`Art. 13. As despesas correrão. ${frase} Brasília, 31 de março de 2026.`);
  const v = lerVigencia(clausula, `Art. 13. As despesas correrão. ${frase} Brasília, 31 de março de 2026.`);
  return { clausula, v, em: vigenteEm(v, publicacao) };
};

describe('Cláusula de vigência', () => {
  it('Lei 15.371/2026, art. 14: data certa (lida no Planalto em 22/10/2026)', () => {
    const r = ler('Art. 14. Esta Lei entra em vigor no dia 1º de janeiro de 2027 .');
    assert.equal(r.clausula, 'Art. 14. Esta Lei entra em vigor no dia 1º de janeiro de 2027');
    assert.deepEqual(r.v, { tipo: 'data', em: '2027-01-01' });
    assert.equal(r.em, '2027-01-01');
  });

  it('na data da publicação', () => {
    const r = ler('Art. 2º Esta Lei entra em vigor na data de sua publicação.');
    assert.deepEqual(r.v, { tipo: 'publicacao' });
    assert.equal(r.em, '2026-04-01');
  });

  it('"na data da sua publicação" (Lei 15.163/2025, art. 6º) é a mesma coisa', () => {
    assert.deepEqual(ler('Art. 6º Esta Lei entra em vigor na data da sua publicação.').v, { tipo: 'publicacao' });
  });

  it('prazo contado da publicação: em dias é a publicação mais N dias (LC 95/98, art. 8º, § 2º)', () => {
    const r = ler('Art. 5º Esta Lei entra em vigor após decorridos 45 (quarenta e cinco) dias de sua publicação oficial.', '2026-01-01');
    assert.deepEqual(r.v, { tipo: 'prazo', quantidade: 45, unidade: 'dias' });
    assert.equal(r.em, '2026-02-15');
  });

  it('prazo em meses e anos mantém o dia do mês, ou o último dia do mês de destino', () => {
    assert.equal(ler('Art. 9º Esta Lei entra em vigor após decorridos 6 (seis) meses de sua publicação.', '2026-01-05').em, '2026-07-05');
    assert.equal(ler('Art. 9º Esta Lei entra em vigor após decorridos 6 (seis) meses de sua publicação.', '2026-08-31').em, '2027-02-28');
    assert.equal(ler('Art. 9º Esta Lei entra em vigor decorrido 1 (um) ano da data de sua publicação.', '2026-03-10').em, '2027-03-10');
    assert.deepEqual(ler('Art. 9º Esta Lei entra em vigor após decorridos cento e oitenta dias de sua publicação.').v, { tipo: 'prazo', quantidade: 180, unidade: 'dias' });
  });

  it('"produzindo efeitos", sem cláusula ou prazo que a leitura não entende: complexa, sem data inventada', () => {
    assert.equal(ler('Art. 9º Esta Lei entra em vigor na data de sua publicação, produzindo efeitos a partir de 1º de janeiro de 2027.').v.tipo, 'complexa');
    assert.equal(ler('Art. 9º Esta Lei entra em vigor no primeiro dia do mês subsequente ao da publicação.').v.tipo, 'complexa');
    assert.deepEqual(lerVigencia(''), { tipo: 'complexa' });
    assert.equal(vigenteEm({ tipo: 'complexa' }, '2026-04-01'), null);
  });

  it('só vale a cláusula do próprio ato, não "entra em vigor" de texto citado', () => {
    const texto = 'Art. 3º O art. 10 passa a ter a redação: "Art. 10. A norma entra em vigor em 1º de março de 2030." (NR) Art. 4º Esta Lei entra em vigor na data de sua publicação.';
    assert.deepEqual(lerVigencia(clausulaDeVigencia(texto), texto), { tipo: 'publicacao' });
  });
});

describe('Aviso por artigo', () => {
  const aviso: AvisoVigenciaFutura = {
    ato: 'Lei nº 15.371 de 31/03/2026', chave: 'lei:15371:2026', publicacao: '2026-04-01', vigencia: { tipo: 'data', em: '2027-01-01' }, vigenteEm: '2027-01-01',
    clausula: 'Art. 14. Esta Lei entra em vigor no dia 1º de janeiro de 2027', ementa: '', fonte: { url: 'https://x', lidoEm: '2026-10-22' },
    alteracoes: [{ normaId: 'DL-5452-1943', artigos: ['131', '392-a'], dispositivos: [] }]
  };

  it('a chave do artigo ignora ordinal, ponto de milhar, parágrafos e maiúsculas', () => {
    assert.equal(chaveDoArtigo('art. 392-A'), '392-a');
    assert.equal(chaveDoArtigo('Art. 134, § 4 '), '134');
    assert.equal(chaveDoArtigo('art. 1.015, § 2º'), '1015');
    assert.equal(chaveDoArtigo('Art. 5º'), '5');
    assert.equal(chaveDoArtigo('parágrafo único'), null);
  });

  it('o aviso aparece no artigo da norma certa, só enquanto a data não chegou', () => {
    assert.equal(avisosDoArtigo('DL-5452-1943', 'art. 392-A', '2026-10-22', [aviso]).length, 1);
    assert.equal(avisosDoArtigo('DL-5452-1943', 'art. 392', '2026-10-22', [aviso]).length, 0, '392 não é 392-A');
    assert.equal(avisosDoArtigo('LEI-8213-1991', 'art. 131', '2026-10-22', [aviso]).length, 0, 'outra norma');
    assert.equal(avisosDoArtigo('DL-5452-1943', 'art. 131', '2027-01-01', [aviso]).length, 0, 'na data, o Planalto passa a consolidar');
    assert.equal(avisosDoArtigo('DL-5452-1943', 'art. 131', '2027-06-01', [{ ...aviso, vigenteEm: null, vigencia: { tipo: 'complexa' } }]).length, 1, 'vigência complexa segue até alguém resolver');
  });
});

describe('Endereço do ato no Planalto', () => {
  it('lei e lei complementar do período atual', () => {
    assert.equal(urlPlanaltoDoAto('LEI-n', '15371', '2026'), 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/lei/L15371.htm');
    assert.equal(urlPlanaltoDoAto('LCP', '214', '2025'), 'https://www.planalto.gov.br/ccivil_03/leis/lcp/Lcp214.htm');
    assert.equal(urlPlanaltoDoAto('LEI-n', '13105', '2015'), 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/L13105.htm');
    assert.equal(urlPlanaltoDoAto('LEI-n', '1', '1999'), null);
  });
  it('número e ano vêm do campo `norma` da lista ou do nome', () => {
    assert.deepEqual(numeroEAno({ tipo: 'LEI-n', normaNome: 'x', ementa: '', dataassinatura: '', norma: 'LEI-15371-2026-03-31' }), { numero: '15371', ano: '2026' });
    assert.deepEqual(numeroEAno({ tipo: 'LEI-n', normaNome: 'Lei nº 15.371 de 31/03/2026', ementa: '', dataassinatura: '' }), { numero: '15371', ano: '2026' });
  });
});

describe('Execução', () => {
  const lei = (n: string, ementa: string, data = '31/03/2026'): DocumentoDaLista => ({ tipo: 'LEI-n', normaNome: `Lei nº ${n} de ${data}`, ementa, dataassinatura: data, norma: `LEI-${n.replace('.', '')}-${data.slice(6)}-03-31` });
  const CLT = 'Altera a Consolidação das Leis do Trabalho, aprovada pelo Decreto-Lei nº 5.452, de 1º de maio de 1943.';
  const detalheClt: DetalheDoAto = { ementa: CLT, publicacao: '2026-04-01', altera: [{ nomeNorma: 'Decreto-Lei nº 5.452 de 01/05/1943', itens: [{ dispositivo: 'Art. 131, caput, Inciso 2 ', acao: 'Alteração' }, { dispositivo: 'Art. 392-A, § 4 ', acao: 'Acréscimo' }] }] };
  const base = (sobre: Partial<DependenciasVigencia> = {}): DependenciasVigencia => ({
    hoje: () => '2026-10-22',
    normas: () => ['DL-5452-1943', 'LEI-8213-1991'],
    arquivo: () => ({ geradoEm: '2026-10-01', avisos: [], examinados: {} }),
    textoDaNorma: () => '',
    listaDoAno: async ano => (ano === 2026 ? [lei('15.371', CLT), lei('15.400', 'Dispõe sobre o Ministério X.')] : []),
    detalheDoAto: async () => detalheClt,
    textoDoAto: async () => ({ url: 'https://www.planalto.gov.br/x', texto: 'Art. 14. Esta Lei entra em vigor no dia 1º de janeiro de 2027 .' }),
    ...sobre
  });

  it('lei com vigência futura que altera norma do corpus vira aviso, com os artigos do Senado', async () => {
    const r = await executarVigencia(base());
    assert.deepEqual(r.novos, ['Lei nº 15.371 de 31/03/2026']);
    const a = r.arquivo.avisos[0];
    assert.equal(a.vigenteEm, '2027-01-01');
    assert.deepEqual(a.alteracoes[0], { normaId: 'DL-5452-1943', artigos: ['131', '392-a'], dispositivos: [{ dispositivo: 'Art. 131, caput, Inciso 2', acao: 'Alteração' }, { dispositivo: 'Art. 392-A, § 4', acao: 'Acréscimo' }] });
    assert.equal(r.arquivo.examinados['lei:15400:2026'], 'nao_cita_o_corpus');
    assert.deepEqual(r.erros, []);
  });

  it('lei já em vigor é examinada e esquecida; examinada não é relida', async () => {
    let lidos = 0;
    const r = await executarVigencia(base({ textoDoAto: async () => (lidos++, { url: 'u', texto: 'Art. 14. Esta Lei entra em vigor na data de sua publicação.' }) }));
    assert.equal(r.arquivo.avisos.length, 0);
    assert.equal(r.arquivo.examinados['lei:15371:2026'], 'em_vigor');
    await executarVigencia(base({ arquivo: () => r.arquivo, textoDoAto: async () => (lidos++, { url: 'u', texto: '' }) }));
    assert.equal(lidos, 1);
  });

  it('aviso sai quando a data chega ou quando o texto do corpus já cita o ato; sem mudança, nada é "novo"', async () => {
    const primeiro = await executarVigencia(base());
    const mesmo = await executarVigencia(base({ arquivo: () => primeiro.arquivo }));
    assert.deepEqual([mesmo.novos, mesmo.removidos], [[], []]);
    const chegou = await executarVigencia(base({ hoje: () => '2027-01-02', arquivo: () => primeiro.arquivo }));
    assert.deepEqual(chegou.removidos, ['Lei nº 15.371 de 31/03/2026']);
    const consolidado = await executarVigencia(base({ arquivo: () => primeiro.arquivo, textoDaNorma: () => '(Redação dada pela Lei nº 15.371, de 31.3.2026)' }));
    assert.deepEqual(consolidado.removidos, ['Lei nº 15.371 de 31/03/2026']);
    const vide = await executarVigencia(base({ arquivo: () => primeiro.arquivo, textoDaNorma: () => '(Vide Lei nº 15.371, de 31.3.2026)' }));
    assert.deepEqual(vide.removidos, [], 'um "Vide" não é a consolidação do texto');
  });

  it('falha ao ler um ato não o marca como examinado e não derruba os outros', async () => {
    const r = await executarVigencia(base({ textoDoAto: async () => { throw new Error('HTTP 404'); } }));
    assert.equal(r.arquivo.avisos.length, 0);
    assert.ok(!('lei:15371:2026' in r.arquivo.examinados));
    assert.match(r.erros[0], /Lei nº 15.371.*HTTP 404/);
  });

  it('ato que não altera norma monitorada segundo o Senado é examinado e esquecido', async () => {
    const r = await executarVigencia(base({ detalheDoAto: async () => ({ ...detalheClt, altera: [{ nomeNorma: 'Lei nº 1.234 de 01/01/1960', itens: [] }] }) }));
    assert.equal(r.arquivo.examinados['lei:15371:2026'], 'nao_altera_o_corpus');
  });

  it('item vetado não é alteração: o ato só com vetos na norma é esquecido (Lei 15.269/2025 e o art. 11, XIII, da LIA)', async () => {
    const vetado: DetalheDoAto = { ...detalheClt, altera: [{ nomeNorma: 'Decreto-Lei nº 5.452 de 01/05/1943', itens: [{ dispositivo: 'Art. 11, caput, Inciso 13', acao: 'Acréscimo Vetado' }] }] };
    const r = await executarVigencia(base({ detalheDoAto: async () => vetado }));
    assert.equal(r.arquivo.avisos.length, 0);
    assert.equal(r.arquivo.examinados['lei:15371:2026'], 'nao_altera_o_corpus');
    assert.equal(alteracoesDoAto({ ...detalheClt, altera: [{ ...detalheClt.altera[0], itens: [...detalheClt.altera[0].itens, { dispositivo: 'Art. 500', acao: 'Alteração Vetada' }] }] }, new Map([['decreto-lei:5452:1943', 'DL-5452-1943']]))[0].artigos.length, 2);
  });

  it('aviso que já estava no arquivo e só tinha vetos sai; o que tinha vetos e alterações perde só os vetos', async () => {
    const primeiro = await executarVigencia(base());
    const so = primeiro.arquivo.avisos[0];
    const soVetos = { ...so, alteracoes: [{ ...so.alteracoes[0], dispositivos: [{ dispositivo: 'Art. 11, caput, Inciso 13', acao: 'Acréscimo Vetado' }] }] };
    const r = await executarVigencia(base({ arquivo: () => ({ ...primeiro.arquivo, avisos: [soVetos] }) }));
    assert.deepEqual(r.removidos, ['Lei nº 15.371 de 31/03/2026']);
    assert.equal(r.arquivo.examinados['lei:15371:2026'], 'nao_altera_o_corpus');
    const misto = { ...so, alteracoes: [{ ...so.alteracoes[0], dispositivos: [...so.alteracoes[0].dispositivos, { dispositivo: 'Art. 600', acao: 'Acréscimo Vetado' }] }] };
    const r2 = await executarVigencia(base({ arquivo: () => ({ ...primeiro.arquivo, avisos: [misto] }) }));
    assert.deepEqual(r2.arquivo.avisos[0].alteracoes[0].dispositivos.map(d => d.acao), ['Alteração', 'Acréscimo']);
  });

  it('aviso de vigência complexa que sai por consolidação vai para a lista de conferência (LC 227/2026)', async () => {
    const primeiro = await executarVigencia(base());
    const complexo = { ...primeiro.arquivo.avisos[0], vigencia: { tipo: 'complexa' as const }, vigenteEm: null };
    const r = await executarVigencia(base({ arquivo: () => ({ ...primeiro.arquivo, avisos: [complexo] }), textoDaNorma: () => '(Redação dada pela Lei nº 15.371, de 31.3.2026)' }));
    assert.deepEqual(r.removidos, ['Lei nº 15.371 de 31/03/2026']);
    assert.deepEqual(r.complexosConsolidados, ['Lei nº 15.371 de 31/03/2026']);
    assert.equal(r.arquivo.examinados['lei:15371:2026'], 'consolidado_vigencia_complexa');
    const comData = await executarVigencia(base({ arquivo: () => primeiro.arquivo, textoDaNorma: () => '(Redação dada pela Lei nº 15.371, de 31.3.2026)' }));
    assert.deepEqual(comData.complexosConsolidados, [], 'vigência com data não precisa de conferência');
  });
});
