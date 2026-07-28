/**
 * La semilla está escrita sobre una línea de tiempo fija (julio de 2024). Si se
 * publica tal cual, el dashboard envejece: "Visitas Hoy" queda en cero y
 * "Próximas Visitas" vacío para siempre.
 *
 * En vez de reescribir cada fecha a mano, aquí se desplaza la línea de tiempo
 * completa para que el "hoy" de la semilla caiga en el día real. Las relaciones
 * entre fechas (creada antes que programada, iniciada antes que completada) se
 * conservan intactas porque todo se mueve el mismo número de días.
 */

import type { AppData } from "@/types";

/** El "hoy" implícito de la semilla: el día de la orden en ejecución. */
const SEED_TODAY = "2024-07-27";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

const MS_PER_DAY = 86_400_000;

function toUtcDay(iso: string): number {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

/**
 * Días enteros a sumar para que SEED_TODAY caiga en `today`.
 *
 * Se toma el día del calendario local, no el UTC, porque es contra ese día que
 * el dashboard y la agenda comparan sus fechas.
 */
function offsetDays(today: Date): number {
  const realToday = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  return Math.round((realToday - toUtcDay(SEED_TODAY)) / MS_PER_DAY);
}

function shiftDateOnly(iso: string, days: number): string {
  return new Date(toUtcDay(iso) + days * MS_PER_DAY).toISOString().slice(0, 10);
}

function shiftDateTime(iso: string, days: number): string {
  const shifted = shiftDateOnly(iso.slice(0, 10), days);
  return shifted + iso.slice(10);
}

/**
 * Recorre la estructura y desplaza toda cadena que sea una fecha ISO.
 *
 * Solo se tocan cadenas que calzan el formato completo, así que códigos como
 * "OT-2024-001" quedan intactos: llevan prefijo y no calzan.
 */
function shiftDates<T>(value: T, days: number): T {
  if (typeof value === "string") {
    if (DATE_TIME.test(value)) return shiftDateTime(value, days) as unknown as T;
    if (DATE_ONLY.test(value)) return shiftDateOnly(value, days) as unknown as T;
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => shiftDates(item, days)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      out[key] = shiftDates(val, days);
    }
    return out as T;
  }
  return value;
}

/**
 * Los códigos llevan el año dentro ("OT-2024-001") pero son cadenas con
 * prefijo, así que el desplazamiento de fechas no los toca. Si no se
 * renumeran, una orden con fecha de 2026 sigue mostrando un código de 2024.
 */
const CODE_WITH_YEAR = /^([A-Z]+)-\d{4}-(.+)$/;

function renumberCode(code: string, referenceDate: string): string {
  const match = CODE_WITH_YEAR.exec(code);
  if (!match) return code;
  return `${match[1]}-${referenceDate.slice(0, 4)}-${match[2]}`;
}

/** Reubica la línea de tiempo completa de la semilla sobre la fecha dada. */
export function alignToToday(data: AppData, today: Date = new Date()): AppData {
  const days = offsetDays(today);
  if (days === 0) return data;

  const shifted = shiftDates(data, days);

  return {
    ...shifted,
    workOrders: shifted.workOrders.map((order) => ({
      ...order,
      code: renumberCode(order.code, order.createdAt),
    })),
    quotes: shifted.quotes.map((quote) => ({
      ...quote,
      code: renumberCode(quote.code, quote.createdAt),
    })),
  };
}
