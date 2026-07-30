"use client";

import { useState, useMemo } from "react";
import { useDataStore } from "@/store/data-store";
import { useSearchFilter } from "@/hooks/use-search-filter";
import { AppLayout } from "@/components/layout/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Plus, Search, Building2, MapPin, Phone, Users, ChevronRight, Mail } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Client } from "@/types";

function ClientModal({
  open,
  onClose,
  initial,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial: Partial<Client> | null;
  onSave: (data: Partial<Client>) => void;
}) {
  const [form, setForm] = useState<Partial<Client>>(
    initial ?? { status: "active", contacts: [], sedes: [], industry: "" }
  );

  const set = (k: keyof Client, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial?.id ? "Editar Cliente" : "Nuevo Cliente"}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => { onSave(form); onClose(); }}>Guardar</Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Input label="Razón Social *" value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} placeholder="Empresa S.A.S." />
        </div>
        <Input label="NIT" value={form.nit ?? ""} onChange={(e) => set("nit", e.target.value)} placeholder="900.000.000-0" />
        <Input label="Sector / Industria" value={form.industry ?? ""} onChange={(e) => set("industry", e.target.value)} placeholder="Manufactura" />
        <Input label="Ciudad" value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} placeholder="Bogotá" />
        <Input label="Departamento" value={form.department ?? ""} onChange={(e) => set("department", e.target.value)} placeholder="Cundinamarca" />
        <div className="col-span-2">
          <Input label="Dirección" value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} placeholder="Calle 80 # 45-22" />
        </div>
        <div className="col-span-2">
          <Select label="Estado" value={form.status ?? "active"} onChange={(e) => set("status", e.target.value as "active" | "inactive")}>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </Select>
        </div>
      </div>
    </Modal>
  );
}

function ClientDetail({ client, onClose, locale }: { client: Client; onClose: () => void; locale: string }) {
  const { workOrders, services } = useDataStore();
  const clientOrders = workOrders.filter((o) => o.clientId === client.id);

  return (
    <Modal open onClose={onClose} title={client.name} size="xl">
      <div className="space-y-6">
        {/* Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-gray-500">NIT</p><p className="font-medium">{client.nit}</p></div>
          <div><p className="text-gray-500">Sector</p><p className="font-medium">{client.industry}</p></div>
          <div className="col-span-2"><p className="text-gray-500">Dirección</p><p className="font-medium">{client.address}, {client.city}, {client.department}</p></div>
          <div><p className="text-gray-500">Estado</p>
            <Badge className={client.status === "active" ? "text-green-700 bg-green-100" : "text-gray-500 bg-gray-100"}>
              {client.status === "active" ? "Activo" : "Inactivo"}
            </Badge>
          </div>
          <div><p className="text-gray-500">Cliente desde</p><p className="font-medium">{formatDate(client.createdAt)}</p></div>
        </div>

        {/* Contacts */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Contactos</h4>
          <div className="space-y-2">
            {client.contacts.map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.role}</p>
                </div>
                <div className="text-xs text-gray-400 space-y-0.5 text-right">
                  <p className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</p>
                  <p className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sedes */}
        {client.sedes.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Sedes ({client.sedes.length})</h4>
            <div className="space-y-2">
              {client.sedes.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.address}, {s.city}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order history */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Historial de Servicios ({clientOrders.length})</h4>
          {clientOrders.length === 0 ? (
            <p className="text-sm text-gray-400">Sin órdenes registradas</p>
          ) : (
            <div className="space-y-2">
              {clientOrders.slice(0, 6).map((o) => {
                const svc = services.find((s) => s.id === o.serviceId);
                return (
                  <div key={o.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 text-sm">
                    <span className="font-mono text-xs text-gray-400 w-24 flex-shrink-0">{o.code}</span>
                    <span className="flex-1 truncate text-gray-700">{svc?.name ?? o.title}</span>
                    <span className="text-xs text-gray-400">{formatDate(o.createdAt)}</span>
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

export default function ClientesPage({ params }: { params: { locale: string } }) {
  const { clients, addClient, updateClient } = useDataStore();
  const { search, setSearch, statusFilter, setStatusFilter } = useSearchFilter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [detailClient, setDetailClient] = useState<Client | null>(null);

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const matchSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.nit.includes(search) ||
        c.city.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [clients, search, statusFilter]);

  const handleSave = (data: Partial<Client>) => {
    if (editClient) {
      updateClient(editClient.id, data);
    } else {
      addClient({
        name: data.name ?? "",
        nit: data.nit ?? "",
        industry: data.industry ?? "",
        address: data.address ?? "",
        city: data.city ?? "",
        department: data.department ?? "",
        contacts: data.contacts ?? [],
        sedes: data.sedes ?? [],
        status: data.status ?? "active",
        notes: data.notes,
      });
    }
    setEditClient(null);
  };

  return (
    <AppLayout locale={params.locale} title="Clientes" requiredRole={["admin", "coordinator"]}>
      {/* Header row */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <Input
            placeholder="Buscar por nombre, NIT o ciudad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36">
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </Select>
        </div>
        <Button onClick={() => { setEditClient(null); setModalOpen(true); }}>
          <Plus className="w-4 h-4" /> Nuevo Cliente
        </Button>
      </div>

      {/* Summary bar */}
      <div className="flex gap-4 mb-4 text-sm text-gray-500">
        <span>{filtered.length} clientes</span>
        <span className="text-green-600 font-medium">{filtered.filter((c) => c.status === "active").length} activos</span>
        <span className="text-gray-400">{filtered.filter((c) => c.status === "inactive").length} inactivos</span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Card className="text-center py-12 text-gray-400">
          <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No hay clientes registrados</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <Card
              key={client.id}
              className="cursor-pointer hover:shadow-md transition-all duration-150 group"
              onClick={() => setDetailClient(client)}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-gray-900 text-sm truncate">{client.name}</p>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-500 flex-shrink-0 transition-colors" />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">NIT: {client.nit}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{client.city}, {client.department}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Users className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{client.contacts.length} contacto(s) · {client.sedes.length} sede(s)</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Badge
                  className={client.status === "active" ? "text-green-700 bg-green-100" : "text-gray-500 bg-gray-100"}
                  dot
                  dotColor={client.status === "active" ? "bg-green-500" : "bg-gray-400"}
                >
                  {client.status === "active" ? "Activo" : "Inactivo"}
                </Badge>
                <button
                  className="text-xs text-brand-600 hover:text-brand-800 font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditClient(client);
                    setModalOpen(true);
                  }}
                >
                  Editar
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      <ClientModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditClient(null); }}
        initial={editClient}
        onSave={handleSave}
      />

      {/* Detail modal */}
      {detailClient && (
        <ClientDetail
          client={detailClient}
          onClose={() => setDetailClient(null)}
          locale={params.locale}
        />
      )}
    </AppLayout>
  );
}
