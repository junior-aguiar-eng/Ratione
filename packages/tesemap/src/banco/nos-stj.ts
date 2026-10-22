/**
 * Nós do grafo a partir dos precedentes qualificados do STJ (F4-01 → F4-03). Só entra o precedente formado: tema repetitivo ou IAC com
 * tese firmada e não cancelado (o mesmo critério de `paraPrecedenteDoNucleo`). Controvérsia, afetado sem tese, cancelado, SIRDR e PUIL
 * ficam de fora do grafo: o corpus é pequeno e declarado, não toda a jurisprudência.
 * O nó é dado oficial importado (`curado`, sem validador); as arestas entre precedentes é que exigem validação humana.
 */
import { NoBancoSchema, type NoBanco } from './esquemas';
import { linkOficialDoTema } from '../stj/corpus';
import type { ManifestoStj } from '../stj/coletar';
import type { PrecedenteStj } from '../stj/precedentes';

export function nosDosPrecedentesStj(precedentes: PrecedenteStj[], m: ManifestoStj): NoBanco[] {
  const fonte = {
    id: 'stj-dados-abertos-precedentes-qualificados',
    ato: `Dados Abertos do STJ, conjunto "${m.titulo}" (${m.licenca})`,
    url: m.paginaUrl,
    lido: `Temas.csv (modificado em ${m.arquivos.find(a => a.nome === 'Temas.csv')?.modificadoEm ?? 'data não informada'}) e Processos.csv; importação mecânica do arquivo oficial`,
    lidoEm: m.lidoEm
  };
  return precedentes
    .filter(p => p.tese && !p.cancelado && (p.tipo === 'Tema' || p.tipo === 'IAC'))
    .map(p =>
      NoBancoSchema.parse({
        id: p.id,
        tipo: 'precedente',
        rotulo: p.tipo === 'Tema' ? `Tema ${p.numero} do STJ` : `IAC ${p.numero} do STJ`,
        tribunal: 'STJ',
        numero_referencia: p.tipo === 'Tema' ? `Tema ${p.numero}` : `IAC ${p.numero}`,
        descricao: p.tese,
        dispositivo_id: null,
        detalhes: {
          tipoStj: p.tipo,
          situacao: p.situacao,
          orgaoJulgador: p.orgaoJulgador,
          dataJulgamento: p.dataJulgamento,
          dataPublicacaoAcordao: p.dataPublicacaoAcordao,
          questao: p.questao,
          assuntos: p.assuntos,
          referenciaLegislativa: p.referenciaLegislativa,
          referenciaSumular: p.referenciaSumular,
          sumulaOriginada: p.sumulaOriginada,
          repercussaoGeral: p.repercussaoGeral,
          processosLeadingCase: p.processos.filter(x => x.leadingCase).map(x => x.processo),
          linkOficial: p.tipo === 'Tema' ? linkOficialDoTema(p.numero) : null
        },
        origem_dado: 'curado',
        fontes: [fonte],
        validado_por: null,
        validado_em: null,
        atualizado_em: m.lidoEm
      })
    );
}
