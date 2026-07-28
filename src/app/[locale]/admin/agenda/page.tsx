"use client";

import { useMemo, useState } from "react";
import { useDataStore } from "@/store/data-store";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Select } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import type { Client, ScheduleEvent, User, WorkOrder } from "@/types";

const EVENT_STATUS_COLOR: Record<ScheduleEvent["status"], string> = {
  scheduled:  "bg-blue-100 text-blue-700",
  confirmed:  "bg-green-100 text-green-700",
  completed:  "bg-gray-100 text-gray-500",
  cancelled:  "bg-red-50 text-red-400",
};

const EVENT_STATUS_LABEL: Record<ScheduleEvent["status"], string> = {
  scheduled:  "Programada",
  confirmed:  "Confirmada",
  completed:  "Completada",
  cancelled:  "Cancelada",
};

// Generate a simple 4-week calendar view
function getWeeks(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  const weeks: Date[][] = [];
  let week: Date[] = [];

  // Pad start
  for (let i = 0; i < firstDay.getDay(); i++) week.push(null as unknown as Date);

  for (let d = 1; d <= lastDay.getDate(); d++) {
    week.push(new Date(year, month, d));
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null as unknown as Date);
    weeks.push(week);
  }
  return weeks;
}

function EventCard({ event, users, clients, workOrders }: {
  event: ScheduleEvent;
  users: User[];
  clients: Client[];
  workOrders: WorkOrder[];
}) {
  const tech = users.find((u) => u.id === event.technicianId);
  const client = clients.find((c) => c.id === event.clientId);
  const order = workOrders.find((o) => o.id === event.orderId);

  return (
    <div className="p-4 rounded-xl border border-gray-100 bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="font-medium text-gray-900 text-sm leading-tight">{event.title}</p>
        <Badge className={EVENT_STATUS_COLOR[event.status]}>
          {EVENT_STATUS_LABEL[event.status]}
        </Badge>
      </div>

      <div className="space-y-1.5 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{event.startTime} – {event.endTime}</span>
        </div>
        {client && (
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{client.name}</span>
          </div>
        )}
      </div>

      {tech && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
          <Avatar name={tech.name} size="sm" />
          <div>
            <p className="text-xs font-medium text-gray-700">{tech.name}</p>
            <p className="text-xs text-gray-400">{tech.specialty}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AgendaPage({ params }: { params: { locale: string } }) {
  const { scheduleEvents, users, clients, workOrders } = useDataStore();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [techFilter, setTechFilter] = useState("all");

  const technicians = useMemo(() => users.filter((u) => u.role === "technician"), [users]);

  const filteredEvents = useMemo(
    () =>
      scheduleEvents.filter(
        (e) =>
          (techFilter === "all" || e.technicianId === techFilter) &&
          e.status !== "cancelled"
      ),
    [scheduleEvents, techFilter]
  );

  // Upcoming list (next 30 days)
  const todayStr = today.toISOString().slice(0, 10);
  const upcoming = filteredEvents
    .filter((e) => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date));

  const weeks = getWeeks(year, month);
  const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

  function eventsForDay(date: Date): ScheduleEvent[] {
    const str = date.toISOString().slice(0, 10);
    return filteredEvents.filter((e) => e.date === str);
  }

  return (
    <AppLayout locale={params.locale} title="Agenda de Visitas" requiredRole={["admin", "coordinator"]}>
      <div className="flex items-center gap-4 mb-6">
        <Select value={techFilter} onChange={(e) => setTechFilter(e.target.value)} className="w-52">
          <option value="all">Todos los técnicos</option>
          {technicians.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </Select>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => {
              if (month === 0) { setMonth(11); setYear((y) => y - 1); }
              else setMonth((m) => m - 1);
            }}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            ‹
          </button>
          <span className="font-semibold text-gray-800 w-36 text-center text-sm">
            {MONTHS[month]} {year}
          </span>
          <button
            onClick={() => {
              if (month === 11) { setMonth(0); setYear((y) => y + 1); }
              else setMonth((m) => m + 1);
            }}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="xl:col-span-2">
          <Card padding="none">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-gray-100">
              {DAYS.map((d) => (
                <div key={d} className="py-3 text-center text-xs font-semibold text-gray-400">
                  {d}
                </div>
              ))}
            </div>
            {/* Weeks */}
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 border-b last:border-b-0 border-gray-50">
                {week.map((date, di) => {
                  if (!date) {
                    return <div key={di} className="min-h-[80px] bg-gray-50/50" />;
                  }
                  const dayEvents = eventsForDay(date);
                  const isToday = date.toISOString().slice(0, 10) === todayStr;
                  return (
                    <div
                      key={di}
                      className={`min-h-[80px] p-1.5 border-r last:border-r-0 border-gray-50 ${
                        date.getMonth() !== month ? "bg-gray-50/50" : ""
                      }`}
                    >
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mb-1 ${
                          isToday
                            ? "bg-brand-600 text-white"
                            : "text-gray-600"
                        }`}
                      >
                        {date.getDate()}
                      </span>
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 2).map((ev) => {
                          const tech = users.find((u) => u.id === ev.technicianId);
                          return (
                            <div
                              key={ev.id}
                              className="text-xs px-1.5 py-0.5 rounded bg-brand-100 text-brand-800 truncate leading-tight"
                              title={ev.title}
                            >
                              {ev.startTime} {tech?.name.split(" ")[0]}
                            </div>
                          );
                        })}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-gray-400 px-1">+{dayEvents.length - 2}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </Card>
        </div>

        {/* Upcoming list */}
        <div>
          <Card padding="none">
            <div className="p-4 border-b border-gray-100">
              <CardHeader title="Próximas Visitas" subtitle={`${upcoming.length} programada${upcoming.length !== 1 ? "s" : ""}`} />
            </div>
            <div className="divide-y divide-gray-100 max-h-[520px] overflow-y-auto scrollbar-thin">
              {upcoming.length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Sin visitas próximas</p>
                </div>
              ) : (
                upcoming.map((ev) => (
                  <div key={ev.id} className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 flex flex-col items-center justify-center text-brand-700 flex-shrink-0">
                        <span className="text-xs font-bold leading-none">
                          {new Date(ev.date + "T12:00:00").getDate()}
                        </span>
                        <span className="text-xs text-brand-400 leading-none">
                          {MONTHS[new Date(ev.date + "T12:00:00").getMonth()].slice(0, 3)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{ev.title}</p>
                        <p className="text-xs text-gray-400">{ev.startTime} – {ev.endTime}</p>
                      </div>
                    </div>
                    <EventCard
                      event={ev}
                      users={users}
                      clients={clients}
                      workOrders={workOrders}
                    />
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
