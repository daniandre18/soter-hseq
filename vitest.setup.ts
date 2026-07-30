import "@testing-library/jest-dom/vitest";

// Fecha/hora determinística en todos los entornos (local y CI).
process.env.TZ = "UTC";
