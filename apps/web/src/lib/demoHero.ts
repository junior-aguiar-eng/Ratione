/**
 * Lógica das demonstrações do topo da página inicial. As contas são as dos motores reais (PrazoZero e NormaViva), no navegador; nada vai ao
 * servidor. O que é ilustrativo (a decisão do Argumenta) fica rotulado como exemplo na tela.
 */
import { MotorPrazoZero, type ItemMemoriaCalculo } from '@ratione/prazozero';
import { MotorNormaViva } from '@ratione/normaviva';
import { TRIBUNAIS_BRASIL } from '@ratione/core';

export interface AtoDemo {
  id: string;
  nome: string;
  dias: number;
  base: string;
}

export const ATOS_DEMO: readonly AtoDemo[] = [
  { id: 'apelacao', nome: 'Apelação', dias: 15, base: 'CPC, art. 1.003, § 5º' },
  { id: 'contestacao', nome: 'Contestação', dias: 15, base: 'CPC, art. 335' },
  { id: 'embargos', nome: 'Embargos de declaração', dias: 5, base: 'CPC, art. 1.023' },
  { id: 'agravo', nome: 'Agravo de instrumento', dias: 15, base: 'CPC, art. 1.003, § 5º' }
];

/** Só tribunais com calendário de 2026 conferido contra o ato oficial. */
export const TRIBUNAIS_DEMO = ['TJSP', 'TJMG', 'TJAL'] as const;

/** A demonstração fica dentro do ano que tem calendário conferido, sem o recesso de dezembro. */
export const DATA_MINIMA_DEMO = '2026-01-05';
export const DATA_MAXIMA_DEMO = '2026-10-30';
export const DATA_INICIAL_DEMO = '2026-03-10';

export interface ResultadoDemoPrazo {
  prazoFinal: string;
  diasUteis: number;
  calendarioConferido: boolean;
  /** Dias que não entraram na contagem (fim de semana e feriado), em ordem, para mostrar a memória de cálculo. */
  excluidos: Array<Pick<ItemMemoriaCalculo, 'data' | 'status' | 'descricao'>>;
  fontes: Array<{ ato: string; url: string }>;
}

export function calcularDemoPrazo(entrada: { data: string; atoId: string; tribunalId: string }): ResultadoDemoPrazo | null {
  const ato = ATOS_DEMO.find(a => a.id === entrada.atoId);
  const tribunal = TRIBUNAIS_BRASIL[entrada.tribunalId];
  if (!ato || !tribunal || !(TRIBUNAIS_DEMO as readonly string[]).includes(tribunal.id)) return null;
  if (entrada.data < DATA_MINIMA_DEMO || entrada.data > DATA_MAXIMA_DEMO) return null;
  try {
    const r = new MotorPrazoZero().calcularPrazo({
      dataEvento: entrada.data,
      tipoEvento: 'disponibilizacao_dje',
      diasPrazo: ato.dias,
      tribunalId: tribunal.id,
      uf: tribunal.uf,
      nomeAto: ato.nome
    });
    return {
      prazoFinal: r.dataVencimentoFinal,
      diasUteis: r.diasTotaisComputados,
      calendarioConferido: r.calendarioVerificado,
      excluidos: r.memoriaCalculo
        .filter(i => i.status === 'fim_de_semana' || i.status === 'feriado' || i.status === 'recesso_forense' || i.status === 'expediente_parcial')
        .map(i => ({ data: i.data, status: i.status, descricao: i.descricao })),
      fontes: r.fontesCalendario ?? []
    };
  } catch {
    return null;
  }
}

export interface ResultadoDemoNorma {
  existe: boolean;
  rotulo: string;
  normaNome: string;
  /** Trecho do texto vigente na data (nulo se o dispositivo ainda não existia). */
  texto: string | null;
  ato: string | null;
  desde: string | null;
}

export const DISPOSITIVO_DEMO = 'CPC-ART-85-P6A';

export function consultarDemoNorma(dataIso: string): ResultadoDemoNorma {
  const motor = new MotorNormaViva();
  const linha = motor.obterLinhaDoTempo(DISPOSITIVO_DEMO)[0];
  const versao = motor.consultarDispositivoNaData(DISPOSITIVO_DEMO, dataIso);
  return {
    existe: versao !== null,
    rotulo: linha.dispositivoRotulo,
    normaNome: linha.normaNome,
    texto: versao ? versao.texto : null,
    ato: versao ? versao.atoModificador.rotulo : null,
    desde: versao ? versao.dataInicioVigencia : null
  };
}

/** As datas que a demonstração do NormaViva oferece: antes da lei, no dia em que passou a valer e hoje. */
export const DATAS_DEMO_NORMA = [
  { id: 'antes', rotulo: '01/06/2022', iso: '2022-06-01' },
  { id: 'inicio', rotulo: '03/06/2022', iso: '2022-06-03' },
  { id: 'hoje', rotulo: 'Hoje', iso: null }
] as const;

/** Resume um texto longo no último espaço antes do limite, com reticências. */
export function resumirTexto(texto: string, limite: number): string {
  if (texto.length <= limite) return texto;
  const corte = texto.lastIndexOf(' ', limite);
  return `${texto.slice(0, corte > 0 ? corte : limite)}…`;
}
