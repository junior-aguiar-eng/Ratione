/**
 * Carga do corpus no banco (F3-05): normas, dispositivos, versões e relações a partir do parser, das versões (F3-03) e das
 * datas do Senado. Gera linhas puras; `inserirNorma` grava com uma consulta por tabela (JSON → recordset), sem montar SQL com texto.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { join } from 'node:path';
import { detectarCharset, type EntradaManifesto } from '../coleta/coletar';
import { paragrafosDoHtml, parsearDispositivos, type DispositivoParseado } from '../parser';
import { versoesDaNorma, type DatasDaNorma, type VersaoNormativa } from '../versoes';
import { extrairRemissoes } from './referencias';
import { acrescentarVersoesAnteriores } from '../historico/anteriores';
import type { CasoHistorico } from '../historico/historico';

export interface LinhaNorma {
  id: string;
  nome: string;
  assinatura: string | null;
  publicacao: string | null;
  fonte_url: string;
  fonte_tipo_pagina: string;
  fonte_sha256: string;
  lido_em: string;
}

export interface LinhaDispositivo {
  id: string;
  norma_id: string;
  escopo: string;
  rotulo: string;
  tipo: string;
  numero: string;
  pai_id: string | null;
  ordem: number;
  texto: string;
  continuacao: string;
  revogado: boolean;
  anotacoes: unknown;
  estrutura: string[];
}

export interface LinhaVersao {
  dispositivo_id: string;
  texto: string;
  origem: string;
  ato_chave: string | null;
  ato_rotulo: string | null;
  ato_assinatura: string | null;
  ato_publicacao: string | null;
  ano_do_ato: number | null;
  fonte_da_data: string | null;
  vigente_de: string | null;
  /** Fim da redação (a véspera da publicação do ato seguinte); nulo na redação vigente. */
  vigente_ate: string | null;
  vigencia_confirmada: boolean;
  texto_anterior_disponivel: boolean;
  conhecido_em: string;
  hash: string;
  /** `compilado`: texto vigente da página compilada; `tachado_planalto`: redação anterior lida do texto tachado da página anotada. */
  fonte_do_texto: 'compilado' | 'tachado_planalto';
  /** Quem conferiu a redação anterior no Diário Oficial (revisor jurídico) e quando; nulos enquanto não conferida. */
  conferida_por: string | null;
  conferida_em: string | null;
}

export interface LinhaRelacao {
  origem_id: string;
  tipo: string;
  destino_id: string | null;
  destino_norma_id: string | null;
  destino_rotulo: string | null;
  destino_ato: string | null;
  destino_texto: string | null;
  trecho: string | null;
  escopo: string | null;
  origem_dado: string;
}

export interface LinhasDaNorma {
  norma: LinhaNorma;
  dispositivos: LinhaDispositivo[];
  versoes: LinhaVersao[];
  relacoes: LinhaRelacao[];
}

const sha = (t: string) => createHash('sha256').update(t, 'utf8').digest('hex');

/** Id do dispositivo: `NORMA|escopo|rótulo`, com `#n` a partir da segunda ocorrência do mesmo rótulo (o parser registra a repetição como anomalia). */
function idsDosDispositivos(normaId: string, ds: DispositivoParseado[]): string[] {
  const vistos = new Map<string, number>();
  return ds.map(d => {
    const base = `${normaId}|${d.escopo}|${d.rotulo}`;
    const n = (vistos.get(base) ?? 0) + 1;
    vistos.set(base, n);
    return n === 1 ? base : `${base}#${n}`;
  });
}

