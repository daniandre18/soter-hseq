import { describe, expect, it } from "vitest";
import {
  buildQuoteItems,
  computeItemsTotal,
  computeRowTotal,
  defaultValidUntil,
  getValidDraftItems,
  nextQuoteStatuses,
  type DraftQuoteItem,
} from "./quotes";
import type { Service } from "@/types";

const service: Service = {
  id: "s1",
  name: "Inspección de Seguridad",
  description: "",
  category: "seguridad",
  price: 500_000,
  unit: "visita",
  duration: 4,
  active: true,
};

describe("defaultValidUntil", () => {
  it("suma 30 días a la fecha dada", () => {
    expect(defaultValidUntil(new Date(2024, 0, 1))).toBe("2024-01-31");
  });
});

describe("computeRowTotal", () => {
  it("multiplica cantidad por valor unitario", () => {
    expect(computeRowTotal({ quantity: "3", unitPrice: "1000" })).toBe(3000);
  });

  it("trata valores no numéricos como 0", () => {
    expect(computeRowTotal({ quantity: "", unitPrice: "1000" })).toBe(0);
  });
});

describe("getValidDraftItems", () => {
  const rows: DraftQuoteItem[] = [
    { serviceId: "s1", quantity: "2", unitPrice: "100", notes: "" },
    { serviceId: "", quantity: "2", unitPrice: "100", notes: "" }, // sin servicio
    { serviceId: "s1", quantity: "0", unitPrice: "100", notes: "" }, // cantidad inválida
  ];

  it("descarta filas sin servicio o con cantidad <= 0", () => {
    expect(getValidDraftItems(rows)).toHaveLength(1);
  });
});

describe("computeItemsTotal", () => {
  it("suma el total de todas las filas", () => {
    const rows: DraftQuoteItem[] = [
      { serviceId: "s1", quantity: "2", unitPrice: "100", notes: "" },
      { serviceId: "s2", quantity: "1", unitPrice: "50", notes: "" },
    ];
    expect(computeItemsTotal(rows)).toBe(250);
  });
});

describe("buildQuoteItems", () => {
  it("arma los QuoteItem a partir de las filas válidas y el catálogo de servicios", () => {
    const rows: DraftQuoteItem[] = [
      { serviceId: "s1", quantity: "2", unitPrice: "500000", notes: "urgente" },
      { serviceId: "", quantity: "1", unitPrice: "100", notes: "" },
    ];

    const items = buildQuoteItems(rows, [service]);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      serviceId: "s1",
      serviceName: "Inspección de Seguridad",
      quantity: 2,
      unitPrice: 500000,
      total: 1000000,
      notes: "urgente",
    });
  });
});

describe("nextQuoteStatuses", () => {
  it("draft solo puede pasar a sent", () => {
    expect(nextQuoteStatuses("draft")).toEqual(["sent"]);
  });

  it("sent puede aprobarse o rechazarse", () => {
    expect(nextQuoteStatuses("sent")).toEqual(["approved", "rejected"]);
  });

  it("approved puede convertirse", () => {
    expect(nextQuoteStatuses("approved")).toEqual(["converted"]);
  });

  it("rejected y converted son estados finales", () => {
    expect(nextQuoteStatuses("rejected")).toEqual([]);
    expect(nextQuoteStatuses("converted")).toEqual([]);
  });
});
