/**
 * Logs estruturados para o Cloud Run: uma linha JSON por evento em stdout/stderr.
 * O Cloud Logging lê `severity` e `message` e guarda o resto como campos pesquisáveis.
 *
 * Regras (dado pessoal e sigilo profissional):
 * - nunca registrar corpo de requisição, cookies, tokens, e-mails, senhas nem texto digitado pelo usuário;
 * - caminho sem query string (a query dos links de e-mail leva `token_hash`);
 * - da exceção, só nome, mensagem e pilha curta.
 */
export type Gravidade = 'INFO' | 'WARNING' | 'ERROR';

type Campos = Record<string, string | number | boolean | null | undefined>;

export function caminhoSemQuery(caminho: string): string {
  const i = caminho.search(/[?#]/);
  return i === -1 ? caminho : caminho.slice(0, i);
}

export function descreverErro(erro: unknown): { erro_nome: string; erro_mensagem: string; erro_pilha?: string } {
  if (erro instanceof Error) {
    return {
      erro_nome: erro.name,
      erro_mensagem: erro.message.slice(0, 500),
      erro_pilha: erro.stack?.split('\n').slice(0, 8).join('\n')
    };
  }
  return { erro_nome: 'NaoErro', erro_mensagem: String(erro).slice(0, 500) };
}

export function linhaDeLog(gravidade: Gravidade, mensagem: string, campos: Campos = {}): string {
  return JSON.stringify({ severity: gravidade, message: mensagem, ...campos });
}

export function registrar(gravidade: Gravidade, mensagem: string, campos: Campos = {}): void {
  const linha = linhaDeLog(gravidade, mensagem, campos);
  if (gravidade === 'ERROR') console.error(linha);
  else if (gravidade === 'WARNING') console.warn(linha);
  else console.log(linha);
}
