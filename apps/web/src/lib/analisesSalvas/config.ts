/**
 * F5-10: configuração de "salvar a análise", lida do ambiente. Desligado por padrão: sem `ARGUMENTA_SALVAR_LIGADO=sim` e sem a chave de
 * cifra válida (`ANALISES_CHAVE`, 32 bytes em base64, no Secret Manager), as rotas de gravação e de leitura respondem 503 e nada é guardado.
 * Só liga depois das condições da seção 7.3 do RIPD (docs/juridico/RIPD_ARGUMENTA.md).
 */
import { lerChave } from '../documentos/cifra';

export interface ConfigDeAnalisesSalvas {
  chave: Buffer;
}

export function lerConfigDeAnalisesSalvas(env: Record<string, string | undefined>): ConfigDeAnalisesSalvas | null {
  if (env.ARGUMENTA_SALVAR_LIGADO !== 'sim') return null;
  const chave = lerChave(env.ANALISES_CHAVE);
  return chave ? { chave } : null;
}
