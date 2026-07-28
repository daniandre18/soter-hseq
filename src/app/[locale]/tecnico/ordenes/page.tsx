"use client";

import { useState, useMemo } from "react";
import { useDataStore } from "@/store/data-store";
import { useAuthStore } from "@/store/auth-store";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardHeader, StatCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { Modal } from "@/components/ui/modal";
import { OrderStatusBadge, PriorityBadge } from "@/components/modules/orders/order-status-badge";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { WorkOrder } from "@/types";
import {
  ClipboardList, Clock, CheckCircle2, ImageIcon, Activity, ChevronRight
} from "lucide-react";

function OrderCard({
  order,
  onClick,
}: {
  order: WorkOrder;
  onClick: () => void;
}) {
  const { clients, services } = useDataStore();
  const client = clients.find((c) => c.id === order.clientId);
  const service = services.find((s) => s.id === order.serviceId);

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="font-semibold text-gray-900 text-sm">{order.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{order.code} · {client?.name}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-500 flex-shrink-0 mt-1 transition-colors" />
      </div>

      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{service?.name}</p>

      <div className="flex items-center gap-2 mb-3">
        <OrderStatusBadge status={order.status} />
        <PriorityBadge priority={order.priority} />
      </div>

      <ProgressBar value={order.progress} showLabel size="sm" />

      <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
        {order.scheduledDate && (
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatDate(order.scheduledDate)} {order.scheduledTime && `· ${order.scheduledTime}`}
          </span>
        )}
        <span>{order.evidence.length} evidencia{order.evidence.length !== 1 ? "s" : ""}</span>
      </div>
    </Card>
  );
}

