import { administradorAtual } from '../../../../lib/admin/contexto';
import { servirAcessoAdministrativo } from '../../../../lib/admin/situacao';

export const dynamic = 'force-dynamic';
export const GET = () => servirAcessoAdministrativo(administradorAtual);
