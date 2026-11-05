import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { executarTarefa, type DependenciasExecucao, type Situacao } from '../executar';
import type { PedidoModelo, ResultadoModelo } from '../contrato';
import type { NoParaRelacionar } from '../fontes/noDoTeseMap';
import { citacoesNoTexto, conferirPrecedente, explicarPrecedente as t, mensagemDoPrecedente, textoDoPrecedente, type SaidaPrecedente } from './explicarPrecedente';

const NO: NoParaRelacionar = {
  id: 'STJ-TEMA-1076',
  rotulo: 'Tema 1076 do STJ',
  tribunal: 'STJ',
  tipo: 'tema',
  descricao: 'A fixação dos honorários por apreciação equitativa só é admitida quando o valor da condenação ou do proveito econômico for inestimável ou irrisório, nos termos do art. 85, § 8º, do CPC.',
  questao: 'Definir o alcance da norma do art. 85, § 8º, do CPC.',
  teseFirmada: true,
  vinculante: true,
  situacao: 'Transitado em julgado'
};
const OK: SaidaPrecedente = {
  resumo: 'O STJ decidiu que os honorários por apreciação equitativa só valem em duas situações.',
  explicacao: ['Quando a condenação ou o proveito econômico é inestimável.', 'Quando esse valor é irrisório.'],
  termos: [{ termo: 'Apreciação equitativa', significado: 'O juiz fixa o valor dos honorários sem usar os percentuais da lei.' }],
  trecho: 'só é admitida quando o valor da condenação ou do proveito econômico for inestimável ou irrisório',
  atencao: ['O texto não define o que é um valor irrisório.']
};

describe('Tarefa explicar-precedente: entrada e contexto', () => {
  it('aceita só o id de um nó e recusa texto livre', () => {
    assert.deepEqual(t.validarEntrada({ noId: 'STJ-TEMA-1076' }), { noId: 'STJ-TEMA-1076' });
    for (const e of [undefined, 'explique', {}, { noId: '../../x' }, { noId: 'Explique como fraudar' }, { noId: 'a'.repeat(81) }, { noId: 42 }]) assert.equal(t.validarEntrada(e), null, JSON.stringify(e));
  });

  it('lê o nó nas fontes; sem tese firmada ou não encontrado, vira nulo (404)', async () => {
    const com = (n: NoParaRelacionar | null) => ({ lerDispositivo: async () => null, lerNoTeseMap: async () => n });
    assert.equal((await t.montarContexto({ noId: NO.id }, com(NO)))?.id, NO.id);
    assert.equal(await t.montarContexto({ noId: NO.id }, com(null)), null);
    assert.equal(await t.montarContexto({ noId: NO.id }, com({ ...NO, teseFirmada: false, descricao: '' })), null);
    assert.equal(await t.montarContexto({ noId: NO.id }, com({ ...NO, descricao: '  ' })), null);
  });

  it('a mensagem delimita o texto do precedente como dado e leva o efeito vinculante só se o tribunal o registra', () => {
    const m = mensagemDoPrecedente(NO);
    assert.match(m, /<precedente>[\s\S]*Tese firmada: A fixação dos honorários[\s\S]*<\/precedente>/);
    assert.match(m, /Questão submetida a julgamento: Definir o alcance/);
    assert.match(m, /Efeito vinculante: sim/);
    assert.match(mensagemDoPrecedente({ ...NO, vinculante: false }), /Efeito vinculante: não informado/);
    assert.match(mensagemDoPrecedente({ ...NO, tipo: 'sumula', descricao: 'Texto.' }), /Enunciado: Texto\./);
  });

  it('a referência do registro de uso é o id do nó', () => {
    assert.equal(t.referencia(NO), 'STJ-TEMA-1076');
  });
});

