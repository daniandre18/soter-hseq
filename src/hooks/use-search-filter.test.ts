import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSearchFilter } from "./use-search-filter";

describe("useSearchFilter", () => {
  it("arranca con búsqueda vacía y filtro 'all' por defecto", () => {
    const { result } = renderHook(() => useSearchFilter());
    expect(result.current.search).toBe("");
    expect(result.current.statusFilter).toBe("all");
  });

  it("permite un filtro inicial distinto de 'all'", () => {
    const { result } = renderHook(() => useSearchFilter("active"));
    expect(result.current.statusFilter).toBe("active");
  });

  it("actualiza search y statusFilter de forma independiente", () => {
    const { result } = renderHook(() => useSearchFilter());

    act(() => result.current.setSearch("acme"));
    expect(result.current.search).toBe("acme");
    expect(result.current.statusFilter).toBe("all");

    act(() => result.current.setStatusFilter("inactive"));
    expect(result.current.search).toBe("acme");
    expect(result.current.statusFilter).toBe("inactive");
  });
});
