import { notFound } from 'next/navigation';
import { administradorAtual } from '../../../lib/admin/contexto';
import PainelAdministrativo from './PainelAdministrativo';

export const dynamic = 'force-dynamic';

export default async function AdministracaoPage() {
  if (!await administradorAtual()) notFound();
  return <PainelAdministrativo />;
}
