/**
 * Parser LC 95/1998 (F3-02): parágrafos limpos do Planalto → árvore de dispositivos (artigo, parágrafo, inciso, alínea, item).
 *
 * Regras:
 * - Só texto não tachado entra (ver `html.ts`).
 * - Anotações entre parênteses ("Redação dada pela…", "Incluído pela…", "Revogado pela…", "Vide…", "Vigência…") saem do
 *   texto e ficam em `anotacoes`, na ordem; a F3-03 as transforma em versões.
 * - Linha que não é dispositivo, cabeçalho nem anotação é preservada em `continuacao` do dispositivo anterior ou, antes do
 *   primeiro artigo, em `preambulo`; nunca é descartada em silêncio.
 * - Rótulo que não segue a LC 95 não é adivinhado: vira continuação e aparece nas anomalias.
 * - Texto entre aspas “…” é a redação que a lei dá a OUTRA norma ("passa a vigorar acrescido…"): fica na continuação do artigo que a
 *   traz, sem virar dispositivo desta norma.
 */
import type { TipoDispositivo } from '@ratione/core';

export type TipoAnotacao = 'redacao_dada' | 'incluido' | 'revogado' | 'vide' | 'vigencia' | 'regulamento' | 'renumerado' | 'vetado' | 'outra';

export interface Anotacao {
  tipo: TipoAnotacao;
  /** Texto da anotação sem os parênteses. */
  texto: string;
}

export interface PassoCaminho {
  tipo: TipoDispositivo;
  /** "85", "1º", "6º-A", "II", "a", "único". */
  numero: string;
}

export interface DispositivoParseado {
  /** Escopo do texto: `corpo` ou, p. ex., `ADCT` (Constituição) e `anexo-N`. */
  escopo: string;
  caminho: PassoCaminho[];
  /** "art. 85, § 2º, I, a)". */
  rotulo: string;
  tipo: TipoDispositivo;
  numero: string;
  /** Texto vigente do dispositivo, sem rótulo e sem anotações. Vazio quando revogado. */
  texto: string;
  anotacoes: Anotacao[];
  revogado: boolean;
  /** Linhas seguintes sem rótulo (continuação do mesmo dispositivo). */
  continuacao: string[];
  /** Cabeçalhos vigentes quando o artigo começa (livro, título, capítulo, seção). Só em artigos. */
  estrutura?: string[];
}

export interface ResultadoParser {
  dispositivos: DispositivoParseado[];
  preambulo: string[];
  /** Rótulos repetidos no mesmo escopo, numeração reiniciada e linhas que pareceram dispositivo sem seguir a LC 95. */
  anomalias: string[];
}

const ORD = '(?:º|°|o(?=[\\s.\\-–—:]|$))';
/**
 * Sufixo de artigo ou parágrafo acrescido: "58-A", "§ 2 o -A.", "359-M-A" (duplo) e "401A." (colado, só antes de ponto).
 * Nunca com espaço depois do hífen: em "Art. 3º - A lei…" e "§ 1º - O Presidente…" a letra é o artigo definido do texto.
 */
