/**
 * Diferença palavra por palavra entre duas redações (F3-04, "o que mudou"). Função pura: o texto é dividido em palavras, espaços e sinais, e a
 * maior subsequência comum separa o que ficou, o que saiu e o que entrou. Nada é interpretado: só se mostra o que mudou no texto.
 */
export interface Trecho {
  tipo: 'igual' | 'removido' | 'inserido';
  texto: string;
}

const PEÇAS = /\s+|[\p{L}\p{N}_º°ª]+|[^\s\p{L}\p{N}_º°ª]/gu;
/** Acima disto (peças antes × peças depois) a tabela fica pesada: devolve o texto inteiro como trocado. */
const LIMITE = 4_000_000;

export function diffPalavras(antes: string, depois: string): Trecho[] {
  const a = antes.match(PEÇAS) ?? [];
  const b = depois.match(PEÇAS) ?? [];
  if (a.length * b.length > LIMITE) return [...(antes ? [{ tipo: 'removido' as const, texto: antes }] : []), ...(depois ? [{ tipo: 'inserido' as const, texto: depois }] : [])];

  // tabela[i][j] = tamanho da maior subsequência comum de a[i..] e b[j..]
  const tabela: Uint32Array[] = Array.from({ length: a.length + 1 }, () => new Uint32Array(b.length + 1));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      tabela[i][j] = a[i] === b[j] ? tabela[i + 1][j + 1] + 1 : Math.max(tabela[i + 1][j], tabela[i][j + 1]);
    }
  }
  // 1) a sequência de operações, peça por peça
  const ops: Trecho[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) ops.push({ tipo: 'igual', texto: a[i++] }), j++;
    else if (j < b.length && (i === a.length || tabela[i][j + 1] >= tabela[i + 1][j])) ops.push({ tipo: 'inserido', texto: b[j++] });
    else ops.push({ tipo: 'removido', texto: a[i++] });
  }

  // 2) em trechos legíveis: o espaço que fica entre duas palavras trocadas entra na troca (senão "deverão obedecer" sairia picado)
  const saida: Trecho[] = [];
  const juntar = (tipo: Trecho['tipo'], texto: string) => {
    const ultimo = saida[saida.length - 1];
    if (ultimo && ultimo.tipo === tipo) ultimo.texto += texto;
    else saida.push({ tipo, texto });
  };
  let saiu = '';
  let entrou = '';
  let pendente = '';
  let emTroca = false;
  const fechaTroca = () => {
    if (saiu) juntar('removido', saiu);
    if (entrou) juntar('inserido', entrou);
    saiu = entrou = '';
    emTroca = false;
  };
  for (const op of ops) {
    if (op.tipo === 'igual') {
      if (emTroca && /^\s+$/.test(op.texto)) {
        pendente += op.texto;
        continue;
      }
      if (emTroca) {
        fechaTroca();
        if (pendente) juntar('igual', pendente);
        pendente = '';
      }
      juntar('igual', op.texto);
    } else {
      emTroca = true;
      if (pendente) {
        saiu += pendente;
        entrou += pendente;
        pendente = '';
      }
      if (op.tipo === 'removido') saiu += op.texto;
      else entrou += op.texto;
    }
  }
  if (emTroca) {
    fechaTroca();
    if (pendente) juntar('igual', pendente);
  }
  return saida;
}
