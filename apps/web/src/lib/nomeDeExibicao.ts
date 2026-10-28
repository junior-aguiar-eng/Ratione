/** Como o cabeçalho identifica quem está logado: primeiro nome do perfil; sem ele, a parte do e-mail antes do @. */

const LIMITE = 24;

const capitalizar = (s: string) => (s ? s[0].toLocaleUpperCase('pt-BR') + s.slice(1) : s);

/** Primeiro nome do perfil ("José Bonifácio de Aguiar" → "José"), ou `null` se o perfil não tem nome. */
export function primeiroNome(nomeDoPerfil: string | null | undefined): string | null {
  const primeiro = (nomeDoPerfil ?? '').trim().split(/\s+/)[0] ?? '';
  return primeiro ? primeiro.slice(0, LIMITE) : null;
}

/** "maria.souza@exemplo.com" → "Maria"; o e-mail inteiro não aparece no cabeçalho. */
export function apelidoDoEmail(email: string | null | undefined): string | null {
  const local = (email ?? '').split('@')[0] ?? '';
  const parte = local.split(/[._+-]/).find(p => /\p{L}/u.test(p)) ?? '';
  const letras = parte.replace(/[^\p{L}\p{N}]/gu, '');
  return letras ? capitalizar(letras.slice(0, LIMITE)) : null;
}

/** O nome mostrado no cabeçalho; `Conta` quando não há nada melhor. */
export function nomeParaExibir(nomeDoPerfil: string | null | undefined, email: string | null | undefined): string {
  return primeiroNome(nomeDoPerfil) ?? apelidoDoEmail(email) ?? 'Conta';
}

/** Uma ou duas letras para o círculo ao lado do nome. */
export function iniciais(nome: string): string {
  const letras = [...nome.trim()].filter(c => /\p{L}/u.test(c));
  return (letras[0] ?? '?').toLocaleUpperCase('pt-BR');
}

/** O perfil avisa o cabeçalho quando o nome muda, sem recarregar a página. */
export const EVENTO_PERFIL = 'ratione:perfil-atualizado';
