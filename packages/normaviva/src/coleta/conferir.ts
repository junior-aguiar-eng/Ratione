/**
 * Conferência cruzada do corpus do Planalto com a API de Dados Abertos do Senado (F3-01).
 *
 *   pnpm conferir        # confere as 28 normas e grava `corpus/conferencia-senado.json`
 *
 * Compara os atos que alteraram cada norma segundo as anotações do Planalto ("Redação dada pela Lei…", "Incluído…",
 * "Revogado…") com os atos que o Senado registra como alteradores (`vides`). Divergência não é erro por si: o Senado
 * registra relações que o Planalto não anota como alteração e vice-versa; ela marca onde a F3-03 deve olhar com cuidado.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { join } from 'node:path';
import { detectarCharset, type EntradaManifesto } from './coletar';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const PASTA = join(__dirname, '..', '..', 'corpus');
const API = 'https://legis.senado.leg.br/dadosabertos/legislacao/';

export type TipoAto = 'lei' | 'lei-complementar' | 'decreto-lei' | 'decreto' | 'medida-provisoria' | 'emenda-constitucional';

const ROTULOS: Array<[RegExp, TipoAto]> = [
  [/^lei complementar/i, 'lei-complementar'],
  [/^lei/i, 'lei'],
  [/^decreto[- ]lei/i, 'decreto-lei'],
  [/^decreto/i, 'decreto'],
  [/^medida provis[óo]ria/i, 'medida-provisoria'],
  [/^emenda constitucional/i, 'emenda-constitucional']
];

/** Chave canônica de um ato: `lei:13256:2016`. */
export function chaveDoAto(tipo: TipoAto, numero: string, ano: string): string {
  return `${tipo}:${numero.replace(/\./g, '')}:${ano}`;
}

const FONTE_PADRAO_ATO =
  /(Lei Complementar|Lei|Decreto-Lei|Decreto|Medida Provis[óo]ria|Emenda Constitucional(?: de Revis[ãa]o)?)\s+n[ºo°.]*\s*([\d.]+)(?:\/(\d{4})|\s*,?\s+de\s+(?:\d{1,2}[./]\d{1,2}[./])?(\d{4})|\s+de\s+\d{1,2}\s+de\s+\w+\s+de\s+(\d{4}))/i;

/** Expressão nova a cada uso: uma regex global compartilhada carrega `lastIndex` entre chamadas e pula achados. */
const padraoAto = () => new RegExp(FONTE_PADRAO_ATO.source, 'gi');

const ENTIDADES: Record<string, string> = {
  nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', ordm: 'º', ordf: 'ª', deg: '°',
  ccedil: 'ç', Ccedil: 'Ç', atilde: 'ã', Atilde: 'Ã', otilde: 'õ', Otilde: 'Õ', aacute: 'á', Aacute: 'Á', eacute: 'é', Eacute: 'É',
  iacute: 'í', Iacute: 'Í', oacute: 'ó', Oacute: 'Ó', uacute: 'ú', Uacute: 'Ú', agrave: 'à', Agrave: 'À', acirc: 'â', Acirc: 'Â',
  ecirc: 'ê', Ecirc: 'Ê', ocirc: 'ô', Ocirc: 'Ô', uuml: 'ü', ndash: '–', mdash: '—', sect: '§'
};

/** Remove tags e decodifica as entidades HTML que o Planalto usa nas anotações. */
export function textoSemHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&([a-zA-Z]+);/g, (t, nome) => ENTIDADES[nome] ?? t)
    .replace(/\s+/g, ' ');
}

/** Atos citados nos trechos entre parênteses que anotam alteração ("Redação dada…", "Incluído…", "Revogado…"). */
export function atosAlteradoresDoPlanalto(texto: string): Set<string> {
  const achados = new Set<string>();
  const semTags = textoSemHtml(texto);
  for (const trecho of semTags.matchAll(/\(([^()]{0,400})\)/g)) {
    if (!/Reda[çc][ãa]o dada|Inclu[ií]d[oa]|Revogad[oa]|Suprimid[oa]|Acrescid[oa]/i.test(trecho[1])) continue;
    for (const m of trecho[1].matchAll(padraoAto())) {
      const tipo = ROTULOS.find(([re]) => re.test(m[1]))?.[1];
      if (tipo) achados.add(chaveDoAto(tipo, m[2], m[3] ?? m[4] ?? m[5]));
    }
  }
  return achados;
}

/** "Lei nº 13.256 de 04/02/2016" → chave do ato. */
export function chaveDoNomeSenado(nome: string): string | undefined {
  const m = padraoAto().exec(nome);
  if (!m) return undefined;
  const tipo = ROTULOS.find(([re]) => re.test(m[1]))?.[1];
  return tipo ? chaveDoAto(tipo, m[2], m[3] ?? m[4] ?? m[5]) : undefined;
}

/**
 * Comentários do Senado que são alteração PERMANENTE do texto. Ficam de fora as alterações provisórias (medidas provisórias
 * que perderam eficácia ou foram convertidas), a regulamentação, a legislação correlata, a ressalva e a constitucionalidade.
 */
export function ehAlteracao(comentario: string): boolean {
  return /permanente/i.test(comentario) && /altera[çc][ãa]o|revoga[çc][ãa]o|reda[çc][ãa]o|supress[ãa]o|acr[ée]scimo|inclus[ãa]o/i.test(comentario) && !/regulament|correlata|ressalva|constitucion/i.test(comentario);
}

