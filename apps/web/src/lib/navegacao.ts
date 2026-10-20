/**
 * Navegação completa (recarrega a página) para depois de entrar ou sair da conta. O `router.replace` do Next reaproveita o cache
 * do navegador: os links das ferramentas, pré-carregados antes do login, guardam o redirecionamento para /entrar, e a tela
 * "congela" até atualizar. Recarregar descarta esse cache e envia os cookies novos ao servidor.
 */
export function irParaPagina(caminho: string): void {
  window.location.replace(caminho);
}
