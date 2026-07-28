/**
 * localStorage abstraction layer for demo data.
 * All reads/writes go through here so the rest of the app
 * is decoupled from the storage mechanism.
 */

import type { AppData } from "@/types";
import { SEED_DATA } from "./seed-data";
import { alignToToday } from "./demo-timeline";
import { buildGeneratedOrders } from "./demo-orders";

const STORAGE_KEY = "soter_hseq_data";
// Subir esta versión invalida el localStorage de quien ya visitó el demo, para
// que reciba los datos nuevos en vez de quedarse con la semilla vieja.
const STORAGE_VERSION = "2";
const VERSION_KEY = "soter_hseq_version";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Semilla lista para usar: la línea de tiempo reubicada sobre hoy y las órdenes
 * generadas encima de las escritas a mano.
 *
 * Se construye bajo demanda porque depende de la fecha actual: así el demo no
 * envejece aunque nadie lo toque en meses.
 */
function buildSeed(): AppData {
  const aligned = alignToToday(SEED_DATA);
  const generated = buildGeneratedOrders();
  return {
    ...aligned,
    workOrders: [...aligned.workOrders, ...generated.orders],
    scheduleEvents: [...aligned.scheduleEvents, ...generated.events],
  };
}

/** Load data from localStorage, seeding it if it doesn't exist yet. */
export function loadData(): AppData {
  if (!isBrowser()) return buildSeed();

  try {
    const version = localStorage.getItem(VERSION_KEY);
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw || version !== STORAGE_VERSION) {
      // First run or version bump — seed with demo data
      return resetData();
    }

    return JSON.parse(raw) as AppData;
  } catch {
    return resetData();
  }
}

/** Persist the full data object. */
export function saveData(data: AppData): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Reset demo data to seed state. */
export function resetData(): AppData {
  const data = buildSeed();
  if (!isBrowser()) return data;
  saveData(data);
  localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
  return data;
}