interface VideSenado {
  nomeNormaPosterior: string;
  comentario: string;
}

function urlSenado(id: string): string {
  if (id === 'CF-1988') return `${API}urn?urn=urn:lex:br:federal:constituicao:1988-10-05;1988`;
  // Decretos-leis só respondem pela URN, que leva a data de assinatura (Planalto, cabeçalho de cada decreto-lei)
  const DATA_DL: Record<string, string> = { 'DL-2848-1940': '1940-12-07', 'DL-3689-1941': '1941-10-03', 'DL-4657-1942': '1942-09-04', 'DL-5452-1943': '1943-05-01' };
  if (DATA_DL[id]) return `${API}urn?urn=urn:lex:br:federal:decreto.lei:${DATA_DL[id]};${id.split('-')[1]}`;
  const m = id.match(/^(LEI|DL|LC)-(\d+)-(\d{4})$/)!;
  const tipo = m[1] === 'LEI' ? 'lei' : m[1] === 'DL' ? 'decreto-lei' : 'lei-complementar';
  return `${API}${tipo}/${m[2]}/${m[3]}`;
}

async function buscarSenado(id: string): Promise<{ url: string; normaNome: string; vides: VideSenado[] }> {
  const url = urlSenado(id);
  let r: Response | undefined;
  for (let tentativa = 1; tentativa <= 3; tentativa++) {
    r = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' }, signal: AbortSignal.timeout(30_000) });
    if (r.ok) break;
    await new Promise(res => setTimeout(res, 3000));
  }
  if (!r!.ok) throw new Error(`${id}: Senado respondeu HTTP ${r!.status} (3 tentativas)`);
  const doc = (await r!.json()).DetalheDocumento.documentos.documento;
  const d = Array.isArray(doc) ? doc[0] : doc;
  const vides: VideSenado[] = d.vides?.vide ? (Array.isArray(d.vides.vide) ? d.vides.vide : [d.vides.vide]) : [];
  return { url, normaNome: d.identificacao.normaNome, vides };
}

/** O ato aparece em qualquer lugar do texto do Planalto (mesmo fora de anotação de alteração)? */
export function atoCitadoNoTexto(chave: string, textoPlano: string): boolean {
  const [, numero, ano] = chave.split(':');
  const comPonto = Number(numero).toLocaleString('pt-BR');
  const re = new RegExp(String.raw`n[ºo°.]*\s*(${comPonto.replace(/\./g, '\.')}|${numero})\s*(,\s*de\s+[\d./]*${ano}|/${ano}|\s+de\s+${ano})`, 'i');
  return re.test(textoPlano);
}

export interface ResultadoConferencia {
  id: string;
  senadoUrl: string;
  senadoNorma: string;
  atosNoPlanalto: number;
  atosNoSenado: number;
  emAmbos: number;
  soNoPlanalto: string[];
  soNoSenado: string[];
  /** Só no Senado, mas o Planalto cita o ato fora de uma anotação de alteração (relação, vigência, regulamento). */
  soNoSenadoCitadoSemAnotacao: string[];
  /** Só no Senado e sem nenhuma citação no texto do Planalto: possível lacuna de consolidação. */
  soNoSenadoAusenteDoPlanalto: string[];
}

async function main() {
  const manifesto: EntradaManifesto[] = JSON.parse(readFileSync(join(PASTA, 'planalto', 'manifesto.json'), 'utf-8'));
  const saida: ResultadoConferencia[] = [];
  for (const m of manifesto) {
    const texto = detectarCharset(gunzipSync(readFileSync(join(PASTA, 'planalto', m.arquivo))), null).texto;
    const planalto = atosAlteradoresDoPlanalto(texto);
    const { url, normaNome, vides } = await buscarSenado(m.id);
    const senado = new Set<string>();
    for (const v of vides) {
      const chave = chaveDoNomeSenado(v.nomeNormaPosterior);
      if (chave && ehAlteracao(v.comentario)) senado.add(chave);
    }
    const soPlanalto = [...planalto].filter(c => !senado.has(c)).sort();
    const soSenado = [...senado].filter(c => !planalto.has(c)).sort();
    const plano = textoSemHtml(texto);
    const citados = soSenado.filter(c => atoCitadoNoTexto(c, plano));
    saida.push({ id: m.id, senadoUrl: url, senadoNorma: normaNome, atosNoPlanalto: planalto.size, atosNoSenado: senado.size, emAmbos: planalto.size - soPlanalto.length, soNoPlanalto: soPlanalto, soNoSenado: soSenado, soNoSenadoCitadoSemAnotacao: citados, soNoSenadoAusenteDoPlanalto: soSenado.filter(c => !citados.includes(c)) });
    console.log(`${m.id.padEnd(15)} planalto ${String(planalto.size).padStart(3)}  senado ${String(senado.size).padStart(3)}  em ambos ${String(planalto.size - soPlanalto.length).padStart(3)}  só planalto ${String(soPlanalto.length).padStart(3)}  só senado ${String(soSenado.length).padStart(3)}  (ausentes do texto: ${soSenado.length - citados.length})`);
    await new Promise(r => setTimeout(r, 500));
  }
  writeFileSync(join(PASTA, 'conferencia-senado.json'), JSON.stringify({ geradoEm: new Date().toISOString().slice(0, 10), normas: saida }, null, 2) + '\n', 'utf-8');
}

if (require.main === module) void main();