const SUFIXO = '(?:(?:\\s*-|(?=[A-Z]\\.))([A-Z]{1,2}(?:-[A-Z])?)(?![a-zA-Zá-ú]))?';
const RE_ARTIGO = new RegExp(`^Art\\.?\\s*\\.?\\s*(\\d+(?:\\.\\d{3})*)\\s*(${ORD})?${SUFIXO}\\s*(?:[.\\-–—:]\\s*)?(.*)$`);
/** "Arts. 187 a 196 (Revogados…)" e "Arts. 5º e 6º (…)": faixa ou par de artigos numa só linha. */
const RE_ARTIGOS = new RegExp(String.raw`^Arts?\.?\s*(\d+(?:\.\d{3})*)\s*(?:${ORD})?\s*\.?\s*(a|ao|e|ou)\s*(\d+(?:\.\d{3})*)\s*(?:${ORD})?\s*(?:[.\-–—:]\s*)?(.*)$`);
const RE_PARAGRAFO_UNICO = /^Par[áa]grafo [úu]nico\s*[.\-–—:]?\s*(.*)$/i;
const RE_PARAGRAFO = new RegExp(`^§\\s*(\\d+)\\s*(${ORD})?${SUFIXO}\\s*(?:[.\\-–—:]\\s*)?(.*)$`);
const RE_INCISO = /^([IVXLCDM]+)(?:\s*-\s*([A-Z]{1,2}))?\s*[-–—]\s+(.*)$/;
const RE_INCISO_ANOTADO = /^([IVXLCDM]+)(?:\s*-\s*([A-Z]{1,2}))?\s+(\((?:Revogad|Vetad|Vide).*)$/;
const RE_ALINEA = /^([a-z])\)\s*(.*)$/;
const RE_ITEM = /^(\d{1,2})\.\s+(.*)$/;
const RE_CABECALHO = /^(PARTE|LIVRO|T[ÍI]TULO|CAP[ÍI]TULO|SE[ÇC][ÃA]O|SUBSE[ÇC][ÃA]O)\b/i;
const RE_ANOTACAO = /^\((?:Reda[çc][ãa]o dada|Inclu[ií]d|Revogad|Vide|Vig[êe]ncia|Produ[çc][ãa]o de efeito|Regulament|Renumerad|Suprimid|Acrescid|Vetad|Promulga[çc][ãa]o|Declarad|Express[ãa]o|Texto)/i;

const ORDEM_CABECALHO = ['PARTE', 'LIVRO', 'TITULO', 'CAPITULO', 'SECAO', 'SUBSECAO'];
const NIVEL: Record<TipoDispositivo, number> = { artigo: 1, paragrafo: 2, paragrafo_unico: 2, inciso: 3, alinea: 4, item: 5 };

function tipoDaAnotacao(t: string): TipoAnotacao {
  if (/^Reda[çc][ãa]o dada/i.test(t)) return 'redacao_dada';
  if (/^(Inclu[ií]d|Acrescid)/i.test(t)) return 'incluido';
  if (/^(Revogad|Suprimid)/i.test(t)) return 'revogado';
  if (/^Vide/i.test(t)) return 'vide';
  if (/^Vig[êe]ncia/i.test(t)) return 'vigencia';
  if (/^Produ[çc][ãa]o de efeito/i.test(t)) return 'vigencia';
  if (/^Regulament/i.test(t)) return 'regulamento';
  if (/^Renumerad/i.test(t)) return 'renumerado';
  if (/^Vetad/i.test(t)) return 'vetado';
  return 'outra';
}

/**
 * "Produção de efeitos" sem parênteses: o Planalto a escreve como texto de link logo depois de outra anotação ("(Incluído pela Emenda…) Produção de efeitos").
 * Só vale no fim do texto e junto de outra anotação, para nunca cortar texto de lei.
 */
const RE_PRODUCAO_SOLTA = /(?:^|\s)(Produ[çc][ãa]o de efeitos?)\s*$/;

/** Separa o texto das anotações entre parênteses (com um nível de parênteses interno, como "(Vide ADIN 4.296)"). */
export function separarAnotacoes(linha: string): { texto: string; anotacoes: Anotacao[] } {
  const anotacoes: Anotacao[] = [];
  const texto = linha
    .replace(/\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g, (todo, dentro: string) => {
      if (!RE_ANOTACAO.test(todo)) return todo;
      anotacoes.push({ tipo: tipoDaAnotacao(dentro), texto: dentro.replace(/\s+/g, ' ').trim() });
      return ' ';
    })
    .replace(/\s+/g, ' ')
    .trim();
  const solta = anotacoes.length > 0 ? texto.match(RE_PRODUCAO_SOLTA) : null;
  if (solta) anotacoes.push({ tipo: 'vigencia', texto: solta[1] });
  const sem = solta ? texto.slice(0, solta.index).trim() : texto;
  const limpo = sem.replace(/^[-–—:.\s]+/, '').trim();
  // Só pontuação (";", ")") é sobra do texto tachado ao lado do rótulo: o dispositivo não tem texto
  return { texto: /^[\s;:.,()\-–—]*$/.test(limpo) ? '' : limpo, anotacoes };
}

/** "5" + "º" → "5º" (só até 9, como na LC 95); "1.045" fica "1.045"; sufixo "-A" mantido. */
function numeroOrdinal(digitos: string, ordinal: string | undefined, letra: string | undefined): string {
  const n = Number(digitos.replace(/\./g, ''));
  const base = ordinal && n <= 9 ? `${digitos}º` : digitos;
  return letra ? `${base}-${letra}` : base;
}

function rotuloDe(caminho: PassoCaminho[]): string {
  return caminho
    .map(p => {
      if (p.tipo === 'artigo') return `art. ${p.numero}`;
      if (p.tipo === 'paragrafo_unico') return 'parágrafo único';
      if (p.tipo === 'paragrafo') return `§ ${p.numero}`;
      if (p.tipo === 'alinea') return `${p.numero})`;
      if (p.tipo === 'item') return `${p.numero}.`;
      return p.numero;
    })
    .join(', ');
}

export interface Marca {
  tipo: TipoDispositivo;
  numero: string;
  resto: string;
}

export function marcaDaLinha(linha: string, temArtigo: boolean): Marca | undefined {
  let m = linha.match(RE_ARTIGO);
  if (m) return { tipo: 'artigo', numero: numeroOrdinal(m[1], m[2], m[3]), resto: m[4] };
  if (!temArtigo) return undefined;
  m = linha.match(RE_PARAGRAFO_UNICO);
  if (m) return { tipo: 'paragrafo_unico', numero: 'único', resto: m[1] };
  m = linha.match(RE_PARAGRAFO);
  if (m) return { tipo: 'paragrafo', numero: numeroOrdinal(m[1], m[2], m[3]), resto: m[4] };
  m = linha.match(RE_INCISO) ?? linha.match(RE_INCISO_ANOTADO);
  if (m) return { tipo: 'inciso', numero: m[2] ? `${m[1]}-${m[2]}` : m[1], resto: m[3] };
  m = linha.match(RE_ALINEA);
  if (m) return { tipo: 'alinea', numero: m[1], resto: m[2] };
  m = linha.match(RE_ITEM);
  if (m) return { tipo: 'item', numero: m[1], resto: m[2] };
  return undefined;
}

/** Artigos revogados que o Planalto cola no mesmo parágrafo ("Art. 192. (Revogado…) Art. 193. (Revogado…)"): separa em linhas. */
const RE_REVOGADO_COLADO = new RegExp(String.raw`(?<=\S)\s+(?=Arts?\.?\s*\d[\d.]*\s*[ºo°]?(?:-[A-Z])?\s*\.?\s*(?:(?:a|ao|e|ou)\s*\d[\d.]*\s*[ºo°]?\s*\.?\s*)?\((?:Revogad|Vetad))`, 'g');

export function parsearDispositivos(paragrafosBrutos: string[]): ResultadoParser {
  const paragrafos = paragrafosBrutos
    .map(p => p.replace(/^(Arts?\.?\s*\d+)\s+(\d+)(?=\s*[.º°\-–—:(])/, '$1$2')) // "Art. 5 7.": o número veio partido em dois <span>
    .flatMap(p => p.split(RE_REVOGADO_COLADO));
  const dispositivos: DispositivoParseado[] = [];
  const preambulo: string[] = [];
  const anomalias: string[] = [];
  const vistos = new Set<string>();
  let caminho: PassoCaminho[] = [];
  let atual: DispositivoParseado | undefined;
  let escopo = 'corpo';
  let anexos = 0;
  let temArtigo = false;
  let ultimoNumeroArtigo = 0;
  const estrutura: Record<string, string> = {};
  let tituloPendente: string | undefined;
  let profundidadeAspas = 0;
  const saldoDeAspas = (l: string) => (l.match(/“/g)?.length ?? 0) - (l.match(/”/g)?.length ?? 0);
  // Aspas retas ("Art. 38. ……" até "…lei." (NR)), como na Lei 11.419: abre na linha que começa com aspas e fecha na que tem
  // número ímpar delas ou o "(NR)". Sem par de aspas confiável, a citação nunca passa de LIMITE_ASPAS_RETAS linhas.
  const LIMITE_ASPAS_RETAS = 40;
  let linhasEmAspasRetas = 0;
  const impar = (l: string) => (l.match(/"/g)?.length ?? 0) % 2 === 1;
  /**
   * Rótulo repetido no mesmo escopo: se a ocorrência anterior está vazia ou revogada (sobra de tachado como "c) ;", ou
   * "Art. 31. (Revogado…)" seguido de "Art. 31. … (Restabelecido…)"), a nova a substitui; senão fica a repetição, como anomalia.
   */
  const registrar = (d: DispositivoParseado) => {
    const chave = `${d.escopo}|${d.rotulo}`;
    if (vistos.has(chave)) {
      let i = dispositivos.length - 1;
      while (i >= 0 && !(dispositivos[i].escopo === d.escopo && dispositivos[i].rotulo === d.rotulo)) i--;
      if (i >= 0 && (dispositivos[i].revogado || dispositivos[i].texto === '')) dispositivos.splice(i, 1);
      else anomalias.push(`rótulo repetido: ${d.escopo} ${d.rotulo}`);
    }
    vistos.add(chave);
    dispositivos.push(d);
  };

  for (const linha of paragrafos) {
    if (profundidadeAspas > 0 && atual) {
      atual.continuacao.push(linha);
      profundidadeAspas = Math.max(0, profundidadeAspas + saldoDeAspas(linha));
      continue;
    }
    if (linhasEmAspasRetas > 0 && atual) {
      atual.continuacao.push(linha);
      linhasEmAspasRetas = impar(linha) || /\(NR\)/.test(linha) ? 0 : linhasEmAspasRetas + 1;
      if (linhasEmAspasRetas > LIMITE_ASPAS_RETAS) {
        anomalias.push(`aspas retas sem fechamento depois de: ${atual.rotulo}`);
        linhasEmAspasRetas = 0;
      }
      continue;
    }
    if (atual && /^"/.test(linha) && impar(linha) && !/\(NR\)/.test(linha)) {
      atual.continuacao.push(linha);
      linhasEmAspasRetas = 1;
      continue;
    }
    // Promulgação das partes vetadas, publicada depois da assinatura (Lei 8.112): o texto já está no corpo, com a anotação
    // "(Promulgação partes vetadas)"; lido de novo, repetiria os artigos com a redação de 1991
    if (dispositivos.length > 0 && /^Partes vetadas pelo Presidente da Rep[úu]blica e mantidas pelo Congresso/i.test(linha)) break;
    // Redação de medida provisória rejeitada ou com a vigência encerrada não vale: a redação que vale vem em outra linha
    if (/\((?:Rejeitada|Vig[êe]ncia encerrada)\)\s*$/i.test(linha) && marcaDaLinha(linha, temArtigo)) continue;
    if (dispositivos.length > 0 && /^ATO DAS DISPOSI[ÇC][ÕO]ES CONSTITUCIONAIS TRANSIT[ÓO]RIAS/i.test(linha)) {
      escopo = 'ADCT';
      caminho = [];
      atual = undefined;
      ultimoNumeroArtigo = 0;
      continue;
    }
    if (/^ANEXO\b/i.test(linha) && dispositivos.length > 0 && linha.length < 120) {
      anexos += 1;
      escopo = `anexo-${anexos}`;
      caminho = [];
      atual = undefined;
      ultimoNumeroArtigo = 0;
      continue;
    }

    profundidadeAspas = Math.max(0, profundidadeAspas + saldoDeAspas(linha));

    // Cabeçalho (livro, título, capítulo, seção) e o título que vem na linha seguinte
    const cab = linha.match(RE_CABECALHO);
    if (cab && linha.length < 120 && !RE_ARTIGO.test(linha)) {
      const nivel = cab[1].toUpperCase().replace('Í', 'I').replace('Ç', 'C').replace('Ã', 'A');
      estrutura[nivel] = linha;
      for (const sub of Object.keys(estrutura)) if (ORDEM_CABECALHO.indexOf(sub) > ORDEM_CABECALHO.indexOf(nivel)) delete estrutura[sub];
      tituloPendente = nivel;
      continue;
    }

    const faixa = linha.match(RE_ARTIGOS);
    if (faixa) {
      tituloPendente = undefined;
      const de = Number(faixa[1].replace(/\./g, ''));
      const ate = Number(faixa[3].replace(/\./g, ''));
      const numeros = faixa[2] === 'a' || faixa[2] === 'ao' ? Array.from({ length: Math.max(0, Math.min(ate - de + 1, 300)) }, (_, i) => de + i) : [de, ate];
      const { texto, anotacoes } = separarAnotacoes(faixa[4]);
      for (const n of numeros) {
        const numero = n <= 9 ? `${n}º` : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        caminho = [{ tipo: 'artigo', numero }];
        const d: DispositivoParseado = {
          escopo,
          caminho: caminho.map(x => ({ ...x })),
          rotulo: rotuloDe(caminho),
          tipo: 'artigo',
          numero,
          texto,
          anotacoes: anotacoes.map(a => ({ ...a })),
          revogado: texto === '' && anotacoes.some(a => a.tipo === 'revogado'),
          continuacao: [],
          estrutura: Object.values(estrutura)
        };
        registrar(d);
        atual = d;
      }
      temArtigo = true;
      ultimoNumeroArtigo = numeros[numeros.length - 1] ?? ultimoNumeroArtigo;
      continue;
    }

    const marca = marcaDaLinha(linha, temArtigo);
    if (marca) {
      tituloPendente = undefined;
      if (marca.tipo === 'artigo') {
        const n = Number(marca.numero.replace(/[º-].*$/, '').replace(/\./g, ''));
        if (n === 1 && ultimoNumeroArtigo > 1 && escopo === 'corpo') {
          // Código aprovado por decreto (CLT: "Art. 1º Fica aprovada a Consolidação…", "Art. 2º O presente decreto-lei entrará em vigor…"):
          // os poucos artigos antes do recomeço são do decreto, não do código; vão para o escopo "decreto" e o código fica com o corpo
          const doDecreto = dispositivos.filter(d => d.escopo === 'corpo');
          if (doDecreto.filter(d => d.tipo === 'artigo').length <= 5) {
            for (const d of doDecreto) {
              vistos.delete(`corpo|${d.rotulo}`);
              d.escopo = 'decreto';
              vistos.add(`decreto|${d.rotulo}`);
            }
          } else anomalias.push(`numeração reiniciou em "${linha.slice(0, 60)}"`);
        }
        ultimoNumeroArtigo = n;
        temArtigo = true;
        caminho = [{ tipo: 'artigo', numero: marca.numero }];
      } else {
        const nivel = NIVEL[marca.tipo];
        while (caminho.length > 0 && NIVEL[caminho[caminho.length - 1].tipo] >= nivel) caminho.pop();
        if (caminho.length === 0) {
          anomalias.push(`dispositivo sem artigo: "${linha.slice(0, 60)}"`);
          atual?.continuacao.push(linha);
          continue;
        }
        caminho.push({ tipo: marca.tipo, numero: marca.numero });
      }
      const { texto, anotacoes } = separarAnotacoes(marca.resto);
      const d: DispositivoParseado = {
        escopo,
        caminho: caminho.map(p => ({ ...p })),
        rotulo: rotuloDe(caminho),
        tipo: marca.tipo,
        numero: marca.numero,
        texto,
        anotacoes,
        revogado: texto === '' && anotacoes.some(a => a.tipo === 'revogado'),
        continuacao: [],
        ...(marca.tipo === 'artigo' ? { estrutura: Object.values(estrutura) } : {})
      };
      registrar(d);
      atual = d;
      continue;
    }

    // Título do agrupamento: a linha que vem logo depois do cabeçalho
    if (tituloPendente && linha.length < 200 && !RE_ANOTACAO.test(linha)) {
      estrutura[tituloPendente] = `${estrutura[tituloPendente]} — ${linha}`;
      tituloPendente = undefined;
      continue;
    }
    tituloPendente = undefined;

    if (!atual) {
      preambulo.push(linha);
      continue;
    }
    // Anotação solta na linha seguinte: pertence ao dispositivo anterior
    const solto = separarAnotacoes(linha);
    if (RE_ANOTACAO.test(linha) && solto.texto === '') {
      atual.anotacoes.push(...solto.anotacoes);
      if (atual.texto === '' && solto.anotacoes.some(a => a.tipo === 'revogado')) atual.revogado = true;
      continue;
    }
    atual.continuacao.push(linha);
    if (linha.length < 60 && /^(Art|§|[IVX]+\s*-)/.test(linha)) anomalias.push(`linha parecida com dispositivo, mas fora da LC 95: "${linha}"`);
  }
  return { dispositivos, preambulo, anomalias };
}
