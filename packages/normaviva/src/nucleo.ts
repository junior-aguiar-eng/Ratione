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

/** "Lei nº 13.105/2015" ou "Lei Federal nº 14.365/2022" → "LEI-13105-2015". */
function normaIdDe(normaNome: string): string {
  const m = normaNome.match(/Lei(?: Complementar)?(?: Federal)?\s+n[ºo.]?\s*([\d.]+)\/(\d{4})/i);
  if (!m) throw new Error(`Não foi possível identificar a lei em "${normaNome}".`);
  const prefixo = /Complementar/i.test(normaNome) ? 'LC' : 'LEI';
  return `${prefixo}-${m[1].replace(/\./g, '')}-${m[2]}`;
}

/**
 * "art. 85, § 6º-A" → { tipo: 'paragrafo', numero: '6º-A' }. Vale o nível mais fundo do rótulo
 * (artigo, parágrafo, inciso). Rótulo que não segue a LC 95/1998 é recusado, não adivinhado.
 */
export function classificarRotulo(rotulo: string): { tipo: TipoDispositivo; numero: string } {
  const m = rotulo.trim().match(/^art\.\s*([\d.]+(?:º)?(?:-[A-Z])?)(?:,\s*(parágrafo único|§\s*[\d.]+º?(?:-[A-Z])?))?(?:,\s*([IVXLCDM]+))?$/i);
  if (!m) throw new Error(`Rótulo de dispositivo não reconhecido: "${rotulo}".`);
  const [, artigo, paragrafo, inciso] = m;
  if (inciso) return { tipo: 'inciso', numero: inciso.toUpperCase() };
  if (paragrafo) {
    return /único/i.test(paragrafo) ? { tipo: 'paragrafo_unico', numero: 'único' } : { tipo: 'paragrafo', numero: paragrafo.replace(/^§\s*/, '') };
  }
  return { tipo: 'artigo', numero: artigo };
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
