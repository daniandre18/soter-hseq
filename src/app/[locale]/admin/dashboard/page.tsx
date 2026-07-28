"use client";

import { useMemo } from "react";
import { useDataStore } from "@/store/data-store";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardHeader, StatCard } from "@/components/ui/card";
import { OrderStatusBadge, PriorityBadge } from "@/components/modules/orders/order-status-badge";
import { ProgressBar } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import { formatDate, formatCurrency } from "@/lib/utils";
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
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  pending:     "#9ca3af",
  assigned:    "#3b82f6",
  in_progress: "#f59e0b",
  completed:   "#22c55e",
  closed:      "#6366f1",
  overdue:     "#ef4444",
  cancelled:   "#d1d5db",
};

const STATUS_LABELS: Record<string, string> = {
  pending:     "Pendiente",
  assigned:    "Asignada",
  in_progress: "En Proceso",
  completed:   "Completada",
  closed:      "Cerrada",
  overdue:     "Vencida",
};

export default function DashboardPage({ params }: { params: { locale: string } }) {
  const { workOrders, clients, users, scheduleEvents, services } = useDataStore();

  const kpi = useMemo(() => {
    const open       = workOrders.filter((o) => ["pending","assigned","in_progress"].includes(o.status)).length;
    const closed     = workOrders.filter((o) => ["closed","completed"].includes(o.status)).length;
    const overdue    = workOrders.filter((o) => o.status === "overdue").length;
    const inProgress = workOrders.filter((o) => o.status === "in_progress").length;
    const today      = new Date().toISOString().slice(0, 10);
    const todayEvents= scheduleEvents.filter((e) => e.date === today).length;
    const techBusy   = new Set(
      workOrders.filter((o) => o.status === "in_progress" && o.technicianId).map((o) => o.technicianId)
    ).size;
    return { open, closed, overdue, inProgress, todayEvents, techBusy,
      activeClients: clients.filter((c) => c.status === "active").length };
  }, [workOrders, clients, scheduleEvents]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    workOrders.forEach((o) => { counts[o.status] = (counts[o.status] ?? 0) + 1; });
    return Object.entries(counts)
      .filter(([k]) => k !== "cancelled")
      .map(([status, value]) => ({ name: STATUS_LABELS[status] ?? status, value, status }));
  }, [workOrders]);

  const serviceData = useMemo(() => {
    const counts: Record<string, number> = {};
    workOrders.forEach((o) => {
      const svc = services.find((s) => s.id === o.serviceId);
      if (svc) counts[svc.name] = (counts[svc.name] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name: name.length > 28 ? name.slice(0, 28) + "…" : name, value }));
  }, [workOrders, services]);

  const recentOrders = useMemo(
    () => [...workOrders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    [workOrders]
  );

  const upcomingEvents = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Pie chart */}
        <Card>
          <CardHeader title="Órdenes por Estado" />
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {statusData.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#9ca3af"} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v} órdenes`]} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Bar chart */}
        <Card className="xl:col-span-2">
          <CardHeader title="Servicios más Solicitados" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={serviceData} layout="vertical" margin={{ left: 8, right: 24 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={200} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v} órdenes`]} />
              <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
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
