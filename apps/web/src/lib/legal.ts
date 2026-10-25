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

export const VERSAO_TEXTOS = '1.1';
/** ISO. */
export const VIGENCIA_TEXTOS = '2026-10-25';

/**
 * Enviado no cadastro (`signUp`, `options.data`): qual versão dos Termos a pessoa aceitou ao marcar a caixa.
 * Quem grava o aceite é o banco (gatilho `registrar_aceite`, tabela `aceites_termos`), com o horário do servidor:
 * por isso não se envia horário daqui. Ver `supabase/migrations/20261011000003_aceites_termos.sql`.
 */
export function dadosDeAceite(): { termos_versao: string } {
  return { termos_versao: VERSAO_TEXTOS };
}
