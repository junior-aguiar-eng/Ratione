import { abrirServidorAdmin } from '../../../../lib/admin/contexto';
import { servirEstatisticas } from '../../../../lib/admin/estatisticas';

export const dynamic = 'force-dynamic';
export const GET = () => servirEstatisticas(abrirServidorAdmin);