function TechOrderDetail({ order, onClose }: { order: WorkOrder; onClose: () => void }) {
  const { clients, services, updateOrderStatus, updateOrderProgress } = useDataStore();
  const { currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"info" | "progress" | "activity">("info");
  const [progressVal, setProgressVal] = useState(order.progress);
  const [progressNote, setProgressNote] = useState("");
  const [closureNote, setClosureNote] = useState("");

  const client = clients.find((c) => c.id === order.clientId);
  const service = services.find((s) => s.id === order.serviceId);

  const canStart = order.status === "assigned";
  const canComplete = order.status === "in_progress" && order.progress >= 90;

  return (
    <Modal open onClose={onClose} title={order.title} size="xl">
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
        <OrderStatusBadge status={order.status} />
        <PriorityBadge priority={order.priority} />
        {canStart && (
          <Button
            size="sm"
            onClick={() => {
              if (!currentUser) return;
              updateOrderStatus(order.id, "in_progress", "Técnico inició la ejecución", currentUser.id, currentUser.name);
              onClose();
            }}
          >
            Iniciar Ejecución
          </Button>
        )}
        {canComplete && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              if (!currentUser) return;
              updateOrderStatus(order.id, "completed", closureNote || "Trabajo completado", currentUser.id, currentUser.name);
              onClose();
            }}
          >
            Solicitar Cierre
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-100">
        {[
          { id: "info" as const, label: "Detalles" },
          { id: "progress" as const, label: "Registrar Avance" },
          { id: "activity" as const, label: `Historial (${order.activity.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Info */}
      {activeTab === "info" && (
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-gray-500">Cliente</p><p className="font-medium">{client?.name}</p></div>
            <div><p className="text-gray-500">Servicio</p><p className="font-medium">{service?.name}</p></div>
            {order.scheduledDate && (
              <div>
                <p className="text-gray-500">Visita Programada</p>
                <p className="font-medium">{formatDate(order.scheduledDate)} {order.scheduledTime && `· ${order.scheduledTime}`}</p>
              </div>
            )}
            <div><p className="text-gray-500">Fecha Límite</p><p className="font-medium">{formatDate(order.dueDate)}</p></div>
          </div>
          {order.description && (
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-xs text-blue-600 font-medium mb-1">Descripción del trabajo</p>
              <p className="text-sm text-blue-800">{order.description}</p>
            </div>
          )}
          {order.notes && (
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 font-medium mb-1">Observaciones del coordinador</p>
              <p className="text-sm text-gray-700">{order.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Progress */}
      {activeTab === "progress" && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-700">Avance actual</p>
              <span className="text-lg font-bold text-brand-700">{progressVal}%</span>
            </div>
            <ProgressBar value={progressVal} />
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">Nuevo porcentaje de avance</label>
              <input
                type="range"
                min={order.progress}
                max={100}
                step={5}
                value={progressVal}
                onChange={(e) => setProgressVal(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{order.progress}% (actual)</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          <Textarea
            label="Nota de avance"
            placeholder="Describe lo que realizaste en esta visita..."
            value={progressNote}
            onChange={(e) => setProgressNote(e.target.value)}
            rows={4}
          />

          <Button
            className="w-full"
            disabled={progressVal === order.progress}
            onClick={() => {
              if (!currentUser) return;
              updateOrderProgress(order.id, progressVal, progressNote, currentUser.id, currentUser.name);
              setProgressNote("");
              onClose();
            }}
          >
            Guardar Avance
          </Button>

          {order.status === "in_progress" && progressVal >= 90 && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-2">Notas de cierre (opcional)</p>
              <Textarea
                placeholder="Resumen del trabajo realizado para el acta de cierre..."
                value={closureNote}
                onChange={(e) => setClosureNote(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>
      )}

      {/* Activity */}
      {activeTab === "activity" && (
        <div className="space-y-3">
          {order.activity.map((act) => (
            <div key={act.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-brand-400 mt-1.5" />
                <div className="flex-1 w-px bg-gray-100" />
              </div>
              <div className="pb-3 flex-1">
                <p className="text-sm font-medium text-gray-800">{act.action}</p>
                {act.notes && <p className="text-xs text-gray-500 italic mt-0.5">"{act.notes}"</p>}
                <p className="text-xs text-gray-400 mt-1">{act.userName} · {formatDateTime(act.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

export default function TecnicoOrdenesPage({ params }: { params: { locale: string } }) {
  const { workOrders } = useDataStore();
  const { currentUser } = useAuthStore();
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);

  const myOrders = useMemo(
    () => workOrders.filter((o) => o.technicianId === currentUser?.id),
    [workOrders, currentUser]
  );

  const active = myOrders.filter((o) => ["assigned", "in_progress"].includes(o.status));
  const completed = myOrders.filter((o) => ["completed", "closed"].includes(o.status));
  const overdue = myOrders.filter((o) => o.status === "overdue");

  const liveSelected = selectedOrder
    ? workOrders.find((o) => o.id === selectedOrder.id) ?? null
    : null;

  return (
    <AppLayout locale={params.locale} title="Mis Órdenes" requiredRole="technician">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Órdenes Activas" value={active.length} icon={Clock} color="brand" />
        <StatCard label="Completadas" value={completed.length} icon={CheckCircle2} color="green" />
        <StatCard label="Vencidas" value={overdue.length} icon={ClipboardList} color="red" />
      </div>

      {/* Active */}
      {active.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Órdenes Activas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {active.map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                onClick={() => setSelectedOrder(o)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Overdue */}
      {overdue.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-red-600 mb-3">Vencidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {overdue.map((o) => (
              <OrderCard key={o.id} order={o} onClick={() => setSelectedOrder(o)} />
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Completadas / Cerradas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {completed.map((o) => (
              <OrderCard key={o.id} order={o} onClick={() => setSelectedOrder(o)} />
            ))}
          </div>
        </div>
      )}

      {myOrders.length === 0 && (
        <Card className="text-center py-12 text-gray-400">
          <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No tienes órdenes asignadas</p>
        </Card>
      )}

      {liveSelected && (
        <TechOrderDetail order={liveSelected} onClose={() => setSelectedOrder(null)} />
      )}
    </AppLayout>
  );
}
