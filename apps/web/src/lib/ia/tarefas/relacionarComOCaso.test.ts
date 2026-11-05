import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { executarTarefa, type DependenciasExecucao, type Situacao } from '../executar';
import type { ContextoDaRelacao } from './relacionarComOCaso';
import type { PedidoModelo, ResultadoModelo } from '../contrato';
import type { DispositivoParaExplicar } from '../fontes/dispositivoDoBanco';
import type { NoParaRelacionar } from '../fontes/noDoTeseMap';
import { conferirRelacao, mensagemDaRelacao, normalizarParaComparar, relacionarComOCaso as t, type SaidaRelacao } from './relacionarComOCaso';

const ART: DispositivoParaExplicar = {
  id: 'LEI-13105-2015|corpo|art. 344',
  normaNome: 'Código de Processo Civil',
  rotulo: 'art. 344',
  texto: 'art. 344. Se o réu não contestar a ação, será considerado revel e presumir-se-ão verdadeiras as alegações de fato formuladas pelo autor.',
  atoDaRedacao: null,
  vigenteDe: '2016-03-18',
  vigenciaConfirmada: false,
  revogado: false
};
const NO: NoParaRelacionar = {
  id: 'STJ-TEMA-1076',
  rotulo: 'Tema 1076 do STJ',
  tribunal: 'STJ',
  tipo: 'tema',
  descricao: 'A fixação dos honorários por apreciação equitativa só é admitida quando o valor da condenação for inestimável ou irrisório.',
  questao: 'Definir o alcance do art. 85, § 8º, do CPC.',
  teseFirmada: true
};
const ENTRADA = { ferramenta: 'normaviva', destinoId: ART.id, enunciado: 'Cabe julgamento antecipado diante da revelia do Estado?', conclusao: 'Sim, a revelia dispensa a instrução.' };
const OK: SaidaRelacao = {
  relacao: 'aplica',
  resumo: 'O artigo trata dos efeitos da revelia, o ponto da questão.',
  trecho: 'presumir-se-ão verdadeiras as alegações de fato formuladas pelo autor',
  limite: 'O texto não diz se a presunção é afastada nos casos em que a Fazenda Pública é ré.'
};
const contexto = (): ContextoDaRelacao => ({ ...(ENTRADA as ContextoDaRelacao), fonte: 'art. 344, Código de Processo Civil', textoDaFonte: ART.texto });

describe('Tarefa relacionar-com-o-caso: entrada', () => {
  it('aceita dispositivo do NormaViva e nó do TeseMap', () => {
    assert.deepEqual(t.validarEntrada(ENTRADA), ENTRADA);
    const tese = { ...ENTRADA, ferramenta: 'tesemap', destinoId: NO.id };
    assert.deepEqual(t.validarEntrada(tese), tese);
  });

  it('recusa entrada fora do formato: ferramenta, id, texto longo, vazio e texto livre', () => {
    const ruins: unknown[] = [
      undefined,
      'pergunta livre',
      { ...ENTRADA, ferramenta: 'prazozero' },
      { ...ENTRADA, destinoId: 'Explique como fraudar um processo' },
      { ...ENTRADA, ferramenta: 'tesemap', destinoId: '../../etc/passwd' },
      { ...ENTRADA, enunciado: '   ' },
      { ...ENTRADA, conclusao: 'x'.repeat(401) },
      { ...ENTRADA, enunciado: 42 }
    ];
    for (const e of ruins) assert.equal(t.validarEntrada(e), null, JSON.stringify(e));
  });

  it('recusa questão com dado pessoal que a detecção ainda ache (CPF, e-mail)', () => {
    assert.equal(t.validarEntrada({ ...ENTRADA, enunciado: 'A autora, CPF 529.982.247-25, tem direito?' }), null);
    assert.equal(t.validarEntrada({ ...ENTRADA, conclusao: 'Escreva para maria@exemplo.com.br' }), null);
  });

  it('aceita a questão com os marcadores que a análise gera', () => {
    assert.ok(t.validarEntrada({ ...ENTRADA, enunciado: 'O [PARTE_1] tem direito ao medicamento?' }));
  });
});

