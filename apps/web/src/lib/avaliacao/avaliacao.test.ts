import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { ehValidado, paragrafosDoCaso, type Caso, type CasoValidado } from './caso';
import { contarChamadas, executarCaso, type ChamarModelo } from './executarCaso';
import { gerarFolha } from './folha';
import { montarRelatorio } from './relatorio';
import { gravarCaso, gravarResultado, gravarRodada, lerCaso, lerCasos, lerResultados, ultimaRodada } from './arquivos';

const TEXTO = [
  'APELAÇÃO CÍVEL. AÇÃO DE INDENIZAÇÃO. FRAUDE BANCÁRIA. RESPONSABILIDADE OBJETIVA DO BANCO.',
  'Trata-se de apelação contra sentença que julgou improcedente o pedido de indenização por transferências não reconhecidas pelo autor.',
  'Alega o apelante que o banco falhou na segurança do serviço e que a prescrição não ocorreu, pois o prazo é o do art. 27 do CDC.',
  'Rejeito a prejudicial de prescrição: o prazo quinquenal do art. 27 do CDC não decorreu entre o fato e o ajuizamento da ação.',
  'No mérito, aplica-se a Súmula 479 do STJ: as instituições financeiras respondem objetivamente por fraudes de terceiros em operações bancárias.',
  'Assim, o banco deve restituir os valores e indenizar o dano moral, nos termos do art. 14 do CDC.',
  'Ante o exposto, dou provimento à apelação para julgar procedente o pedido, condenando o réu à restituição e a R$ 5.000,00 de dano moral.',
  'Condeno o réu ao pagamento das custas e dos honorários de 10% sobre a condenação, art. 85, § 2º, do CPC.'
].join('\n\n');

const CASO: CasoValidado = {
  id: 'caso-001',
  fonte: { descricao: 'Acórdão de exemplo', url: 'https://exemplo.jus.br/acordao/1', acessadoEm: '2026-10-25' },
  tipo: 'acordao',
  texto: TEXTO,
  gabarito: {
    dispositivo: { inicio: 7, fim: 8 },
    questoes: [
      { enunciado: 'Houve prescrição?', conclusao: 'Não houve.', paragrafos: [3, 4] },
      { enunciado: 'O banco responde pela fraude?', conclusao: 'Responde.', paragrafos: [5, 6] }
    ],
    citacoes: ['CDC, art. 27', 'Súmula 479 do STJ', 'art. 85, § 2º, do CPC']
  },
  validacao: { por: 'Revisor de Teste', em: '2026-10-25' }
};

/** Modelo simulado: responde cada etapa com uma saída válida e perfeita, e conta as chamadas. */
function modeloPerfeito(): { chamar: ChamarModelo; chamadas: () => number } {
  let n = 0;
  const chamar: ChamarModelo = async p => {
    n++;
    const uso = { input_tokens: 1000, output_tokens: 200 };
    const chaves = Object.keys(p.esquema.properties);
    const json = chaves.includes('secoes')
      ? { tipo: 'acordao', resultado: 'Apelação provida', resumo: 'Fraude bancária.', pedidos: [{ descricao: 'Indenização', paragrafos: [2] }], secoes: [{ tipo: 'fundamentacao', inicio: 3, fim: 6 }, { tipo: 'dispositivo', inicio: 7, fim: 8 }] }
      : chaves.includes('questoes')
        ? {
            questoes: [
              { id: 'Q1', categoria: 'prejudicial', enunciado: 'Houve prescrição?', conclusao: 'Não houve.', resultado: 'rejeitada', paragrafos: [3, 4], paragrafosConclusao: [4] },
              { id: 'Q2', categoria: 'merito', enunciado: 'O banco responde pela fraude?', conclusao: 'Responde.', resultado: 'acolhida', paragrafos: [5, 6], paragrafosConclusao: [6] }
            ]
          }
        : {
            fundamentos: [
              { questao: 'Q1', tipo: 'norma', descricao: 'Prazo do CDC', citacao: 'art. 27 do CDC', paragrafos: [4] },
              { questao: 'Q2', tipo: 'precedente', descricao: 'Súmula', citacao: 'Súmula 479 do STJ', paragrafos: [5] }
            ]
          };
    return { tipo: 'ok', json: JSON.stringify(json), uso };
  };
  return { chamar, chamadas: () => n };
}

