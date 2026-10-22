/**
 * Pseudonimização do Argumenta (decisão do responsável, 22/10/2026: sempre ligada). Roda no navegador, antes do envio: o texto que sai da
 * máquina do usuário leva marcadores (`[PARTE_1]`, `[CPF_1]`…) no lugar dos dados pessoais, e a tabela de troca fica só na tela, que
 * devolve os dados reais na exibição. O servidor roda a mesma detecção e recusa texto em que ainda reste algo a trocar.
 *
 * A detecção é por padrões e rótulos ("Autor:", "em face de"): pega identificadores formatados e nomes rotulados, não todo nome que
 * aparece no texto. Por isso a tela mostra o que será enviado e aceita outros nomes a ocultar.
 */

export type TipoDado = 'PARTE' | 'ADVOGADO' | 'CPF' | 'CNPJ' | 'RG' | 'OAB' | 'PROCESSO' | 'EMAIL' | 'TELEFONE' | 'CEP' | 'ENDERECO';

export interface Substituicao {
  marcador: string;
  original: string;
  tipo: TipoDado;
}

export interface Pseudonimizado {
  texto: string;
  substituicoes: Substituicao[];
}

/** Identificadores formatados: o trecho inteiro do padrão (ou o grupo 1, quando há rótulo antes) vira marcador. */
const IDENTIFICADORES: Array<{ tipo: TipoDado; padrao: RegExp }> = [
  { tipo: 'EMAIL', padrao: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g },
  { tipo: 'PROCESSO', padrao: /\b\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}\b/g },
  { tipo: 'CNPJ', padrao: /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g },
  { tipo: 'CNPJ', padrao: /\bCNPJ\b[^\d\n]{0,12}(\d{14})\b/gi },
  { tipo: 'CPF', padrao: /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g },
  { tipo: 'CPF', padrao: /\bCPF\b[^\d\n]{0,12}(\d{11})\b/gi },
  { tipo: 'OAB', padrao: /\bOAB\s*\/?\s*[A-Z]{2}\s*(?:n[º°o.]\s*)?:?\s*\d[\d.]{2,8}(?:-?[A-Z])?\b/g },
  { tipo: 'RG', padrao: /\b(?:RG|R\.G\.|identidade)\s*(?:n[º°o.]\s*)?:?\s*(\d[\d.-]{4,14}[\dXx])/gi },
  { tipo: 'TELEFONE', padrao: /(?:\(\d{2}\)\s?\d{4,5}-\d{4}|\b\d{2}\s\d{4,5}-\d{4}|\b9\d{4}-\d{4})\b/g },
  { tipo: 'CEP', padrao: /\b\d{5}-\d{3}\b/g },
  { tipo: 'CEP', padrao: /\bCEP\s*:?\s*(\d{8})\b/gi },
  {
    tipo: 'ENDERECO',
    padrao: /\b(?:Rua|Avenida|Av\.|Travessa|Alameda|Praça|Rodovia|Estrada|Largo|Conjunto|Loteamento)\s+[^,\n;]{2,60},\s*(?:n[º°o.]?\s*)?\d{1,5}[A-Za-z]?\b/g
  }
];

const RAZAO_SOCIAL = String.raw`(?:S\.\s?A\.|S\/A|LTDA\.?|Ltda\.?|[^,;.\n])`;

/** Rótulos de parte no cabeçalho ("APELANTE: Fulano") e de advogado. O nome vai até o fim da linha e é limpo em `limparNome`. */
const ROTULO_PARTE =
  /(?:^|\n)[ \t]*(Autora?|Autores|Ré|Réu|Réus|Requerentes?|Requerid[oa]s?|Apelantes?|Apelad[oa]s?|Agravantes?|Agravad[oa]s?|Impetrantes?|Impetrad[oa]s?|Reclamantes?|Reclamad[oa]s?|Exequentes?|Executad[oa]s?|Embargantes?|Embargad[oa]s?|Recorrentes?|Recorrid[oa]s?|Pacientes?|Querelantes?|Querelad[oa]s?|Denunciad[oa]s?|Acusad[oa]s?|Interessad[oa]s?|Litisconsortes?|Advogad[oa]s?(?:\s*\([sa]\))?)[ \t]*:[ \t]*([^\n]+)/gi;

/** "ação ajuizada por Fulano em face de Banco X S.A." (o segundo nome vai até a vírgula ou o ponto, passando por "S.A."). */
const NARRATIVA = new RegExp(
  String.raw`\b(?:ajuizad[oa]|propost[oa]|movid[oa]|interpost[oa]|impetrad[oa]|oferecid[oa])\s+por\s+([A-ZÁÉÍÓÚÂÊÔÃÕÇ]${RAZAO_SOCIAL}{2,80}?)\s+(?:em\s+face\s+d[eoa]s?|contra)\s+([A-ZÁÉÍÓÚÂÊÔÃÕÇ]${RAZAO_SOCIAL}{2,80})(?=[,;.\n]|$)`,
  'g'
);

/** Pessoas jurídicas de direito público e órgãos não são dado pessoal: ficam no texto (e ajudam a análise). */
const ENTE_PUBLICO =
  /^(?:o\s+|a\s+)?(?:Minist[ée]rio\s+P[úu]blico|Defensoria|Uni[ãa]o|Estado\s+d|Distrito\s+Federal|Munic[íi]pio\s+d|Fazenda|INSS|Instituto\s+Nacional\s+do\s+Seguro\s+Social|Justi[çc]a\s+P[úu]blica|Procuradoria|Advocacia-Geral)/i;

