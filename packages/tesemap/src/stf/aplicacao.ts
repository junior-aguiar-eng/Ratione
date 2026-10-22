/**
 * Aplicação dos temas de repercussão geral (F4-02): quantas decisões do STF mandaram devolver processos à origem pelo regime da repercussão geral,
 * por tema e por ano. Fonte: os CSV de decisões do portal da Transparência do STF (uma linha por decisão, 22 colunas), baixados pelo responsável.
 *
 * Regra de contagem (vale o que está escrito aqui, e a tela a repete): uma decisão conta 1 para cada tema DISTINTO que a observação cita
 * ("Tema nº 100 - RE 586068, Tema nº 360 - RE 611503"), quando o andamento é "Determinada a devolução…" (devolução ao tribunal de origem pelo regime
 * da repercussão geral). Não é o total de citações do tema na jurisprudência: cobre só essas devoluções. O ano é o da decisão.
 * O que o arquivo não traz fica de fora: a contagem reflete o que está nos arquivos, e o ano com muito menos decisões que os demais é apontado.
 */
import { createHash } from 'node:crypto';
import { linhasDoCsv } from '../stj/csv';

export interface ArquivoDeDecisoes {
  nomeOriginal: string;
  bytes: number;
  sha256: string;
  decisoes: number;
}

export interface AplicacaoDoTema {
  total: number;
  porAno: Record<string, number>;
}

export interface AplicacaoDosTemas {
  geradoEm: string;
  fonte: string;
  paginaUrl: string;
  regra: string;
  arquivos: ArquivoDeDecisoes[];
  periodo: { de: string; ate: string };
  decisoesLidas: number;
  decisoesPorAno: Record<string, number>;
  /** Anos com bem menos decisões que a mediana dos anos: provável arquivo incompleto. */
  anosPossivelmenteIncompletos: string[];
  devolucoes: number;
  devolucoesComTema: number;
  /** Temas citados que não existem no arquivo de repercussão geral (número fora de 1..maior tema): não contados. */
  citacoesDescartadas: number;
  temasDistintos: number;
  porTema: Record<string, AplicacaoDoTema>;
}

export const REGRA_DE_CONTAGEM =
  'Cada decisão com andamento "Determinada a devolução…" conta 1 para cada tema distinto que a observação cita ("Tema nº N"). Cobre só essas devoluções ao tribunal de origem pelo regime da repercussão geral, não todas as citações do tema; o ano é o da decisão.';

const COLUNAS = ['idFatoDecisao', 'Andamento decisão', 'Observação do andamento', 'Ano da decisão', 'Data da decisão'];

const dataIso = (br: string) => {
  const m = br.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
};

/** Temas distintos citados numa observação ("Tema nº 100", "Temas 5 e 7" não: só o formato "Tema [nº] N" que o STF usa). */
export function temasNaObservacao(obs: string): number[] {
  return [...new Set([...obs.matchAll(/\bTema\s*(?:n[ºo°.]*\s*)?(\d{1,4})\b/gi)].map(m => Number(m[1])))];
}

export function agregarAplicacao(arquivos: Array<{ nomeOriginal: string; bytes: Buffer }>, maiorTema: number, geradoEm: string): AplicacaoDosTemas {
  const arquivosLidos: ArquivoDeDecisoes[] = [];
  const decisoesPorAno: Record<string, number> = {};
  const porTema = new Map<number, AplicacaoDoTema>();
  const vistas = new Set<string>();
  let decisoesLidas = 0;
  let devolucoes = 0;
  let devolucoesComTema = 0;
  let descartadas = 0;
  let de = '9999-99-99';
  let ate = '0000-00-00';

  for (const a of arquivos) {
    let cabecalho: string[] | null = null;
    let indice: Record<string, number> = {};
    let n = 0;
    for (const linha of linhasDoCsv(a.bytes.toString('utf-8'), ',')) {
      if (!cabecalho) {
        cabecalho = linha.map(h => h.trim());
        const faltam = COLUNAS.filter(c => !cabecalho!.includes(c));
        if (faltam.length > 0) throw new Error(`${a.nomeOriginal}: faltam colunas ${faltam.join(', ')} (o STF mudou o layout?)`);
        indice = Object.fromEntries(cabecalho.map((h, i) => [h, i]));
        continue;
      }
      if (linha.length !== cabecalho.length) throw new Error(`${a.nomeOriginal}: linha ${n + 2} tem ${linha.length} campos, o cabeçalho tem ${cabecalho.length}`);
      const id = linha[indice['idFatoDecisao']];
      if (vistas.has(id)) continue; // a mesma decisão em dois arquivos não conta duas vezes
      vistas.add(id);
      n++;
      decisoesLidas++;
      const ano = linha[indice['Ano da decisão']].trim();
      decisoesPorAno[ano] = (decisoesPorAno[ano] ?? 0) + 1;
      const iso = dataIso(linha[indice['Data da decisão']]);
      if (iso) {
        if (iso < de) de = iso;
        if (iso > ate) ate = iso;
      }
      if (!/^Determinada a devolu[çc][ãa]o/i.test(linha[indice['Andamento decisão']].trim())) continue;
      devolucoes++;
      const temas = temasNaObservacao(linha[indice['Observação do andamento']]);
      if (temas.length === 0) continue;
      devolucoesComTema++;
      for (const t of temas) {
        if (t < 1 || t > maiorTema) {
          descartadas++;
          continue;
        }
        const x = porTema.get(t) ?? { total: 0, porAno: {} };
        x.total++;
        x.porAno[ano] = (x.porAno[ano] ?? 0) + 1;
        porTema.set(t, x);
      }
    }
    arquivosLidos.push({ nomeOriginal: a.nomeOriginal, bytes: a.bytes.length, sha256: createHash('sha256').update(a.bytes).digest('hex'), decisoes: n });
  }

  const totais = Object.values(decisoesPorAno).sort((x, y) => x - y);
  const mediana = totais.length > 0 ? totais[Math.floor(totais.length / 2)] : 0;
  return {
    geradoEm,
    fonte: 'Portal da Transparência do STF, dados abertos: decisões',
    paginaUrl: 'https://transparencia.stf.jus.br/extensions/dados_abertos/dados_abertos.html',
    regra: REGRA_DE_CONTAGEM,
    arquivos: arquivosLidos,
    periodo: { de, ate },
    decisoesLidas,
    decisoesPorAno: Object.fromEntries(Object.entries(decisoesPorAno).sort(([x], [y]) => x.localeCompare(y))),
    anosPossivelmenteIncompletos: Object.entries(decisoesPorAno).filter(([, c]) => c < mediana * 0.5).map(([a]) => a).sort(),
    devolucoes,
    devolucoesComTema,
    citacoesDescartadas: descartadas,
    temasDistintos: porTema.size,
    porTema: Object.fromEntries([...porTema.entries()].sort((x, y) => x[0] - y[0]).map(([t, v]) => [String(t), v]))
  };
}
