/**
 * Link enviado por e-mail (confirmação de cadastro e recuperação de senha).
 * O e-mail aponta para `/auth/confirm?token_hash=...&type=...`; a página só consome o código quando o usuário clica,
 * porque varreduras de segurança (Outlook/Hotmail) e o navegador diferente gastam links de uso único.
 */
export const TIPOS_LINK = ['signup', 'recovery', 'email', 'email_change', 'magiclink', 'invite'] as const;
export type TipoLink = (typeof TIPOS_LINK)[number];

export function tipoLinkValido(valor: string | null): valor is TipoLink {
  return valor !== null && (TIPOS_LINK as readonly string[]).includes(valor);
}

/** Só caminhos internos: evita redirecionar o usuário para outro site. */
export function caminhoInterno(pedido: string | null, padrao: string): string {
  if (!pedido) return padrao;
  if (!pedido.startsWith('/') || pedido.startsWith('//') || pedido.includes('\\')) return padrao;
  return pedido;
}

/** Para onde ir depois de confirmar: a recuperação de senha leva à troca de senha. */
export function destinoPadrao(tipo: TipoLink): string {
  return tipo === 'recovery' ? '/conta' : '/meu-espaco';
}
