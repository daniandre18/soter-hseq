import type { QuoteItem, QuoteStatus, Service } from "@/types";

/** Fila de servicio en el formulario de nueva cotización, antes de validar. */
export interface DraftQuoteItem {
  serviceId: string;
  quantity: string;
  unitPrice: string;
  notes: string;
}

export const EMPTY_DRAFT_ITEM: DraftQuoteItem = {
  serviceId: "",
  quantity: "1",
  unitPrice: "",
  notes: "",
};

/** Fecha de vigencia por defecto: 30 días a partir de hoy (o de `from`). */
export function defaultValidUntil(from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

export function computeRowTotal(row: Pick<DraftQuoteItem, "quantity" | "unitPrice">): number {
  return (Number(row.quantity) || 0) * (Number(row.unitPrice) || 0);
}

/** Filas listas para cotizar: con servicio elegido y cantidad positiva. */
export function getValidDraftItems(items: DraftQuoteItem[]): DraftQuoteItem[] {
  return items.filter((row) => row.serviceId && Number(row.quantity) > 0);
}

export function computeItemsTotal(items: DraftQuoteItem[]): number {
  return items.reduce((sum, row) => sum + computeRowTotal(row), 0);
}

/** Convierte las filas válidas del formulario en los `QuoteItem` que espera el store. */
export function buildQuoteItems(items: DraftQuoteItem[], services: Service[]): QuoteItem[] {
  return getValidDraftItems(items).map((row) => {
    const service = services.find((s) => s.id === row.serviceId)!;
    const quantity = Number(row.quantity);
    const unitPrice = Number(row.unitPrice) || 0;
    return {
      serviceId: service.id,
      serviceName: service.name,
      quantity,
      unitPrice,
      total: quantity * unitPrice,
      notes: row.notes || undefined,
    };
  });
}

// ─── Transiciones de estado ─────────────────────────────────────────────────
const QUOTE_TRANSITIONS: Partial<Record<QuoteStatus, QuoteStatus[]>> = {
  draft: ["sent"],
  sent: ["approved", "rejected"],
  approved: ["converted"],
};

/** Próximos estados válidos para una cotización, según su estado actual. */
export function nextQuoteStatuses(status: QuoteStatus): QuoteStatus[] {
  return QUOTE_TRANSITIONS[status] ?? [];
}
