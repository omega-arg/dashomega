
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { Role } from "@prisma/client";

export async function getAuthSession() {
  return await getServerSession(authOptions);
}

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  OWNER: ["all"],
  ADMIN_GENERAL: ["manage_employees", "view_finances", "manage_tasks", "view_reports"],
  ENCARGADO_ENTREGAS: ["manage_orders", "view_deliveries"],
  AT_CLIENTE: ["create_orders", "upload_payments", "view_own_orders"],
  SOPORTE: ["chat", "view_support_tickets"],
  ENCARGADO_PAGO_MEXICO: ["confirm_payments_mexico", "view_payments"],
  ENCARGADO_PAGO_PERU: ["confirm_payments_peru", "view_payments"],
  ENCARGADO_PAGO_COLOMBIA: ["confirm_payments_colombia", "view_payments"],
  ENCARGADO_PAGO_ZELLE: ["confirm_payments_zelle", "view_payments"],
  RECLUTADOR: ["manage_recruitment", "view_candidates"],
  MARKETING: ["manage_campaigns", "view_analytics"],
  DISEÑADOR: ["manage_designs", "view_projects"],
  GESTOR_CONTENIDO: ["manage_content", "view_content_analytics"],
  FINANZAS: ["view_all_finances", "generate_reports", "manage_commissions"],
  CHETADORES: ["view_cheats_panel", "manage_accounts"],
};

export function hasPermission(userRole: Role | string, permission: string): boolean {
  if (userRole === "OWNER") return true;
  
  const rolePermissions = ROLE_PERMISSIONS[userRole as Role];
  if (!rolePermissions) return false;
  
  return rolePermissions.includes("all") || rolePermissions.includes(permission);
}

export const ROLE_LABELS = {
  OWNER: "Owner",
  ADMIN_GENERAL: "Admin General",
  ENCARGADO_ENTREGAS: "Encargado Entregas",
  AT_CLIENTE: "AT Cliente",
  SOPORTE: "Soporte",
  ENCARGADO_PAGO_MEXICO: "Encargado Pago México",
  ENCARGADO_PAGO_PERU: "Encargado Pago Perú",
  ENCARGADO_PAGO_COLOMBIA: "Encargado Pago Colombia",
  ENCARGADO_PAGO_ZELLE: "Encargado Pago Zelle",
  RECLUTADOR: "Reclutador",
  MARKETING: "Marketing",
  DISEÑADOR: "Diseñador",
  GESTOR_CONTENIDO: "Gestor Contenido",
  FINANZAS: "Finanzas",
  CHETADORES: "Chetadores",
} as const;
