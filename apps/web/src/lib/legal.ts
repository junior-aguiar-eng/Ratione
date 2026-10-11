/**
 * Dados que as páginas jurídicas (termos, privacidade) mostram e que o cadastro registra.
 * Ao mudar o texto de uma dessas páginas de forma relevante: subir `VERSAO_TEXTOS` e `VIGENCIA_TEXTOS`.
 */
export const RESPONSAVEL = {
  /** Pessoa física enquanto não houver CNPJ (plano, §8). CPF e endereço ficam fora do site público. */
  nome: 'José Bonifácio de Aguiar Santos Júnior',
  /** Canal único: contato geral e canal do titular de dados (LGPD, art. 9º). A caixa precisa existir e ser lida. */
  email: 'contato@nexojuris.ia.br'
} as const;

export const VERSAO_TEXTOS = '1.0';
/** ISO. */
export const VIGENCIA_TEXTOS = '2026-10-10';

/**
 * Metadados gravados no cadastro (`user_metadata`): qual versão dos termos a pessoa aceitou.
 * O horário confiável do cadastro é o `created_at` do Supabase; este campo só diz qual texto estava em vigor.
 */
export function dadosDeAceite(agora: Date = new Date()): { termos_versao: string; termos_aceitos_em: string } {
  return { termos_versao: VERSAO_TEXTOS, termos_aceitos_em: agora.toISOString() };
}