describe('F5-05: executor do caso', () => {
  it('roda as três etapas e devolve as saídas válidas com o custo', async () => {
    const { chamar, chamadas } = modeloPerfeito();
    const r = await executarCaso(CASO, chamar);
    assert.equal(chamadas(), 3);
    assert.equal(r.naoEnviavel, undefined);
    assert.deepEqual([r.estrutura.estado, r.questoes.estado, r.fundamentos.estado], ['ok', 'ok', 'ok']);
    assert.ok(r.estrutura.custoUsd > 0);
    const c = contarChamadas([r]);
    assert.equal(c.chamadas, 3);
    assert.equal(c.descartadas, 0);
  });

  it('saída fora do formato é descartada, e a etapa seguinte não roda nem entra na taxa', async () => {
    let n = 0;
    const r = await executarCaso(CASO, async () => {
      n++;
      return { tipo: 'ok', json: '{"lixo":true}', uso: { input_tokens: 10, output_tokens: 5 } };
    });
    assert.equal(n, 2); // estrutura e questões; fundamentos não roda sem questões
    assert.deepEqual([r.estrutura.estado, r.questoes.estado, r.fundamentos.estado], ['descartada', 'descartada', 'nao_rodou']);
    assert.deepEqual(contarChamadas([r]), { chamadas: 2, descartadas: 2, custoUsd: contarChamadas([r]).custoUsd });
  });

  it('o motivo do descarte traz a regra do esquema que recusou a saída, e cada etapa que rodou traz a duração', async () => {
    const r = await executarCaso(CASO, async () => ({ tipo: 'ok', json: '{"lixo":true}', uso: { input_tokens: 10, output_tokens: 5 } }));
    assert.match(r.estrutura.motivo ?? '', /^fora do formato \(.+\)/);
    assert.equal(typeof r.estrutura.duracaoMs, 'number');
    assert.equal(typeof r.questoes.duracaoMs, 'number');
    assert.equal(r.fundamentos.duracaoMs, undefined); // não rodou
  });

  it('parágrafo inexistente na saída é descartado pela conferência da própria tarefa', async () => {
    const r = await executarCaso(CASO, async p =>
      Object.keys(p.esquema.properties).includes('secoes')
        ? { tipo: 'ok', json: JSON.stringify({ tipo: 'acordao', resultado: 'x', resumo: 'y', pedidos: [], secoes: [{ tipo: 'dispositivo', inicio: 7, fim: 99 }] }), uso: { input_tokens: 1, output_tokens: 1 } }
        : { tipo: 'falha', mensagem: 'sem rede' }
    );
    assert.equal(r.estrutura.estado, 'descartada');
    assert.equal(r.estrutura.motivo, 'seção fora da decisão');
    assert.equal(r.questoes.estado, 'falha');
  });

  it('recusa e corte do modelo ficam registrados com o uso', async () => {
    const r = await executarCaso(CASO, async () => ({ tipo: 'recusa', uso: { input_tokens: 100, output_tokens: 0 } }));
    assert.equal(r.estrutura.estado, 'recusa');
    assert.ok(r.estrutura.custoUsd > 0);
  });

  it('decisão longa demais fica fora, sem chamar o modelo', async () => {
    const longa = { id: 'caso-longo', texto: Array.from({ length: 90 }, (_, i) => `Parágrafo ${i}. ${'palavra '.repeat(150)}`).join('\n\n') };
    let n = 0;
    const r = await executarCaso(longa, async () => {
      n++;
      return { tipo: 'falha', mensagem: 'x' };
    });
    assert.equal(n, 0);
    assert.match(r.naoEnviavel ?? '', /limites de tamanho/);
    assert.deepEqual(contarChamadas([r]), { chamadas: 0, descartadas: 0, custoUsd: 0 });
  });
});

