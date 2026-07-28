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

export const useDataStore = create<DataState>()((set, get) => ({
  users: [],
  clients: [],
  services: [],
  workOrders: [],
  quotes: [],
  scheduleEvents: [],

  init: () => {
    const data = loadData();
    set(data);
  },

  reset: () => {
    const data = resetData();
    set(data);
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

    const workOrders = [...state.workOrders, newOrder];
    const next = { ...state, workOrders };
    saveData(next);
    set({ workOrders });
    return newOrder;
  },

  updateWorkOrder: (id, patch) => {
    const state = get();
    const workOrders = state.workOrders.map((o) =>
      o.id === id ? { ...o, ...patch, updatedAt: new Date().toISOString() } : o
    );
    saveData({ ...state, workOrders });
    set({ workOrders });
  },

  updateOrderStatus: (id, status, note, userId, userName) => {
    const state = get();
    const workOrders = state.workOrders.map((o) => {
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
    saveData({ ...state, workOrders });
    set({ workOrders });
  },

  updateOrderProgress: (id, progress, note, userId, userName) => {
    const state = get();
    const workOrders = state.workOrders.map((o) => {
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
    saveData({ ...state, workOrders });
    set({ workOrders });
  },

  deleteWorkOrder: (id) => {
    const state = get();
    const workOrders = state.workOrders.filter((o) => o.id !== id);
    saveData({ ...state, workOrders });
    set({ workOrders });
  },

  // ─── Clients ─────────────────────────────────────────────────────────────────
  addClient: (client) => {
    const state = get();
    const newClient: Client = {
      ...client,
      id: generateId("c"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const clients = [...state.clients, newClient];
    saveData({ ...state, clients });
    set({ clients });
    return newClient;
  },

  updateClient: (id, patch) => {
    const state = get();
    const clients = state.clients.map((c) =>
      c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c
    );
    saveData({ ...state, clients });
    set({ clients });
  },

  deleteClient: (id) => {
    const state = get();
    const clients = state.clients.filter((c) => c.id !== id);
    saveData({ ...state, clients });
    set({ clients });
  },

  // ─── Users ───────────────────────────────────────────────────────────────────
  addUser: (user) => {
    const state = get();
    const newUser: User = {
      ...user,
      id: generateId("u"),
      createdAt: new Date().toISOString(),
    };
    const users = [...state.users, newUser];
    saveData({ ...state, users });
    set({ users });
    return newUser;
  },

  updateUser: (id, patch) => {
    const state = get();
    const users = state.users.map((u) => (u.id === id ? { ...u, ...patch } : u));
    saveData({ ...state, users });
    set({ users });
  },

  // ─── Quotes ──────────────────────────────────────────────────────────────────
  addQuote: (quote) => {
    const state = get();
    const newQuote: Quote = {
      ...quote,
      id: generateId("q"),
      code: generateCode("COT", state.quotes.length),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const quotes = [...state.quotes, newQuote];
    saveData({ ...state, quotes });
    set({ quotes });
    return newQuote;
  },

  updateQuote: (id, patch) => {
    const state = get();
    const quotes = state.quotes.map((q) =>
      q.id === id ? { ...q, ...patch, updatedAt: new Date().toISOString() } : q
    );
    saveData({ ...state, quotes });
    set({ quotes });
  },

  // ─── Schedule ────────────────────────────────────────────────────────────────
  addScheduleEvent: (event) => {
    const state = get();
    const newEvent: ScheduleEvent = { ...event, id: generateId("ev") };
    const scheduleEvents = [...state.scheduleEvents, newEvent];
    saveData({ ...state, scheduleEvents });
    set({ scheduleEvents });
    return newEvent;
  },

  updateScheduleEvent: (id, patch) => {
    const state = get();
    const scheduleEvents = state.scheduleEvents.map((e) =>
      e.id === id ? { ...e, ...patch } : e
    );
    saveData({ ...state, scheduleEvents });
    set({ scheduleEvents });
  },
}));
