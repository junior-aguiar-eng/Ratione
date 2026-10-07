/**
 * Calendário forense como DADO: cada evento aponta para a fonte de onde foi lido.
 * Regras do PLANO §1: sem ato e URL o dia fica `pendente`; só versão compilada/texto não tachado.
 * Para incluir um tribunal ou ano: ler o ato, registrar a fonte aqui, listar os eventos e,
 * se o ano estiver completo, declarar a cobertura (o resultado passa a exibir o selo de calendário conferido).
 */
export type EfeitoEvento = 'nao_util' | 'expediente_parcial';
export type VerificacaoEvento = 'ato_do_tribunal' | 'pendente';

export interface FonteCalendario {
  ato: string;
  url: string;
  /** O que foi lido: o ato inteiro, ou só a notícia/comunicado oficial do tribunal sobre ele. */
  lido: string;
  lidoEm: string;
}

export interface EventoCalendario {
  tribunais: string[];
  /** ISO, inclusivo. */
  inicio: string;
  fim: string;
  nome: string;
  efeito: EfeitoEvento;
  verificacao: VerificacaoEvento;
  fundamento: string;
  fonte: keyof typeof FONTES_CALENDARIO;
}

/** Regra que se repete todo ano: data fixa, intervalo de datas ou deslocamento a partir da Páscoa. */
export interface RegraAnual {
  tribunais: string[];
  nome: string;
  efeito: EfeitoEvento;
  verificacao: VerificacaoEvento;
  fundamento: string;
  fonte: keyof typeof FONTES_CALENDARIO;
  quando:
    | { tipo: 'pascoa'; deslocamentos: number[] }
    | { tipo: 'intervalo'; de: [number, number]; ate: [number, number] };
}

const LIDO = '2026-10-07';

export const FONTES_CALENDARIO = {
  'stj-gdg-1010': {
    ato: 'Portaria STJ/GDG nº 1.010/2025 (DJe 26/12/2025): feriados e pontos facultativos de 2026',
    url: 'https://bdjur.stj.jus.br/server/api/core/bitstreams/6257b5ff-8c9d-408f-a7d5-c6d7064af8eb/content',
    lido: 'inteiro teor (PDF)',
    lidoEm: LIDO
  },
  'stj-horarios': {
    ato: 'STJ, Horários de funcionamento: feriados, pontos facultativos e recesso',
    url: 'https://www.stj.jus.br/sites/portalp/Contato-e-ajuda/Fale-conosco/Horarios-de-funcionamento',
    lido: 'página oficial do tribunal',
    lidoEm: LIDO
  },
  'stf-cal-2026': {
    ato: 'Calendário oficial do STF 2026 (Portaria GDG/STF nº 189/2025; RISTF, art. 78)',
    url: 'https://www.stf.jus.br/arquivo/cms/processoCalendarioStf/anexo/CalendarioSTFOficial2026.pdf',
    lido: 'calendário oficial (PDF); a portaria em si não foi lida',
    lidoEm: LIDO
  },
  'tjsp-csm-2813': {
    ato: 'Provimento CSM nº 2.813/2025 (DJE 25/11/2025): suspensão do expediente forense em 2026',
    url: 'https://esaj.tjsp.jus.br/gcn-frontend-vue/legislacao/find/236794',
    lido: 'inteiro teor (portal de legislação do TJSP)',
    lidoEm: LIDO
  },
  'tjmg-pc-1764': {
    ato: 'Portaria Conjunta nº 1.764/PR/2026 do TJMG (DJe 13/01/2026): suspensão do expediente em 2026',
    url: 'https://www8.tjmg.jus.br/institucional/at/pdf/pc17642026.pdf',
    lido: 'inteiro teor (PDF)',
    lidoEm: LIDO
  },
  'tjmg-res-458': {
    ato: 'Resolução do Órgão Especial do TJMG nº 458/2004 (alterada pela Res. OE 1.081/2024), art. 1º',
    url: 'https://www8.tjmg.jus.br/institucional/at/pdf/re04582004.pdf',
    lido: 'inteiro teor (PDF)',
    lidoEm: LIDO
  },
  'tjrj-informativo-2026': {
    ato: 'TJRJ, Informativo de suspensão de prazos e de expediente forense, calendário de feriados 2026 (atualizado em 05/10/2026), que cita cada ato (Lei estadual 10.633/2024, art. 83; Atos Executivos TJ 20, 60, 79, 91, 96, 103, 114, 116, 129, 159 e 162/2026)',
    url: 'https://www.tjrj.jus.br/documents/d/portal-conhecimento/suspensao-prazos-1a-e-2a-instancia_2026_seesc',
    lido: 'informativo oficial do tribunal (PDF, lido no navegador porque o servidor envia cadeia de certificados incompleta); diz ser meramente informativo e não substituir a publicação oficial; os atos em si não foram lidos; só ocorrências de todo o Estado, as de comarca não entram',
    lidoEm: LIDO
  },
  'tjal-an-03-2026': {
    ato: 'Ato Normativo nº 03/2026 do TJAL: feriados de 2026 (DJE, Caderno Administrativo, ed. 3944, 28/01/2026, p. 7)',
    url: 'https://tjal.jus.br/noticia/tribunal-de-justica-de-alagoas-regulamenta-feriados-de-2026/visualizar',
    lido: 'página do Diário Oficial com o texto do ato (arts. 1º a 6º), fornecida pelo responsável; o número do ato está na página anterior, que não foi lida (o 03/2026 vem da notícia oficial)',
    lidoEm: LIDO
  },
  'tjal-lei-6564': {
    ato: 'Lei estadual nº 6.564/2005 (Código de Organização Judiciária de Alagoas), arts. 36 e 37',
    url: 'https://www.tjal.jus.br/organizacao/Lei.n.6.564.de.05.01.05.COoDIGO.DE.ORG.JUDICIaRIA.pdf',
    lido: 'texto consolidado no site do TJAL, com o cabeçalho "alterada até a Lei nº 8.850/2021"; arts. 35 a 38 sem marca de alteração; alterações posteriores a 2021 não verificadas',
    lidoEm: LIDO
  }
} satisfies Record<string, FonteCalendario>;

