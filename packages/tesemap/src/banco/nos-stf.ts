/**
 * Nós do grafo a partir dos temas de repercussão geral do STF (F4-02 → F4-03). Critério em `classificarTemaRg`: repercussão reconhecida e não
 * cancelado; com tese firmada vira `precedente`, com mérito pendente vira `tema` (a questão em julgamento, sem tese).
 * O nó é dado oficial importado (`curado`, sem validador): o texto é o do tribunal. As arestas entre precedentes é que exigem validação humana.
 */
import { NoBancoSchema, type NoBanco } from './esquemas';
import type { CitacaoNormativa } from './citacoes';
import { classificarTemaRg, type TemaRgStf } from '../stf/repercussao';
import type { ManifestoStf } from '../stf/corpus';

/** `citados`: números de tema que os precedentes do STJ ligam ao STF; entram mesmo com a repercussão negada (ver `classificarTemaRg`). */
export function nosDosTemasStf(temas: TemaRgStf[], m: ManifestoStf, citacoes: (texto: string) => CitacaoNormativa[] = () => [], citados: ReadonlySet<number> = new Set()): NoBanco[] {
  const arquivo = m.arquivos.find(a => a.nome === 'repercussao-geral');
  const fonte = {
    id: 'stf-transparencia-repercussao-geral',
    ato: m.fonte,
    url: m.paginaUrl,
    lido: `${arquivo?.descricao ?? 'Temas de repercussão geral'}; importação mecânica do arquivo oficial, ${m.obtidoPor}`,
    lidoEm: m.lidoEm
  };
  const nos: NoBanco[] = [];
  for (const t of temas) {
    const tipo = classificarTemaRg(t, citados.has(t.numero));
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
          citacoes: citacoes(`${t.titulo} ${t.tese ?? ''}`)
        },
        origem_dado: 'curado',
        fontes: [fonte],
        validado_por: null,
        validado_em: null,
        atualizado_em: m.lidoEm
      })
    );
  }
  return nos;
}
