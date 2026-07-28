/**
 * localStorage abstraction layer for demo data.
 * All reads/writes go through here so the rest of the app
 * is decoupled from the storage mechanism.
 */

import type { AppData } from "@/types";
import { SEED_DATA } from "./seed-data";

const STORAGE_KEY = "soter_hseq_data";
const STORAGE_VERSION = "1";
const VERSION_KEY = "soter_hseq_version";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** Load data from localStorage, seeding it if it doesn't exist yet. */
export function loadData(): AppData {
  if (!isBrowser()) return SEED_DATA;

  try {
    const version = localStorage.getItem(VERSION_KEY);
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw || version !== STORAGE_VERSION) {
      // First run or version bump — seed with demo data
      saveData(SEED_DATA);
      localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
      return SEED_DATA;
    }

    return JSON.parse(raw) as AppData;
  } catch {
    saveData(SEED_DATA);
    return SEED_DATA;
  }
}

/** Persist the full data object. */
export function saveData(data: AppData): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Reset demo data to seed state. */
export function resetData(): AppData {
  if (!isBrowser()) return SEED_DATA;
  saveData(SEED_DATA);
  localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
  return SEED_DATA;
}
