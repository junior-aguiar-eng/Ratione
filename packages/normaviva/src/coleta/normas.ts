/**
 * Normas coletadas no Planalto (F3-01). Só entra a versão compilada ou consolidada, que já traz o texto vigente
 * com as anotações "Redação dada / Incluído / Revogado" (regra 3 do PLANO, §1). Onde o Planalto só publica a página
 * original (sem versão compilada), a norma não entra na lista.
 */
export interface NormaPlanalto {
  /** Identificador canônico do núcleo (`LEI-13105-2015`, `DL-3689-1941`, `CF-1988`). */
  id: string;
  nome: string;
  /** Caminho depois de `https://www.planalto.gov.br/ccivil_03/`. */
  caminho: string;
}

export const BASE_PLANALTO = 'https://www.planalto.gov.br/ccivil_03/';

export const NORMAS_PLANALTO: NormaPlanalto[] = [
  // Núcleo (F3-01): CF, CC, CPC, CP, CPP, CLT, CDC
  { id: 'CF-1988', nome: 'Constituição da República Federativa do Brasil de 1988', caminho: 'constituicao/constituicao.htm' },
  { id: 'LEI-10406-2002', nome: 'Lei nº 10.406/2002 (Código Civil)', caminho: 'leis/2002/l10406compilada.htm' },
  { id: 'LEI-13105-2015', nome: 'Lei nº 13.105/2015 (Código de Processo Civil)', caminho: '_ato2015-2018/2015/lei/l13105compilada.htm' },
  { id: 'DL-2848-1940', nome: 'Decreto-Lei nº 2.848/1940 (Código Penal)', caminho: 'decreto-lei/del2848compilado.htm' },
  { id: 'DL-3689-1941', nome: 'Decreto-Lei nº 3.689/1941 (Código de Processo Penal)', caminho: 'decreto-lei/del3689compilado.htm' },
  { id: 'DL-5452-1943', nome: 'Decreto-Lei nº 5.452/1943 (Consolidação das Leis do Trabalho)', caminho: 'decreto-lei/del5452compilado.htm' },
  { id: 'LEI-8078-1990', nome: 'Lei nº 8.078/1990 (Código de Defesa do Consumidor)', caminho: 'leis/l8078compilado.htm' },
  // Leis de maior uso
  { id: 'DL-4657-1942', nome: 'Decreto-Lei nº 4.657/1942 (Lei de Introdução às Normas do Direito Brasileiro)', caminho: 'decreto-lei/del4657compilado.htm' },
  { id: 'LEI-5172-1966', nome: 'Lei nº 5.172/1966 (Código Tributário Nacional)', caminho: 'leis/l5172compilado.htm' },
  { id: 'LEI-8069-1990', nome: 'Lei nº 8.069/1990 (Estatuto da Criança e do Adolescente)', caminho: 'leis/l8069compilado.htm' },
  { id: 'LEI-8112-1990', nome: 'Lei nº 8.112/1990 (Regime Jurídico dos Servidores Públicos Civis da União)', caminho: 'leis/l8112cons.htm' },
  { id: 'LEI-8213-1991', nome: 'Lei nº 8.213/1991 (Planos de Benefícios da Previdência Social)', caminho: 'leis/l8213cons.htm' },
  { id: 'LEI-8245-1991', nome: 'Lei nº 8.245/1991 (Locações de imóveis urbanos)', caminho: 'leis/l8245compilado.htm' },
  { id: 'LEI-8429-1992', nome: 'Lei nº 8.429/1992 (Improbidade Administrativa)', caminho: 'leis/l8429compilada.htm' },
  { id: 'LEI-9099-1995', nome: 'Lei nº 9.099/1995 (Juizados Especiais Cíveis e Criminais)', caminho: 'leis/l9099.htm' },
  { id: 'LEI-9307-1996', nome: 'Lei nº 9.307/1996 (Arbitragem)', caminho: 'leis/l9307.htm' },
  { id: 'LEI-9503-1997', nome: 'Lei nº 9.503/1997 (Código de Trânsito Brasileiro)', caminho: 'leis/l9503compilado.htm' },
  { id: 'LEI-6830-1980', nome: 'Lei nº 6.830/1980 (Execução Fiscal)', caminho: 'leis/l6830.htm' },
  { id: 'LEI-7210-1984', nome: 'Lei nº 7.210/1984 (Lei de Execução Penal)', caminho: 'leis/l7210compilado.htm' },
  { id: 'LEI-7347-1985', nome: 'Lei nº 7.347/1985 (Ação Civil Pública)', caminho: 'leis/l7347compilada.htm' },
  { id: 'LEI-11101-2005', nome: 'Lei nº 11.101/2005 (Recuperação Judicial, Extrajudicial e Falência)', caminho: '_ato2004-2006/2005/lei/l11101compilado.htm' },
  { id: 'LEI-11340-2006', nome: 'Lei nº 11.340/2006 (Lei Maria da Penha)', caminho: '_ato2004-2006/2006/lei/l11340.htm' },
  { id: 'LEI-11343-2006', nome: 'Lei nº 11.343/2006 (Lei de Drogas)', caminho: '_ato2004-2006/2006/lei/l11343.htm' },
  { id: 'LEI-11419-2006', nome: 'Lei nº 11.419/2006 (Informatização do processo judicial)', caminho: '_ato2004-2006/2006/lei/l11419.htm' },
  { id: 'LEI-12016-2009', nome: 'Lei nº 12.016/2009 (Mandado de Segurança)', caminho: '_ato2007-2010/2009/lei/l12016.htm' },
  { id: 'LEI-12965-2014', nome: 'Lei nº 12.965/2014 (Marco Civil da Internet)', caminho: '_ato2011-2014/2014/lei/l12965.htm' },
  { id: 'LEI-13709-2018', nome: 'Lei nº 13.709/2018 (Lei Geral de Proteção de Dados)', caminho: '_ato2015-2018/2018/lei/l13709compilado.htm' },
  { id: 'LEI-14133-2021', nome: 'Lei nº 14.133/2021 (Licitações e Contratos Administrativos)', caminho: '_ato2019-2022/2021/lei/l14133.htm' }
];
