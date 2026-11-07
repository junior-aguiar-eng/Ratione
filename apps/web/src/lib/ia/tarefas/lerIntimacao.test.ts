import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { executarTarefa, type DependenciasExecucao, type Situacao } from '../executar';
import type { PedidoModelo, ResultadoModelo } from '../contrato';
import { apararIntimacao, conferirIntimacao, dataApareceNoTrecho, dataEhDeAto, lerIntimacao as t, prazoApareceNoTrecho, trechoIdentificaTribunal, type IntimacaoEnviada, type SaidaIntimacao } from './lerIntimacao';

const TEXTO = [
  'TRIBUNAL DE JUSTIÇA DO ESTADO DE SÃO PAULO. Processo [PROCESSO_1]. Apelação cível.',
  'Fica a parte apelada [PARTE_1] intimada para, no prazo de 15 (quinze) dias, apresentar contrarrazões.',
  'Disponibilizado no DJe em 03/11/2026. Considera-se publicado no primeiro dia útil seguinte.'
];
const ENTRADA: IntimacaoEnviada = { paragrafos: TEXTO };
const OK: SaidaIntimacao = {
  tribunal: 'TJSP',
  trechoTribunal: 'TRIBUNAL DE JUSTIÇA DO ESTADO DE SÃO PAULO',
  tipoEvento: 'disponibilizacao_dje',
  dataEvento: '2026-11-03',
  trechoData: 'Disponibilizado no DJe em 03/11/2026',
  diasMencionados: 15,
  trechoPrazo: 'no prazo de 15 (quinze) dias, apresentar contrarrazões'
};

describe('Tarefa ler-intimacao: entrada', () => {
  it('aceita o texto segmentado e pseudonimizado', () => {
    assert.deepEqual(t.validarEntrada(ENTRADA), ENTRADA);
  });

  it('recusa o que não é a intimação segmentada: vazio, longo demais, texto livre, tipos errados', () => {
    const ruins: unknown[] = [
      undefined,
      'qual o prazo da apelação?',
      { paragrafos: [] },
      { paragrafos: 'texto solto' },
      { paragrafos: [42] },
      { paragrafos: ['   '] },
      { paragrafos: ['x'.repeat(3_001)] },
      { paragrafos: Array.from({ length: 61 }, () => 'parágrafo') },
      { paragrafos: Array.from({ length: 4 }, () => 'y'.repeat(2_900)) }
    ];
    for (const e of ruins) assert.equal(t.validarEntrada(e), null, JSON.stringify(e)?.slice(0, 60));
  });

  it('recusa texto com dado pessoal que a detecção ainda ache', () => {
    assert.equal(t.validarEntrada({ paragrafos: ['Intimada a parte, CPF 529.982.247-25, para se manifestar.'] }), null);
    assert.equal(t.validarEntrada({ paragrafos: ['Contato: maria@exemplo.com.br'] }), null);
  });

  it('a referência do registro leva só um hash, e a mensagem delimita o texto como dado', () => {
    assert.match(t.referencia(ENTRADA), /^intimacao:[0-9a-f]{16}$/);
    const m = t.mensagem(ENTRADA);
    assert.match(m, /<intimacao>[\s\S]*Disponibilizado no DJe[\s\S]*<\/intimacao>/);
  });

  it('as instruções trazem a lista de tribunais do Ratione', () => {
    assert.match(t.instrucoes, /TJSP/);
    assert.match(t.instrucoes, /TRF4/);
    assert.match(t.instrucoes, /TJAL/);
  });
});

describe('Tarefa ler-intimacao: data escrita no trecho', () => {
  it('reconhece as formas usuais de escrever a data', () => {
    for (const trecho of ['em 03/11/2026', 'em 3/11/2026', 'em 03.11.2026', 'em 03-11-2026', 'em 03/11/26', 'em 3 de novembro de 2026', 'em 03 de Novembro de 2026', 'em 3º de novembro de 2026']) {
      assert.equal(dataApareceNoTrecho('2026-11-03', trecho), true, trecho);
    }
  });

  it('não confunde com outra data', () => {
    for (const trecho of ['em 13/11/2026', 'em 03/12/2026', 'em 03/11/2025', 'em 30/11/2026', 'sem data']) {
      assert.equal(dataApareceNoTrecho('2026-11-03', trecho), false, trecho);
    }
    assert.equal(dataApareceNoTrecho('data-ruim', 'em 03/11/2026'), false);
  });
});

