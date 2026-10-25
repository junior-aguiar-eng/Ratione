import { abrirContextoAdmin } from '../../../../lib/admin/contexto';
import { servirContas, alterarAcessoConta } from '../../../../lib/admin/contas';

export const dynamic = 'force-dynamic';
export const GET = (request: Request) => servirContas(request, abrirContextoAdmin);
export const POST = (request: Request) => alterarAcessoConta(request, abrirContextoAdmin);
