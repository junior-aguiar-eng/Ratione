/**
 * Exclusão da conta (LGPD, art. 18, VI). A lógica fica separada da rota para ser testada sem rede:
 * a rota entrega as três operações reais do Supabase; os testes entregam simulações.
 *
 * Ordem: sessão válida → senha atual conferida → só então a conta é apagada (`auth.users`),
 * o que remove perfil e registros salvos em cascata (ver `supabase/migrations`).
 */
export interface DependenciasExclusao {
  /** Usuário da sessão atual (validado no servidor do Supabase), ou `null` sem sessão. */
  usuarioAtual: () => Promise<{ id: string; email: string | null } | null>;
  /** `true` se a senha confere. Não pode alterar a sessão do usuário. */
  conferirSenha: (email: string, senha: string) => Promise<boolean>;
  /** Apaga o usuário em `auth.users` com a chave de serviço; devolve `false` em caso de erro. */
  apagarUsuario: (id: string) => Promise<boolean>;
}

export type ResultadoExclusao =
  | { ok: true }
  | { ok: false; status: 400 | 401 | 403 | 500; mensagem: string };

export async function excluirConta(senha: unknown, dep: DependenciasExclusao): Promise<ResultadoExclusao> {
  if (typeof senha !== 'string' || senha.length === 0 || senha.length > 200) {
    return { ok: false, status: 400, mensagem: 'Informe a sua senha atual para confirmar.' };
  }
  const usuario = await dep.usuarioAtual();
  if (!usuario) return { ok: false, status: 401, mensagem: 'Sessão expirada. Entre de novo e repita o pedido.' };
  if (!usuario.email) return { ok: false, status: 400, mensagem: 'Esta conta não tem e-mail para confirmar a senha.' };
  if (!(await dep.conferirSenha(usuario.email, senha))) return { ok: false, status: 403, mensagem: 'Senha incorreta.' };
  if (!(await dep.apagarUsuario(usuario.id))) {
    return { ok: false, status: 500, mensagem: 'Não foi possível excluir a conta agora. Nada foi apagado; tente de novo em instantes.' };
  }
  return { ok: true };
}