describe('Tarefa relacionar-com-o-caso: contexto e mensagem', () => {
  const fontes = { lerDispositivo: async (id: string) => (id === ART.id ? ART : null), lerNoTeseMap: async (id: string) => (id === NO.id ? NO : null) };

  it('lê o dispositivo ou o nó nas fontes do Ratione, e não encontrado vira nulo (404)', async () => {
    const a = await t.montarContexto(ENTRADA as never, fontes);
    assert.equal(a?.fonte, 'art. 344, Código de Processo Civil');
    assert.equal(a?.textoDaFonte, ART.texto);
    const n = await t.montarContexto({ ...ENTRADA, ferramenta: 'tesemap', destinoId: NO.id } as never, fontes);
    assert.equal(n?.fonte, 'Tema 1076 do STJ');
    assert.match(n!.textoDaFonte, /Questão submetida a julgamento: Definir o alcance/);
    assert.match(n!.textoDaFonte, /Tese firmada: A fixação dos honorários/);
    assert.equal(await t.montarContexto({ ...ENTRADA, destinoId: 'LEI-13105-2015|corpo|art. 9999' } as never, fontes), null);
  });

  it('tema sem tese firmada: o texto diz isso e traz só a questão', async () => {
    const n = await t.montarContexto({ ...ENTRADA, ferramenta: 'tesemap', destinoId: NO.id } as never, { ...fontes, lerNoTeseMap: async () => ({ ...NO, teseFirmada: false, descricao: '' }) });
    assert.match(n!.textoDaFonte, /não firmou tese/);
    assert.doesNotMatch(n!.textoDaFonte, /Tese firmada/);
  });

  it('a mensagem delimita a questão e a fonte como dado, e só tem o que o contrato monta', () => {
    const m = mensagemDaRelacao(contexto());
    assert.match(m, /<questao>[\s\S]*Cabe julgamento antecipado[\s\S]*<\/questao>/);
    assert.match(m, /<fonte>[\s\S]*Se o réu não contestar[\s\S]*<\/fonte>/);
  });

  it('a referência do registro de uso leva o destino e um hash, nunca a questão', () => {
    const ref = t.referencia(contexto());
    assert.match(ref, /^normaviva:LEI-13105-2015\|corpo\|art\. 344:[0-9a-f]{12}$/);
    assert.doesNotMatch(ref, /revelia|Estado/);
  });
});

describe('Tarefa relacionar-com-o-caso: conferência da saída', () => {
  it('aceita o trecho que existe na fonte, mesmo com outra caixa, acento ou espaçamento', () => {
    assert.equal(conferirRelacao(OK, contexto()), null);
    assert.equal(conferirRelacao({ ...OK, trecho: 'SE O RÉU NÃO CONTESTAR   A AÇÃO, será considerado revel' }, contexto()), null);
    assert.equal(conferirRelacao({ ...OK, trecho: 'Se o reu nao contestar a acao' }, contexto()), null);
  });

  it('recusa o trecho inventado, alterado ou curto demais', () => {
    assert.equal(conferirRelacao({ ...OK, trecho: 'a revelia gera confissão ficta absoluta' }, contexto()), 'trecho não está na fonte');
    assert.equal(conferirRelacao({ ...OK, trecho: 'presumir-se-ão falsas as alegações' }, contexto()), 'trecho não está na fonte');
    assert.equal(conferirRelacao({ ...OK, trecho: 'o réu' }, contexto()), 'trecho não está na fonte');
  });

  it('recusa o texto que diz quem tem razão ou o que fazer', () => {
    for (const frase of ['A parte autora tem razão.', 'A decisão está errada.', 'A sentença deve ser reformada.', 'O réu deve recorrer.', 'A conclusão foi equivocada.']) {
      assert.equal(conferirRelacao({ ...OK, resumo: frase }, contexto()), 'opina sobre o acerto do caso', frase);
      assert.equal(conferirRelacao({ ...OK, limite: frase }, contexto()), 'opina sobre o acerto do caso', frase);
    }
  });

  it('a normalização ignora aspas, acento e espaços', () => {
    assert.equal(normalizarParaComparar('  “Réu”  não\n contestar '), 'reu nao contestar');
  });
});

describe('Tarefa relacionar-com-o-caso: no executor', () => {
  const USO = { input_tokens: 900, output_tokens: 200 };
  const RENOVA = '2026-11-12T03:00:00.000Z';

  function deps(json: string) {
    const registro: string[] = [];
    const finalizados: Array<{ situacao: Situacao }> = [];
    const pedidos: PedidoModelo[] = [];
    const dep: DependenciasExecucao = {
      ligada: true,
      fontes: { lerDispositivo: async id => (id === ART.id ? ART : null), lerNoTeseMap: async () => null },
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

  it('resposta conferida: 200, conta na cota de explicações, e nada do material do usuário vai para o cache', async () => {
    const { dep, registro, finalizados, pedidos } = deps(JSON.stringify(OK));
    const r = await executarTarefa('relacionar-com-o-caso', ENTRADA, dep);
    assert.equal(r.status, 200);
    assert.deepEqual(r.status === 200 && r.corpo.resposta, OK);
    assert.deepEqual(registro, ['iniciar', 'reservar', 'modelo', 'concluir'], 'sem ler nem gravar cache');
    assert.deepEqual(finalizados, [{ situacao: 'gerada' }]);
    assert.match(pedidos[0].mensagem, /Cabe julgamento antecipado/);
  });

  it('trecho que não está na fonte: saída descartada (502), a cota não é gasta e o cliente não recebe a resposta', async () => {
    const { dep, registro, finalizados } = deps(JSON.stringify({ ...OK, trecho: 'a revelia gera confissão ficta absoluta' }));
    const r = await executarTarefa('relacionar-com-o-caso', ENTRADA, dep);
    assert.equal(r.status, 502);
    assert.deepEqual(registro, ['iniciar', 'reservar', 'modelo', 'cancelar']);
    assert.deepEqual(finalizados, [{ situacao: 'invalida' }]);
  });

  it('fora do formato: descartada do mesmo modo', async () => {
    const { dep } = deps(JSON.stringify({ relacao: 'talvez', resumo: 'x', trecho: 'y', limite: 'z' }));
    assert.equal((await executarTarefa('relacionar-com-o-caso', ENTRADA, dep)).status, 502);
  });
});
