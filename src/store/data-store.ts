import { create } from "zustand";
import type {
  AppData,
  Client,
  WorkOrder,
  Quote,
  User,
  ScheduleEvent,
  OrderStatus,
} from "@/types";
import { loadData, saveData, resetData } from "@/lib/storage";
import { generateId, generateCode } from "@/lib/utils";

interface DataState extends AppData {
  // Actions
  init: () => void;
  reset: () => void;

  // Work Orders
  addWorkOrder: (order: Omit<WorkOrder, "id" | "code" | "createdAt" | "updatedAt" | "activity" | "evidence">) => WorkOrder;
  updateWorkOrder: (id: string, patch: Partial<WorkOrder>) => void;
  updateOrderStatus: (id: string, status: OrderStatus, note: string, userId: string, userName: string) => void;
  updateOrderProgress: (id: string, progress: number, note: string, userId: string, userName: string) => void;
  deleteWorkOrder: (id: string) => void;

  // Clients
  addClient: (client: Omit<Client, "id" | "createdAt" | "updatedAt">) => Client;
  updateClient: (id: string, patch: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Users (technicians)
  addUser: (user: Omit<User, "id" | "createdAt">) => User;
  updateUser: (id: string, patch: Partial<User>) => void;

  // Quotes
  addQuote: (quote: Omit<Quote, "id" | "code" | "createdAt" | "updatedAt">) => Quote;
  updateQuote: (id: string, patch: Partial<Quote>) => void;

  // Schedule
  addScheduleEvent: (event: Omit<ScheduleEvent, "id">) => ScheduleEvent;
  updateScheduleEvent: (id: string, patch: Partial<ScheduleEvent>) => void;
}

export const useDataStore = create<DataState>()((set, get) => {
  /** Aplica un cambio parcial al estado y lo persiste en localStorage a la vez. */
  const persist = (patch: Partial<AppData>) => {
    saveData({ ...get(), ...patch });
    set(patch);
  };

  return {
    users: [],
    clients: [],
    services: [],
    workOrders: [],
    quotes: [],
    scheduleEvents: [],

    init: () => {
      set(loadData());
    },

    reset: () => {
      set(resetData());
    },

    // ─── Work Orders ─────────────────────────────────────────────────────────────
    addWorkOrder: (order) => {
      const state = get();
      const newOrder: WorkOrder = {
        ...order,
        id: generateId("ot"),
        code: generateCode("OT", state.workOrders.length),
        evidence: [],
        activity: [
          {
            id: generateId("act"),
            action: "Orden creada",
            userId: order.createdBy,
            userName: state.users.find((u) => u.id === order.createdBy)?.name ?? "Sistema",
            timestamp: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      persist({ workOrders: [...state.workOrders, newOrder] });
      return newOrder;
    },

    updateWorkOrder: (id, patch) => {
      const workOrders = get().workOrders.map((o) =>
        o.id === id ? { ...o, ...patch, updatedAt: new Date().toISOString() } : o
      );
      persist({ workOrders });
    },

    updateOrderStatus: (id, status, note, userId, userName) => {
      const workOrders = get().workOrders.map((o) => {
        if (o.id !== id) return o;
        const activity = [
          ...o.activity,
          {
            id: generateId("act"),
            action: `Estado cambiado a: ${status}`,
            userId,
            userName,
            timestamp: new Date().toISOString(),
            notes: note || undefined,
          },
        ];
        return { ...o, status, activity, updatedAt: new Date().toISOString() };
      });
      persist({ workOrders });
    },

    updateOrderProgress: (id, progress, note, userId, userName) => {
      const workOrders = get().workOrders.map((o) => {
        if (o.id !== id) return o;
        const activity = [
          ...o.activity,
          {
            id: generateId("act"),
            action: `Avance actualizado al ${progress}%`,
            userId,
            userName,
            timestamp: new Date().toISOString(),
            notes: note || undefined,
          },
        ];
        return { ...o, progress, activity, updatedAt: new Date().toISOString() };
      });
      persist({ workOrders });
    },

    deleteWorkOrder: (id) => {
      persist({ workOrders: get().workOrders.filter((o) => o.id !== id) });
    },

    // ─── Clients ─────────────────────────────────────────────────────────────────
    addClient: (client) => {
      const newClient: Client = {
        ...client,
        id: generateId("c"),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      persist({ clients: [...get().clients, newClient] });
      return newClient;
    },

    updateClient: (id, patch) => {
      const clients = get().clients.map((c) =>
        c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c
      );
      persist({ clients });
    },

    deleteClient: (id) => {
      persist({ clients: get().clients.filter((c) => c.id !== id) });
    },

    // ─── Users ───────────────────────────────────────────────────────────────────
    addUser: (user) => {
      const newUser: User = {
        ...user,
        id: generateId("u"),
        createdAt: new Date().toISOString(),
      };
      persist({ users: [...get().users, newUser] });
      return newUser;
    },

    updateUser: (id, patch) => {
      const users = get().users.map((u) => (u.id === id ? { ...u, ...patch } : u));
      persist({ users });
    },

    // ─── Quotes ──────────────────────────────────────────────────────────────────
    addQuote: (quote) => {
      const newQuote: Quote = {
        ...quote,
        id: generateId("q"),
        code: generateCode("COT", get().quotes.length),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      persist({ quotes: [...get().quotes, newQuote] });
      return newQuote;
    },

    updateQuote: (id, patch) => {
      const quotes = get().quotes.map((q) =>
        q.id === id ? { ...q, ...patch, updatedAt: new Date().toISOString() } : q
      );
      persist({ quotes });
    },

    // ─── Schedule ────────────────────────────────────────────────────────────────
    addScheduleEvent: (event) => {
      const newEvent: ScheduleEvent = { ...event, id: generateId("ev") };
      persist({ scheduleEvents: [...get().scheduleEvents, newEvent] });
      return newEvent;
    },

    updateScheduleEvent: (id, patch) => {
      const scheduleEvents = get().scheduleEvents.map((e) =>
        e.id === id ? { ...e, ...patch } : e
      );
      persist({ scheduleEvents });
    },
  };
});
