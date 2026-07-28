/**
 * Órdenes adicionales para el demo.
 *
 * Las 7 órdenes escritas a mano en `seed-data.ts` alimentan las vistas de
 * detalle (evidencias, historial, notas de cierre) y se conservan tal cual.
 * El problema es que cubren 7 servicios distintos con una orden cada uno: la
 * gráfica de "servicios más solicitados" queda en un empate a 7 bandas y todas
 * las barras salen al 100%.
 *
 * Estas órdenes se generan con una distribución deliberada por servicio para
 * que la comparación tenga algo que mostrar, y con fechas relativas a hoy para
 * que la agenda no envejezca.
 */

import type { ScheduleEvent, WorkOrder, OrderStatus, OrderPriority } from "@/types";
import { toLocalISODate } from "./utils";

const MS_PER_DAY = 86_400_000;

/**
 * Fecha (YYYY-MM-DD) a `days` días de hoy; negativo = pasado.
 *
 * Se arma sobre el calendario local, igual que `toLocalISODate`, para que las
 * fechas generadas coincidan con el "hoy" que comparan el dashboard y la
 * agenda.
 */
function dayOffset(today: Date, days: number): string {
  const shifted = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  shifted.setDate(shifted.getDate() + days);
  return toLocalISODate(shifted);
}

function at(date: string, time: string): string {
  return `${date}T${time}:00Z`;
}

const TECHNICIANS = [
  { id: "u-tech-1", name: "Andrés Morales" },
  { id: "u-tech-2", name: "Valentina Ríos" },
  { id: "u-tech-3", name: "Jorge Castro" },
];

const CLIENTS = [
  { id: "c-001", sede: "s-001-1", short: "Plásticos del Sur" },
  { id: "c-002", sede: "s-002-1", short: "Obra Kennedy" },
  { id: "c-003", sede: "s-003-1", short: "Logística Express" },
  { id: "c-004", sede: "s-004-1", short: "Alimentos Natura" },
  { id: "c-005", sede: "s-005-1", short: "Textiles Andinos" },
];

/**
 * Distribución objetivo por servicio. Sumada a las 7 órdenes escritas a mano
 * deja un top 5 con reparto real: Alturas 7, Inspección 5, Emergencias 4,
 * Ruido 3, Auditoría 2.
 */
const PLAN: { serviceId: string; label: string; count: number }[] = [
  { serviceId: "svc-003", label: "Capacitación Trabajo en Alturas", count: 6 },
  { serviceId: "svc-001", label: "Inspección de Seguridad Industrial", count: 4 },
  { serviceId: "svc-007", label: "Plan de Emergencias y Simulacro", count: 3 },
  { serviceId: "svc-002", label: "Medición de Ruido Ocupacional", count: 2 },
  { serviceId: "svc-005", label: "Auditoría Interna ISO 45001", count: 1 },
  { serviceId: "svc-004", label: "Gestión de Residuos Peligrosos", count: 1 },
  { serviceId: "svc-008", label: "Capacitación Manejo Defensivo", count: 1 },
];

/**
 * Reparto de estados a lo largo del ciclo. Se recorre en ciclo, de modo que la
 * mezcla del dashboard es estable y no depende del azar: el demo se ve igual en
 * cada carga.
 */
const CYCLE: { status: OrderStatus; priority: OrderPriority; progress: number; offset: number }[] = [
  { status: "closed",      priority: "medium",   progress: 100, offset: -38 },
  { status: "completed",   priority: "high",     progress: 100, offset: -31 },
  { status: "closed",      priority: "low",      progress: 100, offset: -24 },
  { status: "completed",   priority: "medium",   progress: 100, offset: -17 },
  { status: "overdue",     priority: "critical", progress: 60,  offset: -6  },
  { status: "in_progress", priority: "high",     progress: 35,  offset: 0   },
  { status: "assigned",    priority: "medium",   progress: 0,   offset: 3   },
  { status: "pending",     priority: "low",      progress: 0,   offset: 9   },
];

export interface GeneratedDemo {
  orders: WorkOrder[];
  events: ScheduleEvent[];
}

export function buildGeneratedOrders(today: Date = new Date()): GeneratedDemo {
  const orders: WorkOrder[] = [];
  const events: ScheduleEvent[] = [];

  // Se aplana el plan a una lista de servicios, uno por orden a generar.
  const slots = PLAN.flatMap((p) => Array.from({ length: p.count }, () => p));

  slots.forEach((slot, i) => {
    const cycle = CYCLE[i % CYCLE.length];
    const client = CLIENTS[i % CLIENTS.length];
    const tech = TECHNICIANS[i % TECHNICIANS.length];

    const seq = i + 8; // las 7 primeras son las escritas a mano
    const id = `ot-g${String(seq).padStart(3, "0")}`;
    const scheduledDate = dayOffset(today, cycle.offset);
    const createdAt = at(dayOffset(today, cycle.offset - 12), "09:00");
    const isDone = cycle.status === "closed" || cycle.status === "completed";
    const started = cycle.progress > 0 ? at(scheduledDate, "08:20") : undefined;

    orders.push({
      id,
      code: `OT-${scheduledDate.slice(0, 4)}-${String(seq + 100)}`,
      clientId: client.id,
      serviceId: slot.serviceId,
      technicianId: cycle.status === "pending" ? undefined : tech.id,
      sedeId: client.sede,
      status: cycle.status,
      priority: cycle.priority,
      title: `${slot.label} - ${client.short}`,
      description: `${slot.label} programada para ${client.short}. Alcance según propuesta técnica aprobada.`,
      scheduledDate,
      scheduledTime: i % 2 === 0 ? "08:00" : "13:30",
      startedAt: started,
      completedAt: isDone ? at(scheduledDate, "16:00") : undefined,
      // Las vencidas cumplen su plazo antes de hoy; el resto, después.
      dueDate: cycle.status === "overdue" ? dayOffset(today, cycle.offset + 2) : dayOffset(today, cycle.offset + 5),
      progress: cycle.progress,
      evidence: [],
      activity: [
        {
          id: `act-${id}-1`,
          action: "Orden creada",
          userId: "u-admin-1",
          userName: "Carlos Méndez",
          timestamp: createdAt,
        },
        ...(cycle.status === "pending"
          ? []
          : [
              {
                id: `act-${id}-2`,
                action: `Técnico asignado: ${tech.name}`,
                userId: "u-coord-1",
                userName: "Luisa Fernández",
                timestamp: at(dayOffset(today, cycle.offset - 8), "10:00"),
              },
            ]),
        ...(isDone
          ? [
              {
                id: `act-${id}-3`,
                action: "Marcada como completada",
                userId: tech.id,
                userName: tech.name,
                timestamp: at(scheduledDate, "16:00"),
              },
            ]
          : []),
      ],
      closureNotes: isDone ? "Servicio ejecutado conforme al alcance acordado." : undefined,
      createdBy: "u-admin-1",
      createdAt,
      updatedAt: at(scheduledDate, isDone ? "16:00" : "11:00"),
    });

    // Solo las órdenes que aún no terminaron ocupan la agenda.
    if (!isDone && cycle.status !== "pending") {
      events.push({
        id: `ev-sched-g${String(seq).padStart(3, "0")}`,
        orderId: id,
        technicianId: tech.id,
        clientId: client.id,
        date: scheduledDate,
        startTime: i % 2 === 0 ? "08:00" : "13:30",
        endTime: i % 2 === 0 ? "16:00" : "17:30",
        title: `${slot.label} - ${client.short}`,
        status: cycle.status === "in_progress" ? "confirmed" : "scheduled",
      });
    }
  });

  return { orders, events };
}
