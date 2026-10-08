/** Traduz as mensagens de erro do Supabase Auth para o usuário, sem revelar se um e-mail tem cadastro. */
export function traduzirErroAuth(mensagem: string): string {
  const m = mensagem.toLowerCase();
  if (m.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (m.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar: abra o link que enviamos na criação da conta.';
  if (m.includes('rate limit') || m.includes('too many') || m.includes('security purposes')) {
    return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente de novo.';
  }
  if (m.includes('password') && (m.includes('weak') || m.includes('least') || m.includes('short'))) {
    return 'Senha fraca: use pelo menos 8 caracteres, misturando letras e números.';
  }
  if (m.includes('valid email') || m.includes('invalid email')) return 'Informe um e-mail válido.';
  if (m.includes('signups not allowed')) return 'Novos cadastros estão desativados no momento.';
  if (m.includes('same password') || m.includes('different from the old')) return 'A nova senha precisa ser diferente da atual.';
  return 'Não foi possível concluir. Tente novamente em instantes.';
}
