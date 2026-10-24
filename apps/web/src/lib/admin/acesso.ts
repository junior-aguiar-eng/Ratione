export interface UsuarioVerificado {
  id: string;
  is_anonymous?: boolean;
}

export function idsAdministradores(ids: string | undefined): string[] {
  return (ids ?? '').split(/[\s,;]+/).map(id => id.toLowerCase()).filter(id => /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(id));
}

export async function autorizarAdministrador(
  ids: string | undefined,
  verificar: () => Promise<{ data: { user: UsuarioVerificado | null }; error: unknown }>
): Promise<boolean> {
  const permitidos = idsAdministradores(ids);
  if (!permitidos.length) return false;
  try {
    const { data, error } = await verificar();
    return !error && !!data.user && data.user.is_anonymous !== true && permitidos.includes(data.user.id.toLowerCase());
  } catch {
    return false;
  }
}
