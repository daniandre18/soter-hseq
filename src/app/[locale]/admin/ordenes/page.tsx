"use client";

import { useState, useMemo } from "react";
import { useDataStore } from "@/store/data-store";
import { useAuthStore } from "@/store/auth-store";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { AppLayout } from "@/components/layout/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import { OrderStatusBadge, PriorityBadge } from "@/components/modules/orders/order-status-badge";
import {
  formatDate, formatDateTime, ORDER_STATUS_CONFIG, PRIORITY_CONFIG
} from "@/lib/utils";
import type { WorkOrder, OrderStatus, OrderPriority } from "@/types";
import {
  Plus, Search, ClipboardList, User, Calendar, Clock,
  ChevronRight, Activity, ImageIcon, MessageSquare,
} from "lucide-react";

// ─── Order Detail Modal ────────────────────────────────────────────────────────
function OrderDetail({
  order,
  onClose,
}: {
  order: WorkOrder;
  onClose: () => void;
}) {
  const { clients, services, users, updateOrderStatus, updateOrderProgress } = useDataStore();
  const { currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"info" | "activity" | "evidence">("info");
  const [statusChange, setStatusChange] = useState<{ open: boolean; status: OrderStatus; note: string }>({
    open: false, status: order.status, note: "",
  });
  const [progressNote, setProgressNote] = useState("");
  const [progressVal, setProgressVal] = useState(order.progress);

  const client = clients.find((c) => c.id === order.clientId);
  const service = services.find((s) => s.id === order.serviceId);
  const technician = order.technicianId ? users.find((u) => u.id === order.technicianId) : null;

  const tabs = [
    { id: "info" as const, label: "Información", icon: ClipboardList },
    { id: "activity" as const, label: `Actividad (${order.activity.length})`, icon: Activity },
    { id: "evidence" as const, label: `Evidencias (${order.evidence.length})`, icon: ImageIcon },
  ];

  return (
    <Modal open onClose={onClose} title={`${order.code} — ${order.title}`} size="xl">
      {/* Status + Priority header */}
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
        <OrderStatusBadge status={order.status} />
        <PriorityBadge priority={order.priority} />
        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStatusChange((s) => ({ ...s, open: true }))}
          >
            Cambiar Estado
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-100">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Info tab */}
      {activeTab === "info" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-gray-500">Cliente</p><p className="font-medium">{client?.name}</p></div>
            <div><p className="text-gray-500">Servicio</p><p className="font-medium">{service?.name}</p></div>
            <div>
              <p className="text-gray-500">Técnico</p>
              {technician ? (
                <div className="flex items-center gap-2 mt-0.5">
                  <Avatar name={technician.name} size="sm" />
                  <p className="font-medium">{technician.name}</p>
                </div>
              ) : (
                <p className="text-gray-400 italic">Sin asignar</p>
              )}
            </div>
            <div><p className="text-gray-500">Fecha Límite</p><p className="font-medium">{formatDate(order.dueDate)}</p></div>
            {order.scheduledDate && (
              <div><p className="text-gray-500">Visita Programada</p><p className="font-medium">{formatDate(order.scheduledDate)} {order.scheduledTime && `· ${order.scheduledTime}`}</p></div>
            )}
            <div><p className="text-gray-500">Creada</p><p className="font-medium">{formatDateTime(order.createdAt)}</p></div>
          </div>

          {order.description && (
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 font-medium mb-1">Descripción</p>
              <p className="text-sm text-gray-700">{order.description}</p>
            </div>
          )}

          {/* Progress */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">Avance</p>
              <span className="text-sm font-bold text-brand-700">{progressVal}%</span>
            </div>
            <ProgressBar value={progressVal} showLabel={false} />
            <div className="mt-3 flex gap-2">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={progressVal}
                onChange={(e) => setProgressVal(Number(e.target.value))}
                className="flex-1"
              />
              <Input
                placeholder="Nota de avance..."
                value={progressNote}
                onChange={(e) => setProgressNote(e.target.value)}
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={() => {
                  if (!currentUser) return;
                  updateOrderProgress(order.id, progressVal, progressNote, currentUser.id, currentUser.name);
                  setProgressNote("");
                }}
              >
                Guardar
              </Button>
            </div>
          </div>

          {order.notes && (
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Observaciones</p>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}

          {order.closureNotes && (
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <p className="text-xs text-green-700 font-medium mb-1">Acta de Cierre</p>
              <p className="text-sm text-green-800">{order.closureNotes}</p>
            </div>
          )}
        </div>
      )}

      {/* Activity tab */}
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
                {act.notes && <p className="text-xs text-gray-500 mt-0.5 italic">"{act.notes}"</p>}
                <p className="text-xs text-gray-400 mt-1">{act.userName} · {formatDateTime(act.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Evidence tab */}
      {activeTab === "evidence" && (
        <div>
          {order.evidence.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Sin evidencias cargadas</p>
            </div>
          ) : (
            <div className="space-y-2">
              {order.evidence.map((ev) => (
                <div key={ev.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="w-4 h-4 text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{ev.name}</p>
                    <p className="text-xs text-gray-400">{ev.notes} · {formatDateTime(ev.uploadedAt)}</p>
                  </div>
                  <Badge className="text-blue-700 bg-blue-100">{ev.type}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Status change sub-modal */}
      {statusChange.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setStatusChange((s) => ({ ...s, open: false }))} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
            <h4 className="font-semibold text-gray-900 mb-4">Cambiar Estado</h4>
            <Select
              label="Nuevo estado"
              value={statusChange.status}
              onChange={(e) => setStatusChange((s) => ({ ...s, status: e.target.value as OrderStatus }))}
            >
              {Object.entries(ORDER_STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </Select>
            <div className="mt-3">
              <Textarea
                label="Observación (opcional)"
                value={statusChange.note}
                onChange={(e) => setStatusChange((s) => ({ ...s, note: e.target.value }))}
                placeholder="Motivo del cambio..."
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1" onClick={() => setStatusChange((s) => ({ ...s, open: false }))}>
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  if (!currentUser) return;
                  updateOrderStatus(order.id, statusChange.status, statusChange.note, currentUser.id, currentUser.name);
                  setStatusChange((s) => ({ ...s, open: false }));
                  onClose();
                }}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─── Create Order Modal ────────────────────────────────────────────────────────
function NewOrderModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { clients, services, users, addWorkOrder } = useDataStore();
  const { currentUser } = useAuthStore();
  const technicians = users.filter((u) => u.role === "technician" && u.active);

  const [form, setForm] = useState({
    clientId: "",
    serviceId: "",
    technicianId: "",
    title: "",
    description: "",
    priority: "medium" as OrderPriority,
    dueDate: "",
    scheduledDate: "",
    scheduledTime: "",
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.clientId || !form.serviceId || !form.title || !currentUser) return;
    addWorkOrder({
      clientId: form.clientId,
      serviceId: form.serviceId,
      technicianId: form.technicianId || undefined,
      title: form.title,
      description: form.description,
      priority: form.priority,
      dueDate: form.dueDate,
      scheduledDate: form.scheduledDate || undefined,
      scheduledTime: form.scheduledTime || undefined,
      status: form.technicianId ? "assigned" : "pending",
      progress: 0,
      notes: undefined,
      createdBy: currentUser.id,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nueva Orden de Trabajo"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!form.clientId || !form.title || !form.serviceId}>
            Crear Orden
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Input label="Título *" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Ej: Inspección de Seguridad — Planta Principal" />
        </div>
        <Select label="Cliente *" value={form.clientId} onChange={(e) => set("clientId", e.target.value)}>
          <option value="">Seleccionar cliente...</option>
          {clients.filter((c) => c.status === "active").map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
        <Select label="Servicio *" value={form.serviceId} onChange={(e) => set("serviceId", e.target.value)}>
          <option value="">Seleccionar servicio...</option>
          {services.filter((s) => s.active).map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </Select>
        <Select label="Técnico" value={form.technicianId} onChange={(e) => set("technicianId", e.target.value)}>
          <option value="">Sin asignar</option>
          {technicians.map((t) => (
            <option key={t.id} value={t.id}>{t.name} — {t.specialty}</option>
          ))}
        </Select>
        <Select label="Prioridad" value={form.priority} onChange={(e) => set("priority", e.target.value as OrderPriority)}>
          {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </Select>
        <Input label="Fecha Límite *" type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
        <Input label="Fecha Visita" type="date" value={form.scheduledDate} onChange={(e) => set("scheduledDate", e.target.value)} />
        <Input label="Hora Visita" type="time" value={form.scheduledTime} onChange={(e) => set("scheduledTime", e.target.value)} />
        <div className="col-span-2">
          <Textarea label="Descripción" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Detalles del trabajo a realizar..." />
        </div>
      </div>
    </Modal>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function OrdenesPage({ params }: { params: { locale: string } }) {
  const { workOrders, clients, users, services } = useDataStore();
  const { search, setSearch, statusFilter, setStatusFilter } = useSearchFilter();
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState<WorkOrder | null>(null);

  const filtered = useMemo(() => {
    return workOrders
      .filter((o) => {
        const client = clients.find((c) => c.id === o.clientId);
        const matchSearch =
          !search ||
          o.title.toLowerCase().includes(search.toLowerCase()) ||
          o.code.toLowerCase().includes(search.toLowerCase()) ||
          client?.name.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "all" || o.status === statusFilter;
        const matchPriority = priorityFilter === "all" || o.priority === priorityFilter;
        return matchSearch && matchStatus && matchPriority;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [workOrders, clients, search, statusFilter, priorityFilter]);

  // If we opened a detail and the order was updated in the store, reflect it
  const liveDetail = detailOrder
    ? workOrders.find((o) => o.id === detailOrder.id) ?? null
    : null;

  return (
    <AppLayout locale={params.locale} title="Órdenes de Trabajo" requiredRole={["admin", "coordinator"]}>
      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Input
          placeholder="Buscar orden, cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4" />}
          className="max-w-xs"
        />
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-44">
          <option value="all">Todos los estados</option>
          {Object.entries(ORDER_STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </Select>
        <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-40">
          <option value="all">Todas las prioridades</option>
          {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </Select>
        <span className="text-sm text-gray-400 ml-1">{filtered.length} órdenes</span>
        <Button className="ml-auto" onClick={() => setNewOrderOpen(true)}>
          <Plus className="w-4 h-4" /> Nueva Orden
        </Button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <Card className="text-center py-12 text-gray-400">
          <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No hay órdenes registradas</p>
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Código</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Título</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Técnico</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Prioridad</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Avance</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vence</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((order) => {
                  const client = clients.find((c) => c.id === order.clientId);
                  const tech = order.technicianId ? users.find((u) => u.id === order.technicianId) : null;
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setDetailOrder(order)}
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-gray-500">{order.code}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 max-w-[220px] truncate">{order.title}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">{client?.name}</td>
                      <td className="px-4 py-3">
                        {tech ? (
                          <div className="flex items-center gap-2">
                            <Avatar name={tech.name} size="sm" />
                            <span className="text-gray-600 truncate max-w-[100px]">{tech.name.split(" ")[0]}</span>
                          </div>
                        ) : (
                          <span className="text-gray-300 italic text-xs">Sin asignar</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={order.priority} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 min-w-[80px]">
                          <ProgressBar value={order.progress} size="sm" className="flex-1" />
                          <span className="text-xs text-gray-500">{order.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(order.dueDate)}</td>
                      <td className="px-4 py-3">
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <NewOrderModal open={newOrderOpen} onClose={() => setNewOrderOpen(false)} />
      {liveDetail && <OrderDetail order={liveDetail} onClose={() => setDetailOrder(null)} />}
    </AppLayout>
  );
}