/** Corta a qualificação que costuma vir depois do nome ("Fulano, brasileiro, CPF…", "Fulano (OAB/SP…)", "Fulano e outros"). */
function limparNome(bruto: string): string {
  const corte = bruto.search(/\s*(?:[;(]|,\s*(?:brasileir|qualificad|inscrit|portador|residente|domiciliad|representad|pessoa|CPF|CNPJ|RG)|\s+e\s+outr[oa]s?\b|\s+-\s+|\s+–\s+|\s+(?:alegando|objetivando|visando|na qual|no qual|em que|pleiteando|requerendo|buscando|por meio)\b)/i);
  // O ponto final sai, salvo o de abreviatura de uma letra ("S.A.")
  return (corte >= 0 ? bruto.slice(0, corte) : bruto)
    .replace(/[\s,:]+$/, '')
    .replace(/(?<!(?:^|[^\p{L}])\p{Lu})\.$/u, '')
    .trim();
}

/** Nome aceitável: tem letra, tamanho razoável e não é (nem contém) um marcador já aplicado. */
function nomeValido(nome: string): boolean {
  return nome.length >= 3 && nome.length <= 120 && /\p{L}{2}/u.test(nome) && !/[[\]]/.test(nome) && !ENTE_PUBLICO.test(nome);
}

const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const chave = (s: string) => s.toLocaleLowerCase('pt-BR').replace(/\s+/g, ' ');

/** Tudo o que deve ser trocado no texto, na ordem em que foi achado (sem repetição). */
function encontrar(texto: string, nomesExtras: readonly string[]): Array<{ tipo: TipoDado; original: string }> {
  const achados: Array<{ tipo: TipoDado; original: string }> = [];
  const vistos = new Set<string>();
  const anotar = (tipo: TipoDado, original: string) => {
    const k = chave(original);
    if (!vistos.has(k)) {
      vistos.add(k);
      achados.push({ tipo, original });
    }
  };

  for (const m of texto.matchAll(ROTULO_PARTE)) {
    const nome = limparNome(m[2]);
    // "Autor: Fulano e Beltrano" vira dois nomes
    for (const parte of nome.split(/\s+e\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ])/)) {
      if (nomeValido(parte.trim())) anotar(/^advogad/i.test(m[1]) ? 'ADVOGADO' : 'PARTE', parte.trim());
    }
  }
  for (const m of texto.matchAll(NARRATIVA)) {
    for (const nome of [m[1], m[2]].map(limparNome)) if (nomeValido(nome)) anotar('PARTE', nome);
  }
  // O que o usuário pediu para ocultar é ocultado, mesmo que seja ente público
  for (const nome of nomesExtras.map(n => n.trim())) if (nome.length >= 3 && nome.length <= 120 && !/[[\]]/.test(nome)) anotar('PARTE', nome);
  for (const { tipo, padrao } of IDENTIFICADORES) {
    for (const m of texto.matchAll(padrao)) if (!/[[\]]/.test(m[1] ?? m[0])) anotar(tipo, m[1] ?? m[0]);
  }
  return achados;
}

/**
 * Troca os dados pessoais por marcadores numerados por tipo. A mesma pessoa ou o mesmo número recebe sempre o mesmo marcador, e cada
 * ocorrência no texto é trocada (nomes sem diferença de maiúsculas). Rodar de novo sobre o resultado não troca mais nada.
 */
export function pseudonimizar(texto: string, nomesExtras: readonly string[] = []): Pseudonimizado {
  const achados = encontrar(texto, nomesExtras);
  if (!achados.length) return { texto, substituicoes: [] };

  const contagem = new Map<TipoDado, number>();
  const substituicoes = achados.map(({ tipo, original }) => {
    const n = (contagem.get(tipo) ?? 0) + 1;
    contagem.set(tipo, n);
    return { marcador: `[${tipo}_${n}]`, original, tipo };
  });
  const porChave = new Map(substituicoes.map(s => [chave(s.original), s.marcador]));
  // O mais longo primeiro: "Banco X S.A." antes de "Banco X"
  const alternativas = [...substituicoes]
    .sort((a, b) => b.original.length - a.original.length)
    .map(s => {
      const corpo = escapar(s.original).replace(/\s+/g, '\\s+');
      // Borda de palavra só onde o próprio dado começa ou termina em letra ou número
      return `${/^[\p{L}\d]/u.test(s.original) ? '(?<![\\p{L}\\d])' : ''}${corpo}${/[\p{L}\d]$/u.test(s.original) ? '(?![\\p{L}\\d])' : ''}`;
    });
  const tudo = new RegExp(alternativas.join('|'), 'giu');
  return { texto: texto.replace(tudo, m => porChave.get(chave(m)) ?? m), substituicoes };
}

/** Devolve os dados reais no lugar dos marcadores (só na tela do usuário). Marcador desconhecido fica como está. */
export function restaurar(texto: string, substituicoes: readonly Substituicao[]): string {
  if (!substituicoes.length) return texto;
  const mapa = new Map(substituicoes.map(s => [s.marcador, s.original]));
  return texto.replace(/\[[A-Z]+_\d+\]/g, m => mapa.get(m) ?? m);
}

/** Verdadeiro se a detecção ainda acha algo a trocar: o servidor recusa esse texto. */
export function temDadoPessoal(texto: string): boolean {
  return encontrar(texto, []).length > 0;
}