export function montarLinhas(m: EntradaManifesto, html: string, datas: DatasDaNorma, lidoEm: string): LinhasDaNorma {
  const normaId = m.id;
  const parse = parsearDispositivos(paragrafosDoHtml(html));
  const ds = parse.dispositivos;
  const ids = idsDosDispositivos(normaId, ds);
  const versoes: VersaoNormativa[] = versoesDaNorma(normaId, ds, datas);

  // Pai: o ancestral imediato do caminho, no mesmo escopo e com o mesmo prefixo de rótulo
  const idPorRotulo = new Map<string, string>();
  ds.forEach((d, i) => {
    const chave = `${d.escopo}|${d.rotulo}`;
    if (!idPorRotulo.has(chave)) idPorRotulo.set(chave, ids[i]);
  });
  const paiDe = (d: DispositivoParseado): string | null => {
    if (d.caminho.length < 2) return null;
    const rotuloPai = d.rotulo.split(', ').slice(0, -1).join(', ');
    return idPorRotulo.get(`${d.escopo}|${rotuloPai}`) ?? null;
  };

  const dispositivos: LinhaDispositivo[] = ds.map((d, i) => ({
    id: ids[i],
    norma_id: normaId,
    escopo: d.escopo,
    rotulo: d.rotulo,
    tipo: d.tipo,
    numero: d.numero,
    pai_id: paiDe(d),
    ordem: i,
    texto: d.texto,
    continuacao: d.continuacao.join('\n'),
    revogado: d.revogado,
    anotacoes: d.anotacoes,
    estrutura: d.estrutura ?? []
  }));

  const linhasVersao: LinhaVersao[] = versoes.map((v, i) => ({
    dispositivo_id: ids[i],
    texto: v.texto,
    origem: v.origem,
    ato_chave: v.ato?.chave ?? null,
    ato_rotulo: v.ato?.rotulo ?? null,
    ato_assinatura: v.ato?.assinatura ?? null,
    ato_publicacao: v.ato?.publicacao ?? null,
    ano_do_ato: v.anoDoAto,
    fonte_da_data: v.ato?.fonteDaData ?? (v.origem === 'redacao_original' && v.vigenteDe ? 'norma' : null),
    vigente_de: v.vigenteDe,
    vigente_ate: null,
    vigencia_confirmada: false,
    texto_anterior_disponivel: false,
    conhecido_em: lidoEm,
    hash: sha(v.texto),
    fonte_do_texto: 'compilado' as const,
    conferida_por: null,
    conferida_em: null
  }));

  const relacoes: LinhaRelacao[] = [];
  // Alterações: o ato que deu a redação atual (anotação do Planalto)
  versoes.forEach((v, i) => {
    if (!v.ato || v.origem === 'redacao_original' || v.origem === 'vetado') return;
    relacoes.push({
      origem_id: ids[i],
      tipo: v.origem === 'redacao_dada' ? 'alterado_por' : v.origem === 'incluido' ? 'incluido_por' : 'revogado_por',
      destino_id: null,
      destino_norma_id: null,
      destino_rotulo: null,
      destino_ato: v.ato.chave,
      destino_texto: v.ato.rotulo,
      trecho: v.anotacoes.find(a => a.tipo === 'redacao_dada' || a.tipo === 'incluido' || a.tipo === 'revogado')?.texto ?? null,
      escopo: null,
      origem_dado: 'anotacao_do_planalto'
    });
  });
  // Remissões expressas no texto (artigo citado), resolvidas para o dispositivo de destino quando a norma está no corpus
  ds.forEach((d, i) => {
    for (const r of extrairRemissoes(d.texto)) {
      const alvoNorma = r.escopo === 'mesma' || r.escopo === 'presumido' ? normaId : r.normaDestinoId;
      relacoes.push({
        origem_id: ids[i],
        tipo: 'remete',
        destino_id: null,
        destino_norma_id: alvoNorma,
        destino_rotulo: `art. ${r.artigo}`,
        destino_ato: null,
        destino_texto: `art. ${r.artigo}${r.detalhe ? `, ${r.detalhe}` : ''}${r.normaDestinoTexto ? ` da ${r.normaDestinoTexto}` : ''}`,
        trecho: r.trecho,
        escopo: r.escopo,
        origem_dado: 'extraido_do_texto'
      });
    }
  });

  return {
    norma: {
      id: normaId,
      nome: m.nome,
      assinatura: datas.norma.assinatura,
      publicacao: datas.norma.publicacao,
      fonte_url: m.url,
      fonte_tipo_pagina: m.tipoPagina,
      fonte_sha256: m.sha256,
      lido_em: m.lidoEm
    },
    dispositivos,
    versoes: linhasVersao,
    relacoes
  };
}

/**
 * Lê o corpus gravado em `corpus/` e monta as linhas das normas pedidas (todas, se nenhuma for indicada).
 * Com `comHistorico`, acrescenta as redações anteriores dos casos do F3-07 (`historico-conhecido.json`) como segunda versão do dispositivo.
 * Sem ele (o padrão), é só o corpus lido do Planalto: a geração dos próprios casos parte daí.
 */
