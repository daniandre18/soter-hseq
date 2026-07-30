"use client";

import { useMemo } from "react";
import { useDataStore } from "@/store/data-store";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardHeader, StatCard } from "@/components/ui/card";
import { OrderStatusBadge, PriorityBadge } from "@/components/modules/orders/order-status-badge";
import { ProgressBar } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import { formatDate, formatCurrency, toLocalISODate, ORDER_STATUS_CONFIG } from "@/lib/utils";
import {
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  CalendarDays,
  HardHat,
  FileText,
} from "lucide-react";
import { BarList, type BarListItem } from "@/components/ui/bar-list";
import { PieChart, type PieSlice } from "@/components/ui/pie-chart";

/** Orden del flujo de trabajo, no por cantidad: así el color sigue al estado
 *  y no cambia de fila cuando cambian los datos.
 *
 * "Pendiente" va en gris a propósito — es el estado aún no iniciado, y el gris
 * lo deja en segundo plano en vez de competir con los estados que sí exigen
 * atención. Los colores en sí (y su validación de contraste/deuteranopía)
 * viven en `ORDER_STATUS_CONFIG` — única fuente de verdad compartida con las
 * insignias de estado del resto de la app. */
const STATUS_ORDER = ["pending", "assigned", "in_progress", "completed", "closed", "overdue"];

export default function DashboardPage({ params }: { params: { locale: string } }) {
  const { workOrders, clients, users, scheduleEvents, services } = useDataStore();

  const kpi = useMemo(() => {
    const open       = workOrders.filter((o) => ["pending","assigned","in_progress"].includes(o.status)).length;
    const closed     = workOrders.filter((o) => ["closed","completed"].includes(o.status)).length;
    const overdue    = workOrders.filter((o) => o.status === "overdue").length;
    const inProgress = workOrders.filter((o) => o.status === "in_progress").length;
    const today      = toLocalISODate();
    const todayEvents= scheduleEvents.filter((e) => e.date === today).length;
    const techBusy   = new Set(
      workOrders.filter((o) => o.status === "in_progress" && o.technicianId).map((o) => o.technicianId)
    ).size;
    return { open, closed, overdue, inProgress, todayEvents, techBusy,
      activeClients: clients.filter((c) => c.status === "active").length };
  }, [workOrders, clients, scheduleEvents]);

  const statusData = useMemo<PieSlice[]>(() => {
    const counts: Record<string, number> = {};
    workOrders.forEach((o) => { counts[o.status] = (counts[o.status] ?? 0) + 1; });
    return STATUS_ORDER
      .filter((status) => (counts[status] ?? 0) > 0)
      .map((status) => ({
        key: status,
        label: ORDER_STATUS_CONFIG[status as keyof typeof ORDER_STATUS_CONFIG].label,
        value: counts[status],
        color: ORDER_STATUS_CONFIG[status as keyof typeof ORDER_STATUS_CONFIG].hex,
      }));
  }, [workOrders]);

  const serviceData = useMemo<BarListItem[]>(() => {
    const counts: Record<string, number> = {};
    workOrders.forEach((o) => {
      const svc = services.find((s) => s.id === o.serviceId);
      if (svc) counts[svc.name] = (counts[svc.name] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      // Una sola serie: mismo color en todas las filas. La longitud ya dice
      // cuál es mayor.
      .map(([name, value]) => ({ key: name, label: name, value, color: "#4f46e5" }));
  }, [workOrders, services]);

  const recentOrders = useMemo(
    () => [...workOrders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    [workOrders]
  );

  const upcomingEvents = useMemo(() => {
    const today = toLocalISODate();
    return scheduleEvents
      .filter((e) => e.date >= today && e.status !== "cancelled")
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [scheduleEvents]);

  return (
    <AppLayout
      locale={params.locale}
      title="Panel Administrativo"
      requiredRole={["admin", "coordinator"]}
    >
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Órdenes Abiertas"   value={kpi.open}         icon={ClipboardList} color="brand"  />
        <StatCard label="Órdenes Cerradas"   value={kpi.closed}       icon={CheckCircle2}  color="green"  />
        <StatCard label="Vencidas"           value={kpi.overdue}      icon={AlertTriangle} color="red"    />
        <StatCard label="En Proceso"         value={kpi.inProgress}   icon={Clock}         color="orange" />
        <StatCard label="Clientes Activos"   value={kpi.activeClients}icon={Building2}     color="blue"   />
        <StatCard label="Visitas Hoy"        value={kpi.todayEvents}  icon={CalendarDays}  color="purple" />
        <StatCard label="Técnicos en Campo"  value={kpi.techBusy}     icon={HardHat}       color="orange" />
        <StatCard label="Órdenes Pendientes" value={workOrders.filter(o=>o.status==="pending").length} icon={FileText} color="brand" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader
            title="Órdenes por Estado"
            subtitle={`${workOrders.length} órdenes en total`}
          />
          <PieChart slices={statusData} unit="órdenes" emptyMessage="Sin órdenes registradas" />
        </Card>

        <Card>
          <CardHeader
            title="Servicios más Solicitados"
            subtitle="Top 5 por número de órdenes"
          />
          <BarList items={serviceData} unit="órdenes" emptyMessage="Sin servicios con órdenes" />
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent orders */}
        <Card padding="none">
          <div className="p-6 pb-0">
            <CardHeader title="Órdenes Recientes" />
          </div>
          <div className="divide-y divide-gray-100">
            {recentOrders.length === 0 ? (
              <p className="px-6 py-4 text-sm text-gray-400">Sin órdenes recientes</p>
            ) : (
              recentOrders.map((order) => {
                const client = clients.find((c) => c.id === order.clientId);
                return (
                  <div key={order.id} className="px-6 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{order.title}</p>
                      <p className="text-xs text-gray-400 truncate">{client?.name} · {order.code}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <OrderStatusBadge status={order.status} />
                      <ProgressBar value={order.progress} size="sm" className="w-20" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Upcoming visits */}
        <Card padding="none">
          <div className="p-6 pb-0">
            <CardHeader title="Próximas Visitas" />
          </div>
          <div className="divide-y divide-gray-100">
            {upcomingEvents.length === 0 ? (
              <p className="px-6 py-4 text-sm text-gray-400">Sin visitas próximas</p>
            ) : (
              upcomingEvents.map((ev) => {
                const tech = users.find((u) => u.id === ev.technicianId);
                const client = clients.find((c) => c.id === ev.clientId);
                return (
                  <div key={ev.id} className="px-6 py-3 flex items-center gap-3 hover:bg-gray-50">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 flex flex-col items-center justify-center text-brand-700 flex-shrink-0">
                      <span className="text-xs font-bold leading-none">
                        {new Date(ev.date + "T12:00:00").toLocaleDateString("es-CO", { day: "numeric" })}
                      </span>
                      <span className="text-xs text-brand-400 leading-none">
                        {new Date(ev.date + "T12:00:00").toLocaleDateString("es-CO", { month: "short" })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{ev.title}</p>
                      <p className="text-xs text-gray-400 truncate">{client?.name} · {ev.startTime}</p>
                    </div>
                    {tech && <Avatar name={tech.name} size="sm" />}
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