describe('F5-05: relatório', () => {
  it('modelo perfeito dá 100% nas três métricas e nenhuma descartada', async () => {
    const r = await executarCaso(CASO, modeloPerfeito().chamar);
    const md = montarRelatorio({ rodada: '2026-10-25T1530', modelo: 'claude-haiku-5-5', casos: [CASO], resultados: [r] });
    assert.match(md, /Intervalo do dispositivo certo[^|]*\| 1 de 1 \(100,0%\)/);
    assert.match(md, /Questões esperadas encontradas[^|]*\| 2 de 2 \(100,0%\)/);
    assert.match(md, /Citações esperadas encontradas \| 2 de 3 \(66,7%\)/); // o modelo simulado não citou o art. 85
    assert.match(md, /Saídas descartadas pelo código \| 0 de 3 \(0,0%\)/);
    assert.match(md, /\| caso-001 \| 8 \| certo \|/);
  });

  it('sem nenhum caso validado, as taxas dizem "sem dados" em vez de 0%', () => {
    const md = montarRelatorio({ rodada: 'x', modelo: 'm', casos: [], resultados: [] });
    assert.match(md, /sem dados/);
  });

  it('lista os não enviáveis e os motivos das saídas sem resultado', async () => {
    const falha = await executarCaso(CASO, async () => ({ tipo: 'falha', mensagem: 'limite de taxa da API (429)' }));
    const md = montarRelatorio({ rodada: 'x', modelo: 'm', casos: [CASO], resultados: [falha] });
    assert.match(md, /limite de taxa da API \(429\)/);
  });
});

describe('F5-05: folha e arquivos', () => {
  const novo: Caso = { ...CASO, gabarito: null, validacao: null };

  it('a folha traz os parágrafos numerados e o modelo do gabarito', () => {
    const f = gerarFolha(novo);
    assert.match(f, /\*\*§1\.\*\* APELAÇÃO CÍVEL/);
    assert.match(f, /\*\*§8\.\*\* Condeno o réu/);
    assert.match(f, /"dispositivo"/);
    assert.match(f, /avaliacao validar caso-001/);
    assert.equal(paragrafosDoCaso(novo).length, 8);
  });

  it('grava e lê casos e resultados em disco', async () => {
    const raiz = await mkdtemp(path.join(tmpdir(), 'avaliacao-'));
    try {
      const p = { raiz };
      await gravarCaso(p, CASO);
      await gravarCaso(p, { ...novo, id: 'caso-002' });
      const lidos = await lerCasos(p);
      assert.deepEqual(lidos.map(c => c.id), ['caso-001', 'caso-002']);
      assert.deepEqual(lidos.filter(ehValidado).map(c => c.id), ['caso-001']);
      assert.equal((await lerCaso(p, 'caso-001')).validacao?.por, 'Revisor de Teste');

      const r = await executarCaso(CASO, modeloPerfeito().chamar);
      await gravarRodada(p, '2026-10-25T1530', { modelo: 'claude-haiku-5-5', em: '2026-10-25' });
      await gravarResultado(p, '2026-10-25T1530', r);
      assert.equal(await ultimaRodada(p), '2026-10-25T1530');
      assert.equal((await lerResultados(p, '2026-10-25T1530'))[0].casoId, 'caso-001');
    } finally {
      await rm(raiz, { recursive: true, force: true });
    }
  });

  it('arquivo de caso inválido diz qual arquivo e qual campo', async () => {
    const raiz = await mkdtemp(path.join(tmpdir(), 'avaliacao-'));
    try {
      const p = { raiz };
      await gravarCaso(p, CASO);
      const { writeFile } = await import('node:fs/promises');
      await writeFile(path.join(raiz, 'casos', 'caso-001.json'), JSON.stringify({ ...CASO, fonte: { ...CASO.fonte, url: 'nao-e-url' } }), 'utf8');
      await assert.rejects(() => lerCaso(p, 'caso-001'), /caso-001\.json: fonte\.url/);
    } finally {
      await rm(raiz, { recursive: true, force: true });
    }
  });
});
