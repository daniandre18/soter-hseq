// ─── Roles ────────────────────────────────────────────────────────────────────
export type UserRole = "admin" | "coordinator" | "technician" | "client";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  specialty?: string; // for technicians
  clientId?: string;  // for client users
  active: boolean;
  createdAt: string;
}

// ─── Client (Company) ─────────────────────────────────────────────────────────
export interface ClientContact {
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface ClientSede {
  id: string;
  name: string;
  address: string;
  city: string;
  department: string;
}

export interface Client {
  id: string;
  name: string;
  nit: string;
  industry: string;
  address: string;
  city: string;
  department: string;
  contacts: ClientContact[];
  sedes: ClientSede[];
  status: "active" | "inactive";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Service Catalog ──────────────────────────────────────────────────────────
export type ServiceCategory =
  | "higiene"
  | "seguridad"
  | "ambiental"
  | "calidad"
  | "capacitacion"
  | "inspeccion";

export interface Service {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  price: number;
  unit: string; // "visita", "hora", "empleado", etc.
  duration: number; // estimated hours
  active: boolean;
}

// ─── Work Orders ──────────────────────────────────────────────────────────────
export type OrderStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "completed"
  | "closed"
  | "overdue"
  | "cancelled";

export type OrderPriority = "low" | "medium" | "high" | "critical";

export interface Evidence {
  id: string;
  type: "photo" | "document";
  name: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  notes?: string;
}

export interface OrderActivity {
  id: string;
  action: string;
  userId: string;
  userName: string;
  timestamp: string;
  notes?: string;
}

export interface WorkOrder {
  id: string;
  code: string; // e.g. OT-2024-001
  clientId: string;
  serviceId: string;
  technicianId?: string;
  sedeId?: string;
  status: OrderStatus;
  priority: OrderPriority;
  title: string;
  description: string;
  scheduledDate?: string;
  scheduledTime?: string;
  startedAt?: string;
  completedAt?: string;
  dueDate: string;
  progress: number; // 0-100
  notes?: string;
  evidence: Evidence[];
  activity: OrderActivity[];
  closureNotes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Quotes ───────────────────────────────────────────────────────────────────
export type QuoteStatus = "draft" | "sent" | "approved" | "rejected" | "converted";

export interface QuoteItem {
  serviceId: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string;
}

export interface Quote {
  id: string;
  code: string;
  clientId: string;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: QuoteStatus;
  validUntil: string;
  notes?: string;
  convertedToOrderId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Schedule ─────────────────────────────────────────────────────────────────
export interface ScheduleEvent {
  id: string;
  orderId: string;
  technicianId: string;
  clientId: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
}

// ─── Dashboard KPIs ───────────────────────────────────────────────────────────
export interface DashboardKPI {
  ordersOpen: number;
  ordersClosed: number;
  ordersOverdue: number;
  ordersInProgress: number;
  clientsActive: number;
  scheduledToday: number;
  techniciansBusy: number;
  quotesAwaitingApproval: number;
}

// ─── App State ────────────────────────────────────────────────────────────────
export interface AppData {
  users: User[];
  clients: Client[];
  services: Service[];
  workOrders: WorkOrder[];
  quotes: Quote[];
  scheduleEvents: ScheduleEvent[];
}
