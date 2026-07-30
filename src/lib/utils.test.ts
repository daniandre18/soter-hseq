import { describe, expect, it } from "vitest";
import {
  cn,
  formatCurrency,
  formatDate,
  generateCode,
  generateId,
  getInitials,
  isOverdue,
  toLocalISODate,
} from "./utils";

describe("cn", () => {
  it("une clases truthy y descarta las falsy", () => {
    expect(cn("a", false && "b", undefined, "c")).toBe("a c");
  });
});

describe("formatCurrency", () => {
  it("formatea un monto en COP sin decimales", () => {
    expect(formatCurrency(1_000_000)).toContain("1.000.000");
  });
});

describe("formatDate", () => {
  it("no lanza y refleja el año de la fecha dada", () => {
    expect(formatDate("2024-01-15")).toContain("2024");
  });

  it("devuelve el string original si la fecha es inválida", () => {
    expect(formatDate("no-es-una-fecha")).toBe("no-es-una-fecha");
  });
});

describe("generateId", () => {
  it("usa el prefijo dado y agrega un sufijo aleatorio", () => {
    expect(generateId("ot")).toMatch(/^ot-\d+-[a-z0-9]{5}$/);
  });

  it("usa 'id' como prefijo por defecto", () => {
    expect(generateId()).toMatch(/^id-\d+-[a-z0-9]{5}$/);
  });
});

describe("generateCode", () => {
  it("arma el código con año actual y consecutivo con padding", () => {
    const year = new Date().getFullYear();
    expect(generateCode("OT", 4)).toBe(`OT-${year}-005`);
    expect(generateCode("COT", 0)).toBe(`COT-${year}-001`);
  });
});

describe("isOverdue", () => {
  it("es true cuando la fecha límite ya pasó y la orden sigue abierta", () => {
    expect(isOverdue("2000-01-01", "pending")).toBe(true);
  });

  it("es false cuando la orden ya está cerrada, aunque venció", () => {
    expect(isOverdue("2000-01-01", "closed")).toBe(false);
    expect(isOverdue("2000-01-01", "completed")).toBe(false);
    expect(isOverdue("2000-01-01", "cancelled")).toBe(false);
  });

  it("es false cuando la fecha límite todavía no llega", () => {
    expect(isOverdue("2999-01-01", "pending")).toBe(false);
  });
});

describe("getInitials", () => {
  it("toma la primera letra de los dos primeros nombres", () => {
    expect(getInitials("Carlos Méndez")).toBe("CM");
  });

  it("funciona con un solo nombre", () => {
    expect(getInitials("Carlos")).toBe("C");
  });
});

describe("toLocalISODate", () => {
  it("formatea una fecha local como YYYY-MM-DD", () => {
    expect(toLocalISODate(new Date(2024, 0, 5))).toBe("2024-01-05");
  });
});