/** Pontos facultativos de 2026, idênticos nos atos de STF e STJ. */
const PF_2026: Array<{ data: string; nome: string; parcial?: boolean }> = [
  { data: '2026-02-18', nome: 'Quarta-feira de Cinzas (ponto facultativo até as 14h)', parcial: true },
  { data: '2026-04-20', nome: 'Ponto facultativo' },
  { data: '2026-06-04', nome: 'Corpus Christi (ponto facultativo)' },
  { data: '2026-06-05', nome: 'Ponto facultativo' },
  { data: '2026-08-10', nome: 'Ponto facultativo' },
  { data: '2026-10-30', nome: 'Ponto facultativo (transferência do Dia do Servidor, 28/10)' },
  { data: '2026-12-07', nome: 'Ponto facultativo' }
];

export const EVENTOS_CALENDARIO: EventoCalendario[] = [
  // ---------- STF e STJ, 2026 ----------
  ...PF_2026.map(pf => ({
    tribunais: ['STJ'],
    inicio: pf.data,
    fim: pf.data,
    nome: pf.nome,
    efeito: (pf.parcial ? 'expediente_parcial' : 'nao_util') as EfeitoEvento,
    verificacao: 'ato_do_tribunal' as const,
    fundamento: 'Portaria STJ/GDG 1.010/2025, art. 1º',
    fonte: 'stj-gdg-1010' as const
  })),
  ...PF_2026.map(pf => ({
    tribunais: ['STF'],
    inicio: pf.data,
    fim: pf.data,
    nome: pf.nome,
    efeito: (pf.parcial ? 'expediente_parcial' : 'nao_util') as EfeitoEvento,
    verificacao: 'ato_do_tribunal' as const,
    fundamento: 'Calendário oficial do STF 2026 (Portaria GDG/STF 189/2025)',
    fonte: 'stf-cal-2026' as const
  })),

  // ---------- TJSP, 2026: Provimento CSM 2.813/2025, art. 1º ----------
  ...[
    ['2026-02-16', 'Carnaval (segunda-feira)'],
    ['2026-02-17', 'Carnaval (terça-feira)'],
    ['2026-04-02', 'Endoenças'],
    ['2026-04-03', 'Sexta-feira da Paixão'],
    ['2026-04-20', 'Suspensão do expediente'],
    ['2026-06-04', 'Corpus Christi'],
    ['2026-06-05', 'Suspensão do expediente'],
    ['2026-07-09', 'Data Magna do Estado de São Paulo (Lei Estadual 9.497/1997)'],
    ['2026-07-10', 'Suspensão do expediente'],
    ['2026-10-30', 'Dia do Servidor Público (transferido de 28/10 pelo Provimento CSM 2.845/2026, citado no 2.813/2025)'],
    ['2026-12-07', 'Suspensão do expediente'],
    ['2026-12-08', 'Dia da Justiça']
  ].map(([data, nome]) => ({
    tribunais: ['TJSP'],
    inicio: data,
    fim: data,
    nome,
    efeito: 'nao_util' as const,
    verificacao: 'ato_do_tribunal' as const,
    fundamento: 'Provimento CSM 2.813/2025, art. 1º',
    fonte: 'tjsp-csm-2813' as const
  })),
  {
    tribunais: ['TJSP'], inicio: '2026-01-01', fim: '2026-01-06', nome: 'Recesso forense (sem expediente)',
    efeito: 'nao_util', verificacao: 'ato_do_tribunal', fundamento: 'Provimento CSM 2.813/2025, art. 1º, § 1º; RITJSP, art. 116, § 2º', fonte: 'tjsp-csm-2813'
  },
  {
    tribunais: ['TJSP'], inicio: '2026-12-20', fim: '2026-12-31', nome: 'Recesso forense (sem expediente)',
    efeito: 'nao_util', verificacao: 'ato_do_tribunal', fundamento: 'Provimento CSM 2.813/2025, art. 1º, § 1º; RITJSP, art. 116, § 2º', fonte: 'tjsp-csm-2813'
  },
  {
    tribunais: ['TJSP'], inicio: '2026-02-18', fim: '2026-02-18', nome: 'Quarta-feira de Cinzas (jornada começa 3 horas depois; atendimento a partir das 13h)',
    efeito: 'expediente_parcial', verificacao: 'ato_do_tribunal', fundamento: 'Provimento CSM 2.813/2025, art. 2º', fonte: 'tjsp-csm-2813'
  },

  // ---------- TJMG, 2026: Portaria Conjunta 1.764/PR/2026, art. 1º ----------
  { tribunais: ['TJMG'], inicio: '2026-02-16', fim: '2026-02-18', nome: 'Carnaval (segunda a quarta-feira de cinzas)', efeito: 'nao_util', verificacao: 'ato_do_tribunal', fundamento: 'Portaria Conjunta 1.764/PR/2026, art. 1º, I', fonte: 'tjmg-pc-1764' },
  { tribunais: ['TJMG'], inicio: '2026-04-01', fim: '2026-04-03', nome: 'Semana Santa (quarta a sexta-feira)', efeito: 'nao_util', verificacao: 'ato_do_tribunal', fundamento: 'Portaria Conjunta 1.764/PR/2026, art. 1º, II', fonte: 'tjmg-pc-1764' },
  { tribunais: ['TJMG'], inicio: '2026-04-20', fim: '2026-04-20', nome: 'Emenda do feriado de Tiradentes', efeito: 'nao_util', verificacao: 'ato_do_tribunal', fundamento: 'Portaria Conjunta 1.764/PR/2026, art. 1º, III', fonte: 'tjmg-pc-1764' },
  { tribunais: ['TJMG'], inicio: '2026-10-30', fim: '2026-10-30', nome: 'Dia do Funcionário Público', efeito: 'nao_util', verificacao: 'ato_do_tribunal', fundamento: 'Portaria Conjunta 1.764/PR/2026, art. 1º, V', fonte: 'tjmg-pc-1764' },
  { tribunais: ['TJMG'], inicio: '2026-12-07', fim: '2026-12-07', nome: 'Emenda do Dia da Justiça', efeito: 'nao_util', verificacao: 'ato_do_tribunal', fundamento: 'Portaria Conjunta 1.764/PR/2026, art. 1º, VI', fonte: 'tjmg-pc-1764' },
  { tribunais: ['TJMG'], inicio: '2026-06-04', fim: '2026-06-04', nome: 'Corpus Christi: feriado municipal em Belo Horizonte e em comarcas que o adotam (depende da comarca)', efeito: 'nao_util', verificacao: 'pendente', fundamento: 'Informe do TJMG de 14/01/2026; depende de lei municipal', fonte: 'tjmg-pc-1764' },
  { tribunais: ['TJMG'], inicio: '2026-06-05', fim: '2026-06-05', nome: 'Emenda de Corpus Christi: só Belo Horizonte e comarcas com feriado municipal (depende da comarca)', efeito: 'nao_util', verificacao: 'pendente', fundamento: 'Portaria Conjunta 1.764/PR/2026, art. 1º, IV', fonte: 'tjmg-pc-1764' },

  // ---------- TJRJ, 2026: informativo oficial (ocorrências de todo o Estado até 12/10/2026) ----------
  ...[
    ['2026-02-05', 'Prorrogação dos prazos de processos eletrônicos (indisponibilidade do sistema), Ato Executivo 24/2026'],
    ['2026-02-13', 'Ponto facultativo antes do Carnaval, Ato Executivo 20/2026'],
    ['2026-02-16', 'Carnaval (Lei 10.633/2024, art. 83, III)'],
    ['2026-02-17', 'Carnaval (Lei 10.633/2024, art. 83, III)'],
    ['2026-02-18', 'Quarta-feira de Cinzas (Lei 10.633/2024, art. 83, III)'],
    ['2026-02-27', 'Suspensão de prazos por chuvas na 1ª e 2ª instâncias, Ato Executivo 60/2026'],
    ['2026-03-27', 'Prorrogação dos prazos de processos eletrônicos (indisponibilidade do sistema), Ato Executivo 73/2026'],
    ['2026-04-02', 'Semana Santa (Lei 10.633/2024, art. 83, IV)'],
    ['2026-04-03', 'Sexta-feira da Paixão (Lei 10.633/2024, art. 83, IV)'],
    ['2026-04-23', 'Dia de São Jorge (Lei estadual 5.198/2008)'],
    ['2026-04-24', 'Ponto facultativo, Ato Executivo 79/2026'],
    ['2026-06-04', 'Corpus Christi (Lei estadual 11.002/2025)'],
    ['2026-06-05', 'Ponto facultativo, Ato Executivo 91/2026'],
    ['2026-06-24', 'Jogo da Seleção na Copa: prazos suspensos, expediente das 11h às 15h, Ato Executivo 96/2026'],
    ['2026-06-29', 'Jogo da Seleção na Copa: expediente e prazos suspensos, Ato Executivo 103/2026'],
    ['2026-07-29', 'Suspensão de prazos, Ato Executivo 116/2026'],
    ['2026-08-07', 'Condições climáticas: prazos suspensos, Ato Executivo 129/2026'],
    ['2026-08-11', 'Dia do Advogado: prazos suspensos em todo o Estado, Ato Executivo 114/2026'],
    ['2026-09-04', 'Expediente das 11h às 15h, prazos suspensos, Ato Executivo 159/2026'],
    ['2026-09-11', 'Expediente das 11h às 15h, prazos suspensos, Ato Executivo 162/2026']
  ].map(([data, nome]) => ({
    tribunais: ['TJRJ'],
    inicio: data,
    fim: data,
    nome,
    efeito: 'nao_util' as const,
    verificacao: 'ato_do_tribunal' as const,
    fundamento: 'TJRJ, informativo de suspensão de prazos 2026 (cita o ato)',
    fonte: 'tjrj-informativo-2026' as const
  })),

  // ---------- TJAL, 2026: Ato Normativo 03/2026 (texto lido no DJE de 28/01/2026) ----------
  ...[
    ['2026-04-20', 'Tiradentes (suspensão de atividades, atos e prazos)'],
    ['2026-06-04', 'Corpus Christi'],
    ['2026-06-05', 'Suspensão de atividades e prazos (Corpus Christi)'],
    ['2026-08-10', 'Dia do Jurista (suspensão dos trabalhos)'],
    ['2026-08-11', 'Dia do Jurista (feriado)'],
    ['2026-12-07', 'Suspensão dos trabalhos (Dia da Justiça)'],
    ['2026-12-08', 'Dia da Justiça (feriado)']
  ].map(([data, nome]) => ({
    tribunais: ['TJAL'],
    inicio: data,
    fim: data,
    nome,
    efeito: 'nao_util' as const,
    verificacao: 'ato_do_tribunal' as const,
    fundamento: 'Ato Normativo TJAL 03/2026, arts. 1º, 2º, 3º e 5º',
    fonte: 'tjal-an-03-2026' as const
  })),
  { tribunais: ['TJAL'], inicio: '2026-08-28', fim: '2026-08-28', nome: 'Nossa Senhora dos Prazeres: suspensão só nos municípios que preveem o feriado (depende da comarca)', efeito: 'nao_util', verificacao: 'pendente', fundamento: 'Ato Normativo TJAL 03/2026, art. 4º', fonte: 'tjal-an-03-2026' }
];

