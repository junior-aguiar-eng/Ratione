import type { EstruturaDecisaoCanonica } from '@ratione/argumenta';

/** Decisão ILUSTRATIVA usada apenas para demonstrar o módulo Argumenta. */
export const DECISAO_DEMO: EstruturaDecisaoCanonica = {
  id: 'demo-sentenca-fraude-bancaria',
  numeroProcesso: '1002345-88.2024.8.26.0100',
  tribunalOuVara: '22ª Vara Cível Central · Comarca de São Paulo/SP',
  magistrado: 'Juiz de Direito Titular',
  dataDecisao: '2026-03-08',
  relatorio: {
    resumoFatico:
      'Ação declaratória de inexistência de débito cumulada com reparação de danos morais movida por consumidor vítima de golpe de engenharia social (falso funcionário da instituição bancária) e transações atípicas via PIX no total de R$ 38.500,00, executadas de madrugada em intervalo inferior a dez minutos.',
    partes: {
      poloAtivo: ['Carlos Eduardo Silveira'],
      poloPassivo: ['Banco Santander (Brasil) S.A.']
    },
    pedidosPrincipais: [
      'Declaração de inexistência dos débitos contestados',
      'Restituição integral da quantia de R$ 38.500,00',
      'Indenização por danos morais fixada em R$ 15.000,00'
    ]
  },
  fundamentacao: {
    questoesPrejudiciaisOuPreliminares: [
      'Rejeição da preliminar de falta de interesse de agir (desnecessidade de esgotamento na via administrativa)',
      'Incidência das normas de ordem pública do Código de Defesa do Consumidor (Súmula 297/STJ)'
    ],
    tesesIdentificadas: [
      {
        id: 'tese-1',
        titulo: 'Responsabilidade objetiva da instituição financeira por fortuito interno',
        conclusao:
          'A instituição financeira responde objetivamente pelos danos oriundos de fraudes praticadas por terceiros no âmbito de operações bancárias atípicas.',
        premissas: [
          {
            id: 'p1',
            tipo: 'norma_positivada',
            descricao: 'Art. 14 do Código de Defesa do Consumidor (defeito na segurança do serviço)',
            fonteCitada: 'CDC, art. 14',
            paginaDoc: 4
          },
          {
            id: 'p2',
            tipo: 'precedente_judicial',
            descricao: 'Súmula 479 do STJ (fortuito interno inerente ao risco do empreendimento financeiro)',
            fonteCitada: 'STJ, Súmula 479',
            paginaDoc: 4
          },
          {
            id: 'p3',
            tipo: 'fato_provado',
            descricao:
              'Transações vultosas fora do horário habitual do correntista sem bloqueio cautelar pelos sistemas antifraude',
            paginaDoc: 5
          }
        ],
        dispositivosLegais: ['CDC, art. 14', 'CPC, art. 373, II'],
        precedentesCitados: ['STJ, Súmula 479'],
        vulnerabilidades: [
          {
            id: 'vuln-1',
            tipoInciso: 'IV_NAO_ENFRENTAMENTO_ARGUMENTO_CAPAZ',
            titulo: 'Ausência de enfrentamento sobre envio voluntário de token OTP',
            explicacao:
              'A decisão não apreciou o argumento defensivo do banco quanto à entrega consciente das chaves de segurança pelo correntista a terceiro.',
            trechoTexto:
              '“Rejeito os argumentos da defesa de que houve culpa do correntista, porquanto incide de forma irrestrita o risco da atividade financeira.”',
            pagina: 6,
            paragrafo: 14,
            remedioProcessualSugerido: 'embargos_declaracao_omissao'
          }
        ]
      },
      {
        id: 'tese-2',
        titulo: 'Fixação de honorários advocatícios sucumbenciais',
        conclusao: 'Condenação ao pagamento de honorários em 15% sobre o valor atualizado da condenação.',
        premissas: [
          {
            id: 'p4',
            tipo: 'norma_positivada',
            descricao: 'Art. 85, § 2º do CPC: fixação objetiva vinculada à condenação',
            fonteCitada: 'CPC, art. 85, § 2º',
            paginaDoc: 7
          },
          {
            id: 'p5',
            tipo: 'precedente_judicial',
            descricao: 'Tema 1.076/STJ: vedação de equidade fora das hipóteses do § 8º',
            fonteCitada: 'STJ, Tema 1.076',
            paginaDoc: 7
          }
        ],
        dispositivosLegais: ['CPC, art. 85, § 2º'],
        precedentesCitados: ['STJ, Tema 1.076'],
        vulnerabilidades: []
      }
    ]
  },
  dispositivo: {
    resultado: 'procedente',
    conteudoDispositivo:
      'JULGO PROCEDENTES OS PEDIDOS formulados na inicial, com resolução do mérito (CPC, art. 487, I), para declarar a inexigibilidade dos débitos impugnados, condenar a instituição requerida à restituição simples de R$ 38.500,00 corrigidos e acrescidos de juros de mora legais, bem como ao pagamento de R$ 10.000,00 a título de compensação por danos morais.',
    sucumbencia: 'Custas e despesas processuais atribuídas ao réu.',
    honorarios: 'Honorários advocatícios sucumbenciais fixados em 15% sobre o valor da condenação (CPC, art. 85, § 2º).'
  }
};