export function linhasDoCorpus(pasta: string, ids?: string[], opcoes: { comHistorico?: boolean } = {}): LinhasDaNorma[] {
  const manifesto: EntradaManifesto[] = JSON.parse(readFileSync(join(pasta, 'planalto', 'manifesto.json'), 'utf-8'));
  const datas: { normas: Record<string, DatasDaNorma> } = JSON.parse(readFileSync(join(pasta, 'atos-senado.json'), 'utf-8'));
  const casos: CasoHistorico[] = opcoes.comHistorico ? JSON.parse(readFileSync(join(pasta, 'historico-conhecido.json'), 'utf-8')) : [];
  return manifesto
    .filter(m => !ids || ids.includes(m.id))
    .map(m => {
      const html = detectarCharset(gunzipSync(readFileSync(join(pasta, 'planalto', m.arquivo))), null).texto;
      const linhas = montarLinhas(m, html, datas.normas[m.id], m.lidoEm);
      return opcoes.comHistorico ? acrescentarVersoesAnteriores(linhas, casos, datas.normas[m.id]) : linhas;
    });
}

/** Quem executa SQL: o PGlite dos testes ou o cliente do Supabase em produção. */
export interface ExecutorSql {
  query(sql: string, params?: unknown[]): Promise<unknown>;
}

const COLUNAS = {
  normas: 'id text, nome text, assinatura date, publicacao date, fonte_url text, fonte_tipo_pagina text, fonte_sha256 text, lido_em date',
  dispositivos:
    'id text, norma_id text, escopo text, rotulo text, tipo text, numero text, pai_id text, ordem integer, texto text, continuacao text, revogado boolean, anotacoes jsonb, estrutura text[]',
  versoes_dispositivo:
    'dispositivo_id text, texto text, origem text, ato_chave text, ato_rotulo text, ato_assinatura date, ato_publicacao date, ano_do_ato integer, fonte_da_data text, vigente_de date, vigente_ate date, vigencia_confirmada boolean, texto_anterior_disponivel boolean, conhecido_em date, hash text, fonte_do_texto text, conferida_por text, conferida_em date',
  relacoes: 'origem_id text, tipo text, destino_id text, destino_norma_id text, destino_rotulo text, destino_ato text, destino_texto text, trecho text, escopo text, origem_dado text'
} as const;

async function gravar(db: ExecutorSql, tabela: keyof typeof COLUNAS, linhas: unknown[], lote = 2000) {
  const colunas = COLUNAS[tabela].split(', ').map(c => c.split(' ')[0]).join(', ');
  for (let i = 0; i < linhas.length; i += lote) {
    // `estrutura` chega como array JSON e vira text[] no SELECT; o resto casa por nome
    const select = colunas
      .split(', ')
      .map(c => (c === 'estrutura' ? "array(select jsonb_array_elements_text(x.estrutura::jsonb))" : `x.${c}`))
      .join(', ');
    const recordset = COLUNAS[tabela].replace('estrutura text[]', 'estrutura jsonb');
    await db.query(`insert into public.${tabela} (${colunas}) select ${select} from jsonb_to_recordset($1::jsonb) as x(${recordset})`, [JSON.stringify(linhas.slice(i, i + lote))]);
  }
}

/**
 * Liga cada remissão ao dispositivo de destino quando a norma e o artigo existem no corpus (rodar depois de carregar as normas).
 * Pega a primeira ocorrência do rótulo no corpo, que é a numeração original quando a página repete um bloco.
 */
export async function resolverDestinos(db: ExecutorSql): Promise<void> {
  await db.query(`
    update public.relacoes r set destino_id = d.id
    from (select distinct on (norma_id, rotulo) id, norma_id, rotulo from public.dispositivos where escopo = 'corpo' order by norma_id, rotulo, ordem) d
    where r.tipo = 'remete' and r.destino_id is null and r.destino_norma_id = d.norma_id and r.destino_rotulo = d.rotulo`);
}

export async function inserirNorma(db: ExecutorSql, l: LinhasDaNorma): Promise<void> {
  await gravar(db, 'normas', [l.norma]);
  await gravar(db, 'dispositivos', l.dispositivos);
  await gravar(db, 'versoes_dispositivo', l.versoes);
  await gravar(db, 'relacoes', l.relacoes);
}
