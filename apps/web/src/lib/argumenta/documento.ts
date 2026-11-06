/**
 * F5-09: o documento que a pessoa baixa (Word) ou imprime (PDF) a partir da análise. Aqui só se monta o conteúdo, como dados simples; quem
 * desenha em Word (`baixarDocx.ts`) e em papel (`DocumentoImpresso.tsx`) lê esta mesma estrutura, para os dois formatos dizerem o mesmo.
 * Tudo acontece no navegador: nada é enviado ao servidor. O texto sai com os nomes reais (a tabela de troca é aplicada por `restaurar`,
 * recebido de fora), por isso o documento abre com um aviso de que contém dados da decisão e fica só com a pessoa.
 */
import type { SaidaEstrutura, SaidaFundamentos, SaidaQuestoes } from '../ia/tarefas/argumenta';
import { CATEGORIA, FUNDAMENTO, RESULTADO, TIPO_DECISAO } from './rotulos';
import type { EstadoCitacao, VerificacaoDaCitacao } from './verificarCitacoes';

export interface FundamentoDoDocumento {
  rotulo: string;
  descricao: string;
  citacao: string;
  /** Resultado conferido na base do Ratione; vazio quando a citação não tem formato conhecido. */
  conferencia: string;
}

export interface QuestaoDoDocumento {
  cabecalho: string;
  resultado: string;
  enunciado: string;
  conclusao: string;
  /** `null`: a etapa dos fundamentos não terminou, e o documento não afirma que a questão não tem fundamento. */
  fundamentos: FundamentoDoDocumento[] | null;
}

export interface DocumentoDaAnalise {
  titulo: string;
  geradoEm: string;
  avisos: string[];
  tipo: string;
  resultado: string;
  resumo: string;
  pedidos: string[];
  questoes: QuestaoDoDocumento[];
}

const CONFERENCIA: Record<EstadoCitacao, string> = {
  encontrada: 'Encontrada na base do Ratione',
  nao_localizada: 'Não localizada na base do Ratione (isso não quer dizer que esteja errada)',
  fora_do_corpus: 'Fora da base do Ratione (não foi possível conferir)'
};

export const AVISOS_DO_DOCUMENTO = [
  'Este arquivo contém dados da decisão analisada, inclusive nomes reais. Foi gerado neste navegador e não foi enviado ao Ratione; guardá-lo e compartilhá-lo é responsabilidade de quem o baixou.',
  'Análise gerada por IA só a partir do texto colado, sem consultar leis, jurisprudência ou outras fontes. Pode conter erro: confira os pontos no texto da decisão.'
];

export interface EntradaDoDocumento {
  estrutura: SaidaEstrutura;
  questoes?: SaidaQuestoes;
  fundamentos?: SaidaFundamentos;
  selos: ReadonlyMap<string, VerificacaoDaCitacao>;
  /** Devolve os nomes reais no lugar dos marcadores (`restaurar` com a tabela de troca desta aba). */
  restaurar: (texto: string) => string;
  /** "06/11/2026". */
  geradoEm: string;
}

export function montarDocumento(e: EntradaDoDocumento): DocumentoDaAnalise {
  const r = e.restaurar;
  return {
    titulo: 'Análise da decisão',
    geradoEm: e.geradoEm,
    avisos: AVISOS_DO_DOCUMENTO,
    tipo: TIPO_DECISAO[e.estrutura.tipo],
    resultado: r(e.estrutura.resultado),
    resumo: r(e.estrutura.resumo),
    pedidos: e.estrutura.pedidos.map(p => r(p.descricao)),
    questoes: (e.questoes?.questoes ?? []).map((q, i) => ({
      cabecalho: `Questão ${i + 1} · ${CATEGORIA[q.categoria]}`,
      resultado: RESULTADO[q.resultado].rotulo,
      enunciado: r(q.enunciado),
      conclusao: r(q.conclusao),
      fundamentos: e.fundamentos
        ? e.fundamentos.fundamentos
            .filter(f => f.questao === q.id)
            .map(f => {
              const selo = e.selos.get(f.citacao.trim());
              return { rotulo: FUNDAMENTO[f.tipo].rotulo, descricao: r(f.descricao), citacao: r(f.citacao), conferencia: selo ? CONFERENCIA[selo.estado] : '' };
            })
        : null
    }))
  };
}

/** Nome do arquivo sem dado da decisão (o rótulo que a pessoa digitou pode ter nome de parte): só a data. */
export function nomeDoArquivo(dataIso: string): string {
  return `analise-da-decisao-${dataIso}`;
}