describe('Tarefa ler-intimacao: data de ato do processo', () => {
  it('reconhece a data de um ato citado no texto, que não é a da intimação', () => {
    const atos = [
      'Intimada do evento processual ocorrido em 29/10/2026',
      'intimado da decisão proferida em 29/10/2026',
      'petição juntada em 29/10/2026',
      'ata lavrada em 29 de outubro de 2026'
    ];
    for (const trecho of atos) assert.equal(dataEhDeAto('2026-10-29', trecho), true, trecho);
  });

  it('não recusa a data da própria intimação, nem quando o texto cita um ato', () => {
    const intimacoes: Array<[string, string]> = [
      ['2026-11-03', 'Disponibilizado no DJe em 03/11/2026'],
      ['2026-11-03', 'Intimado por meio do portal em 03/11/2026'],
      ['2026-11-03', 'decisão proferida em 29/10/2026 e disponibilizada em 03/11/2026'],
      ['2026-11-03', 'Decisão proferida em 29/10/2026, disponibilizada no DJe em 03/11/2026'],
      ['2026-11-03', 'Intimada da decisão disponibilizada em 03/11/2026']
    ];
    for (const [iso, trecho] of intimacoes) assert.equal(dataEhDeAto(iso, trecho), false, trecho);
  });

  it('o servidor tira a data de ato e a forma junto, e mantém tribunal e prazo', () => {
    const entrada: IntimacaoEnviada = {
      paragrafos: [
        'TRIBUNAL DE JUSTIÇA DO ESTADO DE SÃO PAULO. Processo [PROCESSO_1].',
        'Fica a parte [PARTE_1] intimada do evento processual ocorrido em 29/10/2026, no prazo de 15 (quinze) dias, para apresentar contrarrazões.'
      ]
    };
    const saida: SaidaIntimacao = { ...OK, tipoEvento: 'intimacao_portal', dataEvento: '2026-10-29', trechoData: 'intimada do evento processual ocorrido em 29/10/2026', trechoPrazo: 'no prazo de 15 (quinze) dias' };
    assert.equal(conferirIntimacao(saida, entrada), 'a data é a de um ato do processo, não a da intimação');
    assert.deepEqual(apararIntimacao(saida, entrada), { ...OK, tipoEvento: 'nao_informado', dataEvento: '', trechoData: '', trechoPrazo: 'no prazo de 15 (quinze) dias' });
  });

  it('a instrução manda deixar a data vazia quando só há a de um ato', () => {
    assert.match(t.instrucoes, /evento processual ocorrido em/);
  });
});

describe('Tarefa ler-intimacao: conferência da saída', () => {
  it('aceita a saída em que cada campo tem o trecho no texto', () => {
    assert.equal(conferirIntimacao(OK, ENTRADA), null);
  });

  it('aceita a saída com campos vazios (o texto não disse)', () => {
    const vazia: SaidaIntimacao = { tribunal: '', trechoTribunal: '', tipoEvento: 'nao_informado', dataEvento: '', trechoData: '', diasMencionados: 0, trechoPrazo: '' };
    assert.equal(conferirIntimacao(vazia, ENTRADA), null);
  });

  it('recusa o que não se sustenta no texto', () => {
    const casos: Array<[Partial<SaidaIntimacao>, string]> = [
      [{ tribunal: 'TJXX' }, 'tribunal fora da lista'],
      [{ tribunal: 'TJRJ', trechoTribunal: 'Tribunal de Justiça do Rio de Janeiro' }, 'trecho do tribunal não está no texto'],
      [{ trechoData: 'Disponibilizado no DJe em 04/11/2026' }, 'trecho da data não está no texto'],
      [{ dataEvento: '2026-11-04' }, 'a data não está escrita no trecho'],
      [{ dataEvento: '2026-02-30', trechoData: 'Disponibilizado no DJe em 03/11/2026' }, 'data inválida'],
      [{ dataEvento: '', trechoData: '' }, 'tipo de evento sem data'],
      [{ diasMencionados: 10 }, 'o número de dias não está no trecho'],
      [{ trechoPrazo: 'no prazo de 30 dias úteis' }, 'trecho do prazo não está no texto']
    ];
    for (const [troca, motivo] of casos) assert.equal(conferirIntimacao({ ...OK, ...troca }, ENTRADA), motivo, motivo);
  });

  it('o trecho conta mesmo com outra caixa, acento ou espaçamento', () => {
    assert.equal(conferirIntimacao({ ...OK, trechoTribunal: 'tribunal  de justica do estado de sao paulo' }, ENTRADA), null);
  });
});

