import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { segmentar } from './segmentar';
import { pseudonimizar, restaurar, temDadoPessoal } from './pseudonimizar';
import { LIMITE_CARACTERES_DECISAO, blocoDaDecisao, paragrafosExistem, paragrafosValidos, prepararDecisao } from './decisao';

/** Sentença fictícia, no formato em que chega copiada de um PDF (linhas quebradas no meio da frase). */
const SENTENCA = `PODER JUDICIÁRIO
Processo nº 0001234-56.2024.8.02.0001
Autora: MARIA APARECIDA DOS SANTOS, brasileira, CPF 123.456.789-09
Réu: BANCO FICTÍCIO S.A., CNPJ 12.345.678/0001-90
Advogado(s): JOÃO PEREIRA LIMA (OAB/AL 12.345)

SENTENÇA

Trata-se de ação ajuizada por MARIA APARECIDA DOS SANTOS em face de BANCO FICTÍCIO S.A., alegando
que foi vítima de fraude em transferências via PIX realizadas a partir de sua conta, e que o
réu se recusou a restituir os valores. Reside na Rua das Flores, 120, CEP 57000-000, e pode ser
contatada pelo telefone (82) 99999-1234 ou pelo e-mail maria.santos@exemplo.com.br.

É o relatório. Decido.

A responsabilidade da instituição financeira é objetiva (CDC, art. 14), e a Súmula 479 do STJ
afasta a alegação de culpa exclusiva de terceiro em fraudes no âmbito de operações bancárias.

Ante o exposto, JULGO PROCEDENTE o pedido para condenar BANCO FICTÍCIO S.A. a restituir os
valores, e condeno o réu ao pagamento de honorários de 10% sobre o valor da condenação.`;

describe('Argumenta: segmentação em parágrafos', () => {
  it('junta as linhas quebradas do PDF e separa nos fins de parágrafo', () => {
    const p = segmentar(SENTENCA);
    assert.ok(p.some(x => x.startsWith('Trata-se de ação') && x.endsWith('maria.santos@exemplo.com.br.')), 'o parágrafo do relatório vem inteiro');
    assert.ok(p.includes('É o relatório. Decido.'));
    assert.ok(p.some(x => x.startsWith('Ante o exposto') && x.endsWith('valor da condenação.')));
    assert.ok(p.every(x => !x.includes('\n')), 'nenhum parágrafo tem quebra de linha');
  });

  it('texto copiado de editor (uma linha por parágrafo) fica um parágrafo por linha', () => {
    const longa = 'Lorem ipsum dolor sit amet, '.repeat(10).trim();
    assert.deepEqual(segmentar(`${longa}\n${longa}\n${longa}`), [longa, longa, longa]);
  });

  it('junta palavra hifenizada na quebra de linha', () => {
    assert.deepEqual(segmentar('A sentença reconheceu a respon-\nsabilidade objetiva do banco réu, que agora recorre da\ndecisão.\nFim.'), [
      'A sentença reconheceu a responsabilidade objetiva do banco réu, que agora recorre da decisão.',
      'Fim.'
    ]);
  });

  it('cabeçalho copiado do PDF: título e cada linha com rótulo viram parágrafos próprios', () => {
    assert.deepEqual(segmentar(SENTENCA).slice(0, 5), [
      'PODER JUDICIÁRIO',
      'Processo nº 0001234-56.2024.8.02.0001',
      'Autora: MARIA APARECIDA DOS SANTOS, brasileira, CPF 123.456.789-09',
      'Réu: BANCO FICTÍCIO S.A., CNPJ 12.345.678/0001-90',
      'Advogado(s): JOÃO PEREIRA LIMA (OAB/AL 12.345)'
    ]);
  });

  it('PDF do PJe: tira o rodapé de cada página e junta frases cortadas por linha em branco', () => {
    const pje = `Os autos tratam de fraude.

Assinado eletronicamente por: FULANO DE TAL - 23/06/2026 15:57:00 https://exemplo.jus.br/documento?x=1
Número do documento: 26062315570079500000254276618

Pág. 1

1.

Trata-se de recurso interposto pelo autor contra a

sentença que julgou improcedente o pedido.

Da culpa exclusiva

A autora instalou o aplicativo.`;
    assert.deepEqual(segmentar(pje), [
      'Os autos tratam de fraude.',
      '1. Trata-se de recurso interposto pelo autor contra a sentença que julgou improcedente o pedido.',
      'Da culpa exclusiva',
      'A autora instalou o aplicativo.'
    ]);
  });

  it('texto vazio não gera parágrafo', () => {
    assert.deepEqual(segmentar(' \n\n \r\n'), []);
  });
});

