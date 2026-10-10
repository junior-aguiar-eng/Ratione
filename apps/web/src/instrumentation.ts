import type { Instrumentation } from 'next';
import { caminhoSemQuery, descreverErro, registrar } from './lib/log';

/**
 * O Next chama este gancho para todo erro não tratado no servidor (páginas, rotas, ações).
 * O registro vai ao Cloud Logging como ERROR; um alerta do Cloud Monitoring avisa o responsável.
 */
export const onRequestError: Instrumentation.onRequestError = async (erro, requisicao, contexto) => {
  registrar('ERROR', 'Erro não tratado no servidor', {
    ...descreverErro(erro),
    digest: (erro as { digest?: string } | null)?.digest,
    metodo: requisicao.method,
    caminho: caminhoSemQuery(requisicao.path),
    rota: contexto.routePath,
    tipo_rota: contexto.routeType
  });
};