describe('Tarefa ler-intimacao: o trecho identifica o tribunal', () => {
  it('aceita a sigla, o nome oficial e as formas usuais de escrever o tribunal', () => {
    const certos: [string, string][] = [
      ['TJSP', 'TJSP - Foro Central'],
      ['TJSP', 'TRIBUNAL DE JUSTIÇA DO ESTADO DE SÃO PAULO'],
      ['TJPE', 'Tribunal de Justiça de Pernambuco'],
      ['TJDF', 'Tribunal de Justiça do Distrito Federal e dos Territórios'],
      ['TJMT', 'Tribunal de Justiça do Estado de Mato Grosso'],
      ['TJMS', 'Tribunal de Justiça do Estado de Mato Grosso do Sul'],
      ['TRT2', 'Tribunal Regional do Trabalho da 2ª Região'],
      ['TRT2', 'TRT da 2ª Região'],
      ['TRT2', 'TRT 2'],
      ['TRT2', 'PJe-TRT2'],
      ['TRF3', 'Tribunal Regional Federal da 3ª Região'],
      ['TRF3', 'TRF da 3ª Região'],
      ['TJSC', 'Poder Judiciário do Estado de Santa Catarina\nTribunal de Justiça']
    ];
    for (const [sigla, trecho] of certos) assert.equal(trechoIdentificaTribunal(sigla, trecho), true, `${sigla} / ${trecho}`);
  });

  it('recusa sigla que o trecho não sustenta: outro tribunal, outro estado, outra região, tribunal mais curto dentro do nome mais longo', () => {
    const errados: [string, string][] = [
      ['TJRJ', 'TRIBUNAL DE JUSTIÇA DO ESTADO DE SÃO PAULO'],
      ['TJSP', 'Tribunal de Justiça de Pernambuco'],
      ['TJPE', 'Tribunal Regional Eleitoral de Pernambuco'],
      ['TRT2', 'Tribunal Regional do Trabalho da 12ª Região'],
      ['TRT2', 'TRT da 12ª Região'],
      ['TRT1', 'TRT 12'],
      ['TRF3', 'Tribunal Regional do Trabalho da 3ª Região'],
      ['TJMT', 'Tribunal de Justiça do Estado de Mato Grosso do Sul'],
      ['TJSP', 'Comarca de Campinas - 3ª Vara Cível'],
      ['TJSC', 'Tribunal de Justiça'],
      ['TJSC', 'Poder Judiciário do Estado de Santa Catarina']
    ];
    for (const [sigla, trecho] of errados) assert.equal(trechoIdentificaTribunal(sigla, trecho), false, `${sigla} / ${trecho}`);
    assert.equal(trechoIdentificaTribunal('XXXX', 'qualquer'), false);
  });

  it('a conferência da saída descarta sigla errada com trecho que existe no texto', () => {
    assert.equal(conferirIntimacao({ ...OK, tribunal: 'TJRJ' }, ENTRADA), 'o trecho não identifica o tribunal');
  });
});

