/**
 * Cláusula de vigência de um ato (F3-06, vigência futura): lê o "Esta Lei entra em vigor ..." do texto do Planalto e diz quando a lei passa a valer.
 * Cobre os quatro formatos de uso corrente (na publicação, em data certa, depois de prazo contado da publicação) e devolve `complexa` para o resto
 * (vigência escalonada, "produzindo efeitos a partir de", prazo por extenso que a leitura não entende): nesses casos o aviso diz que a vigência
 * deve ser lida no ato, em vez de adivinhar uma data.
 */
export type Vigencia =
  | { tipo: 'publicacao' }
  | { tipo: 'data'; em: string }
  | { tipo: 'prazo'; quantidade: number; unidade: 'dias' | 'meses' | 'anos' }
  | { tipo: 'complexa' };

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const NUMEROS: Record<string, number> = {
  um: 1, uma: 1, dois: 2, duas: 2, 'três': 3, tres: 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9, dez: 10, doze: 12,
  quinze: 15, vinte: 20, trinta: 30, quarenta: 40, 'quarenta e cinco': 45, sessenta: 60, noventa: 90, 'cento e vinte': 120, 'cento e oitenta': 180
};

const semAcento = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** A sentença de vigência do próprio ato ("Esta Lei entra em vigor..."), a última do texto; vazio se não houver. */
export function clausulaDeVigencia(textoPlano: string): string {
  const todas = [...textoPlano.matchAll(/Art\.\s*\d+[ºo°]?\.?\s+Esta\s+Lei(?:\s+Complementar)?\s+(?:entra|entrar[áa])\s+em\s+vigor[^.;]{0,300}/gi)];
  return todas.length > 0 ? todas[todas.length - 1][0].replace(/\s+/g, ' ').replace(/\s+([,.])/g, '$1').trim() : '';
}

/** Interpreta a cláusula. `textoPlano` inteiro serve para reconhecer vigência escalonada ("produzindo efeitos a partir de"). */
export function lerVigencia(clausula: string, textoPlano = ''): Vigencia {
  if (!clausula) return { tipo: 'complexa' };
  const c = semAcento(clausula);
  const depois = semAcento(textoPlano.slice(textoPlano.lastIndexOf(clausula.slice(0, 20)) + clausula.length));
  // "produz efeitos" depois da cláusula, ou dentro dela: efeitos escalonados, que não cabem numa data só
  if (/produz(?:indo|ir|irao)?\s+efeitos|a partir d[eo]\b.*\bproduz/.test(c) || /^[^]{0,400}?produz(?:indo|ir|irao)?\s+efeitos/.test(depois.slice(0, 400))) return { tipo: 'complexa' };

  if (/\bna\s+data\s+(?:de\s+sua|da\s+sua|da)\s+publicacao\b/.test(c) && !/\bdias?\b|\bmeses\b|\banos?\b.*publicacao/.test(c.replace(/ano de \d+/g, ''))) return { tipo: 'publicacao' };

  const prazo = c.match(/(?:apos\s+(?:decorrid[oa]s?\s+)?|decorrid[oa]s?\s+)?(\d+|[a-z]+(?: e [a-z]+)?)\s*(?:\([^)]*\))?\s*(dias?|meses|mes|anos?)\b[^.]{0,40}?\bpublicacao/);
  if (prazo && /apos|decorrid|de sua publicacao|da publicacao/.test(c)) {
    const quantidade = /^\d+$/.test(prazo[1]) ? Number(prazo[1]) : NUMEROS[prazo[1]];
    if (quantidade) {
      const u = prazo[2];
      return { tipo: 'prazo', quantidade, unidade: u.startsWith('dia') ? 'dias' : u.startsWith('ano') ? 'anos' : 'meses' };
    }
    return { tipo: 'complexa' };
  }

  const data = c.match(new RegExp(String.raw`(\d{1,2})[ºo°]?\s+de\s+(${MESES.map(semAcento).join('|')})\s+de\s+(\d{4})`));
  if (data) {
    const mes = MESES.map(semAcento).indexOf(data[2]) + 1;
    return { tipo: 'data', em: `${data[3]}-${String(mes).padStart(2, '0')}-${data[1].padStart(2, '0')}` };
  }
  return { tipo: 'complexa' };
}

function somarDias(iso: string, n: number): string {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10);
}

function somarMeses(iso: string, n: number): string {
  const [a, m, d] = iso.split('-').map(Number);
  const alvo = new Date(Date.UTC(a, m - 1 + n, 1));
  const ultimo = new Date(Date.UTC(alvo.getUTCFullYear(), alvo.getUTCMonth() + 1, 0)).getUTCDate();
  return new Date(Date.UTC(alvo.getUTCFullYear(), alvo.getUTCMonth(), Math.min(d, ultimo))).toISOString().slice(0, 10);
}

/**
 * Data em que a lei passa a valer, ou nulo se não dá para dizer. Prazo contado da publicação (LC 95/98, art. 8º, § 2º): a contagem inclui o dia da
 * publicação e o último dia do prazo, e a lei vale no dia seguinte à consumação integral. Em dias, é a publicação mais N dias; em meses e anos, o
 * mesmo dia do mês no mês de destino (ou o último dia dele, se não existir).
 */
export function vigenteEm(v: Vigencia, publicacao: string | null): string | null {
  if (v.tipo === 'data') return v.em;
  if (!publicacao) return null;
  if (v.tipo === 'publicacao') return publicacao;
  if (v.tipo === 'prazo') return v.unidade === 'dias' ? somarDias(publicacao, v.quantidade) : somarMeses(publicacao, v.unidade === 'meses' ? v.quantidade : v.quantidade * 12);
  return null;
}
