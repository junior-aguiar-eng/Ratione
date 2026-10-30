/**
 * Etapa 1 do pipeline do Argumenta (F5-03), parte determinística: divide o texto colado em parágrafos numerados (§1, §2…).
 * As etapas seguintes só citam parágrafos por esse número, e a tela mostra o texto original do parágrafo, nunca um trecho escrito pelo modelo.
 */

/**
 * Acima disso a decisão é recusada, não cortada (o limite que pesa na prática é `LIMITE_CARACTERES_DECISAO`). Também está no banco
 * (`analises.paragrafos` entre 1 e 1.500, migração `20261030000001`, aplicada antes de subir este valor de 800): subir de novo exige
 * migração antes do código.
 */
export const MAX_PARAGRAFOS = 1_500;

/** Linha que termina frase: ponto, dois-pontos, ponto e vírgula, interrogação, exclamação, fechamento de aspas ou parêntese. */
const FIM_DE_FRASE = /[.:;!?"”)]$/;

/** Título em caixa alta ("SENTENÇA", "PODER JUDICIÁRIO"): fica sozinho. */
const titulo = (l: string) => l.length < 100 && /\p{Lu}/u.test(l) && !/\p{Ll}/u.test(l);

/** Linha de cabeçalho com rótulo ("Autora: …", "Advogado(s): …"): começa parágrafo novo. */
const rotulo = (l: string) => /^\p{Lu}[\p{L}() ]{1,30}:\s/u.test(l);

/**
 * Junta as linhas de um bloco. Texto copiado de PDF chega quebrado no fim de cada linha: lá, uma linha termina o parágrafo quando
 * acaba em fim de frase e é visivelmente mais curta que as outras, e título e linha com rótulo ficam separados.
 * Texto copiado de editor chega com uma linha por parágrafo.
 */
function paragrafosDoBloco(linhas: string[]): string[] {
  const maior = Math.max(...linhas.map(l => l.length));
  // Linhas longas: cada uma já é um parágrafo (cópia de editor de texto)
  if (linhas.length === 1 || maior > 200) return linhas;

  const saida: string[] = [];
  let atual = '';
  for (const linha of linhas) {
    if (atual && (titulo(linha) || rotulo(linha) || titulo(atual))) {
      saida.push(atual);
      atual = '';
    }
    if (!atual) atual = linha;
    else if (/[a-zà-ú]-$/.test(atual) && /^[a-zà-ú]/.test(linha)) atual = atual.slice(0, -1) + linha;
    else atual = `${atual} ${linha}`;
    if (FIM_DE_FRASE.test(linha) && linha.length < maior * 0.8) {
      saida.push(atual);
      atual = '';
    }
  }
  if (atual) saida.push(atual);
  return saida;
}

/** Rodapé que o PJe e outros sistemas repetem em cada página: assinatura, número do documento e "Pág. N". Não é conteúdo da decisão. */
const RODAPE = /^(?:Assinado eletronicamente por:|N[úu]mero do documento:|P[áa]g\.?\s*\d+(?:\s*(?:\/|de)\s*\d+)?$)/i;

/** Marcador de item sozinho na linha ("1.", "a)", "IV -"): pertence ao parágrafo que vem depois. */
const SO_MARCADOR = /^(?:\d{1,3}\.|[a-z]\)|[IVX]{1,6}\s?[-–.])$/;

/**
 * PDFs com linhas separadas por linha em branco cortam a frase no meio: junta um parágrafo ao seguinte quando ele não termina em
 * fim de frase e o próximo começa em minúscula, ou quando ele é só o marcador de um item.
 */
function juntarFrasesCortadas(paragrafos: string[]): string[] {
  const saida: string[] = [];
  for (const p of paragrafos) {
    const anterior = saida[saida.length - 1];
    if (anterior !== undefined && (SO_MARCADOR.test(anterior) || (!FIM_DE_FRASE.test(anterior) && /^\p{Ll}/u.test(p) && !titulo(anterior)))) {
      saida[saida.length - 1] = `${anterior} ${p}`;
    } else saida.push(p);
  }
  return saida;
}

/** Divide o texto em parágrafos: blocos separados por linha em branco e, dentro de cada bloco, a regra de `paragrafosDoBloco`. */
export function segmentar(texto: string): string[] {
  const limpo = texto.replace(/\r\n?/g, '\n').replace(/[ \t]/g, ' ');
  const paragrafos: string[] = [];
  for (const bloco of limpo.split(/\n[ ]*\n+/)) {
    const linhas = bloco
      .split('\n')
      .map(l => l.replace(/ {2,}/g, ' ').trim())
      .filter(l => l && !RODAPE.test(l));
    if (linhas.length) paragrafos.push(...paragrafosDoBloco(linhas));
  }
  return juntarFrasesCortadas(paragrafos);
}
