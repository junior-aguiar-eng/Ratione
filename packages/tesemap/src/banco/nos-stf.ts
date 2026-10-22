/**
 * Nós do grafo a partir dos temas de repercussão geral do STF (F4-02 → F4-03). Critério em `classificarTemaRg`: repercussão reconhecida e não
 * cancelado; com tese firmada vira `precedente`, com mérito pendente vira `tema` (a questão em julgamento, sem tese).
 * O nó é dado oficial importado (`curado`, sem validador): o texto é o do tribunal. As arestas entre precedentes é que exigem validação humana.
 */
import { NoBancoSchema, type NoBanco } from './esquemas';
import type { CitacaoNormativa } from './citacoes';
import { LIMIAR_DE_APLICACAO, classificarTemaRg, type TemaRgStf } from '../stf/repercussao';
import { arquivoDoManifesto, type ManifestoStf } from '../stf/corpus';
import type { SumulaStf } from '../stf/sumulas';
import type { AplicacaoDosTemas } from '../stf/aplicacao';
import type { ProcessoControle } from '../stf/controle';

/** `citados`: números de tema que os precedentes do STJ ligam ao STF; `aplicacao`: contagem de devoluções. Os dois fazem o tema entrar mesmo com a repercussão negada (ver `classificarTemaRg`). */
export function nosDosTemasStf(temas: TemaRgStf[], m: ManifestoStf, citacoes: (texto: string) => CitacaoNormativa[] = () => [], citados: ReadonlySet<number> = new Set(), aplicacao: AplicacaoDosTemas | null = null): NoBanco[] {
  const arquivo = arquivoDoManifesto(m, 'repercussao-geral');
  const fonte = {
    id: 'stf-transparencia-repercussao-geral',
    ato: 'Portal da Transparência do STF, dados abertos: temas de repercussão geral',
    url: m.paginaUrl,
    lido: `${arquivo.descricao}; importação mecânica do arquivo oficial, ${m.obtidoPor}`,
    lidoEm: arquivo.lidoEm
  };
  const nos: NoBanco[] = [];
  for (const t of temas) {
    const muitoAplicado = (aplicacao?.porTema[String(t.numero)]?.total ?? 0) >= LIMIAR_DE_APLICACAO;
    const tipo = classificarTemaRg(t, citados.has(t.numero) || muitoAplicado);
    if (!tipo) continue;
    nos.push(
      NoBancoSchema.parse({
        id: t.id,
        tipo,
        rotulo: `Tema ${t.numero} do STF (repercussão geral)`,
        tribunal: 'STF',
        numero_referencia: `RG Tema ${t.numero}`,
        descricao: t.tese ?? t.titulo,
        dispositivo_id: null,
        detalhes: {
          situacao: t.situacaoRg,
          situacaoJulgamento: t.situacaoJulgamento,
          questao: t.titulo,
          descricaoDoTema: t.descricao,
          processoParadigma: t.processoParadigma,
          relator: t.relator,
          dataJulgamento: t.dataJulgamento,
          dataAutuacao: t.dataAutuacao,
          dataAdmissibilidade: t.dataAdmissibilidade,
          ramosDoDireito: t.ramosDoDireito,
          assunto: t.assunto,
          suspensaoNacional: t.suspensaoNacional,
          linkOficial: t.linkProcesso,
          teseFirmada: !!t.tese,
          citacoes: citacoes(`${t.titulo} ${t.tese ?? ''}`),
          // Devoluções à origem pelo regime da repercussão geral que citam este tema (regra e limites em `stf/aplicacao.ts`); ausente se a contagem não foi gerada
          ...(aplicacao
            ? {
                aplicacao: {
                  total: aplicacao.porTema[String(t.numero)]?.total ?? 0,
                  porAno: aplicacao.porTema[String(t.numero)]?.porAno ?? {},
                  de: aplicacao.periodo.de,
                  ate: aplicacao.periodo.ate,
                  anosPossivelmenteIncompletos: aplicacao.anosPossivelmenteIncompletos
                }
              }
            : {})
        },
        origem_dado: 'curado',
        fontes: [fonte],
        validado_por: null,
        validado_em: null,
        atualizado_em: arquivo.lidoEm
      })
    );
  }
  return nos;
}

/**
 * Nós das súmulas do STF (vinculantes e não vinculantes). O enunciado é o texto oficial; a fonte de cada nó é a página da própria súmula na base de
 * jurisprudência do STF. As ligações vêm da observação que o STF escreve ("Veja Súmula 680", "Tema 6 da repercussão geral") e só valem quando o
 * nó de destino existe no grafo (`existentes`): a tela as mostra como ligações registradas pelo STF, não como relações validadas do mapa.
 */
