/**
 * F5-01: configuração do envio de documentos, lida do ambiente. Desligado por padrão: sem `ARGUMENTA_UPLOAD_LIGADO=sim` e sem a chave de
 * cifra válida, as rotas respondem 503 e nada é guardado. Só liga depois das condições da seção 7 do RIPD (docs/juridico/RIPD_ARGUMENTA.md).
 */
import { lerChave } from './cifra';
import { LIMITES_DE_DOCUMENTO } from './validar';

export interface ConfigDeDocumentos {
  chave: Buffer;
  retencaoDias: number;
}

export function lerConfigDeDocumentos(env: Record<string, string | undefined>): ConfigDeDocumentos | null {
  if (env.ARGUMENTA_UPLOAD_LIGADO !== 'sim') return null;
  const chave = lerChave(env.DOCUMENTOS_CHAVE);
  if (!chave) return null;
  const pedido = Number(env.DOCUMENTOS_RETENCAO_DIAS);
  // Só reduz ou mantém o padrão de 7 dias; aumentar exige decisão do responsável e mudança no código (RIPD: "prazo curto")
  const retencaoDias = Number.isInteger(pedido) && pedido >= 1 && pedido <= LIMITES_DE_DOCUMENTO.retencaoDias ? pedido : LIMITES_DE_DOCUMENTO.retencaoDias;
  return { chave, retencaoDias };
}