describe('Argumenta: pseudonimização', () => {
  const { texto, substituicoes } = pseudonimizar(segmentar(SENTENCA).join('\n\n'));

  it('troca partes, advogado e identificadores, e a mesma pessoa recebe sempre o mesmo marcador', () => {
    for (const dado of [
      'MARIA APARECIDA DOS SANTOS',
      'BANCO FICTÍCIO S.A.',
      'JOÃO PEREIRA LIMA',
      '123.456.789-09',
      '12.345.678/0001-90',
      '0001234-56.2024.8.02.0001',
      'OAB/AL 12.345',
      '57000-000',
      '(82) 99999-1234',
      'maria.santos@exemplo.com.br',
      'Rua das Flores, 120'
    ]) {
      assert.ok(!texto.includes(dado), `"${dado}" não sai no texto enviado`);
    }
    const maria = substituicoes.find(s => s.original === 'MARIA APARECIDA DOS SANTOS');
    assert.equal(maria?.marcador, '[PARTE_1]');
    assert.equal(texto.split('[PARTE_1]').length - 1, 2, 'as duas menções à autora viram o mesmo marcador');
    assert.equal(substituicoes.find(s => s.original === 'JOÃO PEREIRA LIMA')?.tipo, 'ADVOGADO');
    assert.ok(!texto.includes('[PARTE_2].'), 'o ponto de "S.A." fica dentro do marcador');
  });

  it('mantém o que a análise precisa: normas, súmulas e o texto jurídico', () => {
    for (const trecho of ['CDC, art. 14', 'Súmula 479 do STJ', 'JULGO PROCEDENTE', 'honorários de 10%']) assert.ok(texto.includes(trecho), trecho);
  });

  it('restaurar devolve o texto original e ignora marcador desconhecido', () => {
    assert.equal(restaurar(texto, substituicoes), segmentar(SENTENCA).join('\n\n'));
    assert.equal(restaurar('[PARTE_9] e [PARTE_1]', substituicoes), '[PARTE_9] e MARIA APARECIDA DOS SANTOS');
  });

  it('rodar de novo sobre o texto trocado não acha mais nada (é o que o servidor confere)', () => {
    assert.equal(temDadoPessoal(texto), false);
    assert.deepEqual(pseudonimizar(texto).substituicoes, []);
    assert.equal(temDadoPessoal('O CPF do autor é 123.456.789-09.'), true);
  });

  it('nomes pedidos pelo usuário são trocados em qualquer caixa; ente público rotulado fica', () => {
    const r = pseudonimizar('Interessado: Ministério Público\n\nA testemunha Carlos Souza disse que CARLOS SOUZA estava lá.', ['Carlos Souza']);
    assert.equal(r.texto, 'Interessado: Ministério Público\n\nA testemunha [PARTE_1] disse que [PARTE_1] estava lá.');
  });

  it('não confunde intervalo de anos nem número de lei com telefone ou CEP', () => {
    assert.equal(temDadoPessoal('Nos exercícios de 2019-2020, a Lei nº 13.105/2015 e o art. 1.022 se aplicam.'), false);
  });

  it('não troca pedaço de palavra', () => {
    assert.equal(pseudonimizar('Autor: Ana\n\nA banana e a Ana.').texto, 'Autor: [PARTE_1]\n\nA banana e a [PARTE_1].');
  });
});

describe('Argumenta: decisão preparada para envio', () => {
  it('prepararDecisao entrega parágrafos trocados, a tabela e o tamanho', () => {
    const d = prepararDecisao(SENTENCA);
    assert.equal(d.paragrafos.length, segmentar(SENTENCA).length, 'a troca não muda a contagem de parágrafos');
    assert.equal(d.caracteres, blocoDaDecisao(d.paragrafos).length);
    assert.ok(paragrafosValidos(d.paragrafos));
    assert.equal(temDadoPessoal(d.paragrafos.join('\n\n')), false);
    assert.match(blocoDaDecisao(d.paragrafos), /^<decisao>\n§1\. PODER JUDICIÁRIO\n/);
  });

  it('paragrafosValidos recusa o que não é lista de parágrafos ou passa do limite', () => {
    for (const ruim of [undefined, 'texto', [], [''], [1], ['a\n\nb'], ['x'.repeat(8_001)], Array(30).fill('y'.repeat(1_000))]) {
      assert.equal(paragrafosValidos(ruim), false);
    }
    assert.ok(Array(20).fill('y'.repeat(1_000)).join('').length < LIMITE_CARACTERES_DECISAO);
  });

  it('paragrafosExistem confere números citados', () => {
    assert.ok(paragrafosExistem([1, 3], 3));
    assert.equal(paragrafosExistem([0], 3), false);
    assert.equal(paragrafosExistem([4], 3), false);
    assert.equal(paragrafosExistem([1.5], 3), false);
  });
});
