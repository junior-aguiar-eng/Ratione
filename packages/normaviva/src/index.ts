import { z } from 'zod';

export const TipoAlteracaoNormativaSchema = z.enum([
  'redacao_original',
  'alterado',
  'acrescentado',
  'revogado_expressamente',
  'declarado_inconstitucional'
]);
export type TipoAlteracaoNormativa = z.infer<typeof TipoAlteracaoNormativaSchema>;

export const VersaoDispositivoSchema = z.object({
  id: z.string(),
  dispositivoId: z.string(), // ex: "CPC-ART-85-P2"
  dispositivoRotulo: z.string(), // ex: "art. 85, § 2º"
  normaNome: z.string(), // ex: "Código de Processo Civil (Lei 13.105/2015)"
  texto: z.string(),
  dataInicioVigencia: z.string(), // ISO "YYYY-MM-DD"
  dataFimVigencia: z.string().nullable(), // ISO "YYYY-MM-DD" ou null se vigente
  tipoAlteracao: TipoAlteracaoNormativaSchema,
  atoModificador: z.object({
    rotulo: z.string(), // ex: "Lei nº 14.365/2022" ou "Redação Original"
    dataPublicacao: z.string(),
    linkLegislação: z.string().optional()
  })
});
export type VersaoDispositivo = z.infer<typeof VersaoDispositivoSchema>;

/**
 * Dispositivos de exemplo da prévia do NormaViva. Os textos foram conferidos com a versão compilada do CPC no Planalto
 * (https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105compilada.htm, lida em 07/10/2026) e a vigência
 * do § 6º-A com a Lei 14.365/2022, art. 5º (vigência na publicação, DOU de 03/06/2022). Não é uma base completa.
 */
