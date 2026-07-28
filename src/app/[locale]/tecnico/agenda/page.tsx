"use client";

import { useMemo } from "react";
import { useDataStore } from "@/store/data-store";
import { useAuthStore } from "@/store/auth-store";
import { AppLayout } from "@/components/layout/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, MapPin } from "lucide-react";

export default function TecnicoAgendaPage({ params }: { params: { locale: string } }) {
  const { scheduleEvents, clients, workOrders } = useDataStore();
  const { currentUser } = useAuthStore();

  const myEvents = useMemo(
    () =>
      scheduleEvents
        .filter((e) => e.technicianId === currentUser?.id && e.status !== "cancelled")
        .sort((a, b) => a.date.localeCompare(b.date)),
    [scheduleEvents, currentUser]
  );

  const todayStr = new Date().toISOString().slice(0, 10);
  const today = myEvents.filter((e) => e.date === todayStr);
  const upcoming = myEvents.filter((e) => e.date > todayStr);

  const EventItem = ({ event }: { event: typeof myEvents[number] }) => {
    const client = clients.find((c) => c.id === event.clientId);
    const order = workOrders.find((o) => o.id === event.orderId);
    const statusColor: Record<string, string> = {
      scheduled: "bg-blue-100 text-blue-700",
      confirmed: "bg-green-100 text-green-700",
      completed: "bg-gray-100 text-gray-500",
    };

    return (
      <div className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:shadow-sm transition-shadow">
        <div className="w-14 h-14 rounded-xl bg-brand-50 flex flex-col items-center justify-center text-brand-700 flex-shrink-0">
          <span className="text-lg font-bold leading-none">
            {new Date(event.date + "T12:00:00").getDate()}
          </span>
          <span className="text-xs text-brand-400">
            {new Date(event.date + "T12:00:00").toLocaleDateString("es-CO", { month: "short" })}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-gray-900 text-sm">{event.title}</p>
            <Badge className={statusColor[event.status] ?? "bg-gray-100 text-gray-500"}>
              {event.status === "scheduled" ? "Programada" : event.status === "confirmed" ? "Confirmada" : "Completada"}
            </Badge>
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{event.startTime} – {event.endTime}</span>
            </div>
            {client && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <MapPin className="w-3.5 h-3.5" />
                <span>{client.name} · {client.city}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppLayout locale={params.locale} title="Mi Agenda" requiredRole="technician">
      {today.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-brand-700 mb-3">Hoy</h2>
          <div className="space-y-3">
            {today.map((ev) => <EventItem key={ev.id} event={ev} />)}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Próximas</h2>
          <div className="space-y-3">
            {upcoming.map((ev) => <EventItem key={ev.id} event={ev} />)}
          </div>
        </div>
      )}

      {myEvents.length === 0 && (
        <Card className="text-center py-12 text-gray-400">
          <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>Sin visitas programadas</p>
        </Card>
      )}
    </AppLayout>
  );
}
