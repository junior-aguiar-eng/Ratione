import { DispositivoLegalSchema, type DispositivoLegal, type Procedencia, type TipoDispositivo } from '@ratione/core';
import type { VersaoDispositivo } from './index';

/**
 * Procedência dos dispositivos de exemplo da prévia: texto conferido com a versão compilada do CPC no Planalto
 * (lida em 07/10/2026). A vigência do § 6º-A veio da Lei 14.365/2022, art. 5º (DOU de 03/06/2022).
 */
export const PROCEDENCIA_HISTORICO_EXEMPLO: Procedencia = {
  origem: 'curado',
  fontes: [
    {
      id: 'planalto-cpc-compilado',
      ato: 'Lei nº 13.105/2015 (Código de Processo Civil), texto compilado',
      url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105compilada.htm',
      lido: 'versão compilada, só os dispositivos de exemplo',
      lidoEm: '2026-10-07'
    }
  ]
};

const ALTERACOES_QUE_ENCERRAM = new Set<VersaoDispositivo['tipoAlteracao']>(['revogado_expressamente', 'declarado_inconstitucional']);

/**
 * "Lei nº 13.105/2015", "Decreto-Lei nº 2.848/1940", "Emenda Constitucional nº 132/2023", "CF/88" ou "Constituição Federal" → id canônico.
 */
function normaIdDe(normaNome: string): string {
  const nome = normaNome.trim();
  if (/^(?:CF(?:\/(?:19)?88)?|Constitui[çc][ãa]o(?:\s+Federal|\s+da\s+Rep[úu]blica.*)?)$/i.test(nome)) return 'CF-1988';
  const ec = nome.match(/^(?:Emenda\s+Constitucional|EC)\s+(?:n[ºo°.]?\s*)?([\d.]+)\/(\d{4})/i);
  if (ec) return `EC-${ec[1].replace(/\./g, '')}-${ec[2]}`;
  const dl = nome.match(/^(?:Decreto[- ]Lei|DL)\s+(?:n[ºo°.]?\s*)?([\d.]+)\/(\d{4})/i);
  if (dl) return `DL-${dl[1].replace(/\./g, '')}-${dl[2]}`;
  const m = nome.match(/Lei(?: Complementar)?(?: Federal)?\s+n[ºo.]?\s*([\d.]+)\/(\d{4})/i);
  if (!m) throw new Error(`Não foi possível identificar a lei em "${normaNome}".`);
  const prefixo = /Complementar/i.test(nome) ? 'LC' : 'LEI';
  return `${prefixo}-${m[1].replace(/\./g, '')}-${m[2]}`;
}

/**
 * "art. 85, § 6º-A" → { tipo: 'paragrafo', numero: '6º-A' }; também cobre incisos com letra (`IV-A`), alíneas (`a)` / `alínea a`)
 * e itens (`1.` / `item 1`). Vale sempre o nível mais fundo do rótulo; rótulo fora da LC 95/1998 é recusado, não adivinhado.
 */
export function classificarRotulo(rotulo: string): { tipo: TipoDispositivo; numero: string } {
  const partes = rotulo.trim().split(/\s*,\s*/);
  const primeiro = partes[0]?.match(/^art\.\s*([\d.]+(?:º)?(?:-[A-Z]{1,2}(?:-[A-Z])?)?)$/i);
  if (!primeiro) throw new Error(`Rótulo de dispositivo não reconhecido: "${rotulo}".`);

  let resultado: { tipo: TipoDispositivo; numero: string } = { tipo: 'artigo', numero: primeiro[1] };
  let nivel = 1;

  for (const parte of partes.slice(1)) {
    let m: RegExpMatchArray | null;
    if (nivel < 2 && (m = parte.match(/^(?:par[áa]grafo\s+[úu]nico|§\s*([\d.]+º?(?:-[A-Z]{1,2})?))$/i))) {
      nivel = 2;
      resultado = /único/i.test(parte) ? { tipo: 'paragrafo_unico', numero: 'único' } : { tipo: 'paragrafo', numero: m[1] };
    } else if (nivel < 3 && (m = parte.match(/^(?:inciso\s+)?([IVXLCDM]+(?:-[A-Z]{1,2})?)$/))) {
      nivel = 3;
      resultado = { tipo: 'inciso', numero: m[1] };
    } else if (nivel < 3 && (m = parte.match(/^inciso\s+([ivxlcdm]+(?:-[a-z]{1,2})?)$/i))) {
      nivel = 3;
      resultado = { tipo: 'inciso', numero: m[1].toUpperCase() };
    } else if (nivel < 4 && (m = parte.match(/^(?:al[íi]nea\s+["']?([a-z])["']?|([a-z])\))$/i))) {
      nivel = 4;
      resultado = { tipo: 'alinea', numero: (m[1] ?? m[2]).toLowerCase() };
    } else if (nivel < 5 && (m = parte.match(/^(?:item\s+(\d+)|(\d+)\.)$/i))) {
      nivel = 5;
      resultado = { tipo: 'item', numero: m[1] ?? m[2] };
    } else {
      throw new Error(`Rótulo de dispositivo não reconhecido: "${rotulo}".`);
    }
  }
  return resultado;
}

/**
 * Converte uma versão do NormaViva no dispositivo do núcleo. A procedência vem de fora porque a versão não
 * carrega a fonte de onde foi lida; o resultado é validado pelo esquema do núcleo antes de sair.
 */
export function versaoParaDispositivo(versao: VersaoDispositivo, procedencia: Procedencia): DispositivoLegal {
  const { tipo, numero } = classificarRotulo(versao.dispositivoRotulo);
  return DispositivoLegalSchema.parse({
    id: versao.id,
    normaId: normaIdDe(versao.normaNome),
    rotulo: versao.dispositivoRotulo,
    tipo,
    numero,
    texto: versao.texto,
    vigenteEm: versao.dataInicioVigencia,
    revogado: ALTERACOES_QUE_ENCERRAM.has(versao.tipoAlteracao),
    alteradoPor: versao.tipoAlteracao === 'redacao_original' ? undefined : versao.atoModificador.rotulo,
    procedencia
  });
}
