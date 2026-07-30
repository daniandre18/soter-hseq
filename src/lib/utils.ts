import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type {
  OrderStatus,
  OrderPriority,
  QuoteStatus,
  ScheduleEvent,
  UserRole,
  ServiceCategory,
} from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "COP"): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string, locale = "es-CO"): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string, locale = "es-CO"): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export function generateId(prefix = "id"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function generateCode(prefix: string, total: number): string {
  const year = new Date().getFullYear();
  const num = String(total + 1).padStart(3, "0");
  return `${prefix}-${year}-${num}`;
}

// ─── Status helpers ────────────────────────────────────────────────────────────

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; labelEn: string; color: string; bg: string; dot: string; hex: string }
> = {
  // `hex` es el mismo color que `dot`, pero como valor CSS real: lo necesitan
  // los contextos que no pueden usar clases de Tailwind (fill de SVG, `style`
  // inline), como el pie chart del dashboard. Validado con el script del
  // skill de dataviz sobre superficie blanca: todos >=3:1 de contraste y el
  // peor par adyacente (ámbar/verde) a ΔE 7.3 bajo deuteranopía — admisible
  // porque cada fila del pie chart muestra su etiqueta y su valor, nunca solo
  // el color.
  pending:     { label: "Pendiente",    labelEn: "Pending",     color: "text-gray-700",  bg: "bg-gray-100",   dot: "bg-gray-400",   hex: "#6b7280" },
  assigned:    { label: "Asignada",     labelEn: "Assigned",    color: "text-blue-700",  bg: "bg-blue-100",   dot: "bg-blue-500",   hex: "#2563eb" },
  in_progress: { label: "En Proceso",   labelEn: "In Progress", color: "text-amber-700", bg: "bg-amber-100",  dot: "bg-amber-500",  hex: "#b45309" },
  completed:   { label: "Completada",   labelEn: "Completed",   color: "text-green-700", bg: "bg-green-100",  dot: "bg-green-500",  hex: "#16a34a" },
  closed:      { label: "Cerrada",      labelEn: "Closed",      color: "text-indigo-700",bg: "bg-indigo-100", dot: "bg-indigo-500", hex: "#4f46e5" },
  overdue:     { label: "Vencida",      labelEn: "Overdue",     color: "text-red-700",   bg: "bg-red-100",    dot: "bg-red-500",    hex: "#dc2626" },
  cancelled:   { label: "Cancelada",    labelEn: "Cancelled",   color: "text-gray-500",  bg: "bg-gray-50",    dot: "bg-gray-300",   hex: "#d1d5db" },
};

export const PRIORITY_CONFIG: Record<
  OrderPriority,
  { label: string; labelEn: string; color: string; bg: string }
> = {
  low:      { label: "Baja",     labelEn: "Low",      color: "text-gray-600",  bg: "bg-gray-100" },
  medium:   { label: "Media",    labelEn: "Medium",   color: "text-blue-600",  bg: "bg-blue-100" },
  high:     { label: "Alta",     labelEn: "High",     color: "text-orange-600",bg: "bg-orange-100" },
  critical: { label: "Crítica",  labelEn: "Critical", color: "text-red-600",   bg: "bg-red-100" },
};

export const QUOTE_STATUS_CONFIG: Record<
  QuoteStatus,
  { label: string; labelEn: string; color: string; bg: string }
> = {
  draft:     { label: "Borrador",  labelEn: "Draft",     color: "text-gray-600",  bg: "bg-gray-100" },
  sent:      { label: "Enviada",   labelEn: "Sent",      color: "text-blue-600",  bg: "bg-blue-100" },
  approved:  { label: "Aprobada",  labelEn: "Approved",  color: "text-green-600", bg: "bg-green-100" },
  rejected:  { label: "Rechazada", labelEn: "Rejected",  color: "text-red-600",   bg: "bg-red-100" },
  converted: { label: "Convertida",labelEn: "Converted", color: "text-purple-600",bg: "bg-purple-100" },
};

export const SCHEDULE_EVENT_STATUS_CONFIG: Record<
  ScheduleEvent["status"],
  { label: string; labelEn: string; color: string; bg: string }
> = {
  scheduled: { label: "Programada", labelEn: "Scheduled", color: "text-blue-700",  bg: "bg-blue-100" },
  confirmed: { label: "Confirmada", labelEn: "Confirmed", color: "text-green-700", bg: "bg-green-100" },
  completed: { label: "Completada", labelEn: "Completed", color: "text-gray-500",  bg: "bg-gray-100" },
  cancelled: { label: "Cancelada",  labelEn: "Cancelled", color: "text-red-400",   bg: "bg-red-50" },
};

export const ROLE_CONFIG: Record<UserRole, { label: string; labelEn: string }> = {
  admin:       { label: "Administrador", labelEn: "Administrator" },
  coordinator: { label: "Coordinador",   labelEn: "Coordinator" },
  technician:  { label: "Técnico",       labelEn: "Technician" },
  client:      { label: "Cliente",       labelEn: "Client" },
};

export const CATEGORY_CONFIG: Record<
  ServiceCategory,
  { label: string; labelEn: string; color: string }
> = {
  higiene:       { label: "Higiene Industrial",  labelEn: "Industrial Hygiene",   color: "text-cyan-700 bg-cyan-100" },
  seguridad:     { label: "Seguridad",           labelEn: "Safety",               color: "text-orange-700 bg-orange-100" },
  ambiental:     { label: "Medio Ambiente",      labelEn: "Environment",          color: "text-green-700 bg-green-100" },
  calidad:       { label: "Calidad",             labelEn: "Quality",              color: "text-purple-700 bg-purple-100" },
  capacitacion:  { label: "Capacitación",        labelEn: "Training",             color: "text-blue-700 bg-blue-100" },
  inspeccion:    { label: "Inspección",          labelEn: "Inspection",           color: "text-yellow-700 bg-yellow-100" },
};

export function isOverdue(dueDate: string, status: OrderStatus): boolean {
  if (["closed", "completed", "cancelled"].includes(status)) return false;
  return new Date(dueDate) < new Date();
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

/**
 * Fecha del calendario local en formato YYYY-MM-DD.
 *
 * `toISOString().slice(0, 10)` devuelve la fecha en UTC, que no es la misma que
 * la del usuario: en Colombia (UTC−5) a partir de las 19:00 ya corresponde al
 * día siguiente, así que "hoy" se calcularía mal toda la noche.
 */
export function toLocalISODate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
