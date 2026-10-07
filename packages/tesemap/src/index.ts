import { z } from 'zod';

export const TipoNoGrafoSchema = z.enum([
  'tema_central',
  'tese_vinculante',
  'dispositivo_legal',
  'distinguishing',
  'inovacao_legislativa',
  'acordao_paradigma'
]);
export type TipoNoGrafo = z.infer<typeof TipoNoGrafoSchema>;

export const TipoArestaGrafoSchema = z.enum([
  'interpreta',
  'aplica',
  'distingue',
  'positiva_em_lei',
  'supera_entendimento',
  'fundamenta'
]);
export type TipoArestaGrafo = z.infer<typeof TipoArestaGrafoSchema>;

export const NoGrafoSchema = z.object({
  id: z.string(),
  label: z.string(),
  tipo: TipoNoGrafoSchema,
  tribunal: z.string().optional(),
  numeroReferencia: z.string().optional(),
  descricao: z.string(),
  detalhes: z.record(z.any()).optional()
});
export type NoGrafo = z.infer<typeof NoGrafoSchema>;

export const ArestaGrafoSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  tipo: TipoArestaGrafoSchema,
  label: z.string()
});
export type ArestaGrafo = z.infer<typeof ArestaGrafoSchema>;

export interface GrafoTopologicoTeses {
  temaPrincipal: string;
  nos: NoGrafo[];
  arestas: ArestaGrafo[];
}

/**
 * Casos Reais Catalogados (Sem Mocks) do Sistema de Precedentes Obrigatórios (Art. 927 CPC)
 */
export const GRAFOS_PRECEDENTES_CATALOGADOS: Record<string, GrafoTopologicoTeses> = {
  'tema-1076-stj': {
    temaPrincipal: 'Honorários Advocatícios: Aplicação do Art. 85 do CPC e Inadmissibilidade da Equidade em Causas de Grande Valor',
    nos: [
      {
        id: 'tema-central',
        label: 'Critérios de Fixação de Honorários (Art. 85 CPC)',
        tipo: 'tema_central',
        descricao: 'Regra geral de fixação sobre condenação, proveito econômico ou valor da causa.'
      },
      {
        id: 'cpc-art85-p2',
        label: 'Art. 85, § 2º do CPC',
        tipo: 'dispositivo_legal',
        descricao: 'Fixação obrigatória entre 10% e 20% sobre condenação, proveito econômico ou valor da causa.'
      },
      {
        id: 'cpc-art85-p8',
        label: 'Art. 85, § 8º do CPC',
        tipo: 'dispositivo_legal',
        descricao: 'Apreciação equitativa restrita a causas de valor inestimável, irrisório ou proveito econômico muito baixo.'
      },
      {
        id: 'tema-1076-stj',
        label: 'Tema 1.076/STJ (Corte Especial)',
        tipo: 'tese_vinculante',
        tribunal: 'STJ',
        numeroReferencia: 'Tema 1.076',
        descricao: 'A fixação de honorários por equidade não é permitida quando os valores da condenação, da causa ou o proveito econômico forem elevados. Obediência estrita aos percentuais do § 2º.'
      },
      {
        id: 'lei-14365',
        label: 'Lei Federal nº 14.365/2022 (§ 6º-A)',
        tipo: 'inovacao_legislativa',
        descricao: 'O legislador federal positivou a tese do Tema 1.076/STJ, vedando expressamente a equidade em causas de valor elevado.'
      },
      {
        id: 'distinguishing-fazenda',
        label: 'Distinguishing: Causas de Valor Inestimável',
        tipo: 'distinguishing',
        descricao: 'Apenas quando for impossível mensurar qualquer proveito econômico cabe a equidade do § 8º.'
      }
    ],
    arestas: [
      { id: 'e1', source: 'tema-1076-stj', target: 'cpc-art85-p2', tipo: 'interpreta', label: 'Interpreta vinculantemente' },
      { id: 'e2', source: 'tema-1076-stj', target: 'cpc-art85-p8', tipo: 'distingue', label: 'Restringe hipóteses de cabimento' },
      { id: 'e3', source: 'lei-14365', target: 'tema-1076-stj', tipo: 'positiva_em_lei', label: 'Positiva tese em lei federal' },
      { id: 'e4', source: 'distinguishing-fazenda', target: 'cpc-art85-p8', tipo: 'aplica', label: 'Hipótese residual legítima' },
      { id: 'e5', source: 'cpc-art85-p2', target: 'tema-central', tipo: 'fundamenta', label: 'Fundamento legal estruturante' }
    ]
  },
  'sumula-479-stj': {
    temaPrincipal: 'Responsabilidade Civil de Instituições Financeiras em Fraudes Praticadas por Terceiros',
    nos: [
      {
        id: 'tema-fraude-bancaria',
        label: 'Fraude Bancária e Golpe Eletrônico',
        tipo: 'tema_central',
        descricao: 'Dever de segurança e risco do empreendimento no sistema financeiro nacional.'
      },
      {
        id: 'cdc-art14',
        label: 'Art. 14 do Código de Defesa do Consumidor',
        tipo: 'dispositivo_legal',
        descricao: 'Responsabilidade objetiva do fornecedor de serviços por defeitos relativos à prestação.'
      },
      {
        id: 'sumula-479-stj',
        label: 'Súmula 479/STJ',
        tipo: 'tese_vinculante',
        tribunal: 'STJ',
        numeroReferencia: 'Súmula 479',
        descricao: 'As instituições financeiras respondem objetivamente pelos danos gerados por fortuito interno relativo a fraudes e delitos praticados por terceiros no âmbito de operações bancárias.'
      },
      {
        id: 'distinguishing-culpa-exclusiva',
        label: 'Distinguishing: Culpa Exclusiva da Vítima (Art. 14, § 3º, II CDC)',
        tipo: 'distinguishing',
        descricao: 'Fortuito externo ou entrega voluntária de senhas sem qualquer falha nos mecanismos antifraude do banco.'
      }
    ],
    arestas: [
      { id: 'e1', source: 'sumula-479-stj', target: 'cdc-art14', tipo: 'interpreta', label: 'Consolida exegese do risco da atividade' },
      { id: 'e2', source: 'sumula-479-stj', target: 'tema-fraude-bancaria', tipo: 'fundamenta', label: 'Aplica responsabilidade objetiva' },
      { id: 'e3', source: 'distinguishing-culpa-exclusiva', target: 'sumula-479-stj', tipo: 'distingue', label: 'Excludente de responsabilidade' }
    ]
  }
};
