"use client";

import { useMemo, useState } from "react";
import { useDataStore } from "@/store/data-store";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { AppLayout } from "@/components/layout/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { OrderStatusBadge } from "@/components/modules/orders/order-status-badge";
import { formatDate, ORDER_STATUS_CONFIG } from "@/lib/utils";
import type { User } from "@/types";
import { Plus, Phone, Mail, Briefcase, ClipboardList, Search } from "lucide-react";

function TechnicianModal({
  open,
  onClose,
  initial,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial: Partial<User> | null;
  onSave: (data: Partial<User>) => void;
}) {
  const [form, setForm] = useState<Partial<User>>(
    initial ?? { role: "technician", active: true }
  );
  const set = (k: keyof User, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial?.id ? "Editar Técnico" : "Nuevo Técnico"}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => { onSave(form); onClose(); }} disabled={!form.name}>
            Guardar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input label="Nombre completo *" value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} />
        <Input label="Correo electrónico" type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} />
        <Input label="Teléfono" value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
        <Input label="Especialidad" value={form.specialty ?? ""} onChange={(e) => set("specialty", e.target.value)} placeholder="Ej: Seguridad Industrial" />
        <Select label="Estado" value={form.active ? "active" : "inactive"} onChange={(e) => set("active", e.target.value === "active")}>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </Select>
      </div>
    </Modal>
  );
}

function TechnicianDetail({ tech, onClose }: { tech: User; onClose: () => void }) {
  const { workOrders, clients, services } = useDataStore();
  const techOrders = workOrders.filter((o) => o.technicianId === tech.id);
  const activeOrders = techOrders.filter((o) => ["assigned", "in_progress"].includes(o.status));
  const completedOrders = techOrders.filter((o) => ["completed", "closed"].includes(o.status));

  return (
    <Modal open onClose={onClose} title={tech.name} size="lg">
      <div className="space-y-6">
        {/* Profile */}
        <div className="flex items-center gap-4">
          <Avatar name={tech.name} size="lg" />
          <div>
            <h3 className="font-semibold text-gray-900">{tech.name}</h3>
            <p className="text-sm text-gray-500">{tech.specialty ?? "Técnico HSEQ"}</p>
            <Badge className={tech.active ? "text-green-700 bg-green-100" : "text-gray-500 bg-gray-100"} dot dotColor={tech.active ? "bg-green-500" : "bg-gray-400"}>
              {tech.active ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="w-4 h-4 text-gray-400" />
            <span>{tech.email}</span>
          </div>
          {tech.phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{tech.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600">
            <ClipboardList className="w-4 h-4 text-gray-400" />
            <span>{activeOrders.length} órdenes activas · {completedOrders.length} completadas</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Briefcase className="w-4 h-4 text-gray-400" />
            <span>Técnico desde {formatDate(tech.createdAt)}</span>
          </div>
        </div>

        {/* Active orders */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Órdenes Activas</h4>
          {activeOrders.length === 0 ? (
            <p className="text-sm text-gray-400">Sin órdenes activas</p>
          ) : (
            <div className="space-y-2">
              {activeOrders.map((o) => {
                const client = clients.find((c) => c.id === o.clientId);
                const svc = services.find((s) => s.id === o.serviceId);
                return (
                  <div key={o.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{svc?.name ?? o.title}</p>
                      <p className="text-xs text-gray-500">{client?.name} · Vence {formatDate(o.dueDate)}</p>
                    </div>
                    <OrderStatusBadge status={o.status} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default function TecnicosPage({ params }: { params: { locale: string } }) {
  const { users, workOrders, addUser, updateUser } = useDataStore();
  const { search, setSearch, statusFilter, setStatusFilter } = useSearchFilter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTech, setEditTech] = useState<User | null>(null);
  const [detailTech, setDetailTech] = useState<User | null>(null);

  const technicians = useMemo(
    () => users.filter((u) => u.role === "technician"),
    [users]
  );

  const filtered = useMemo(
    () =>
      technicians.filter((t) => {
        const matchSearch =
          !search ||
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.specialty?.toLowerCase().includes(search.toLowerCase());
        const matchStatus =
          statusFilter === "all" ||
          (statusFilter === "active" ? t.active : !t.active);
        return matchSearch && matchStatus;
      }),
    [technicians, search, statusFilter]
  );

  const handleSave = (data: Partial<User>) => {
    if (editTech) {
      updateUser(editTech.id, data);
    } else {
      addUser({
        name: data.name ?? "",
        email: data.email ?? "",
        role: "technician",
        phone: data.phone,
        specialty: data.specialty,
        active: data.active ?? true,
      });
    }
    setEditTech(null);
  };

  return (
    <AppLayout locale={params.locale} title="Técnicos" requiredRole={["admin", "coordinator"]}>
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Input
          placeholder="Buscar técnico o especialidad..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4" />}
          className="max-w-xs"
        />
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36">
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </Select>
        <span className="text-sm text-gray-400">{filtered.length} técnicos</span>
        <Button className="ml-auto" onClick={() => { setEditTech(null); setModalOpen(true); }}>
          <Plus className="w-4 h-4" /> Nuevo Técnico
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((tech) => {
          const activeCount = workOrders.filter(
            (o) => o.technicianId === tech.id && ["assigned", "in_progress"].includes(o.status)
          ).length;

          return (
            <Card
              key={tech.id}
              className="cursor-pointer hover:shadow-md transition-all group"
              onClick={() => setDetailTech(tech)}
            >
              <div className="flex items-start gap-3">
                <Avatar name={tech.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{tech.name}</p>
                  <p className="text-xs text-gray-500 truncate">{tech.specialty ?? "Técnico HSEQ"}</p>
                </div>
                <Badge
                  className={tech.active ? "text-green-700 bg-green-100" : "text-gray-500 bg-gray-100"}
                  dot
                  dotColor={tech.active ? "bg-green-500" : "bg-gray-400"}
                >
                  {tech.active ? "Activo" : "Inactivo"}
                </Badge>
              </div>

              <div className="mt-4 space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{tech.email}</span>
                </div>
                {tech.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{tech.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{activeCount} orden{activeCount !== 1 ? "es" : ""} activa{activeCount !== 1 ? "s" : ""}</span>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  className="text-xs text-brand-600 hover:text-brand-800 font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditTech(tech);
                    setModalOpen(true);
                  }}
                >
                  Editar
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      <TechnicianModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTech(null); }}
        initial={editTech}
        onSave={handleSave}
      />
      {detailTech && <TechnicianDetail tech={detailTech} onClose={() => setDetailTech(null)} />}
    </AppLayout>
  );
}
