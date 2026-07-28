"use client";

import { useMemo } from "react";
import { useDataStore } from "@/store/data-store";
import { useAuthStore } from "@/store/auth-store";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardHeader, StatCard } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { OrderStatusBadge, PriorityBadge } from "@/components/modules/orders/order-status-badge";
import { formatDate } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import {
  ClipboardList, CheckCircle2, Clock, CalendarDays, HardHat, Shield
} from "lucide-react";

export default function ClientPortalPage({ params }: { params: { locale: string } }) {
  const { workOrders, clients, users, services, scheduleEvents, quotes } = useDataStore();
  const { currentUser } = useAuthStore();

  // Find the client for this user
  const client = useMemo(
    () => clients.find((c) => c.id === currentUser?.clientId),
    [clients, currentUser]
  );

  const myOrders = useMemo(
    () => workOrders.filter((o) => o.clientId === client?.id),
    [workOrders, client]
  );

  const activeOrders = myOrders.filter((o) => ["pending","assigned","in_progress"].includes(o.status));
  const closedOrders = myOrders.filter((o) => ["completed","closed"].includes(o.status));
  const todayStr = new Date().toISOString().slice(0, 10);
  const upcomingVisits = scheduleEvents
    .filter((e) => e.clientId === client?.id && e.date >= todayStr && e.status !== "cancelled")
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <AppLayout locale={params.locale} title="Mi Portal" requiredRole="client">
      {/* Welcome */}
      <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-navy-900 to-brand-700 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{client?.name ?? "Portal del Cliente"}</h2>
            <p className="text-white/60 text-sm">
              NIT: {client?.nit} · {client?.city}, {client?.department}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-5">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{myOrders.length}</p>
            <p className="text-xs text-white/60 mt-0.5">Total servicios</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{activeOrders.length}</p>
            <p className="text-xs text-white/60 mt-0.5">En ejecución</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{upcomingVisits.length}</p>
            <p className="text-xs text-white/60 mt-0.5">Visitas próximas</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Active orders */}
        <Card padding="none">
          <div className="p-5 border-b border-gray-100">
            <CardHeader title="Servicios Activos" subtitle={`${activeOrders.length} en curso`} />
          </div>
          <div className="divide-y divide-gray-100">
            {activeOrders.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Sin servicios activos</p>
              </div>
            ) : (
              activeOrders.map((order) => {
                const service = services.find((s) => s.id === order.serviceId);
                const tech = order.technicianId ? users.find((u) => u.id === order.technicianId) : null;
                return (
                  <div key={order.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{order.title}</p>
                        <p className="text-xs text-gray-400">{order.code} · {service?.name}</p>
                      </div>
                      <OrderStatusBadge status={order.status} />
                    </div>

                    <ProgressBar value={order.progress} showLabel />

                    <div className="flex items-center justify-between">
                      {tech ? (
                        <div className="flex items-center gap-2">
                          <Avatar name={tech.name} size="sm" />
                          <div>
                            <p className="text-xs font-medium text-gray-700">{tech.name}</p>
                            <p className="text-xs text-gray-400">{tech.specialty}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">Técnico pendiente de asignación</p>
                      )}
                      {order.scheduledDate && (
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {formatDate(order.scheduledDate)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Upcoming visits */}
        <Card padding="none">
          <div className="p-5 border-b border-gray-100">
            <CardHeader title="Próximas Visitas" subtitle={`${upcomingVisits.length} programadas`} />
          </div>
          <div className="divide-y divide-gray-100">
            {upcomingVisits.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Sin visitas próximas</p>
              </div>
            ) : (
              upcomingVisits.map((ev) => {
                const tech = users.find((u) => u.id === ev.technicianId);
                return (
                  <div key={ev.id} className="p-4 flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 flex flex-col items-center justify-center text-brand-700 flex-shrink-0">
                      <span className="text-base font-bold leading-none">
                        {new Date(ev.date + "T12:00:00").getDate()}
                      </span>
                      <span className="text-xs text-brand-400">
                        {new Date(ev.date + "T12:00:00").toLocaleDateString("es-CO", { month: "short" })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{ev.title}</p>
                      <p className="text-xs text-gray-400">{ev.startTime} – {ev.endTime}</p>
                      {tech && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Avatar name={tech.name} size="sm" />
                          <p className="text-xs text-gray-500">{tech.name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Completed history */}
        {closedOrders.length > 0 && (
          <Card padding="none" className="xl:col-span-2">
            <div className="p-5 border-b border-gray-100">
              <CardHeader title="Historial de Servicios" subtitle={`${closedOrders.length} servicio${closedOrders.length !== 1 ? "s" : ""} completado${closedOrders.length !== 1 ? "s" : ""}`} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Código</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Servicio</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Técnico</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Estado</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {closedOrders.map((order) => {
                    const service = services.find((s) => s.id === order.serviceId);
                    const tech = order.technicianId ? users.find((u) => u.id === order.technicianId) : null;
                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-400">{order.code}</td>
                        <td className="px-4 py-3 font-medium text-gray-800 max-w-[220px] truncate">{service?.name ?? order.title}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {tech ? tech.name : "—"}
                        </td>
                        <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(order.updatedAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