export function nosDasSumulasStf(sumulas: SumulaStf[], m: ManifestoStf, existentes: ReadonlySet<string>, citacoes: (texto: string) => CitacaoNormativa[] = () => []): NoBanco[] {
  return sumulas
    .filter(s => /^aprovada$/i.test(s.situacao))
    .map(s => {
      const arquivo = arquivoDoManifesto(m, s.vinculante ? 'sumulas-vinculantes' : 'sumulas');
      return NoBancoSchema.parse({
        id: s.id,
        tipo: 'sumula',
        rotulo: s.vinculante ? `Súmula Vinculante ${s.numero} do STF` : `Súmula ${s.numero} do STF`,
        tribunal: 'STF',
        numero_referencia: s.vinculante ? `SV ${s.numero}` : `Súmula ${s.numero}`,
        descricao: s.enunciado,
        dispositivo_id: null,
        detalhes: {
          vinculante: s.vinculante,
          situacao: s.situacao,
          orgaoJulgador: s.orgaoJulgador,
          dataAprovacao: s.dataAprovacao,
          dataJulgamento: s.dataAprovacao,
          fontePublicacao: s.fontePublicacao,
          ramoDoDireito: s.ramoDoDireito,
          observacao: s.observacao,
          linkOficial: s.url,
          sumulasCorrelatas: s.sumulasCitadas.filter(id => existentes.has(id)).map(id => ({ id })),
          temasRg: s.temasCitados.filter(n => existentes.has(`STF-RG-${n}`)).map(numero => ({ numero: String(numero) })),
          citacoes: citacoes(s.enunciado)
        },
        origem_dado: 'curado',
        fontes: [
          {
            id: `stf-jurisprudencia-${s.id.toLowerCase()}`,
            ato: s.titulo,
            url: s.url,
            lido: `${arquivo.descricao}; importação mecânica da exportação oficial, ${m.obtidoPor}${arquivo.consulta ? `; consulta usada: ${arquivo.consulta}` : ''}`,
            lidoEm: arquivo.lidoEm
          }
        ],
        validado_por: null,
        validado_em: null,
        atualizado_em: arquivo.lidoEm
      });
    });
}

const ROTULO_DA_CLASSE: Record<string, string> = { ADI: 'ação direta de inconstitucionalidade', ADC: 'ação declaratória de constitucionalidade', ADO: 'ação direta de inconstitucionalidade por omissão', ADPF: 'arguição de descumprimento de preceito fundamental' };

/**
 * Nós dos processos de controle concentrado com decisão de mérito (F4-02). A descrição é o texto oficial da decisão de mérito escolhida por
 * `decisaoDeMerito`; quando o arquivo do STF não traz o texto ("*NI*", "Sem Descrição"), a descrição diz só o resultado e avisa. O arquivo não traz o
 * objeto da ação: o que se pesquisa é o que a decisão diz, e os atalhos para o NormaViva saem dos artigos que ela cita.
 */
export function nosDoControleConcentrado(processos: ProcessoControle[], m: ManifestoStf, citacoes: (texto: string) => CitacaoNormativa[] = () => []): NoBanco[] {
  if (processos.length === 0) return [];
  const arquivo = arquivoDoManifesto(m, 'controle-concentrado');
  const fonte = {
    id: 'stf-transparencia-controle-concentrado',
    ato: 'Portal da Transparência do STF: decisões no controle concentrado (ADI, ADC, ADO e ADPF)',
    url: m.paginaUrl,
    lido: `${arquivo.descricao}; importação mecânica do arquivo oficial, ${m.obtidoPor}`,
    lidoEm: arquivo.lidoEm
  };
  return processos.map(p =>
    NoBancoSchema.parse({
      id: p.id,
      tipo: 'precedente',
      rotulo: `${p.classe} ${p.numero} do STF`,
      tribunal: 'STF',
      numero_referencia: `${p.classe} ${p.numero}`,
      descricao: p.merito.texto ?? `${p.merito.andamento} (o arquivo do STF não traz o texto desta decisão)`,
      dispositivo_id: null,
      detalhes: {
        classe: p.classe,
        classePorExtenso: ROTULO_DA_CLASSE[p.classe],
        resultado: p.merito.andamento,
        situacao: p.merito.andamento,
        dataJulgamento: p.merito.data,
        orgaoJulgador: p.colegiada ? 'Plenário' : 'Decisão monocrática',
        textoDaDecisaoDisponivel: p.merito.texto !== null,
        decisoesNoArquivo: p.totalDeDecisoes,
        citacoes: citacoes(p.merito.texto ?? '')
      },
      origem_dado: 'curado',
      fontes: [fonte],
      validado_por: null,
      validado_em: null,
      atualizado_em: arquivo.lidoEm
    })
  );
}
