/**
 * Corpus do STJ no repositório (F4-01): lê `corpus/stj/` (bytes originais em gzip + manifesto) e entrega os precedentes tipados, com o
 * adaptador para o `Precedente` do núcleo. Os arquivos só mudam por `pnpm coletar:stj`.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { join } from 'node:path';
import { PrecedenteSchema, type Precedente } from '@ratione/core';
import type { ManifestoStj } from './coletar';
import { lerPrecedentes, type PrecedenteStj } from './precedentes';

const PASTA = join(__dirname, '..', '..', 'corpus', 'stj');

export function manifestoStj(): ManifestoStj {
  return JSON.parse(readFileSync(join(PASTA, 'manifesto.json'), 'utf-8'));
}

/** Lê os dois arquivos do disco, confere o SHA-256 contra o manifesto e devolve os precedentes. */
export function carregarPrecedentesStj(): PrecedenteStj[] {
  const m = manifestoStj();
  const texto = (nome: string) => {
    const a = m.arquivos.find(x => x.nome === nome);
    if (!a) throw new Error(`manifesto sem ${nome}`);
    const bytes = gunzipSync(readFileSync(join(PASTA, a.arquivo)));
    const sha = createHash('sha256').update(bytes).digest('hex');
    if (sha !== a.sha256) throw new Error(`${nome}: SHA-256 não confere com o manifesto (arquivo alterado à mão?)`);
    return bytes.toString('utf-8');
  };
  return lerPrecedentes(texto('Temas.csv'), texto('Processos.csv'));
}

/** Página oficial do STJ para o Tema Repetitivo (consulta por número). */
export function linkOficialDoTema(numero: number): string {
  return `https://processo.stj.jus.br/repetitivos/temas_repetitivos/pesquisa.jsp?novaConsulta=true&tipo_pesquisa=T&cod_tema_inicial=${numero}&cod_tema_final=${numero}`;
}

/**
 * Tema repetitivo ou IAC com tese firmada, não cancelado, vira `Precedente` do núcleo. Os demais (controvérsia, SIRDR, PUIL, tema afetado ainda sem
 * tese ou cancelado) devolvem `null`: não são precedente qualificado formado, ou não têm tipo correspondente no núcleo.
 */
export function paraPrecedenteDoNucleo(p: PrecedenteStj, m: ManifestoStj = manifestoStj()): Precedente | null {
  if (!p.tese || p.cancelado || (p.tipo !== 'Tema' && p.tipo !== 'IAC')) return null;
  const rotulo = p.tipo === 'Tema' ? `Tema ${p.numero}` : `IAC ${p.numero}`;
  return PrecedenteSchema.parse({
    id: p.id,
    tribunal: 'STJ',
    tipo: p.tipo === 'Tema' ? 'stj_repetitivo' : 'iac',
    numeroOuTema: rotulo,
    enunciadoTese: p.tese,
    dispositivosRelacionados: [],
    dataPublicacaoAcordao: p.dataPublicacaoAcordao ?? undefined,
    linkOficial: p.tipo === 'Tema' ? linkOficialDoTema(p.numero) : undefined,
    procedencia: {
      origem: 'curado',
      fontes: [
        {
          id: 'stj-dados-abertos-precedentes-qualificados',
          ato: `Dados Abertos do STJ, conjunto "${m.titulo}" (${m.licenca})`,
          url: m.paginaUrl,
          lido: `Temas.csv (modificado em ${m.arquivos.find(a => a.nome === 'Temas.csv')?.modificadoEm ?? 'data não informada'}) e Processos.csv; importação mecânica do arquivo oficial`,
          lidoEm: m.lidoEm
        }
      ]
    }
  });
}