describe('Tarefa ler-intimacao: aparar o que o texto não sustenta', () => {
  it('uma saída toda conferida passa intacta', () => {
    assert.deepEqual(apararIntimacao(OK, ENTRADA), OK);
  });

  it('retira cada campo sem apoio e deixa os outros', () => {
    assert.deepEqual(apararIntimacao({ ...OK, tribunal: 'TJRJ' }, ENTRADA), { ...OK, tribunal: '', trechoTribunal: '' });
    assert.deepEqual(apararIntimacao({ ...OK, diasMencionados: 30 }, ENTRADA), { ...OK, diasMencionados: 0, trechoPrazo: '' });
    assert.deepEqual(apararIntimacao({ ...OK, trechoPrazo: 'trecho que não está no texto' }, ENTRADA), { ...OK, diasMencionados: 0, trechoPrazo: '' });
    assert.deepEqual(apararIntimacao({ ...OK, dataEvento: '2026-11-10', trechoData: 'Disponibilizado no DJe em 10/11/2026' }, ENTRADA), {
      ...OK,
      dataEvento: '',
      trechoData: '',
      tipoEvento: 'nao_informado'
    });
  });

  it('forma sem data não serve: a forma também sai', () => {
    assert.equal(apararIntimacao({ ...OK, dataEvento: '', trechoData: '' }, ENTRADA).tipoEvento, 'nao_informado');
  });

  it('o que sobra do aparo sempre passa pela conferência', () => {
    const ruins: Partial<SaidaIntimacao>[] = [
      { tribunal: 'XXXX' },
      { tribunal: 'TJRJ' },
      { trechoTribunal: 'outro trecho' },
      { dataEvento: '2026-02-31' },
      { dataEvento: '2026-11-10', trechoData: 'Disponibilizado no DJe em 10/11/2026' },
      { trechoData: 'nada disso está no texto' },
      { diasMencionados: 5 },
      { diasMencionados: 15, trechoPrazo: 'não está' },
      { tipoEvento: 'nao_informado', dataEvento: '' }
    ];
    for (const troca of ruins) {
      const s = apararIntimacao({ ...OK, ...troca }, ENTRADA);
      assert.equal(conferirIntimacao(s, ENTRADA), null, JSON.stringify(troca));
    }
  });
});

describe('Tarefa ler-intimacao: no executor', () => {
  const USO = { input_tokens: 700, output_tokens: 150 };
  const RENOVA = '2026-11-12T03:00:00.000Z';

  function deps(json: string) {
    const registro: string[] = [];
    const finalizados: Array<{ situacao: Situacao }> = [];
    const pedidos: PedidoModelo[] = [];
    const dep: DependenciasExecucao = {
      ligada: true,
      fontes: { lerDispositivo: async () => null, lerNoTeseMap: async () => null },
      usuarioAtual: async () => ({ id: 'u1' }),
      lerCache: async () => (registro.push('ler-cache'), null),
      iniciarAnalise: async () => (registro.push('iniciar'), { ok: true, analiseId: 'an-1', restantes: 9, renovaEm: RENOVA }),
      consumirAnalise: async () => void registro.push('consumir'),
      concluirAnalise: async () => void registro.push('concluir'),
      falhaAnalise: async () => void registro.push('falha'),
      cancelarAnalise: async () => void registro.push('cancelar'),
      reservar: async () => (registro.push('reservar'), { ok: true, id: 7 }),
      registrarCache: async () => void registro.push('registrar-cache'),
      chamarModelo: async p => (registro.push('modelo'), pedidos.push(p), { tipo: 'ok', json, uso: USO } as ResultadoModelo),
      finalizar: async (_id, situacao) => void finalizados.push({ situacao }),
      gravarCache: async () => void registro.push('gravar-cache')
    };
    return { dep, registro, finalizados, pedidos };
  }

  it('saída conferida: 200, conta na cota de explicações e nada do texto vai para o cache', async () => {
    const { dep, registro, finalizados, pedidos } = deps(JSON.stringify(OK));
    const r = await executarTarefa('ler-intimacao', ENTRADA, dep);
    assert.equal(r.status, 200);
    assert.deepEqual(r.status === 200 && r.corpo.resposta, OK);
    assert.deepEqual(registro, ['iniciar', 'reservar', 'modelo', 'concluir']);
    assert.deepEqual(finalizados, [{ situacao: 'gerada' }]);
    assert.match(pedidos[0].mensagem, /Disponibilizado no DJe em 03\/11\/2026/);
  });

  it('data inventada: só a data (e a forma, que sem data não serve) sai da resposta; tribunal e prazo seguem, e a cota é gasta', async () => {
    const { dep, registro, finalizados } = deps(JSON.stringify({ ...OK, dataEvento: '2026-11-10', trechoData: 'Disponibilizado no DJe em 10/11/2026' }));
    const r = await executarTarefa('ler-intimacao', ENTRADA, dep);
    assert.equal(r.status, 200);
    assert.deepEqual(r.status === 200 && r.corpo.resposta, { ...OK, dataEvento: '', trechoData: '', tipoEvento: 'nao_informado' });
    assert.deepEqual(registro, ['iniciar', 'reservar', 'modelo', 'concluir']);
    assert.deepEqual(finalizados, [{ situacao: 'gerada' }]);
  });

  it('tribunal que o trecho não sustenta: só o tribunal sai, data e prazo seguem', async () => {
    const { dep } = deps(JSON.stringify({ ...OK, tribunal: 'TJRJ' }));
    const r = await executarTarefa('ler-intimacao', ENTRADA, dep);
    assert.equal(r.status, 200);
    assert.deepEqual(r.status === 200 && r.corpo.resposta, { ...OK, tribunal: '', trechoTribunal: '' });
  });

  it('saída fora do formato continua descartada (502), a cota não é gasta', async () => {
    const { dep, registro, finalizados } = deps(JSON.stringify({ ...OK, tipoEvento: 'evento-inventado' }));
    const r = await executarTarefa('ler-intimacao', ENTRADA, dep);
    assert.equal(r.status, 502);
    assert.deepEqual(registro, ['iniciar', 'reservar', 'modelo', 'cancelar']);
    assert.deepEqual(finalizados, [{ situacao: 'invalida' }]);
  });

  it('pedido com dado pessoal ou fora do formato é recusado antes de qualquer cota ou chamada', async () => {
    for (const entrada of [{ paragrafos: ['CPF 529.982.247-25'] }, { paragrafos: [] }, 'texto livre']) {
      const { dep, registro } = deps(JSON.stringify(OK));
      assert.equal((await executarTarefa('ler-intimacao', entrada, dep)).status, 400);
      assert.deepEqual(registro, []);
    }
  });
});

