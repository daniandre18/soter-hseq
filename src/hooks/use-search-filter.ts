"use client";

import { useState } from "react";

/**
 * Estado de "búsqueda por texto + filtro por estado" que repiten las páginas
 * de listado (clientes, técnicos, órdenes, cotizaciones). Solo el estado se
 * comparte: cada página conserva su propio `useMemo` de filtrado porque
 * compara campos distintos.
 */
export function useSearchFilter(initialStatus = "all") {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  return { search, setSearch, statusFilter, setStatusFilter };
}
