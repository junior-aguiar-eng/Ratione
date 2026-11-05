import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { executarTarefa, type DependenciasExecucao, type Situacao } from '../executar';
import type { PedidoModelo, ResultadoModelo } from '../contrato';
import { conferirIntimacao, dataApareceNoTrecho, lerIntimacao as t, type IntimacaoEnviada, type SaidaIntimacao } from './lerIntimacao';

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

  it('data inventada: saída descartada (502), a cota não é gasta', async () => {
    const { dep, registro, finalizados } = deps(JSON.stringify({ ...OK, dataEvento: '2026-11-10', trechoData: 'Disponibilizado no DJe em 10/11/2026' }));
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
