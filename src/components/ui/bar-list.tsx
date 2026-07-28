"use client";

import { cn } from "@/lib/utils";

export interface BarListItem {
  key: string;
  label: string;
  value: number;
  /**
   * Color del mark. Para una sola serie, todas las filas comparten color: la
   * longitud ya codifica la magnitud, así que teñir por valor gastaría el canal
   * de identidad repitiendo lo que la barra dice.
   */
  color: string;
}

/**
 * Filas de barras horizontales: etiqueta, valor y barra sobre una pista.
 *
 * Sustituye a los gráficos de torta/barras con ejes para comparar magnitudes
 * entre categorías con nombres largos, que es donde una torta se vuelve
 * ilegible. Cada fila lleva su valor visible, así que el color nunca es el
 * único portador de información.
 */
export function BarList({
  items,
  unit,
  emptyMessage = "Sin datos",
  className,
}: {
  items: BarListItem[];
  /** Unidad para el tooltip y los lectores de pantalla, ej. "órdenes". */
  unit: string;
  emptyMessage?: string;
  className?: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-400 py-4">{emptyMessage}</p>;
  }

  // La escala se ancla al mayor valor, no al total: así la fila más alta llena
  // la pista y las diferencias entre categorías se leen a simple vista.
  const max = Math.max(...items.map((i) => i.value), 1);
  const total = items.reduce((sum, i) => sum + i.value, 0);

  return (
    <ul className={cn("space-y-4", className)}>
      {items.map((item) => {
        const share = total > 0 ? Math.round((item.value / total) * 100) : 0;
        return (
          <li
            key={item.key}
            // La fila entera es el objetivo de hover/foco (>=24px), no la barra
            // de 8px.
            tabIndex={0}
            className="group relative block rounded-md outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            <div className="flex items-baseline justify-between gap-4 mb-1.5">
              <span className="text-sm text-gray-600 truncate">{item.label}</span>
              <span className="text-sm font-semibold text-gray-900 tabular-nums flex-shrink-0">
                {item.value}
              </span>
            </div>

            {/* Pista + barra. La barra es cuadrada en la línea base y redondeada
                solo en el extremo del dato. */}
            <div className="h-2 w-full rounded-r-[4px] bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-r-[4px] transition-[width] duration-500 ease-out"
                style={{
                  width: `${(item.value / max) * 100}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>

            {/* El tooltip complementa; el valor ya está visible arriba. */}
            <div
              role="tooltip"
              className="pointer-events-none absolute -top-1 right-0 z-10 -translate-y-full rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              {item.value} {unit} · {share}%
            </div>
          </li>
        );
      })}
    </ul>
  );
}
