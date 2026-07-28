"use client";

import { useState } from "react";

export interface PieSlice {
  key: string;
  label: string;
  value: number;
  color: string;
}

const SURFACE = "#ffffff";

/** Punto del círculo para un ángulo en grados, midiendo desde las 12 en punto. */
function pointAt(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/**
 * Torta en SVG, sin librería de gráficas.
 *
 * Se dibuja a mano porque la única dependencia que la habría dado (recharts)
 * pesaba más que el resto del dashboard junto, y aquí solo hace falta esto.
 *
 * La leyenda va siempre: con seis porciones, el color por sí solo no es un
 * canal de identidad fiable, así que cada estado se nombra y se cuantifica.
 */
export function PieChart({
  slices,
  unit,
  size = 200,
  emptyMessage = "Sin datos",
}: {
  slices: PieSlice[];
  unit: string;
  size?: number;
  emptyMessage?: string;
}) {
  const [active, setActive] = useState<string | null>(null);

  const total = slices.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) {
    return <p className="text-sm text-gray-400 py-4">{emptyMessage}</p>;
  }

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2; // deja aire para el borde de separación

  let cursor = 0;
  const arcs = slices.map((slice) => {
    const sweep = (slice.value / total) * 360;
    const start = cursor;
    const end = cursor + sweep;
    cursor = end;

    // Una sola porción cubre el círculo completo: el arco degeneraría en un
    // punto, así que se dibuja como círculo.
    if (sweep >= 359.99) {
      return { ...slice, path: null as string | null, share: 100 };
    }

    const p0 = pointAt(cx, cy, r, start);
    const p1 = pointAt(cx, cy, r, end);
    const largeArc = sweep > 180 ? 1 : 0;

    return {
      ...slice,
      path: `M ${cx} ${cy} L ${p0.x} ${p0.y} A ${r} ${r} 0 ${largeArc} 1 ${p1.x} ${p1.y} Z`,
      share: Math.round((slice.value / total) * 100),
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="flex-shrink-0"
        role="img"
        aria-label={`Distribución de ${total} ${unit}: ${slices
          .map((s) => `${s.label} ${s.value}`)
          .join(", ")}`}
      >
        {arcs.map((arc) => {
          const dimmed = active !== null && active !== arc.key;
          const common = {
            fill: arc.color,
            // El trazo del color de la superficie es el que separa porciones
            // vecinas; no es un borde decorativo.
            stroke: SURFACE,
            strokeWidth: 2,
            opacity: dimmed ? 0.35 : 1,
            className: "transition-opacity duration-150 cursor-default",
            onMouseEnter: () => setActive(arc.key),
            onMouseLeave: () => setActive(null),
          };
          return arc.path === null ? (
            <circle key={arc.key} cx={cx} cy={cy} r={r} {...common} />
          ) : (
            <path key={arc.key} d={arc.path} {...common} />
          );
        })}
      </svg>

      <ul className="w-full space-y-2">
        {arcs.map((arc) => (
          <li
            key={arc.key}
            tabIndex={0}
            onMouseEnter={() => setActive(arc.key)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(arc.key)}
            onBlur={() => setActive(null)}
            className="flex items-center gap-2.5 text-sm rounded-md px-1 -mx-1 outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <span
              aria-hidden
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: arc.color }}
            />
            <span className="text-gray-600 truncate">{arc.label}</span>
            <span className="ml-auto flex items-baseline gap-2 flex-shrink-0">
              <span className="font-semibold text-gray-900 tabular-nums">{arc.value}</span>
              <span className="text-xs text-gray-400 tabular-nums w-9 text-right">
                {arc.share}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