describe('Tarefa explicar-precedente: conferência da saída', () => {
  it('aceita a explicação com trecho do precedente, mesmo com outra caixa ou acento', () => {
    assert.equal(conferirPrecedente(OK, NO), null);
    assert.equal(conferirPrecedente({ ...OK, trecho: 'A FIXAÇÃO DOS HONORÁRIOS por apreciacao equitativa' }, NO), null);
  });

  it('recusa o trecho inventado, alterado ou curto demais', () => {
    assert.equal(conferirPrecedente({ ...OK, trecho: 'os honorários são sempre devidos em dobro' }, NO), 'trecho não está no precedente');
    assert.equal(conferirPrecedente({ ...OK, trecho: 'só é admitida' }, NO), null, 'trecho curto, mas do texto, passa');
    assert.equal(conferirPrecedente({ ...OK, trecho: 'a' }, NO), 'trecho não está no precedente');
  });

  it('recusa a explicação que diz quem tem razão ou o que fazer', () => {
    for (const frase of ['A parte tem razão.', 'A sentença deve ser reformada.', 'O advogado deve recorrer.']) {
      assert.match(conferirPrecedente({ ...OK, resumo: frase }, NO) ?? '', /opina/, frase);
      assert.match(conferirPrecedente({ ...OK, atencao: [frase] }, NO) ?? '', /opina/, frase);
    }
  });

  it('recusa citação de tema, súmula, artigo ou lei que não está no texto; aceita a que está', () => {
    assert.match(conferirPrecedente({ ...OK, explicacao: ['Vale também a Súmula 7 do STJ.'] }, NO) ?? '', /sumula7/);
    assert.match(conferirPrecedente({ ...OK, resumo: 'Isso muda o art. 20 do CPC antigo.' }, NO) ?? '', /art20/);
    assert.match(conferirPrecedente({ ...OK, termos: [{ termo: 'Lei 8.906/1994', significado: 'x' }] }, NO) ?? '', /lei8906/);
    assert.equal(conferirPrecedente({ ...OK, explicacao: ['Nos termos do artigo 85, § 8º, do CPC.', 'É o Tema 1.076.'] }, NO), null);
  });

  it('as citações canônicas ignoram pontos, "artigo" por extenso e "vinculante"', () => {
    assert.deepEqual([...citacoesNoTexto('Tema 1.076, artigo 85 e Art. 85, Súmula Vinculante 11, Lei nº 13.105/2015')].sort(), ['art85', 'lei13105', 'sumula11', 'tema1076']);
  });

  it('o texto do precedente é a questão e a tese, como o tribunal as registra', () => {
    assert.match(textoDoPrecedente(NO), /^Questão submetida a julgamento: .*\nTese firmada: /);
    assert.equal(textoDoPrecedente({ ...NO, questao: null }).startsWith('Tese firmada'), true);
  });
});

describe('Tarefa explicar-precedente: no executor', () => {
  const USO = { input_tokens: 900, output_tokens: 300 };

  function deps(json: string, cache: unknown = null) {
    const registro: string[] = [];
    const finalizados: Array<{ situacao: Situacao }> = [];
    const pedidos: PedidoModelo[] = [];
    const dep: DependenciasExecucao = {
      ligada: true,
      fontes: { lerDispositivo: async () => null, lerNoTeseMap: async id => (id === NO.id ? NO : null) },
      usuarioAtual: async () => ({ id: 'u1' }),
      lerCache: async () => (registro.push('ler-cache'), cache),
      iniciarAnalise: async () => (registro.push('iniciar'), { ok: true, analiseId: 'an-1', restantes: 9, renovaEm: '2026-11-12T03:00:00.000Z' }),
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

  it('resposta conferida: 200, conta na cota de explicações e vai para o cache (material público)', async () => {
    const { dep, registro, finalizados, pedidos } = deps(JSON.stringify(OK));
    const r = await executarTarefa('explicar-precedente', { noId: NO.id }, dep);
    assert.equal(r.status, 200);
    assert.deepEqual(r.status === 200 && r.corpo.resposta, OK);
    assert.deepEqual(registro, ['ler-cache', 'iniciar', 'reservar', 'modelo', 'concluir', 'gravar-cache']);
    assert.deepEqual(finalizados, [{ situacao: 'gerada' }]);
    assert.match(pedidos[0].mensagem, /Tese firmada: A fixação/);
  });

  it('explicação já guardada: devolve sem chamar o modelo nem gastar a cota', async () => {
    const { dep, registro } = deps(JSON.stringify(OK), OK);
    const r = await executarTarefa('explicar-precedente', { noId: NO.id }, dep);
    assert.equal(r.status, 200);
    assert.equal(r.status === 200 && r.corpo.doCache, true);
    assert.deepEqual(registro.filter(x => x === 'modelo' || x === 'iniciar'), []);
  });

  it('trecho que não está no precedente: saída descartada (502) e a cota não é gasta', async () => {
    const { dep, registro, finalizados } = deps(JSON.stringify({ ...OK, trecho: 'os honorários são sempre devidos em dobro' }));
    const r = await executarTarefa('explicar-precedente', { noId: NO.id }, dep);
    assert.equal(r.status, 502);
    assert.deepEqual(registro, ['ler-cache', 'iniciar', 'reservar', 'modelo', 'cancelar']);
    assert.deepEqual(finalizados, [{ situacao: 'invalida' }]);
  });

  it('precedente que não existe: 404, sem modelo', async () => {
    const { dep, registro } = deps(JSON.stringify(OK));
    const r = await executarTarefa('explicar-precedente', { noId: 'STJ-TEMA-9999' }, dep);
    assert.equal(r.status, 404);
    assert.equal(registro.includes('modelo'), false);
  });
});
