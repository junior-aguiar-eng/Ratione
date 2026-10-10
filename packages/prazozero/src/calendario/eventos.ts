/**
 * Calendário forense como DADO: cada evento aponta para a fonte de onde foi lido.
 * Regras do PLANO §1: sem ato e URL o dia fica `pendente`; só versão compilada/texto não tachado.
 * Para incluir um tribunal ou ano: ler o ato, registrar a fonte aqui, listar os eventos e,
 * se o ano estiver completo, declarar a cobertura (o resultado passa a exibir o selo de calendário conferido).
 */
export type EfeitoEvento = 'nao_util' | 'expediente_parcial';
export type VerificacaoEvento = 'ato_do_tribunal' | 'lei_estadual' | 'pendente';

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
const LIDO_10_10 = '2026-10-10';

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
  'pe-lei-16241': {
    ato: 'Lei estadual de Pernambuco nº 16.241/2017, art. 49: 6 de março, Data Magna e feriado civil (consolida a Lei 16.059/2017, revogada)',
    url: 'https://legis.alepe.pe.gov.br/?lo162412017',
    lido: 'texto na base Alepe Legis; alterações posteriores não verificadas',
    lidoEm: LIDO
  },
  'rs-decreto-36180': {
    ato: 'Decreto estadual do Rio Grande do Sul nº 36.180/1995, que cita a Constituição Estadual, art. 6º, parágrafo único (20 de setembro, data magna), e fixa o feriado',
    url: 'http://www.al.rs.gov.br/legis/M010/M0100099.ASP?Hid_IDNorma=11624',
    lido: 'decreto no sistema Legis da Assembleia; o texto da Constituição Estadual não foi lido, só a citação do decreto',
    lidoEm: LIDO
  },
  'go-lei-19850': {
    ato: 'Lei estadual de Goiás nº 19.850/2017, art. 1º, que trata o 24 de outubro como "feriado estadual" (pedra fundamental de Goiânia)',
    url: 'https://legisla.casacivil.go.gov.br/api/v2/pesquisa/legislacoes/99533/pdf',
    lido: 'lei que antecipa o feriado só para o sistema de educação em 2017; a lei que o instituiu não foi lida',
    lidoEm: LIDO
  },
  'tjes-aviso-penha-2023': {
    ato: 'TJES, aviso de plantão no feriado de Nossa Senhora da Penha (14/04/2023), que cita a Lei estadual ES 11.010/2019',
    url: 'https://www.tjes.jus.br/?p=161451',
    lido: 'notícia oficial do tribunal; o texto da lei não foi lido e a regra da data (segunda-feira após a oitava da Páscoa) vem de imprensa',
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
  },
  'tjpr-dj-621-2025': {
    ato: 'Decreto Judiciário nº 621/2025 do TJPR (Presidência): calendário de feriados e suspensão de expediente em 2026',
    url: 'https://www.tjpr.jus.br/documents/d/comunicacao/sei_12428873_decreto',
    lido: 'inteiro teor (PDF de 7 páginas, SEI 0064955-90.2025.8.16.6000); arts. 1º a 3º. O art. 4º (feriados locais dos municípios-sede) não entra: feriado municipal nunca conta (CPC, art. 1.003, § 6º)',
    lidoEm: LIDO_10_10
  },
  'tjpr-recesso-2025-2026': {
    ato: 'Resolução TJPR nº 515/2025: recesso de 20/12/2025 a 06/01/2026 e suspensão de prazos de 07/01 a 20/01/2026',
    url: 'https://www.tjpr.jus.br/destaques/-/asset_publisher/1lKI/content/id/111426821',
    lido: 'só o comunicado oficial do TJPR de 17/12/2025; a resolução em si não foi lida. O efeito sobre prazos coincide com o CPC, art. 220 (20/12 a 20/01), que o motor já aplica',
    lidoEm: LIDO_10_10
  },
  'tjrs-ato-05-2025': {
    ato: 'Ato nº 05/2025 do Órgão Especial do TJRS (assinado em 21/10/2025): feriados e dias sem expediente em 2026',
    url: 'https://www.tjrs.jus.br/static/2025/10/Ato_05_2025_OE-Feriados-2026.pdf',
    lido: 'inteiro teor (PDF de 2 páginas, SEI 8.2024.2199/000072-7)',
    lidoEm: LIDO_10_10
  },
  'tjrs-ato-06-2026': {
    ato: 'Ato nº 06/2026 do Órgão Especial do TJRS (DJE 02/10/2026): feriados e dias sem expediente em 2027',
    url: 'https://www.tjrs.jus.br/static/2026/10/SEI_10087781_Ato_06_2026___ORGAO_ESPECIAL.pdf',
    lido: 'inteiro teor (PDF de 2 páginas, SEI 8.2024.2199/000072-7)',
    lidoEm: LIDO_10_10
  },
  'tjrs-ato-conjunto-004-2026': {
    ato: 'Ato Conjunto nº 004/2026 (P e CGJ) do TJRS (DJE 02/07/2026): suspensão dos prazos por falta de energia e indisponibilidade dos sistemas',
    url: 'https://www.tjrs.jus.br/static/2026/07/SEI_9676356_Ato_Conjunto_004_2026___P_E_CGJ-2.pdf',
    lido: 'inteiro teor (PDF de 2 páginas, SEI 8.2026.0139/000472-0)',
    lidoEm: LIDO_10_10
  },
  'tjba-dj-1050-2025': {
    ato: 'Decreto Judiciário nº 1050/2025 do TJBA (DJE nº 3.944, 05/12/2025, pp. 6 a 8): recesso 2025/2026, expediente forense e feriados e pontos facultativos de 2026',
    url: 'https://www.tjba.jus.br/portal/wp-content/uploads/2025/12/Decreto-1050-25_-expediente-forense-2026.pdf',
    lido: 'inteiro teor (3 páginas do DJE). Art. 5º: feriados e pontos facultativos, todos sem expediente forense; art. 8º: prazos que vencem nesses dias são prorrogados. O recesso (arts. 2º e 4º) coincide com o CPC, art. 220. Os feriados municipais por comarca (Decreto Judiciário 09/2026 e alterações) não entram: CPC, art. 1.003, § 6º',
    lidoEm: LIDO_10_10
  },
  'tjba-dj-944-2026': {
    ato: 'Decreto Judiciário nº 944/2026 do TJBA (25/06/2026; DJE 26/06/2026): expediente e prazos em 29/06/2026 (jogo da Seleção na Copa do Mundo)',
    url: 'https://www7.tjba.jus.br/secao/lerPublicacao.wsp?tmp.mostrarDiv=sim&tmp.id=42896&tmp.secao=9',
    lido: 'texto no site do TJBA (o próprio texto ressalva que não substitui o do DJE de 26/06/2026); art. 3º suspende os prazos em 29/06/2026',
    lidoEm: LIDO_10_10
  },
  'tjdft-pc-105-2025': {
    ato: 'Portaria Conjunta nº 105/2025 do TJDFT (17/12/2025; Diário Administrativo 26/12/2025): calendário de feriados de 2026',
    url: 'https://www.tjdft.jus.br/institucional/imprensa/noticias/imagens-e-arquivos-2025/sei_4868188_portaria_conjunta_105-1.pdf',
    lido: 'inteiro teor (PDF de 4 páginas, SEI 0047698/2025). Art. 2º lista feriados e pontos facultativos; art. 4º suspende o expediente nos feriados; art. 5º prorroga os prazos. O art. 3º (30/11 e outros) vale só para os ofícios extrajudiciais e não entra. Conferida com a página "Feriados e expedientes suspensos" do TJDFT',
    lidoEm: LIDO_10_10
  },
  'tjdft-pc-48-2026': {
    ato: 'Portaria Conjunta nº 48/2026 do TJDFT (10/06/2026; Diário Administrativo 12/06/2026), alterada pela Portaria Conjunta 53/2026: expediente nos dias de jogo da Seleção na Copa do Mundo',
    url: 'https://www.tjdft.jus.br/institucional/imprensa/noticias/imagens-e-arquivos-2026/portaria-conjunta-48-de-2026.pdf',
    lido: 'inteiro teor da 48/2026 (PDF de 3 páginas, SEI 0019969/2026); a 53/2026 só pelas notícias oficiais do TJDFT (jogo às 14h = ponto facultativo). Art. 2º: prazos que começam ou terminam nos dias de expediente diferenciado são prorrogados para o primeiro dia útil',
    lidoEm: LIDO_10_10
  },
  'tjsc-res-gp-1-2026': {
    ato: 'Resolução GP nº 1/2026 do TJSC (16/01/2026; DJE nº 4.649, 19/01/2026): calendário de feriados para efeitos forenses em 2026',
    url: 'https://busca.tjsc.jus.br/buscatextual/integra.html#/integra/1/doc/188428/sistema/1',
    lido: 'texto COMPILADO (com as alterações das Resoluções GP 10, 12 e 45/2026) pela API do sistema de busca do TJSC; só entram as linhas do Anexo Único que valem para "Tribunal de Justiça, Turmas Recursais e todas as comarcas do Estado" (16 dias). As demais 195 linhas (feriados municipais) não entram: CPC, art. 1.003, § 6º. O art. 1º, parágrafo único, remete o recesso a "resolução própria", não localizada',
    lidoEm: LIDO_10_10
  },
  'tjsc-res-gp-31-2026': {
    ato: 'Resolução GP nº 31/2026 do TJSC (27/05/2026; DJE nº 4.735, 28/05/2026): horário excepcional nos dias de jogo da Seleção na Copa do Mundo de 2026',
    url: 'https://busca.tjsc.jus.br/buscatextual/integra.html#/integra/1/doc/189133/sistema/1',
    lido: 'inteiro teor pela API do sistema de busca do TJSC. Art. 2º: o dia do começo e o do vencimento dos prazos são postergados nos dias úteis de jogo entre 14h e 19h (CPC, art. 224, § 1º). A notícia oficial de 09/06/2026 confirma o expediente das 10h às 17h em 24/06 (jogo às 19h) e que 13/06 (sábado) e 19/06 (21h30) ficam fora da regra',
    lidoEm: LIDO_10_10
  },
  'tjsc-noticia-carnaval-2026': {
    ato: 'Notícia oficial do TJSC de 13/02/2026 sobre o Carnaval: Resolução GP 1/1985 (art. 1º, redação da GP 74/2023) e Resolução GP 13/2022 (Quarta-feira de Cinzas)',
    url: 'https://www.tjsc.jus.br/web/imprensa/-/justica-de-sc-atuara-em-regime-de-plantao-no-carnaval-expediente-volta-ao-normal-na-quarta-feira',
    lido: 'só a notícia oficial (as Resoluções GP 1/1985, 74/2023 e 13/2022 e a Resolução TJ 7/2006 não foram lidas): 16 e 17/02 sem expediente; em 18/02 o expediente começa às 12h',
    lidoEm: LIDO_10_10
  },
  'tjpe-ato-conjunto-43-2025': {
    ato: 'Ato Conjunto nº 43/2025 do TJPE (13/10/2025; DJe nº 304/2025, 14/10/2025, pp. 3 e 4): calendário dos feriados forenses de 2026',
    url: 'https://portal.tjpe.jus.br/documents/d/portal/feriados-2026-pdf',
    lido: 'inteiro teor (2 páginas do DJe). Art. 1º: 21 feriados, mais, no parágrafo único, 02 a 06/01, 23 e 25 a 30/06 e 20 a 31/12 (COJE, art. 94, e Res. TJPE 520/2024). Corpus Christi foi transferido de 04/06 para 22/06; o Dia dos Cursos Jurídicos, antecipado de 11/08 para 10/08. O art. 2º (16/07, só na Comarca do Recife) e o art. 4º (feriados municipais do interior) são municipais e não entram: CPC, art. 1.003, § 6º',
    lidoEm: LIDO_10_10
  },
  'tjpe-ato-966-2026': {
    ato: 'Ato nº 966/2026 da Presidência do TJPE (12/05/2026): suspende os prazos processuais em 11, 12 e 13/05/2026 (instabilidade do PJe)',
    url: 'https://portal.tjpe.jus.br/documents/d/portal/ato_n-966-2026-pdf',
    lido: 'inteiro teor (PDF de 2 páginas, SEI 00018092-59.2026.8.17.8017); arts. 1º (1º e 2º graus)',
    lidoEm: LIDO_10_10
  },
  'tjpe-ato-977-2026': {
    ato: 'Ato nº 977/2026 da Presidência do TJPE (14/05/2026; DJe nº 109/2026, 15/05/2026, p. 31): suspende os prazos processuais em 14 e 15/05/2026 (instabilidade do PJe)',
    url: 'https://portal.tjpe.jus.br/documents/d/portal/ato_n-977-2026-pdf',
    lido: 'inteiro teor na página do DJe (art. 1º: 1º e 2º graus)',
    lidoEm: LIDO_10_10
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

  // ---------- TJPR, 2026: Decreto Judiciário 621/2025, arts. 1º a 3º ----------
  // Os feriados do art. 1º que a lei federal já traz (1/1, 21/4, 1/5, 7/9, 12/10, 2/11, 15/11, 20/11, 25/12) não se repetem aqui;
  // entram os que dependem do ato: Carnaval, Paixão de Cristo e Corpus Christi, além do que é próprio do tribunal.
  // Fora: 08/09 (padroeira de Curitiba, feriado municipal) e 08/12 (o Dia da Justiça foi transferido para 18/12).
  ...[
    ['2026-02-16', 'Véspera de Carnaval (suspensão do expediente, com compensação de 1 hora por dia)', 'art. 2º'],
    ['2026-02-17', 'Carnaval', 'art. 1º'],
    ['2026-04-02', 'Quinta-feira Santa (suspensão do expediente, com compensação de 1 hora por dia)', 'art. 2º'],
    ['2026-04-03', 'Paixão de Cristo', 'art. 1º'],
    ['2026-04-20', 'Suspensão do expediente, com compensação de 1 hora por dia (emenda de Tiradentes)', 'art. 2º'],
    ['2026-06-04', 'Corpus Christi', 'art. 1º'],
    ['2026-06-05', 'Suspensão do expediente, com compensação de 1 hora por dia (emenda de Corpus Christi)', 'art. 2º'],
    ['2026-10-30', 'Dia do Funcionário Público (transferido de 28/10)', 'art. 1º'],
    ['2026-12-18', 'Dia da Justiça (transferido de 08/12)', 'art. 1º'],
    ['2026-12-24', 'Véspera de Natal (suspensão do expediente)', 'art. 3º'],
    ['2026-12-31', 'Véspera de Ano Novo (suspensão do expediente)', 'art. 3º']
  ].map(([data, nome, art]) => ({
    tribunais: ['TJPR'],
    inicio: data,
    fim: data,
    nome,
    efeito: 'nao_util' as const,
    verificacao: 'ato_do_tribunal' as const,
    fundamento: `Decreto Judiciário TJPR 621/2025, ${art}`,
    fonte: 'tjpr-dj-621-2025' as const
  })),

  // ---------- TJRS: Ato 05/2025 OE (2026) e Ato 06/2026 OE (2027) ----------
  // Os feriados nacionais dos atos já estão em lei federal; entram os que dependem do ato (Carnaval, Sexta-Feira Santa, 8/12).
  // Os atos marcam com asterisco 02/02 (Navegantes) e Corpus Christi: feriados municipais de Porto Alegre. 02/02 não entra;
  // Corpus Christi fica pendente (depende da comarca). A Revolução Farroupilha (20/09) já é regra anual conferida.
  ...[
    ['2026-02-16', 'Carnaval (segunda-feira)', 'tjrs-ato-05-2025', 'Ato 05/2025 OE'],
    ['2026-02-17', 'Carnaval (terça-feira)', 'tjrs-ato-05-2025', 'Ato 05/2025 OE'],
    ['2026-04-03', 'Sexta-Feira Santa', 'tjrs-ato-05-2025', 'Ato 05/2025 OE'],
    ['2026-12-08', 'Dia da Justiça', 'tjrs-ato-05-2025', 'Ato 05/2025 OE'],
    ['2026-07-02', 'Suspensão dos prazos por falta de energia e indisponibilidade dos sistemas', 'tjrs-ato-conjunto-004-2026', 'Ato Conjunto 004/2026 (P e CGJ), art. 1º'],
    ['2027-02-08', 'Carnaval (segunda-feira)', 'tjrs-ato-06-2026', 'Ato 06/2026 OE'],
    ['2027-02-09', 'Carnaval (terça-feira)', 'tjrs-ato-06-2026', 'Ato 06/2026 OE'],
    ['2027-03-26', 'Sexta-Feira Santa', 'tjrs-ato-06-2026', 'Ato 06/2026 OE'],
    ['2027-12-08', 'Dia da Justiça', 'tjrs-ato-06-2026', 'Ato 06/2026 OE']
  ].map(([data, nome, fonte, fundamento]) => ({
    tribunais: ['TJRS'],
    inicio: data,
    fim: data,
    nome,
    efeito: 'nao_util' as const,
    verificacao: 'ato_do_tribunal' as const,
    fundamento,
    fonte: fonte as keyof typeof FONTES_CALENDARIO
  })),
  { tribunais: ['TJRS'], inicio: '2026-06-04', fim: '2026-06-04', nome: 'Corpus Christi: feriado municipal em Porto Alegre e nas comarcas que o adotam (depende da comarca)', efeito: 'nao_util', verificacao: 'pendente', fundamento: 'Ato 05/2025 OE (marcado com asterisco: feriado municipal de Porto Alegre)', fonte: 'tjrs-ato-05-2025' },
  { tribunais: ['TJRS'], inicio: '2027-05-27', fim: '2027-05-27', nome: 'Corpus Christi: feriado municipal em Porto Alegre e nas comarcas que o adotam (depende da comarca)', efeito: 'nao_util', verificacao: 'pendente', fundamento: 'Ato 06/2026 OE (marcado com asterisco: feriado municipal de Porto Alegre)', fonte: 'tjrs-ato-06-2026' },

  // ---------- TJBA, 2026: Decreto Judiciário 1050/2025, art. 5º (todos "sem expediente forense", art. 8º prorroga os prazos) ----------
  // Fora: os feriados federais do art. 5º (1/1, 21/4, 1/5, 7/9, 12/10, 2/11, 20/11) e 02/01 (já no recesso do CPC, art. 220).
  ...[
    ['2026-02-12', 'Carnaval (art. 5º, II)', 'tjba-dj-1050-2025', 'Decreto Judiciário TJBA 1050/2025, art. 5º, II'],
    ['2026-02-13', 'Carnaval (art. 5º, II)', 'tjba-dj-1050-2025', 'Decreto Judiciário TJBA 1050/2025, art. 5º, II'],
    ['2026-02-16', 'Carnaval (art. 5º, II)', 'tjba-dj-1050-2025', 'Decreto Judiciário TJBA 1050/2025, art. 5º, II'],
    ['2026-02-17', 'Carnaval (art. 5º, II)', 'tjba-dj-1050-2025', 'Decreto Judiciário TJBA 1050/2025, art. 5º, II'],
    ['2026-02-18', 'Quarta-feira de Cinzas (sem expediente por inteiro)', 'tjba-dj-1050-2025', 'Decreto Judiciário TJBA 1050/2025, art. 5º, II'],
    ['2026-04-02', 'Endoenças (Quinta-feira Santa)', 'tjba-dj-1050-2025', 'Decreto Judiciário TJBA 1050/2025, art. 5º, III'],
    ['2026-04-03', 'Sexta-feira Santa', 'tjba-dj-1050-2025', 'Decreto Judiciário TJBA 1050/2025, art. 5º, III'],
    ['2026-04-20', 'Emenda de Tiradentes', 'tjba-dj-1050-2025', 'Decreto Judiciário TJBA 1050/2025, art. 5º, IV'],
    ['2026-06-04', 'Corpus Christi', 'tjba-dj-1050-2025', 'Decreto Judiciário TJBA 1050/2025, art. 5º, VI'],
    ['2026-06-05', 'Emenda de Corpus Christi', 'tjba-dj-1050-2025', 'Decreto Judiciário TJBA 1050/2025, art. 5º, VI'],
    ['2026-06-22', 'São João', 'tjba-dj-1050-2025', 'Decreto Judiciário TJBA 1050/2025, art. 5º, VII'],
    ['2026-06-23', 'São João', 'tjba-dj-1050-2025', 'Decreto Judiciário TJBA 1050/2025, art. 5º, VII'],
    ['2026-06-24', 'São João', 'tjba-dj-1050-2025', 'Decreto Judiciário TJBA 1050/2025, art. 5º, VII'],
    ['2026-06-29', 'Suspensão dos prazos: jogo da Seleção na Copa do Mundo (expediente das 8h às 11h)', 'tjba-dj-944-2026', 'Decreto Judiciário TJBA 944/2026, art. 3º'],
    ['2026-07-02', 'Independência da Bahia', 'tjba-dj-1050-2025', 'Decreto Judiciário TJBA 1050/2025, art. 5º, VIII'],
    ['2026-07-03', 'Emenda da Independência da Bahia', 'tjba-dj-1050-2025', 'Decreto Judiciário TJBA 1050/2025, art. 5º, VIII'],
    ['2026-08-10', 'Criação dos Cursos Jurídicos, Dia do Magistrado e do Advogado', 'tjba-dj-1050-2025', 'Decreto Judiciário TJBA 1050/2025, art. 5º, IX'],
    ['2026-08-11', 'Criação dos Cursos Jurídicos, Dia do Magistrado e do Advogado', 'tjba-dj-1050-2025', 'Decreto Judiciário TJBA 1050/2025, art. 5º, IX'],
    ['2026-10-30', 'Dia do Servidor Público (transferido de 28/10)', 'tjba-dj-1050-2025', 'Decreto Judiciário TJBA 1050/2025, art. 5º, XII'],
    ['2026-12-07', 'Dia da Justiça (véspera)', 'tjba-dj-1050-2025', 'Decreto Judiciário TJBA 1050/2025, art. 5º, XV'],
    ['2026-12-08', 'Dia da Justiça', 'tjba-dj-1050-2025', 'Decreto Judiciário TJBA 1050/2025, art. 5º, XV']
  ].map(([data, nome, fonte, fundamento]) => ({
    tribunais: ['TJBA'],
    inicio: data,
    fim: data,
    nome,
    efeito: 'nao_util' as const,
    verificacao: 'ato_do_tribunal' as const,
    fundamento,
    fonte: fonte as keyof typeof FONTES_CALENDARIO
  })),

  // ---------- TJDFT, 2026: Portaria Conjunta 105/2025, art. 2º (feriados e pontos facultativos; art. 4º suspende o expediente) ----------
  // Fora: os feriados federais da lista (1/1, 21/4, 1/5, 7/9, 12/10, 2/11, 15/11, 20/11, 25/12) e 30/11, que só vale para os ofícios extrajudiciais (art. 3º).
  ...[
    ['2026-02-16', 'Segunda-feira de Carnaval', 'Portaria Conjunta TJDFT 105/2025, art. 2º, II (Lei 11.697/2008, art. 60)'],
    ['2026-02-17', 'Terça-feira de Carnaval', 'Portaria Conjunta TJDFT 105/2025, art. 2º, II (Lei 11.697/2008, art. 60)'],
    ['2026-02-18', 'Quarta-feira de Cinzas (feriado forense por inteiro)', 'Portaria Conjunta TJDFT 105/2025, art. 2º, II (Lei 11.697/2008, art. 60)'],
    ['2026-04-01', 'Semana Santa (quarta-feira)', 'Portaria Conjunta TJDFT 105/2025, art. 2º, III (Lei 11.697/2008, art. 60)'],
    ['2026-04-02', 'Semana Santa (quinta-feira)', 'Portaria Conjunta TJDFT 105/2025, art. 2º, III (Lei 11.697/2008, art. 60)'],
    ['2026-04-03', 'Sexta-feira Santa', 'Portaria Conjunta TJDFT 105/2025, art. 2º, III (Lei 11.697/2008, art. 60)'],
    ['2026-04-20', 'Ponto facultativo', 'Portaria Conjunta TJDFT 105/2025, art. 2º, IV'],
    ['2026-06-04', 'Corpus Christi (ponto facultativo)', 'Portaria Conjunta TJDFT 105/2025, art. 2º, VII'],
    ['2026-06-05', 'Ponto facultativo', 'Portaria Conjunta TJDFT 105/2025, art. 2º, VIII'],
    ['2026-08-10', 'Ponto facultativo', 'Portaria Conjunta TJDFT 105/2025, art. 2º, IX'],
    ['2026-08-11', 'Feriado forense (Dia do Advogado)', 'Portaria Conjunta TJDFT 105/2025, art. 2º, X (Lei 11.697/2008, art. 60)'],
    ['2026-10-30', 'Dia do Servidor Público (transferido de 28/10)', 'Portaria Conjunta TJDFT 105/2025, art. 2º, XIII'],
    ['2026-12-07', 'Ponto facultativo', 'Portaria Conjunta TJDFT 105/2025, art. 2º, XVII'],
    ['2026-12-08', 'Feriado forense (Dia da Justiça)', 'Portaria Conjunta TJDFT 105/2025, art. 2º, XVIII (Lei 11.697/2008, art. 60)'],
    ['2026-12-24', 'Véspera de Natal', 'Portaria Conjunta TJDFT 105/2025, art. 2º, XIX'],
    ['2026-12-31', 'Véspera de Ano-Novo', 'Portaria Conjunta TJDFT 105/2025, art. 2º, XXI']
  ].map(([data, nome, fundamento]) => ({
    tribunais: ['TJDF'],
    inicio: data,
    fim: data,
    nome,
    efeito: 'nao_util' as const,
    verificacao: 'ato_do_tribunal' as const,
    fundamento,
    fonte: 'tjdft-pc-105-2025' as const
  })),
  // Copa do Mundo 2026 (Portaria Conjunta 48/2026, alterada pela 53/2026): 29/06, jogo às 14h, ponto facultativo; 24/06, jogo às 19h/20h,
  // expediente das 9h às 16h, e os prazos que começam ou terminam nesse dia são prorrogados (art. 2º). 19/06 teve expediente normal (jogo após as 20h).
  { tribunais: ['TJDF'], inicio: '2026-06-29', fim: '2026-06-29', nome: 'Jogo da Seleção na Copa do Mundo (14h): ponto facultativo', efeito: 'nao_util', verificacao: 'ato_do_tribunal', fundamento: 'Portaria Conjunta TJDFT 48/2026, art. 1º, I (redação da Portaria Conjunta 53/2026), e art. 2º', fonte: 'tjdft-pc-48-2026' },
  { tribunais: ['TJDF'], inicio: '2026-06-24', fim: '2026-06-24', nome: 'Jogo da Seleção na Copa do Mundo (19h/20h): expediente das 9h às 16h; prazos que começam ou terminam no dia são prorrogados', efeito: 'expediente_parcial', verificacao: 'ato_do_tribunal', fundamento: 'Portaria Conjunta TJDFT 48/2026, art. 1º, IV, e art. 2º', fonte: 'tjdft-pc-48-2026' },

  // ---------- TJSC, 2026: Resolução GP 1/2026 (compilada), Anexo Único, só as linhas de todo o Estado; Resolução GP 31/2026 (Copa) ----------
  // Fora: os feriados federais do anexo (1/1, 21/4, 1/5, 7/9, 12/10, 2/11, 15/11, 20/11, 25/12) e todos os municipais.
  // Em SC o Dia do Funcionário Público fica em 28/10 (não é transferido para 30/10) e o 11/08 não é feriado forense.
  ...[
    ['2026-02-16', 'Segunda-feira de Carnaval', 'tjsc-res-gp-1-2026', 'Resolução GP TJSC 1/2026, Anexo Único (Res. GP 1/1985)'],
    ['2026-02-17', 'Terça-feira de Carnaval', 'tjsc-res-gp-1-2026', 'Resolução GP TJSC 1/2026, Anexo Único (Res. GP 1/1985)'],
    ['2026-04-02', 'Quinta-feira da Semana Santa', 'tjsc-res-gp-1-2026', 'Resolução GP TJSC 1/2026, Anexo Único (Res. GP 1/1985)'],
    ['2026-04-03', 'Sexta-feira Santa', 'tjsc-res-gp-1-2026', 'Resolução GP TJSC 1/2026, Anexo Único (Res. GP 1/1985)'],
    ['2026-06-04', 'Corpus Christi', 'tjsc-res-gp-1-2026', 'Resolução GP TJSC 1/2026, Anexo Único (Res. GP 1/1985)'],
    ['2026-10-28', 'Dia do Funcionário Público', 'tjsc-res-gp-1-2026', 'Resolução GP TJSC 1/2026, Anexo Único (Res. GP 1/1985)'],
    ['2026-12-08', 'Dia da Justiça (efeitos forenses)', 'tjsc-res-gp-1-2026', 'Resolução GP TJSC 1/2026, Anexo Único']
  ].map(([data, nome, fonte, fundamento]) => ({
    tribunais: ['TJSC'],
    inicio: data,
    fim: data,
    nome,
    efeito: 'nao_util' as const,
    verificacao: 'ato_do_tribunal' as const,
    fundamento,
    fonte: fonte as keyof typeof FONTES_CALENDARIO
  })),
  { tribunais: ['TJSC'], inicio: '2026-02-18', fim: '2026-02-18', nome: 'Quarta-feira de Cinzas: expediente começa às 12h', efeito: 'expediente_parcial', verificacao: 'ato_do_tribunal', fundamento: 'Resolução GP TJSC 13/2022 e Resolução TJ 7/2006, art. 1º (citadas na notícia oficial de 13/02/2026)', fonte: 'tjsc-noticia-carnaval-2026' },
  { tribunais: ['TJSC'], inicio: '2026-06-24', fim: '2026-06-24', nome: 'Jogo da Seleção na Copa do Mundo (19h): expediente das 10h às 17h; começo e vencimento dos prazos postergados', efeito: 'expediente_parcial', verificacao: 'ato_do_tribunal', fundamento: 'Resolução GP TJSC 31/2026, arts. 1º, VI, e 2º', fonte: 'tjsc-res-gp-31-2026' },
  { tribunais: ['TJSC'], inicio: '2026-06-29', fim: '2026-06-29', nome: 'Jogo da Seleção na Copa do Mundo (14h, segundo avisos de outros tribunais): expediente das 8h às 12h pela Res. GP 31/2026; o TJSC não publicou aviso para este dia que eu tenha encontrado', efeito: 'expediente_parcial', verificacao: 'pendente', fundamento: 'Resolução GP TJSC 31/2026, arts. 1º, I, e 2º; horário do jogo extraído de avisos do TJDFT e do TJBA', fonte: 'tjsc-res-gp-31-2026' },

  // ---------- TJPE, 2026: Ato Conjunto 43/2025 (art. 1º e parágrafo único) e Atos 966 e 977/2026 (PJe) ----------
  // Fora: os feriados federais do art. 1º (1/1, 21/4, 1/5, 7/9, 12/10, 2/11, 15/11, 20/11, 25/12), 06/03 (já é regra anual conferida por lei estadual),
  // 02 a 06/01 e 20 a 31/12 (já no recesso do CPC, art. 220) e 16/07 (feriado municipal do Recife). Corpus Christi é 22/06; 04/06 é dia normal.
  ...[
    ['2026-02-16', '2026-02-16', 'Carnaval (segunda-feira)', 'tjpe-ato-conjunto-43-2025', 'Ato Conjunto TJPE 43/2025, art. 1º, II'],
    ['2026-02-17', '2026-02-17', 'Carnaval (terça-feira)', 'tjpe-ato-conjunto-43-2025', 'Ato Conjunto TJPE 43/2025, art. 1º, III'],
    ['2026-02-18', '2026-02-18', 'Quarta-feira de Cinzas (sem expediente por inteiro)', 'tjpe-ato-conjunto-43-2025', 'Ato Conjunto TJPE 43/2025, art. 1º, IV'],
    ['2026-04-02', '2026-04-03', 'Semana Santa (Quinta-feira e Sexta-feira Santa)', 'tjpe-ato-conjunto-43-2025', 'Ato Conjunto TJPE 43/2025, art. 1º, VI e VII'],
    ['2026-05-11', '2026-05-15', 'Prazos suspensos por instabilidade do PJe (11 a 13/05: Ato 966; 14 e 15/05: Ato 977)', 'tjpe-ato-966-2026', 'Atos TJPE 966/2026 e 977/2026, art. 1º'],
    ['2026-06-22', '2026-06-22', 'Corpus Christi (transferido de 04/06)', 'tjpe-ato-conjunto-43-2025', 'Ato Conjunto TJPE 43/2025, art. 1º, XI'],
    ['2026-06-23', '2026-06-30', 'São João e feriados forenses de junho (23, 24 e 25 a 30)', 'tjpe-ato-conjunto-43-2025', 'Ato Conjunto TJPE 43/2025, art. 1º, XII, e parágrafo único (COJE, art. 94)'],
    ['2026-08-10', '2026-08-10', 'Dia dos Cursos Jurídicos (antecipado de 11/08)', 'tjpe-ato-conjunto-43-2025', 'Ato Conjunto TJPE 43/2025, art. 1º, XIII (COJE, art. 94)'],
    ['2026-10-30', '2026-10-30', 'Dia do Servidor Público (transferido de 28/10)', 'tjpe-ato-conjunto-43-2025', 'Ato Conjunto TJPE 43/2025, art. 1º, XVI'],
    ['2026-12-08', '2026-12-08', 'Nossa Senhora da Conceição e Dia da Justiça', 'tjpe-ato-conjunto-43-2025', 'Ato Conjunto TJPE 43/2025, art. 1º, XX']
  ].map(([inicio, fim, nome, fonte, fundamento]) => ({
    tribunais: ['TJPE'],
    inicio,
    fim,
    nome,
    efeito: 'nao_util' as const,
    verificacao: 'ato_do_tribunal' as const,
    fundamento,
    fonte: fonte as keyof typeof FONTES_CALENDARIO
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

  // Feriados civis por lei estadual (Lei 9.093/1995, art. 1º, II: data magna do Estado fixada em lei estadual); CPC, art. 216: feriados declarados em lei
  { tribunais: ['TJPE'], nome: 'Data Magna de Pernambuco (6 de março)', efeito: 'nao_util', verificacao: 'lei_estadual', fundamento: 'Lei estadual PE 16.241/2017, art. 49', fonte: 'pe-lei-16241', quando: { tipo: 'intervalo', de: [3, 6], ate: [3, 6] } },
  { tribunais: ['TJRS'], nome: 'Data magna do Rio Grande do Sul (20 de setembro)', efeito: 'nao_util', verificacao: 'lei_estadual', fundamento: 'Constituição do Estado do RS, art. 6º, parágrafo único; Decreto estadual 36.180/1995', fonte: 'rs-decreto-36180', quando: { tipo: 'intervalo', de: [9, 20], ate: [9, 20] } },
  { tribunais: ['TJGO'], nome: 'Pedra fundamental de Goiânia (24 de outubro)', efeito: 'nao_util', verificacao: 'lei_estadual', fundamento: 'Lei estadual GO 19.850/2017, art. 1º (feriado estadual)', fonte: 'go-lei-19850', quando: { tipo: 'intervalo', de: [10, 24], ate: [10, 24] } },

  { tribunais: ['TJES'], nome: 'Nossa Senhora da Penha (segunda-feira após a oitava da Páscoa)', efeito: 'nao_util', verificacao: 'pendente', fundamento: 'Lei estadual ES 11.010/2019 (texto não lido)', fonte: 'tjes-aviso-penha-2023', quando: { tipo: 'pascoa', deslocamentos: [8] } },

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
  TJAL: { anos: [2026], fontes: ['tjal-an-03-2026', 'tjal-lei-6564'] },
  TJPR: { anos: [2026], fontes: ['tjpr-dj-621-2025', 'tjpr-recesso-2025-2026'] },
  TJRS: { anos: [2026, 2027], fontes: ['tjrs-ato-05-2025', 'tjrs-ato-06-2026', 'tjrs-ato-conjunto-004-2026'] },
  TJBA: { anos: [2026], fontes: ['tjba-dj-1050-2025', 'tjba-dj-944-2026'] },
  TJDF: { anos: [2026], fontes: ['tjdft-pc-105-2025', 'tjdft-pc-48-2026'] },
  TJSC: { anos: [2026], fontes: ['tjsc-res-gp-1-2026', 'tjsc-res-gp-31-2026', 'tjsc-noticia-carnaval-2026'] },
  TJPE: { anos: [2026], fontes: ['tjpe-ato-conjunto-43-2025', 'tjpe-ato-966-2026', 'tjpe-ato-977-2026'] }
};
