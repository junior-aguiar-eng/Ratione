import { servirFinanceiro } from '../../../../lib/admin/financeiro';
import { abrirServidorAdmin } from '../../../../lib/admin/contexto';

export const dynamic = 'force-dynamic';
export const GET = (request: Request) => servirFinanceiro(request, abrirServidorAdmin);
