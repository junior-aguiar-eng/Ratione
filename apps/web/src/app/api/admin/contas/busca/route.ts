import { abrirContextoAdmin } from '../../../../../lib/admin/contexto';
import { servirContas } from '../../../../../lib/admin/contas';

export const dynamic = 'force-dynamic';
export const POST = (request: Request) => servirContas(request, abrirContextoAdmin);
