/**
 * HTML do Planalto → parágrafos de texto limpo (F3-02).
 *
 * O Planalto serve HTML de FrontPage/Word: `<p>` sem fechamento, `<font>` aninhado, entidades, `º` escrito como
 * `<sup>o</sup>`. Leitor por tokens, sem dependência: abre parágrafo em `<p>`, `<div>`, `<table>`, `<tr>`, `<h1-6>`;
 * descarta `<script>`, `<style>` e tudo o que estiver tachado (`<strike>`, `<s>`, `<del>`), porque texto tachado é a
 * redação que perdeu a vigência (regra 3 do PLANO, §1: vale o que não está tachado).
 */
const ENTIDADES: Record<string, string> = {
  nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", ordm: 'º', ordf: 'ª', deg: '°', sect: '§',
  ccedil: 'ç', Ccedil: 'Ç', atilde: 'ã', Atilde: 'Ã', otilde: 'õ', Otilde: 'Õ', aacute: 'á', Aacute: 'Á', eacute: 'é', Eacute: 'É',
  iacute: 'í', Iacute: 'Í', oacute: 'ó', Oacute: 'Ó', uacute: 'ú', Uacute: 'Ú', agrave: 'à', Agrave: 'À', acirc: 'â', Acirc: 'Â',
  ecirc: 'ê', Ecirc: 'Ê', ocirc: 'ô', Ocirc: 'Ô', uuml: 'ü', ndash: '–', mdash: '—', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’', hellip: '…'
};

export function decodificarEntidades(s: string): string {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&([a-zA-Z]+);/g, (t, nome) => ENTIDADES[nome] ?? t);
}

const QUEBRAM_PARAGRAFO = new Set(['p', 'div', 'table', 'tr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'ul', 'ol', 'center', 'blockquote']);
const TACHADO = new Set(['strike', 's', 'del']);
const IGNORADOS = new Set(['script', 'style', 'head']);

/** Parágrafos de texto, na ordem do documento, sem o conteúdo tachado e com espaços normalizados. */
const RE_ROTULO_TACHADO = /^(Arts?\.?\s*\d[\d.]*\s*[ºo°]?(?:\s*-\s*[A-Z]{1,2})?\s*\.?|§\s*\d[\d.]*\s*[ºo°]?(?:\s*-\s*[A-Z]{1,2})?\s*\.?|Par[áa]grafo [úu]nico\s*\.?|[IVXLCDM]+(?:\s*-\s*[A-Z]{1,2})?\s+[-–—]|[a-z]\))/;

export interface ParagrafoComTachado {
  /** Texto vigente do parágrafo (sem o tachado), como o parser o recebe. */
  texto: string;
  /** Trechos tachados que fecharam neste parágrafo: a redação que perdeu a vigência (só serve de evidência histórica, nunca de texto vigente). */
  tachados: string[];
}

/** Parágrafos de texto sem o tachado (a entrada do parser). */
export function paragrafosDoHtml(html: string): string[] {
  return paragrafosComTachado(html).map(p => p.texto);
}

/** Os mesmos parágrafos, com o texto tachado de cada um guardado à parte (F3-07: redação anterior de um dispositivo). */
export function paragrafosComTachado(html: string): ParagrafoComTachado[] {
  const saida: ParagrafoComTachado[] = [];
  let tachadosAtual: string[] = [];
  let atual = '';
  let tachado = 0;
  let tachadoTexto = '';
  let rotuloResgatado = '';
  let ignorado = 0;
  const fecha = () => {
    // O rótulo do texto tachado só fica se o parágrafo traz "(Revogado…)"; sem isso era redação antiga, trocada por outra logo abaixo
    if (rotuloResgatado && !/\(\s*(Revogad|Vetad|Suprimid)/i.test(atual.slice(rotuloResgatado.length))) atual = atual.slice(rotuloResgatado.length);
    rotuloResgatado = '';
    const t = atual.replace(/[\s ]+/g, ' ').trim();
    // Parágrafo inteiro tachado (a redação antiga) vem logo antes do parágrafo com a redação nova: o tachado espera o próximo com texto
    if (t) {
      saida.push({ texto: t, tachados: tachadosAtual });
      tachadosAtual = [];
    }
    atual = '';
  };
  const sem = html.replace(/<!--[\s\S]*?-->/g, '');
  for (const m of sem.matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>|([^<]+|<)/g)) {
    if (m[4] !== undefined) {
      if (!ignorado) {
        if (tachado) tachadoTexto += decodificarEntidades(m[4]);
        else atual += decodificarEntidades(m[4]);
      }
      continue;
    }
    const fechando = m[1] === '/';
    const tag = m[2].toLowerCase();
    if (IGNORADOS.has(tag)) ignorado += fechando ? -1 : 1;
    else if (TACHADO.has(tag)) {
      tachado = Math.max(0, tachado + (fechando ? -1 : 1));
      if (tachado === 0) {
        // Dispositivo revogado com o texto inteiro tachado: o texto sai, mas o rótulo fica para a "(Revogado…)" que vem depois,
        // senão o artigo some do corpus.
        const grupo = tachadoTexto.replace(/\s+/g, ' ').trim();
        if (grupo) tachadosAtual.push(grupo);
        const rotulo = grupo.match(RE_ROTULO_TACHADO)?.[1];
        if (rotulo && atual.replace(/\s+/g, '') === '') {
          atual = rotulo + ' ';
          rotuloResgatado = atual;
        }
        tachadoTexto = '';
      }
    }
    else if (QUEBRAM_PARAGRAFO.has(tag)) fecha();
    else if (tag === 'br' && !tachado && !ignorado) atual += ' ';
    if (ignorado < 0) ignorado = 0;
  }
  fecha();
  return saida;
}