describe('Tarefa ler-intimacao: prazo escrito no trecho', () => {
  it('aceita algarismos (com ou sem zero à esquerda) e número por extenso colado a "dias"', () => {
    const certos: [number, string][] = [
      [15, 'no prazo de 15 (quinze) dias'],
      [5, 'no prazo de 05 (cinco) dias'],
      [5, 'pelo prazo de 05 dias'],
      [10, 'no prazo de dez dias'],
      [5, 'cinco dias úteis'],
      [5, 'cinco (5) dias corridos'],
      [1, 'no prazo de um dia'],
      [2, 'por dois dias'],
      [2, 'por duas dias'],
      [14, 'catorze dias'],
      [14, 'quatorze dias'],
      [21, 'vinte e um dias'],
      [22, 'vinte e dois dias'],
      [30, 'TRINTA DIAS'],
      [45, 'quarenta e cinco dias'],
      [120, 'cento e vinte dias'],
      [365, 'trezentos e sessenta e cinco dias']
    ];
    for (const [dias, trecho] of certos) assert.equal(prazoApareceNoTrecho(dias, trecho), true, `${dias} / ${trecho}`);
  });

  it('recusa quando o trecho traz outro número, um número maior que contém este, ou uma palavra solta', () => {
    const errados: [number, string][] = [
      [5, 'no prazo de 15 dias'],
      [5, 'no prazo de 50 dias'],
      [10, 'no prazo de 100 dias'],
      [10, 'no prazo de dez'],
      [1, 'cumpra-se um dos despachos, no prazo legal'],
      [7, 'dezessete dias'],
      [2, 'vinte e dois dias'],
      [1, 'vinte e um dias'],
      [20, 'cento e vinte dias'],
      [5, 'cinco partes, sem prazo'],
      [400, 'quatrocentos dias']
    ];
    for (const [dias, trecho] of errados) assert.equal(prazoApareceNoTrecho(dias, trecho), false, `${dias} / ${trecho}`);
  });
});

describe('Tarefa ler-intimacao: instruções (v5)', () => {
  it('dizem que a data de um ato do processo não é a data do evento e que vários prazos diferentes ficam em 0', () => {
    assert.match(t.instrucoes, /data de um ato do processo NÃO é a data do evento/);
    assert.match(t.instrucoes, /ocorrido em/);
    assert.match(t.instrucoes, /prazos diferentes para atos diferentes[^.]*use 0/);
  });
});
