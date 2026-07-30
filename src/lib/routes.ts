import type { UserRole } from "@/types";

/** Ruta de inicio de cada rol tras autenticarse. */
export function getRoleHome(role: UserRole, locale: string): string {
  const homeByRole: Record<UserRole, string> = {
    admin: `/${locale}/admin/dashboard`,
    coordinator: `/${locale}/admin/dashboard`,
    technician: `/${locale}/tecnico/ordenes`,
    client: `/${locale}/cliente/portal`,
  };
  return homeByRole[role];
}