/** Regras que se repetem todo ano. As do TJMG vêm de resolução permanente e as do TJAL da Lei estadual 6.564/2005 (consolidada); só o recesso de 23/06 a 01/07 do TJAL fica pendente. */
export const REGRAS_ANUAIS: RegraAnual[] = [
  { tribunais: ['TJMG'], nome: 'Carnaval (segunda a quarta-feira)', efeito: 'nao_util', verificacao: 'ato_do_tribunal', fundamento: 'Res. OE TJMG 458/2004, art. 1º, III', fonte: 'tjmg-res-458', quando: { tipo: 'pascoa', deslocamentos: [-48, -47, -46] } },
  { tribunais: ['TJMG'], nome: 'Semana Santa (quarta a sexta-feira)', efeito: 'nao_util', verificacao: 'ato_do_tribunal', fundamento: 'Res. OE TJMG 458/2004, art. 1º, IV', fonte: 'tjmg-res-458', quando: { tipo: 'pascoa', deslocamentos: [-4, -3, -2] } },
  { tribunais: ['TJMG'], nome: 'Dia da Justiça (8 de dezembro)', efeito: 'nao_util', verificacao: 'ato_do_tribunal', fundamento: 'Res. OE TJMG 458/2004, art. 1º, V', fonte: 'tjmg-res-458', quando: { tipo: 'intervalo', de: [12, 8], ate: [12, 8] } },

  { tribunais: ['TJAL'], nome: 'Carnaval (segunda a quarta-feira de cinzas)', efeito: 'nao_util', verificacao: 'ato_do_tribunal', fundamento: 'Lei estadual AL 6.564/2005, art. 36, III', fonte: 'tjal-lei-6564', quando: { tipo: 'pascoa', deslocamentos: [-48, -47, -46] } },
  { tribunais: ['TJAL'], nome: 'Semana Santa (quarta a domingo de Páscoa)', efeito: 'nao_util', verificacao: 'ato_do_tribunal', fundamento: 'Lei estadual AL 6.564/2005, art. 36, I', fonte: 'tjal-lei-6564', quando: { tipo: 'pascoa', deslocamentos: [-4, -3, -2] } },
  { tribunais: ['TJAL'], nome: '11 de agosto', efeito: 'nao_util', verificacao: 'ato_do_tribunal', fundamento: 'Lei estadual AL 6.564/2005, art. 36, II', fonte: 'tjal-lei-6564', quando: { tipo: 'intervalo', de: [8, 11], ate: [8, 11] } },
  { tribunais: ['TJAL'], nome: '8 de dezembro', efeito: 'nao_util', verificacao: 'ato_do_tribunal', fundamento: 'Lei estadual AL 6.564/2005, art. 36, II', fonte: 'tjal-lei-6564', quando: { tipo: 'intervalo', de: [12, 8], ate: [12, 8] } },
  { tribunais: ['TJAL'], nome: 'Feriados forenses de 23 de junho a 1º de julho', efeito: 'nao_util', verificacao: 'pendente', fundamento: 'Lei estadual AL 6.564/2005, art. 37 (vigência atual não confirmada)', fonte: 'tjal-lei-6564', quando: { tipo: 'intervalo', de: [6, 23], ate: [7, 1] } },
  { tribunais: ['TJAL'], nome: 'Feriados forenses de 20 a 31 de dezembro', efeito: 'nao_util', verificacao: 'ato_do_tribunal', fundamento: 'Lei estadual AL 6.564/2005, art. 37', fonte: 'tjal-lei-6564', quando: { tipo: 'intervalo', de: [12, 20], ate: [12, 31] } }
];

/**
 * Tribunais cujo calendário de um ano foi conferido por inteiro. Só estes recebem o selo
 * "calendário conferido". Feriados municipais nunca entram (CPC, art. 1.003, § 6º).
 */
export const COBERTURA_CALENDARIO: Record<string, { anos: number[]; fontes: Array<keyof typeof FONTES_CALENDARIO> }> = {
  STJ: { anos: [2026], fontes: ['stj-gdg-1010', 'stj-horarios'] },
  STF: { anos: [2026], fontes: ['stf-cal-2026'] },
  TJSP: { anos: [2026], fontes: ['tjsp-csm-2813'] },
  TJMG: { anos: [2026], fontes: ['tjmg-pc-1764', 'tjmg-res-458'] },
  TJAL: { anos: [2026], fontes: ['tjal-an-03-2026', 'tjal-lei-6564'] }
};