export const HISTORICO_DISPOSITIVOS_EXEMPLO: VersaoDispositivo[] = [
  // Art. 85, § 2º do CPC (Honorários Advocatícios e fixação objetiva)
  {
    id: 'CPC-ART85-P2-V1',
    dispositivoId: 'CPC-ART-85-P2',
    dispositivoRotulo: 'art. 85, § 2º',
    normaNome: 'Código de Processo Civil (Lei nº 13.105/2015)',
    texto: 'Os honorários serão fixados entre o mínimo de dez e o máximo de vinte por cento sobre o valor da condenação, do proveito econômico obtido ou, não sendo possível mensurá-lo, sobre o valor atualizado da causa, atendidos: I - o grau de zelo do profissional; II - o lugar de prestação do serviço; III - a natureza e a importância da causa; IV - o trabalho realizado pelo advogado e o tempo exigido para o seu serviço.',
    dataInicioVigencia: '2016-03-18',
    dataFimVigencia: null,
    tipoAlteracao: 'redacao_original',
    atoModificador: {
      rotulo: 'Lei nº 13.105/2015 (Redação Original do CPC/15)',
      dataPublicacao: '2015-03-17'
    }
  },
  // Art. 85, § 6º-A do CPC (Acrescentado pela Lei nº 14.365/2022 para coibir fixação por equidade fora das hipóteses do § 8º)
  {
    id: 'CPC-ART85-P6A-V1',
    dispositivoId: 'CPC-ART-85-P6A',
    dispositivoRotulo: 'art. 85, § 6º-A',
    normaNome: 'Código de Processo Civil (Lei nº 13.105/2015)',
    texto: 'Quando o valor da condenação ou do proveito econômico obtido ou o valor atualizado da causa for líquido ou liquidável, para fins de fixação dos honorários advocatícios, nos termos dos §§ 2º e 3º, é proibida a apreciação equitativa, salvo nas hipóteses expressamente previstas no § 8º deste artigo.',
    dataInicioVigencia: '2022-06-03',
    dataFimVigencia: null,
    tipoAlteracao: 'acrescentado',
    atoModificador: {
      rotulo: 'Lei Federal nº 14.365/2022',
      dataPublicacao: '2022-06-03'
    }
  },
  // Art. 489, § 1º do CPC (Dever de fundamentação analítica)
  {
    id: 'CPC-ART489-P1-V1',
    dispositivoId: 'CPC-ART-489-P1',
    dispositivoRotulo: 'art. 489, § 1º',
    normaNome: 'Código de Processo Civil (Lei nº 13.105/2015)',
    texto: 'Não se considera fundamentada qualquer decisão judicial, seja ela interlocutória, sentença ou acórdão, que: I - se limitar à indicação, à reprodução ou à paráfrase de ato normativo, sem explicar sua relação com a causa ou a questão decidida; II - empregar conceitos jurídicos indeterminados, sem explicar o motivo concreto de sua incidência no caso; III - invocar motivos que se prestariam a justificar qualquer outra decisão; IV - não enfrentar todos os argumentos deduzidos no processo capazes de, em tese, infirmar a conclusão adotada pelo julgador; V - se limitar a invocar precedente ou enunciado de súmula, sem identificar seus fundamentos determinantes nem demonstrar que o caso sob julgamento se ajusta àqueles fundamentos; VI - deixar de seguir enunciado de súmula, jurisprudência ou precedente invocado pela parte, sem demonstrar a existência de distinção no caso em julgamento ou a superação do entendimento.',
    dataInicioVigencia: '2016-03-18',
    dataFimVigencia: null,
    tipoAlteracao: 'redacao_original',
    atoModificador: {
      rotulo: 'Lei nº 13.105/2015',
      dataPublicacao: '2015-03-17'
    }
  },
  // Art. 219 do CPC (Contagem de Prazos em Dias Úteis)
  {
    id: 'CPC-ART219-V1',
    dispositivoId: 'CPC-ART-219',
    dispositivoRotulo: 'art. 219',
    normaNome: 'Código de Processo Civil (Lei nº 13.105/2015)',
    texto: 'Na contagem de prazo em dias, estabelecido por lei ou pelo juiz, computar-se-ão somente os dias úteis. Parágrafo único. O disposto neste artigo aplica-se somente aos prazos processuais.',
    dataInicioVigencia: '2016-03-18',
    dataFimVigencia: null,
    tipoAlteracao: 'redacao_original',
    atoModificador: {
      rotulo: 'Lei nº 13.105/2015',
      dataPublicacao: '2015-03-17'
    }
  }
];

export class MotorNormaViva {
  private baseVersoes: VersaoDispositivo[] = [...HISTORICO_DISPOSITIVOS_EXEMPLO];

  /**
   * Consulta a redação vigente exata de um dispositivo em qualquer data histórica (Point-in-Time)
   */
  public consultarDispositivoNaData(dispositivoId: string, dataIso: string): VersaoDispositivo | null {
    const versoes = this.baseVersoes.filter(v => v.dispositivoId.toLowerCase() === dispositivoId.toLowerCase() || v.dispositivoRotulo.toLowerCase() === dispositivoId.toLowerCase());
    if (versoes.length === 0) return null;

    for (const v of versoes) {
      const inicio = v.dataInicioVigencia;
      const fim = v.dataFimVigencia;

      const aposInicio = dataIso >= inicio;
      const antesFim = fim === null || dataIso <= fim;

      if (aposInicio && antesFim) {
        return v;
      }
    }
    return null;
  }

  /**
   * Obtém todas as versões temporais para montar a linha do tempo (timeline)
   */
  public obterLinhaDoTempo(dispositivoId: string): VersaoDispositivo[] {
    return this.baseVersoes
      .filter(v => v.dispositivoId.toLowerCase() === dispositivoId.toLowerCase() || v.dispositivoRotulo.toLowerCase() === dispositivoId.toLowerCase())
      .sort((a, b) => a.dataInicioVigencia.localeCompare(b.dataInicioVigencia));
  }
}
