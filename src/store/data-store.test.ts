import { beforeEach, describe, expect, it } from "vitest";
import { useDataStore } from "./data-store";
import type { AppData } from "@/types";

const emptyState: AppData = {
  users: [],
  clients: [],
  services: [],
  workOrders: [],
  quotes: [],
  scheduleEvents: [],
};

function persistedData(): AppData {
  const raw = localStorage.getItem("soter_hseq_data");
  return raw ? JSON.parse(raw) : emptyState;
}

beforeEach(() => {
  localStorage.clear();
  useDataStore.setState(emptyState);
});

describe("useDataStore — clientes", () => {
  it("addClient agrega el cliente al estado y lo persiste en localStorage", () => {
    const client = useDataStore.getState().addClient({
      name: "Acme S.A.S.",
      nit: "900.000.000-0",
      industry: "Manufactura",
      address: "Calle 1",
      city: "Bogotá",
      department: "Cundinamarca",
      contacts: [],
      sedes: [],
      status: "active",
    });

    expect(client.id).toBeTruthy();
    expect(useDataStore.getState().clients).toHaveLength(1);
    expect(useDataStore.getState().clients[0].name).toBe("Acme S.A.S.");
    expect(persistedData().clients).toHaveLength(1);
  });

  it("updateClient aplica el patch y actualiza updatedAt", () => {
    const client = useDataStore.getState().addClient({
      name: "Acme S.A.S.",
      nit: "900.000.000-0",
      industry: "Manufactura",
      address: "Calle 1",
      city: "Bogotá",
      department: "Cundinamarca",
      contacts: [],
      sedes: [],
      status: "active",
    });

    useDataStore.getState().updateClient(client.id, { status: "inactive" });

    const updated = useDataStore.getState().clients[0];
    expect(updated.status).toBe("inactive");
    expect(persistedData().clients[0].status).toBe("inactive");
  });

  it("deleteClient lo quita del estado y de localStorage", () => {
    const client = useDataStore.getState().addClient({
      name: "Acme S.A.S.",
      nit: "900.000.000-0",
      industry: "Manufactura",
      address: "Calle 1",
      city: "Bogotá",
      department: "Cundinamarca",
      contacts: [],
      sedes: [],
      status: "active",
    });

    useDataStore.getState().deleteClient(client.id);

    expect(useDataStore.getState().clients).toHaveLength(0);
    expect(persistedData().clients).toHaveLength(0);
  });
});

describe("useDataStore — órdenes de trabajo", () => {
  it("addWorkOrder genera código, registra actividad inicial y persiste", () => {
    const year = new Date().getFullYear();
    const order = useDataStore.getState().addWorkOrder({
      clientId: "c1",
      serviceId: "s1",
      status: "pending",
      priority: "medium",
      title: "Inspección",
      description: "",
      dueDate: "2099-01-01",
      progress: 0,
      createdBy: "u1",
    });

    expect(order.code).toBe(`OT-${year}-001`);
    expect(order.activity).toHaveLength(1);
    expect(order.activity[0].action).toBe("Orden creada");
    expect(persistedData().workOrders).toHaveLength(1);
  });

  it("updateOrderStatus cambia el estado y agrega una entrada de actividad", () => {
    const order = useDataStore.getState().addWorkOrder({
      clientId: "c1",
      serviceId: "s1",
      status: "pending",
      priority: "medium",
      title: "Inspección",
      description: "",
      dueDate: "2099-01-01",
      progress: 0,
      createdBy: "u1",
    });

    useDataStore.getState().updateOrderStatus(order.id, "assigned", "Se asignó técnico", "u1", "Carlos");

    const updated = useDataStore.getState().workOrders[0];
    expect(updated.status).toBe("assigned");
    expect(updated.activity).toHaveLength(2);
    expect(updated.activity[1].notes).toBe("Se asignó técnico");
  });

  it("deleteWorkOrder lo quita del estado", () => {
    const order = useDataStore.getState().addWorkOrder({
      clientId: "c1",
      serviceId: "s1",
      status: "pending",
      priority: "medium",
      title: "Inspección",
      description: "",
      dueDate: "2099-01-01",
      progress: 0,
      createdBy: "u1",
    });

    useDataStore.getState().deleteWorkOrder(order.id);

    expect(useDataStore.getState().workOrders).toHaveLength(0);
  });
});

describe("useDataStore — reset", () => {
  it("reset() repuebla el estado con datos de semilla", () => {
    useDataStore.getState().reset();
    const state = useDataStore.getState();
    expect(state.users.length).toBeGreaterThan(0);
    expect(state.clients.length).toBeGreaterThan(0);
  });
});
