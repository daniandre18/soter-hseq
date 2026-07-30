import { describe, expect, it } from "vitest";
import { getRoleHome } from "./routes";

describe("getRoleHome", () => {
  it("manda admin y coordinator al dashboard", () => {
    expect(getRoleHome("admin", "es")).toBe("/es/admin/dashboard");
    expect(getRoleHome("coordinator", "es")).toBe("/es/admin/dashboard");
  });

  it("manda al técnico a sus órdenes", () => {
    expect(getRoleHome("technician", "es")).toBe("/es/tecnico/ordenes");
  });

  it("manda al cliente a su portal", () => {
    expect(getRoleHome("client", "es")).toBe("/es/cliente/portal");
  });

  it("respeta el locale recibido", () => {
    expect(getRoleHome("admin", "en")).toBe("/en/admin/dashboard");
  });
});
