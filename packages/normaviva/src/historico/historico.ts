/**
 * Normas de teste com histórico conhecido (F3-07): dispositivos cuja redação anterior e atual são conhecidas, para validar a consulta
 * temporal (F3-04) com "em tal data o texto era A; a partir de tal data, B".
 *
 * Fontes (decisão do responsável, 20/10/2026):
 * - redação B (atual): o corpus (`montarLinhas`), que vem do Planalto e só traz a redação vigente;
 * - redação A (anterior): o texto TACHADO da própria página do Planalto, só quando o trecho tachado é o dispositivo inteiro (começa pelo
 *   mesmo rótulo). Tachado de palavras soltas não reconstrói o texto e é ignorado. O tachado vale aqui só como evidência histórica,
 *   nunca como texto vigente (regra do PLANO §1);
 * - data do ato que deu a redação B: a da publicação do ato (API do Senado), PROVISÓRIA (vigência não confirmada).
 * Todo caso nasce `pendente`: só vira `validado` quando o responsável conferir no Diário Oficial.
 */
import { existsSync, readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { join } from 'node:path';
import { detectarCharset, type EntradaManifesto } from '../coleta/coletar';
import { marcaDaLinha, paragrafosComTachado, separarAnotacoes } from '../parser';
import { linhasDoCorpus, type LinhasDaNorma } from '../busca/carga';
import { somarDiasIso } from './datas';

export interface CasoHistorico {
  id: string;
  normaId: string;
  normaNome: string;
  dispositivoId: string;
  rotulo: string;
  antes: {
    texto: string;
    /** Ato que deu a redação A, como o Planalto o anota no próprio texto tachado (ex.: "Redação dada pela Lei nº 9.099, de 1995"); `null` se for a redação original. */
    anotacao: string | null;
  };
  depois: {
    texto: string;
    atoRotulo: string;
    atoChave: string | null;
    /** AAAA-MM-DD. Publicação do ato: início PROVISÓRIO da redação B. */
    vigenteDe: string;
    fonteDaData: string | null;
  };
  vigenciaConfirmada: false;
  /** O que a consulta temporal deve devolver. `antes` e `depois` apontam para os campos acima. */
  consultas: Array<{ em: string; esperado: 'antes' | 'depois' }>;
  fonte: { url: string; tipoPagina: string; lidoEm: string };
  validacao: { status: 'pendente' | 'validado'; por: string | null; em: string | null };
}

const TEXTO_MINIMO = 25;
const POR_NORMA = 6;
const ALVO = 30;
/** Normas lidas pela página anotada complementar: 1 a 2 casos cada, sem teto global (decisão do responsável, 20/10/2026). */
const POR_NORMA_COMPLEMENTAR = 2;
const CHAVE_ATO = /^(Reda[çc][ãa]o dada|Inclu[ií]d|Acrescid)/i;

/** A página do Planalto de onde a redação A (o tachado) é lida. */
interface PaginaDeOrigem {
  caminho: string;
  url: string;
  tipoPagina: string;
  lidoEm: string;
}

function candidatosDaNorma(l: LinhasDaNorma, pagina: PaginaDeOrigem): CasoHistorico[] {
  const html = detectarCharset(gunzipSync(readFileSync(pagina.caminho)), null).texto;
  const versaoPorDispositivo = new Map(l.versoes.map(v => [v.dispositivo_id, v]));
  const porChave = new Map<string, typeof l.dispositivos>();
  for (const d of l.dispositivos) {
    if (d.escopo !== 'corpo') continue;
    const k = `${d.tipo}|${d.numero}|${d.texto}`;
    porChave.set(k, [...(porChave.get(k) ?? []), d]);
  }

  const casos: CasoHistorico[] = [];
  for (const p of paragrafosComTachado(html)) {
    if (p.tachados.length === 0) continue;
    const marca = marcaDaLinha(p.texto, true);
    if (!marca) continue;
    const atual = separarAnotacoes(marca.resto);
    if (atual.texto.length < TEXTO_MINIMO || !atual.anotacoes.some(a => a.tipo === 'redacao_dada') || atual.anotacoes.some(a => a.tipo === 'revogado')) continue;

    // O dispositivo do corpus que tem exatamente este rótulo e este texto; ambíguo ou ausente: ignora
    const achados = porChave.get(`${marca.tipo}|${marca.numero}|${atual.texto}`) ?? [];
    if (achados.length !== 1) continue;
    const d = achados[0];
    // Rótulo repetido no corpus (id com #n): o dispositivo é ambíguo, não serve de caso de teste
    if (d.id.includes('#')) continue;
    const v = versaoPorDispositivo.get(d.id);
    if (!v || v.origem !== 'redacao_dada' || !v.vigente_de || !v.ato_rotulo) continue;

    // O trecho tachado tem de ser o MESMO dispositivo inteiro (mesmo tipo e número, com texto próprio); exatamente um
    const anteriores = p.tachados
      .map(g => ({ g, marcaG: marcaDaLinha(g, true) }))
      .filter(x => x.marcaG && x.marcaG.tipo === marca.tipo && x.marcaG.numero === marca.numero)
      .map(x => ({ x, a: separarAnotacoes(x.marcaG!.resto) }))
      .filter(y => y.a.texto.length >= TEXTO_MINIMO);
    if (anteriores.length !== 1) continue;
    const antes = anteriores[0].a;
    if (antes.texto === atual.texto) continue;

    casos.push({
      id: d.id,
      normaId: l.norma.id,
      normaNome: l.norma.nome,
      dispositivoId: d.id,
      rotulo: d.rotulo,
      antes: { texto: antes.texto, anotacao: antes.anotacoes.find(a => CHAVE_ATO.test(a.texto))?.texto ?? null },
      depois: { texto: d.texto, atoRotulo: v.ato_rotulo, atoChave: v.ato_chave, vigenteDe: v.vigente_de, fonteDaData: v.fonte_da_data },
      vigenciaConfirmada: false,
      consultas: [
        { em: somarDiasIso(v.vigente_de, -1), esperado: 'antes' },
        { em: v.vigente_de, esperado: 'depois' }
      ],
      fonte: { url: pagina.url, tipoPagina: pagina.tipoPagina, lidoEm: pagina.lidoEm },
      validacao: { status: 'pendente', por: null, em: null }
    });
  }
  return casos;
}

/** Até `POR_NORMA` casos de uma norma, de atos diferentes, espalhados pelo texto (do começo ao fim). */
function escolher(casos: CasoHistorico[], limite = POR_NORMA): CasoHistorico[] {
  const escolhidos: CasoHistorico[] = [];
  const passos = Math.min(casos.length, limite * 2);
  for (let k = 0; k < passos && escolhidos.length < limite; k++) {
    // 0, meio, fim, depois os pontos intermediários: uma ordem que cobre o texto todo cedo
    const fracao = [0, 0.5, 1, 0.25, 0.75, 0.125, 0.375, 0.625][k] ?? 0;
    const c = casos[Math.min(casos.length - 1, Math.floor(fracao * casos.length))];
    if (c && !escolhidos.some(e => e.id === c.id || e.depois.atoRotulo === c.depois.atoRotulo)) escolhidos.push(c);
  }
  return escolhidos;
}

/** Uma rodada por norma até `ALVO` casos: nenhuma norma domina o conjunto (a CF sozinha teria 240 candidatos). */
function equilibrar(porNorma: CasoHistorico[][]): CasoHistorico[] {
  const saida: CasoHistorico[] = [];
  for (let rodada = 0; saida.length < ALVO; rodada++) {
    const antes = saida.length;
    for (const lista of porNorma) {
      if (lista[rodada] && saida.length < ALVO) saida.push(lista[rodada]);
    }
    if (saida.length === antes) break;
  }
  return saida.sort((x, y) => x.normaId.localeCompare(y.normaId) || x.id.localeCompare(y.id));
}

export interface ResultadoHistorico {
  casos: CasoHistorico[];
  /** Candidatos por norma (antes da escolha), para ver a cobertura. */
  candidatos: Record<string, number>;
}

export function gerarHistorico(pasta: string, validacoesAnteriores: Record<string, CasoHistorico['validacao']> = {}): ResultadoHistorico {
  const manifesto: EntradaManifesto[] = JSON.parse(readFileSync(join(pasta, 'planalto', 'manifesto.json'), 'utf-8'));
  const arquivoComplementar = join(pasta, 'planalto', 'anotadas', 'manifesto.json');
  const complementares: EntradaManifesto[] = existsSync(arquivoComplementar) ? JSON.parse(readFileSync(arquivoComplementar, 'utf-8')) : [];
  const linhas = linhasDoCorpus(pasta);
  const porNorma: CasoHistorico[][] = [];
  const doComplemento: CasoHistorico[] = [];
  const candidatos: Record<string, number> = {};
  for (const l of linhas) {
    const m = manifesto.find(x => x.id === l.norma.id)!;
    // 1º a página do próprio corpus; só se ela não tiver tachado aproveitável, a página anotada complementar
    let todos = candidatosDaNorma(l, { caminho: join(pasta, 'planalto', m.arquivo), url: l.norma.fonte_url, tipoPagina: l.norma.fonte_tipo_pagina, lidoEm: l.norma.lido_em });
    let complemento = false;
    const c = todos.length === 0 ? complementares.find(x => x.id === l.norma.id) : undefined;
    if (c) {
      todos = candidatosDaNorma(l, { caminho: join(pasta, 'planalto', 'anotadas', c.arquivo), url: c.url, tipoPagina: c.tipoPagina, lidoEm: c.lidoEm });
      complemento = true;
    }
    candidatos[l.norma.id] = todos.length;
    if (todos.length === 0) continue;
    if (complemento) doComplemento.push(...escolher(todos, POR_NORMA_COMPLEMENTAR));
    else porNorma.push(escolher(todos));
  }
  const casos = [...equilibrar(porNorma), ...doComplemento].sort((x, y) => x.normaId.localeCompare(y.normaId) || x.id.localeCompare(y.id));
  for (const c of casos) if (validacoesAnteriores[c.id]) c.validacao = validacoesAnteriores[c.id];
  return { casos, candidatos };
}
