/**
 * Calendário forense como DADO: cada evento aponta para a fonte de onde foi lido.
 * Regras do PLANO §1: sem ato e URL o dia fica `pendente`; só versão compilada/texto não tachado.
 * Para incluir um tribunal ou ano: ler o ato, registrar a fonte aqui, listar os eventos e,
 * se o ano estiver completo, declarar a cobertura (o resultado passa a exibir o selo de calendário conferido).
 */
export type EfeitoEvento = 'nao_util' | 'expediente_parcial' | 'ponto_facultativo';
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
  /** Anos em que a regra não vale porque um evento do próprio ano já traz o período lido. */
  exceto?: number[];
  quando:
    | { tipo: 'pascoa'; deslocamentos: number[] }
    | { tipo: 'intervalo'; de: [number, number]; ate: [number, number] };
}

const LIDO = '2026-10-07';
const LIDO_10_10 = '2026-10-10';
const LIDO_12_10 = '2026-10-12';
const LIDO_14_10 = '2026-10-14';
const LIDO_19_10 = '2026-10-19';
const LIDO_28_10 = '2026-10-28';

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
    lido: 'informativo oficial do tribunal (PDF, baixado com a verificação de certificado ligada pelo repositório do Windows; o pacote certifi do script não fecha a cadeia do servidor); diz ser meramente informativo e não substituir a publicação oficial; transcreve a ementa de cada ato, mas os atos em si não foram lidos; só ocorrências de todo o Estado, as de comarca não entram',
    lidoEm: LIDO
  },
  'tjrj-lei-10633': {
    ato: 'Lei estadual RJ nº 10.633/2024 (organização e divisão judiciárias), art. 83: não há expediente aos sábados, domingos e em 8 de dezembro (Dia da Justiça); nos dias declarados ponto facultativo nas repartições públicas estaduais; de segunda a quarta-feira da semana do Carnaval; na quinta e na sexta-feira da Semana Santa; nos feriados nacionais, estaduais e municipais da sede da comarca. § 1º: prazos suspensos de 20/12 a 20/01',
    url: 'https://www.tjrj.jus.br/documents/d/portal-conhecimento/lei_de_organizaca_e_divisao_judiciarias_do_estado_do_rio_de_janeiro_lodj_lei_n_10_633_2024',
    lido: 'texto compilado publicado no portal do TJRJ (PDF): art. 83 lido por inteiro; alterações posteriores da lei não verificadas',
    lidoEm: LIDO_10_10
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
  'tjal-recesso-junho-2026': {
    ato: 'TJAL, notícia oficial de 19/06/2026 sobre o plantão do recesso forense (22 a 30/06/2026, retorno em 1º/07); o ato que fixa o período não foi localizado',
    url: 'https://www.tjal.jus.br/noticia/judiciario-de-alagoas-funciona-em-regime-de-plantao-a-partir-desta-segunda-22/visualizar',
    lido: 'notícia oficial do tribunal, lida por inteiro em 28/10/2026: o plantão começa na segunda (22/06), os prazos ficam suspensos e as atividades voltam em 1º de julho; em 2025 foi de 23 a 30/06 (notícia de 18/06/2025, que cita o art. 37 da Lei 6.564/2005) e em 2024 de 22/06 a 1º/07, então o período varia por ano e não é o intervalo do art. 37',
    lidoEm: '2026-10-28'
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
  },
  'tjce-portaria-2924-2025': {
    ato: 'Portaria nº 2924/2025 da Presidência do TJCE (17/12/2025; DJEA nº 3.690): feriados e pontos facultativos de janeiro de 2026 a janeiro de 2027',
    url: 'https://portal.tjce.jus.br/uploads/2026/04/PORT-FERIADOS-E-PONTO-FACULTATIVO-2026-1776690769.pdf',
    lido: 'inteiro teor (PDF de 3 páginas). Art. 1º e considerandos: as datas do Anexo Único, feriados e pontos facultativos, são dias em que não haverá expediente forense e que impactam a contagem dos prazos (CPC, arts. 219 e 224). Art. 2º: feriados e pontos facultativos municipais seguem a lei de cada município (não entram: CPC, art. 1.003, § 6º). O recesso (20/12/2026 a 06/01/2027) é ponto facultativo, com o efeito do CPC, art. 220',
    lidoEm: LIDO_10_10
  },
  'tjce-portaria-1169-2026': {
    ato: 'Portaria nº 1169/2026 do TJCE (28/05/2026): ponto facultativo em 05/06/2026, dia seguinte a Corpus Christi',
    url: 'https://www.tjce.jus.br/atos_normativos/portaria-no-1169-2026/',
    lido: 'inteiro teor (art. 1º)',
    lidoEm: LIDO_10_10
  },
  'tjce-portaria-1401-2026': {
    ato: 'Portaria nº 1401/2026 do TJCE (23/06/2026): expediente único das 8h às 15h em 24/06/2026, jogo da Seleção na Copa do Mundo',
    url: 'https://www.tjce.jus.br/atos_normativos/portaria-no-1401-2026/',
    lido: 'inteiro teor (art. 1º); o efeito sobre os prazos vem do CPC, art. 224, § 1º (expediente encerrado antes da hora normal)',
    lidoEm: LIDO_10_10
  },
  'tjce-portaria-1440-2026': {
    ato: 'Portaria nº 1440/2026 do TJCE (25/06/2026; disponibilizada em 26/06/2026): expediente único das 8h às 12h em 29/06/2026, jogo da Seleção na Copa do Mundo',
    url: 'https://www.tjce.jus.br/atos_normativos/portaria-no-1440-2026/',
    lido: 'inteiro teor (art. 1º); os considerandos citam o CPC, art. 224, § 1º, para a prorrogação dos prazos',
    lidoEm: LIDO_10_10
  },
  'tjce-portaria-727-2026': {
    ato: 'Portaria nº 727/2026 do TJCE (06/04/2026): ponto facultativo em 13/04/2026 nos órgãos da Comarca de Fortaleza (aniversário da cidade, Lei municipal 7.335/1994)',
    url: 'https://www.tjce.jus.br/atos_normativos/portaria-no-727-2026/',
    lido: 'inteiro teor (art. 1º). Vale só para a Comarca de Fortaleza: depende da comarca, por isso fica pendente',
    lidoEm: LIDO_10_10
  },
  'tjes-an-176-2026': {
    ato: 'Ato Normativo nº 176/2026 da Presidência do TJES (29/09/2026; disponibilizado em 30/09/2026): republica a relação de feriados de 2026 (revoga o Ato 319/2025)',
    url: 'https://www.tjes.jus.br/ato-normativo-no-176-2026-disp-30-09-2026/',
    lido: 'inteiro teor (versão vigente); o texto do Ato 319/2025, que aparece tachado na página, não foi usado. Anexo Único: feriados e pontos facultativos de 2026 (Dia do Servidor transferido de 28 para 30/10 por decisão no SEI 7011080-32.2026.8.08.0000). Art. 1º: o expediente das unidades administrativas é suspenso em 24 e 31/12 (só administrativas, não entram). Art. 3º: 08/09 só em Vitória (municipal, não entra). Art. 4º: os pontos facultativos são compensados com uma hora a mais. As Leis Complementares 234/2002 e 46/1994 e a Lei estadual 11.010/2019 citadas não foram lidas',
    lidoEm: LIDO_10_10
  },
  'tjes-an-124-2026': {
    ato: 'Ato Normativo nº 124/2026 do TJES (15/07/2026): prorroga para o primeiro dia útil os prazos que venceram em 08/07/2026 (indisponibilidade do PJe)',
    url: 'https://www.tjes.jus.br/ato-normativo-no-124-2026-disp-16-07-2026/',
    lido: 'inteiro teor (art. 1º; CNJ, Res. 185/2014, art. 11)',
    lidoEm: LIDO_10_10
  },
  'tjes-an-130-2026': {
    ato: 'Ato Normativo nº 130/2026 do TJES (31/07/2026): prorroga para o primeiro dia útil os prazos que venceram em 31/07/2026 (falhas no PJe)',
    url: 'https://www.tjes.jus.br/ato-normativo-no-130-2026-disp-03-08-2026/',
    lido: 'inteiro teor (art. 1º; CNJ, Res. 185/2014, art. 11)',
    lidoEm: LIDO_10_10
  },
  'tjgo-feriados-2026': {
    ato: 'Calendário oficial "Feriados 2026" do TJGO (versão de 08/06/2026), com base no art. 123 do Regimento Interno (Res. 170/2021) e no art. 91 do COJEG (Lei 21.268/2022); inclui os pontos facultativos de 20/03 (MotoGP), 20/04 e 05/06',
    url: 'https://docs.tjgo.jus.br/institucional/feriados/DOC_feriados_2026_08062026.pdf',
    lido: 'inteiro teor do PDF oficial (2 páginas, versão de 08/06/2026; a de 13/01/2026 não trazia o 20/03): é o calendário publicado pelo tribunal. O próprio PDF diz que as datas podem mudar e que podem ser decretados pontos facultativos ao longo do ano',
    lidoEm: LIDO_10_10
  },
  'tjgo-dj-1738-2026': {
    ato: 'Decreto Judiciário nº 1738/2026 do TJGO (16/04/2026): "o ponto será facultativo para o Poder Judiciário do Estado de Goiás" em 20/04/2026; o art. 2º preserva os plantões para questões urgentes',
    url: 'https://www.tjgo.jus.br/files/2026/04%20-%20Abril/Decreto%20judiciario%201738_2026.pdf',
    lido: 'inteiro teor (PDF de 3 páginas, PROAD 202604000735974). O texto decretado não diz que não há expediente nem trata de prazos; o efeito sobre o expediente vem do art. 91, II, da Lei estadual 21.268/2022 (fonte tjgo-lei-21268-art-91). A notícia do TJGO sobre o decreto diz que o expediente é retomado em 22/04',
    lidoEm: LIDO_10_10
  },
  'tjgo-dj-1130-2026': {
    ato: 'Decreto Judiciário nº 1130/2026 do TJGO (09/03/2026): ponto facultativo em 20/03/2026 (MotoGP em Goiânia), sem alterar os plantões',
    url: 'https://www.tjgo.jus.br/index.php/agencia-de-noticias/noticias-ccs/240-carrossel-tj/35612-tjgo-decreta-ponto-facultativo-no-dia-20-de-marco-em-razao-do-motogp-em-goiania',
    lido: 'só a notícia oficial do TJGO (10/03/2026), aberta pelo navegador do app; o PDF do decreto não foi localizado. A data também consta do calendário oficial (fonte tjgo-feriados-2026)',
    lidoEm: LIDO_10_10
  },
  'tjgo-lei-21268-art-91': {
    ato: 'Lei estadual GO 21.268/2022 (COJEG), art. 91, II: "Não haverá expediente nos órgãos do Poder Judiciário: … nos dias declarados como ponto facultativo pelo Chefe do Poder Judiciário"',
    url: 'https://docs.tjgo.jus.br/institucional/departamentos/recursos_humanos/docs/EXPEDIENTE_FORENSE.pdf',
    lido: 'o artigo como transcrito no documento "Expediente forense" do próprio TJGO (atualizado em 28/5/2025), que cita também o art. 123 do Regimento Interno (Res. 170/2021) com o mesmo teor; a lei e o Regimento em si não foram lidos',
    lidoEm: LIDO_10_10
  },
  'tjgo-dj-3079-2026': {
    ato: 'Decreto Judiciário nº 3079/2026 do TJGO (26/06/2026), que retifica o Decreto 3060/2026: expediente das 7h às 12h em 29/06/2026 (jogo da Seleção na Copa do Mundo)',
    url: 'https://www.tjgo.jus.br/files/2026/06%20-%20Junho/Decreto%20Judiciario_29%20de%20junho.pdf',
    lido: 'inteiro teor (PDF de 2 páginas, PROAD 202606000757428). Art. 2º: os prazos de termo inicial ou final em 29/06 são prorrogados para o primeiro dia útil (CPC, art. 224, § 1º)',
    lidoEm: LIDO_10_10
  },
  'trf1-presi-5-2026': {
    ato: 'Portaria Presi 5/2026 do TRF1 (12/01/2026): feriados nacionais e pontos facultativos da Justiça Federal da 1ª Região em 2026',
    url: 'https://www.trf1.jus.br/trf1/avisos/divulgados-os-feriados-nacionais-e-os-pontos-facultativos-no-ambito-da-1-regiao-em-2026',
    lido: 'texto integral publicado no portal do tribunal (aviso). Feriados estaduais e municipais ficam com o Provimento Geral da Corregedoria Regional e as portarias de cada seção (art. 2º): não entram',
    lidoEm: LIDO_12_10
  },
  'trf2-pres-843-2026': {
    ato: 'Portaria PRES/TRF2 nº 843/2025 (DJE 05/12/2025), alterada pelas Portarias PRES/TRF2 nº 30/2026 (DJE 05/02/2026) e nº 338/2026 (24/06/2026): dias sem expediente no Tribunal em 2026',
    url: 'https://www.trf2.jus.br/jfrj/atendimento/calendario-de-prazos-suspensos-feriados',
    lido: 'inteiro teor das Portarias 843, 30 e 338 (PDFs do tribunal) e página oficial de prazos suspensos e feriados. O art. 1º diz "não haverá expediente" também nos pontos facultativos. Ficam de fora as suspensões que valem só para INSS, AGU ou DPU e os atos de seções e subseções',
    lidoEm: LIDO_12_10
  },
  'trf3-catrf3r-48-2025': {
    ato: 'Portaria CATRF3R nº 48/2025 (29/08/2025), alterada pela nº 58/2026 (07/07/2026), e Portaria CATRF3R nº 53/2026 (20/02/2026): dias sem expediente no Tribunal em 2026',
    url: 'https://www.trf3.jus.br/seju/calendario-dos-feriados',
    lido: 'inteiro teor das Portarias 48, 53, 56, 57 e 58 (PDFs do tribunal). Arts. 1º e 2º da nº 48 dizem "não haverá expediente", inclusive em 20/04 e 05/06. As nº 56 e 57 (jogos da Copa, 24 e 29/06) só autorizam trabalho não presencial e não suspendem prazos',
    lidoEm: LIDO_12_10
  },
  'trf4-calendario-2026': {
    ato: 'Calendário de Feriados 2026 do TRF4 (portal da Justiça Federal da 4ª Região) e Portaria TRF4 nº 233/2026 (20/03/2026): adia para 30/10/2026 o feriado do Dia do Servidor',
    url: 'https://intra2.trf4.jus.br/wp-content/uploads/2026/03/SEI_8319106_Portaria_233.pdf',
    lido: 'inteiro teor da Portaria 233/2026 e página oficial do calendário (linhas "Todas", atualizada em 30/03 e 21/05/2026; https://www.trf4.jus.br/trf4/controlador.php?acao=calendario_feriados_listar&selOrgao=2). Não se achou ato da Presidência com o calendário inteiro. Feriados municipais e de subseção ficam de fora',
    lidoEm: LIDO_12_10
  },
  'trf5-ato-219-2026': {
    ato: 'Ato nº 219/2026 da Presidência do TRF5 (reedita o Ato 626/2025; retificado pelo Ato 230/2026; Diário Eletrônico Administrativo nº 94, 25/05/2026): feriados e pontos facultativos de 2026',
    url: 'https://www4.trf5.jus.br/comunicacao-social/anexo/114877',
    lido: 'inteiro teor (arts. 1º a 5º). O art. 3º diz que nos feriados e pontos facultativos não há expediente. O Ato 498/2026 (28/08/2026), que transfere o Dia do Servidor de 28 para 30/10, só foi visto pela citação em portaria do MPF e não foi lido',
    lidoEm: LIDO_12_10
  },
  'trf6-presi-1-2026': {
    ato: 'Portaria Presi 1/2026 do TRF6 (06/01/2026): feriados e pontos facultativos da Justiça Federal da 6ª Região em 2026',
    url: 'https://portal.trf6.jus.br/wp-content/uploads/2026/01/SEI_1571312_Portaria_Presi_1.pdf',
    lido: 'inteiro teor (PDF de 5 páginas). Os feriados municipais do art. 2º (cidades-sede de subseção) ficam de fora',
    lidoEm: LIDO_12_10
  },
  'tjpa-gp-4765-2025': {
    ato: 'Portaria nº 4765/2025-GP do TJPA (20/10/2025; DJE nº 8186, 21/10/2025): dias sem expediente em 2026 (art. 1º e Anexo; art. 2º transfere o Dia do Servidor de 28 para 30/10)',
    url: 'https://www.tjpa.jus.br/CMSPortal/VisualizarArquivo?idArquivo=2234620',
    lido: 'inteiro teor (PDF digitalizado de 2 páginas, lido como imagem). O art. 1º diz que não haverá expediente nos feriados e pontos facultativos do Anexo; o art. 3º manda aplicar o CPC, art. 224, § 1º. Ficam de fora os atos locais de Belém, Ananindeua e Marituba (por exemplo, a Portaria 4.263/2026-GP, Círio, 09/10/2026) e o recesso de fim de ano, que vem de ato próprio e do CPC, art. 220',
    lidoEm: LIDO_12_10
  },
  'tjma-res-gp-131-2025': {
    ato: 'Resolução-GP nº 131/2025 do TJMA (04/11/2025; DJE de 06/11/2025): dias sem expediente no Judiciário do Maranhão em 2026 (arts. 1º e 3º)',
    url: 'https://novogerenciador.tjma.jus.br/storage/arquivos/resolucoes_2025/resolucao_gp_n_131_de_4_de_novembro_de_2025_05_11_2025_17_12_45.pdf',
    lido: 'inteiro teor (PDF de 2 páginas). O art. 1º lista os dias em que não haverá expediente; o art. 3º lista três pontos facultativos (18/02, 01/04 e 05/06) sem dizer que não haverá expediente, por isso só alertam; o art. 4º diz que os pontos facultativos do Poder Executivo não vinculam o Judiciário. Ficam de fora os feriados municipais (29/06 e 08/09 em São Luís, art. 1º, parágrafo único, e os das comarcas do interior, art. 2º). Atos posteriores não foram lidos: a página de suspensões de expediente do tribunal respondeu 403',
    lidoEm: LIDO_14_10
  },
  'tjmt-pres-1915-2025': {
    ato: 'Portaria TJMT/PRES nº 1915/2025 (05/12/2025; DJe de 09/12/2025): calendário forense oficial do Judiciário de Mato Grosso para 2026 (Anexos I e II)',
    url: 'https://wiki.tjmt.jus.br/images/a/a5/Portaria_1915-2025-PRES_.pdf',
    lido: 'inteiro teor (PDF de 8 páginas, cópia da wiki do tribunal entregue pelo responsável em 14/10/2026, porque o endereço respondia 503; o próprio texto avisa que não substitui o DJe de 09/12/2025). O art. 2º suspende o expediente e os prazos nos feriados e nos pontos facultativos, por isso os pontos facultativos do Anexo I contam; Cinzas tem expediente só a partir das 13h (Portaria 338/2023-PRES, não lida). Ficam de fora os feriados municipais do Anexo II (só na comarca, art. 2º, § 1º; CPC, art. 1.003, § 6º) e 24 e 31/12, que já estão no recesso. O art. 2º, § 2º, avisa que as datas podem mudar durante o ano; atos posteriores não foram lidos',
    lidoEm: LIDO_14_10
  },
  'tjam-portaria-4704-2025': {
    ato: 'Portaria nº 4704/2025 da Presidência do TJAM (11/11/2025; DJe, Caderno Extra, edição 4151): Calendário Judicial de 2026 (itens I a VI e anexo)',
    url: 'https://www.tjam.jus.br/index.php/menu/sala-de-imprensa/15737-tjam-aprova-calendario-judicial-para-2026',
    lido: 'inteiro teor (página do DJe em PDF entregue pelo responsável em 14/10/2026; a notícia do tribunal só serviu para achar o endereço). O item III prorroga os prazos que começam ou terminam em ponto facultativo ou feriado para o primeiro dia útil seguinte, por isso os pontos facultativos contam como dia sem expediente. Ficam de fora os feriados municipais (item IV: só na comarca; 24/10, Manaus, cai num sábado) e os dias que caem em sábado (04/07 e 05/09). O item V avisa que as datas podem mudar durante o ano e o VI que outras suspensões dependem de ato do Presidente; atos posteriores não foram lidos',
    lidoEm: LIDO_14_10
  },
  'tjms-feriados-2026': {
    ato: 'Página oficial "Feriados Forenses 2026" do TJMS, que cita a Portaria nº 983/2025 (DJ nº 5775, de 12/12/2025) e as leis municipais',
    url: 'https://www.tjms.jus.br/institucional/feriados',
    lido: 'página inteira lida em 14/10/2026 pelo script de acesso; a Portaria 983/2025 em si não foi lida. A página diz "não há expediente" em 02 e 03/04 (art. 164, § 2º, do CODJ) e lista como feriado 16 e 17/02, 04/06, 11/08, 30/10 (Dia do Servidor) e 08/12. 18/02 (Cinzas) vem sem efeito dito e 20/04, 05/06, 10/08 e 07/12 vêm só como ponto facultativo, sem dizer que não há expediente: alertam. Ficam de fora os feriados municipais (só na comarca; CPC, art. 1.003, § 6º). 20 a 31/12 é feriado forense (art. 268 do CODJ) e já está no recesso',
    lidoEm: LIDO_14_10
  },
  'tjro-ato-2579-2025': {
    ato: 'Ato nº 2579/2025 da Presidência do TJRO (25/11/2025; DJE nº 218, p. 18-20), na versão compilada com os Atos 2942/2025, 657, 782, 1255, 1720 e 2168/2026: feriados e pontos facultativos de 2026',
    url: 'https://atos.tjro.jus.br/detalhar/6114',
    lido: 'inteiro teor, texto compilado da página de atos do tribunal (arts. 1º a 6º e Anexo Único), lido em 14/10/2026 pelo script de acesso e conferido com a página de feriados de 2026 do tribunal (https://www.tjro.jus.br/feriados-locais/feriados-2026); os PDFs original e compilado não foram abertos. O art. 1º diz que não haverá expediente forense e administrativo nos feriados e pontos facultativos do anexo e o art. 5º prorroga para o primeiro dia útil os prazos que começam ou vencem nesses dias, por isso os pontos facultativos contam. O Dia da Justiça foi transferido de 08/12 para 07/12 (art. 3º-C, Ato 2168/2026), o Dia do Advogado de 11/08 para 10/08 e o Dia do Servidor de 28/10 para 30/10 (art. 3º, Ato 657/2026). Ficam de fora os feriados municipais (só na comarca ou no Fórum Digital, art. 1º, § 2º; CPC, art. 1.003, § 6º), 24 e 31/12 (recesso de 20/12 a 06/01) e 02/01. O art. 4º permite novos pontos facultativos durante o ano; atos posteriores ao 2168/2026 não foram lidos. Horário de funcionamento do público (7h às 14h) pela página do tribunal',
    lidoEm: LIDO_14_10
  },
  'tjpb-ato-conjunto-9-2026': {
    ato: 'Ato Conjunto TJPB/MPPB/DPE nº 9/2026 (DJe de 16/10/2026): transfere o feriado do Dia do Servidor Público de 28 para 30/10/2026 e altera o Anexo Único do Ato Conjunto nº 04/2025',
    url: 'https://www.tjpb.jus.br/w/ato-conjunto-transfere-o-feriado-do-dia-do-servidor-p%C3%BAblico-de-28-para-o-dia-30-de-outubro',
    lido: 'notícia oficial do tribunal de 16/10/2026, lida por inteiro em 28/10/2026 pelo navegador do app (o script recebe 403): transcreve o art. 1º ("Fica transferido para o dia 30 de outubro de 2026 (sexta-feira) o feriado do dia 28 de outubro de 2026") e confirma que o ato altera o Anexo Único do Ato Conjunto nº 04/2025. O texto do ato em si (primeira página do DJe de 16/10/2026) não foi lido, e a página de calendário do tribunal ainda mostra 28/10. 30/10 conta como dia sem expediente e 28/10 volta a ser dia útil (decisão do revisor em 19/10/2026)',
    lidoEm: LIDO_28_10
  },
  'tjpb-calendario-2026': {
    ato: 'Calendário 2026 do Tribunal de Justiça da Paraíba (documento ilustrado do tribunal, 17 páginas, com legenda mensal)',
    url: 'https://www.tjpb.jus.br/',
    lido: 'PDF "Calendario_2026.pdf" entregue pelo responsável em 14/10/2026; as 12 páginas dos meses foram vistas em imagem (dias em vermelho sem expediente, em azul expediente alterado). Não é o ato normativo: nenhuma portaria do tribunal foi lida. Os dias que o próprio calendário chama de "Ponto Facultativo" (inclusive Carnaval, Semana Santa, Corpus Christi, São João e os "compensados") só alertam, porque o calendário não diz que não haverá expediente e os compensa com horas em outros dias. Contam, por decisão do responsável em 14/10/2026, os dias em vermelho sem rótulo de ponto facultativo: 18/02 (Cinzas) e 28/10 (Dia do Servidor), além do feriado de 03/04, 05/08 (feriado estadual, Data Magna), 11/08 (Fundação dos Cursos Jurídicos) e 08/12 (Dia da Justiça). Expediente das 7h às 13h em 11/02 e 01/04. As páginas de feriados municipais das comarcas (15 e 16) não foram conferidas: municipais ficam fora (CPC, art. 1.003, § 6º). Recesso de 20/12 a 06/01 já está no recesso do CPC',
    lidoEm: LIDO_14_10
  },
  'tjrn-pc-02-2026': {
    ato: 'Portaria Conjunta nº 02/2026 da Presidência e da Corregedoria-Geral do TJRN (15/01/2026; republicada no DJe nº 763, de 16/01/2026, por incorreção no original): feriados e pontos facultativos de 2026',
    url: 'https://www.tjrn.jus.br/',
    lido: 'inteiro teor (edição do DJe nº 763 em PDF de 2 páginas, entregue pelo responsável em 14/10/2026). O art. 1º divulga os feriados e estabelece os pontos facultativos, mas não diz que não haverá expediente nos pontos facultativos. Contam os dias que o ato funda na Lei Complementar estadual 643/2018, art. 97, § 3º (Carnaval, Cinzas, Semana Santa de 01 a 03/04, e as antecipações do Dia do Advogado em 10/08 e do Dia da Justiça em 07/12) e o Dia do Servidor em 30/10 (LC estadual 122/1994, art. 230; decisão do responsável em 14/10/2026, a mesma do TJPB). Alertam 04/06 (o ato diz "ponto facultativo"), 20/04 e 05/06 (só citam o Decreto estadual 35.209/2025, não lido, que trata de pontos facultativos do Executivo) e 29/06 (São Pedro, sem fundamento citado). O § 2º trata os feriados municipais (só na comarca; fora, CPC, art. 1.003, § 6º). 24 e 31/12 e o feriado forense de 20/12 a 06/01 já estão no recesso. Atos posteriores não foram lidos',
    lidoEm: LIDO_14_10
  },
  'tjac-presi-6569-2025': {
    ato: 'Portaria PRESI nº 6569/2025 do TJAC (Presidência; assinada em 30/01/2026; DJe nº 7.950, de 03/02/2026, p. 18-19): calendário de feriados, pontos facultativos e suspensão de expediente de 2026',
    url: 'https://webdev.tjac.jus.br/wp-content/uploads/2025/12/Portaria_PRESI_TJAC_6569_2025.pdf',
    lido: 'inteiro teor (PDF de 7 páginas, lido em 14/10/2026 pelo script de acesso; as tabelas mensais foram conferidas em imagem). O art. 1º institui o calendário com base no Decreto estadual 11.809/2025 (calendário do Executivo, não lido) e o art. 3º trata da convocação de servidores nos dias "declarados como facultativos" com compensação de horas; o ato não diz que não haverá expediente nos pontos facultativos, por isso 04/06 (Corpus Christi) e 06/08 (Início da Revolução Acreana), pontos facultativos estaduais, só alertam. Contam os feriados estaduais, forenses e regimentais da tabela: 22/01 (Dia do Católico, comemoração do dia 20 adiada para o dia 22) e 23/01 (Dia do Evangélico), 16, 17 e 18/02, 02 e 03/04, 15/06 (Aniversário do Estado), 11/08 (Dia do Advogado), 30/10 (Dia do Servidor, comemoração do dia 28 adiada para o dia 30), 19/11 (Tratado de Petrópolis, comemoração do dia 17 adiada para o dia 19) e 08/12 (Dia da Justiça). Ficam de fora os feriados e pontos facultativos municipais (art. 2º: só na comarca), 24 e 31/12 e os dias que caem em sábado ou domingo. Atos posteriores não foram lidos',
    lidoEm: LIDO_14_10
  },
  'tjrr-pr-1558-2025': {
    ato: 'Portaria TJRR/PR nº 1558/2025 (19/12/2025; DJe nº 8006, de 22/12/2025, p. 3-5): feriados e pontos facultativos de 2026 nas comarcas de Roraima (Anexo Único)',
    url: 'https://diario.tjrr.jus.br/dpj/dpj-20251222.pdf',
    lido: 'inteiro teor (portaria e Anexo Único no DJe de 22/12/2025, lidos em 14/10/2026 pelo script de acesso; a tabela foi conferida em imagem). O art. 3º suspende o expediente e os prazos processuais nos feriados e nos pontos facultativos do anexo, por isso os pontos facultativos contam. Valem as linhas de "Todas as Comarcas": 16 a 18/02 (Carnaval e Cinzas), 01 a 03/04 (Semana Santa), 20/04, 04 e 05/06, 10 e 11/08 (Dia dos Magistrados), 05/10 (Aniversário do Estado), 28/10 (Dia do Servidor), 07 e 08/12. Ficam de fora as linhas da Comarca de Boa Vista (19 e 20/01, 29/06, 09 e 10/07) e os feriados dos municípios do interior (parte b do anexo): feriado municipal não conta (CPC, art. 1.003, § 6º). 01 a 06/01 e 20 a 31/12 são recesso forense e já estão no recesso. O art. 2º manda comunicar feriados e pontos facultativos decretados depois, que não constam do anexo; atos posteriores não foram lidos',
    lidoEm: LIDO_14_10
  },
  'tjap-calendario-2026': {
    ato: 'Calendário 2026 do TJAP na página de consultas do tribunal (com dias de "Expediente Suspenso - Portaria 77918/2026-GP")',
    url: 'https://old.tjap.jus.br/app/open/consultas/?task=cal',
    lido: 'página inteira lida em 14/10/2026 pelo script de acesso e a classificação de cada dia (feriado nacional, estadual, regimental, expediente suspenso, ponto facultativo) conferida no HTML. O texto da Portaria 77918/2026-GP não foi lido, mas o comunicado da Secom/TJAP de 19/01/2026 (republicado no Jusbrasil, que o marca como fonte possivelmente não jornalística) descreve o conteúdo e bate com a página: a portaria suspende o expediente em 20/03, 20/04, 05/06, 10/08 e 07/12/2026, com plantão e prazos prorrogados para o primeiro dia útil seguinte; transfere o ponto facultativo do Dia do Servidor de 28 para 30/10 (mantém expediente normal e prazos em 28/10); e, nos jogos da Seleção nas eliminatórias da Copa, permite encerrar o expediente às 12h30 sem prejuízo dos prazos. Contam os dias de feriado nacional, estadual e regimental e de "Expediente Suspenso" (20/03, 20/04, 05/06, 10/08 e 07/12); alertam os que a legenda chama de "Ponto Facultativo" (04/06 Corpus Christi, 30/10 Dia do Servidor, "alteração" pela Portaria 77918/26, e 30/11 Dia do Evangélico). Ficam de fora os feriados municipais, os dias em que a legenda só recomenda não marcar audiência (19/05, Defensoria, e 14/12, Ministério Público), os dias em fim de semana (01/11 e 13/09) e 24 e 31/12 (recesso)',
    lidoEm: LIDO_28_10
  },
  'tjto-portaria-3741-2025': {
    ato: 'Portaria nº 3741/2025 do TJTO: calendário de feriados e pontos facultativos de 2026 (publicada no Diário da Justiça; calendário na notícia oficial de 10/11/2025)',
    url: 'https://www.tjto.jus.br/comunicacao/noticias/tjto-publica-calendario-de-feriados-e-pontos-facultativos-para-2026',
    lido: 'notícia oficial do tribunal com o calendário completo, lida em 14/10/2026 pelo script de acesso; a Portaria 3741/2025 em si não foi lida (o diário em wwa.tjto.jus.br falha no handshake TLS por chave DH fraca, e o PDF do calendário na página de feriados devolve a mesma notícia). A notícia não diz que não há expediente nos pontos facultativos: 20/04, 04/06, 05/06 e 10/08 alertam. Contam o Carnaval (16 e 17/02), a Semana Santa (01 a 03/04; LC estadual 10/1996, art. 110), 11/08, 08/09 (Padroeira do Tocantins), 05/10 (Criação do Estado), o Dia do Servidor transferido para 30/10 e o Dia da Justiça transferido para 18/12. Quarta-feira de Cinzas não consta. Ficam de fora os feriados municipais (19/03 e 20/05 em Palmas e os do interior; CPC, art. 1.003, § 6º) e 15/08 (sábado)',
    lidoEm: LIDO_14_10
  },
  'tjpi-provimento-59-2025': {
    ato: 'Provimento nº 59/2025 - PJPI/TJPI/SECPRE (Presidência; assinado em 14/11/2025): recesso forense, feriados e pontos facultativos de 2026 e suspensão de prazos nos dias sem expediente',
    url: 'https://www.tjpi.jus.br/',
    lido: 'inteiro teor (cópia do texto no Portal da Transparência do TJPI, em PDF entregue pelo responsável em 14/10/2026; o próprio texto avisa que não substitui o publicado no Diário Oficial da Justiça). O art. 1º diz que não haverá expediente forense em 16, 17 e 18/02 (Carnaval e Cinzas), na Semana Santa (Quinta-feira Santa a Domingo de Páscoa: 02 e 03/04 em dia útil), 04/06 (Corpus Christi), 11/08, 19/10 (Dia do Piauí, Lei estadual 176/1937), 28/10 (Dia do Servidor, LC estadual 13/1994, art. 201) e 08/12, além dos feriados nacionais; o art. 5º prorroga para o primeiro dia útil os prazos que começam ou vencem nesses dias. O parágrafo único do art. 1º e o art. 7º deixam os pontos facultativos a cargo da Presidência: nenhum consta do provimento, e os 4 pontos facultativos de 2026 (20/04, 05/06, 10/08 e 07/12) vieram depois, na Portaria 169/2026, lida em 19/10/2026 (fonte própria). Fora: feriados municipais (art. 1º, X, e art. 4º; CPC, art. 1.003, § 6º) e 14/12 (art. 3º: só atos que dependem do Ministério Público). O art. 2º suspende os prazos de 07 a 20/01/2026, já coberto pelo recesso do CPC (art. 220). Atos posteriores não foram lidos',
    lidoEm: LIDO_14_10
  },
  'tjpi-portaria-169-2026': {
    ato: 'Portaria (Presidência e Corregedoria-Geral) nº 169/2026 - PJPI/TJPI/SECPRE (assinada em 22 e 26/01/2026): pontos facultativos de 2026',
    url: 'https://www.tjpi.jus.br/',
    lido: 'inteiro teor (Diário da Justiça do Estado do Piauí nº 10216, disponibilizado em 26/01/2026 e publicado em 27/01/2026, item 1.14, PDF entregue pelo responsável em 19/10/2026). O art. 1º estabelece pontos facultativos em 20/04 (por causa de Tiradentes), 05/06 (Corpus Christi), 10/08 (Cursos Jurídicos) e 07/12 (Dia da Justiça); o art. 2º diz que não haverá expediente nesses dias e o art. 7º suspende os prazos que comecem ou terminem neles, com retorno no primeiro dia útil seguinte. Por isso os quatro dias contam como dia sem expediente',
    lidoEm: LIDO_19_10
  },
  'tjse-portarias-normativas-2026': {
    ato: 'Portarias Normativas da Presidência do TJSE que declaram pontos facultativos em 2026: nº 10/2026 (16 e 18/02), 18/2026 (02/04), 24/2026 (20/04), 46/2026 (05/06), 52/2026 (29/06) e 72/2026 (10/08), publicadas no Diário da Justiça e comunicadas pela Agência de Notícias do tribunal',
    url: 'https://agencia.tjse.jus.br/noticias/item/16541-tiradentes-ponto-facultativo-e-feriado',
    lido: 'comunicados oficiais da Agência de Notícias do TJSE (12/02, 31/03, 15/04, 02/06, 25/06 e 04/08/2026), lidos por inteiro em 28/10/2026 pelo navegador do app; as portarias em si (Diário da Justiça) não foram lidas. Os comunicados dizem que nesses dias não haverá expediente (quando citam: "em todas unidades judiciais da capital e interior") ou que o tribunal fica em plantão, e que os prazos processuais são prorrogados até o primeiro dia útil seguinte (CPC, art. 219). Por isso 16/02, 18/02, 02/04, 20/04, 05/06, 29/06 e 10/08 contam como dia sem expediente. 07/12 e 14/12 seguem como alerta: nenhuma portaria foi encontrada. 16/03 (Portaria Normativa 16/2026) vale só na Comarca de Aracaju e continua fora',
    lidoEm: LIDO_28_10
  },
  'tjse-calendario-2026': {
    ato: 'Calendário 2026 das Comarcas de Aracaju e do interior do Estado e respectivos distritos, do TJSE (documento do tribunal, PDF "Calendário 2026 - Desa. Iolanda", com feriados e "previsão de pontos facultativos" por mês)',
    url: 'https://www.tjse.jus.br/',
    lido: 'PDF inteiro entregue pelo responsável em 14/10/2026. Não é o ato normativo: nenhuma portaria foi lida. Contam os dias da coluna de feriados que não indicam município: 17/02 (Carnaval), 03/04 (Paixão de Cristo), 04/06 (Corpus Christi), 24/06 (festejos juninos, São João), 08/07 (Emancipação Política de Sergipe), 11/08 (Dia do Magistrado), 30/10 (Dia do Funcionário Público) e 08/12 (Dia da Justiça). Alertam os da coluna "previsão de pontos facultativos" que ainda não tiveram portaria: 07/12; e 14/12 (Dia do Ministério Público), que vem como feriado sem município mas é data própria do Ministério Público. Fora: os feriados com município (Comarcas e distritos), 16/03 (ponto facultativo só na Comarca de Aracaju e no Tribunal) e o recesso de 20/12 a 06/01',
    lidoEm: LIDO_14_10
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

const EVENTOS_BASE: EventoCalendario[] = [
  // ---------- STF e STJ, 2026 ----------
  ...PF_2026.map(pf => ({
    tribunais: ['STJ'],
    inicio: pf.data,
    fim: pf.data,
    nome: pf.nome,
    efeito: (pf.parcial ? 'expediente_parcial' : 'ponto_facultativo') as EfeitoEvento,
    verificacao: 'ato_do_tribunal' as const,
    fundamento: 'Portaria STJ/GDG 1.010/2025, art. 1º',
    fonte: 'stj-gdg-1010' as const
  })),
  ...PF_2026.map(pf => ({
    tribunais: ['STF'],
    inicio: pf.data,
    fim: pf.data,
    nome: pf.nome,
    efeito: (pf.parcial ? 'expediente_parcial' : 'ponto_facultativo') as EfeitoEvento,
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
    ['2026-02-13', 'Ponto facultativo antes do Carnaval: expediente e prazos suspensos, Ato Executivo 20/2026 (Lei 10.633/2024, art. 83, II)'],
    ['2026-02-16', 'Carnaval (Lei 10.633/2024, art. 83, III)'],
    ['2026-02-17', 'Carnaval (Lei 10.633/2024, art. 83, III)'],
    ['2026-02-18', 'Quarta-feira de Cinzas (Lei 10.633/2024, art. 83, III)'],
    ['2026-02-27', 'Suspensão de prazos por chuvas na 1ª e 2ª instâncias, Ato Executivo 60/2026'],
    ['2026-03-27', 'Prorrogação dos prazos de processos eletrônicos (indisponibilidade do sistema), Ato Executivo 73/2026'],
    ['2026-04-02', 'Semana Santa (Lei 10.633/2024, art. 83, IV)'],
    ['2026-04-03', 'Sexta-feira da Paixão (Lei 10.633/2024, art. 83, IV)'],
    ['2026-04-23', 'Dia de São Jorge (Lei estadual 5.198/2008)'],
    ['2026-04-24', 'Ponto facultativo: expediente e prazos suspensos, Ato Executivo 79/2026 (Lei 10.633/2024, art. 83, II)'],
    ['2026-06-04', 'Corpus Christi (Lei estadual 11.002/2025)'],
    ['2026-06-05', 'Ponto facultativo: expediente e prazos suspensos, Ato Executivo 91/2026 (Lei 10.633/2024, art. 83, II)'],
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

  // ---------- TJCE, 2026: Portaria 2924/2025 (Anexo Único) e Portarias 1169, 1401, 1440 e 727/2026 ----------
  // Fora: os feriados federais do anexo (21/4, 1/5, 7/9, 12/10, 2/11, 20/11) e o recesso (20/12 a 06/01, já no CPC, art. 220).
  ...[
    ['2026-02-16', 'Carnaval (ponto facultativo, sem expediente forense)', 'tjce-portaria-2924-2025', 'Portaria TJCE 2924/2025, Anexo Único (fevereiro)'],
    ['2026-02-17', 'Carnaval (ponto facultativo, sem expediente forense)', 'tjce-portaria-2924-2025', 'Portaria TJCE 2924/2025, Anexo Único (fevereiro)'],
    ['2026-03-19', 'Dia de São José (ponto facultativo, sem expediente forense)', 'tjce-portaria-2924-2025', 'Portaria TJCE 2924/2025, Anexo Único (março)'],
    ['2026-03-25', 'Data Magna do Ceará (feriado estadual, EC estadual 73/2011)', 'tjce-portaria-2924-2025', 'Portaria TJCE 2924/2025, Anexo Único (março)'],
    ['2026-04-02', 'Quinta-feira Santa (ponto facultativo, sem expediente forense)', 'tjce-portaria-2924-2025', 'Portaria TJCE 2924/2025, Anexo Único (abril)'],
    ['2026-04-03', 'Sexta-feira Santa (ponto facultativo, sem expediente forense)', 'tjce-portaria-2924-2025', 'Portaria TJCE 2924/2025, Anexo Único (abril)'],
    ['2026-06-04', 'Corpus Christi (ponto facultativo, sem expediente forense)', 'tjce-portaria-2924-2025', 'Portaria TJCE 2924/2025, Anexo Único (junho)'],
    ['2026-06-05', 'Ponto facultativo no dia seguinte a Corpus Christi', 'tjce-portaria-1169-2026', 'Portaria TJCE 1169/2026, art. 1º'],
    ['2026-10-28', 'Dia do Servidor Público Estadual', 'tjce-portaria-2924-2025', 'Portaria TJCE 2924/2025, Anexo Único (outubro)'],
    ['2026-12-08', 'Dia da Justiça (feriado, Lei estadual 12.342/1994)', 'tjce-portaria-2924-2025', 'Portaria TJCE 2924/2025, Anexo Único (dezembro)']
  ].map(([data, nome, fonte, fundamento]) => ({
    tribunais: ['TJCE'],
    inicio: data,
    fim: data,
    nome,
    efeito: 'nao_util' as const,
    verificacao: 'ato_do_tribunal' as const,
    fundamento,
    fonte: fonte as keyof typeof FONTES_CALENDARIO
  })),
  { tribunais: ['TJCE'], inicio: '2026-02-18', fim: '2026-02-18', nome: 'Quarta-feira de Cinzas: ponto facultativo até as 14h; expediente normal a partir das 14h', efeito: 'expediente_parcial', verificacao: 'ato_do_tribunal', fundamento: 'Portaria TJCE 2924/2025, Anexo Único (fevereiro); CPC, art. 224, § 1º', fonte: 'tjce-portaria-2924-2025' },
  { tribunais: ['TJCE'], inicio: '2026-06-24', fim: '2026-06-24', nome: 'Jogo da Seleção na Copa do Mundo (19h): expediente único das 8h às 15h', efeito: 'expediente_parcial', verificacao: 'ato_do_tribunal', fundamento: 'Portaria TJCE 1401/2026, art. 1º; CPC, art. 224, § 1º', fonte: 'tjce-portaria-1401-2026' },
  { tribunais: ['TJCE'], inicio: '2026-06-29', fim: '2026-06-29', nome: 'Jogo da Seleção na Copa do Mundo (14h): expediente único das 8h às 12h', efeito: 'expediente_parcial', verificacao: 'ato_do_tribunal', fundamento: 'Portaria TJCE 1440/2026, art. 1º e considerandos; CPC, art. 224, § 1º', fonte: 'tjce-portaria-1440-2026' },
  { tribunais: ['TJCE'], inicio: '2026-04-13', fim: '2026-04-13', nome: 'Aniversário de Fortaleza: ponto facultativo só nos órgãos da Comarca de Fortaleza (depende da comarca)', efeito: 'nao_util', verificacao: 'pendente', fundamento: 'Portaria TJCE 727/2026, art. 1º (Lei municipal 7.335/1994)', fonte: 'tjce-portaria-727-2026' },

  // ---------- TJES, 2026: Ato Normativo 176/2026 (Anexo Único) e Atos 124 e 130/2026 ----------
  // Fora: os feriados federais do anexo (21/4, 1/5, 7/9, 12/10, 2/11, 15/11, 20/11), o recesso (01 a 06/01 e 20 a 31/12, CPC, art. 220),
  // 24 e 31/12 (só unidades administrativas), 08/09 (Vitória) e os atos de comarcas e unidades específicas (por exemplo, 043, 112 e 177/2026).
  ...[
    ['2026-02-16', 'Carnaval (segunda-feira)', 'Ato Normativo TJES 176/2026, Anexo Único (LC estadual 234/2002, art. 141, b)'],
    ['2026-02-17', 'Carnaval (terça-feira)', 'Ato Normativo TJES 176/2026, Anexo Único (LC estadual 234/2002, art. 141, b)'],
    ['2026-02-18', 'Quarta-feira de Cinzas (listada como feriado)', 'Ato Normativo TJES 176/2026, Anexo Único (LC estadual 234/2002, art. 141, b)'],
    ['2026-04-02', 'Quinta-feira da Semana Santa', 'Ato Normativo TJES 176/2026, Anexo Único (LC estadual 234/2002, art. 141, a)'],
    ['2026-04-03', 'Sexta-feira da Semana Santa', 'Ato Normativo TJES 176/2026, Anexo Único (LC estadual 234/2002, art. 141, a)'],
    ['2026-04-13', 'Nossa Senhora da Penha', 'Ato Normativo TJES 176/2026, Anexo Único (Lei estadual 11.010/2019, art. 1º)'],
    ['2026-04-20', 'Ponto facultativo', 'Ato Normativo TJES 176/2026, Anexo Único'],
    ['2026-06-04', 'Corpus Christi (ponto facultativo onde não houver lei municipal)', 'Ato Normativo TJES 176/2026, art. 2º e Anexo Único'],
    ['2026-06-05', 'Ponto facultativo', 'Ato Normativo TJES 176/2026, Anexo Único'],
    ['2026-08-10', 'Ponto facultativo', 'Ato Normativo TJES 176/2026, Anexo Único'],
    ['2026-08-11', 'Dia do Advogado', 'Ato Normativo TJES 176/2026, Anexo Único (LC estadual 234/2002, art. 141, d)'],
    ['2026-10-30', 'Dia do Servidor Público (transferido de 28/10)', 'Ato Normativo TJES 176/2026, considerandos e Anexo Único'],
    ['2026-12-07', 'Ponto facultativo', 'Ato Normativo TJES 176/2026, Anexo Único'],
    ['2026-12-08', 'Dia da Justiça', 'Ato Normativo TJES 176/2026, Anexo Único (LC estadual 234/2002, art. 141, d)']
  ].map(([data, nome, fundamento]) => ({
    tribunais: ['TJES'],
    inicio: data,
    fim: data,
    nome,
    efeito: 'nao_util' as const,
    verificacao: 'ato_do_tribunal' as const,
    fundamento,
    fonte: 'tjes-an-176-2026' as const
  })),
  { tribunais: ['TJES'], inicio: '2026-07-08', fim: '2026-07-08', nome: 'Indisponibilidade do PJe: prazos que venceram no dia prorrogados para o primeiro dia útil', efeito: 'expediente_parcial', verificacao: 'ato_do_tribunal', fundamento: 'Ato Normativo TJES 124/2026, art. 1º (CNJ, Res. 185/2014, art. 11)', fonte: 'tjes-an-124-2026' },
  { tribunais: ['TJES'], inicio: '2026-07-31', fim: '2026-07-31', nome: 'Falhas no PJe: prazos que venceram no dia prorrogados para o primeiro dia útil', efeito: 'expediente_parcial', verificacao: 'ato_do_tribunal', fundamento: 'Ato Normativo TJES 130/2026, art. 1º (CNJ, Res. 185/2014, art. 11)', fonte: 'tjes-an-130-2026' },

  // ---------- TJGO, 2026: calendário oficial (PDF de 08/06/2026), Decretos Judiciários 1130, 1738 e 3079/2026 e Lei 21.268/2022, art. 91 ----------
  // Fora: os feriados federais do calendário (21/4, 1/5, 7/9, 12/10, 2/11, 15/11, 20/11, 25/12), o recesso (20/12 a 06/01, CPC, art. 220), 24/05 (domingo e
  // municipal), 26/07 e 24/10 (domingo e sábado; 24/10 já é regra anual por lei estadual) e todos os feriados municipais das comarcas.
  ...[
    ['2026-02-16', 'Carnaval (segunda-feira)', 'Calendário oficial TJGO 2026 (Regimento Interno, art. 123)'],
    ['2026-02-17', 'Carnaval (terça-feira)', 'Calendário oficial TJGO 2026 (Regimento Interno, art. 123)'],
    ['2026-04-01', 'Semana Santa (quarta-feira)', 'Calendário oficial TJGO 2026 (Regimento Interno, art. 123)'],
    ['2026-04-02', 'Semana Santa (quinta-feira)', 'Calendário oficial TJGO 2026 (Regimento Interno, art. 123)'],
    ['2026-04-03', 'Sexta-feira Santa', 'Calendário oficial TJGO 2026 (Regimento Interno, art. 123)'],
    ['2026-06-04', 'Corpus Christi', 'Calendário oficial TJGO 2026'],
    ['2026-10-28', 'Dia do Servidor Público (feriado estadual, Lei estadual 20.756/2020)', 'Calendário oficial TJGO 2026'],
    ['2026-12-08', 'Dia da Justiça', 'Calendário oficial TJGO 2026 (Regimento Interno, art. 123)']
  ].map(([data, nome, fundamento]) => ({
    tribunais: ['TJGO'],
    inicio: data,
    fim: data,
    nome,
    efeito: 'nao_util' as const,
    verificacao: 'ato_do_tribunal' as const,
    fundamento,
    fonte: 'tjgo-feriados-2026' as const
  })),
  // Pontos facultativos: contam como dia sem expediente porque a lei estadual diz que não há expediente nos dias declarados ponto facultativo pelo Chefe do
  // Poder Judiciário (exceção do revisor jurídico: o ato prevê expressamente a ausência de expediente). Os plantões para questões urgentes continuam.
  { tribunais: ['TJGO'], inicio: '2026-03-20', fim: '2026-03-20', nome: 'Ponto facultativo em todo o Poder Judiciário estadual (MotoGP em Goiânia): sem expediente', efeito: 'nao_util', verificacao: 'ato_do_tribunal', fundamento: 'Decreto Judiciário TJGO 1.130/2026 (só a notícia oficial foi lida); Lei estadual GO 21.268/2022, art. 91, II (não haverá expediente nos dias declarados ponto facultativo pelo Chefe do Poder Judiciário)', fonte: 'tjgo-dj-1130-2026' },
  { tribunais: ['TJGO'], inicio: '2026-04-20', fim: '2026-04-20', nome: 'Ponto facultativo em todo o Poder Judiciário estadual (véspera de Tiradentes): sem expediente', efeito: 'nao_util', verificacao: 'ato_do_tribunal', fundamento: 'Decreto Judiciário TJGO 1.738/2026, art. 1º; Lei estadual GO 21.268/2022, art. 91, II (não haverá expediente nos dias declarados ponto facultativo pelo Chefe do Poder Judiciário)', fonte: 'tjgo-dj-1738-2026' },
  { tribunais: ['TJGO'], inicio: '2026-06-05', fim: '2026-06-05', nome: 'Ponto facultativo em todo o Poder Judiciário estadual (após Corpus Christi): sem expediente', efeito: 'nao_util', verificacao: 'ato_do_tribunal', fundamento: 'Calendário oficial TJGO 2026; Lei estadual GO 21.268/2022, art. 91, II (não haverá expediente nos dias declarados ponto facultativo pelo Chefe do Poder Judiciário)', fonte: 'tjgo-feriados-2026' },
  { tribunais: ['TJGO'], inicio: '2026-02-18', fim: '2026-02-18', nome: 'Quarta-feira de Cinzas: feriado até as 12h (o expediente começa ao meio-dia)', efeito: 'expediente_parcial', verificacao: 'ato_do_tribunal', fundamento: 'Calendário oficial TJGO 2026 ("18 de fevereiro, até 12h"); CPC, art. 224, § 1º', fonte: 'tjgo-feriados-2026' },
  { tribunais: ['TJGO'], inicio: '2026-06-29', fim: '2026-06-29', nome: 'Jogo da Seleção na Copa do Mundo: expediente das 7h às 12h; prazos de termo inicial ou final prorrogados', efeito: 'expediente_parcial', verificacao: 'ato_do_tribunal', fundamento: 'Decreto Judiciário TJGO 3079/2026, arts. 1º e 2º', fonte: 'tjgo-dj-3079-2026' },

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
  { tribunais: ['TJAL'], inicio: '2026-06-22', fim: '2026-06-30', nome: 'Recesso forense de junho (prazos suspensos; retorno em 1º de julho)', efeito: 'nao_util', verificacao: 'ato_do_tribunal', fundamento: 'Lei estadual AL 6.564/2005, art. 37; período de 2026 pela notícia oficial do TJAL de 19/06/2026', fonte: 'tjal-recesso-junho-2026' },
  { tribunais: ['TJAL'], inicio: '2026-08-28', fim: '2026-08-28', nome: 'Nossa Senhora dos Prazeres: suspensão só nos municípios que preveem o feriado (depende da comarca)', efeito: 'nao_util', verificacao: 'pendente', fundamento: 'Ato Normativo TJAL 03/2026, art. 4º', fonte: 'tjal-an-03-2026' },

  // ---------- TRF1, 2026: Portaria Presi 5/2026 (pontos facultativos viram alerta, ver PONTOS_FACULTATIVOS) ----------
  ...PF_2026.map(pf => ({
    tribunais: ['TRF1'],
    inicio: pf.data,
    fim: pf.data,
    nome: pf.nome,
    efeito: (pf.parcial ? 'expediente_parcial' : 'nao_util') as EfeitoEvento,
    verificacao: 'ato_do_tribunal' as const,
    fundamento: 'Portaria Presi 5/2026 do TRF1, art. 1º',
    fonte: 'trf1-presi-5-2026' as const
  })),

  // ---------- TRF2, 2026: Portaria PRES 843/2025 com as alterações das Portarias 30 e 338/2026 (art. 1º: "não haverá expediente") ----------
  // O dia 20/01 (São Sebastião, lei municipal do Rio) fica de fora: é feriado municipal e já cai no período suspenso pelo CPC, art. 220.
  ...[
    ['2026-02-18', 'Quarta-feira de Cinzas (ponto facultativo, sem expediente)', 'Portaria PRES/TRF2 843/2025, art. 1º, IV'],
    ['2026-04-20', 'Ponto facultativo (sem expediente)', 'Portaria PRES/TRF2 30/2026, art. 1º, VI'],
    ['2026-04-23', 'Dia de São Jorge', 'Portaria PRES/TRF2 843/2025, art. 1º (Lei estadual RJ 5.198/2008)'],
    ['2026-06-04', 'Corpus Christi (ponto facultativo, sem expediente)', 'Portaria PRES/TRF2 30/2026, art. 1º, X'],
    ['2026-06-05', 'Ponto facultativo (sem expediente)', 'Portaria PRES/TRF2 30/2026, art. 1º, XI'],
    ['2026-06-29', 'Ponto facultativo (jogo da Seleção na Copa, sem expediente)', 'Portaria PRES/TRF2 338/2026'],
    ['2026-08-10', 'Ponto facultativo (sem expediente)', 'Portaria PRES/TRF2 30/2026, art. 1º, XII'],
    ['2026-10-30', 'Dia do Servidor Público (transferido de 28/10)', 'Portaria PRES/TRF2 30/2026, art. 1º, XVI'],
    ['2026-12-07', 'Ponto facultativo (sem expediente)', 'Portaria PRES/TRF2 30/2026, art. 1º, XIX']
  ].map(([data, nome, fundamento]) => ({
    tribunais: ['TRF2'],
    inicio: data,
    fim: data,
    nome,
    efeito: 'nao_util' as const,
    verificacao: 'ato_do_tribunal' as const,
    fundamento,
    fonte: 'trf2-pres-843-2026' as const
  })),

  // ---------- TRF3, 2026: Portaria CATRF3R 48/2025 (arts. 1º a 3º), alterada pela nº 58/2026, e nº 53/2026 ----------
  // Fora: 26/08 (aniversário de Campo Grande, só para a Turma Regional de MS) e os jogos da Copa de 24 e 29/06 (trabalho não presencial, sem suspensão de prazos).
  ...[
    ['2026-03-02', 'Posse dos novos dirigentes: expediente presencial e prazos suspensos no Tribunal, prazos prorrogados para o dia útil seguinte', 'Portaria CATRF3R 53/2026, arts. 1º e 2º'],
    ['2026-04-20', 'Sem expediente (horas compensadas)', 'Portaria CATRF3R 48/2025, art. 2º'],
    ['2026-06-04', 'Corpus Christi', 'Portaria CATRF3R 48/2025, art. 1º'],
    ['2026-06-05', 'Sem expediente (horas compensadas)', 'Portaria CATRF3R 48/2025, art. 2º'],
    ['2026-07-09', 'Revolução Constitucionalista (só na sede, em São Paulo)', 'Portaria CATRF3R 48/2025, art. 1º, com a redação da Portaria CATRF3R 58/2026 (Lei estadual SP 9.497/1997)'],
    ['2026-10-30', 'Dia do Servidor Público (originalmente 28/10)', 'Portaria CATRF3R 48/2025, art. 1º']
  ].map(([data, nome, fundamento]) => ({
    tribunais: ['TRF3'],
    inicio: data,
    fim: data,
    nome,
    efeito: 'nao_util' as const,
    verificacao: 'ato_do_tribunal' as const,
    fundamento,
    fonte: 'trf3-catrf3r-48-2025' as const
  })),
  { tribunais: ['TRF3'], inicio: '2026-02-18', fim: '2026-02-18', nome: 'Quarta-feira de Cinzas (expediente a partir das 14h)', efeito: 'expediente_parcial', verificacao: 'ato_do_tribunal', fundamento: 'Portaria CATRF3R 48/2025, art. 3º', fonte: 'trf3-catrf3r-48-2025' },

  // ---------- TRF4, 2026: calendário oficial (linhas "Todas") e Portaria 233/2026 (adia o feriado do Dia do Servidor para 30/10; art. 1º, parágrafo único: expediente normal em 28/10) ----------
  { tribunais: ['TRF4'], inicio: '2026-10-30', fim: '2026-10-30', nome: 'Dia do Servidor Público (feriado adiado de 28/10)', efeito: 'nao_util', verificacao: 'ato_do_tribunal', fundamento: 'Portaria TRF4 233/2026, art. 1º (Lei 8.112/1990, art. 236)', fonte: 'trf4-calendario-2026' },

  // ---------- TRF5, 2026: Ato 219/2026 (retificado pelo Ato 230/2026), arts. 1º a 5º ----------
  // Feriados municipais do Recife (24/06 e 16/07, Lei municipal 9.777/1967) só alertam. O Dia do Servidor (28/10) teria sido transferido para 30/10 pelo Ato 498/2026, não lido: os dois dias alertam.
  ...[
    ['2026-02-18', 'Quarta-feira de Cinzas (ponto facultativo, sem expediente)', 'Ato 219/2026 do TRF5, art. 2º e art. 5º, § 3º'],
    ['2026-03-06', 'Data Magna do Estado de Pernambuco', 'Ato 219/2026 do TRF5, art. 1º (Lei estadual PE 13.835/2009, como citada no ato)'],
    ['2026-06-04', 'Corpus Christi (ponto facultativo, sem expediente)', 'Ato 219/2026 do TRF5, art. 2º'],
    ['2026-06-23', 'Véspera de São João (ponto facultativo, sem expediente)', 'Ato 219/2026 do TRF5, art. 2º']
  ].map(([data, nome, fundamento]) => ({
    tribunais: ['TRF5'],
    inicio: data,
    fim: data,
    nome,
    efeito: 'nao_util' as const,
    verificacao: 'ato_do_tribunal' as const,
    fundamento,
    fonte: 'trf5-ato-219-2026' as const
  })),
  ...[
    ['2026-06-24', 'São João (feriado municipal do Recife: alerta)', 'Ato 219/2026 do TRF5, art. 1º (Lei municipal 9.777/1967); feriado municipal não conta (CPC, art. 1.003, § 6º)'],
    ['2026-07-16', 'Nossa Senhora do Carmo (feriado municipal do Recife: alerta)', 'Ato 219/2026 do TRF5, art. 1º (Lei municipal 9.777/1967); feriado municipal não conta (CPC, art. 1.003, § 6º)'],
    ['2026-10-28', 'Dia do Servidor Público (alerta: o Ato 498/2026 o teria transferido para 30/10)', 'Ato 219/2026 do TRF5, art. 2º (Lei 8.112/1990, art. 236)'],
    ['2026-10-30', 'Dia do Servidor Público transferido (alerta: Ato 498/2026 não lido)', 'Ato 498/2026 do TRF5, citado em portaria do MPF e não lido']
  ].map(([data, nome, fundamento]) => ({
    tribunais: ['TRF5'],
    inicio: data,
    fim: data,
    nome,
    efeito: 'nao_util' as const,
    verificacao: 'pendente' as const,
    fundamento,
    fonte: 'trf5-ato-219-2026' as const
  })),

  // ---------- TRF6, 2026: Portaria Presi 1/2026, art. 1º (pontos facultativos viram alerta, ver PONTOS_FACULTATIVOS) ----------
  // Corpus Christi (04/06) vem listado como feriado, não como ponto facultativo (Lei municipal de Belo Horizonte 11.397/2022).
  ...PF_2026.map(pf => ({
    tribunais: ['TRF6'],
    inicio: pf.data,
    fim: pf.data,
    nome: pf.data === '2026-06-04' ? 'Corpus Christi (feriado religioso, Lei municipal de Belo Horizonte 11.397/2022)' : pf.nome,
    efeito: (pf.parcial ? 'expediente_parcial' : 'nao_util') as EfeitoEvento,
    verificacao: 'ato_do_tribunal' as const,
    fundamento: 'Portaria Presi 1/2026 do TRF6, art. 1º',
    fonte: 'trf6-presi-1-2026' as const
  })),

  // ---------- TJPA, 2026: Portaria 4765/2025-GP, Anexo (art. 1º: "não haverá expediente" nos feriados e pontos facultativos) ----------
  // Fora: os feriados federais do anexo (1/1, 21/4, 1/5, 7/9, 12/10, 2/11, 20/11), que já vêm da lei federal.
  ...[
    ['2026-02-16', 'Segunda-feira de Carnaval (ponto facultativo, sem expediente)', 'Portaria TJPA 4765/2025-GP, Anexo'],
    ['2026-02-17', 'Carnaval (suspensão nacional do expediente forense)', 'Portaria TJPA 4765/2025-GP, Anexo (Lei 1.408/1951)'],
    ['2026-02-18', 'Quarta-feira de Cinzas (ponto facultativo, sem expediente)', 'Portaria TJPA 4765/2025-GP, Anexo'],
    ['2026-04-02', 'Quinta-feira Santa (ponto facultativo, sem expediente)', 'Portaria TJPA 4765/2025-GP, Anexo'],
    ['2026-04-03', 'Sexta-feira Santa', 'Portaria TJPA 4765/2025-GP, Anexo (Lei 1.408/1951)'],
    ['2026-04-20', 'Ponto facultativo (sem expediente)', 'Portaria TJPA 4765/2025-GP, Anexo'],
    ['2026-06-04', 'Corpus Christi', 'Portaria TJPA 4765/2025-GP, Anexo (Lei 9.093/1995 e Lei municipal 6.306/1967)'],
    ['2026-06-05', 'Ponto facultativo (sem expediente)', 'Portaria TJPA 4765/2025-GP, Anexo'],
    ['2026-10-26', 'Recírio (ponto facultativo, sem expediente)', 'Portaria TJPA 4765/2025-GP, Anexo'],
    ['2026-10-30', 'Dia do Servidor Público (transferido de 28/10)', 'Portaria TJPA 4765/2025-GP, art. 2º e Anexo'],
    ['2026-12-07', 'Ponto facultativo (sem expediente)', 'Portaria TJPA 4765/2025-GP, Anexo'],
    ['2026-12-08', 'Dia da Justiça (feriado forense)', 'Portaria TJPA 4765/2025-GP, Anexo (Decreto-lei 8.292/1945 e Lei 1.408/1951)']
  ].map(([data, nome, fundamento]) => ({
    tribunais: ['TJPA'],
    inicio: data,
    fim: data,
    nome,
    efeito: 'nao_util' as const,
    verificacao: 'ato_do_tribunal' as const,
    fundamento,
    fonte: 'tjpa-gp-4765-2025' as const
  })),

  // ---------- TJMA, 2026: Resolução-GP 131/2025, arts. 1º e 3º (pontos facultativos do art. 3º viram alerta, ver PONTOS_FACULTATIVOS) ----------
  // Fora: os feriados federais do art. 1º (1/1, 21/4, 1/5, 7/9, 12/10, 2/11, 20/11, 25/12) e os municipais (art. 1º, parágrafo único, e art. 2º).
  ...[
    ['2026-02-16', 'Carnaval (feriado forense)', 'Resolução-GP TJMA 131/2025, art. 1º, II (LC estadual 14/1991, art. 5º-A, § 1º)'],
    ['2026-02-17', 'Carnaval (feriado forense)', 'Resolução-GP TJMA 131/2025, art. 1º, III (LC estadual 14/1991, art. 5º-A, § 1º)'],
    ['2026-02-18', 'Quarta-feira de Cinzas (ponto facultativo)', 'Resolução-GP TJMA 131/2025, art. 3º, I'],
    ['2026-04-01', 'Quarta-feira da Semana Santa (ponto facultativo)', 'Resolução-GP TJMA 131/2025, art. 3º, II'],
    ['2026-04-02', 'Quinta-feira Santa (feriado forense)', 'Resolução-GP TJMA 131/2025, art. 1º, IV (LC estadual 14/1991, art. 5º-A, § 1º)'],
    ['2026-04-03', 'Sexta-feira da Paixão (feriado forense)', 'Resolução-GP TJMA 131/2025, art. 1º, V (LC estadual 14/1991, art. 5º-A, § 1º)'],
    ['2026-06-04', 'Corpus Christi', 'Resolução-GP TJMA 131/2025, art. 1º, VIII'],
    ['2026-06-05', 'Ponto facultativo', 'Resolução-GP TJMA 131/2025, art. 3º, III'],
    ['2026-07-28', 'Adesão do Maranhão à Independência do Brasil', 'Resolução-GP TJMA 131/2025, art. 1º, IX'],
    ['2026-08-11', 'Dia do Advogado (feriado forense)', 'Resolução-GP TJMA 131/2025, art. 1º, X (LC estadual 14/1991, art. 5º-A, § 1º)'],
    ['2026-10-28', 'Dia do Servidor Público', 'Resolução-GP TJMA 131/2025, art. 1º, XIII'],
    ['2026-12-08', 'Dia da Justiça (feriado forense)', 'Resolução-GP TJMA 131/2025, art. 1º, XVI (LC estadual 14/1991, art. 5º-A, § 1º)']
  ].map(([data, nome, fundamento]) => ({
    tribunais: ['TJMA'],
    inicio: data,
    fim: data,
    nome,
    efeito: 'nao_util' as const,
    verificacao: 'ato_do_tribunal' as const,
    fundamento,
    fonte: 'tjma-res-gp-131-2025' as const
  })),

  // ---------- TJMT, 2026: Portaria 1915/2025-PRES, Anexo I (art. 2º: suspensos o expediente e os prazos nos feriados e nos pontos facultativos) ----------
  // Fora: os feriados federais do anexo (1/1, 21/4, 1/5, 7/9, 12/10, 2/11, 15/11, 20/11, 25/12), 24 e 31/12 (recesso) e os feriados municipais do Anexo II.
  ...[
    ['2026-02-16', 'Carnaval (ponto facultativo, sem expediente)', 'Portaria TJMT/PRES 1915/2025, Anexo I e art. 2º'],
    ['2026-02-17', 'Carnaval (ponto facultativo, sem expediente)', 'Portaria TJMT/PRES 1915/2025, Anexo I e art. 2º'],
    ['2026-04-02', 'Paixão de Cristo (ponto facultativo, sem expediente)', 'Portaria TJMT/PRES 1915/2025, Anexo I e art. 2º'],
    ['2026-04-03', 'Paixão de Cristo (feriado nacional)', 'Portaria TJMT/PRES 1915/2025, Anexo I (Lei 1.408/1951)'],
    ['2026-04-20', 'Ponto facultativo (sem expediente)', 'Portaria TJMT/PRES 1915/2025, Anexo I e art. 2º'],
    ['2026-06-04', 'Corpus Christi (ponto facultativo, sem expediente)', 'Portaria TJMT/PRES 1915/2025, Anexo I e art. 2º'],
    ['2026-06-05', 'Corpus Christi (ponto facultativo, sem expediente)', 'Portaria TJMT/PRES 1915/2025, Anexo I e art. 2º'],
    ['2026-08-10', 'Dia do Advogado (ponto facultativo, sem expediente)', 'Portaria TJMT/PRES 1915/2025, Anexo I e art. 2º (Lei 5.010/1966, art. 62, IV)'],
    ['2026-08-11', 'Dia do Advogado (ponto facultativo, sem expediente)', 'Portaria TJMT/PRES 1915/2025, Anexo I e art. 2º (Lei 5.010/1966, art. 62, IV)'],
    ['2026-10-28', 'Dia do Servidor Público (ponto facultativo, sem expediente)', 'Portaria TJMT/PRES 1915/2025, Anexo I e art. 2º'],
    ['2026-12-07', 'Dia da Justiça (feriado forense)', 'Portaria TJMT/PRES 1915/2025, Anexo I (Decreto-lei 8.292/1945, art. 1º)'],
    ['2026-12-08', 'Dia da Justiça (feriado forense)', 'Portaria TJMT/PRES 1915/2025, Anexo I (Decreto-lei 8.292/1945, art. 1º)']
  ].map(([data, nome, fundamento]) => ({
    tribunais: ['TJMT'],
    inicio: data,
    fim: data,
    nome,
    efeito: 'nao_util' as const,
    verificacao: 'ato_do_tribunal' as const,
    fundamento,
    fonte: 'tjmt-pres-1915-2025' as const
  })),
  { tribunais: ['TJMT'], inicio: '2026-02-18', fim: '2026-02-18', nome: 'Quarta-feira de Cinzas: expediente a partir das 13h', efeito: 'expediente_parcial', verificacao: 'ato_do_tribunal', fundamento: 'Portaria TJMT/PRES 1915/2025, Anexo I (Portaria 338/2023-PRES, não lida); CPC, art. 224, § 1º', fonte: 'tjmt-pres-1915-2025' },

  // ---------- TJAM, 2026: Portaria 4704/2025 (item II: pontos facultativos; item III: prazos prorrogados para o primeiro dia útil, então contam) ----------
  // Fora: feriados federais, sábados (04/07 e 05/09), 24/10 (municipal de Manaus, sábado) e o recesso de 20/12 a 06/01.
  ...[
    ['2026-02-16', 'Carnaval (ponto facultativo)', 'Portaria TJAM 4704/2025, item II e Calendário Judicial 2026, item II e III'],
    ['2026-02-17', 'Carnaval (feriado)', 'Portaria TJAM 4704/2025, item II e Calendário Judicial 2026'],
    ['2026-02-18', 'Quarta-feira de Cinzas (ponto facultativo)', 'Portaria TJAM 4704/2025, item II e Calendário Judicial 2026, item II e III'],
    ['2026-04-02', 'Quinta-feira Santa (feriado, art. 267, I, da LC estadual 17/1997)', 'Portaria TJAM 4704/2025, item II e Calendário Judicial 2026'],
    ['2026-04-03', 'Sexta-feira Santa (feriado nacional)', 'Portaria TJAM 4704/2025, item II e Calendário Judicial 2026'],
    ['2026-04-20', 'Ponto facultativo (véspera de Tiradentes)', 'Portaria TJAM 4704/2025, item II e Calendário Judicial 2026, item II e III'],
    ['2026-05-19', 'Dia do Defensor Público (ponto facultativo)', 'Portaria TJAM 4704/2025, item II e Calendário Judicial 2026, item II e III'],
    ['2026-06-04', 'Corpus Christi (feriado)', 'Portaria TJAM 4704/2025, item II e Calendário Judicial 2026'],
    ['2026-06-05', 'Ponto facultativo (dia seguinte a Corpus Christi)', 'Portaria TJAM 4704/2025, item II e Calendário Judicial 2026, item II e III'],
    ['2026-08-11', 'Dia do Advogado (ponto facultativo)', 'Portaria TJAM 4704/2025, item II e Calendário Judicial 2026, item II e III'],
    ['2026-10-28', 'Dia do Servidor Público (ponto facultativo)', 'Portaria TJAM 4704/2025, item II e Calendário Judicial 2026, item II e III'],
    ['2026-12-07', 'Ponto facultativo (véspera de Nossa Senhora da Conceição e do Dia da Justiça)', 'Portaria TJAM 4704/2025, item II e Calendário Judicial 2026, item II e III'],
    ['2026-12-08', 'Nossa Senhora da Conceição e Dia da Justiça (feriado, art. 267, II, da LC estadual 17/1997)', 'Portaria TJAM 4704/2025, item II e Calendário Judicial 2026'],
    ['2026-12-14', 'Dia Nacional do Ministério Público (ponto facultativo)', 'Portaria TJAM 4704/2025, item II e Calendário Judicial 2026, item II e III']
  ].map(([data, nome, fundamento]) => ({
    tribunais: ['TJAM'],
    inicio: data,
    fim: data,
    nome,
    efeito: 'nao_util' as const,
    verificacao: 'ato_do_tribunal' as const,
    fundamento,
    fonte: 'tjam-portaria-4704-2025' as const
  })),

  // ---------- TJMS, 2026: página oficial de feriados forenses (pontos facultativos e Cinzas só alertam, ver PONTOS_FACULTATIVOS) ----------
  // Fora: feriados federais, municipais e 20 a 31/12 (recesso).
  ...[
    ['2026-02-16', 'Carnaval (feriado)', 'Página de feriados forenses do TJMS 2026 (Portaria 983/2025, não lida)'],
    ['2026-02-17', 'Carnaval (feriado)', 'Página de feriados forenses do TJMS 2026 (Portaria 983/2025, não lida)'],
    ['2026-02-18', 'Quarta-feira de Cinzas', 'Página de feriados forenses do TJMS 2026 (Portaria 983/2025, não lida)'],
    ['2026-04-02', 'Quinta-feira Santa (não há expediente, art. 164, § 2º, do CODJ)', 'Página de feriados forenses do TJMS 2026 (Portaria 983/2025, não lida)'],
    ['2026-04-03', 'Sexta-feira Santa (não há expediente, art. 164, § 2º, do CODJ)', 'Página de feriados forenses do TJMS 2026 (Portaria 983/2025, não lida)'],
    ['2026-04-20', 'Ponto facultativo', 'Página de feriados forenses do TJMS 2026 (Portaria 983/2025, não lida)'],
    ['2026-06-04', 'Corpus Christi (feriado)', 'Página de feriados forenses do TJMS 2026 (Portaria 983/2025, não lida)'],
    ['2026-06-05', 'Ponto facultativo', 'Página de feriados forenses do TJMS 2026 (Portaria 983/2025, não lida)'],
    ['2026-08-10', 'Ponto facultativo', 'Página de feriados forenses do TJMS 2026 (Portaria 983/2025, não lida)'],
    ['2026-08-11', 'Instituição dos Cursos Jurídicos (art. 164, § 2º, do CODJ)', 'Página de feriados forenses do TJMS 2026 (Portaria 983/2025, não lida)'],
    ['2026-10-30', 'Dia do Servidor Público (feriado)', 'Página de feriados forenses do TJMS 2026 (Portaria 983/2025, não lida)'],
    ['2026-12-07', 'Ponto facultativo em todas as comarcas', 'Página de feriados forenses do TJMS 2026 (Portaria 983/2025, não lida)'],
    ['2026-12-08', 'Dia da Justiça (feriado)', 'Página de feriados forenses do TJMS 2026 (Portaria 983/2025, não lida)']
  ].map(([data, nome, fundamento]) => ({
    tribunais: ['TJMS'],
    inicio: data,
    fim: data,
    nome,
    efeito: 'nao_util' as const,
    verificacao: 'ato_do_tribunal' as const,
    fundamento,
    fonte: 'tjms-feriados-2026' as const
  })),

  // ---------- TJRO, 2026: Ato 2579/2025 compilado (art. 1º: sem expediente nos feriados e pontos facultativos do anexo; art. 5º: prazos prorrogados) ----------
  // Fora: feriados federais, municipais (comarca ou Fórum Digital), 02/01 e 24 e 31/12 (recesso) e o 08/12 (transferido para 07/12; fica só o municipal de Guajará-Mirim e Candeias do Jamari).
  ...[
    ['2026-02-16', 'Carnaval (ponto facultativo do PJRO, sem expediente)', 'Ato TJRO 2579/2025, arts. 1º e 5º e Anexo Único'],
    ['2026-02-17', 'Carnaval (ponto facultativo do PJRO, sem expediente)', 'Ato TJRO 2579/2025, arts. 1º e 5º e Anexo Único'],
    ['2026-02-18', 'Quarta-feira de Cinzas (ponto facultativo, sem expediente)', 'Ato TJRO 2579/2025, arts. 1º e 5º e Anexo Único, art. 2º, I'],
    ['2026-04-02', 'Quinta-feira Santa (ponto facultativo do PJRO, sem expediente)', 'Ato TJRO 2579/2025, arts. 1º e 5º e Anexo Único'],
    ['2026-04-03', 'Sexta-feira Santa (feriado)', 'Ato TJRO 2579/2025, arts. 1º e 5º e Anexo Único'],
    ['2026-04-20', 'Dia anterior a Tiradentes (ponto facultativo, sem expediente)', 'Ato TJRO 2579/2025, arts. 1º e 5º e Anexo Único, art. 2º, VI (Ato 657/2026)'],
    ['2026-06-04', 'Corpus Christi (feriado)', 'Ato TJRO 2579/2025, arts. 1º e 5º e Anexo Único'],
    ['2026-06-05', 'Dia seguinte a Corpus Christi (ponto facultativo, sem expediente)', 'Ato TJRO 2579/2025, arts. 1º e 5º e Anexo Único, art. 2º, II'],
    ['2026-07-20', 'Dia do Trabalhador da Justiça Estadual (ponto facultativo, sem expediente)', 'Ato TJRO 2579/2025, arts. 1º e 5º e Anexo Único, art. 2º, VII (Ato 782/2026)'],
    ['2026-08-10', 'Dia do Magistrado, do Advogado e dos Cursos Jurídicos, transferido de 11/08 (ponto facultativo, sem expediente)', 'Ato TJRO 2579/2025, arts. 1º e 5º e Anexo Único, art. 3º, I (Ato 657/2026)'],
    ['2026-10-30', 'Dia do Servidor Público, transferido de 28/10 (ponto facultativo, sem expediente)', 'Ato TJRO 2579/2025, arts. 1º e 5º e Anexo Único, art. 3º, II (Ato 657/2026)'],
    ['2026-12-07', 'Dia da Justiça, transferido de 08/12 (feriado)', 'Ato TJRO 2579/2025, arts. 1º e 5º e Anexo Único, art. 3º-C (Ato 2168/2026)']
  ].map(([data, nome, fundamento]) => ({
    tribunais: ['TJRO'],
    inicio: data,
    fim: data,
    nome,
    efeito: 'nao_util' as const,
    verificacao: 'ato_do_tribunal' as const,
    fundamento,
    fonte: 'tjro-ato-2579-2025' as const
  })),

  // ---------- TJPB, 2026: calendário do tribunal (pontos facultativos e dias compensados só alertam, ver PONTOS_FACULTATIVOS) ----------
  // Fora: feriados federais, municipais e o recesso de 20/12 a 06/01.
  ...[
    ['2026-02-16', 'Carnaval (ponto facultativo)', 'Calendário 2026 do TJPB'],
    ['2026-02-17', 'Carnaval (ponto facultativo)', 'Calendário 2026 do TJPB'],
    ['2026-02-18', 'Quarta-feira de Cinzas', 'Calendário 2026 do TJPB'],
    ['2026-04-02', 'Quinta-feira Santa (ponto facultativo, Semana Santa)', 'Calendário 2026 do TJPB'],
    ['2026-04-03', 'Sexta-feira Santa (Paixão de Cristo, feriado)', 'Calendário 2026 do TJPB'],
    ['2026-04-20', 'Ponto facultativo (compensado)', 'Calendário 2026 do TJPB'],
    ['2026-06-04', 'Corpus Christi (ponto facultativo)', 'Calendário 2026 do TJPB'],
    ['2026-06-05', 'Ponto facultativo (compensado)', 'Calendário 2026 do TJPB'],
    ['2026-06-22', 'Ponto facultativo (compensado)', 'Calendário 2026 do TJPB'],
    ['2026-06-23', 'Ponto facultativo (compensado)', 'Calendário 2026 do TJPB'],
    ['2026-06-24', 'São João (ponto facultativo)', 'Calendário 2026 do TJPB'],
    ['2026-08-05', 'Data Magna da Paraíba (feriado estadual)', 'Calendário 2026 do TJPB'],
    ['2026-08-10', 'Ponto facultativo (compensado)', 'Calendário 2026 do TJPB'],
    ['2026-08-11', 'Fundação dos Cursos Jurídicos', 'Calendário 2026 do TJPB'],
    ['2026-12-07', 'Ponto facultativo (compensado)', 'Calendário 2026 do TJPB'],
    ['2026-12-08', 'Dia da Justiça', 'Calendário 2026 do TJPB']
  ].map(([data, nome, fundamento]) => ({
    tribunais: ['TJPB'],
    inicio: data,
    fim: data,
    nome,
    efeito: 'nao_util' as const,
    verificacao: 'ato_do_tribunal' as const,
    fundamento,
    fonte: 'tjpb-calendario-2026' as const
  })),
  // Dia do Servidor transferido de 28 para 30/10 pelo Ato Conjunto TJPB/MPPB/DPE nº 9/2026 (DJe de 16/10/2026): ato NÃO lido por inteiro (decisão do revisor em 19/10/2026)
  { tribunais: ['TJPB'], inicio: '2026-10-30', fim: '2026-10-30', nome: 'Dia do Servidor Público (transferido de 28/10)', efeito: 'nao_util', verificacao: 'ato_do_tribunal', fundamento: 'Ato Conjunto TJPB/MPPB/DPE 9/2026, art. 1º (transcrito na notícia oficial; texto do ato não lido)', fonte: 'tjpb-ato-conjunto-9-2026' },
  { tribunais: ['TJPB'], inicio: '2026-02-11', fim: '2026-02-11', nome: 'Festejos de Carnaval: expediente das 7h às 13h', efeito: 'expediente_parcial', verificacao: 'ato_do_tribunal', fundamento: 'Calendário 2026 do TJPB; CPC, art. 224, § 1º', fonte: 'tjpb-calendario-2026' },
  { tribunais: ['TJPB'], inicio: '2026-04-01', fim: '2026-04-01', nome: 'Semana Santa: expediente das 7h às 13h', efeito: 'expediente_parcial', verificacao: 'ato_do_tribunal', fundamento: 'Calendário 2026 do TJPB; CPC, art. 224, § 1º', fonte: 'tjpb-calendario-2026' },

  // ---------- TJRN, 2026: Portaria Conjunta 02/2026 (alertam 04/06, 20/04, 05/06 e 29/06, ver PONTOS_FACULTATIVOS) ----------
  // Fora: feriados federais, municipais, 24 e 31/12 e o recesso de 20/12 a 06/01.
  ...[
    ['2026-02-16', 'Carnaval (feriado)', 'Portaria Conjunta TJRN 02/2026, art. 1º, I (LC estadual 643/2018, art. 97, § 3º, II)'],
    ['2026-02-17', 'Carnaval (feriado)', 'Portaria Conjunta TJRN 02/2026, art. 1º, II (LC estadual 643/2018, art. 97, § 3º, II; Lei 1.408/1951, art. 5º)'],
    ['2026-02-18', 'Quarta-feira de Cinzas (feriado)', 'Portaria Conjunta TJRN 02/2026, art. 1º, III (LC estadual 643/2018, art. 97, § 3º, II)'],
    ['2026-04-01', 'Semana Santa (feriado)', 'Portaria Conjunta TJRN 02/2026, art. 1º, IV (LC estadual 643/2018, art. 97, § 3º, I)'],
    ['2026-04-02', 'Semana Santa (feriado)', 'Portaria Conjunta TJRN 02/2026, art. 1º, V (LC estadual 643/2018, art. 97, § 3º, I)'],
    ['2026-04-03', 'Sexta-feira Santa (feriado)', 'Portaria Conjunta TJRN 02/2026, art. 1º, VI (LC estadual 643/2018, art. 97, § 3º, I; Lei 1.408/1951, art. 5º)'],
    ['2026-04-20', 'Ponto facultativo (Decreto estadual 35.209/2025, não lido)', 'Portaria Conjunta TJRN 02/2026, art. 1º, VII'],
    ['2026-06-04', 'Corpus Christi (ponto facultativo)', 'Portaria Conjunta TJRN 02/2026, art. 1º, X'],
    ['2026-06-05', 'Ponto facultativo (Decreto estadual 35.209/2025, não lido)', 'Portaria Conjunta TJRN 02/2026, art. 1º, XI'],
    ['2026-06-29', 'Dia de São Pedro (sem fundamento citado)', 'Portaria Conjunta TJRN 02/2026, art. 1º, XII'],
    ['2026-08-10', 'Antecipação do Dia do Advogado, do Magistrado e dos Cursos Jurídicos (feriado)', 'Portaria Conjunta TJRN 02/2026, art. 1º, XIII (LC estadual 643/2018, art. 97, § 3º, III)'],
    ['2026-10-30', 'Dia do Servidor Público', 'Portaria Conjunta TJRN 02/2026, art. 1º, XV (LC estadual 122/1994, art. 230)'],
    ['2026-12-07', 'Antecipação do Dia da Justiça (feriado)', 'Portaria Conjunta TJRN 02/2026, art. 1º, XIX (LC estadual 643/2018, art. 97, § 3º, III)']
  ].map(([data, nome, fundamento]) => ({
    tribunais: ['TJRN'],
    inicio: data,
    fim: data,
    nome,
    efeito: 'nao_util' as const,
    verificacao: 'ato_do_tribunal' as const,
    fundamento,
    fonte: 'tjrn-pc-02-2026' as const
  })),

  // ---------- TJAC, 2026: Portaria PRESI 6569/2025 (alertam 04/06 e 06/08, pontos facultativos estaduais, ver PONTOS_FACULTATIVOS) ----------
  // Fora: feriados federais, municipais, 24 e 31/12 (recesso) e os dias em fim de semana.
  ...[
    ['2026-01-22', 'Dia do Católico (comemoração do dia 20 adiada para o dia 22; feriado estadual)', 'Portaria PRESI TJAC 6569/2025, art. 1º e tabelas mensais (Lei estadual 2.126/2009; Lei estadual 3.137/2016)'],
    ['2026-01-23', 'Dia do Evangélico (feriado estadual)', 'Portaria PRESI TJAC 6569/2025, art. 1º e tabelas mensais (Lei estadual 1.538/2004)'],
    ['2026-02-16', 'Carnaval (feriado forense)', 'Portaria PRESI TJAC 6569/2025, art. 1º e tabelas mensais (LC estadual 221/2010, art. 37, § 1º, II)'],
    ['2026-02-17', 'Carnaval (feriado forense)', 'Portaria PRESI TJAC 6569/2025, art. 1º e tabelas mensais (LC estadual 221/2010, art. 37, § 1º, II)'],
    ['2026-02-18', 'Quarta-feira de Cinzas (feriado forense)', 'Portaria PRESI TJAC 6569/2025, art. 1º e tabelas mensais (LC estadual 221/2010, art. 37, § 1º, II)'],
    ['2026-04-02', 'Quinta-feira Santa (feriado estadual)', 'Portaria PRESI TJAC 6569/2025, art. 1º e tabelas mensais (LC estadual 221/2010, art. 37, § 1º, III)'],
    ['2026-04-03', 'Sexta-feira da Paixão (feriado estadual)', 'Portaria PRESI TJAC 6569/2025, art. 1º e tabelas mensais (LC estadual 221/2010, art. 37, § 1º, III)'],
    ['2026-06-04', 'Corpus Christi (ponto facultativo estadual)', 'Portaria PRESI TJAC 6569/2025, art. 1º e tabelas mensais (Decreto estadual 11.610/2024)'],
    ['2026-06-15', 'Aniversário do Estado do Acre (feriado estadual)', 'Portaria PRESI TJAC 6569/2025, art. 1º e tabelas mensais (Lei estadual 14/1964)'],
    ['2026-08-06', 'Início da Revolução Acreana (ponto facultativo estadual)', 'Portaria PRESI TJAC 6569/2025, art. 1º e tabelas mensais (Decreto estadual 11.610/2024)'],
    ['2026-08-11', 'Dia do Advogado (feriado regimental)', 'Portaria PRESI TJAC 6569/2025, art. 1º e tabelas mensais (LC estadual 221/2010, art. 37, § 1º, IV)'],
    ['2026-10-30', 'Dia do Servidor Público (comemoração do dia 28 adiada para o dia 30; feriado estadual)', 'Portaria PRESI TJAC 6569/2025, art. 1º e tabelas mensais (Lei estadual 2.126/2009; LC 39/1993)'],
    ['2026-11-19', 'Tratado de Petrópolis (comemoração do dia 17 adiada para o dia 19; feriado estadual)', 'Portaria PRESI TJAC 6569/2025, art. 1º e tabelas mensais (Lei estadual 2.126/2009; Lei estadual 57/1965)'],
    ['2026-12-08', 'Dia da Justiça (feriado regimental)', 'Portaria PRESI TJAC 6569/2025, art. 1º e tabelas mensais (LC estadual 221/2010, art. 37, § 1º, IV)']
  ].map(([data, nome, fundamento]) => ({
    tribunais: ['TJAC'],
    inicio: data,
    fim: data,
    nome,
    efeito: 'nao_util' as const,
    verificacao: 'ato_do_tribunal' as const,
    fundamento,
    fonte: 'tjac-presi-6569-2025' as const
  })),

  // ---------- TJRR, 2026: Portaria 1558/2025, Anexo Único, "Todas as Comarcas" (art. 3º: suspensos o expediente e os prazos nos feriados e pontos facultativos) ----------
  // Fora: feriados federais, as linhas só da Comarca de Boa Vista, os feriados municipais do interior e o recesso (01 a 06/01 e 20 a 31/12).
  ...[
    ['2026-02-16', 'Carnaval (feriado)', 'Portaria TJRR/PR 1558/2025, art. 3º e Anexo Único'],
    ['2026-02-17', 'Carnaval (feriado)', 'Portaria TJRR/PR 1558/2025, art. 3º e Anexo Único'],
    ['2026-02-18', 'Quarta-feira de Cinzas (feriado)', 'Portaria TJRR/PR 1558/2025, art. 3º e Anexo Único'],
    ['2026-04-01', 'Semana Santa (feriado)', 'Portaria TJRR/PR 1558/2025, art. 3º e Anexo Único'],
    ['2026-04-02', 'Semana Santa (feriado)', 'Portaria TJRR/PR 1558/2025, art. 3º e Anexo Único'],
    ['2026-04-03', 'Semana Santa (feriado)', 'Portaria TJRR/PR 1558/2025, art. 3º e Anexo Único'],
    ['2026-04-20', 'Ponto facultativo referente ao feriado de 21/04, sem expediente', 'Portaria TJRR/PR 1558/2025, art. 3º e Anexo Único'],
    ['2026-06-04', 'Corpus Christi (feriado)', 'Portaria TJRR/PR 1558/2025, art. 3º e Anexo Único'],
    ['2026-06-05', 'Ponto facultativo referente ao feriado de 04/06, sem expediente', 'Portaria TJRR/PR 1558/2025, art. 3º e Anexo Único'],
    ['2026-08-10', 'Ponto facultativo referente ao Dia dos Magistrados, sem expediente', 'Portaria TJRR/PR 1558/2025, art. 3º e Anexo Único'],
    ['2026-08-11', 'Dia dos Magistrados (feriado)', 'Portaria TJRR/PR 1558/2025, art. 3º e Anexo Único'],
    ['2026-10-05', 'Aniversário do Estado de Roraima (feriado)', 'Portaria TJRR/PR 1558/2025, art. 3º e Anexo Único'],
    ['2026-10-28', 'Dia do Servidor Público (feriado)', 'Portaria TJRR/PR 1558/2025, art. 3º e Anexo Único'],
    ['2026-12-07', 'Ponto facultativo referente ao feriado de 08/12, sem expediente', 'Portaria TJRR/PR 1558/2025, art. 3º e Anexo Único'],
    ['2026-12-08', 'Dia da Justiça e Nossa Senhora da Conceição (feriado)', 'Portaria TJRR/PR 1558/2025, art. 3º e Anexo Único']
  ].map(([data, nome, fundamento]) => ({
    tribunais: ['TJRR'],
    inicio: data,
    fim: data,
    nome,
    efeito: 'nao_util' as const,
    verificacao: 'ato_do_tribunal' as const,
    fundamento,
    fonte: 'tjrr-pr-1558-2025' as const
  })),

  // ---------- TJAP, 2026: calendário do tribunal (pontos facultativos da legenda só alertam, ver PONTOS_FACULTATIVOS) ----------
  // Fora: feriados federais, municipais, dias só de recomendação de audiência (19/05 e 14/12), fim de semana e 24 e 31/12.
  ...[
    ['2026-02-16', 'Carnaval (feriado regimental)', 'Calendário 2026 do TJAP (página de consultas do tribunal)'],
    ['2026-02-17', 'Carnaval', 'Calendário 2026 do TJAP (página de consultas do tribunal)'],
    ['2026-02-18', 'Quarta-feira de Cinzas (feriado regimental)', 'Calendário 2026 do TJAP (página de consultas do tribunal)'],
    ['2026-03-19', 'Padroeiro do Estado do Amapá (feriado estadual)', 'Calendário 2026 do TJAP (página de consultas do tribunal)'],
    ['2026-03-20', 'Expediente suspenso (Portaria 77918/2026-GP, não lida)', 'Calendário 2026 do TJAP (página de consultas do tribunal)'],
    ['2026-04-01', 'Semana Santa (feriado regimental)', 'Calendário 2026 do TJAP (página de consultas do tribunal)'],
    ['2026-04-02', 'Semana Santa (feriado regimental)', 'Calendário 2026 do TJAP (página de consultas do tribunal)'],
    ['2026-04-03', 'Paixão de Cristo', 'Calendário 2026 do TJAP (página de consultas do tribunal)'],
    ['2026-04-20', 'Expediente suspenso (Portaria 77918/2026-GP, não lida)', 'Calendário 2026 do TJAP (página de consultas do tribunal)'],
    ['2026-05-15', 'Dia de Cabralzinho (feriado estadual)', 'Calendário 2026 do TJAP (página de consultas do tribunal)'],
    ['2026-06-04', 'Corpus Christi (ponto facultativo)', 'Calendário 2026 do TJAP (página de consultas do tribunal)'],
    ['2026-06-05', 'Expediente suspenso (Portaria 77918/2026-GP, não lida)', 'Calendário 2026 do TJAP (página de consultas do tribunal)'],
    ['2026-08-10', 'Expediente suspenso (Portaria 77918/2026-GP, não lida)', 'Calendário 2026 do TJAP (página de consultas do tribunal)'],
    ['2026-08-11', 'Dia do Advogado (feriado regimental)', 'Calendário 2026 do TJAP (página de consultas do tribunal)'],
    ['2026-10-30', 'Dia do Servidor Público (ponto facultativo, alteração pela Portaria 77918/26)', 'Calendário 2026 do TJAP (página de consultas do tribunal)'],
    ['2026-11-30', 'Dia do Evangélico (ponto facultativo)', 'Calendário 2026 do TJAP (página de consultas do tribunal)'],
    ['2026-12-07', 'Expediente suspenso (Portaria 77918/2026-GP, não lida)', 'Calendário 2026 do TJAP (página de consultas do tribunal)'],
    ['2026-12-08', 'Dia da Justiça (feriado regimental)', 'Calendário 2026 do TJAP (página de consultas do tribunal)']
  ].map(([data, nome, fundamento]) => ({
    tribunais: ['TJAP'],
    inicio: data,
    fim: data,
    nome,
    efeito: 'nao_util' as const,
    verificacao: 'ato_do_tribunal' as const,
    fundamento,
    fonte: 'tjap-calendario-2026' as const
  })),

  // ---------- TJTO, 2026: Portaria 3741/2025 pela notícia oficial (20/04, 04/06, 05/06 e 10/08 só alertam, ver PONTOS_FACULTATIVOS) ----------
  // Fora: feriados federais, municipais (Palmas e interior) e 15/08 (sábado).
  ...[
    ['2026-02-16', 'Carnaval (LC estadual 10/1996, art. 110, parágrafo único)', 'Portaria TJTO 3741/2025, pela notícia oficial de 10/11/2025'],
    ['2026-02-17', 'Carnaval (LC estadual 10/1996, art. 110, parágrafo único)', 'Portaria TJTO 3741/2025, pela notícia oficial de 10/11/2025'],
    ['2026-04-01', 'Semana Santa (LC estadual 10/1996, art. 110)', 'Portaria TJTO 3741/2025, pela notícia oficial de 10/11/2025'],
    ['2026-04-02', 'Semana Santa (LC estadual 10/1996, art. 110)', 'Portaria TJTO 3741/2025, pela notícia oficial de 10/11/2025'],
    ['2026-04-03', 'Semana Santa (LC estadual 10/1996, art. 110)', 'Portaria TJTO 3741/2025, pela notícia oficial de 10/11/2025'],
    ['2026-04-20', 'Ponto facultativo', 'Portaria TJTO 3741/2025, pela notícia oficial de 10/11/2025'],
    ['2026-06-04', 'Corpus Christi (ponto facultativo)', 'Portaria TJTO 3741/2025, pela notícia oficial de 10/11/2025'],
    ['2026-06-05', 'Ponto facultativo', 'Portaria TJTO 3741/2025, pela notícia oficial de 10/11/2025'],
    ['2026-08-10', 'Ponto facultativo', 'Portaria TJTO 3741/2025, pela notícia oficial de 10/11/2025'],
    ['2026-08-11', 'Instituição dos Cursos Jurídicos no Brasil', 'Portaria TJTO 3741/2025, pela notícia oficial de 10/11/2025'],
    ['2026-09-08', 'Nossa Senhora da Natividade, Padroeira do Tocantins', 'Portaria TJTO 3741/2025, pela notícia oficial de 10/11/2025'],
    ['2026-10-05', 'Criação do Estado do Tocantins', 'Portaria TJTO 3741/2025, pela notícia oficial de 10/11/2025'],
    ['2026-10-30', 'Dia do Servidor Público (transferido de 28/10)', 'Portaria TJTO 3741/2025, pela notícia oficial de 10/11/2025'],
    ['2026-12-18', 'Dia da Justiça (transferido de 08/12)', 'Portaria TJTO 3741/2025, pela notícia oficial de 10/11/2025']
  ].map(([data, nome, fundamento]) => ({
    tribunais: ['TJTO'],
    inicio: data,
    fim: data,
    nome,
    efeito: 'nao_util' as const,
    verificacao: 'ato_do_tribunal' as const,
    fundamento,
    fonte: 'tjto-portaria-3741-2025' as const
  })),

  // ---------- TJPI, 2026: Provimento 59/2025, art. 1º (sem expediente; art. 5º: prazos prorrogados) ----------
  // Fora: feriados federais, municipais, 14/12 (só atos do Ministério Público), recesso e pontos facultativos da Presidência (nenhum no provimento).
  ...[
    ['2026-02-16', 'Carnaval (segunda-feira)', 'Provimento TJPI 59/2025, art. 1º, III'],
    ['2026-02-17', 'Carnaval (terça-feira)', 'Provimento TJPI 59/2025, art. 1º, III'],
    ['2026-02-18', 'Quarta-feira de Cinzas', 'Provimento TJPI 59/2025, art. 1º, III'],
    ['2026-04-02', 'Quinta-feira Santa (Semana Santa)', 'Provimento TJPI 59/2025, art. 1º, IV'],
    ['2026-04-03', 'Sexta-feira Santa (Semana Santa)', 'Provimento TJPI 59/2025, art. 1º, IV'],
    ['2026-06-04', 'Corpus Christi', 'Provimento TJPI 59/2025, art. 1º, V'],
    ['2026-08-11', 'Criação dos Cursos Jurídicos, Dia do Advogado e Dia do Magistrado', 'Provimento TJPI 59/2025, art. 1º, VI'],
    ['2026-10-19', 'Dia do Piauí (feriado estadual, Lei estadual 176/1937)', 'Provimento TJPI 59/2025, art. 1º, VII'],
    ['2026-10-28', 'Dia do Servidor Público Estadual (LC estadual 13/1994, art. 201)', 'Provimento TJPI 59/2025, art. 1º, VIII'],
    ['2026-12-08', 'Dia da Justiça (Decreto-lei 8.292/1945)', 'Provimento TJPI 59/2025, art. 1º, IX']
  ].map(([data, nome, fundamento]) => ({
    tribunais: ['TJPI'],
    inicio: data,
    fim: data,
    nome,
    efeito: 'nao_util' as const,
    verificacao: 'ato_do_tribunal' as const,
    fundamento,
    fonte: 'tjpi-provimento-59-2025' as const
  })),

  // ---------- TJPI, 2026: Portaria 169/2026, arts. 1º, 2º e 7º (pontos facultativos sem expediente; prazos suspensos) ----------
  ...[
    ['2026-04-20', 'Ponto facultativo (Tiradentes em 21/04)'],
    ['2026-06-05', 'Ponto facultativo (Corpus Christi em 04/06)'],
    ['2026-08-10', 'Ponto facultativo (Cursos Jurídicos em 11/08)'],
    ['2026-12-07', 'Ponto facultativo (Dia da Justiça em 08/12)']
  ].map(([data, nome]) => ({
    tribunais: ['TJPI'],
    inicio: data,
    fim: data,
    nome,
    efeito: 'nao_util' as const,
    verificacao: 'ato_do_tribunal' as const,
    fundamento: 'Portaria TJPI 169/2026, arts. 1º, 2º e 7º',
    fonte: 'tjpi-portaria-169-2026' as const
  })),

  // ---------- TJSE, 2026: calendário do tribunal e portarias normativas dos pontos facultativos (07/12 e 14/12 só alertam, ver PONTOS_FACULTATIVOS) ----------
  // Fora: feriados com município, 16/03 (só Aracaju e Tribunal) e o recesso.
  ...[
    ['2026-02-16', 'Carnaval (ponto facultativo)', 'Portaria Normativa TJSE 10/2026 (comunicado oficial)', 'tjse-portarias-normativas-2026'],
    ['2026-02-17', 'Carnaval (feriado)', 'Calendário 2026 do TJSE (Comarcas de Aracaju e do interior)'],
    ['2026-02-18', 'Quarta-feira de Cinzas (ponto facultativo)', 'Portaria Normativa TJSE 10/2026 (comunicado oficial)', 'tjse-portarias-normativas-2026'],
    ['2026-04-02', 'Quinta-feira Santa (ponto facultativo)', 'Portaria Normativa TJSE 18/2026 (comunicado oficial)', 'tjse-portarias-normativas-2026'],
    ['2026-04-03', 'Paixão de Cristo (feriado)', 'Calendário 2026 do TJSE (Comarcas de Aracaju e do interior)'],
    ['2026-04-20', 'Ponto facultativo', 'Portaria Normativa TJSE 24/2026 (comunicado oficial)', 'tjse-portarias-normativas-2026'],
    ['2026-06-04', 'Corpus Christi (feriado)', 'Calendário 2026 do TJSE (Comarcas de Aracaju e do interior)'],
    ['2026-06-05', 'Ponto facultativo', 'Portaria Normativa TJSE 46/2026 (comunicado oficial)', 'tjse-portarias-normativas-2026'],
    ['2026-06-24', 'Festejos juninos, São João (feriado)', 'Calendário 2026 do TJSE (Comarcas de Aracaju e do interior)'],
    ['2026-06-29', 'Festejos juninos, São Pedro (ponto facultativo)', 'Portaria Normativa TJSE 52/2026 (comunicado oficial)', 'tjse-portarias-normativas-2026'],
    ['2026-07-08', 'Emancipação Política de Sergipe (feriado estadual)', 'Calendário 2026 do TJSE (Comarcas de Aracaju e do interior)'],
    ['2026-08-10', 'Ponto facultativo', 'Portaria Normativa TJSE 72/2026 (comunicado oficial)', 'tjse-portarias-normativas-2026'],
    ['2026-08-11', 'Dia do Magistrado (feriado)', 'Calendário 2026 do TJSE (Comarcas de Aracaju e do interior)'],
    ['2026-10-30', 'Dia do Funcionário Público (feriado)', 'Calendário 2026 do TJSE (Comarcas de Aracaju e do interior)'],
    ['2026-12-07', 'Ponto facultativo', 'Calendário 2026 do TJSE (Comarcas de Aracaju e do interior)'],
    ['2026-12-08', 'Dia da Justiça (feriado)', 'Calendário 2026 do TJSE (Comarcas de Aracaju e do interior)'],
    ['2026-12-14', 'Dia do Ministério Público', 'Calendário 2026 do TJSE (Comarcas de Aracaju e do interior)']
  ].map(([data, nome, fundamento, fonte]) => ({
    tribunais: ['TJSE'],
    inicio: data,
    fim: data,
    nome,
    efeito: 'nao_util' as const,
    verificacao: 'ato_do_tribunal' as const,
    fundamento,
    fonte: (fonte ?? 'tjse-calendario-2026') as 'tjse-calendario-2026' | 'tjse-portarias-normativas-2026'
  }))
];

/**
 * Pontos facultativos (decisão do revisor jurídico em 10/10/2026): o ponto facultativo é facultativo ao tribunal e não há como prever se será
 * concedido. Nunca conta como dia sem expediente: vira alerta (dia pendente), que o modo conservador ignora e o modo completo mostra.
 * Exceção (esclarecida pelo revisor em 10/10/2026): quando o calendário ou o ato PREVÊ EXPRESSAMENTE que não haverá expediente no ponto facultativo,
 * o dia conta como sem expediente. É o caso de TJBA (art. 5º do Decreto 1050/2025, com prorrogação no art. 8º), TJCE (art. 1º da Portaria 2924/2025)
 * e TJDFT (arts. 4º e 5º da Portaria Conjunta 105/2025) e TJGO (art. 91, II, da Lei estadual 21.268/2022: não há expediente nos dias declarados
 * ponto facultativo pelo Chefe do Poder Judiciário): esses ficam fora desta lista. Fica como alerta só o TJES (o ato só manda compensar as horas). TJRJ também conta (art. 83, II,
 * da Lei estadual 10.633/2024: não há expediente nos dias declarados ponto facultativo nas repartições estaduais; Atos Executivos 20, 79 e 91/2026). Também conta o dia que o ato trata como feriado ou suspensão decretada (Copa com prazos prorrogados).
 */
const PONTOS_FACULTATIVOS: Record<string, string[]> = {
  // TRF1 e TRF6: os atos só "divulgam" o ponto facultativo e não dizem que não haverá expediente (diferente de TRF2, TRF3 e TRF5, cujos atos dizem)
  TRF1: ['2026-04-20', '2026-06-04', '2026-06-05', '2026-08-10', '2026-10-30', '2026-12-07'],
  TRF6: ['2026-04-20', '2026-06-05', '2026-08-10', '2026-10-30', '2026-12-07'],
  TJES: ['2026-04-20', '2026-06-04', '2026-06-05', '2026-08-10', '2026-10-30', '2026-12-07'],
  // TJMA: o art. 3º da Resolução-GP 131/2025 só "considera" esses dias pontos facultativos e não diz que não haverá expediente
  TJMA: ['2026-02-18', '2026-04-01', '2026-06-05'],
  // TJMS: a página do tribunal só diz "ponto facultativo" (e Cinzas sem efeito dito) e não diz que não há expediente; o ato (Portaria 983/2025) não foi lido
  TJMS: ['2026-02-18', '2026-04-20', '2026-06-05', '2026-08-10', '2026-12-07'],
  // TJPB: o calendário do tribunal chama esses dias de ponto facultativo (ou compensado) e não diz que não há expediente; Cinzas (18/02) e Dia do Servidor (28/10, depois transferido para 30/10 pelo Ato Conjunto 9/2026) vêm em vermelho sem esse rótulo e contam (decisão do responsável em 14/10/2026)
  TJPB: ['2026-02-16', '2026-02-17', '2026-04-02', '2026-04-20', '2026-06-04', '2026-06-05', '2026-06-22', '2026-06-23', '2026-06-24', '2026-08-10', '2026-12-07'],
  // TJRN: a Portaria Conjunta 02/2026 chama 04/06 de ponto facultativo; 20/04 e 05/06 só citam o Decreto estadual 35.209/2025 (não lido) e 29/06 não cita fundamento; o ato não diz que não há expediente
  TJRN: ['2026-04-20', '2026-06-04', '2026-06-05', '2026-06-29'],
  // TJAC: 04/06 e 06/08 são pontos facultativos estaduais (Decreto 11.610/2024) e a Portaria 6569/2025 só trata da compensação de horas, sem dizer que não há expediente
  TJAC: ['2026-06-04', '2026-08-06'],
  // TJAP: a legenda do calendário do tribunal chama esses dias de "Ponto Facultativo" (os de "Expediente Suspenso" contam)
  TJAP: ['2026-06-04', '2026-10-30', '2026-11-30'],
  // TJTO: a notícia oficial sobre a Portaria 3741/2025 chama esses dias de ponto facultativo e não diz que não há expediente
  TJTO: ['2026-04-20', '2026-06-04', '2026-06-05', '2026-08-10'],
  // TJSE: o calendário do tribunal lista 07/12 em "previsão de pontos facultativos" sem portaria (e 14/12 como data própria do Ministério Público); os demais pontos facultativos de 2026 já têm portaria normativa e comunicado oficial dizendo que não há expediente e que os prazos são prorrogados, então contam
  TJSE: ['2026-12-07', '2026-12-14']
};

function comoAlerta(e: EventoCalendario): EventoCalendario {
  const tribunal = e.tribunais.length === 1 ? e.tribunais[0] : '';
  if (e.verificacao === 'ato_do_tribunal' && e.inicio === e.fim && PONTOS_FACULTATIVOS[tribunal]?.includes(e.inicio)) {
    return {
      ...e,
      verificacao: 'pendente',
      nome: `Ponto facultativo (alerta): ${e.nome}`,
      fundamento: `${e.fundamento}; ponto facultativo: o tribunal pode conceder ou não, por isso só alerta`
    };
  }
  return e;
}

export const EVENTOS_CALENDARIO: EventoCalendario[] = EVENTOS_BASE.map(comoAlerta);


/** Regras que se repetem todo ano. As do TJMG vêm de resolução permanente e as do TJAL da Lei estadual 6.564/2005 (consolidada); só o recesso de junho do TJAL fica pendente (em 2026 vale o período lido, 22 a 30/06). */
export const REGRAS_ANUAIS: RegraAnual[] = [
  { tribunais: ['TJMG'], nome: 'Carnaval (segunda a quarta-feira)', efeito: 'nao_util', verificacao: 'ato_do_tribunal', fundamento: 'Res. OE TJMG 458/2004, art. 1º, III', fonte: 'tjmg-res-458', quando: { tipo: 'pascoa', deslocamentos: [-48, -47, -46] } },
  { tribunais: ['TJMG'], nome: 'Semana Santa (quarta a sexta-feira)', efeito: 'nao_util', verificacao: 'ato_do_tribunal', fundamento: 'Res. OE TJMG 458/2004, art. 1º, IV', fonte: 'tjmg-res-458', quando: { tipo: 'pascoa', deslocamentos: [-4, -3, -2] } },
  { tribunais: ['TJMG'], nome: 'Dia da Justiça (8 de dezembro)', efeito: 'nao_util', verificacao: 'ato_do_tribunal', fundamento: 'Res. OE TJMG 458/2004, art. 1º, V', fonte: 'tjmg-res-458', quando: { tipo: 'intervalo', de: [12, 8], ate: [12, 8] } },

  // Feriados civis por lei estadual (Lei 9.093/1995, art. 1º, II: data magna do Estado fixada em lei estadual); CPC, art. 216: feriados declarados em lei
  { tribunais: ['TJPE'], nome: 'Data Magna de Pernambuco (6 de março)', efeito: 'nao_util', verificacao: 'lei_estadual', fundamento: 'Lei estadual PE 16.241/2017, art. 49', fonte: 'pe-lei-16241', quando: { tipo: 'intervalo', de: [3, 6], ate: [3, 6] } },
  { tribunais: ['TJRS'], nome: 'Data magna do Rio Grande do Sul (20 de setembro)', efeito: 'nao_util', verificacao: 'lei_estadual', fundamento: 'Constituição do Estado do RS, art. 6º, parágrafo único; Decreto estadual 36.180/1995', fonte: 'rs-decreto-36180', quando: { tipo: 'intervalo', de: [9, 20], ate: [9, 20] } },
  // Lei estadual RJ 10.633/2024, art. 83 (permanente): Carnaval de segunda a quarta-feira, Semana Santa só quinta e sexta-feira e Dia da Justiça
  { tribunais: ['TJRJ'], nome: 'Carnaval (segunda a quarta-feira)', efeito: 'nao_util', verificacao: 'lei_estadual', fundamento: 'Lei estadual RJ 10.633/2024, art. 83, III', fonte: 'tjrj-lei-10633', quando: { tipo: 'pascoa', deslocamentos: [-48, -47, -46] } },
  { tribunais: ['TJRJ'], nome: 'Semana Santa (quinta e sexta-feira)', efeito: 'nao_util', verificacao: 'lei_estadual', fundamento: 'Lei estadual RJ 10.633/2024, art. 83, IV', fonte: 'tjrj-lei-10633', quando: { tipo: 'pascoa', deslocamentos: [-3, -2] } },
  { tribunais: ['TJRJ'], nome: 'Dia da Justiça (8 de dezembro)', efeito: 'nao_util', verificacao: 'lei_estadual', fundamento: 'Lei estadual RJ 10.633/2024, art. 83, I', fonte: 'tjrj-lei-10633', quando: { tipo: 'intervalo', de: [12, 8], ate: [12, 8] } },
  { tribunais: ['TJGO'], nome: 'Pedra fundamental de Goiânia (24 de outubro)', efeito: 'nao_util', verificacao: 'lei_estadual', fundamento: 'Lei estadual GO 19.850/2017, art. 1º (feriado estadual)', fonte: 'go-lei-19850', quando: { tipo: 'intervalo', de: [10, 24], ate: [10, 24] } },

  { tribunais: ['TJES'], nome: 'Nossa Senhora da Penha (segunda-feira após a oitava da Páscoa)', efeito: 'nao_util', verificacao: 'pendente', fundamento: 'Lei estadual ES 11.010/2019 (texto não lido)', fonte: 'tjes-aviso-penha-2023', quando: { tipo: 'pascoa', deslocamentos: [8] } },

  { tribunais: ['TJAL'], nome: 'Carnaval (segunda a quarta-feira de cinzas)', efeito: 'nao_util', verificacao: 'ato_do_tribunal', fundamento: 'Lei estadual AL 6.564/2005, art. 36, III', fonte: 'tjal-lei-6564', quando: { tipo: 'pascoa', deslocamentos: [-48, -47, -46] } },
  { tribunais: ['TJAL'], nome: 'Semana Santa (quarta a domingo de Páscoa)', efeito: 'nao_util', verificacao: 'ato_do_tribunal', fundamento: 'Lei estadual AL 6.564/2005, art. 36, I', fonte: 'tjal-lei-6564', quando: { tipo: 'pascoa', deslocamentos: [-4, -3, -2] } },
  { tribunais: ['TJAL'], nome: '11 de agosto', efeito: 'nao_util', verificacao: 'ato_do_tribunal', fundamento: 'Lei estadual AL 6.564/2005, art. 36, II', fonte: 'tjal-lei-6564', quando: { tipo: 'intervalo', de: [8, 11], ate: [8, 11] } },
  { tribunais: ['TJAL'], nome: '8 de dezembro', efeito: 'nao_util', verificacao: 'ato_do_tribunal', fundamento: 'Lei estadual AL 6.564/2005, art. 36, II', fonte: 'tjal-lei-6564', quando: { tipo: 'intervalo', de: [12, 8], ate: [12, 8] } },
  { tribunais: ['TJAL'], nome: 'Feriados forenses de 23 de junho a 1º de julho', efeito: 'nao_util', verificacao: 'pendente', fundamento: 'Lei estadual AL 6.564/2005, art. 37 (vigência atual não confirmada; o tribunal fixa o período a cada ano)', fonte: 'tjal-lei-6564', exceto: [2026], quando: { tipo: 'intervalo', de: [6, 23], ate: [7, 1] } },
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
  TJPE: { anos: [2026], fontes: ['tjpe-ato-conjunto-43-2025', 'tjpe-ato-966-2026', 'tjpe-ato-977-2026'] },
  TJCE: { anos: [2026], fontes: ['tjce-portaria-2924-2025', 'tjce-portaria-1169-2026', 'tjce-portaria-1401-2026', 'tjce-portaria-1440-2026', 'tjce-portaria-727-2026'] },
  TJES: { anos: [2026], fontes: ['tjes-an-176-2026', 'tjes-an-124-2026', 'tjes-an-130-2026'] },
  TJGO: { anos: [2026], fontes: ['tjgo-feriados-2026', 'tjgo-dj-1130-2026', 'tjgo-dj-1738-2026', 'tjgo-lei-21268-art-91', 'tjgo-dj-3079-2026'] },
  TRF1: { anos: [2026], fontes: ['trf1-presi-5-2026'] },
  TRF2: { anos: [2026], fontes: ['trf2-pres-843-2026'] },
  TRF3: { anos: [2026], fontes: ['trf3-catrf3r-48-2025'] },
  TRF4: { anos: [2026], fontes: ['trf4-calendario-2026'] },
  TRF5: { anos: [2026], fontes: ['trf5-ato-219-2026'] },
  TRF6: { anos: [2026], fontes: ['trf6-presi-1-2026'] },
  TJPA: { anos: [2026], fontes: ['tjpa-gp-4765-2025'] },
  TJMA: { anos: [2026], fontes: ['tjma-res-gp-131-2025'] },
  TJMT: { anos: [2026], fontes: ['tjmt-pres-1915-2025'] },
  TJAM: { anos: [2026], fontes: ['tjam-portaria-4704-2025'] },
  TJMS: { anos: [2026], fontes: ['tjms-feriados-2026'] },
  TJRO: { anos: [2026], fontes: ['tjro-ato-2579-2025'] },
  TJPB: { anos: [2026], fontes: ['tjpb-calendario-2026', 'tjpb-ato-conjunto-9-2026'] },
  TJRN: { anos: [2026], fontes: ['tjrn-pc-02-2026'] },
  TJAC: { anos: [2026], fontes: ['tjac-presi-6569-2025'] },
  TJRR: { anos: [2026], fontes: ['tjrr-pr-1558-2025'] },
  TJAP: { anos: [2026], fontes: ['tjap-calendario-2026'] },
  TJTO: { anos: [2026], fontes: ['tjto-portaria-3741-2025'] },
  TJPI: { anos: [2026], fontes: ['tjpi-provimento-59-2025', 'tjpi-portaria-169-2026'] },
  TJSE: { anos: [2026], fontes: ['tjse-calendario-2026', 'tjse-portarias-normativas-2026'] }
};
